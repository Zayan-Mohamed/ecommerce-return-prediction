"""
Supabase Database Service
Purpose: Handle database operations for storing and retrieving predictions
"""

import os
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging
logger = logging.getLogger(__name__)

class SupabaseService:
    """Service for interacting with Supabase database"""
    
    def __init__(self):
        """Initialize Supabase client"""
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_KEY')  # Use service key for backend
        
        if not supabase_url or not supabase_key:
            logger.warning("Supabase credentials not found. Database features will be disabled.")
            self.client: Optional[Client] = None
            self.enabled = False
        else:
            try:
                self.client: Client = create_client(supabase_url, supabase_key)
                self.enabled = True
                logger.info("Supabase client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {str(e)}")
                self.client = None
                self.enabled = False
    
    def is_enabled(self) -> bool:
        """Check if Supabase integration is enabled"""
        return self.enabled and self.client is not None
    
    def _get_system_user_id(self) -> str:
        """
        Get the system user ID for anonymous predictions
        Using a well-known UUID for system operations
        """
        # This is a special UUID that should be created in auth.users table
        # Or we can make user_id nullable in predictions table
        return "00000000-0000-0000-0000-000000000001"  # System user
    
    async def store_prediction(self, prediction_data: Dict[str, Any], user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Store a prediction in the database
        
        Args:
            prediction_data: Prediction data to store
            user_id: Optional user ID (if authenticated)
            
        Returns:
            Stored prediction data or None if failed
        """
        if not self.is_enabled():
            logger.debug("Supabase not enabled, skipping database storage")
            return None
        
        try:
            # Use None for anonymous predictions (user_id is now nullable)
            # The service role key bypasses RLS policies
            
            # Prepare data for insertion
            db_data = {
                'user_id': user_id,  # Can be None for anonymous predictions
                'order_id': prediction_data.get('order_id'),
                'category_name': prediction_data.get('category'),
                'price': float(prediction_data.get('price', 0)),
                'quantity': int(prediction_data.get('quantity', 1)),
                'customer_age': int(prediction_data.get('age', 0)),
                'customer_gender': prediction_data.get('gender'),
                'customer_location': prediction_data.get('location'),
                'payment_method_name': prediction_data.get('payment_method'),
                'shipping_method_name': prediction_data.get('shipping_method', 'Standard'),
                'discount_applied': float(prediction_data.get('discount_applied', 0)),
                'total_order_value': float(prediction_data.get('order_value', 0)),
                'predicted_return_probability': float(prediction_data.get('return_probability', 0)),
                'predicted_return_flag': prediction_data.get('will_return', False),
                'confidence_score': float(prediction_data.get('confidence', 0)),
                'risk_level': prediction_data.get('risk_level', 'UNKNOWN'),
                'recommendations': prediction_data.get('recommendations', []),
                'status': 'completed',
                'created_at': prediction_data.get('timestamp', datetime.now().isoformat())
            }
            
            # Insert into database
            result = self.client.table('predictions').insert(db_data).execute()
            
            if result.data:
                logger.info(f"Prediction stored successfully: {prediction_data.get('order_id')}")
                return result.data[0]
            else:
                logger.warning("No data returned from insert operation")
                return None
                
        except Exception as e:
            logger.error(f"Error storing prediction: {str(e)}")
            return None
    
    async def get_predictions(
        self, 
        user_id: Optional[str] = None, 
        limit: int = 100,
        risk_level: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieve predictions from database
        
        Args:
            user_id: Optional user ID to filter by
            limit: Maximum number of records to return
            risk_level: Optional risk level filter (LOW, MEDIUM, HIGH)
            start_date: Optional start date filter (ISO format)
            end_date: Optional end date filter (ISO format)
            
        Returns:
            List of predictions
        """
        if not self.is_enabled():
            logger.debug("Supabase not enabled, returning empty list")
            return []
        
        try:
            # Build query
            query = self.client.table('predictions').select('*')
            
            # Apply filters
            if user_id:
                query = query.eq('user_id', user_id)
            
            if risk_level:
                query = query.eq('risk_level', risk_level.upper())
            
            if start_date:
                query = query.gte('created_at', start_date)
            
            if end_date:
                query = query.lte('created_at', end_date)
            
            # Order by most recent and limit
            query = query.order('created_at', desc=True).limit(limit)
            
            # Execute query
            result = query.execute()
            
            if result.data:
                logger.info(f"Retrieved {len(result.data)} predictions from database")
                return result.data
            else:
                logger.info("No predictions found")
                return []
                
        except Exception as e:
            logger.error(f"Error retrieving predictions: {str(e)}")
            return []
    
    async def get_predictions_summary(
        self, 
        user_id: Optional[str] = None,
        days: int = 30
    ) -> Dict[str, Any]:
        """
        Get summary statistics for predictions
        
        Args:
            user_id: Optional user ID to filter by
            days: Number of days to look back
            
        Returns:
            Summary statistics
        """
        if not self.is_enabled():
            return {
                'total_predictions': 0,
                'high_risk_count': 0,
                'medium_risk_count': 0,
                'low_risk_count': 0,
                'average_probability': 0,
                'total_revenue_at_risk': 0
            }
        
        try:
            # Calculate start date
            from datetime import timedelta
            start_date = (datetime.now() - timedelta(days=days)).isoformat()
            
            # Get predictions
            predictions = await self.get_predictions(
                user_id=user_id,
                start_date=start_date,
                limit=10000
            )
            
            if not predictions:
                return {
                    'total_predictions': 0,
                    'high_risk_count': 0,
                    'medium_risk_count': 0,
                    'low_risk_count': 0,
                    'average_probability': 0,
                    'total_revenue_at_risk': 0
                }
            
            # Calculate summary
            total = len(predictions)
            high_risk = sum(1 for p in predictions if p.get('risk_level') == 'HIGH')
            medium_risk = sum(1 for p in predictions if p.get('risk_level') == 'MEDIUM')
            low_risk = sum(1 for p in predictions if p.get('risk_level') == 'LOW')
            
            avg_prob = sum(float(p.get('predicted_return_probability', 0)) for p in predictions) / total if total > 0 else 0
            
            total_revenue_at_risk = sum(
                float(p.get('total_order_value', 0)) * float(p.get('predicted_return_probability', 0))
                for p in predictions
            )
            
            return {
                'total_predictions': total,
                'high_risk_count': high_risk,
                'medium_risk_count': medium_risk,
                'low_risk_count': low_risk,
                'average_probability': round(avg_prob, 4),
                'total_revenue_at_risk': round(total_revenue_at_risk, 2)
            }
            
        except Exception as e:
            logger.error(f"Error getting predictions summary: {str(e)}")
            return {
                'total_predictions': 0,
                'high_risk_count': 0,
                'medium_risk_count': 0,
                'low_risk_count': 0,
                'average_probability': 0,
                'total_revenue_at_risk': 0
            }


# Global instance
_supabase_service: Optional[SupabaseService] = None

def get_supabase_service() -> SupabaseService:
    """Get or create the global Supabase service instance"""
    global _supabase_service
    if _supabase_service is None:
        _supabase_service = SupabaseService()
    return _supabase_service
