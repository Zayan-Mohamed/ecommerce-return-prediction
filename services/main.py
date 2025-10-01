from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from api.prediction import router as prediction_router
from api.order_processing import router as order_processing_router

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="E-commerce Return Prediction API",
    description="AI-powered return prediction service for e-commerce orders",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(prediction_router)
app.include_router(order_processing_router)

@app.get("/")
def root():
    return {
        "message": "E-commerce Return Prediction API running",
        "version": "1.0.0",
        "endpoints": {
            "health": "/predict/health",
            "single_prediction": "/predict/single",
            "batch_prediction": "/predict/batch",
            "model_info": "/predict/model-info",
            "example": "/predict/example",
            "order_processing": "/orders/process",
            "batch_order_processing": "/orders/batch-process",
            "order_validation_rules": "/orders/validation-rules",
            "order_stats": "/orders/stats",
            "order_health": "/orders/health",
            "docs": "/docs"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "return-prediction-api"}
