const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory structure exists
const uploadsDir = path.join(__dirname, 'uploads');
const profilePicsDir = path.join(uploadsDir, 'profile_pics');
const documentsDir = path.join(uploadsDir, 'documents');
const othersDir = path.join(uploadsDir, 'others');

[uploadsDir, profilePicsDir, documentsDir, othersDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Custom file filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.docx'];
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.params.userId;
    let uploadPath = '';
    
    // Determine destination based on fieldname
    if (file.fieldname === 'profilePic') {
      uploadPath = path.join(profilePicsDir, userId);
    } else if (file.fieldname === 'docs') {
      uploadPath = path.join(documentsDir, userId);
    } else if (file.fieldname === 'others') {
      uploadPath = path.join(othersDir, userId);
    } else {
      return cb(new Error('Unexpected field'), null);
    }
    
    // Create user-specific directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const userId = req.params.userId;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    
    // Format: <fieldname>-<userId>-<timestamp>-<originalname>
    const filename = `${file.fieldname}-${userId}-${timestamp}-${nameWithoutExt}${ext}`;
    cb(null, filename);
  }
});

// Configure multer with limits and fileFilter
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// POST /upload/:userId - Upload files
app.post('/upload/:userId', upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'docs', maxCount: 10 },
  { name: 'others', maxCount: 10 }
]), (req, res) => {
  try {
    const uploaded = {};
    
    if (req.files.profilePic) {
      uploaded.profilePic = req.files.profilePic[0].path.replace(/\\/g, '/');
    }
    
    if (req.files.docs) {
      uploaded.docs = req.files.docs.map(file => file.path.replace(/\\/g, '/'));
    }
    
    if (req.files.others) {
      uploaded.others = req.files.others.map(file => file.path.replace(/\\/g, '/'));
    }
    
    res.status(200).json({
      message: 'Files uploaded successfully!',
      uploaded: uploaded
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /files/:userId - List all files for a user
app.get('/files/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    const files = [];
    
    // Check all three directories for user files
    const userDirs = [
      path.join(profilePicsDir, userId),
      path.join(documentsDir, userId),
      path.join(othersDir, userId)
    ];
    
    userDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        const dirFiles = fs.readdirSync(dir);
        dirFiles.forEach(file => {
          const filePath = path.join(dir, file);
          // Get relative path from project root
          const relativePath = path.relative(__dirname, filePath).replace(/\\/g, '/');
          files.push(relativePath);
        });
      }
    });
    
    res.status(200).json({
      userId: userId,
      files: files
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /delete/:userId/:filename - Delete a file
app.delete('/delete/:userId/:filename', (req, res) => {
  try {
    const userId = req.params.userId;
    const filename = req.params.filename;
    
    // Search in all three directories
    const userDirs = [
      path.join(profilePicsDir, userId),
      path.join(documentsDir, userId),
      path.join(othersDir, userId)
    ];
    
    let fileFound = false;
    let filePath = '';
    
    for (const dir of userDirs) {
      const potentialPath = path.join(dir, filename);
      if (fs.existsSync(potentialPath)) {
        filePath = potentialPath;
        fileFound = true;
        break;
      }
    }
    
    if (!fileFound) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    fs.unlinkSync(filePath);
    
    res.status(200).json({
      message: 'File deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware for multer errors
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds the limit' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files uploaded' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected field' });
    }
    return res.status(400).json({ error: error.message });
  }
  
  if (error.message === 'Invalid file type') {
    return res.status(400).json({ error: 'Invalid file type' });
  }
  
  if (error.message === 'Unexpected field') {
    return res.status(400).json({ error: 'Unexpected field' });
  }
  
  res.status(500).json({ error: error.message || 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`FileManager server is running on http://localhost:${PORT}`);
  console.log(`Static files available at http://localhost:${PORT}/uploads/`);
});
