
// Application State
const state = {
    users: JSON.parse(localStorage.getItem('users')) || [],
    texts: JSON.parse(localStorage.getItem('texts')) || [
        "بسم الله الرحمن الرحيم",
        "الحمد لله رب العالمين"
    ],
    admin: {
        username: 'admin',
        password: 'admin123'
    },
    audio: {
        stream: null,
        recorder: null,
        chunks: []
    },
    countdown: null
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
    recordingSection: document.getElementById('recordingSection'),
    permissionBtn: document.getElementById('permissionBtn'),
    recordBtn: document.getElementById('recordBtn'),
    recordingStatus: document.getElementById('recordingStatus'),
    countdownDisplay: document.getElementById('countdown'),
    evaluation: document.getElementById('evaluation'),
    evaluationResult: document.getElementById('evaluationResult'),
    adminContent: document.getElementById('adminContent'),
    addTextForm: document.getElementById('addTextForm'),
    newTextInput: document.getElementById('newText'),
    editTextForm: document.getElementById('editTextForm'),
    editTextInput: document.getElementById('editText'),
    editTextSelect: document.getElementById('editTextSelect')
};

// Initialize Application
function init() {
    updateTextSelects();
    setupEventListeners();
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        toggleAppVisibility(loggedInUser === state.admin.username);
    }
}

// Event Listeners
function setupEventListeners() {
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.signupForm.addEventListener('submit', handleSignup);
    elements.logoutBtn.addEventListener('click', handleLogout);
    elements.addTextForm.addEventListener('submit', handleAddText);
    elements.editTextSelect.addEventListener('change', handleEditTextSelect);
    elements.editTextForm.addEventListener('submit', handleEditText);
}

// Auth Handlers
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

function handleLogout() {
    localStorage.removeItem('loggedInUser');
    toggleAppVisibility(false);
}

// Admin Handlers
function handleAddText(e) {
    e.preventDefault();
    const newText = elements.newTextInput.value.trim();
    if (!newText) {
        alert('الرجاء إدخال نص');
        return;
    }
    state.texts.push(newText);
    localStorage.setItem('texts', JSON.stringify(state.texts));
    updateTextSelects();
    alert('تم إضافة النص بنجاح');
    elements.addTextForm.reset();
}

function handleEditTextSelect(e) {
    const selectedIndex = e.target.selectedIndex - 1;
    if (selectedIndex >= 0) {
        elements.editTextForm.classList.remove('hidden');
        elements.editTextInput.value = state.texts[selectedIndex];
    } else {
        elements.editTextForm.classList.add('hidden');
    }
}

function handleEditText(e) {
    e.preventDefault();
    const selectedIndex = elements.editTextSelect.selectedIndex - 1;
    const editedText = elements.editTextInput.value.trim();
    if (!editedText) {
        alert('الرجاء إدخال نص');
        return;
    }
    state.texts[selectedIndex] = editedText;
    localStorage.setItem('texts', JSON.stringify(state.texts));
    updateTextSelects();
    alert('تم تعديل النص بنجاح');
    elements.editTextForm.reset();
}

// Helper Functions
function toggleAppVisibility(isAdmin) {
    elements.authContainer.classList.toggle('hidden', isAdmin || !isAdmin);
    elements.mainApp.classList.toggle('hidden', !isAdmin && !isAdmin);
    elements.adminContent.classList.toggle('hidden', !isAdmin);
}

function updateTextSelects() {
    const options = state.texts.map(text => `<option>${text}</option>`).join('');
    elements.textSelect.innerHTML = `<option value="">اختر نصًا</option>${options}`;
    elements.editTextSelect.innerHTML = `<option value="">اختر نصًا للتعديل</option>${options}`;
}

// Initialize App
init();
