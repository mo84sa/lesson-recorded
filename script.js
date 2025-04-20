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
    users.push({ username: document.getElementById('newUsername').value, password: document.getElementById('newPassword').value });
    alert('تم إنشاء الحساب بنجاح');
});

document.getElementById('addTextForm').addEventListener('submit', function (event) {
    event.preventDefault();
    texts.push(document.getElementById('newText').value);
    updateTextSelect();
    alert('تم إضافة النص بنجاح');
});

document.getElementById('textSelect').addEventListener('change', function () {
    const selectedText = this.value;
    document.getElementById('editTextForm').classList.toggle('hidden', !selectedText);
    if (selectedText) document.getElementById('editText').value = selectedText;
});

document.getElementById('editTextForm').addEventListener('submit', function (event) {
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
        evaluateRecording(audioBlob, selectedText);
    };
    setTimeout(() => {
        if (mediaRecorder.state === 'recording') mediaRecorder.stop();
    }, 5000);
}

async function evaluateRecording(audioBlob, originalText) {
    const transcription = await transcribeAudio(audioBlob);
    if (!transcription) {
        document.getElementById('evaluation').innerHTML = `<p>تعذر تحليل التسجيل الصوتي. حاول مرة أخرى.</p>`;
        return;
    }

    // Calculate the similarity between the transcription and the original text
    const similarity = calculateSimilarity(transcription, originalText);
    const similarityPercentage = Math.round(similarity * 100);

    // Display the evaluation result
    document.getElementById('evaluation').innerHTML = `
        <h3>نتيجة التسجيل</h3>
        <p><strong>النص الأصلي:</strong> ${originalText}</p>
        <p><strong>النص المكتوب من التسجيل:</strong> ${transcription}</p>
        <p><strong>التقييم:</strong> ${similarityPercentage}% مطابق</p>
    `;
    document.getElementById('evaluation').classList.remove('hidden');
}

// Function to transcribe audio using Deepgram API (supports Arabic)
async function transcribeAudio(audioBlob) {
    const apiKey = 'YOUR_API_KEY'; // Replace with your Deepgram API key
    const apiUrl = 'https://api.deepgram.com/v1/listen?language=ar'; // Arabic language

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${apiKey}`,
                'Content-Type': 'audio/wav', // Adjust if using MP3/Ogg
            },
            body: audioBlob,
        });

        if (!response.ok) throw new Error('Failed to transcribe audio');
        const data = await response.json();

        // Extract transcription from Deepgram's response
        return data.results.channels[0].alternatives[0].transcript;
    } catch (error) {
        console.error('Error during transcription:', error);
        return null;
    }
}

// Function to calculate similarity (Levenshtein distance)
function calculateSimilarity(text1, text2) {
    const levenshtein = (a, b) => {
        const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
        for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
        for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }
        return matrix[a.length][b.length];
    };

    const distance = levenshtein(text1, text2);
    return 1 - distance / Math.max(text1.length, text2.length);
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
