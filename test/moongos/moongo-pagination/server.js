const express = require('express');
const path = require('path');
const { connectDb } = require('./connectDb');
const { ObjectId } = require('mongodb');

const app = express();
const PORT = 3006;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Pagination: Number of students per page
const STUDENTS_PER_PAGE = 5;

// GET / - Dashboard with pagination
app.get('/', async (req, res) => {
    try {
        const db = await connectDb();
        const studentsCollection = db.collection('students');

        // Get query parameters
        const page = parseInt(req.query.page) || 1;
        const filterMarks = req.query.filterMarks ? parseInt(req.query.filterMarks) : null;

        // Build query
        let query = {};
        if (filterMarks !== null && !isNaN(filterMarks)) {
            query.marks = filterMarks.toString();
        }

        // Calculate pagination
        const skip = (page - 1) * STUDENTS_PER_PAGE;
        const totalStudents = await studentsCollection.countDocuments(query);
        const totalPages = Math.ceil(totalStudents / STUDENTS_PER_PAGE);

        // Fetch students with pagination
        const students = await studentsCollection
            .find(query)
            .skip(skip)
            .limit(STUDENTS_PER_PAGE)
            .toArray();

        res.render('dashboard', {
            students: students,
            currentPage: page,
            totalPages: totalPages,
            filterMarks: filterMarks
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).send('Error fetching students');
    }
});

// POST /students - Add a new student
app.post('/students', async (req, res) => {
    try {
        const db = await connectDb();
        const studentsCollection = db.collection('students');

        const { name, section, marks } = req.body;

        // Validate input
        if (!name || !section || !marks) {
            return res.status(400).json({ error: 'Name, section, and marks are required' });
        }

        // Create student document
        const student = {
            name: name.trim(),
            section: section.trim(),
            marks: marks.toString().trim()
        };

        // Insert student
        const result = await studentsCollection.insertOne(student);

        res.status(201).json({
            success: true,
            message: 'Student added successfully',
            studentId: result.insertedId
        });
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ error: 'Error adding student' });
    }
});

// PATCH /students/:id - Update a student
app.patch('/students/:id', async (req, res) => {
    try {
        const db = await connectDb();
        const studentsCollection = db.collection('students');

        const { id } = req.params;
        const { name, section, marks } = req.body;

        // Validate ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid student ID' });
        }

        // Build update object
        const updateData = {};
        if (name) updateData.name = name.trim();
        if (section) updateData.section = section.trim();
        if (marks) updateData.marks = marks.toString().trim();

        // Update student
        const result = await studentsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({
            success: true,
            message: 'Student updated successfully'
        });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ error: 'Error updating student' });
    }
});

// DELETE /students/:id - Delete a student
app.delete('/students/:id', async (req, res) => {
    try {
        const db = await connectDb();
        const studentsCollection = db.collection('students');

        const { id } = req.params;

        // Validate ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid student ID' });
        }

        // Delete student
        const result = await studentsCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ error: 'Error deleting student' });
    }
});

// Start server
app.listen(PORT, async () => {
    console.log(`Student Management System running at http://localhost:${PORT}`);
    console.log(`Database: testingproject`);
    console.log(`Collection: students`);
    
    // Test database connection
    try {
        await connectDb();
        console.log('MongoDB connection established');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        console.log('Make sure MongoDB is running on localhost:27017');
    }
});
