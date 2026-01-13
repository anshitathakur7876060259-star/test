const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Secret key for JWT (in production, use environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
// JWT expiration time: 30 minutes (in seconds)
const JWT_EXPIRATION = 30 * 60; // 30 minutes

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Mock user database (in production, use a real database)
const users = [
  { id: 1, username: 'admin', password: 'admin123' },
  { id: 2, username: 'user', password: 'user123' }
];

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Find user
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid username or password' 
    });
  }

  // Generate JWT token with 30-minute expiration
  const token = jwt.sign(
    { 
      id: user.id, 
      username: user.username 
    },
    JWT_SECRET,
    { 
      expiresIn: JWT_EXPIRATION // 30 minutes
    }
  );

  res.json({
    success: true,
    message: 'Login successful',
    token: token,
    user: {
      id: user.id,
      username: user.username
    }
  });
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided. Please login.',
      expired: false
    });
  }

  try {
    // Verify token and check expiration
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      // Token has expired
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please login again.',
        expired: true
      });
    } else if (error.name === 'JsonWebTokenError') {
      // Invalid token
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.',
        expired: false
      });
    } else {
      // Other errors
      return res.status(401).json({
        success: false,
        message: 'Token verification failed. Please login again.',
        expired: false
      });
    }
  }
};

// Protected route example
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'This is a protected route',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Get user profile (protected route)
app.get('/api/profile', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user,
    message: 'Profile retrieved successfully'
  });
});

// Serve index page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`JWT expiration time: ${JWT_EXPIRATION / 60} minutes`);
});
