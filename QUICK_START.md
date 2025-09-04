# 🚀 AI Dynamic Pricing Simulator - Quick Start Guide

## ✅ **Prerequisites Checked & Installed**
- ✅ Node.js v22.18.0
- ✅ npm v10.9.3  
- ✅ Python 3.10.4
- ✅ pip v25.2
- ✅ Virtual Environment Created
- ✅ All Dependencies Installed
- ✅ ML Model Trained

## 🎯 **How to Start the Application**

### **Option 1: One-Click Startup (Recommended)**
1. **Double-click** `START_APP.bat` in your project folder
2. **OR** Right-click `start_application.ps1` → "Run with PowerShell"

### **Option 2: Manual Startup**
1. Open PowerShell in your project folder
2. Run: `.\start_application.ps1`

## 🌐 **Access Points**

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend Dashboard** | http://localhost:5173 | Main application interface |
| **Backend API** | http://localhost:3001 | REST API server |
| **Health Check** | http://localhost:3001/health | Server status |

## 📊 **API Endpoints**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/pricing` | GET | Current pricing for all cities |
| `/api/pricing/history` | GET | Historical pricing data (last 100 entries) |
| `/health` | GET | Server health status |

## 🔄 **How the Project Works**

### **1. Data Generation (Backend)**
- **Mock Data Simulator** runs every 5 seconds
- Generates realistic data for 5 cities:
  - **New York, London, Tokyo, Sydney, Mumbai**
- Each city gets:
  - `fuel_price`: $1.50 - $2.50 per liter
  - `traffic_index`: 1-10 scale (1=no traffic, 10=standstill)
  - `demand_level`: 1-10 scale (1=low demand, 10=very high)

### **2. AI Pricing Model (Python)**
- **Gradient Boosting Regressor** calculates price multipliers
- Model trained on 1000 synthetic samples
- Features: fuel_price, traffic_index, demand_level
- Output: price_multiplier (0.8x - 2.0x)
- **Model Performance**: R² = 0.937 (93.7% accuracy)

### **3. Price Calculation**
- **Base Service Price**: $10.00
- **Final Price** = Base Price × AI Price Multiplier
- **Example**: $10.00 × 1.45 = $14.50

### **4. Real-time Updates**
- **Backend**: Generates new data every 5 seconds
- **Frontend**: Polls API every 5 seconds
- **UI**: Smooth animations and real-time charts

## 🎨 **Frontend Features**

### **Dashboard Layout**
- **Left Sidebar**: Navigation and theme toggle
- **Header**: Live indicator with pulsing green dot
- **Main Area**: City cards grid and pricing charts

### **City Cards**
- Display city name and final calculated price
- Show all three input factors with color coding:
  - 🔵 **Fuel Price**: Blue (cost impact)
  - 🟠 **Traffic Index**: Orange (congestion impact)
  - 🟢 **Demand Level**: Green (market impact)
- Click to select city for detailed view

### **Interactive Charts**
- **Line Charts** showing last 5 minutes of data
- **Multiple Metrics**: Price multiplier, fuel price, traffic, demand
- **Real-time Updates**: Data refreshes automatically
- **Responsive Design**: Works on all screen sizes

### **Theme System**
- **Dark Theme**: Default (professional look)
- **Light Theme**: Toggle in sidebar
- **Smooth Transitions**: Between theme changes

## 🔧 **Technical Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Python ML     │
│   (React)       │◄──►│   (Node.js)     │◄──►│   Model         │
│                 │    │                 │    │                 │
│ • City Cards    │    │ • Mock Data     │    │ • Predictions   │
│ • Charts        │    │ • API Endpoints │    │ • Model Loading │
│ • Real-time UI  │    │ • Data Storage  │    │ • Scikit-learn  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📱 **Responsive Design**
- **Desktop**: Full dashboard with 5-column city grid
- **Tablet**: 3-column grid layout
- **Mobile**: Single-column stack layout
- **All Devices**: Touch-friendly interactions

## 🚨 **Troubleshooting**

### **If Backend Won't Start**
```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001

# Kill process if needed
taskkill /PID [PID_NUMBER] /F
```

### **If Frontend Won't Start**
```bash
# Check if port 5173 is in use
netstat -ano | findstr :5173

# Kill process if needed
taskkill /PID [PID_NUMBER] /F
```

### **If ML Model Fails**
```bash
# Reinstall Python dependencies
cd backend\ml_model
pip install -r requirements.txt

# Retrain model
python train.py
```

### **If Dependencies Are Missing**
```bash
# Reinstall backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Reinstall frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 🎯 **Success Indicators**

✅ **Backend Running**: Shows "Mock data updated at: [time]" every 5 seconds  
✅ **Frontend Running**: Shows "VITE ready" message  
✅ **Dashboard Loads**: City cards display pricing data  
✅ **Charts Work**: Click city to see pricing history  
✅ **Real-time Updates**: Data refreshes automatically  

## 💡 **Pro Tips**

1. **Keep Both Terminals Open**: Servers stop when terminals close
2. **Click City Cards**: View detailed pricing charts
3. **Watch Live Updates**: Data changes every 5 seconds
4. **Toggle Themes**: Use sidebar for light/dark mode
5. **Monitor Console**: Check for any error messages

## 🎉 **You're Ready!**

Your AI Dynamic Pricing Simulator is now fully configured and ready to run! 

**Just double-click `START_APP.bat` and enjoy the real-time AI-powered pricing dashboard!**
