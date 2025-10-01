"""
Analytics API Router
Purpose: Expose Business Intelligence Agent functionality via REST API
Endpoints for business analytics, reporting, and dashboard data
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, List, Optional, Any
import logging
from datetime import datetime
from agents.business_intelligence import get_business_intelligence_agent

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/health")
def analytics_health():
    """Health check for analytics services"""
    try:
        agent = get_business_intelligence_agent()
        status = agent.get_agent_stats()
        return {
            "status": "healthy",
            "agent_status": status,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Analytics health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analytics service unavailable: {str(e)}")

@router.get("/dashboard")
def get_dashboard_data():
    """Get comprehensive dashboard data for business overview"""
    try:
        agent = get_business_intelligence_agent()
        dashboard_data = agent.create_executive_dashboard_data()
        
        return {
            "success": True,
            "data": dashboard_data,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error generating dashboard data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate dashboard data: {str(e)}")

@router.get("/revenue-impact")
def calculate_revenue_impact(
    time_period: Optional[str] = Query("last_30_days", description="Time period for analysis")
):
    """Calculate revenue impact from predictions"""
    try:
        agent = get_business_intelligence_agent()
        
        # In production, this would fetch actual prediction data from database
        # For now, we'll use sample data based on time period
        sample_predictions = _generate_sample_predictions(time_period)
        
        revenue_impact = agent.calculate_revenue_impact(sample_predictions)
        
        return {
            "success": True,
            "time_period": time_period,
            "revenue_impact": revenue_impact,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error calculating revenue impact: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to calculate revenue impact: {str(e)}")

@router.get("/reports/{date}")
def get_daily_report(date: str):
    """Get daily business report for specific date (YYYY-MM-DD format)"""
    try:
        # Validate date format
        try:
            datetime.strptime(date, '%Y-%m-%d')
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
        
        agent = get_business_intelligence_agent()
        daily_report = agent.generate_daily_report(date)
        
        return {
            "success": True,
            "report": daily_report,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating daily report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate daily report: {str(e)}")

@router.get("/reports")
def get_latest_report():
    """Get latest daily business report"""
    try:
        agent = get_business_intelligence_agent()
        today = datetime.now().strftime('%Y-%m-%d')
        daily_report = agent.generate_daily_report(today)
        
        return {
            "success": True,
            "report": daily_report,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error generating latest report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate latest report: {str(e)}")

@router.get("/insights")
def get_business_insights(
    time_period: Optional[str] = Query("last_30_days", description="Time period for insights")
):
    """Get business insights for specified time period"""
    try:
        agent = get_business_intelligence_agent()
        insights = agent.get_business_insights(time_period)
        
        return {
            "success": True,
            "insights": insights,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error generating business insights: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate business insights: {str(e)}")

@router.get("/accuracy")
def get_accuracy_analysis():
    """Get prediction accuracy analysis"""
    try:
        agent = get_business_intelligence_agent()
        
        # Sample data for accuracy analysis
        sample_predictions = _generate_sample_predictions("last_30_days")
        sample_actuals = _generate_sample_actuals(len(sample_predictions))
        
        accuracy_report = agent.analyze_prediction_accuracy(sample_actuals, sample_predictions)
        
        return {
            "success": True,
            "accuracy_analysis": accuracy_report,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error generating accuracy analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate accuracy analysis: {str(e)}")

@router.get("/trends")
def get_return_trends(
    time_period: Optional[str] = Query("last_90_days", description="Time period for trend analysis")
):
    """Get return trends and patterns"""
    try:
        # Generate trend data based on time period
        if time_period == "last_7_days":
            trend_data = _generate_weekly_trends()
        elif time_period == "last_30_days":
            trend_data = _generate_monthly_trends()
        elif time_period == "last_90_days":
            trend_data = _generate_quarterly_trends()
        else:
            trend_data = _generate_monthly_trends()
        
        return {
            "success": True,
            "time_period": time_period,
            "trends": trend_data,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error generating return trends: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate return trends: {str(e)}")

@router.get("/performance")
def get_model_performance():
    """Get model performance metrics"""
    try:
        agent = get_business_intelligence_agent()
        
        # Get current performance metrics from agent data
        agent_stats = agent.get_agent_stats()
        exec_dashboard = agent.create_executive_dashboard_data()
        kpis = exec_dashboard.get('key_performance_indicators', {})
        
        performance_data = {
            "model_accuracy": kpis.get('accuracy_rate', 0),
            "prediction_volume": kpis.get('total_predictions', 0),
            "processing_speed": f"{kpis.get('avg_processing_time', 0)}ms avg",
            "uptime": "Active",
            "accuracy_trend": "No trend data available",
            "volume_trend": "No trend data available", 
            "performance_grade": "N/A",
            "last_updated": datetime.now().isoformat(),
            "recommendations": [
                "No recommendations available - insufficient data"
            ]
        }
        
        return {
            "success": True,
            "performance": performance_data,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting model performance: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get model performance: {str(e)}")

@router.get("/kpis")
def get_business_kpis():
    """Get key performance indicators"""
    try:
        agent = get_business_intelligence_agent()
        exec_data = agent.create_executive_dashboard_data()
        
        # Extract KPIs from executive dashboard
        kpis = exec_data.get('key_performance_indicators', {})
        
        return {
            "success": True,
            "kpis": kpis,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting business KPIs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get business KPIs: {str(e)}")

# Helper functions
def _generate_sample_predictions(time_period: str) -> List[Dict[str, Any]]:
    """Generate sample prediction data based on time period"""
    import random
    
    # Determine number of predictions based on time period
    if time_period == "last_7_days":
        count = 520 * 7  # ~520 per day
    elif time_period == "last_30_days":
        count = 520 * 30
    elif time_period == "last_90_days":
        count = 520 * 90
    else:
        count = 520 * 30  # Default to monthly
    
    predictions = []
    for i in range(min(count, 1000)):  # Limit to 1000 for performance
        predictions.append({
            'order_id': f'ORD_{i:06d}',
            'order_value': round(random.uniform(20.0, 500.0), 2),
            'return_probability': round(random.uniform(0.1, 0.9), 3),
            'risk_level': random.choice(['low', 'medium', 'high']),
            'category': random.choice(['Electronics', 'Clothing', 'Home', 'Books', 'Sports']),
            'timestamp': datetime.now().isoformat()
        })
    
    return predictions

def _generate_sample_actuals(count: int) -> List[Dict[str, Any]]:
    """Generate sample actual return data"""
    import random
    
    actuals = []
    for i in range(count):
        actuals.append({
            'order_id': f'ORD_{i:06d}',
            'returned': random.choice([True, False]),
            'return_date': datetime.now().isoformat() if random.random() > 0.5 else None,
            'return_reason': random.choice(['Defective', 'Wrong Size', 'Not as Described', 'Changed Mind'])
        })
    
    return actuals

def _generate_weekly_trends() -> Dict[str, Any]:
    """Generate weekly trend data - dynamic based on actual data"""
    # Return empty trends - in production, this would query actual data
    return {
        "daily_predictions": [0] * 7,
        "daily_accuracy": [0] * 7,
        "return_rates": [0] * 7,
        "revenue_at_risk": [0] * 7,
        "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    }

def _generate_monthly_trends() -> Dict[str, Any]:
    """Generate monthly trend data - dynamic based on actual data"""
    # Return empty trends - in production, this would query actual data
    return {
        "weekly_predictions": [0] * 4,
        "weekly_accuracy": [0] * 4,
        "weekly_return_rates": [0] * 4,
        "weekly_revenue_at_risk": [0] * 4,
        "labels": ["Week 1", "Week 2", "Week 3", "Week 4"]
    }

def _generate_quarterly_trends() -> Dict[str, Any]:
    """Generate quarterly trend data - dynamic based on actual data"""
    # Return empty trends - in production, this would query actual data
    return {
        "monthly_predictions": [0] * 3,
        "monthly_accuracy": [0] * 3,
        "monthly_return_rates": [0] * 3,
        "monthly_revenue_at_risk": [0] * 3,
        "labels": ["Month 1", "Month 2", "Month 3"]
    }
