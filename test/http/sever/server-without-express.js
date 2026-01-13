const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3001;

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

// Create HTTP server without Express
const server = http.createServer((req, res) => {
    // Parse URL
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // Set CORS headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Handle /movies endpoint
    if (pathname === '/movies' && req.method === 'GET') {
        const { genre, year } = query;

        // Check if both query parameters are provided
        if (!genre || !year) {
            res.statusCode = 200;
            return res.end(JSON.stringify({
                message: 'Both genre and year query parameters are required',
                movies: []
            }));
        }

        // Parse year parameter (comma-separated list)
        const yearList = year.split(',').map(y => parseInt(y.trim())).filter(y => !isNaN(y));

        if (yearList.length === 0) {
            res.statusCode = 200;
            return res.end(JSON.stringify({
                message: 'Invalid year parameter. Please provide valid year(s) separated by commas.',
                movies: []
            }));
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
        res.statusCode = 200;
        return res.end(JSON.stringify(filteredMovies));
    }

    // Handle root route
    if (pathname === '/' && req.method === 'GET') {
        res.statusCode = 200;
        return res.end(JSON.stringify({
            message: 'Movie Filter API',
            endpoint: 'GET /movies',
            queryParameters: {
                genre: 'Movie genre to filter by (case-insensitive)',
                year: 'One or more years separated by commas (e.g., 2020,2022)'
            },
            example: 'http://localhost:3001/movies?genre=Action&year=2020,2022',
            totalMovies: movies.length
        }));
    }

    // Handle 404
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not Found' }));
});

// Start server
server.listen(PORT, () => {
    console.log(`HTTP Server (without Express) running at http://localhost:${PORT}`);
    console.log(`\nEndpoints:`);
    console.log(`  GET  http://localhost:${PORT}/movies?genre=Action&year=2020,2022`);
    console.log(`  GET  http://localhost:${PORT}/ (API information)`);
    console.log(`\nExample:`);
    console.log(`  http://localhost:${PORT}/movies?genre=Action&year=2020,2022`);
});
