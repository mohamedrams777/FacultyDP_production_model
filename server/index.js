require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/auth');
const facultyRoutes = require('./routes/faculty');
const adminRoutes = require('./routes/admin');
const hodRoutes = require('./routes/hod');
const eventRoutes = require('./routes/events');
const auditRoutes = require('./routes/audit');

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads', 'certificates');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✓ Created uploads directory:', uploadsDir);
}

// Async error wrapper helper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// MongoDB connection - REQUIRES Cloud MongoDB Atlas
// You MUST set MONGODB_URI in .env file with your MongoDB Atlas connection string
// Create server/.env file and add: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/FDP
// See MONGODB_ATLAS_SETUP.md for detailed setup instructions
const MONGODB_URI = process.env.MONGODB_URI;

async function connectMongoDB() {
  try {
    if (!MONGODB_URI) {
      console.error('✗ MongoDB connection string not found!');
      console.error('');
      console.error('  ⚠️  This application requires MongoDB Atlas (Cloud Database)');
      console.error('');
      console.error('  📋 Setup Steps:');
      console.error('  1. Create server/.env file (copy from env.example if exists)');
      console.error('  2. Get MongoDB Atlas connection string:');
      console.error('     - Go to https://www.mongodb.com/cloud/atlas');
      console.error('     - Create free account and cluster');
      console.error('     - Get connection string from Connect → Drivers');
      console.error('  3. Add to server/.env file:');
      console.error('     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/FDP');
      console.error('');
      console.error('  📖 See MONGODB_ATLAS_SETUP.md for detailed instructions');
      console.error('');
      console.error('  ❌ Server cannot start without MongoDB connection');
      process.exit(1);
    }

    // Validate connection string format
    if (!MONGODB_URI.includes('mongodb+srv://') && !MONGODB_URI.includes('mongodb://')) {
      console.error('✗ Invalid MongoDB connection string format!');
      console.error('  Use format: mongodb+srv://username:password@cluster.mongodb.net/FDP');
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB successfully');
    console.log('  Database:', mongoose.connection.db.databaseName);
    
    // Hide connection string credentials in logs
    const displayUri = MONGODB_URI.includes('@') 
      ? MONGODB_URI.split('@')[0].split('://')[0] + '://***@' + MONGODB_URI.split('@')[1]
      : MONGODB_URI;
    console.log('  Connection:', displayUri);
    
    if (MONGODB_URI.includes('mongodb+srv://')) {
      console.log('  Type: ☁️  Cloud (MongoDB Atlas)');
      console.log('  ✓ Using cloud database - no local MongoDB required');
    } else {
      console.log('  Type: 💻 Remote MongoDB');
      console.log('  ℹ️  Recommend using MongoDB Atlas (mongodb+srv://) for better security');
    }
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('✗ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠ MongoDB disconnected - attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✓ MongoDB reconnected');
    });
  } catch (err) {
    console.error('✗ MongoDB connection failed:', err.message);
    console.error('');
    
    if (MONGODB_URI && MONGODB_URI.includes('mongodb+srv://')) {
      console.error('  🔍 MongoDB Atlas Connection Troubleshooting:');
      console.error('  1. Verify connection string format:');
      console.error('     mongodb+srv://username:password@cluster.mongodb.net/FDP');
      console.error('  2. Check Atlas Network Access → Whitelist your IP address');
      console.error('  3. Verify database username and password are correct');
      console.error('  4. Ensure cluster is running (not paused)');
      console.error('  5. Check if password contains special characters (URL encode if needed)');
    } else {
      console.error('  🔍 Connection String Issues:');
      console.error('  1. Use MongoDB Atlas format: mongodb+srv://username:password@cluster.mongodb.net/FDP');
      console.error('  2. Make sure to include database name: /FDP');
      console.error('  3. Get connection string from MongoDB Atlas dashboard');
    }
    
    console.error('');
    console.error('  📖 See MONGODB_ATLAS_SETUP.md for complete setup guide');
    console.error('');
    console.error('  ❌ Server cannot start without valid MongoDB connection');
    process.exit(1);
  }
}

// Start MongoDB connection
connectMongoDB();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hod', hodRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/audit', auditRoutes);

// 404 handler (must come after all routes)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware (must be last, with 4 parameters)
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);
  console.error('Error stack:', err.stack);
  console.error('Error message:', err.message);
  
  // Don't send response if headers already sent
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(err.status || 500).json({ 
    error: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
