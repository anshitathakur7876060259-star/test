// Simple authentication middleware (for demo purposes)
// In a real application, you would verify JWT tokens or session here
module.exports = (req, res, next) => {
  req.user = { id: 1, email: 'professor@university.edu', name: 'Dr. Smith' };
  next();
};
