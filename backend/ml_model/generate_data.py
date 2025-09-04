#!/usr/bin/env python3
"""
Generate synthetic training data for the Dynamic Pricing ML model.
Creates realistic data based on fuel prices, traffic conditions, and demand levels.
"""

import pandas as pd
import numpy as np
import os

def generate_training_data(num_samples=1000):
    """
    Generate synthetic training data for the pricing model.
    
    Args:
        num_samples (int): Number of training samples to generate
        
    Returns:
        pd.DataFrame: Training data with features and target
    """
    np.random.seed(42)  # For reproducible results
    
    # Generate realistic ranges for each feature
    fuel_prices = np.random.uniform(1.0, 3.0, num_samples)  # $1.00 - $3.00 per liter
    traffic_indices = np.random.randint(1, 11, num_samples)  # 1-10 scale
    demand_levels = np.random.randint(1, 11, num_samples)    # 1-10 scale
    
    # Calculate price multiplier based on business logic
    # Higher fuel prices, traffic, and demand should increase the multiplier
    base_multiplier = 1.0
    
    # Fuel price impact: $1.00 = 1.0x, $3.00 = 1.4x
    fuel_impact = 1.0 + (fuel_prices - 1.0) * 0.2
    
    # Traffic impact: 1 = 1.0x, 10 = 1.3x
    traffic_impact = 1.0 + (traffic_indices - 1) * 0.033
    
    # Demand impact: 1 = 1.0x, 10 = 1.3x
    demand_impact = 1.0 + (demand_levels - 1) * 0.033
    
    # Combine all factors with some randomness
    price_multipliers = (fuel_impact * traffic_impact * demand_impact + 
                        np.random.normal(0, 0.05, num_samples))
    
    # Ensure multipliers are within reasonable bounds
    price_multipliers = np.clip(price_multipliers, 0.8, 2.0)
    
    # Create DataFrame
    data = pd.DataFrame({
        'fuel_price': fuel_prices.round(2),
        'traffic_index': traffic_indices,
        'demand_level': demand_levels,
        'price_multiplier': price_multipliers.round(3)
    })
    
    return data

def save_training_data(data, filename='training_data.csv'):
    """
    Save training data to CSV file.
    
    Args:
        data (pd.DataFrame): Training data to save
        filename (str): Output filename
    """
    output_path = os.path.join(os.path.dirname(__file__), filename)
    data.to_csv(output_path, index=False)
    print(f"✅ Training data saved to {output_path}")
    print(f"📊 Generated {len(data)} samples")
    print(f"🔢 Features: {list(data.columns[:-1])}")
    print(f"🎯 Target: {data.columns[-1]}")
    
    # Print summary statistics
    print("\n📈 Data Summary:")
    print(data.describe())

if __name__ == "__main__":
    print("🚀 Generating synthetic training data for Dynamic Pricing ML model...")
    
    # Generate 1000 training samples
    training_data = generate_training_data(1000)
    
    # Save to CSV
    save_training_data(training_data)
    
    print("\n✨ Training data generation complete!")
