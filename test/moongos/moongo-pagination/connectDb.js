const { MongoClient } = require('mongodb');

let db = null;
let client = null;

// MongoDB connection URL
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'testingproject';

/**
 * Connect to MongoDB and return the database instance
 * Ensures only a single database instance is created and reused
 */
async function connectDb() {
    try {
        // If database connection already exists, return it
        if (db) {
            return db;
        }

        // Create new MongoDB client
        client = new MongoClient(MONGODB_URI);

        // Connect to MongoDB
        await client.connect();
        console.log('Connected to MongoDB successfully');

        // Get the database instance
        db = client.db(DB_NAME);

        return db;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

/**
 * Close the MongoDB connection
 */
async function closeDb() {
    try {
        if (client) {
            await client.close();
            console.log('MongoDB connection closed');
            db = null;
            client = null;
        }
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
        throw error;
    }
}

module.exports = { connectDb, closeDb };
