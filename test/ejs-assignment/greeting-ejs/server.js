const express = require('express');
const path = require('path');

const app = express();
const PORT = 3002; // Use a different port to avoid conflicts

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Route to display greeting
// Example: /greeting?userName=John%20Doe&isLoggedIn=true
app.get('/greeting', (req, res) => {
    const userName = req.query.userName || 'Guest';
    const isLoggedIn = req.query.isLoggedIn === 'true' || req.query.isLoggedIn === true;
    
    res.render('greeting', {
        userName: userName,
        isLoggedIn: isLoggedIn
    });
});

// Route with example data for logged in user
app.get('/', (req, res) => {
    res.render('greeting', {
        userName: 'John Doe',
        isLoggedIn: true
    });
});

// Route with example data for logged out user
app.get('/logout', (req, res) => {
    res.render('greeting', {
        userName: '',
        isLoggedIn: false
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Greeting server running at http://localhost:${PORT}`);
    console.log(`\nTry these URLs:`);
    console.log(`  - http://localhost:${PORT}/ (logged in example)`);
    console.log(`  - http://localhost:${PORT}/logout (logged out example)`);
    console.log(`  - http://localhost:${PORT}/greeting?userName=Jane%20Smith&isLoggedIn=true`);
    console.log(`  - http://localhost:${PORT}/greeting?userName=Guest&isLoggedIn=false`);
});
