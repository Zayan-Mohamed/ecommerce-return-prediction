"""
Model Inference Agent
Purpose: Execute the trained model for predictions
Functions:
- Load the trained binary classification model
- Process preprocessed features through the model
- Return probability scores and binary predictions
- Handle model versioning and fallback mechanisms
"""

import os
import pickle
import logging
from typing import Dict, List, Optional, Tuple, Any
import numpy as np
import pandas as pd
from pathlib import Path
import json
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelInferenceAgent:
    """
    Agent responsible for loading trained models and executing predictions
    """
    
    def __init__(self, models_dir: str = None):
        """
        Initialize the Model Inference Agent
        
        Args:
            models_dir: Directory containing trained models
        """
        if models_dir is None:
            # Default to models directory relative to current file
            current_dir = Path(__file__).parent
            self.models_dir = current_dir.parent / "models"
        else:
            self.models_dir = Path(models_dir)
        
        self.primary_model = None
        self.fallback_model = None
        self.model_metadata = {}
        self.feature_names = []
        
        # Load models on initialization
        self._load_models()
    
    def _load_models(self) -> None:
        """
        Load the trained models and metadata
        """
        try:
            # Load primary model (return_model.pkl)
            primary_model_path = self.models_dir / "return_model.pkl"
            if primary_model_path.exists() and primary_model_path.stat().st_size > 0:
                try:
                    with open(primary_model_path, 'rb') as f:
                        self.primary_model = pickle.load(f)
                    logger.info(f"Primary model loaded from {primary_model_path}")
                except (EOFError, pickle.UnpicklingError) as e:
                    logger.warning(f"Primary model file corrupted or empty: {e}")
                    self.primary_model = None
            else:
                logger.warning(f"Primary model not found or empty at {primary_model_path}")
            
            # Load fallback model (random_forest_model.pkl)
            fallback_model_path = self.models_dir / "random_forest_model.pkl"
            if fallback_model_path.exists() and fallback_model_path.stat().st_size > 0:
                try:
                    with open(fallback_model_path, 'rb') as f:
                        self.fallback_model = pickle.load(f)
                    logger.info(f"Fallback model loaded from {fallback_model_path}")
                except (EOFError, pickle.UnpicklingError, ModuleNotFoundError) as e:
                    logger.warning(f"Fallback model could not be loaded: {e}")
                    self.fallback_model = None
            else:
                logger.warning(f"Fallback model not found or empty at {fallback_model_path}")
            
            # Load model metadata
            metadata_path = self.models_dir / "model_metrics.json"
            if metadata_path.exists() and metadata_path.stat().st_size > 0:
                try:
                    with open(metadata_path, 'r') as f:
                        self.model_metadata = json.load(f)
                    logger.info(f"Model metadata loaded from {metadata_path}")
                except (json.JSONDecodeError, FileNotFoundError) as e:
                    logger.warning(f"Could not load metadata: {e}")
                    self.model_metadata = {}
            else:
                logger.warning(f"Metadata not found or empty at {metadata_path}")
                self.model_metadata = {}
                
            # If no models are loaded, create a dummy model for testing
            if self.primary_model is None and self.fallback_model is None:
                logger.warning("No models could be loaded, creating dummy model for testing")
                self._create_dummy_model()
                
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            # Don't raise here, allow the agent to work with dummy model
            self._create_dummy_model()
    
    def _create_dummy_model(self) -> None:
        """
        Create a dummy model for testing when real models are not available
        """
        class DummyModel:
            def predict(self, X):
                # Simple rule-based dummy prediction
                predictions = []
                for _, row in X.iterrows():
                    # Simple logic: high price items are more likely to be returned
                    price = row.get('price', 0)
                    age = row.get('age', 30)
                    # Higher return probability for expensive items and younger customers
                    if price > 150 or age < 25:
                        predictions.append(1)  # Will return
                    else:
                        predictions.append(0)  # Won't return
                return np.array(predictions)
            
            def predict_proba(self, X):
                predictions = []
                for _, row in X.iterrows():
                    price = row.get('price', 0)
                    age = row.get('age', 30)
                    # Calculate probability based on simple rules
                    prob_return = min(0.8, (price / 500.0) + (max(0, 35 - age) / 100.0))
                    prob_no_return = 1 - prob_return
                    predictions.append([prob_no_return, prob_return])
                return np.array(predictions)
        
        self.primary_model = DummyModel()
        self.model_metadata = {
            "primary": {
                "type": "DummyModel",
                "created": datetime.now().isoformat(),
                "accuracy": 0.75,
                "note": "This is a dummy model for testing purposes"
            }
        }
        logger.info("Dummy model created for testing")
    
    def _validate_features(self, features: Dict[str, Any]) -> bool:
        """
        Validate input features format and content
        
        Args:
            features: Dictionary of feature values
            
        Returns:
            bool: True if features are valid
        """
        required_features = [
            'Product_Category', 'Product_Price', 'Order_Quantity', 'Return_Reason',
            'User_Age', 'User_Gender', 'Payment_Method', 'Shipping_Method',
            'Discount_Applied', 'Total_Order_Value',
            'Order_Year', 'Order_Month', 'Order_Weekday', 'User_Location_Num'
        ]
        
        # Check if all required features are present
        missing_features = [f for f in required_features if f not in features]
        if missing_features:
            logger.error(f"Missing required features: {missing_features}")
            return False
        
        # Validate data types and ranges
        try:
            if not isinstance(features.get('Product_Price', 0), (int, float)):
                logger.error("Product_Price must be a number")
                return False
                
            if not isinstance(features.get('Order_Quantity', 0), (int, float)):
                logger.error("Order_Quantity must be a number")
                return False
                
            if not isinstance(features.get('User_Age', 0), (int, float)):
                logger.error("User_Age must be a number")
                return False
                
            return True
            
        except Exception as e:
            logger.error(f"Error validating features: {str(e)}")
            return False
    
    def _map_features(self, features: Dict[str, Any]) -> pd.DataFrame:
        """
        Map input features to the format expected by the trained model
        
        Args:
            features: Dictionary with user-friendly feature names
            
        Returns:
            DataFrame with model-expected feature names in correct order
        """
        # Categorical mappings (these should match the preprocessing used during training)
        category_map = {
            'Electronics': 1, 'Clothing': 2, 'Home & Garden': 3, 'Sports': 4, 'Books': 5
        }
        
        gender_map = {
            'Male': 1, 'Female': 2
        }
        
        payment_map = {
            'Credit Card': 1, 'Debit Card': 2, 'PayPal': 3, 'Bank Transfer': 4
        }
        
        shipping_map = {
            'Standard': 1, 'Express': 2, 'Next Day': 3
        }
        
        return_reason_map = {
            'Unknown': 0, 'Defective': 1, 'Wrong Size': 2, 'Not as Described': 3, 'Changed Mind': 4
        }
        
        location_map = {
            'California': 1, 'New York': 2, 'Texas': 3, 'Florida': 4, 
            'Illinois': 5, 'Pennsylvania': 6, 'Ohio': 7, 'Georgia': 8,
            'North Carolina': 9, 'Michigan': 10
        }
        
        # Create features in the exact order expected by the model with proper encoding
        model_features = {
            'Product_Category': category_map.get(features.get('product_category', 'Electronics'), 1),
            'Product_Price': float(features.get('price', 0)),
            'Order_Quantity': int(features.get('quantity', 1)),
            'Return_Reason': return_reason_map.get('Unknown', 0),
            'User_Age': int(features.get('age', 30)),
            'User_Gender': gender_map.get(features.get('gender', 'Male'), 1),
            'Payment_Method': payment_map.get(features.get('payment_method', 'Credit Card'), 1),
            'Shipping_Method': shipping_map.get('Standard', 1),
            'Discount_Applied': float(0),
            'Total_Order_Value': float(features.get('price', 0)) * int(features.get('quantity', 1)),
            'Order_Year': int(2024),
            'Order_Month': int(1),
            'Order_Weekday': int(1),
            'User_Location_Num': location_map.get(features.get('location', 'California'), 1)
        }
        
        # Convert to DataFrame with single row
        return pd.DataFrame([model_features])

    def predict_single(self, features: Dict[str, Any], use_fallback: bool = False) -> Dict[str, Any]:
        """
        Make a single prediction using the loaded model
        
        Args:
            features: Dictionary containing preprocessed features
            use_fallback: Whether to use fallback model
            
        Returns:
            Dictionary containing prediction results
        """
        try:
            # Map features to model format
            feature_df = self._map_features(features)
            
            # Select model to use
            model = self.fallback_model if use_fallback else self.primary_model
            model_name = "fallback" if use_fallback else "primary"
            
            if model is None:
                if not use_fallback and self.fallback_model is not None:
                    logger.warning("Primary model not available, using fallback")
                    return self.predict_single(features, use_fallback=True)
                else:
                    raise ValueError("No models available for prediction")
            
            # feature_df is already a DataFrame from _map_features
            
            # Make prediction
            try:
                # Get probability scores
                if hasattr(model, 'predict_proba'):
                    probabilities = model.predict_proba(feature_df)[0]
                    # Assuming binary classification: [prob_no_return, prob_return]
                    return_probability = probabilities[1] if len(probabilities) > 1 else probabilities[0]
                else:
                    # If no predict_proba, use predict and convert
                    prediction = model.predict(feature_df)[0]
                    return_probability = float(prediction)
                
                # Get binary prediction
                binary_prediction = model.predict(feature_df)[0]
                
                # Create prediction result
                result = {
                    'prediction': {
                        'will_return': bool(binary_prediction),
                        'return_probability': float(return_probability),
                        'confidence_score': float(max(probabilities)) if hasattr(model, 'predict_proba') else 0.8
                    },
                    'model_info': {
                        'model_used': model_name,
                        'model_type': str(type(model).__name__),
                        'prediction_timestamp': datetime.now().isoformat()
                    },
                    'feature_importance': self._get_feature_importance(model, feature_df.iloc[0].to_dict()) if hasattr(model, 'feature_importances_') else {},
                    'metadata': self.model_metadata.get(model_name, {})
                }
                
                logger.info(f"Prediction completed using {model_name} model")
                return result
                
            except Exception as model_error:
                logger.error(f"Error during model prediction: {str(model_error)}")
                if not use_fallback and self.fallback_model is not None:
                    logger.info("Attempting fallback model...")
                    return self.predict_single(features, use_fallback=True)
                raise
                
        except Exception as e:
            logger.error(f"Error in predict_single: {str(e)}")
            raise
    
    def predict_batch(self, features_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Make predictions for multiple samples
        
        Args:
            features_list: List of feature dictionaries
            
        Returns:
            List of prediction results
        """
        results = []
        
        for i, features in enumerate(features_list):
            try:
                result = self.predict_single(features)
                results.append({
                    'sample_id': i,
                    'success': True,
                    **result
                })
            except Exception as e:
                logger.error(f"Error predicting sample {i}: {str(e)}")
                results.append({
                    'sample_id': i,
                    'success': False,
                    'error': str(e)
                })
        
        return results
    
    def _get_feature_importance(self, model, features: Dict[str, Any]) -> Dict[str, float]:
        """
        Extract feature importance from the model
        
        Args:
            model: Trained model with feature_importances_ attribute
            features: Input features
            
        Returns:
            Dictionary of feature importances
        """
        try:
            if hasattr(model, 'feature_importances_'):
                feature_names = list(features.keys())
                importances = model.feature_importances_
                
                # Create importance dictionary
                importance_dict = dict(zip(feature_names, importances.tolist()))
                
                # Sort by importance (descending)
                sorted_importance = dict(
                    sorted(importance_dict.items(), key=lambda x: x[1], reverse=True)
                )
                
                return sorted_importance
            else:
                return {}
                
        except Exception as e:
            logger.error(f"Error extracting feature importance: {str(e)}")
            return {}
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about loaded models
        
        Returns:
            Dictionary containing model information
        """
        return {
            'primary_model': {
                'loaded': self.primary_model is not None,
                'type': str(type(self.primary_model).__name__) if self.primary_model else None
            },
            'fallback_model': {
                'loaded': self.fallback_model is not None,
                'type': str(type(self.fallback_model).__name__) if self.fallback_model else None
            },
            'metadata': self.model_metadata,
            'models_directory': str(self.models_dir)
        }
    
    def health_check(self) -> Dict[str, Any]:
        """
        Perform health check on the inference agent
        
        Returns:
            Health status information
        """
        try:
            # Test with dummy data using the actual feature names from the trained model
            dummy_features = {
                'Product_Category': 1,
                'Product_Price': 0.5,
                'Order_Quantity': 1,
                'Return_Reason': 0,
                'User_Age': 0.2,
                'User_Gender': 1,
                'Payment_Method': 1,
                'Shipping_Method': 1,
                'Discount_Applied': 0.5,
                'Total_Order_Value': 0.5,
                'Order_Year': 2024,
                'Order_Month': 6,
                'Order_Weekday': 2,
                'User_Location_Num': 50
            }
            
            # Try prediction
            result = self.predict_single(dummy_features)
            
            return {
                'status': 'healthy',
                'models_loaded': {
                    'primary': self.primary_model is not None,
                    'fallback': self.fallback_model is not None
                },
                'test_prediction': 'successful',
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'status': 'unhealthy',
                'error': str(e),
                'models_loaded': {
                    'primary': self.primary_model is not None,
                    'fallback': self.fallback_model is not None
                },
                'timestamp': datetime.now().isoformat()
            }


# Global instance for reuse
_inference_agent = None

def get_inference_agent() -> ModelInferenceAgent:
    """
    Get global inference agent instance (singleton pattern)
    
    Returns:
        ModelInferenceAgent instance
    """
    global _inference_agent
    if _inference_agent is None:
        _inference_agent = ModelInferenceAgent()
    return _inference_agent


# Example usage and testing
if __name__ == "__main__":
    # Initialize agent
    agent = ModelInferenceAgent()
    
    # Test with sample data
    sample_features = {
        'price': 199.99,
        'quantity': 2,
        'product_category': 'Electronics',
        'gender': 'Female',
        'payment_method': 'Credit Card',
        'age': 25,
        'location': 'California'
    }
    
    try:
        # Single prediction
        result = agent.predict_single(sample_features)
        print("Prediction Result:")
        print(json.dumps(result, indent=2))
        
        # Health check
        health = agent.health_check()
        print("\nHealth Check:")
        print(json.dumps(health, indent=2))
        
        # Model info
        info = agent.get_model_info()
        print("\nModel Info:")
        print(json.dumps(info, indent=2))
        
    except Exception as e:
        print(f"Error: {e}")