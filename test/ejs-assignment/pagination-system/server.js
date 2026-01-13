const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001; // Use a different port to avoid conflict with existing server

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Route for the home page with pagination
app.get('/', (req, res) => {
    // Read the product data from data.json on every request
    const dataPath = path.join(__dirname, 'data.json');
    fs.readFile(dataPath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading data.json:', err);
            return res.status(500).send('Error reading product data');
        }

        const products = JSON.parse(data);

        // Get the current page from query parameter, default to 1
        const page = parseInt(req.query.page) || 1;
        const productsPerPage = 5;

        // Calculate total pages
        const totalPages = Math.ceil(products.length / productsPerPage);

        // Ensure page is within valid range
        const currentPage = Math.max(1, Math.min(page, totalPages));

        // Get the products for the current page
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const paginatedProducts = products.slice(startIndex, endIndex);

        // Render the EJS template with the data
        res.render('index', {
            products: paginatedProducts,
            currentPage: currentPage,
            totalPages: totalPages
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Pagination server running at http://localhost:${PORT}`);
});
