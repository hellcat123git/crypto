"""
Live Prediction Script for Dynamic Pricing Model
Makes real-time price predictions based on current traffic and weather conditions.
"""

import pandas as pd
import numpy as np
import joblib
import argparse
import sys
import os

def load_model_and_encoder(model_file='pricing_model.pkl', encoder_file='encoder.pkl'):
    """
    Load the trained model and encoder from files.
    
    Args:
        model_file (str): Path to the saved model file
        encoder_file (str): Path to the saved encoder file
        
    Returns:
        tuple: (model, encoder) loaded model and encoder
    """
    try:
        print(f"Loading model from {model_file}...")
        model = joblib.load(model_file)
        
        print(f"Loading encoder from {encoder_file}...")
        encoder = joblib.load(encoder_file)
        
        print("Model and encoder loaded successfully!")
        return model, encoder
        
    except FileNotFoundError as e:
        print(f"Error: {e}")
        print("Please make sure you have run train_model.py first to create the model and encoder files.")
        sys.exit(1)
    except Exception as e:
        print(f"Error loading model/encoder: {e}")
        sys.exit(1)

def validate_inputs(distance_km, traffic_duration_seconds, weather_condition, time_of_day):
    """
    Validate input parameters.
    
    Args:
        distance_km (float): Distance in kilometers
        traffic_duration_seconds (int): Traffic duration in seconds
        weather_condition (str): Weather condition
        time_of_day (str): Time of day category
        
    Returns:
        bool: True if all inputs are valid
    """
    # Valid weather conditions
    valid_weather = ['Clear', 'Clouds', 'Rain', 'Thunderstorm']
    
    # Valid time of day options
    valid_times = ['Morning', 'LunchRush', 'Afternoon', 'DinnerRush', 'Night']
    
    errors = []
    
    # Validate distance
    if not isinstance(distance_km, (int, float)) or distance_km <= 0:
        errors.append("Distance must be a positive number")
    elif distance_km > 50:  # Reasonable upper limit
        errors.append("Distance seems too large (>50km)")
    
    # Validate traffic duration
    if not isinstance(traffic_duration_seconds, (int, float)) or traffic_duration_seconds <= 0:
        errors.append("Traffic duration must be a positive number")
    elif traffic_duration_seconds > 7200:  # 2 hours max
        errors.append("Traffic duration seems too large (>2 hours)")
    
    # Validate weather condition
    if weather_condition not in valid_weather:
        errors.append(f"Weather condition must be one of: {valid_weather}")
    
    # Validate time of day
    if time_of_day not in valid_times:
        errors.append(f"Time of day must be one of: {valid_times}")
    
    if errors:
        print("Validation errors:")
        for error in errors:
            print(f"  - {error}")
        return False
    
    return True

def prepare_input_data(distance_km, traffic_duration_seconds, weather_condition, time_of_day, is_holiday=False):
    """
    Prepare input data for prediction.
    
    Args:
        distance_km (float): Distance in kilometers
        traffic_duration_seconds (int): Traffic duration in seconds
        weather_condition (str): Weather condition
        time_of_day (str): Time of day category
        is_holiday (bool): Whether it's a public holiday
        
    Returns:
        pd.DataFrame: Prepared input data
    """
    # Create DataFrame with the same structure as training data
    input_data = pd.DataFrame({
        'distance_km': [distance_km],
        'traffic_duration_seconds': [traffic_duration_seconds],
        'weather_condition': [weather_condition],
        'time_of_day': [time_of_day],
        'is_holiday': [is_holiday]
    })
    
    return input_data

def make_prediction(model, encoder, input_data):
    """
    Make a prediction using the trained model.
    
    Args:
        model: Trained GradientBoostingRegressor model
        encoder: Fitted OneHotEncoder
        input_data (pd.DataFrame): Input data for prediction
        
    Returns:
        float: Predicted price multiplier
    """
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
    
    # Make prediction
    prediction = model.predict(X_processed)[0]
    
    # Ensure minimum multiplier of 1.0
    prediction = max(1.0, prediction)
    
    return prediction

def main():
    """Main function for live price prediction."""
    parser = argparse.ArgumentParser(
        description='Predict dynamic pricing based on traffic and weather conditions',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python predict_price.py 5.2 1200 Rain DinnerRush
  python predict_price.py 3.1 800 Clear Morning
  python predict_price.py 8.5 1800 Thunderstorm LunchRush

Valid weather conditions: Clear, Clouds, Rain, Thunderstorm
Valid time of day: Morning, LunchRush, Afternoon, DinnerRush, Night
        """
    )
    
    parser.add_argument('distance_km', type=float, 
                       help='Distance in kilometers (1.0-50.0)')
    parser.add_argument('traffic_duration_seconds', type=int,
                       help='Traffic duration in seconds (60-7200)')
    parser.add_argument('weather_condition', type=str,
                       help='Weather condition (Clear, Clouds, Rain, Thunderstorm)')
    parser.add_argument('time_of_day', type=str,
                       help='Time of day (Morning, LunchRush, Afternoon, DinnerRush, Night)')
    parser.add_argument('--is_holiday', action='store_true',
                       help='Whether it is a public holiday')
    
    args = parser.parse_args()
    
    print("=== Dynamic Pricing Prediction ===")
    print(f"Input parameters:")
    print(f"  Distance: {args.distance_km} km")
    print(f"  Traffic Duration: {args.traffic_duration_seconds} seconds")
    print(f"  Weather: {args.weather_condition}")
    print(f"  Time of Day: {args.time_of_day}")
    print(f"  Is Holiday: {args.is_holiday}")
    
    # Validate inputs
    if not validate_inputs(args.distance_km, args.traffic_duration_seconds, 
                          args.weather_condition, args.time_of_day):
        sys.exit(1)
    
    # Load model and encoder
    model, encoder = load_model_and_encoder()
    
    # Prepare input data
    input_data = prepare_input_data(
        args.distance_km, 
        args.traffic_duration_seconds, 
        args.weather_condition, 
        args.time_of_day,
        args.is_holiday
    )
    
    # Make prediction
    print("\nMaking prediction...")
    predicted_multiplier = make_prediction(model, encoder, input_data)
    
    # Display result
    print(f"\n=== Prediction Result ===")
    print(f"Predicted Price Multiplier: {predicted_multiplier:.2f}")
    
    # Additional insights
    base_price = 100  # Example base price
    adjusted_price = base_price * predicted_multiplier
    surge_amount = (predicted_multiplier - 1.0) * 100
    
    print(f"\nExample calculation (assuming base price of ${base_price}):")
    print(f"  Base Price: ${base_price:.2f}")
    print(f"  Adjusted Price: ${adjusted_price:.2f}")
    print(f"  Surge Amount: {surge_amount:.1f}%")
    
    if predicted_multiplier > 1.2:
        print(f"  Status: HIGH SURGE (>{20}% increase)")
    elif predicted_multiplier > 1.1:
        print(f"  Status: MODERATE SURGE (10-20% increase)")
    else:
        print(f"  Status: NORMAL PRICING (<10% increase)")

if __name__ == "__main__":
    main()
