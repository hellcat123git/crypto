#!/usr/bin/env python3
"""
Train the Dynamic Pricing ML model using Gradient Boosting Regressor.
Loads synthetic training data and saves the trained model.
"""

import pandas as pd
import numpy as np
import os
import joblib
import sys
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.preprocessing import StandardScaler

# Ensure Windows console can print Unicode without crashing
try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

def load_training_data(filename='training_data.csv'):
    """
    Load training data from CSV file.
    
    Args:
        filename (str): Training data filename
        
    Returns:
        tuple: (X, y) features and target
    """
    file_path = os.path.join(os.path.dirname(__file__), filename)
    
    if not os.path.exists(file_path):
        print(f"❌ Training data file not found: {file_path}")
        print("🔄 Generating training data first...")
        from generate_data import generate_training_data, save_training_data
        
        training_data = generate_training_data(1000)
        save_training_data(training_data, filename)
    
    data = pd.read_csv(file_path)
    print(f"✅ Loaded training data: {len(data)} samples")
    
    # Separate features and target
    X = data[['fuel_price', 'traffic_index', 'demand_level']].values
    y = data['price_multiplier'].values
    
    return X, y

def train_model(X, y):
    """
    Train the Gradient Boosting Regressor model.
    
    Args:
        X (np.array): Feature matrix
        y (np.array): Target values
        
    Returns:
        GradientBoostingRegressor: Trained model
    """
    print("🚀 Training Gradient Boosting Regressor...")
    
    # Split data into training and validation sets
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Initialize and train the model
    model = GradientBoostingRegressor(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=6,
        random_state=42,
        subsample=0.8
    )
    
    # Train the model
    model.fit(X_train, y_train)
    
    # Make predictions on validation set
    y_pred = model.predict(X_val)
    
    # Calculate metrics
    mse = mean_squared_error(y_val, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_val, y_pred)
    r2 = r2_score(y_val, y_pred)
    
    print(f"✅ Model training complete!")
    print(f"📊 Validation Metrics:")
    print(f"   RMSE: {rmse:.4f}")
    print(f"   MAE:  {mae:.4f}")
    print(f"   R²:   {r2:.4f}")
    
    # Feature importance
    feature_names = ['fuel_price', 'traffic_index', 'demand_level']
    importance = model.feature_importances_
    
    print(f"\n🔍 Feature Importance:")
    for name, imp in zip(feature_names, importance):
        print(f"   {name}: {imp:.4f}")
    
    return model

def save_model(model, filename='pricing_model.pkl'):
    """
    Save the trained model to a pickle file.
    
    Args:
        model: Trained ML model
        filename (str): Output filename
    """
    output_path = os.path.join(os.path.dirname(__file__), filename)
    joblib.dump(model, output_path)
    print(f"✅ Model saved to {output_path}")

def test_model(model, test_cases):
    """
    Test the model with some example cases.
    
    Args:
        model: Trained ML model
        test_cases (list): List of test cases (fuel_price, traffic_index, demand_level)
    """
    print(f"\n🧪 Testing model with example cases:")
    
    for i, (fuel, traffic, demand) in enumerate(test_cases, 1):
        prediction = model.predict([[fuel, traffic, demand]])[0]
        print(f"   Case {i}: Fuel=${fuel}, Traffic={traffic}, Demand={demand} → Multiplier: {prediction:.3f}")

def main():
    """Main training pipeline."""
    print("🎯 Dynamic Pricing ML Model Training Pipeline")
    print("=" * 50)
    
    try:
        # Load training data
        X, y = load_training_data()
        
        # Train the model
        model = train_model(X, y)
        
        # Save the trained model
        save_model(model)
        
        # Test with some example cases
        test_cases = [
            (1.50, 3, 4),   # Low fuel, low traffic, low demand
            (2.00, 7, 6),   # Medium fuel, medium traffic, medium demand
            (2.50, 10, 9),  # High fuel, high traffic, high demand
        ]
        test_model(model, test_cases)
        
        print(f"\n🎉 Training pipeline completed successfully!")
        print(f"📁 Model saved as: pricing_model.pkl")
        print(f"🔮 Ready for predictions!")
        
    except Exception as e:
        print(f"❌ Error during training: {str(e)}")
        raise

if __name__ == "__main__":
    main()
