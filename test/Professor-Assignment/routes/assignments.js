const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

// List all assignments
router.get('/assignments', assignmentController.listAssignments);

// Review assignment
router.get('/assignments/:id/review', assignmentController.reviewAssignment);

// Approve assignment (with OTP verification)
router.post('/assignments/:id/approve', assignmentController.approveAssignment);

// Verify OTP and complete approval
router.post('/assignments/:id/verify-otp', assignmentController.verifyOTPAndApprove);

// Reject assignment
router.post('/assignments/:id/reject', assignmentController.rejectAssignment);

module.exports = router;
