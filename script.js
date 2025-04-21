
const state = {
    users: JSON.parse(localStorage.getItem('users')) || [],
    admin: { username: 'admin', password: 'admin123' },
};

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (username === state.admin.username && password === state.admin.password) {
        alert('Admin login successful.');
    } else {
        alert('Login failed.');
    }
});
