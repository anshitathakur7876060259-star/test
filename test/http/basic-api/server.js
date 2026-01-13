const express = require('express');

const app = express();
const PORT = 3000;

// In-memory storage for notes
const notes = [];

// Middleware to parse JSON
app.use(express.json());

// Error handling middleware for JSON parsing errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON' });
    }
    next(err);
});

// POST /notes - Add a new note
app.post('/notes', (req, res) => {
    try {
        // Check if request body exists and has note property
        if (!req.body || typeof req.body.note !== 'string') {
            return res.status(400).json({ 
                error: 'Invalid request. Expected JSON with "note" property as string.' 
            });
        }

        const { note } = req.body;

        // Validate note is not empty
        if (!note.trim()) {
            return res.status(400).json({ 
                error: 'Note cannot be empty' 
            });
        }

        // Add note to array with timestamp and ID
        const newNote = {
            id: notes.length + 1,
            note: note.trim(),
            createdAt: new Date().toISOString()
        };

        notes.push(newNote);

        res.status(201).json({
            success: true,
            message: 'Note added successfully',
            note: newNote
        });
    } catch (error) {
        console.error('Error adding note:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /notes - Get all notes
app.get('/notes', (req, res) => {
    try {
        res.json({
            success: true,
            count: notes.length,
            notes: notes
        });
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Root route - API information
app.get('/', (req, res) => {
    res.json({
        message: 'Basic Notes API',
        endpoints: {
            'POST /notes': 'Add a new note. Body: { "note": "Your note text" }',
            'GET /notes': 'Get all stored notes'
        },
        example: {
            method: 'POST',
            url: '/notes',
            body: { note: 'Buy milk' }
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Basic API server running at http://localhost:${PORT}`);
   
});
