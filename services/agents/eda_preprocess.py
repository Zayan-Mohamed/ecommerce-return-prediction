"""
EDA Preprocessing Agent
Purpose: Data validation, cleaning, and preprocessing for the return prediction model
Functions:
- Validate incoming order data structure and types
- Clean and standardize data formats
- Handle missing values and outliers
- Prepare data for feature engineering
"""

import pandas as pd
import numpy as np
import logging
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime
import json

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EDAPreprocessAgent:
    """
    EDA Preprocessing Agent for data validation and cleaning
    
    This agent is responsible for the first stage of data processing:
    - Validating data structure and types
    - Cleaning and standardizing formats
    - Handling missing values and outliers
    - Basic data transformations
    """
    
    def __init__(self):
        """Initialize the EDA Preprocessing Agent"""
        self.processed_count = 0
        self.validation_rules = self._load_validation_rules()
        logger.info("EDA Preprocessing Agent initialized")
    
    def _load_validation_rules(self) -> Dict[str, Any]:
        """
        Load validation rules for data preprocessing
        
        Returns:
            Dictionary containing validation rules
        """
        return {
            'required_columns': [
                'Product_Category', 'Product_Price', 'Order_Quantity',
                'User_Age', 'User_Gender', 'Payment_Method', 'User_Location'
            ],
            'optional_columns': [
                'Discount_Applied', 'Shipping_Method', 'Order_Date'
            ],
            'data_types': {
                'Product_Price': 'float',
                'Order_Quantity': 'int',
                'User_Age': 'int',
                'Discount_Applied': 'float'
            },
            'value_ranges': {
                'Product_Price': {'min': 0.01, 'max': 10000.0},
                'Order_Quantity': {'min': 1, 'max': 100},
                'User_Age': {'min': 18, 'max': 100},
                'Discount_Applied': {'min': 0.0, 'max': 100.0}
            },
            'allowed_values': {
                'Product_Category': [
                    'Electronics', 'Clothing', 'Books', 'Home & Garden',
                    'Sports', 'Beauty', 'Toys', 'Automotive', 'Health', 'Home'
                ],
                'User_Gender': ['Male', 'Female', 'Other'],
                'Payment_Method': [
                    'Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer',
                    'Cash', 'Digital Wallet', 'Gift Card'
                ],
                'Shipping_Method': ['Standard', 'Express', 'Next-Day'],
                'User_Location': ['Urban', 'Suburban', 'Rural']
            }
        }
    
    def validate_data_structure(self, data: pd.DataFrame) -> Tuple[bool, List[str]]:
        """
        Validate the structure of input data
        
        Args:
            data: Input DataFrame to validate
            
        Returns:
            Tuple of (is_valid, list_of_errors)
        """
        errors = []
        
        try:
            # Check if data is empty
            if data.empty:
                errors.append("Input data is empty")
                return False, errors
            
            # Check required columns
            missing_columns = []
            for col in self.validation_rules['required_columns']:
                if col not in data.columns:
                    missing_columns.append(col)
            
            if missing_columns:
                errors.append(f"Missing required columns: {', '.join(missing_columns)}")
            
            # Check data types
            for col, expected_type in self.validation_rules['data_types'].items():
                if col in data.columns:
                    try:
                        if expected_type == 'float':
                            pd.to_numeric(data[col], errors='coerce')
                        elif expected_type == 'int':
                            pd.to_numeric(data[col], errors='coerce', downcast='integer')
                    except Exception as e:
                        errors.append(f"Column {col} has invalid data type: {str(e)}")
            
            # Check value ranges
            for col, ranges in self.validation_rules['value_ranges'].items():
                if col in data.columns:
                    numeric_data = pd.to_numeric(data[col], errors='coerce')
                    if numeric_data.notna().any():
                        min_val = numeric_data.min()
                        max_val = numeric_data.max()
                        
                        if min_val < ranges['min']:
                            errors.append(f"Column {col} has values below minimum ({ranges['min']})")
                        if max_val > ranges['max']:
                            errors.append(f"Column {col} has values above maximum ({ranges['max']})")
            
            # Check allowed values for categorical columns
            for col, allowed_vals in self.validation_rules['allowed_values'].items():
                if col in data.columns:
                    unique_vals = data[col].dropna().unique()
                    invalid_vals = [val for val in unique_vals if val not in allowed_vals]
                    if invalid_vals:
                        logger.warning(f"Column {col} has non-standard values: {invalid_vals}")
                        # Don't treat as error, just warning
            
            return len(errors) == 0, errors
            
        except Exception as e:
            errors.append(f"Validation error: {str(e)}")
            return False, errors
    
    def clean_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Clean and standardize the input data
        
        Args:
            data: Input DataFrame to clean
            
        Returns:
            Cleaned DataFrame
        """
        try:
            cleaned_data = data.copy()
            
            # Standardize column names (remove spaces, convert to standard format)
            column_mapping = {
                'product_category': 'Product_Category',
                'price': 'Product_Price',
                'quantity': 'Order_Quantity',
                'age': 'User_Age',
                'gender': 'User_Gender',
                'payment_method': 'Payment_Method',
                'location': 'User_Location',
                'discount_applied': 'Discount_Applied',
                'shipping_method': 'Shipping_Method',
                'order_date': 'Order_Date'
            }
            
            # Rename columns if they exist
            for old_name, new_name in column_mapping.items():
                if old_name in cleaned_data.columns:
                    cleaned_data = cleaned_data.rename(columns={old_name: new_name})
            
            # Clean numeric columns
            numeric_columns = ['Product_Price', 'Order_Quantity', 'User_Age', 'Discount_Applied']
            for col in numeric_columns:
                if col in cleaned_data.columns:
                    # Convert to numeric, invalid values become NaN
                    cleaned_data[col] = pd.to_numeric(cleaned_data[col], errors='coerce')
                    
                    # Handle specific column cleaning
                    if col == 'Product_Price':
                        # Remove negative prices
                        cleaned_data.loc[cleaned_data[col] <= 0, col] = np.nan
                    elif col == 'Order_Quantity':
                        # Ensure positive integer quantities
                        cleaned_data.loc[cleaned_data[col] <= 0, col] = np.nan
                        cleaned_data[col] = cleaned_data[col].astype('Int64')  # Nullable integer
                    elif col == 'User_Age':
                        # Reasonable age range
                        cleaned_data.loc[(cleaned_data[col] < 18) | (cleaned_data[col] > 100), col] = np.nan
                        cleaned_data[col] = cleaned_data[col].astype('Int64')
                    elif col == 'Discount_Applied':
                        # Discount percentage range
                        cleaned_data.loc[(cleaned_data[col] < 0) | (cleaned_data[col] > 100), col] = 0.0
            
            # Clean categorical columns
            categorical_columns = ['Product_Category', 'User_Gender', 'Payment_Method', 'Shipping_Method', 'User_Location']
            for col in categorical_columns:
                if col in cleaned_data.columns:
                    # Remove leading/trailing whitespace and convert to title case
                    cleaned_data[col] = cleaned_data[col].astype(str).str.strip().str.title()
                    
                    # Standardize common variations
                    if col == 'Product_Category':
                        category_mapping = {
                            'Electronic': 'Electronics',
                            'Cloth': 'Clothing',
                            'Clothes': 'Clothing',
                            'Book': 'Books',
                            'Sport': 'Sports',
                            'Home Garden': 'Home & Garden',
                            'Home&Garden': 'Home & Garden',
                            'Home And Garden': 'Home & Garden'
                        }
                        for old_val, new_val in category_mapping.items():
                            cleaned_data.loc[cleaned_data[col] == old_val, col] = new_val
                    
                    elif col == 'User_Gender':
                        gender_mapping = {
                            'M': 'Male',
                            'F': 'Female',
                            'O': 'Other',
                            'Man': 'Male',
                            'Woman': 'Female'
                        }
                        for old_val, new_val in gender_mapping.items():
                            cleaned_data.loc[cleaned_data[col] == old_val, col] = new_val
                    
                    elif col == 'Payment_Method':
                        payment_mapping = {
                            'Credit': 'Credit Card',
                            'Debit': 'Debit Card',
                            'Cc': 'Credit Card',
                            'Dc': 'Debit Card',
                            'Bank': 'Bank Transfer',
                            'Cash On Delivery': 'Cash',
                            'Cod': 'Cash'
                        }
                        for old_val, new_val in payment_mapping.items():
                            cleaned_data.loc[cleaned_data[col] == old_val, col] = new_val
            
            # Handle Order_Date if present
            if 'Order_Date' in cleaned_data.columns:
                try:
                    cleaned_data['Order_Date'] = pd.to_datetime(cleaned_data['Order_Date'], errors='coerce')
                except Exception as e:
                    logger.warning(f"Could not parse Order_Date: {str(e)}")
            
            logger.info(f"Data cleaning completed. Processed {len(cleaned_data)} records")
            return cleaned_data
            
        except Exception as e:
            logger.error(f"Error cleaning data: {str(e)}")
            raise
    
    def handle_missing_values(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Handle missing values in the dataset
        
        Args:
            data: DataFrame with potential missing values
            
        Returns:
            DataFrame with missing values handled
        """
        try:
            processed_data = data.copy()
            
            # Handle missing values based on column type and business logic
            
            # Numeric columns - use median for core features, 0 for optional
            if 'Product_Price' in processed_data.columns:
                median_price = processed_data['Product_Price'].median()
                processed_data['Product_Price'].fillna(median_price, inplace=True)
            
            if 'Order_Quantity' in processed_data.columns:
                processed_data['Order_Quantity'].fillna(1, inplace=True)  # Default to 1 item
            
            if 'User_Age' in processed_data.columns:
                median_age = processed_data['User_Age'].median()
                processed_data['User_Age'].fillna(median_age, inplace=True)
            
            if 'Discount_Applied' in processed_data.columns:
                processed_data['Discount_Applied'].fillna(0.0, inplace=True)  # No discount by default
            
            # Categorical columns - use mode or default values
            if 'Product_Category' in processed_data.columns:
                mode_category = processed_data['Product_Category'].mode()
                if len(mode_category) > 0:
                    processed_data['Product_Category'].fillna(mode_category[0], inplace=True)
                else:
                    processed_data['Product_Category'].fillna('Electronics', inplace=True)
            
            if 'User_Gender' in processed_data.columns:
                processed_data['User_Gender'].fillna('Other', inplace=True)
            
            if 'Payment_Method' in processed_data.columns:
                processed_data['Payment_Method'].fillna('Credit Card', inplace=True)
            
            if 'Shipping_Method' in processed_data.columns:
                processed_data['Shipping_Method'].fillna('Standard', inplace=True)
            
            if 'User_Location' in processed_data.columns:
                processed_data['User_Location'].fillna('Urban', inplace=True)
            
            # Add current date if Order_Date is missing
            if 'Order_Date' in processed_data.columns:
                processed_data['Order_Date'].fillna(datetime.now(), inplace=True)
            
            logger.info("Missing values handled successfully")
            return processed_data
            
        except Exception as e:
            logger.error(f"Error handling missing values: {str(e)}")
            raise
    
    def detect_outliers(self, data: pd.DataFrame) -> Dict[str, Any]:
        """
        Detect outliers in numeric columns
        
        Args:
            data: DataFrame to analyze for outliers
            
        Returns:
            Dictionary containing outlier analysis
        """
        try:
            outlier_report = {}
            numeric_columns = ['Product_Price', 'Order_Quantity', 'User_Age', 'Discount_Applied']
            
            for col in numeric_columns:
                if col in data.columns:
                    col_data = data[col].dropna()
                    
                    if len(col_data) > 0:
                        # Calculate IQR method outliers
                        Q1 = col_data.quantile(0.25)
                        Q3 = col_data.quantile(0.75)
                        IQR = Q3 - Q1
                        lower_bound = Q1 - 1.5 * IQR
                        upper_bound = Q3 + 1.5 * IQR
                        
                        outliers = col_data[(col_data < lower_bound) | (col_data > upper_bound)]
                        
                        outlier_report[col] = {
                            'outlier_count': len(outliers),
                            'outlier_percentage': (len(outliers) / len(col_data)) * 100,
                            'lower_bound': lower_bound,
                            'upper_bound': upper_bound,
                            'outlier_values': outliers.tolist()[:10]  # Show first 10 outliers
                        }
            
            return outlier_report
            
        except Exception as e:
            logger.error(f"Error detecting outliers: {str(e)}")
            return {}
    
    def preprocess(self, data: pd.DataFrame) -> Dict[str, Any]:
        """
        Complete preprocessing pipeline
        
        Args:
            data: Raw input DataFrame
            
        Returns:
            Dictionary containing preprocessed data and metadata
        """
        try:
            # Step 1: Validate data structure
            is_valid, validation_errors = self.validate_data_structure(data)
            
            if not is_valid:
                return {
                    'success': False,
                    'error': f"Data validation failed: {'; '.join(validation_errors)}",
                    'validation_errors': validation_errors
                }
            
            # Step 2: Clean data
            cleaned_data = self.clean_data(data)
            
            # Step 3: Handle missing values
            processed_data = self.handle_missing_values(cleaned_data)
            
            # Step 4: Detect outliers (for reporting, not removal)
            outlier_report = self.detect_outliers(processed_data)
            
            # Update processed count
            self.processed_count += len(processed_data)
            
            # Generate preprocessing report
            preprocessing_report = {
                'original_shape': data.shape,
                'processed_shape': processed_data.shape,
                'missing_values_handled': True,
                'outliers_detected': outlier_report,
                'data_quality_score': self._calculate_quality_score(processed_data),
                'processing_timestamp': datetime.now().isoformat()
            }
            
            return {
                'success': True,
                'processed_data': processed_data,
                'preprocessing_report': preprocessing_report,
                'validation_passed': True
            }
            
        except Exception as e:
            logger.error(f"Error in preprocessing pipeline: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _calculate_quality_score(self, data: pd.DataFrame) -> float:
        """
        Calculate a data quality score (0-100)
        
        Args:
            data: Preprocessed DataFrame
            
        Returns:
            Quality score as percentage
        """
        try:
            if data.empty:
                return 0.0
            
            score = 100.0
            
            # Deduct points for missing values
            missing_percentage = (data.isnull().sum().sum() / (data.shape[0] * data.shape[1])) * 100
            score -= missing_percentage * 2  # 2 points per % of missing data
            
            # Deduct points for invalid categorical values
            for col, allowed_vals in self.validation_rules['allowed_values'].items():
                if col in data.columns:
                    invalid_count = sum(~data[col].isin(allowed_vals))
                    invalid_percentage = (invalid_count / len(data)) * 100
                    score -= invalid_percentage * 0.5  # 0.5 points per % of invalid categorical data
            
            # Ensure score is between 0 and 100
            return max(0.0, min(100.0, score))
            
        except Exception as e:
            logger.error(f"Error calculating quality score: {str(e)}")
            return 50.0  # Default moderate score
    
    def get_preprocessing_stats(self) -> Dict[str, Any]:
        """
        Get preprocessing statistics
        
        Returns:
            Dictionary with agent statistics
        """
        return {
            'agent_name': 'EDAPreprocessAgent',
            'total_processed': self.processed_count,
            'validation_rules': self.validation_rules,
            'status': 'active',
            'last_updated': datetime.now().isoformat()
        }


# Global instance for easy access
_preprocess_agent = None

def get_preprocess_agent() -> EDAPreprocessAgent:
    """
    Get or create the global EDAPreprocessAgent instance
    
    Returns:
        EDAPreprocessAgent instance
    """
    global _preprocess_agent
    if _preprocess_agent is None:
        _preprocess_agent = EDAPreprocessAgent()
    return _preprocess_agent


# Example usage and testing
if __name__ == "__main__":
    # Initialize agent
    agent = EDAPreprocessAgent()
    
    # Test with sample data
    sample_data = pd.DataFrame([
        {
            'price': 199.99,
            'quantity': 1,
            'product_category': 'Electronics',
            'age': 28,
            'gender': 'Female',
            'payment_method': 'Credit Card',
            'location': 'Urban',
            'discount_applied': 10.0,
            'shipping_method': 'Standard'
        },
        {
            'price': 49.99,
            'quantity': 2,
            'product_category': 'Clothing',
            'age': 35,
            'gender': 'Male',
            'payment_method': 'PayPal',
            'location': 'Suburban',
            'discount_applied': 0.0,
            'shipping_method': 'Express'
        }
    ])
    
    try:
        # Run preprocessing
        result = agent.preprocess(sample_data)
        
        if result['success']:
            print("Preprocessing successful!")
            print(f"Processed data shape: {result['processed_data'].shape}")
            print(f"Data quality score: {result['preprocessing_report']['data_quality_score']}")
            print(f"Outliers detected: {result['preprocessing_report']['outliers_detected']}")
        else:
            print(f"Preprocessing failed: {result['error']}")
        
        # Get agent stats
        stats = agent.get_preprocessing_stats()
        print(f"\nAgent stats: {json.dumps(stats, indent=2)}")
        
    except Exception as e:
        print(f"Error: {e}")