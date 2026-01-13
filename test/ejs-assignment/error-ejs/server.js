const express = require('express');
const path = require('path');

const app = express();
const PORT = 3003; // Use a different port to avoid conflicts

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse URL-encoded data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Error rendering helper function
const renderError = (res, errorData) => {
    res.status(errorData.statusCode).render('error-layout', {
        errorData: {
            ...errorData,
            timestamp: errorData.timestamp || new Date()
        }
    });
};

// Home route
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Error Handling Demo</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 50px auto;
                    padding: 20px;
                    background: #f5f5f5;
                }
                .demo-links {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                a {
                    display: block;
                    padding: 15px;
                    background: white;
                    border-radius: 8px;
                    text-decoration: none;
                    color: #333;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    transition: transform 0.2s;
                }
                a:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                }
                h1 {
                    color: #667eea;
                }
            </style>
        </head>
        <body>
            <h1>Error Handling Demo</h1>
            <p>Click on the links below to see different error types:</p>
            <div class="demo-links">
                <a href="/test/404">404 - NOT_FOUND Error</a>
                <a href="/test/500">500 - SERVER_ERROR</a>
                <a href="/test/validation">400 - VALIDATION Error</a>
                <a href="/test/custom?status=403&message=Access%20Denied">Custom Error Example</a>
            </div>
        </body>
        </html>
    `);
});

// Test route for 404 errors
app.get('/test/404', (req, res) => {
    renderError(res, {
        errorType: 'NOT_FOUND',
        statusCode: 404,
        message: 'The page you are looking for does not exist.',
        timestamp: new Date(),
        requestUrl: req.originalUrl
    });
});

// Test route for server errors
app.get('/test/500', (req, res) => {
    renderError(res, {
        errorType: 'SERVER_ERROR',
        statusCode: 500,
        message: 'An unexpected error occurred on the server.',
        timestamp: new Date(),
        requestUrl: req.originalUrl
    });
});

// Test route for validation errors
app.get('/test/validation', (req, res) => {
    renderError(res, {
        errorType: 'VALIDATION',
        statusCode: 400,
        message: 'The form contains invalid data. Please review your inputs.',
        timestamp: new Date(),
        requestUrl: req.originalUrl
    });
});

// Custom error route
app.get('/test/custom', (req, res) => {
    const statusCode = parseInt(req.query.status) || 500;
    const message = req.query.message || 'An error occurred';
    
    let errorType = 'SERVER_ERROR';
    if (statusCode === 404) errorType = 'NOT_FOUND';
    else if (statusCode === 400) errorType = 'VALIDATION';
    
    renderError(res, {
        errorType: errorType,
        statusCode: statusCode,
        message: message,
        timestamp: new Date(),
        requestUrl: req.originalUrl
    });
});

// Simulate a validation error from POST request
app.post('/submit', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return renderError(res, {
            errorType: 'VALIDATION',
            statusCode: 400,
            message: 'Email and password are required fields.',
            timestamp: new Date(),
            requestUrl: req.originalUrl
        });
    }
    
    res.send('Form submitted successfully!');
});

// 404 handler for all unmatched routes
app.use((req, res) => {
    renderError(res, {
        errorType: 'NOT_FOUND',
        statusCode: 404,
        message: `The route "${req.originalUrl}" was not found on this server.`,
        timestamp: new Date(),
        requestUrl: req.originalUrl
    });
});

// Global error handler for server errors
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    renderError(res, {
        errorType: 'SERVER_ERROR',
        statusCode: err.statusCode || 500,
        message: err.message || 'An unexpected error occurred on the server.',
        timestamp: new Date(),
        requestUrl: req.originalUrl
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Error handling server running at http://localhost:${PORT}`);
    console.log(`\nTry these URLs:`);
    console.log(`  - http://localhost:${PORT}/ (home page with demo links)`);
    console.log(`  - http://localhost:${PORT}/test/404 (404 error)`);
    console.log(`  - http://localhost:${PORT}/test/500 (500 error)`);
    console.log(`  - http://localhost:${PORT}/test/validation (validation error)`);
    console.log(`  - http://localhost:${PORT}/any-invalid-route (404 handler)`);
});
