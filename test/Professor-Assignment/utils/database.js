const fs = require('fs').promises;
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const assignmentsFile = path.join(dataDir, 'assignments.json');
const historyFile = path.join(dataDir, 'history.json');
const notificationsFile = path.join(dataDir, 'notifications.json');
const otpFile = path.join(dataDir, 'otp.json');

// Assignments
async function getAssignments() {
  try {
    const data = await fs.readFile(assignmentsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function updateAssignment(assignment) {
  const assignments = await getAssignments();
  const index = assignments.findIndex(a => a.id === assignment.id);
  if (index !== -1) {
    assignments[index] = assignment;
  } else {
    assignments.push(assignment);
  }
  await fs.writeFile(assignmentsFile, JSON.stringify(assignments, null, 2));
  return assignment;
}

// History
async function getHistory() {
  try {
    const data = await fs.readFile(historyFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function addHistory(historyEntry) {
  const history = await getHistory();
  history.push(historyEntry);
  await fs.writeFile(historyFile, JSON.stringify(history, null, 2));
  return historyEntry;
}

// Notifications
async function getNotifications() {
  try {
    const data = await fs.readFile(notificationsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function addNotification(notification) {
  const notifications = await getNotifications();
  notification.id = notifications.length + 1;
  notifications.push(notification);
  await fs.writeFile(notificationsFile, JSON.stringify(notifications, null, 2));
  return notification;
}

// OTP
async function getOTPs() {
  try {
    const data = await fs.readFile(otpFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveOTP(otpData) {
  const otps = await getOTPs();
  const index = otps.findIndex(o => o.assignmentId === otpData.assignmentId);
  if (index !== -1) {
    otps[index] = otpData;
  } else {
    otps.push(otpData);
  }
  await fs.writeFile(otpFile, JSON.stringify(otps, null, 2));
  return otpData;
}

async function getOTP(assignmentId) {
  const otps = await getOTPs();
  return otps.find(o => o.assignmentId === assignmentId);
}

async function deleteOTP(assignmentId) {
  const otps = await getOTPs();
  const filtered = otps.filter(o => o.assignmentId !== assignmentId);
  await fs.writeFile(otpFile, JSON.stringify(filtered, null, 2));
}

module.exports = {
  getAssignments,
  updateAssignment,
  getHistory,
  addHistory,
  getNotifications,
  addNotification,
  saveOTP,
  getOTP,
  deleteOTP
};
