const API_BASE_URL = 'http://localhost:3000/api';

// Token expiration time: 30 minutes (in milliseconds)
const TOKEN_EXPIRATION_MS = 30 * 60 * 1000;

let tokenExpirationTime = null;
let tokenTimerInterval = null;

// DOM Elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const userName = document.getElementById('userName');
const tokenTimer = document.getElementById('tokenTimer');
const fetchProtectedBtn = document.getElementById('fetchProtectedBtn');
const fetchProfileBtn = document.getElementById('fetchProfileBtn');
const logoutBtn = document.getElementById('logoutBtn');
const apiResponse = document.getElementById('apiResponse');
const expiredModal = document.getElementById('expiredModal');
const redirectToLoginBtn = document.getElementById('redirectToLoginBtn');

// Check if user is already logged in on page load
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        // Verify token is still valid
        checkTokenValidity();
    }
});

// Login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            // Store token
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Set token expiration time
            tokenExpirationTime = Date.now() + TOKEN_EXPIRATION_MS;
            
            // Show dashboard
            showDashboard(data.user);
            
            // Start token expiration timer
            startTokenTimer();
            
            // Clear login error
            loginError.textContent = '';
            loginError.classList.remove('show');
        } else {
            // Show error message
            loginError.textContent = data.message || 'Login failed';
            loginError.classList.add('show');
        }
    } catch (error) {
        loginError.textContent = 'Network error. Please try again.';
        loginError.classList.add('show');
        console.error('Login error:', error);
    }
});

// Show dashboard
function showDashboard(user) {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    userName.textContent = user.username;
}

// Show login page
function showLogin() {
    loginSection.style.display = 'block';
    dashboardSection.style.display = 'none';
    loginForm.reset();
    apiResponse.classList.remove('show');
    stopTokenTimer();
}

// Start token expiration timer
function startTokenTimer() {
    stopTokenTimer(); // Clear any existing timer
    
    tokenTimerInterval = setInterval(() => {
        if (tokenExpirationTime) {
            const remaining = tokenExpirationTime - Date.now();
            
            if (remaining <= 0) {
                // Token expired
                handleTokenExpiration();
                return;
            }
            
            // Update timer display
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            tokenTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

// Stop token timer
function stopTokenTimer() {
    if (tokenTimerInterval) {
        clearInterval(tokenTimerInterval);
        tokenTimerInterval = null;
    }
}

// Handle token expiration
function handleTokenExpiration() {
    stopTokenTimer();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Show expired modal
    expiredModal.style.display = 'flex';
    
    // Redirect to login after modal is shown
    setTimeout(() => {
        expiredModal.style.display = 'none';
        showLogin();
    }, 3000);
}

// Check token validity by making a request
async function checkTokenValidity() {
    const token = localStorage.getItem('token');
    if (!token) {
        showLogin();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            // Token is valid
            const user = JSON.parse(localStorage.getItem('user'));
            tokenExpirationTime = Date.now() + TOKEN_EXPIRATION_MS;
            showDashboard(user);
            startTokenTimer();
        } else {
            // Token is invalid or expired
            if (data.expired) {
                showExpiredMessage();
            }
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            showLogin();
        }
    } catch (error) {
        console.error('Token validation error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showLogin();
    }
}

// Show expired message
function showExpiredMessage() {
    expiredModal.style.display = 'flex';
    setTimeout(() => {
        expiredModal.style.display = 'none';
    }, 3000);
}

// Fetch protected data
fetchProtectedBtn.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/protected`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        displayApiResponse(data);

        if (!data.success && data.expired) {
            handleTokenExpiration();
        }
    } catch (error) {
        console.error('API error:', error);
        apiResponse.innerHTML = '<p style="color: #f44336;">Error fetching data. Please try again.</p>';
        apiResponse.classList.add('show');
    }
});

// Fetch profile
fetchProfileBtn.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        displayApiResponse(data);

        if (!data.success && data.expired) {
            handleTokenExpiration();
        }
    } catch (error) {
        console.error('API error:', error);
        apiResponse.innerHTML = '<p style="color: #f44336;">Error fetching profile. Please try again.</p>';
        apiResponse.classList.add('show');
    }
});

// Display API response
function displayApiResponse(data) {
    apiResponse.innerHTML = `
        <h3>API Response:</h3>
        <pre>${JSON.stringify(data, null, 2)}</pre>
    `;
    apiResponse.classList.add('show');
}

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    stopTokenTimer();
    showLogin();
});

// Redirect to login button
redirectToLoginBtn.addEventListener('click', () => {
    expiredModal.style.display = 'none';
    showLogin();
});

// Intercept all fetch requests to handle token expiration
const originalFetch = window.fetch;
window.fetch = async function(...args) {
    const response = await originalFetch(...args);
    
    // Check if response indicates token expiration
    if (response.status === 401) {
        const data = await response.clone().json();
        if (data.expired) {
            handleTokenExpiration();
        }
    }
    
    return response;
};
