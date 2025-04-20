// Audio recording variables
let mediaRecorder;
let audioChunks = [];
const recordButton = document.getElementById('recordButton');

// Initialize Whisper model (load once)
let transcriber;
async function loadModel() {
    transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small');
}
loadModel(); // Start loading model early

// Record button handler
recordButton.addEventListener('click', async () => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        startRecording();
    } else {
        stopRecording();
    }
});

async function startRecording() {
    audioChunks = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
    };
    
    mediaRecorder.start();
    recordButton.textContent = 'إيقاف التسجيل';
}

async function stopRecording() {
    mediaRecorder.stop();
    recordButton.textContent = 'بدء التسجيل';
    mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        await evaluateRecording(audioBlob, "هذا اختبار للنطق العربي");
    };
}

async function evaluateRecording(audioBlob, originalText) {
    const transcription = await transcribeAudio(audioBlob);
    if (!transcription) {
        document.getElementById('evaluation').innerHTML = `<p>تعذر تحليل التسجيل الصوتي. حاول مرة أخرى.</p>`;
        return;
    }

    const similarity = calculateSimilarity(transcription, originalText);
    const similarityPercentage = Math.round(similarity * 100);

    document.getElementById('evaluation').innerHTML = `
        <h3>نتيجة التسجيل</h3>
        <p><strong>النص الأصلي:</strong> ${originalText}</p>
        <p><strong>ما تم التعرف عليه:</strong> ${transcription}</p>
        <p><strong>الدقة:</strong> ${similarityPercentage}%</p>
    `;
    document.getElementById('evaluation').classList.remove('hidden');
}

async function transcribeAudio(audioBlob) {
    try {
        // Convert Blob to audio data
        const audioCtx = new AudioContext();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        
        // Ensure model is loaded
        if (!transcriber) {
            transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small');
        }
        
        // Transcribe with Whisper (force Arabic)
        const { text } = await transcriber(audioBuffer.getChannelData(0), {
            language: 'ar', // Arabic
            task: 'transcribe',
        });
        
        return text;
    } catch (error) {
        console.error("Transcription failed:", error);
        return null;
    }
}

// Levenshtein similarity calculator (unchanged)
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
