const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs').promises;
const assignmentRoutes = require('./routes/assignments');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/professor', authMiddleware, assignmentRoutes);

// Home route
app.get('/', (req, res) => {
  res.redirect('/professor/assignments');
});

// Initialize data directory
async function initDataDir() {
  try {
    await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
    await fs.mkdir(path.join(__dirname, 'uploads'), { recursive: true });
    
    // Initialize data files if they don't exist
    const assignmentsFile = path.join(__dirname, 'data', 'assignments.json');
    const historyFile = path.join(__dirname, 'data', 'history.json');
    const notificationsFile = path.join(__dirname, 'data', 'notifications.json');
    const otpFile = path.join(__dirname, 'data', 'otp.json');
    
    try {
      await fs.access(assignmentsFile);
    } catch {
      await fs.writeFile(assignmentsFile, JSON.stringify([]));
    }
    
    try {
      await fs.access(historyFile);
    } catch {
      await fs.writeFile(historyFile, JSON.stringify([]));
    }
    
    try {
      await fs.access(notificationsFile);
    } catch {
      await fs.writeFile(notificationsFile, JSON.stringify([]));
    }
    
    try {
      await fs.access(otpFile);
    } catch {
      await fs.writeFile(otpFile, JSON.stringify([]));
    }
  } catch (error) {
    console.error('Error initializing data directory:', error);
  }
}

// Start server
app.listen(PORT, async () => {
  await initDataDir();
  console.log(`Server running on http://localhost:${PORT}`);
});
