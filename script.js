// script.js
let uploadedText = '';
const isAdmin = true; // Change this to false for student view
let mediaRecorder;
let audioChunks = [];

if (isAdmin) {
    document.getElementById('admin-section').style.display = 'block';
    document.getElementById('upload-button').addEventListener('click', function() {
        uploadedText = document.getElementById('text-input').value;
        document.getElementById('text-display').innerText = uploadedText;
        document.getElementById('student-section').style.display = 'block';
    });
} else {
    document.getElementById('admin-section').style.display = 'none';
    document.getElementById('student-section').style.display = 'block';
}

// Function to start recording
async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.ondataavailable = function(event) {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = function() {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        document.getElementById('audio-playback').src = audioUrl;
        document.getElementById('audio-playback').style.display = 'block';

        // Simple feedback mechanism (this can be improved)
        const feedback = uploadedText.split(' ').length === audioChunks.length ? 
            "Great job! You recited the text correctly." : 
            "Keep practicing! Try to recite the text more accurately.";
        document.getElementById('feedback').innerText = feedback;
    };

    mediaRecorder.start();
}

// Function to stop recording
function stopRecording() {
    mediaRecorder.stop();
}

// Event listener for the record button
document.getElementById('record-button').addEventListener('click', function() {
    audioChunks = []; // Reset audio chunks
    startRecording();
    setTimeout(stopRecording, 5000); // Record for 5 seconds
});
