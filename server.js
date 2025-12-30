const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file (for local development)
// On Heroku, environment variables are set directly in Config Vars
// Try to load from backend/.env first (when running from root), then from .env (when in backend folder)
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

// Debug: Log environment on startup
console.log('🔧 Environment Check:');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('   PORT:', process.env.PORT || '5000 (default)');
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ NOT SET');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ NOT SET');
console.log('   FRONTEND_URL:', process.env.FRONTEND_URL || 'not set');
console.log('   __dirname:', __dirname);

const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/propertyRoutes');
const leadRoutes = require('./routes/leads');
const messageRoutes = require('./routes/messages');
const appointmentRoutes = require('./routes/appointments');
const analyticsRoutes = require('./routes/analytics');
const contactRoutes = require('./routes/contact');
const settingsRoutes = require('./routes/settings');

// Initialize express app
const app = express();

// Parse FRONTEND_URL - remove trailing slash if present
const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : null;

// CORS Configuration - Allow multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  frontendUrl
].filter(Boolean); // Remove null/undefined values

console.log('🌐 Allowed CORS Origins:', allowedOrigins);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      console.log('⚠️ CORS blocked origin:', origin);
      callback(null, true); // Allow anyway for now - change to callback(new Error('Not allowed by CORS')) for strict mode
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle OPTIONS preflight for all routes
app.options('*', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware for debugging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n📥 [${timestamp}] ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  }
  
  // Log response when finished
  const originalSend = res.send;
  res.send = function(body) {
    console.log(`📤 Response: ${res.statusCode}`);
    return originalSend.call(this, body);
  };
  
  next();
});

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Real Estate Platform API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🏠 Real Estate Platform Backend                        ║
║                                                          ║
║   🌐 Server: http://localhost:${PORT}                     ║
║   🗄️  Database: MongoDB Atlas Connected                  ║
║   🔧 Environment: ${process.env.NODE_ENV || 'development'}                            ║
║                                                          ║
║   API Endpoints:                                         ║
║   - GET  /api/properties                                 ║
║   - GET  /api/properties/:id                             ║
║   - POST /api/properties                                 ║
║   - PUT  /api/properties/:id                             ║
║   - DELETE /api/properties/:id                           ║
║                                                          ║
║   Health Check: http://localhost:${PORT}/api/health       ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
    `);
  });
});

module.exports = app;
