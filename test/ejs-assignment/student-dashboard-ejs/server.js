const express = require('express');
const path = require('path');

const app = express();
const PORT = 3004; // Use a different port to avoid conflicts

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse URL-encoded data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sample student data
const sampleStudents = [
    {
        name: "John Doe",
        email: "John@example.com",
        role: "admin",
        courses: [
            { title: "Web Development", grade: "A" },
            { title: "Database Systems", grade: "B" },
            { title: "Operating Systems", grade: "D" }
        ]
    },
    {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        role: "student",
        courses: [
            { title: "Data Structures", grade: "A" },
            { title: "Algorithms", grade: "C" }
        ]
    },
    {
        name: "Bob Johnson",
        email: "bob.johnson@example.com",
        role: "student",
        courses: []
    }
];

// Main dashboard route
app.get('/', (req, res) => {
    // Use the first student (admin) as default
    const student = sampleStudents[0];
    
    res.render('dashboard', {
        student: {
            name: student.name,
            email: student.email,
            role: student.role
        },
        courses: student.courses,
        notice: "<b>Important Notice</b>"
    });
});

// Route to view different students
app.get('/student/:id', (req, res) => {
    const studentId = parseInt(req.params.id) || 0;
    const student = sampleStudents[studentId] || sampleStudents[0];
    
    res.render('dashboard', {
        student: {
            name: student.name,
            email: student.email,
            role: student.role
        },
        courses: student.courses,
        notice: "<b>Important Notice</b>"
    });
});

// Route to view dashboard without notice
app.get('/no-notice', (req, res) => {
    const student = sampleStudents[0];
    
    res.render('dashboard', {
        student: {
            name: student.name,
            email: student.email,
            role: student.role
        },
        courses: student.courses
        // notice is intentionally omitted
    });
});

// Home page with navigation
app.get('/home', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Student Dashboard - Home</title>
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
            </style>
        </head>
        <body>
            <h1>Student Dashboard Demo</h1>
            <p>Select a student to view their dashboard:</p>
            <div class="nav-links">
                <a href="/">Default Dashboard (Admin with courses)</a>
                <a href="/student/0">Student 0 - John Doe (Admin)</a>
                <a href="/student/1">Student 1 - Jane Smith (Student)</a>
                <a href="/student/2">Student 2 - Bob Johnson (No courses)</a>
                <a href="/no-notice">Dashboard without notice</a>
            </div>
        </body>
        </html>
    `);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Student Dashboard server running at http://localhost:${PORT}`);
    console.log(`\nTry these URLs:`);
    console.log(`  - http://localhost:${PORT}/ (default dashboard)`);
    console.log(`  - http://localhost:${PORT}/home (navigation page)`);
    console.log(`  - http://localhost:${PORT}/student/0 (admin student)`);
    console.log(`  - http://localhost:${PORT}/student/1 (regular student)`);
    console.log(`  - http://localhost:${PORT}/student/2 (student with no courses)`);
    console.log(`  - http://localhost:${PORT}/no-notice (dashboard without notice)`);
});
