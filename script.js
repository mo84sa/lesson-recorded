
// Application State
const state = {
    users: JSON.parse(localStorage.getItem('users')) || [],
    admin: { username: 'admin', password: 'admin123' },
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
    evaluation: document.getElementById('evaluation'),
    evaluationResult: document.getElementById('evaluationResult'),
    adminContent: document.getElementById('adminContent'),
};

// Initialize the Application
function init() {
    setupEventListeners();
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        toggleAppVisibility(loggedInUser === state.admin.username);
    }
}

// Set up Event Listeners
function setupEventListeners() {
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.signupForm.addEventListener('submit', handleSignup);
    elements.logoutBtn.addEventListener('click', handleLogout);
    elements.addTextForm?.addEventListener('submit', handleAddText);
}

// Handle User Login
function handleLogin(e) {
    e.preventDefault();
    const username = elements.usernameInput.value.trim();
    const password = elements.passwordInput.value.trim();

    if (username === state.admin.username && password === state.admin.password) {
        localStorage.setItem('loggedInUser', username);
        toggleAppVisibility(true);
    } else if (state.users.some(user => user.username === username && user.password === password)) {
        localStorage.setItem('loggedInUser', username);
        toggleAppVisibility(false);
    } else {
        alert('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
    elements.loginForm.reset();
}

// Handle User Signup
function handleSignup(e) {
    e.preventDefault();
    const username = elements.newUsernameInput.value.trim();
    const password = elements.newPasswordInput.value.trim();

    if (state.users.some(user => user.username === username)) {
        alert('اسم المستخدم موجود بالفعل');
        return;
    }

    state.users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(state.users));

    alert('تم إنشاء الحساب بنجاح');
    elements.signupForm.reset();
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem('loggedInUser');
    toggleAppVisibility(false);
}

// Handle Adding Text (Admin Only)
function handleAddText(e) {
    e.preventDefault();
    const newText = elements.newTextInput.value.trim();

    if (!newText) {
        alert('الرجاء إدخال نص');
        return;
    }

    fetch('admin_text_editor.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ submit_text: true, content: newText }),
    })
        .then(response => response.text())
        .then(() => {
            alert('تم إضافة النص بنجاح');
            elements.addTextForm.reset();
            location.reload(); // Reload to fetch updated texts
        })
        .catch(error => console.error('Error:', error));
}

// Toggle Application Visibility
function toggleAppVisibility(isAdmin) {
    elements.authContainer.classList.add('hidden');
    elements.mainApp.classList.remove('hidden');
    elements.adminContent.classList.toggle('hidden', !isAdmin);
}

// Initialize the App
init();
