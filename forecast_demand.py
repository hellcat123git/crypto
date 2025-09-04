"""
Demand Forecasting Module for Dynamic Pricing Model
Uses Facebook Prophet to predict demand patterns and integrate with pricing model.
"""

import pandas as pd
import numpy as np
from prophet import Prophet
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_synthetic_demand_data(days=90):
    """
    Generate synthetic hourly demand data for the past N days.
    
    Args:
        days (int): Number of days to generate data for
        
    Returns:
        pd.DataFrame: Time series data with hourly demand scores
    """
    logger.info(f"Generating {days} days of synthetic demand data...")
    
    # Create date range
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    # Generate hourly timestamps
    timestamps = pd.date_range(start=start_date, end=end_date, freq='H')
    
    data = []
    
    for timestamp in timestamps:
        # Base demand pattern
        hour = timestamp.hour
        day_of_week = timestamp.weekday()  # 0=Monday, 6=Sunday
        
        # Daily pattern: peaks at lunch (12-14) and dinner (18-21)
        if 12 <= hour <= 14:  # Lunch rush
            daily_factor = 1.5
        elif 18 <= hour <= 21:  # Dinner rush
            daily_factor = 1.8
        elif 7 <= hour <= 10:  # Morning
            daily_factor = 0.8
        elif 22 <= hour or hour <= 6:  # Night
            daily_factor = 0.3
        else:  # Afternoon
            daily_factor = 1.0
        
        # Weekly pattern: higher demand on weekends
        if day_of_week >= 5:  # Weekend (Saturday, Sunday)
            weekly_factor = 1.3
        else:  # Weekday
            weekly_factor = 1.0
        
        # Add some randomness
        noise = np.random.normal(0, 0.1)
        
        # Calculate demand score (0-10 scale)
        demand_score = max(0, min(10, (daily_factor * weekly_factor) + noise))
        
        data.append({
            'ds': timestamp,
            'y': demand_score
        })
    
    df = pd.DataFrame(data)
    logger.info(f"Generated {len(df)} hourly demand records")
    
    return df

def train_demand_forecast_model(data, save_model=True):
    """
    Train a Prophet model for demand forecasting.
    
    Args:
        data (pd.DataFrame): Time series data with 'ds' and 'y' columns
        save_model (bool): Whether to save the trained model
        
    Returns:
        Prophet: Trained Prophet model
    """
    logger.info("Training Prophet model for demand forecasting...")
    
    # Initialize Prophet with custom seasonality
    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=True,
        seasonality_mode='multiplicative',
        changepoint_prior_scale=0.05,
        seasonality_prior_scale=10.0
    )
    
    # Add custom seasonalities for meal times
    model.add_seasonality(
        name='lunch_rush',
        period=24,
        fourier_order=4,
        condition_name='lunch_hours'
    )
    
    model.add_seasonality(
        name='dinner_rush',
        period=24,
        fourier_order=4,
        condition_name='dinner_hours'
    )
    
    # Add lunch and dinner hour conditions
    data['lunch_hours'] = data['ds'].dt.hour.isin([12, 13, 14])
    data['dinner_hours'] = data['ds'].dt.hour.isin([18, 19, 20, 21])
    
    # Train the model
    model.fit(data)
    
    if save_model:
        # Save the model
        model_path = 'demand_forecast_model.pkl'
        joblib.dump(model, model_path)
        logger.info(f"Demand forecast model saved to {model_path}")
    
    return model

def predict_demand_score(model, hours_ahead=1):
    """
    Predict demand score for the next N hours.
    
    Args:
        model (Prophet): Trained Prophet model
        hours_ahead (int): Number of hours to predict ahead
        
    Returns:
        float: Predicted demand score for the next hour
    """
    # Create future dataframe
    future = model.make_future_dataframe(periods=hours_ahead, freq='H')
    
    # Add conditions for future data
    future['lunch_hours'] = future['ds'].dt.hour.isin([12, 13, 14])
    future['dinner_hours'] = future['ds'].dt.hour.isin([18, 19, 20, 21])
    
    # Make prediction
    forecast = model.predict(future)
    
    # Get the prediction for the next hour
    next_hour_prediction = forecast['yhat'].iloc[-1]
    
    # Ensure score is within reasonable bounds
    demand_score = max(0, min(10, next_hour_prediction))
    
    return round(demand_score, 2)

def get_demand_forecast(model, days_ahead=7):
    """
    Get demand forecast for the next N days.
    
    Args:
        model (Prophet): Trained Prophet model
        days_ahead (int): Number of days to forecast
        
    Returns:
        pd.DataFrame: Forecast data with confidence intervals
    """
    # Create future dataframe
    future = model.make_future_dataframe(periods=days_ahead * 24, freq='H')
    
    # Add conditions for future data
    future['lunch_hours'] = future['ds'].dt.hour.isin([12, 13, 14])
    future['dinner_hours'] = future['ds'].dt.hour.isin([18, 19, 20, 21])
    
    # Make prediction
    forecast = model.predict(future)
    
    # Return only future predictions
    future_forecast = forecast[forecast['ds'] > datetime.now()].copy()
    
    return future_forecast

