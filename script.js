const users = [], texts = [], adminUsername = 'admin', adminPassword = 'admin';
let mediaRecorder, audioChunks = [], countdownInterval;

document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === adminUsername && password === adminPassword) {
        // Admin user: Show admin page
        console.log('Admin login successful');
        toggleVisibility(true);
    } else if (users.some(user => user.username === username && user.password === password)) {
        // Regular user: Hide admin page
        console.log('Regular user login successful');
        toggleVisibility(false);
    } else {
        console.log('Login failed');
        alert('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
});

document.getElementById('signupForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    
    if (users.some(user => user.username === newUsername)) {
        alert('اسم المستخدم موجود بالفعل');
        return;
    }
    
    users.push({ username: newUsername, password: newPassword });
    alert('تم إنشاء الحساب بنجاح');
    document.getElementById('signupForm').reset();
});

function toggleVisibility(isAdmin) {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('content').classList.remove('hidden');
    document.getElementById('adminContent').classList.toggle('hidden', !isAdmin);
    updateTextSelect();
}

document.getElementById('logoutBtn').addEventListener('click', logout);

function logout() {
    // Stop the media recorder if it's still active
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }

    // Stop any active audio streams and release resources
    if (window.audioStream) {
        window.audioStream.getTracks().forEach(track => track.stop());
        window.audioStream = null;
    }

    // Clear any intervals (e.g., countdown timer)
    clearInterval(countdownInterval);

    // Reset the UI elements
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('content').classList.add('hidden');
    document.getElementById('adminContent').classList.add('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('permissionStatus').className = '';
    document.getElementById('permissionStatus').classList.add('hidden');
    document.getElementById('permissionBtn').classList.remove('hidden');
    document.getElementById('permissionBtn').disabled = false;
    document.getElementById('permissionBtn').textContent = 'طلب إذن الميكروفون';
    document.getElementById('recordBtn').classList.add('hidden');
    document.getElementById('recordingStatus').classList.add('hidden');
    document.getElementById('evaluation').classList.add('hidden');

    // Reset internal states
    audioChunks = [];
    mediaRecorder = null;
    countdownInterval = null;

    // Provide feedback to the user
    alert('تم تسجيل الخروج بنجاح');
}

// Additional functionality (e.g., text management, recording, and evaluation) remains unchanged.
