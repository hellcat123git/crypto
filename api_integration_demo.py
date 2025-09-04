"""
API Integration Demo for Dynamic Pricing Model
Demonstrates how to integrate with Google Maps and OpenWeatherMap APIs
to get live data for price predictions.
"""

import requests
import json
import subprocess
import sys
from datetime import datetime
import time

class PricingAPIIntegration:
    def __init__(self, google_api_key=None, openweather_api_key=None):
        """
        Initialize the API integration class.
        
        Args:
            google_api_key (str): Google Maps API key
            openweather_api_key (str): OpenWeatherMap API key
        """
        self.google_api_key = google_api_key
        self.openweather_api_key = openweather_api_key
        
    def get_traffic_duration(self, origin, destination):
        """
        Get traffic duration using Google Maps Directions API.
        
        Args:
            origin (str): Starting address
            destination (str): Destination address
            
        Returns:
            int: Traffic duration in seconds, or None if API call fails
        """
        if not self.google_api_key:
            print("Google API key not provided. Using mock data.")
            return self._mock_traffic_duration()
        
        url = "https://maps.googleapis.com/maps/api/directions/json"
        params = {
            'origin': origin,
            'destination': destination,
            'departure_time': 'now',
            'traffic_model': 'best_guess',
            'key': self.google_api_key
        }
        
        try:
            response = requests.get(url, params=params)
            data = response.json()
            
            if data['status'] == 'OK':
                route = data['routes'][0]
                leg = route['legs'][0]
                duration_in_traffic = leg['duration_in_traffic']['value']
                return duration_in_traffic
            else:
                print(f"Google Maps API error: {data['status']}")
                return self._mock_traffic_duration()
                
        except Exception as e:
            print(f"Error calling Google Maps API: {e}")
            return self._mock_traffic_duration()
    
    def get_weather_condition(self, latitude, longitude):
        """
        Get weather condition using OpenWeatherMap API.
        
        Args:
            latitude (float): Latitude coordinate
            longitude (float): Longitude coordinate
            
        Returns:
            str: Weather condition, or None if API call fails
        """
        if not self.openweather_api_key:
            print("OpenWeatherMap API key not provided. Using mock data.")
            return self._mock_weather_condition()
        
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {
            'lat': latitude,
            'lon': longitude,
            'appid': self.openweather_api_key,
            'units': 'metric'
        }
        
        try:
            response = requests.get(url, params=params)
            data = response.json()
            
            if response.status_code == 200:
                weather_main = data['weather'][0]['main']
                return weather_main
            else:
                print(f"OpenWeatherMap API error: {data.get('message', 'Unknown error')}")
                return self._mock_weather_condition()
                
        except Exception as e:
            print(f"Error calling OpenWeatherMap API: {e}")
            return self._mock_weather_condition()
    
    def get_time_of_day_category(self):
        """
        Determine time of day category based on current time.
        
        Returns:
            str: Time of day category
        """
        current_hour = datetime.now().hour
        
        if 6 <= current_hour < 11:
            return 'Morning'
        elif 11 <= current_hour < 14:
            return 'LunchRush'
        elif 14 <= current_hour < 17:
            return 'Afternoon'
        elif 17 <= current_hour < 21:
            return 'DinnerRush'
        else:
            return 'Night'
    
    def calculate_distance(self, origin, destination):
        """
        Calculate approximate distance between two points.
        In a real implementation, you would use Google Maps Distance Matrix API.
        
        Args:
            origin (str): Starting address
            destination (str): Destination address
            
        Returns:
            float: Distance in kilometers
        """
        # Mock distance calculation - in reality, use Google Distance Matrix API
        import random
        return round(random.uniform(2.0, 12.0), 1)
    
    def _mock_traffic_duration(self):
        """Generate mock traffic duration for demonstration."""
        import random
        return random.randint(300, 1800)  # 5-30 minutes
    
    def _mock_weather_condition(self):
        """Generate mock weather condition for demonstration."""
        import random
        conditions = ['Clear', 'Clouds', 'Rain', 'Thunderstorm']
        weights = [0.4, 0.4, 0.15, 0.05]
        return random.choices(conditions, weights=weights)[0]
    
    def get_live_pricing(self, origin, destination, latitude=None, longitude=None):
        """
        Get live pricing based on current conditions.
        
        Args:
            origin (str): Starting address (e.g., restaurant location)
            destination (str): Destination address (e.g., customer address)
            latitude (float): Latitude for weather API (optional)
            longitude (float): Longitude for weather API (optional)
            
        Returns:
            dict: Pricing information including multiplier and details
        """
        print("=== Getting Live Pricing Data ===")
        
        # Get traffic duration
        print(f"Getting traffic data from {origin} to {destination}...")
        traffic_duration = self.get_traffic_duration(origin, destination)
        print(f"Traffic duration: {traffic_duration} seconds ({traffic_duration/60:.1f} minutes)")
        
        # Get weather condition
        if latitude and longitude:
            print(f"Getting weather data for coordinates ({latitude}, {longitude})...")
            weather_condition = self.get_weather_condition(latitude, longitude)
        else:
            print("No coordinates provided, using mock weather data...")
            weather_condition = self._mock_weather_condition()
        print(f"Weather condition: {weather_condition}")
        
        # Get time of day
        time_of_day = self.get_time_of_day_category()
        print(f"Time of day: {time_of_day}")
        
        # Calculate distance
        distance_km = self.calculate_distance(origin, destination)
        print(f"Distance: {distance_km} km")
        
        # Make prediction
        print("\nMaking price prediction...")
        try:
            result = subprocess.run([
                sys.executable, 'predict_price.py',
                str(distance_km),
                str(traffic_duration),
                weather_condition,
                time_of_day
            ], capture_output=True, text=True, check=True)
            
            # Parse the output to extract the multiplier
            output_lines = result.stdout.split('\n')
            multiplier_line = [line for line in output_lines if 'Predicted Price Multiplier:' in line]
            if multiplier_line:
                multiplier = float(multiplier_line[0].split(':')[1].strip())
            else:
                multiplier = 1.0
            
            return {
                'success': True,
                'multiplier': multiplier,
                'details': {
                    'distance_km': distance_km,
                    'traffic_duration_seconds': traffic_duration,
                    'weather_condition': weather_condition,
                    'time_of_day': time_of_day
                },
                'raw_output': result.stdout
            }
            
        except subprocess.CalledProcessError as e:
            return {
                'success': False,
                'error': f"Prediction failed: {e.stderr}",
                'details': {
                    'distance_km': distance_km,
                    'traffic_duration_seconds': traffic_duration,
                    'weather_condition': weather_condition,
                    'time_of_day': time_of_day
                }
            }

