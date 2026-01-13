const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Read movie data from movie.json
let movies = [];

try {
    const movieData = fs.readFileSync(path.join(__dirname, 'movie.json'), 'utf8');
    movies = JSON.parse(movieData);
    console.log(`Loaded ${movies.length} movies from movie.json`);
} catch (error) {
    console.error('Error reading movie.json:', error);
    movies = [];
}

// GET /movies - Filter movies by genre and year
app.get('/movies', (req, res) => {
    const { genre, year } = req.query;

    // Check if both query parameters are provided
    if (!genre || !year) {
        return res.json({
            message: 'Both genre and year query parameters are required',
            movies: []
        });
    }

    // Parse year parameter (comma-separated list)
    const yearList = year.split(',').map(y => parseInt(y.trim())).filter(y => !isNaN(y));

    if (yearList.length === 0) {
        return res.json({
            message: 'Invalid year parameter. Please provide valid year(s) separated by commas.',
            movies: []
        });
    }

    // Filter movies
    // Genre filter: case-insensitive match
    // Year filter: match any year in the comma-separated list
    const filteredMovies = movies.filter(movie => {
        const genreMatch = movie.genre.toLowerCase() === genre.toLowerCase();
        const yearMatch = yearList.includes(movie.year);
        return genreMatch && yearMatch;
    });

    // Return filtered movies as JSON array
    res.json(filteredMovies);
});

// Root route - API information
app.get('/', (req, res) => {
    res.json({
        message: 'Movie Filter API',
        endpoint: 'GET /movies',
        queryParameters: {
            genre: 'Movie genre to filter by (case-insensitive)',
            year: 'One or more years separated by commas (e.g., 2020,2022)'
        },
        example: 'http://localhost:3000/movies?genre=Action&year=2020,2022',
        totalMovies: movies.length
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`HTTP Server running at http://localhost:${PORT}`);
    console.log(`\nEndpoints:`);
    console.log(`  GET  http://localhost:${PORT}/movies?genre=Action&year=2020,2022`);
    console.log(`  GET  http://localhost:${PORT}/ (API information)`);
    console.log(`\nExample:`);
    console.log(`  http://localhost:${PORT}/movies?genre=Action&year=2020,2022`);
});
