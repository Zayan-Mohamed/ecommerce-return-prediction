"""
Feature Engineering Agent
Purpose: Create derived features from raw/preprocessed inputs
Functions:
- Transform preprocessed data into model-ready features
- Create domain-specific engineered features
- Apply encodings and scaling
- Integrate with Product Intelligence for enhanced features
"""

import pandas as pd
import numpy as np
import logging
from typing import Dict, Any, Optional
from datetime import datetime
import pickle
import sys
import os

# Add path for other agents
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FeatureEngineeringAgent:
    """
    Enhanced Feature Engineering Agent
    
    Creates sophisticated features for return prediction:
    - Basic derived features (order value, price ratios)
    - Temporal features (seasonality, day of week patterns)
    - Product intelligence integration
    - Customer behavior features
    - Risk scoring features
    """

    def __init__(self, scaler_path=None, encoder_path=None):
        """
        Initialize Feature Engineering Agent
        
        Args:
            scaler_path: Path to saved scaler (optional)
            encoder_path: Path to saved encoder (optional)
        """
        self.required_columns = [
            "Product_Price", "Order_Quantity", "User_Age",
            "Discount_Applied", "Order_Year", "Order_Month", "Order_Weekday"
        ]
        self.scaler = None
        self.encoder = None
        self.processed_count = 0
        
        # Load pre-trained transformers if available
        if scaler_path and os.path.exists(scaler_path):
            try:
                with open(scaler_path, 'rb') as f:
                    self.scaler = pickle.load(f)
                logger.info(f"Loaded scaler from {scaler_path}")
            except Exception as e:
                logger.warning(f"Could not load scaler: {e}")
        
        if encoder_path and os.path.exists(encoder_path):
            try:
                with open(encoder_path, 'rb') as f:
                    self.encoder = pickle.load(f)
                logger.info(f"Loaded encoder from {encoder_path}")
            except Exception as e:
                logger.warning(f"Could not load encoder: {e}")
        
        # Initialize feature mappings
        self._initialize_feature_mappings()
        logger.info("Feature Engineering Agent initialized")
    
    def _initialize_feature_mappings(self):
        """Initialize categorical feature mappings"""
        self.category_mapping = {
            'Electronics': 1, 'Clothing': 2, 'Books': 3, 'Home': 4, 'Toys': 5,
            'Sports': 6, 'Beauty': 7, 'Automotive': 8, 'Health': 9, 'Home & Garden': 4
        }
        
        self.gender_mapping = {'Male': 1, 'Female': 2, 'Other': 0}
        
        self.payment_mapping = {
            'Credit Card': 1, 'Debit Card': 2, 'PayPal': 3, 'Bank Transfer': 4,
            'Cash': 5, 'Digital Wallet': 6, 'Gift Card': 7
        }
        
        self.shipping_mapping = {'Standard': 1, 'Express': 2, 'Next-Day': 3}
        
        self.location_mapping = {'Urban': 1, 'Rural': 0, 'Suburban': 2}
    
    def create_advanced_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create advanced derived features (basic features handled by OrderProcessingAgent)
        
        Args:
            df: Input dataframe with basic features already extracted
            
        Returns:
            DataFrame with advanced engineered features
        """
        try:
            engineered_df = df.copy()
            
            # Ensure required numeric columns exist and are numeric
            required_columns = ["Product_Price", "Order_Quantity", "User_Age", "Discount_Applied", "Total_Order_Value"]
            for col in required_columns:
                if col in engineered_df.columns:
                    engineered_df[col] = pd.to_numeric(engineered_df[col], errors="coerce")
                else:
                    logger.warning(f"Required column {col} not found, creating default")
                    if col == "Total_Order_Value":
                        engineered_df[col] = engineered_df.get("Product_Price", 0) * engineered_df.get("Order_Quantity", 1)
                    else:
                        engineered_df[col] = 0
            
            # Advanced price-based features
            if 'Product_Price' in engineered_df.columns and 'Order_Quantity' in engineered_df.columns:
                # Price per item
                engineered_df["Price_Per_Item"] = engineered_df["Product_Price"] / (engineered_df["Order_Quantity"] + 0.01)
                
                # Value tier classification - handle single value case
                if engineered_df["Product_Price"].nunique() > 1:
                    price_percentiles = engineered_df["Product_Price"].quantile([0.25, 0.75])
                    # Ensure bins are unique
                    if price_percentiles[0.25] == price_percentiles[0.75]:
                        # All values are the same, assign to middle tier
                        engineered_df["Price_Tier"] = 2
                    else:
                        engineered_df["Price_Tier"] = pd.cut(
                            engineered_df["Product_Price"],
                            bins=[0, price_percentiles[0.25], price_percentiles[0.75], float('inf')],
                            labels=[1, 2, 3],  # Low, Medium, High
                            include_lowest=True,
                            duplicates='drop'
                        ).astype(int)
                else:
                    # Single value case
                    engineered_df["Price_Tier"] = 2
            
            # Advanced discount features
            if 'Discount_Applied' in engineered_df.columns:
                engineered_df["Discount_Applied"] = engineered_df["Discount_Applied"].fillna(0.0)
                
                # High discount flag
                engineered_df["High_Discount"] = (engineered_df["Discount_Applied"] > 20).astype(int)
                
                # Discount tier
                engineered_df["Discount_Tier"] = pd.cut(
                    engineered_df["Discount_Applied"],
                    bins=[0, 5, 15, 30, 100],
                    labels=[0, 1, 2, 3],  # None, Low, Medium, High
                    include_lowest=True
                ).astype(int)
            
            # Advanced age-based features (REQUIRED BY MODEL)
            if 'User_Age' in engineered_df.columns:
                # Young flag - REQUIRED by trained model
                engineered_df["Young"] = (engineered_df["User_Age"] < 30).astype(int)
                engineered_df["Senior"] = (engineered_df["User_Age"] > 60).astype(int)
                
                # Generation categories
                conditions = [
                    (engineered_df["User_Age"] >= 18) & (engineered_df["User_Age"] <= 27),  # Gen Z
                    (engineered_df["User_Age"] >= 28) & (engineered_df["User_Age"] <= 43),  # Millennial  
                    (engineered_df["User_Age"] >= 44) & (engineered_df["User_Age"] <= 59),  # Gen X
                    (engineered_df["User_Age"] >= 60)  # Boomer+
                ]
                choices = [1, 2, 3, 4]
                engineered_df["Generation"] = np.select(conditions, choices, default=2)
            
            # Value-based features (REQUIRED BY MODEL)
            if 'Total_Order_Value' in engineered_df.columns:
                # High_Value flag - REQUIRED by trained model (using fixed threshold instead of median)
                engineered_df["High_Value"] = (engineered_df["Total_Order_Value"] > 150).astype(int)
                
                # Value quartiles - handle single value case
                try:
                    if engineered_df["Total_Order_Value"].nunique() > 1:
                        engineered_df["Value_Quartile"] = pd.qcut(
                            engineered_df["Total_Order_Value"],
                            q=4,
                            labels=[1, 2, 3, 4],
                            duplicates='drop'
                        ).astype(int)
                    else:
                        # Single value case - assign to middle quartile
                        engineered_df["Value_Quartile"] = 2
                except (ValueError, TypeError):
                    # If qcut fails, use fixed bins or default
                    unique_values = engineered_df["Total_Order_Value"].nunique()
                    if unique_values > 1:
                        try:
                            engineered_df["Value_Quartile"] = pd.cut(
                                engineered_df["Total_Order_Value"],
                                bins=4,
                                labels=[1, 2, 3, 4],
                                include_lowest=True,
                                duplicates='drop'
                            ).astype(int)
                        except:
                            engineered_df["Value_Quartile"] = 2
                    else:
                        engineered_df["Value_Quartile"] = 2
            
            # Return Risk Score - REQUIRED by trained model
            # Simple risk scoring based on price and age
            if 'Product_Price' in engineered_df.columns and 'User_Age' in engineered_df.columns:
                conditions = [
                    (engineered_df["Product_Price"] > 200) | (engineered_df["User_Age"] < 25),  # High risk
                    (engineered_df["Product_Price"] > 100) | (engineered_df["User_Age"] < 35),  # Medium risk
                ]
                choices = [2, 1]  # 2=High, 1=Medium, 0=Low (default)
                engineered_df["Return_Risk_Score"] = np.select(conditions, choices, default=0)
            
            logger.info("Advanced feature engineering completed")
            return engineered_df
            
        except Exception as e:
            logger.error(f"Error in advanced feature engineering: {str(e)}")
            raise
    
    def create_temporal_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create temporal and seasonal features
        
        Args:
            df: DataFrame with temporal columns
            
        Returns:
            DataFrame with temporal features
        """
        try:
            temporal_df = df.copy()
            
            # Ensure temporal columns exist or create them
            if 'Order_Year' not in temporal_df.columns:
                current_date = datetime.now()
                temporal_df['Order_Year'] = current_date.year
                temporal_df['Order_Month'] = current_date.month
                temporal_df['Order_Weekday'] = current_date.weekday()
            
            # 1. Seasonal features
            if 'Order_Month' in temporal_df.columns:
                # Quarter
                temporal_df['Order_Quarter'] = ((temporal_df['Order_Month'] - 1) // 3) + 1
                
                # Season mapping
                season_mapping = {
                    12: 1, 1: 1, 2: 1,  # Winter
                    3: 2, 4: 2, 5: 2,   # Spring
                    6: 3, 7: 3, 8: 3,   # Summer
                    9: 4, 10: 4, 11: 4  # Fall
                }
                temporal_df['Season'] = temporal_df['Order_Month'].map(season_mapping)
                
                # Holiday season flag
                temporal_df['Holiday_Season'] = temporal_df['Order_Month'].isin([11, 12]).astype(int)
                
                # Back-to-school season
                temporal_df['Back_To_School_Season'] = temporal_df['Order_Month'].isin([8, 9]).astype(int)
                
                # Spring cleaning season
                temporal_df['Spring_Season'] = temporal_df['Order_Month'].isin([3, 4, 5]).astype(int)
            
            # 2. Day-of-week features
            if 'Order_Weekday' in temporal_df.columns:
                # Weekend flag
                temporal_df['Weekend_Order'] = temporal_df['Order_Weekday'].isin([5, 6]).astype(int)
                
                # Monday flag (post-weekend behavior)
                temporal_df['Monday_Order'] = (temporal_df['Order_Weekday'] == 0).astype(int)
                
                # Friday flag (pre-weekend behavior)
                temporal_df['Friday_Order'] = (temporal_df['Order_Weekday'] == 4).astype(int)
            
            # 3. Year-based features
            if 'Order_Year' in temporal_df.columns:
                current_year = datetime.now().year
                temporal_df['Recent_Year'] = (temporal_df['Order_Year'] >= current_year - 1).astype(int)
            
            logger.info("Temporal feature engineering completed")
            return temporal_df
            
        except Exception as e:
            logger.error(f"Error in temporal feature engineering: {str(e)}")
            raise
    
    def create_interaction_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create interaction and combined features
        
        Args:
            df: DataFrame with basic features
            
        Returns:
            DataFrame with interaction features
        """
        try:
            interaction_df = df.copy()
            
            # 1. Price-Age interactions
            if 'Product_Price' in interaction_df.columns and 'User_Age' in interaction_df.columns:
                # Young customers with expensive items (higher risk)
                interaction_df['Young_Expensive_Combo'] = (
                    (interaction_df['User_Age'] < 30) & (interaction_df['Product_Price'] > 200)
                ).astype(int)
                
                # Senior customers with tech items (potential complexity issues)
                if 'Product_Category' in interaction_df.columns:
                    interaction_df['Senior_Electronics_Combo'] = (
                        (interaction_df['User_Age'] > 60) & (interaction_df['Product_Category'] == 1)
                    ).astype(int)
            
            # 2. Discount-Price interactions
            if 'Discount_Applied' in interaction_df.columns and 'Product_Price' in interaction_df.columns:
                # High discount on expensive items (potential quality concerns)
                interaction_df['High_Discount_Expensive'] = (
                    (interaction_df['Discount_Applied'] > 25) & (interaction_df['Product_Price'] > 150)
                ).astype(int)
                
                # Discount ratio to price
                interaction_df['Discount_Price_Ratio'] = interaction_df['Discount_Applied'] / (interaction_df['Product_Price'] + 1)
            
            # 3. Quantity-Price interactions
            if 'Order_Quantity' in interaction_df.columns and 'Product_Price' in interaction_df.columns:
                # High quantity expensive items
                interaction_df['Bulk_Expensive_Combo'] = (
                    (interaction_df['Order_Quantity'] > 2) & (interaction_df['Product_Price'] > 100)
                ).astype(int)
                
                # Average price per item in bulk orders
                interaction_df['Avg_Price_Per_Item'] = interaction_df['Product_Price'] / interaction_df['Order_Quantity']
            
            # 4. Category-specific features
            if 'Product_Category' in interaction_df.columns:
                # Electronics with high price (complexity risk)
                if 'Product_Price' in interaction_df.columns:
                    interaction_df['Electronics_High_Price'] = (
                        (interaction_df['Product_Category'] == 1) & (interaction_df['Product_Price'] > 300)
                    ).astype(int)
                
                # Clothing category (size/fit risk)
                interaction_df['Clothing_Category_Flag'] = (interaction_df['Product_Category'] == 2).astype(int)
            
            # 5. Payment-Risk interactions
            if 'Payment_Method' in interaction_df.columns and 'Product_Price' in interaction_df.columns:
                # High-value orders with cash payment (unusual pattern)
                interaction_df['Cash_High_Value'] = (
                    (interaction_df['Payment_Method'] == 5) & (interaction_df['Product_Price'] > 200)
                ).astype(int)
            
            logger.info("Interaction feature engineering completed")
            return interaction_df
            
        except Exception as e:
            logger.error(f"Error in interaction feature engineering: {str(e)}")
            raise
    
    def encode_categorical_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Encode categorical features and ensure all model-required features exist
        
        Args:
            df: DataFrame with categorical features
            
        Returns:
            DataFrame with encoded categorical features and all required model features
        """
        try:
            encoded_df = df.copy()
            
            # Encode Product Category
            if 'Product_Category' in encoded_df.columns:
                if encoded_df['Product_Category'].dtype == 'object':
                    encoded_df['Product_Category'] = encoded_df['Product_Category'].map(self.category_mapping)
                    encoded_df['Product_Category'] = encoded_df['Product_Category'].fillna(1)  # Default to Electronics
            
            # Encode User Gender
            if 'User_Gender' in encoded_df.columns:
                if encoded_df['User_Gender'].dtype == 'object':
                    encoded_df['User_Gender'] = encoded_df['User_Gender'].map(self.gender_mapping)
                    encoded_df['User_Gender'] = encoded_df['User_Gender'].fillna(0)  # Default to Other
            
            # Encode Payment Method
            if 'Payment_Method' in encoded_df.columns:
                if encoded_df['Payment_Method'].dtype == 'object':
                    encoded_df['Payment_Method'] = encoded_df['Payment_Method'].map(self.payment_mapping)
                    encoded_df['Payment_Method'] = encoded_df['Payment_Method'].fillna(1)  # Default to Credit Card
            
            # Encode Shipping Method
            if 'Shipping_Method' in encoded_df.columns:
                if encoded_df['Shipping_Method'].dtype == 'object':
                    encoded_df['Shipping_Method'] = encoded_df['Shipping_Method'].map(self.shipping_mapping)
                    encoded_df['Shipping_Method'] = encoded_df['Shipping_Method'].fillna(1)  # Default to Standard
            
            # Encode User Location
            if 'User_Location' in encoded_df.columns:
                if self.encoder:
                    try:
                        encoded_df["User_Location_Num"] = self.encoder.transform(encoded_df[["User_Location"]])
                    except Exception as e:
                        logger.warning(f"Encoding User_Location failed: {e}")
                        encoded_df["User_Location_Num"] = encoded_df['User_Location'].map(self.location_mapping)
                        encoded_df["User_Location_Num"] = encoded_df["User_Location_Num"].fillna(1)
                else:
                    encoded_df["User_Location_Num"] = encoded_df['User_Location'].map(self.location_mapping)
                    encoded_df["User_Location_Num"] = encoded_df["User_Location_Num"].fillna(1)
            elif 'User_Location_Num' not in encoded_df.columns:
                # If neither exists, create default
                encoded_df['User_Location_Num'] = 1
            
            # ENSURE ALL MODEL-REQUIRED FEATURES EXIST
            # Based on model_metrics.json, these features are required:
            required_features = [
                'Product_Category', 'Product_Price', 'Order_Quantity', 'User_Age', 'User_Gender',
                'Payment_Method', 'Shipping_Method', 'Discount_Applied', 'Total_Order_Value',
                'Order_Year', 'Order_Month', 'Order_Weekday', 'User_Location_Num',
                'Return_Risk_Score', 'Price_Per_Item', 'High_Discount', 'Young', 'High_Value'
            ]
            
            for feature in required_features:
                if feature not in encoded_df.columns:
                    logger.warning(f"Missing required feature {feature}, adding default value")
                    if feature == 'Return_Risk_Score':
                        encoded_df[feature] = 0
                    elif feature == 'Price_Per_Item':
                        encoded_df[feature] = encoded_df.get('Product_Price', 100) / (encoded_df.get('Order_Quantity', 1) + 0.01)
                    elif feature in ['High_Discount', 'Young', 'High_Value']:
                        encoded_df[feature] = 0
                    elif feature in ['Order_Year', 'Order_Month', 'Order_Weekday']:
                        current_dt = datetime.now()
                        if feature == 'Order_Year':
                            encoded_df[feature] = current_dt.year
                        elif feature == 'Order_Month':
                            encoded_df[feature] = current_dt.month
                        else:  # Order_Weekday
                            encoded_df[feature] = current_dt.weekday()
                    else:
                        encoded_df[feature] = 0  # Default for any other missing features
            
            logger.info("Categorical encoding and feature validation completed")
            return encoded_df
            
        except Exception as e:
            logger.error(f"Error in categorical encoding: {str(e)}")
            raise
    
    def get_agent_stats(self) -> Dict[str, Any]:
        """
        Get agent statistics and status
        
        Returns:
            Dictionary with agent statistics
        """
        return {
            'agent_name': 'FeatureEngineeringAgent',
            'total_processed': self.processed_count,
            'feature_mappings': {
                'categories': len(self.category_mapping),
                'genders': len(self.gender_mapping),
                'payment_methods': len(self.payment_mapping),
                'shipping_methods': len(self.shipping_mapping),
                'locations': len(self.location_mapping)
            },
            'status': 'active',
            'last_updated': datetime.now().isoformat()
        }
    
    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Main transformation pipeline - creates advanced engineered features
        (Basic features should already be created by OrderProcessingAgent)
        
        Args:
            df: DataFrame with basic features already extracted
            
        Returns:
            DataFrame with advanced engineered features
        """
        try:
            logger.info("Starting advanced feature engineering...")
            
            # Validate input
            if df.empty:
                raise ValueError("Input DataFrame is empty")
            
            # Step 1: Create advanced derived features
            engineered_df = self.create_advanced_features(df)
            
            # Step 2: Add temporal features if not already present
            if 'Order_Year' not in engineered_df.columns:
                engineered_df = self.create_temporal_features(engineered_df)
            
            # Step 3: Create interaction features
            engineered_df = self.create_interaction_features(engineered_df)
            
            # Step 4: Encode categorical features if not already encoded
            engineered_df = self.encode_categorical_features(engineered_df)
            
            # Step 5: Filter to only the 18 features required by the trained model
            required_model_features = [
                'Product_Category', 'Product_Price', 'Order_Quantity', 'User_Age', 'User_Gender',
                'Payment_Method', 'Shipping_Method', 'Discount_Applied', 'Total_Order_Value',
                'Order_Year', 'Order_Month', 'Order_Weekday', 'User_Location_Num',
                'Return_Risk_Score', 'Price_Per_Item', 'High_Discount', 'Young', 'High_Value'
            ]
            
            # Select only the required features, keeping the order consistent
            final_df = engineered_df[required_model_features].copy()
            
            # Update processed count
            self.processed_count += len(final_df)
            
            logger.info(f"Advanced feature engineering completed. Original shape: {df.shape}, Final shape: {final_df.shape}")
            return final_df
            
        except Exception as e:
            logger.error(f"Error in feature engineering transform: {str(e)}")
            raise
    
    def to_inference(self, df: pd.DataFrame, inference_agent) -> dict:
        """
        Prepare engineered features for inference and pass to ModelInferenceAgent
        
        Args:
            df: DataFrame after feature engineering (output of self.transform)
            inference_agent: An instance of ModelInferenceAgent
            
        Returns:
            dict: Prediction result from the inference agent
        """
        try:
            # Get expected columns from the model
            model = getattr(inference_agent, 'primary_model', None) or getattr(inference_agent, 'fallback_model', None)
            
            if hasattr(model, 'feature_names_in_'):
                expected_columns = list(model.feature_names_in_)
                
                # Add missing columns with appropriate default values
                for col in expected_columns:
                    if col not in df.columns:
                        if 'Flag' in col or 'Season' in col:
                            df[col] = 0  # Binary/categorical features default to 0
                        elif 'Ratio' in col or 'Avg' in col:
                            df[col] = 1.0  # Ratio features default to 1
                        else:
                            df[col] = 0  # Numeric features default to 0
                
                # Reorder columns to match model expectations
                df = df[expected_columns]
                
                logger.info(f"Aligned features for inference. Shape: {df.shape}")
            else:
                logger.info("Model doesn't specify feature names, using current feature set")
            
            # Pass to inference agent
            return inference_agent.predict_single(df)
            
        except Exception as e:
            logger.error(f"Error in to_inference: {str(e)}")
            raise
    
    def get_feature_importance_weights(self, category: Optional[str] = None) -> Dict[str, float]:
        """
        Get feature importance weights for model interpretation
        
        Args:
            category: Product category for category-specific weights
            
        Returns:
            Dictionary of feature importance weights
        """
        # Base importance weights
        base_weights = {
            'Product_Price': 0.20,
            'Total_Order_Value': 0.15,
            'User_Age': 0.12,
            'Product_Category': 0.10,
            'Discount_Applied': 0.08,
            'Order_Quantity': 0.08,
            'Payment_Method': 0.06,
            'User_Gender': 0.05,
            'Shipping_Method': 0.04,
            'Season': 0.03,
            'Young_Customer_Flag': 0.03,
            'High_Value_Order': 0.03,
            'Weekend_Order': 0.03
        }
        
        # Category-specific adjustments
        if category:
            if category in ['Electronics', 'Automotive']:
                base_weights['Product_Price'] *= 1.2
                base_weights['User_Age'] *= 1.1
            elif category in ['Clothing', 'Beauty']:
                base_weights['User_Gender'] *= 1.5
                base_weights['User_Age'] *= 1.2
            elif category in ['Toys']:
                base_weights['Season'] *= 2.0
                base_weights['User_Age'] *= 0.8
        
        return base_weights
    
    def get_agent_stats(self) -> Dict[str, Any]:
        """
        Get agent statistics and status
        
        Returns:
            Dictionary with agent statistics
        """
        return {
            'agent_name': 'FeatureEngineeringAgent',
            'total_processed': self.processed_count,
            'scaler_loaded': self.scaler is not None,
            'encoder_loaded': self.encoder is not None,
            'feature_mappings': {
                'categories': len(self.category_mapping),
                'genders': len(self.gender_mapping),
                'payment_methods': len(self.payment_mapping),
                'shipping_methods': len(self.shipping_mapping),
                'locations': len(self.location_mapping)
            },
            'status': 'active',
            'last_updated': datetime.now().isoformat()
        }


# Global instance for easy access
_feature_engineering_agent = None

def get_feature_engineering_agent() -> FeatureEngineeringAgent:
    """
    Get or create the global FeatureEngineeringAgent instance
    
    Returns:
        FeatureEngineeringAgent instance
    """
    global _feature_engineering_agent
    if _feature_engineering_agent is None:
        _feature_engineering_agent = FeatureEngineeringAgent()
    return _feature_engineering_agent


