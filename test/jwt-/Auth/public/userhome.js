// User home page script
document.addEventListener('DOMContentLoaded', async () => {
    await loadUserInfo();
});

async function loadUserInfo() {
    try {
        const response = await fetch('/api/user', {
            method: 'GET',
            credentials: 'include' // Include cookies
        });

        const data = await response.json();

        if (data.success) {
            const userInfo = document.getElementById('userInfo');
            userInfo.innerHTML = `
                <p><strong>Username:</strong> ${data.user.username}</p>
                <p><strong>Role:</strong> ${data.user.role}</p>
                <p><strong>Login Time:</strong> ${new Date(data.user.loginTimestamp).toLocaleString()}</p>
            `;
        } else {
            // Token invalid or expired, redirect to login
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error loading user info:', error);
        window.location.href = '/';
    }
}

async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        });

        const data = await response.json();
        
        if (data.success) {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Logout error:', error);
        // Redirect to login even if logout fails
        window.location.href = '/';
    }
}
