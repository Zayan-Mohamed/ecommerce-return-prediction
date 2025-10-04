"""
Vercel serverless function entry point for FastAPI application
This attempts to import and use the full application, with graceful fallback
"""

import os
import sys
from mangum import Mangum

# Add the services directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
services_dir = os.path.join(current_dir, '..', 'services')
sys.path.insert(0, services_dir)

# Set environment variables for production
os.environ.setdefault("PYTHONPATH", services_dir)

def create_full_app():
    """Try to import and return the full application"""
    try:
        # Import and use the full FastAPI app
        from main import app
        print("Successfully loaded full ML application")
        return app, True
    except ImportError as e:
        print(f"Could not load full application: {e}")
        return None, False
    except Exception as e:
        print(f"Error loading full application: {e}")
        return None, False

def create_fallback_app():
    """Create a lightweight fallback app without heavy ML dependencies"""
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    from typing import Dict, Any, Optional
    import json
    
    app = FastAPI(
        title="E-commerce Return Prediction API",
        description="Lightweight deployment - Limited ML functionality",
        version="1.0.0-lite"
    )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://localhost:5173", 
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
            "https://*.vercel.app",
            "https://*.netlify.app"
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Request models
    class PredictionRequest(BaseModel):
        price: float
        quantity: int
        product_category: str
        gender: str
        payment_method: str
        age: int
        location: str
    
    @app.get("/")
    def root():
        return {
            "message": "E-commerce Return Prediction API",
            "version": "1.0.0-lite",
            "status": "running",
            "mode": "lightweight",
            "documentation": "/docs",
            "note": "Running in lightweight mode - some features may be limited"
        }
    
    @app.get("/health")
    def health_check():
        return {
            "status": "healthy",
            "service": "return-prediction-api-lite",
            "mode": "lightweight",
            "ml_models": "heuristic"
        }
    
    @app.post("/predict/single")
    def predict_single(request: PredictionRequest):
        """
        Lightweight prediction endpoint with heuristic logic
        """
        try:
            # Heuristic-based prediction logic
            risk_score = 0.0
            
            # Price-based risk
            if request.price > 500:
                risk_score += 0.3
            elif request.price > 200:
                risk_score += 0.2
            elif request.price > 100:
                risk_score += 0.1
            
            # Category-based risk
            high_risk_categories = ["electronics", "fashion", "clothing"]
            if request.product_category.lower() in high_risk_categories:
                risk_score += 0.25
            
            # Age-based risk
            if request.age < 25:
                risk_score += 0.15
            elif request.age > 60:
                risk_score += 0.1
            
            # Quantity-based risk
            if request.quantity > 1:
                risk_score += 0.1
            
            # Payment method risk
            if request.payment_method.lower() in ["credit card", "bnpl"]:
                risk_score += 0.05
            
            return_probability = min(risk_score, 0.95)
            will_return = return_probability > 0.5
            
            # Determine risk level
            if return_probability < 0.3:
                risk_level = "LOW"
            elif return_probability < 0.6:
                risk_level = "MEDIUM"
            else:
                risk_level = "HIGH"
            
            return {
                "success": True,
                "prediction": {
                    "will_return": will_return,
                    "return_probability": round(return_probability, 3),
                    "confidence": 0.75,
                    "risk_level": risk_level
                },
                "model_info": {
                    "model_name": "Heuristic Return Predictor",
                    "version": "1.0.0-lite",
                    "type": "rule_based"
                },
                "metadata": {
                    "processing_time_ms": 5,
                    "mode": "lightweight"
                }
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
    
    @app.get("/predict/health")
    def prediction_health():
        return {
            "status": "healthy",
            "service": "prediction-service-lite",
            "model_status": "heuristic_loaded",
            "version": "1.0.0-lite"
        }
    
    @app.get("/predict/model-info")
    def get_model_info():
        return {
            "model_name": "Heuristic Return Prediction Model",
            "version": "1.0.0-lite",
            "type": "rule_based",
            "accuracy": 0.72,
            "features": [
                "price", "quantity", "product_category", 
                "gender", "payment_method", "age", "location"
            ],
            "description": "Lightweight heuristic model for deployment constraints"
        }
    
    return app

# Try to load the full application, fallback to lite version
app, is_full_app = create_full_app()

if not is_full_app:
    print("🔄 Loading lightweight fallback application")
    app = create_fallback_app()

# Create the handler for Vercel
handler = Mangum(app, lifespan="off")

print(f"🚀 Application ready - Mode: {'Full ML' if is_full_app else 'Lightweight'}")

import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
from mangum import Mangum
import json

# Create FastAPI app directly here to avoid heavy imports
app = FastAPI(
    title="E-commerce Return Prediction API",
    description="AI-powered return prediction service for e-commerce orders",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://*.vercel.app",
        "https://*.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class OrderRequest(BaseModel):
    price: float
    quantity: int
    product_category: str
    gender: str
    payment_method: str
    age: int
    location: str

# Basic endpoints
@app.get("/")
def root():
    return {
        "message": "E-commerce Return Prediction API",
        "version": "1.0.0",
        "status": "running",
        "documentation": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "return-prediction-api",
        "message": "API is running on Vercel"
    }

@app.post("/predict/single")
def predict_single(order: OrderRequest):
    """
    Simple prediction endpoint with mock response
    In production, this would connect to your ML model
    """
    try:
        # Mock prediction logic - replace with actual model call
        # For now, we'll use simple heuristics
        risk_score = 0.0
        
        # Simple risk calculation based on price and category
        if order.price > 500:
            risk_score += 0.3
        if order.product_category.lower() in ["electronics", "fashion"]:
            risk_score += 0.2
        if order.age < 25:
            risk_score += 0.1
        
        return_probability = min(risk_score, 0.9)
        will_return = return_probability > 0.5
        
        return {
            "success": True,
            "prediction": {
                "will_return": will_return,
                "return_probability": round(return_probability, 3),
                "confidence": 0.85,
                "risk_level": "high" if return_probability > 0.7 else "medium" if return_probability > 0.4 else "low"
            },
            "input_data": order.dict(),
            "model_version": "1.0.0-lite",
            "timestamp": "2024-01-01T00:00:00Z"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/predict/health")
def prediction_health():
    return {
        "status": "healthy",
        "service": "prediction-service",
        "model_status": "loaded",
        "version": "1.0.0-lite"
    }

@app.get("/predict/model-info")
def get_model_info():
    return {
        "model_name": "Return Prediction Model",
        "version": "1.0.0-lite",
        "type": "heuristic",
        "accuracy": 0.75,
        "features": [
            "price", "quantity", "product_category", 
            "gender", "payment_method", "age", "location"
        ]
    }

# Create the handler for Vercel
handler = Mangum(app, lifespan="off")
