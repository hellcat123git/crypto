"""
Production System Demo
Demonstrates the complete MLOps workflow from data generation to live predictions.
"""

import subprocess
import sys
import time
import requests
import json
from datetime import datetime

def run_command(command, description):
    """Run a command and display the result."""
    print(f"\n{'='*60}")
    print(f"🔄 {description}")
    print(f"{'='*60}")
    print(f"Command: {command}")
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Success!")
            if result.stdout:
                print("Output:")
                print(result.stdout)
        else:
            print("❌ Error!")
            if result.stderr:
                print("Error:")
                print(result.stderr)
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

def test_api_endpoint(base_url="http://localhost:8000"):
    """Test the API endpoints."""
    print(f"\n{'='*60}")
    print("🌐 Testing API Endpoints")
    print(f"{'='*60}")
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")
    
    # Test prediction endpoint
    try:
        prediction_data = {
            "distance_km": 5.2,
            "traffic_duration_seconds": 1200,
            "weather_condition": "Rain",
            "time_of_day": "DinnerRush",
            "is_holiday": False
        }
        
        response = requests.post(
            f"{base_url}/predict",
            json=prediction_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print("✅ Prediction API working")
            result = response.json()
            print(f"Price multiplier: {result['price_multiplier']}")
            print(f"Final price: ${result['final_price']}")
            print(f"Surge: {result['surge_percentage']}%")
        else:
            print(f"❌ Prediction API failed: {response.status_code}")
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"❌ Prediction API error: {e}")
    
    # Test stats endpoint
    try:
        response = requests.get(f"{base_url}/stats?days=7")
        if response.status_code == 200:
            print("✅ Stats API working")
            stats = response.json()
            print(f"Total predictions: {stats['statistics'].get('total_predictions', 0)}")
        else:
            print(f"❌ Stats API failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Stats API error: {e}")

def main():
    """Main demo function."""
    print("🚀 Dynamic Pricing Model - Production System Demo")
    print("=" * 60)
    print("This demo will walk through the complete MLOps workflow:")
    print("1. Generate training data")
    print("2. Train the model with MLflow tracking")
    print("3. Start the FastAPI web service")
    print("4. Test API endpoints")
    print("5. Demonstrate demand forecasting")
    print("=" * 60)
    
    # Step 1: Generate training data
    if not run_command("python generate_data.py", "Generating synthetic training data"):
        print("❌ Failed to generate training data. Exiting.")
        return
    
    # Step 2: Train the model
    if not run_command("python train_model.py", "Training model with MLflow tracking"):
        print("❌ Failed to train model. Exiting.")
        return
    
    # Step 3: Start the web service (in background)
    print(f"\n{'='*60}")
    print("🌐 Starting FastAPI Web Service")
    print(f"{'='*60}")
    print("Starting server in background...")
    print("You can access the API at: http://localhost:8000")
    print("API documentation: http://localhost:8000/docs")
    
    # Start the server
    server_process = subprocess.Popen([
        sys.executable, "-m", "uvicorn", 
        "app:app", 
        "--host", "0.0.0.0", 
        "--port", "8000"
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    # Wait for server to start
    print("Waiting for server to start...")
    time.sleep(5)
    
    # Step 4: Test API endpoints
    test_api_endpoint()
    
    # Step 5: Demonstrate demand forecasting
    print(f"\n{'='*60}")
    print("📊 Demonstrating Demand Forecasting")
    print(f"{'='*60}")
    print("Running demand forecasting module...")
    
    if run_command("python forecast_demand.py", "Generating demand forecasts"):
        print("✅ Demand forecasting completed")
        print("Check 'demand_forecast.png' for visualization")
        print("Check 'demand_forecast.csv' for forecast data")
    
    # Step 6: Show MLflow UI
    print(f"\n{'='*60}")
    print("📈 MLflow Experiment Tracking")
    print(f"{'='*60}")
    print("To view experiment results, run:")
    print("mlflow ui")
    print("Then open: http://localhost:5000")
    
    # Final summary
    print(f"\n{'='*60}")
    print("🎉 Demo Complete!")
    print(f"{'='*60}")
    print("✅ Training data generated")
    print("✅ Model trained with MLflow tracking")
    print("✅ FastAPI web service running")
    print("✅ API endpoints tested")
    print("✅ Demand forecasting demonstrated")
    print("\nNext steps:")
    print("1. View API docs: http://localhost:8000/docs")
    print("2. View MLflow UI: mlflow ui (then http://localhost:5000)")
    print("3. Check prediction logs in database")
    print("4. Integrate with your application using the API")
    
    # Keep server running
    print(f"\n🔄 FastAPI server is running in the background")
    print("Press Ctrl+C to stop the demo and server")
    
    try:
        server_process.wait()
    except KeyboardInterrupt:
        print("\n🛑 Stopping demo...")
        server_process.terminate()
        print("✅ Demo stopped successfully")

if __name__ == "__main__":
    main()


