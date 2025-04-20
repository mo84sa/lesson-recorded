const users = [], texts = [], adminUsername = 'admin', adminPassword = 'adminpassword';
let mediaRecorder, audioChunks = [], countdownInterval;

document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username === adminUsername && password === adminPassword) {
        toggleVisibility(true);
    } else if (users.some(user => user.username === username && user.password === password)) {
        toggleVisibility(false);
    } else {
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

document.getElementById('addTextForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const newText = document.getElementById('newText').value;
    if (newText.trim() === '') {
        alert('الرجاء إدخال نص');
        return;
    }
    texts.push(newText);
    updateTextSelect();
    alert('تم إضافة النص بنجاح');
    document.getElementById('addTextForm').reset();
});

document.getElementById('textSelect').addEventListener('change', function () {
    const selectedText = this.value;
    document.getElementById('editTextForm').classList.toggle('hidden', !selectedText);
    if (selectedText) document.getElementById('editText').value = selectedText;
});

document.getElementById('editTextForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const selectedIndex = document.getElementById('textSelect').selectedIndex;
    if (selectedIndex < 1) return;
    
    const editedText = document.getElementById('editText').value;
    texts[selectedIndex - 1] = editedText;
    updateTextSelect();
    alert('تم تعديل النص بنجاح');
    document.getElementById('editTextForm').classList.add('hidden');
});

function updateTextSelect() {
    const textSelect = document.getElementById('textSelect');
    textSelect.innerHTML = '<option value="">اختر نصًا</option>' + 
        texts.map(text => `<option value="${text}">${text}</option>`).join('');
}

document.getElementById('permissionBtn').addEventListener('click', requestMicPermission);

function requestMicPermission() {
    const permissionBtn = document.getElementById('permissionBtn');
    const permissionStatus = document.getElementById('permissionStatus');

    permissionBtn.disabled = true;
    permissionBtn.textContent = 'جاري طلب الإذن...';

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            permissionStatus.textContent = 'تم منح إذن الميكروفون بنجاح';
            permissionStatus.className = 'permission-granted';
            permissionBtn.classList.add('hidden');
            document.getElementById('recordBtn').classList.remove('hidden');
            window.audioStream = stream;
        })
        .catch(error => {
            permissionStatus.textContent = 'خطأ في إذن الميكروفون: ' + error.message;
            permissionStatus.className = 'permission-denied';
            permissionBtn.disabled = false;
            permissionBtn.textContent = 'إعادة طلب إذن الميكروفون';
        });
}

document.getElementById('recordBtn').addEventListener('click', startRecording);

function startRecording() {
    const selectedText = document.getElementById('textSelect').value;
    if (!selectedText) {
        alert('يرجى اختيار نص قبل بدء التسجيل');
        return;
    }
    
    const recordBtn = document.getElementById('recordBtn');
    const recordingStatus = document.getElementById('recordingStatus');
    recordBtn.disabled = true;
    recordingStatus.classList.remove('hidden');
    
    let seconds = 5;
    document.getElementById('countdown').textContent = seconds;
    
    countdownInterval = setInterval(() => {
        seconds--;
        document.getElementById('countdown').textContent = seconds;
        if (seconds <= 0) {
            clearInterval(countdownInterval);
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            }
        }
    }, 1000);
    
    audioChunks = [];
    mediaRecorder = new MediaRecorder(window.audioStream);
    mediaRecorder.start();
    
    mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
    };
    
    mediaRecorder.onstop = () => {
        clearInterval(countdownInterval);
        recordingStatus.classList.add('hidden');
        recordBtn.disabled = false;
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        // Call the evaluateRecording function here if needed
    };
}

document.getElementById('logoutBtn').addEventListener('click', logout);