def demo_without_api_keys():
    """Demonstrate the system without API keys (using mock data)."""
    print("=== Dynamic Pricing API Integration Demo ===")
    print("(Using mock data - no API keys required)")
    print()
    
    # Initialize without API keys
    pricing_api = PricingAPIIntegration()
    
    # Example scenarios
    scenarios = [
        {
            'name': 'Restaurant to Customer (Vengadamangalam)',
            'origin': 'Restaurant Downtown',
            'destination': 'Vengadamangalam, Chennai',
            'latitude': 13.0827,
            'longitude': 80.2707
        },
        {
            'name': 'Restaurant to Customer (Anna Nagar)',
            'origin': 'Restaurant Downtown',
            'destination': 'Anna Nagar, Chennai',
            'latitude': 13.0843,
            'longitude': 80.2105
        }
    ]
    
    for i, scenario in enumerate(scenarios, 1):
        print(f"\n--- Scenario {i}: {scenario['name']} ---")
        
        result = pricing_api.get_live_pricing(
            scenario['origin'],
            scenario['destination'],
            scenario['latitude'],
            scenario['longitude']
        )
        
        if result['success']:
            print(f"\n✅ Prediction successful!")
            print(f"Price multiplier: {result['multiplier']:.2f}")
            
            # Calculate example pricing
            base_price = 100
            final_price = base_price * result['multiplier']
            surge_percent = (result['multiplier'] - 1) * 100
            
            print(f"Example: Base price ${base_price} → Final price ${final_price:.2f} ({surge_percent:.1f}% surge)")
        else:
            print(f"❌ Prediction failed: {result['error']}")
        
        print("-" * 50)

def demo_with_api_keys():
    """Demonstrate the system with real API keys."""
    print("=== Dynamic Pricing API Integration Demo ===")
    print("(Using real API data)")
    print()
    
    # You would set these in environment variables or config files
    google_api_key = None  # Set your Google Maps API key here
    openweather_api_key = None  # Set your OpenWeatherMap API key here
    
    if not google_api_key or not openweather_api_key:
        print("API keys not configured. Please set google_api_key and openweather_api_key.")
        print("For now, running with mock data...")
        demo_without_api_keys()
        return
    
    # Initialize with API keys
    pricing_api = PricingAPIIntegration(google_api_key, openweather_api_key)
    
    # Example with real data
    result = pricing_api.get_live_pricing(
        origin="Restaurant Downtown, Chennai",
        destination="Vengadamangalam, Chennai",
        latitude=13.0827,
        longitude=80.2707
    )
    
    if result['success']:
        print(f"✅ Live pricing calculated: {result['multiplier']:.2f}x")
    else:
        print(f"❌ Error: {result['error']}")

if __name__ == "__main__":
    print("Dynamic Pricing Model - API Integration Demo")
    print("=" * 50)
    
    # Run demo without API keys (using mock data)
    demo_without_api_keys()
    
    print("\n" + "=" * 50)
    print("To use real API data:")
    print("1. Get a Google Maps API key from: https://developers.google.com/maps/documentation/directions")
    print("2. Get an OpenWeatherMap API key from: https://openweathermap.org/api")
    print("3. Set the API keys in the demo_with_api_keys() function")
    print("4. Uncomment the demo_with_api_keys() call below")
    
    # Uncomment to run with real API keys
    # demo_with_api_keys()


