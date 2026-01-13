const express = require('express');
const path = require('path');

const app = express();
const PORT = 3005; // Use a different port to avoid conflicts

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse URL-encoded data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sample student data
const students = [
    { name: "Rahul", marks: { math: 80, science: 90, english: 70 } },
    { name: "Priya", marks: { math: 60, science: 75, english: 85 } },
    { name: "Aman", marks: { math: 95, science: 88, english: 92 } }
];

// Extended sample data for additional examples
const extendedStudents = [
    { name: "Rahul", marks: { math: 80, science: 90, english: 70 } },
    { name: "Priya", marks: { math: 60, science: 75, english: 85 } },
    { name: "Aman", marks: { math: 95, science: 88, english: 92 } },
    { name: "Sneha", marks: { math: 45, science: 65, english: 55 } },
    { name: "Vikram", marks: { math: 72, science: 78, english: 68 } },
    { name: "Anjali", marks: { math: 88, science: 92, english: 85 } }
];

// Main route - Student Report
app.get('/', (req, res) => {
    res.render('student-report', { students });
});

// Extended example route
app.get('/extended', (req, res) => {
    res.render('student-report', { students: extendedStudents });
});

// Home page with navigation
app.get('/home', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Student Report - Home</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 50px auto;
                    padding: 20px;
                    background: #f5f5f5;
                }
                .nav-links {
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
                    margin-bottom: 20px;
                }
                .info {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <h1>Student Report System</h1>
            <div class="info">
                <p><strong>Features:</strong></p>
                <ul>
                    <li>Displays student names and marks in Math, Science, and English</li>
                    <li>Uses forEach to loop through the student list</li>
                    <li>Marks below 70 are highlighted in red</li>
                </ul>
            </div>
            <div class="nav-links">
                <a href="/">Default Report (3 students)</a>
                <a href="/extended">Extended Report (6 students)</a>
            </div>
        </body>
        </html>
    `);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Student Report server running at http://localhost:${PORT}`);
    console.log(`\nTry these URLs:`);
    console.log(`  - http://localhost:${PORT}/ (default report with 3 students)`);
    console.log(`  - http://localhost:${PORT}/home (navigation page)`);
    console.log(`  - http://localhost:${PORT}/extended (extended report with 6 students)`);
});
