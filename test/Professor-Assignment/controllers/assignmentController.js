const crypto = require('crypto');
const { getAssignments, updateAssignment, addHistory, addNotification, saveOTP, getOTP, deleteOTP } = require('../utils/database');
const { sendOTPEmail } = require('../utils/email');

// List all assignments
exports.listAssignments = async (req, res) => {
  try {
    const assignments = await getAssignments();
    res.render('assignments-list', { assignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).send('Error fetching assignments');
  }
};

// Review assignment
exports.reviewAssignment = async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);
    const assignments = await getAssignments();
    const assignment = assignments.find(a => a.id === assignmentId);
    
    if (!assignment) {
      return res.status(404).send('Assignment not found');
    }
    
    res.render('review-assignment', { assignment });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).send('Error fetching assignment');
  }
};

// Approve assignment (initiate OTP process)
exports.approveAssignment = async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);
    const { remarks, signature, signatureType } = req.body;
    const professorEmail = req.user?.email || 'professor@university.edu';
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with assignment data
    const otpData = {
      assignmentId,
      otp,
      remarks,
      signature,
      signatureType,
      professorEmail,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    };
    
    await saveOTP(otpData);
    
    // Send OTP email (or log to console if email not configured)
    const emailResult = await sendOTPEmail(professorEmail, otp);
    
    const message = emailResult.mode === 'development' || emailResult.mode === 'fallback'
      ? 'OTP generated. Please check the console/server logs for the OTP code.'
      : 'OTP sent to your email. Please check and verify.';
    
    res.json({ 
      success: true, 
      message: message,
      assignmentId,
      otp: emailResult.mode === 'development' || emailResult.mode === 'fallback' ? otp : undefined
    });
  } catch (error) {
    console.error('Error approving assignment:', error);
    res.status(500).json({ success: false, message: 'Error processing approval' });
  }
};

// Verify OTP and complete approval
exports.verifyOTPAndApprove = async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);
    const { otp } = req.body;
    
    // Verify OTP
    const otpData = await getOTP(assignmentId);
    
    if (!otpData) {
      return res.json({ success: false, message: 'OTP not found or expired' });
    }
    
    if (otpData.expiresAt < Date.now()) {
      await deleteOTP(assignmentId);
      return res.json({ success: false, message: 'OTP has expired' });
    }
    
    if (otpData.otp !== otp) {
      return res.json({ success: false, message: 'Invalid OTP' });
    }
    
    // OTP verified - proceed with approval
    const assignments = await getAssignments();
    const assignment = assignments.find(a => a.id === assignmentId);
    
    if (!assignment) {
      return res.json({ success: false, message: 'Assignment not found' });
    }
    
    // Create signature hash
    const signatureHash = crypto
      .createHash('sha256')
      .update(otpData.signature + assignmentId + Date.now())
      .digest('hex');
    
    // Update assignment status
    assignment.status = 'approved';
    assignment.approvedAt = new Date().toISOString();
    assignment.approvedBy = req.user?.email || 'professor@university.edu';
    assignment.remarks = otpData.remarks;
    
    await updateAssignment(assignment);
    
    // Add history entry
    await addHistory({
      assignmentId,
      action: 'approved',
      performedBy: req.user?.email || 'professor@university.edu',
      signatureHash,
      remarks: otpData.remarks,
      timestamp: new Date().toISOString()
    });
    
    // Create notification for student
    await addNotification({
      assignmentId,
      studentId: assignment.studentId,
      studentEmail: assignment.studentEmail,
      type: 'approval',
      message: `Your assignment "${assignment.title}" has been approved by the professor.`,
      timestamp: new Date().toISOString()
    });
    
    // Delete OTP after successful use
    await deleteOTP(assignmentId);
    
    res.json({ 
      success: true, 
      message: 'Assignment approved successfully',
      assignmentId 
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.json({ success: false, message: 'Error verifying OTP' });
  }
};

// Reject assignment
exports.rejectAssignment = async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);
    const { remarks, signature, signatureType } = req.body;
    
    const assignments = await getAssignments();
    const assignment = assignments.find(a => a.id === assignmentId);
    
    if (!assignment) {
      return res.json({ success: false, message: 'Assignment not found' });
    }
    
    // Create signature hash
    const signatureHash = crypto
      .createHash('sha256')
      .update((signature || '') + assignmentId + Date.now())
      .digest('hex');
    
    // Update assignment status
    assignment.status = 'rejected';
    assignment.rejectedAt = new Date().toISOString();
    assignment.rejectedBy = req.user?.email || 'professor@university.edu';
    assignment.remarks = remarks || '';
    
    await updateAssignment(assignment);
    
    // Add history entry
    await addHistory({
      assignmentId,
      action: 'rejected',
      performedBy: req.user?.email || 'professor@university.edu',
      signatureHash,
      remarks: remarks || '',
      timestamp: new Date().toISOString()
    });
    
    // Create notification for student
    await addNotification({
      assignmentId,
      studentId: assignment.studentId,
      studentEmail: assignment.studentEmail,
      type: 'rejection',
      message: `Your assignment "${assignment.title}" has been rejected by the professor.${remarks ? ' Remarks: ' + remarks : ''}`,
      timestamp: new Date().toISOString()
    });
    
    res.json({ 
      success: true, 
      message: 'Assignment rejected successfully',
      assignmentId 
    });
  } catch (error) {
    console.error('Error rejecting assignment:', error);
    res.json({ success: false, message: 'Error rejecting assignment' });
  }
};
