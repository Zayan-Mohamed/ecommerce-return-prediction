"""
Prediction API Endpoints
Purpose: Handle HTTP requests for return predictions
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field, field_validator
from typing import Dict, List, Optional, Any
import logging
from datetime import datetime

# Import the model inference agent
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from agents.model_inference import get_inference_agent, ModelInferenceAgent

# Set up logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/predict", tags=["prediction"])

# Pydantic models for request/response validation
class PredictionRequest(BaseModel):
    """Request model for single prediction"""
    price: float = Field(..., gt=0, description="Product price in USD")
    quantity: int = Field(..., gt=0, description="Order quantity")
    product_category: str = Field(..., description="Product category")
    gender: str = Field(..., description="Customer gender")
    payment_method: str = Field(..., description="Payment method used")
    age: int = Field(..., ge=0, le=120, description="Customer age")
    location: str = Field(..., description="Customer location")

    @field_validator('product_category')
    def validate_category(cls, v):
        allowed_categories = [
            'Electronics', 'Clothing', 'Books', 'Home & Garden', 
            'Sports', 'Beauty', 'Toys', 'Automotive', 'Health'
        ]
        if v not in allowed_categories:
            logger.warning(f"Unknown category: {v}, proceeding with prediction")
        return v
    
    @field_validator('gender')
    def validate_gender(cls, v):
        allowed_genders = ['Male', 'Female', 'Other']
        if v not in allowed_genders:
            raise ValueError(f"Gender must be one of: {allowed_genders}")
        return v
    
    @field_validator('payment_method')
    def validate_payment_method(cls, v):
        allowed_methods = [
            'Credit Card', 'Debit Card', 'PayPal', 
            'Bank Transfer', 'Cash', 'Digital Wallet'
        ]
        if v not in allowed_methods:
            logger.warning(f"Unknown payment method: {v}, proceeding with prediction")
        return v

class BatchPredictionRequest(BaseModel):
    """Request model for batch predictions"""
    predictions: List[PredictionRequest] = Field(..., max_items=100, description="List of predictions (max 100)")

class PredictionResponse(BaseModel):
    """Response model for prediction results"""
    success: bool
    prediction: Optional[Dict[str, Any]] = None
    model_info: Optional[Dict[str, Any]] = None
    feature_importance: Optional[Dict[str, float]] = None
    metadata: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

class BatchPredictionResponse(BaseModel):
    """Response model for batch predictions"""
    success: bool
    results: List[PredictionResponse]
    summary: Dict[str, Any]
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

class HealthCheckResponse(BaseModel):
    """Response model for health check"""
    status: str
    models_loaded: Dict[str, bool]
    test_prediction: Optional[str] = None
    error: Optional[str] = None
    timestamp: str

# Dependency to get inference agent
def get_agent() -> ModelInferenceAgent:
    """Dependency to provide inference agent"""
    return get_inference_agent()

@router.post("/single", response_model=PredictionResponse)
async def predict_single(
    request: PredictionRequest,
    agent: ModelInferenceAgent = Depends(get_agent)
) -> PredictionResponse:
    """
    Make a single return prediction
    
    Args:
        request: Prediction request with feature data
        agent: Model inference agent
        
    Returns:
        Prediction response with results
    """
    try:
        logger.info(f"Received prediction request for {request.product_category}")
        
        # Convert request to feature dictionary
        features = request.dict()
        
        # Make prediction using the agent
        result = agent.predict_single(features)
        
        # Return successful response
        return PredictionResponse(
            success=True,
            prediction=result.get('prediction'),
            model_info=result.get('model_info'),
            feature_importance=result.get('feature_importance'),
            metadata=result.get('metadata')
        )
        
    except ValueError as ve:
        logger.error(f"Validation error: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return PredictionResponse(
            success=False,
            error=str(e)
        )

@router.post("/batch", response_model=BatchPredictionResponse)
async def predict_batch(
    request: BatchPredictionRequest,
    agent: ModelInferenceAgent = Depends(get_agent)
) -> BatchPredictionResponse:
    """
    Make batch return predictions
    
    Args:
        request: Batch prediction request
        agent: Model inference agent
        
    Returns:
        Batch prediction response with results
    """
    try:
        logger.info(f"Received batch prediction request for {len(request.predictions)} items")
        
        # Convert requests to feature dictionaries
        features_list = [pred.dict() for pred in request.predictions]
        
        # Make batch predictions
        results = agent.predict_batch(features_list)
        
        # Convert results to response format
        prediction_responses = []
        successful_predictions = 0
        
        for result in results:
            if result.get('success', False):
                successful_predictions += 1
                prediction_responses.append(PredictionResponse(
                    success=True,
                    prediction=result.get('prediction'),
                    model_info=result.get('model_info'),
                    feature_importance=result.get('feature_importance'),
                    metadata=result.get('metadata')
                ))
            else:
                prediction_responses.append(PredictionResponse(
                    success=False,
                    error=result.get('error')
                ))
        
        # Create summary
        summary = {
            'total_requests': len(request.predictions),
            'successful_predictions': successful_predictions,
            'failed_predictions': len(request.predictions) - successful_predictions,
            'success_rate': successful_predictions / len(request.predictions) if request.predictions else 0
        }
        
        return BatchPredictionResponse(
            success=True,
            results=prediction_responses,
            summary=summary
        )
        
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health", response_model=HealthCheckResponse)
async def health_check(agent: ModelInferenceAgent = Depends(get_agent)) -> HealthCheckResponse:
    """
    Check the health of the prediction service
    
    Args:
        agent: Model inference agent
        
    Returns:
        Health check response
    """
    try:
        health_result = agent.health_check()
        
        return HealthCheckResponse(
            status=health_result.get('status', 'unknown'),
            models_loaded=health_result.get('models_loaded', {}),
            test_prediction=health_result.get('test_prediction'),
            error=health_result.get('error'),
            timestamp=health_result.get('timestamp')
        )
        
    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        return HealthCheckResponse(
            status="unhealthy",
            models_loaded={},
            error=str(e),
            timestamp=datetime.now().isoformat()
        )

@router.get("/model-info")
async def get_model_info(agent: ModelInferenceAgent = Depends(get_agent)) -> Dict[str, Any]:
    """
    Get information about loaded models
    
    Args:
        agent: Model inference agent
        
    Returns:
        Model information
    """
    try:
        return agent.get_model_info()
    except Exception as e:
        logger.error(f"Error getting model info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Example usage endpoints for testing
@router.get("/example")
async def get_example_request() -> Dict[str, Any]:
    """
    Get an example prediction request for testing
    
    Returns:
        Example request data
    """
    return {
        "example_single_request": {
            "price": 199.99,
            "quantity": 1,
            "product_category": "Electronics",
            "gender": "Female",
            "payment_method": "Credit Card",
            "age": 28,
            "location": "California"
        },
        "example_batch_request": {
            "predictions": [
                {
                    "price": 199.99,
                    "quantity": 1,
                    "product_category": "Electronics",
                    "gender": "Female",
                    "payment_method": "Credit Card",
                    "age": 28,
                    "location": "California"
                },
                {
                    "price": 49.99,
                    "quantity": 2,
                    "product_category": "Clothing",
                    "gender": "Male",
                    "payment_method": "PayPal",
                    "age": 35,
                    "location": "New York"
                }
            ]
        }
    }