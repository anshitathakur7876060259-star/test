const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001; // Using different port to avoid conflict with jwt

// Secret key for JWT (in production, use environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// Helper function to read users from user.json
function getUsers() {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'data', 'user.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading user.json:', error);
    return [];
  }
}

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required'
    });
  }

  // Read users from user.json
  const users = getUsers();
  
  // Find user with matching credentials
  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid username or password'
    });
  }

  // Generate JWT token containing username, login timestamp, and role
  const loginTimestamp = new Date().toISOString();
  const token = jwt.sign(
    {
      username: user.username,
      loginTimestamp: loginTimestamp,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: '24h' // Token expires in 24 hours
    }
  );

  // Set JWT in HTTP-only cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  });

  res.json({
    success: true,
    message: 'Login successful',
    role: user.role,
    redirect: user.role === 'admin' ? '/adminhome.html' : '/userhome.html'
  });
});

// Middleware to verify JWT token from cookie
const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided. Please login.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please login again.',
        expired: true
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }
  }
};

// Protected route to get user info
app.get('/api/user', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: {
      username: req.user.username,
      role: req.user.role,
      loginTimestamp: req.user.loginTimestamp
    }
  });
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  res.clearCookie('jwt');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve admin home page (protected)
app.get('/adminhome.html', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  res.sendFile(path.join(__dirname, 'public', 'adminhome.html'));
});

// Serve user home page (protected)
app.get('/userhome.html', verifyToken, (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. User role required.'
    });
  }
  res.sendFile(path.join(__dirname, 'public', 'userhome.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`JWT authentication with role-based redirection`);
});
