const http = require('http');
const url = require('url');

const PORT = 3000;

// In-memory storage for notes
const notes = [];

// Helper function to send JSON response
function sendJSON(res, statusCode, data) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = statusCode;
    res.end(JSON.stringify(data));
}

// Helper function to parse request body
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            if (!body) {
                return resolve(null);
            }
            
            try {
                const parsed = JSON.parse(body);
                resolve(parsed);
            } catch (error) {
                reject(error);
            }
        });
        
        req.on('error', error => {
            reject(error);
        });
    });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }

    // Parse URL
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // POST /notes - Add a new note
    if (pathname === '/notes' && method === 'POST') {
        try {
            // Parse request body
            const body = await parseBody(req);
            
            // Check if JSON is invalid (parseBody throws error for invalid JSON)
            // This is handled in the catch block below
            
            // Check if request body exists and has note property
            if (!body || typeof body.note !== 'string') {
                return sendJSON(res, 400, { 
                    error: 'Invalid request. Expected JSON with "note" property as string.' 
                });
            }

            const { note } = body;

            // Validate note is not empty
            if (!note.trim()) {
                return sendJSON(res, 400, { 
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

            sendJSON(res, 201, {
                success: true,
                message: 'Note added successfully',
                note: newNote
            });
        } catch (error) {
            // Handle JSON parsing errors
            if (error instanceof SyntaxError || error.message.includes('JSON')) {
                return sendJSON(res, 400, { error: 'Invalid JSON' });
            }
            console.error('Error adding note:', error);
            sendJSON(res, 500, { error: 'Internal server error' });
        }
        return;
    }

    // GET /notes - Get all notes
    if (pathname === '/notes' && method === 'GET') {
        try {
            sendJSON(res, 200, {
                success: true,
                count: notes.length,
                notes: notes
            });
        } catch (error) {
            console.error('Error fetching notes:', error);
            sendJSON(res, 500, { error: 'Internal server error' });
        }
        return;
    }

    // Root route - API information
    if (pathname === '/' && method === 'GET') {
        sendJSON(res, 200, {
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
        return;
    }

    // 404 Not Found
    sendJSON(res, 404, { error: 'Not Found' });
});

// Start server
server.listen(PORT, () => {
    console.log(`Basic API server running at http://localhost:${PORT}`);
    console.log(`\nEndpoints:`);
    console.log(`  POST http://localhost:${PORT}/notes - Add a note`);
    console.log(`  GET  http://localhost:${PORT}/notes - Get all notes`);
    console.log(`\nExample:`);
    console.log(`  curl -X POST http://localhost:${PORT}/notes \\`);
    console.log(`       -H "Content-Type: application/json" \\`);
    console.log(`       -d '{"note": "Buy milk"}'`);
});