def plot_demand_forecast(model, data, days_ahead=7, save_plot=True):
    """
    Plot demand forecast with historical data.
    
    Args:
        model (Prophet): Trained Prophet model
        data (pd.DataFrame): Historical data
        days_ahead (int): Number of days to forecast
        save_plot (bool): Whether to save the plot
    """
    # Get forecast
    forecast = get_demand_forecast(model, days_ahead)
    
    # Create plot
    plt.figure(figsize=(15, 8))
    
    # Plot historical data
    plt.subplot(2, 1, 1)
    plt.plot(data['ds'], data['y'], label='Historical Demand', color='blue', alpha=0.7)
    plt.title('Historical Demand Pattern')
    plt.ylabel('Demand Score')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    # Plot forecast
    plt.subplot(2, 1, 2)
    plt.plot(forecast['ds'], forecast['yhat'], label='Forecast', color='red', linewidth=2)
    plt.fill_between(
        forecast['ds'], 
        forecast['yhat_lower'], 
        forecast['yhat_upper'], 
        alpha=0.3, 
        color='red',
        label='Confidence Interval'
    )
    plt.title(f'Demand Forecast - Next {days_ahead} Days')
    plt.xlabel('Date')
    plt.ylabel('Demand Score')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    plt.tight_layout()
    
    if save_plot:
        plt.savefig('demand_forecast.png', dpi=300, bbox_inches='tight')
        logger.info("Demand forecast plot saved as 'demand_forecast.png'")
    
    plt.show()

def analyze_demand_patterns(data):
    """
    Analyze demand patterns in the historical data.
    
    Args:
        data (pd.DataFrame): Historical demand data
        
    Returns:
        dict: Analysis results
    """
    logger.info("Analyzing demand patterns...")
    
    # Add time features
    data['hour'] = data['ds'].dt.hour
    data['day_of_week'] = data['ds'].dt.day_name()
    data['is_weekend'] = data['ds'].dt.weekday >= 5
    
    # Hourly patterns
    hourly_avg = data.groupby('hour')['y'].mean().to_dict()
    
    # Daily patterns
    daily_avg = data.groupby('day_of_week')['y'].mean().to_dict()
    
    # Weekend vs weekday
    weekend_avg = data[data['is_weekend']]['y'].mean()
    weekday_avg = data[~data['is_weekend']]['y'].mean()
    
    # Peak hours identification
    peak_hours = sorted(hourly_avg.items(), key=lambda x: x[1], reverse=True)[:5]
    
    analysis = {
        'hourly_patterns': hourly_avg,
        'daily_patterns': daily_avg,
        'weekend_avg': round(weekend_avg, 2),
        'weekday_avg': round(weekday_avg, 2),
        'peak_hours': peak_hours,
        'total_records': len(data),
        'date_range': {
            'start': data['ds'].min(),
            'end': data['ds'].max()
        }
    }
    
    return analysis

def main():
    """Main function to demonstrate demand forecasting."""
    logger.info("=== Demand Forecasting Module ===")
    
    # Generate synthetic data
    demand_data = generate_synthetic_demand_data(days=90)
    
    # Analyze patterns
    analysis = analyze_demand_patterns(demand_data)
    
    print("\nDemand Pattern Analysis:")
    print(f"Total records: {analysis['total_records']}")
    print(f"Date range: {analysis['date_range']['start']} to {analysis['date_range']['end']}")
    print(f"Weekend average: {analysis['weekend_avg']}")
    print(f"Weekday average: {analysis['weekday_avg']}")
    print(f"Top 5 peak hours: {analysis['peak_hours']}")
    
    # Train model
    model = train_demand_forecast_model(demand_data)
    
    # Make predictions
    next_hour_demand = predict_demand_score(model, hours_ahead=1)
    print(f"\nPredicted demand for next hour: {next_hour_demand}")
    
    # Get 7-day forecast
    forecast = get_demand_forecast(model, days_ahead=7)
    print(f"\n7-day forecast generated with {len(forecast)} hourly predictions")
    
    # Plot results
    try:
        plot_demand_forecast(model, demand_data, days_ahead=7)
    except Exception as e:
        logger.warning(f"Could not generate plot: {e}")
    
    # Save forecast data
    forecast.to_csv('demand_forecast.csv', index=False)
    logger.info("Forecast data saved to 'demand_forecast.csv'")
    
    print("\n=== Demand Forecasting Complete ===")
    print("Files created:")
    print("- demand_forecast_model.pkl (trained model)")
    print("- demand_forecast.csv (forecast data)")
    print("- demand_forecast.png (visualization)")

if __name__ == "__main__":
    main()


