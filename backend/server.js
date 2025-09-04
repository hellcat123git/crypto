const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// In-memory storage
let currentPricingData = {};
let pricingHistory = [];
let activeScenarios = new Map(); // Track active scenario effects

// Cities configuration (Indian context)
const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai'];

// Get Python path from virtual environment
function getPythonPath() {
    // Try to use virtual environment Python first
    const venvPython = path.join(__dirname, '..', 'venv', 'Scripts', 'python.exe');
    if (require('fs').existsSync(venvPython)) {
        return venvPython;
    }
    // Fallback to system Python
    return 'python';
}

// Scenario event handlers
const SCENARIO_EFFECTS = {
  DEMAND_SURGE: (city) => ({ demand_level: 10, duration: 60000 }),
  FUEL_SPIKE: (city) => ({ fuel_price: 3.0, duration: 60000 }),
  TRAFFIC_JAM: (city) => ({ traffic_index: 10, duration: 60000 }),
  GLOBAL_CRISIS: (city) => ({ 
    fuel_price: 3.0, 
    traffic_index: 10, 
    demand_level: 10, 
    duration: 60000 
  })
};

// Function to call Python ML model with explainability
function getPriceMultiplier(fuelPrice, trafficIndex, demandLevel) {
    return new Promise((resolve, reject) => {
        const pythonPath = getPythonPath();
        console.log(`Using Python from: ${pythonPath}`);
        
        const pythonProcess = spawn(pythonPath, [
            path.join(__dirname, 'ml_model', 'predict.py'),
            fuelPrice.toString(),
            trafficIndex.toString(),
            demandLevel.toString()
        ]);
        
        let result = '';
        let error = '';
        
        pythonProcess.stdout.on('data', (data) => {
            result += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
        });
        
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Python process exited with code ${code}: ${error}`));
            } else {
                try {
                    const lines = result.trim().split('\n');
                    const priceMultiplier = parseFloat(lines[0]);
                    const explanation = lines[1] || 'Price calculated based on current market conditions.';
                    
                    if (isNaN(priceMultiplier)) {
                        reject(new Error('Invalid price multiplier returned from Python'));
                    } else {
                        resolve({ priceMultiplier, explanation });
                    }
                } catch (parseError) {
                    reject(new Error(`Failed to parse price multiplier: ${parseError.message}`));
                }
            }
        });
        
        pythonProcess.on('error', (error) => {
            reject(new Error(`Failed to start Python process: ${error.message}`));
        });
    });
}

// Mock data simulator service
async function generateMockData() {
    const newData = {};
    
    for (const city of CITIES) {
        try {
            // Check for active scenario effects
            let fuelPrice = 1.50 + Math.random() * 1.00; // $1.50 - $2.50
            let trafficIndex = Math.floor(1 + Math.random() * 10); // 1-10
            let demandLevel = Math.floor(1 + Math.random() * 10); // 1-10
            
            // Apply scenario effects if active
            const activeScenario = activeScenarios.get(city);
            if (activeScenario) {
                if (activeScenario.fuel_price) fuelPrice = activeScenario.fuel_price;
                if (activeScenario.traffic_index) trafficIndex = activeScenario.traffic_index;
                if (activeScenario.demand_level) demandLevel = activeScenario.demand_level;
            }
            
            // Call Python ML model to get price multiplier and explanation
            const { priceMultiplier, explanation } = await getPriceMultiplier(fuelPrice, trafficIndex, demandLevel);
            
            const cityData = {
              fuel_price: parseFloat(fuelPrice.toFixed(2)),
              traffic_index: trafficIndex,
              demand_level: demandLevel,
              price_multiplier: parseFloat(priceMultiplier.toFixed(3)),
              explanation: explanation,
              timestamp: new Date().toISOString()
            };
            
            newData[city] = cityData;
            currentPricingData[city] = cityData;
            
            // Add to history
            pricingHistory.push({
              city,
              ...cityData
            });
            
            // Keep only last 100 entries
            if (pricingHistory.length > 100) {
              pricingHistory = pricingHistory.slice(-100);
            }
            
        } catch (error) {
            console.error(`Error getting price multiplier for ${city}:`, error);
            // Fallback calculation if ML model fails
            const fallbackMultiplier = 1.0 + (fuelPrice - 1.5) * 0.2 + (trafficIndex - 5.5) * 0.05 + (demandLevel - 5.5) * 0.08;
            
            const cityData = {
              fuel_price: parseFloat(fuelPrice.toFixed(2)),
              traffic_index: trafficIndex,
              demand_level: demandLevel,
              price_multiplier: parseFloat(fallbackMultiplier.toFixed(3)),
              explanation: 'Price calculated using fallback algorithm due to ML model unavailability.',
              timestamp: new Date().toISOString()
            };
            
            newData[city] = cityData;
            currentPricingData[city] = cityData;
            
            pricingHistory.push({
              city,
              ...cityData
            });
            
            if (pricingHistory.length > 100) {
              pricingHistory = pricingHistory.slice(-100);
            }
        }
    }
    
    // Emit real-time update to all connected clients
    io.emit('pricing-update', newData);
    
    console.log('Mock data updated at:', new Date().toLocaleTimeString());
}

// Start mock data generation every 5 seconds
setInterval(generateMockData, 5000);

// Generate initial data
generateMockData();

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Send current data to newly connected client
    socket.emit('pricing-update', currentPricingData);
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// API Routes
app.get('/api/pricing/history', (req, res) => {
    res.json(pricingHistory);
});

// Scenario control endpoint
app.post('/api/scenario', (req, res) => {
    const { eventType, city } = req.body;
    
    if (!eventType || !city) {
        return res.status(400).json({ error: 'eventType and city are required' });
    }
    
    if (!SCENARIO_EFFECTS[eventType]) {
        return res.status(400).json({ error: 'Invalid event type' });
    }
    
    if (!CITIES.includes(city)) {
        return res.status(400).json({ error: 'Invalid city' });
    }
    
    try {
        const effects = SCENARIO_EFFECTS[eventType](city);
        
        // Apply scenario effects
        activeScenarios.set(city, effects);
        
        // Remove scenario after duration
        setTimeout(() => {
            activeScenarios.delete(city);
            console.log(`Scenario ${eventType} for ${city} has ended`);
        }, effects.duration);
        
        console.log(`Applied scenario ${eventType} to ${city} for ${effects.duration}ms`);
        
        res.json({ 
            success: true, 
            message: `Scenario ${eventType} applied to ${city}`,
            effects,
            duration: effects.duration
        });
        
    } catch (error) {
        console.error('Error applying scenario:', error);
        res.status(500).json({ error: 'Failed to apply scenario' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
server.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`WebSocket server initialized`);
    console.log(`Mock data simulator started - updating every 5 seconds`);
    console.log(`Monitoring cities: ${CITIES.join(', ')}`);
    console.log(`Python path: ${getPythonPath()}`);
});
