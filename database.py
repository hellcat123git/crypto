"""
Database module for Dynamic Pricing Model
Handles prediction logging and MLOps feedback loop.
"""

from sqlalchemy import create_engine, Column, Integer, Float, String, Boolean, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pricing_predictions.db")

# Create engine
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

class PredictionLog(Base):
    """SQLAlchemy model for logging predictions."""
    __tablename__ = "prediction_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Input features
    distance_km = Column(Float, nullable=False)
    traffic_duration_seconds = Column(Integer, nullable=False)
    weather_condition = Column(String(50), nullable=False)
    time_of_day = Column(String(50), nullable=False)
    is_holiday = Column(Boolean, default=False)
    
    # Prediction results
    predicted_multiplier = Column(Float, nullable=False)
    base_price = Column(Float, nullable=False)
    final_price = Column(Float, nullable=False)
    surge_percentage = Column(Float, nullable=False)
    pricing_status = Column(String(50), nullable=False)
    
    # Metadata
    prediction_timestamp = Column(DateTime, default=datetime.utcnow)
    request_id = Column(String(100), nullable=True)  # For tracking specific requests
    user_agent = Column(String(500), nullable=True)  # For API usage analytics
    ip_address = Column(String(45), nullable=True)   # For geographic analysis
    
    # Feedback fields (to be filled later)
    actual_multiplier = Column(Float, nullable=True)  # Actual price multiplier used
    customer_rating = Column(Integer, nullable=True)  # Customer satisfaction (1-5)
    order_completed = Column(Boolean, nullable=True)  # Whether order was completed
    feedback_timestamp = Column(DateTime, nullable=True)  # When feedback was received
    feedback_notes = Column(Text, nullable=True)  # Additional feedback notes

class ModelPerformanceLog(Base):
    """SQLAlchemy model for tracking model performance over time."""
    __tablename__ = "model_performance_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Model information
    model_version = Column(String(100), nullable=False)
    training_date = Column(DateTime, nullable=False)
    model_type = Column(String(100), nullable=False)
    
    # Performance metrics
    r2_score = Column(Float, nullable=False)
    mean_absolute_error = Column(Float, nullable=False)
    mean_squared_error = Column(Float, nullable=False)
    root_mean_squared_error = Column(Float, nullable=False)
    
    # Training details
    training_samples = Column(Integer, nullable=False)
    test_samples = Column(Integer, nullable=False)
    training_duration_seconds = Column(Float, nullable=True)
    
    # Feature importance (stored as JSON string)
    feature_importance = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)

def create_tables():
    """Create all database tables."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise

def get_db() -> Session:
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def log_prediction(
    db: Session,
    distance_km: float,
    traffic_duration_seconds: int,
    weather_condition: str,
    time_of_day: str,
    is_holiday: bool,
    predicted_multiplier: float,
    base_price: float,
    final_price: float,
    surge_percentage: float,
    pricing_status: str,
    request_id: str = None,
    user_agent: str = None,
    ip_address: str = None
) -> int:
    """
    Log a prediction to the database.
    
    Returns:
        int: ID of the logged prediction
    """
    try:
        prediction_log = PredictionLog(
            distance_km=distance_km,
            traffic_duration_seconds=traffic_duration_seconds,
            weather_condition=weather_condition,
            time_of_day=time_of_day,
            is_holiday=is_holiday,
            predicted_multiplier=predicted_multiplier,
            base_price=base_price,
            final_price=final_price,
            surge_percentage=surge_percentage,
            pricing_status=pricing_status,
            request_id=request_id,
            user_agent=user_agent,
            ip_address=ip_address
        )
        
        db.add(prediction_log)
        db.commit()
        db.refresh(prediction_log)
        
        logger.info(f"Prediction logged with ID: {prediction_log.id}")
        return prediction_log.id
        
    except Exception as e:
        logger.error(f"Error logging prediction: {e}")
        db.rollback()
        raise

def log_model_performance(
    db: Session,
    model_version: str,
    training_date: datetime,
    model_type: str,
    r2_score: float,
    mean_absolute_error: float,
    mean_squared_error: float,
    root_mean_squared_error: float,
    training_samples: int,
    test_samples: int,
    training_duration_seconds: float = None,
    feature_importance: str = None,
    notes: str = None
) -> int:
    """
    Log model performance metrics to the database.
    
    Returns:
        int: ID of the logged performance record
    """
    try:
        performance_log = ModelPerformanceLog(
            model_version=model_version,
            training_date=training_date,
            model_type=model_type,
            r2_score=r2_score,
            mean_absolute_error=mean_absolute_error,
            mean_squared_error=mean_squared_error,
            root_mean_squared_error=root_mean_squared_error,
            training_samples=training_samples,
            test_samples=test_samples,
            training_duration_seconds=training_duration_seconds,
            feature_importance=feature_importance,
            notes=notes
        )
        
        db.add(performance_log)
        db.commit()
        db.refresh(performance_log)
        
        logger.info(f"Model performance logged with ID: {performance_log.id}")
        return performance_log.id
        
    except Exception as e:
        logger.error(f"Error logging model performance: {e}")
        db.rollback()
        raise

def update_prediction_feedback(
    db: Session,
    prediction_id: int,
    actual_multiplier: float = None,
    customer_rating: int = None,
    order_completed: bool = None,
    feedback_notes: str = None
) -> bool:
    """
    Update a prediction with feedback data.
    
    Returns:
        bool: True if update was successful
    """
    try:
        prediction = db.query(PredictionLog).filter(PredictionLog.id == prediction_id).first()
        
        if not prediction:
            logger.error(f"Prediction with ID {prediction_id} not found")
            return False
        
        if actual_multiplier is not None:
            prediction.actual_multiplier = actual_multiplier
        if customer_rating is not None:
            prediction.customer_rating = customer_rating
        if order_completed is not None:
            prediction.order_completed = order_completed
        if feedback_notes is not None:
            prediction.feedback_notes = feedback_notes
        
        prediction.feedback_timestamp = datetime.utcnow()
        
        db.commit()
        logger.info(f"Prediction {prediction_id} updated with feedback")
        return True
        
    except Exception as e:
        logger.error(f"Error updating prediction feedback: {e}")
        db.rollback()
        return False

def get_prediction_stats(db: Session, days: int = 30) -> dict:
    """
    Get prediction statistics for the last N days.
    
    Returns:
        dict: Statistics about predictions
    """
    try:
        from datetime import timedelta
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Get total predictions
        total_predictions = db.query(PredictionLog).filter(
            PredictionLog.prediction_timestamp >= cutoff_date
        ).count()
        
        # Get average multiplier
        avg_multiplier = db.query(PredictionLog.predicted_multiplier).filter(
            PredictionLog.prediction_timestamp >= cutoff_date
        ).all()
        avg_multiplier = sum([m[0] for m in avg_multiplier]) / len(avg_multiplier) if avg_multiplier else 0
        
        # Get status distribution
        status_counts = db.query(
            PredictionLog.pricing_status,
            db.func.count(PredictionLog.id)
        ).filter(
            PredictionLog.prediction_timestamp >= cutoff_date
        ).group_by(PredictionLog.pricing_status).all()
        
        return {
            "total_predictions": total_predictions,
            "average_multiplier": round(avg_multiplier, 3),
            "status_distribution": dict(status_counts),
            "period_days": days
        }
        
    except Exception as e:
        logger.error(f"Error getting prediction stats: {e}")
        return {}

# Initialize database on import
if __name__ == "__main__":
    create_tables()
    print("Database initialized successfully!")


