const users = [], texts = [], adminUsername = 'admin', adminPassword = 'adminpassword';
let mediaRecorder, audioChunks = [], countdownInterval;

document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === adminUsername && password === adminPassword) {
        console.log('Admin login successful');
        toggleVisibility(true);
    } else if (users.some(user => user.username === username && user.password === password)) {
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

document.getElementById('addTextForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const newText = document.getElementById('newText').value;
    console.log('Attempting to add new text:', newText);

    // Input validation
    if (newText.trim() === '') {
        alert('الرجاء إدخال نص');
        return;
    }

    texts.push(newText); // Add text to array
    console.log('Text added successfully:', texts);

    updateTextSelect(); // Update dropdown list
    alert('تم إضافة النص بنجاح');

    document.getElementById('addTextForm').reset(); // Clear input field
});

function updateTextSelect() {
    const textSelect = document.getElementById('textSelect');
    textSelect.innerHTML = '<option value="">اختر نصًا</option>' +
        texts.map(text => `<option value="${text}">${text}</option>`).join('');
    console.log('Dropdown updated with texts:', texts);
}

document.getElementById('logoutBtn').addEventListener('click', logout);

function logout() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }

    if (window.audioStream) {
        window.audioStream.getTracks().forEach(track => track.stop());
        window.audioStream = null;
    }

    clearInterval(countdownInterval);

    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('content').classList.add('hidden');
    document.getElementById('adminContent').classList.add('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('permissionStatus').className = '';
    document.getElementById('permissionStatus').classList.add('hidden');
    document.getElementById('permissionBtn').classList.remove('hidden');
    document.getElementById('recordBtn').classList.add('hidden');
    document.getElementById('recordingStatus').classList.add('hidden');
    document.getElementById('evaluation').classList.add('hidden');

    audioChunks = [];
    mediaRecorder = null;
    countdownInterval = null;

    alert('تم تسجيل الخروج بنجاح');
}
