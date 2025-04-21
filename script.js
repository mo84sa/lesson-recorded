// Application State
const state = {
    users: JSON.parse(localStorage.getItem('users')) || [],
    texts: JSON.parse(localStorage.getItem('texts')) || [],
    admin: {
        username: 'admin',
        password: 'admin123'
    },
};

// DOM Elements
const elements = {
    authContainer: document.getElementById('authContainer'),
    loginForm: document.getElementById('loginForm'),
    signupForm: document.getElementById('signupForm'),
    usernameInput: document.getElementById('username'),
    passwordInput: document.getElementById('password'),
    newUsernameInput: document.getElementById('newUsername'),
    newPasswordInput: document.getElementById('newPassword'),
    mainApp: document.getElementById('mainApp'),
    logoutBtn: document.getElementById('logoutBtn'),
    textSelect: document.getElementById('textSelect'),
    addTextForm: document.getElementById('addTextForm'),
    newTextInput: document.getElementById('newText'),
};

// Initialize Application
function init() {
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.signupForm.addEventListener('submit', handleSignup);
}

function handleLogin(e) {
    e.preventDefault();
    const username = elements.usernameInput.value.trim();
    const password = elements.passwordInput.value.trim();
    if (username === state.admin.username && password === state.admin.password) {
        toggleAppVisibility(true);
    } else {
        alert('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
}

// Toggle Visibility
function toggleAppVisibility(isAdmin) {
    elements.authContainer.classList.add('hidden');
    elements.mainApp.classList.remove('hidden');
    if (isAdmin) {
        document.getElementById('adminContent').classList.remove('hidden');
    }
}

// Initialize App
init();
