"""
FastAPI Web Service for Dynamic Pricing Model
Production-ready API for real-time price predictions.
"""

from fastapi import FastAPI, HTTPException, Depends, Request
from pydantic import BaseModel, Field
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
import os
from dotenv import load_dotenv
import logging
from typing import Optional
import uvicorn
from sqlalchemy.orm import Session
from database import get_db, log_prediction, create_tables, get_prediction_stats

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Dynamic Pricing API",
    description="Real-time pricing predictions based on traffic and weather conditions",
    version="1.0.0"
)

# Global variables for model and encoder
model = None
encoder = None

class PredictionRequest(BaseModel):
    """Request model for price prediction."""
    distance_km: float = Field(..., ge=0.1, le=50.0, description="Distance in kilometers")
    traffic_duration_seconds: int = Field(..., ge=60, le=7200, description="Traffic duration in seconds")
    weather_condition: str = Field(..., description="Weather condition")
    time_of_day: str = Field(..., description="Time of day category")
    is_holiday: Optional[bool] = Field(False, description="Whether it's a public holiday")
    
    class Config:
        schema_extra = {
            "example": {
                "distance_km": 5.2,
                "traffic_duration_seconds": 1200,
                "weather_condition": "Rain",
                "time_of_day": "DinnerRush",
                "is_holiday": False
            }
        }

class PredictionResponse(BaseModel):
    """Response model for price prediction."""
    price_multiplier: float = Field(..., description="Predicted price multiplier")
    base_price: float = Field(..., description="Base price used for calculation")
    final_price: float = Field(..., description="Final price after applying multiplier")
    surge_percentage: float = Field(..., description="Surge percentage")
    prediction_timestamp: datetime = Field(..., description="Timestamp of prediction")
    status: str = Field(..., description="Pricing status (NORMAL, MODERATE_SURGE, HIGH_SURGE)")

def load_model_and_encoder():
    """Load the trained model and encoder at startup."""
    global model, encoder
    
    try:
        logger.info("Loading pricing model...")
        model = joblib.load('pricing_model.pkl')
        
        logger.info("Loading encoder...")
        encoder = joblib.load('encoder.pkl')
        
        logger.info("Model and encoder loaded successfully!")
        
    except FileNotFoundError as e:
        logger.error(f"Model files not found: {e}")
        raise RuntimeError("Model files not found. Please run train_model.py first.")
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        raise RuntimeError(f"Failed to load model: {e}")

def validate_inputs(request: PredictionRequest) -> None:
    """Validate input parameters."""
    valid_weather = ['Clear', 'Clouds', 'Rain', 'Thunderstorm']
    valid_times = ['Morning', 'LunchRush', 'Afternoon', 'DinnerRush', 'Night']
    
    if request.weather_condition not in valid_weather:
        raise HTTPException(
            status_code=400,
            detail=f"Weather condition must be one of: {valid_weather}"
        )
    
    if request.time_of_day not in valid_times:
        raise HTTPException(
            status_code=400,
            detail=f"Time of day must be one of: {valid_times}"
        )

def prepare_input_data(request: PredictionRequest) -> np.ndarray:
    """Prepare input data for prediction."""
    # Create DataFrame with the same structure as training data
    input_data = pd.DataFrame({
        'distance_km': [request.distance_km],
        'traffic_duration_seconds': [request.traffic_duration_seconds],
        'weather_condition': [request.weather_condition],
        'time_of_day': [request.time_of_day],
        'is_holiday': [request.is_holiday]
    })
    
    # Separate numerical and categorical features
    numerical_columns = ['distance_km', 'traffic_duration_seconds', 'is_holiday']
    categorical_columns = ['weather_condition', 'time_of_day']
    
    # Encode categorical features using the fitted encoder
    X_categorical_encoded = encoder.transform(input_data[categorical_columns])
    
    # Combine numerical and encoded categorical features
    X_processed = np.column_stack([
        input_data[numerical_columns].values,
        X_categorical_encoded
    ])
    
    return X_processed

def make_prediction(request: PredictionRequest) -> float:
    """Make a prediction using the trained model."""
    # Prepare input data
    X_processed = prepare_input_data(request)
    
    # Make prediction
    prediction = model.predict(X_processed)[0]
    
    # Ensure minimum multiplier of 1.0
    return max(1.0, prediction)

def determine_pricing_status(multiplier: float) -> str:
    """Determine pricing status based on multiplier."""
    if multiplier > 1.2:
        return "HIGH_SURGE"
    elif multiplier > 1.1:
        return "MODERATE_SURGE"
    else:
        return "NORMAL"

@app.on_event("startup")
async def startup_event():
    """Load model and encoder on startup."""
    load_model_and_encoder()
    create_tables()  # Initialize database tables

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Dynamic Pricing API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "predict": "/predict",
            "health": "/health",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "model_loaded": model is not None,
        "encoder_loaded": encoder is not None
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_price(request: PredictionRequest, http_request: Request, db: Session = Depends(get_db)):
    """
    Predict dynamic pricing based on current conditions.
    
    - **distance_km**: Distance in kilometers (0.1-50.0)
    - **traffic_duration_seconds**: Traffic duration in seconds (60-7200)
    - **weather_condition**: Weather condition (Clear, Clouds, Rain, Thunderstorm)
    - **time_of_day**: Time of day (Morning, LunchRush, Afternoon, DinnerRush, Night)
    - **is_holiday**: Whether it's a public holiday (optional, defaults to False)
    
    Returns the predicted price multiplier and calculated pricing information.
    """
    try:
        # Validate inputs
        validate_inputs(request)
        
        # Make prediction
        multiplier = make_prediction(request)
        
        # Calculate pricing information
        base_price = 100.0  # Example base price
        final_price = base_price * multiplier
        surge_percentage = (multiplier - 1.0) * 100
        status = determine_pricing_status(multiplier)
        
        # Create response
        response = PredictionResponse(
            price_multiplier=round(multiplier, 3),
            base_price=base_price,
            final_price=round(final_price, 2),
            surge_percentage=round(surge_percentage, 1),
            prediction_timestamp=datetime.now(),
            status=status
        )
        
        # Log prediction to database
        try:
            log_prediction(
                db=db,
                distance_km=request.distance_km,
                traffic_duration_seconds=request.traffic_duration_seconds,
                weather_condition=request.weather_condition,
                time_of_day=request.time_of_day,
                is_holiday=request.is_holiday,
                predicted_multiplier=multiplier,
                base_price=base_price,
                final_price=final_price,
                surge_percentage=surge_percentage,
                pricing_status=status,
                request_id=f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{hash(str(request))}",
                user_agent=http_request.headers.get("user-agent"),
                ip_address=http_request.client.host
            )
        except Exception as e:
            logger.warning(f"Failed to log prediction to database: {e}")
        
        logger.info(f"Prediction made: {multiplier:.3f}x multiplier for {request.weather_condition} {request.time_of_day}")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/model/info")
async def model_info():
    """Get information about the loaded model."""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    return {
        "model_type": type(model).__name__,
        "feature_importance": model.feature_importances_.tolist() if hasattr(model, 'feature_importances_') else None,
        "n_features": model.n_features_in_ if hasattr(model, 'n_features_in_') else None,
        "loaded_at": datetime.now()
    }

@app.get("/stats")
async def get_stats(days: int = 30, db: Session = Depends(get_db)):
    """Get prediction statistics for the last N days."""
    try:
        stats = get_prediction_stats(db, days)
        return {
            "statistics": stats,
            "generated_at": datetime.now()
        }
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving statistics: {str(e)}")

if __name__ == "__main__":
    # Run the server
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
