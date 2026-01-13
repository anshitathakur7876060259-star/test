const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Read user credentials from user.json
function getUsers() {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'user.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading user.json:', error);
    return [];
  }
}

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.username) {
    return next();
  }
  res.redirect('/login');
}

// Routes
app.get('/', (req, res) => {
  if (req.session && req.session.username) {
    // Redirect based on role
    if (req.session.role === 'admin') {
      return res.redirect('/adminhome');
    } else {
      return res.redirect('/userhome');
    }
  }
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  if (req.session && req.session.username) {
    // Already logged in, redirect to appropriate page
    if (req.session.role === 'admin') {
      return res.redirect('/adminhome');
    } else {
      return res.redirect('/userhome');
    }
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username and password are required' 
    });
  }

  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    // Create session
    req.session.username = user.username;
    req.session.role = user.role;
    req.session.loginTimestamp = new Date().toISOString();

    res.json({ 
      success: true, 
      role: user.role,
      message: 'Login successful' 
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid username or password' 
    });
  }
});

app.get('/adminhome', requireAuth, (req, res) => {
  if (req.session.role !== 'admin') {
    return res.status(403).send('Access denied. Admin privileges required.');
  }
  res.sendFile(path.join(__dirname, 'public', 'adminhome.html'));
});

app.get('/userhome', requireAuth, (req, res) => {
  if (req.session.role !== 'user') {
    return res.status(403).send('Access denied. User privileges required.');
  }
  res.sendFile(path.join(__dirname, 'public', 'userhome.html'));
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/login');
  });
});

app.get('/session-info', requireAuth, (req, res) => {
  res.json({
    username: req.session.username,
    role: req.session.role,
    loginTimestamp: req.session.loginTimestamp
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
