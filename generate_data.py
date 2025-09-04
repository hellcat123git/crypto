"""
Data Generation Script for Dynamic Pricing Model
Generates synthetic training data for traffic and weather-based pricing.
"""

import pandas as pd
import numpy as np
import random
import holidays
from datetime import datetime, timedelta

def generate_training_data(num_samples=5000):
    """
    Generate synthetic training data for the pricing model.
    
    Args:
        num_samples (int): Number of data samples to generate
        
    Returns:
        pd.DataFrame: Generated training data
    """
    np.random.seed(42)  # For reproducible results
    random.seed(42)
    
    data = []
    
    # Define weather conditions with different probabilities
    weather_conditions = ['Clear', 'Clouds', 'Rain', 'Thunderstorm']
    weather_weights = [0.4, 0.4, 0.15, 0.05]  # Rain and Thunderstorm are less frequent
    
    # Define time of day categories
    time_of_day_options = ['Morning', 'LunchRush', 'Afternoon', 'DinnerRush', 'Night']
    
    # Initialize Indian holidays
    india_holidays = holidays.country_holidays('IN', subdiv='TN')  # Tamil Nadu holidays
    
    # Generate date range for the data
    start_date = datetime(2023, 1, 1)
    end_date = datetime(2024, 12, 31)
    date_range = [start_date + timedelta(days=x) for x in range((end_date - start_date).days + 1)]
    
    for _ in range(num_samples):
        # Generate distance (1.0 to 15.0 km)
        distance_km = round(np.random.uniform(1.0, 15.0), 2)
        
        # Generate traffic duration based on distance and random traffic factor
        base_duration = distance_km * 60  # Base: 1 minute per km
        traffic_factor = np.random.uniform(0.8, 2.5)  # Traffic can make it 0.8x to 2.5x longer
        traffic_duration_seconds = int(base_duration * traffic_factor)
        
        # Generate weather condition with weighted probabilities
        weather_condition = np.random.choice(weather_conditions, p=weather_weights)
        
        # Generate time of day
        time_of_day = random.choice(time_of_day_options)
        
        # Generate random date and check if it's a holiday
        random_date = random.choice(date_range)
        is_holiday = random_date in india_holidays
        
        # Calculate price multiplier
        price_multiplier = calculate_price_multiplier(
            traffic_duration_seconds, weather_condition, time_of_day, is_holiday
        )
        
        data.append({
            'distance_km': distance_km,
            'traffic_duration_seconds': traffic_duration_seconds,
            'weather_condition': weather_condition,
            'time_of_day': time_of_day,
            'is_holiday': is_holiday,
            'price_multiplier': price_multiplier
        })
    
    return pd.DataFrame(data)

def calculate_price_multiplier(traffic_duration, weather_condition, time_of_day, is_holiday=False):
    """
    Calculate price multiplier based on various factors.
    
    Args:
        traffic_duration (int): Traffic duration in seconds
        weather_condition (str): Weather condition
        time_of_day (str): Time of day category
        is_holiday (bool): Whether it's a public holiday
        
    Returns:
        float: Calculated price multiplier
    """
    # Start with base multiplier
    multiplier = 1.0
    
    # Traffic impact: longer duration = higher multiplier
    # Normalize traffic duration (assuming 60-1800 seconds range)
    traffic_impact = min((traffic_duration - 60) / (1800 - 60), 1.0) * 0.4
    multiplier += max(0, traffic_impact)
    
    # Weather impact
    if weather_condition == 'Rain':
        multiplier += np.random.uniform(0.3, 0.5)
    elif weather_condition == 'Thunderstorm':
        multiplier += np.random.uniform(0.5, 0.8)
    
    # Peak hours impact
    if time_of_day in ['LunchRush', 'DinnerRush']:
        multiplier += np.random.uniform(0.2, 0.4)
    
    # Holiday impact - significant surge on public holidays
    if is_holiday:
        multiplier += np.random.uniform(0.4, 0.7)  # Major surge on holidays
    
    # Ensure minimum multiplier of 1.0
    return round(max(1.0, multiplier), 3)

def main():
    """Main function to generate and save training data."""
    print("Generating training data...")
    
    # Generate the dataset
    df = generate_training_data(5000)
    
    # Save to CSV
    df.to_csv('training_data.csv', index=False)
    
    print(f"Generated {len(df)} samples")
    print(f"Data saved to 'training_data.csv'")
    
    # Display basic statistics
    print("\nDataset Statistics:")
    print(f"Price multiplier range: {df['price_multiplier'].min():.3f} - {df['price_multiplier'].max():.3f}")
    print(f"Average price multiplier: {df['price_multiplier'].mean():.3f}")
    
    print("\nWeather condition distribution:")
    print(df['weather_condition'].value_counts())
    
    print("\nTime of day distribution:")
    print(df['time_of_day'].value_counts())
    
    print("\nFirst 5 rows:")
    print(df.head())

if __name__ == "__main__":
    main()
