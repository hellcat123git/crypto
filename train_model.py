"""
Model Training Script for Dynamic Pricing Model
Trains a GradientBoostingRegressor model and saves it along with the encoder.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import joblib
import os
import mlflow
import mlflow.sklearn
from datetime import datetime
import json

def load_and_preprocess_data(csv_file='training_data.csv'):
    """
    Load and preprocess the training data.
    
    Args:
        csv_file (str): Path to the training data CSV file
        
    Returns:
        tuple: (X_processed, y, encoder) where X_processed is the processed features,
               y is the target variable, and encoder is the fitted OneHotEncoder
    """
    print(f"Loading data from {csv_file}...")
    
    # Load the data
    df = pd.read_csv(csv_file)
    print(f"Loaded {len(df)} samples")
    
    # Separate features and target
    feature_columns = ['distance_km', 'traffic_duration_seconds', 'weather_condition', 'time_of_day', 'is_holiday']
    X = df[feature_columns].copy()
    y = df['price_multiplier'].copy()
    
    print(f"Features: {feature_columns}")
    print(f"Target variable: price_multiplier")
    
    # Identify categorical columns
    categorical_columns = ['weather_condition', 'time_of_day']
    numerical_columns = ['distance_km', 'traffic_duration_seconds', 'is_holiday']
    
    print(f"Categorical features: {categorical_columns}")
    print(f"Numerical features: {numerical_columns}")
    
    # Create and fit OneHotEncoder for categorical features
    encoder = OneHotEncoder(drop='first', sparse=False, handle_unknown='ignore')
    
    # Fit encoder on categorical features
    X_categorical_encoded = encoder.fit_transform(X[categorical_columns])
    
    # Get feature names for encoded categorical features
    categorical_feature_names = encoder.get_feature_names_out(categorical_columns)
    
    # Combine numerical and encoded categorical features
    X_processed = np.column_stack([
        X[numerical_columns].values,
        X_categorical_encoded
    ])
    
    # Create feature names
    feature_names = numerical_columns + list(categorical_feature_names)
    
    print(f"Processed feature shape: {X_processed.shape}")
    print(f"Feature names: {feature_names}")
    
    return X_processed, y, encoder, feature_names

def train_model(X, y, test_size=0.2, random_state=42):
    """
    Train the GradientBoostingRegressor model with MLflow tracking.
    
    Args:
        X (np.array): Processed feature matrix
        y (pd.Series): Target variable
        test_size (float): Proportion of data to use for testing
        random_state (int): Random state for reproducibility
        
    Returns:
        tuple: (model, X_test, y_test, metrics) trained model, test data, and metrics
    """
    print(f"\nSplitting data into train/test sets (test_size={test_size})...")
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )
    
    print(f"Training set size: {X_train.shape[0]}")
    print(f"Test set size: {X_test.shape[0]}")
    
    # Model hyperparameters
    model_params = {
        'n_estimators': 100,
        'learning_rate': 0.1,
        'max_depth': 6,
        'random_state': random_state,
        'subsample': 0.8
    }
    
    # Initialize and train the model
    print("\nTraining GradientBoostingRegressor...")
    model = GradientBoostingRegressor(**model_params)
    
    # Start MLflow run
    with mlflow.start_run():
        # Log parameters
        mlflow.log_params(model_params)
        mlflow.log_param("test_size", test_size)
        mlflow.log_param("random_state", random_state)
        mlflow.log_param("training_samples", len(X_train))
        mlflow.log_param("test_samples", len(X_test))
        
        # Train the model
        start_time = datetime.now()
        model.fit(X_train, y_train)
        training_duration = (datetime.now() - start_time).total_seconds()
        
        # Make predictions
        y_train_pred = model.predict(X_train)
        y_test_pred = model.predict(X_test)
        
        # Calculate metrics
        train_mse = mean_squared_error(y_train, y_train_pred)
        test_mse = mean_squared_error(y_test, y_test_pred)
        train_r2 = r2_score(y_train, y_train_pred)
        test_r2 = r2_score(y_test, y_test_pred)
        train_mae = mean_absolute_error(y_train, y_train_pred)
        test_mae = mean_absolute_error(y_test, y_test_pred)
        train_rmse = np.sqrt(train_mse)
        test_rmse = np.sqrt(test_mse)
        
        # Log metrics
        mlflow.log_metric("train_mse", train_mse)
        mlflow.log_metric("test_mse", test_mse)
        mlflow.log_metric("train_r2", train_r2)
        mlflow.log_metric("test_r2", test_r2)
        mlflow.log_metric("train_mae", train_mae)
        mlflow.log_metric("test_mae", test_mae)
        mlflow.log_metric("train_rmse", train_rmse)
        mlflow.log_metric("test_rmse", test_rmse)
        mlflow.log_metric("training_duration_seconds", training_duration)
        
        # Log feature importance
        if hasattr(model, 'feature_importances_'):
            feature_importance = model.feature_importances_.tolist()
            mlflow.log_param("feature_importance", json.dumps(feature_importance))
        
        # Log model
        mlflow.sklearn.log_model(
            model, 
            "pricing_model",
            registered_model_name="DynamicPricingModel"
        )
        
        # Log encoder separately (we'll save it manually)
        print(f"\nModel Performance:")
        print(f"Training MSE: {train_mse:.4f}")
        print(f"Test MSE: {test_mse:.4f}")
        print(f"Training R²: {train_r2:.4f}")
        print(f"Test R²: {test_r2:.4f}")
        print(f"Training MAE: {train_mae:.4f}")
        print(f"Test MAE: {test_mae:.4f}")
        print(f"Training RMSE: {train_rmse:.4f}")
        print(f"Test RMSE: {test_rmse:.4f}")
        print(f"Training Duration: {training_duration:.2f} seconds")
        
        # Store metrics for return
        metrics = {
            'train_mse': train_mse,
            'test_mse': test_mse,
            'train_r2': train_r2,
            'test_r2': test_r2,
            'train_mae': train_mae,
            'test_mae': test_mae,
            'train_rmse': train_rmse,
            'test_rmse': test_rmse,
            'training_duration': training_duration
        }
    
    return model, X_test, y_test, metrics

def save_model_and_encoder(model, encoder, model_file='pricing_model.pkl', encoder_file='encoder.pkl'):
    """
    Save the trained model and encoder to files.
    
    Args:
        model: Trained GradientBoostingRegressor model
        encoder: Fitted OneHotEncoder
        model_file (str): Path to save the model
        encoder_file (str): Path to save the encoder
    """
    print(f"\nSaving model to {model_file}...")
    joblib.dump(model, model_file)
    
    print(f"Saving encoder to {encoder_file}...")
    joblib.dump(encoder, encoder_file)
    
    print("Model and encoder saved successfully!")

def analyze_feature_importance(model, feature_names):
    """
    Analyze and display feature importance.
    
    Args:
        model: Trained GradientBoostingRegressor model
        feature_names (list): List of feature names
    """
    print(f"\nFeature Importance Analysis:")
    importance_df = pd.DataFrame({
        'feature': feature_names,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print(importance_df)
    
    return importance_df

def main():
    """Main function to train the pricing model."""
    print("=== Dynamic Pricing Model Training ===")
    
    # Check if training data exists
    if not os.path.exists('training_data.csv'):
        print("Error: training_data.csv not found!")
        print("Please run generate_data.py first to create the training data.")
        return
    
    try:
        # Load and preprocess data
        X, y, encoder, feature_names = load_and_preprocess_data()
        
        # Train the model
        model, X_test, y_test, metrics = train_model(X, y)
        
        # Analyze feature importance
        importance_df = analyze_feature_importance(model, feature_names)
        
        # Save model and encoder
        save_model_and_encoder(model, encoder)
        
        # Log to database (if available)
        try:
            from database import SessionLocal, log_model_performance
            db = SessionLocal()
            log_model_performance(
                db=db,
                model_version=f"v1.0_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                training_date=datetime.now(),
                model_type="GradientBoostingRegressor",
                r2_score=metrics['test_r2'],
                mean_absolute_error=metrics['test_mae'],
                mean_squared_error=metrics['test_mse'],
                root_mean_squared_error=metrics['test_rmse'],
                training_samples=len(X) - len(X_test),
                test_samples=len(X_test),
                training_duration_seconds=metrics['training_duration'],
                feature_importance=json.dumps(model.feature_importances_.tolist()),
                notes="Model trained with holiday features and MLflow tracking"
            )
            db.close()
            print("Model performance logged to database")
        except Exception as e:
            print(f"Could not log to database: {e}")
        
        print(f"\n=== Training Complete ===")
        print(f"Model saved as: pricing_model.pkl")
        print(f"Encoder saved as: encoder.pkl")
        print(f"MLflow run completed - view at: mlflow ui")
        print(f"Ready for live predictions!")
        
    except Exception as e:
        print(f"Error during training: {str(e)}")
        raise

if __name__ == "__main__":
    main()
