const users = [], texts = [], adminUsername = 'admin', adminPassword = 'adminpassword';
let mediaRecorder, audioChunks = [], countdownInterval;

document.getElementById('loginForm').addEventListener('submit', function(event) {
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

document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault();
    users.push({ username: document.getElementById('newUsername').value, password: document.getElementById('newPassword').value });
    alert('تم إنشاء الحساب بنجاح');
});

document.getElementById('addTextForm').addEventListener('submit', function(event) {
    event.preventDefault();
    texts.push(document.getElementById('newText').value);
    updateTextSelect();
    alert('تم إضافة النص بنجاح');
});

document.getElementById('textSelect').addEventListener('change', function() {
    const selectedText = this.value;
    document.getElementById('editTextForm').classList.toggle('hidden', !selectedText);
    if (selectedText) document.getElementById('editText').value = selectedText;
});

document.getElementById('editTextForm').addEventListener('submit', function(event) {
    event.preventDefault();
    texts[document.getElementById('textSelect').selectedIndex - 1] = document.getElementById('editText').value;
    updateTextSelect();
    alert('تم تعديل النص بنجاح');
});

function updateTextSelect() {
    const textSelect = document.getElementById('textSelect');
    textSelect.innerHTML = '<option value="">اختر نصًا</option>' + texts.map(text => `<option value="${text}">${text}</option>`).join('');
}

function requestMicPermission() {
    const permissionBtn = document.getElementById('permissionBtn');
    const permissionStatus = document.getElementById('permissionStatus');
    
    permissionBtn.disabled = true;
    permissionBtn.textContent = 'جاري طلب الإذن...';
    
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            permissionStatus.textContent = 'تم منح إذن الميكروفون بنجاح';
            permissionStatus.classList.add('permission-granted');
            permissionStatus.classList.remove('hidden');
            permissionBtn.classList.add('hidden');
            document.getElementById('recordBtn').classList.remove('hidden');
            window.audioStream = stream;
        })
        .catch(error => {
            permissionStatus.textContent = 'خطأ في إذن الميكروفون: ' + error.message;
            permissionStatus.classList.remove('hidden');
            permissionBtn.disabled = false;
            permissionBtn.textContent = 'إعادة طلب إذن الميكروفون';
            console.error('Error accessing microphone:', error);
        });
}

function startRecording() {
    const selectedText = document.getElementById('textSelect').value;
    if (!selectedText) return alert('يرجى اختيار نص قبل بدء التسجيل');
    const recordBtn = document.getElementById('recordBtn');
    const recordingStatus = document.getElementById('recordingStatus');
    recordBtn.disabled = true;
    recordingStatus.classList.remove('hidden');
    let seconds = 5;
    document.getElementById('countdown').textContent = seconds;
    countdownInterval = setInterval(() => {
        seconds--;
        document.getElementById('countdown').textContent = seconds;
        if (seconds <= 0) clearInterval(countdownInterval);
    }, 1000);
    audioChunks = [];
    mediaRecorder = new MediaRecorder(window.audioStream);
    mediaRecorder.start();
    mediaRecorder.ondataavailable = event => audioChunks.push(event.data);
    mediaRecorder.onstop = () => {
        clearInterval(countdownInterval);
        recordingStatus.classList.add('hidden');
        recordBtn.disabled = false;
        const audioBlob = new Blob(audioChunks);
        const audioUrl = URL.createObjectURL(audioBlob);
        const audioPlayer = new Audio(audioUrl);
        audioPlayer.play();
        evaluateRecording(audioBlob, selectedText);
    };
    setTimeout(() => {
        if (mediaRecorder.state === 'recording') mediaRecorder.stop();
    }, 5000);
}

function evaluateRecording(audioBlob, originalText) {
    document.getElementById('evaluation').innerHTML = `
        <h3>نتيجة التسجيل</h3>
        <p><strong>النص الأصلي:</strong> ${originalText}</p>
        <p>تم تسجيل الصوت بنجاح.</p>
        <button onclick="playRecording()">تشغيل التسجيل</button>
    `;
    document.getElementById('evaluation').classList.remove('hidden');
    window.lastRecording = audioBlob;
}

function playRecording() {
    if (window.lastRecording) new Audio(URL.createObjectURL(window.lastRecording)).play();
}

function logout() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        clearInterval(countdownInterval);
    }
    if (window.audioStream) {
        window.audioStream.getTracks().forEach(track => track.stop());
        window.audioStream = null;
    }
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('content').classList.add('hidden');
    document.getElementById('adminContent').classList.add('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('permissionStatus').classList.add('hidden');
    document.getElementById('permissionBtn').classList.remove('hidden');
    document.getElementById('permissionBtn').disabled = false;
    document.getElementById('permissionBtn').textContent = 'طلب إذن الميكروفون';
    document.getElementById('recordBtn').classList.add('hidden');
    document.getElementById('recordingStatus').classList.add('hidden');
    document.getElementById('evaluation').classList.add('hidden');
}

function toggleVisibility(isAdmin) {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('content').classList.remove('hidden');
    document.getElementById('adminContent').classList.toggle('hidden', !isAdmin);
    updateTextSelect();
}
