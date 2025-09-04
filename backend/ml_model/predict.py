#!/usr/bin/env python3
"""
Prediction script for the Dynamic Pricing ML model.
Can be called from command line with fuel_price, traffic_index, and demand_level arguments.
Returns both price multiplier and explanation.
"""

import sys
import os
import joblib
import numpy as np

def load_model(model_path='pricing_model.pkl'):
    """
    Load the trained ML model.
    
    Args:
        model_path (str): Path to the trained model file
        
    Returns:
        Trained ML model
    """
    full_path = os.path.join(os.path.dirname(__file__), model_path)
    
    if not os.path.exists(full_path):
        raise FileNotFoundError(f"Model file not found: {full_path}. Please run train.py first.")
    
    try:
        model = joblib.load(full_path)
        return model
    except Exception as e:
        raise Exception(f"Failed to load model: {str(e)}")

def generate_explanation(fuel_price, traffic_index, demand_level, price_multiplier):
    """
    Generate human-readable explanation for the price multiplier.
    
    Args:
        fuel_price (float): Fuel price per liter
        traffic_index (int): Traffic index (1-10)
        demand_level (int): Demand level (1-10)
        price_multiplier (float): Calculated price multiplier
        
    Returns:
        str: Human-readable explanation
    """
    explanations = []
    
    # Fuel price analysis
    if fuel_price > 2.0:
        explanations.append("high fuel costs")
    elif fuel_price < 1.7:
        explanations.append("low fuel costs")
    
    # Traffic analysis
    if traffic_index >= 8:
        explanations.append("heavy traffic conditions")
    elif traffic_index <= 3:
        explanations.append("light traffic conditions")
    
    # Demand analysis
    if demand_level >= 8:
        explanations.append("high customer demand")
    elif demand_level <= 3:
        explanations.append("low customer demand")
    
    # Price multiplier analysis
    if price_multiplier > 1.5:
        explanations.append("significant price increase due to market conditions")
    elif price_multiplier < 1.0:
        explanations.append("price reduction due to favorable conditions")
    
    # Generate final explanation
    if explanations:
        if len(explanations) == 1:
            explanation = f"Price driven by {explanations[0]}."
        else:
            explanation = f"Price driven by {', '.join(explanations[:-1])} and {explanations[-1]}."
    else:
        explanation = "Price calculated based on current market conditions."
    
    return explanation

def predict_price_multiplier(model, fuel_price, traffic_index, demand_level):
    """
    Predict price multiplier using the trained model.
    
    Args:
        model: Trained ML model
        fuel_price (float): Fuel price per liter
        traffic_index (int): Traffic index (1-10)
        demand_level (int): Demand level (1-10)
        
    Returns:
        tuple: (price_multiplier, explanation)
    """
    # Validate inputs
    if not (1.0 <= fuel_price <= 3.0):
        raise ValueError("Fuel price must be between $1.00 and $3.00")
    
    if not (1 <= traffic_index <= 10):
        raise ValueError("Traffic index must be between 1 and 10")
    
    if not (1 <= demand_level <= 10):
        raise ValueError("Demand level must be between 1 and 10")
    
    # Prepare input features
    features = np.array([[fuel_price, traffic_index, demand_level]])
    
    # Make prediction
    prediction = model.predict(features)[0]
    
    # Ensure prediction is within reasonable bounds
    prediction = np.clip(prediction, 0.8, 2.0)
    
    # Generate explanation
    explanation = generate_explanation(fuel_price, traffic_index, demand_level, prediction)
    
    return prediction, explanation

def main():
    """Main prediction function."""
    # Check command line arguments
    if len(sys.argv) != 4:
        print("Usage: python predict.py <fuel_price> <traffic_index> <demand_level>")
        print("Example: python predict.py 2.10 7 6")
        sys.exit(1)
    
    try:
        # Parse command line arguments
        fuel_price = float(sys.argv[1])
        traffic_index = int(sys.argv[2])
        demand_level = int(sys.argv[3])
        
        # Load the trained model
        model = load_model()
        
        # Make prediction
        price_multiplier, explanation = predict_price_multiplier(
            model, fuel_price, traffic_index, demand_level
        )
        
        # Output the result (this will be captured by the Node.js process)
        # First line: price multiplier, Second line: explanation
        print(f"{price_multiplier:.6f}")
        print(explanation)
        
    except ValueError as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
