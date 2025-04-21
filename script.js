// script.js
let uploadedText = '';
const isAdmin = true; // Change this to false for student view

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

document.getElementById('record-button').addEventListener('click', function() {
    const mediaRecorder = new MediaRecorder(new AudioContext().createMediaStreamDestination().stream);
    const audioChunks = [];

    mediaRecorder.start();

    mediaRecorder.ondataavailable = function(event) {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = function() {
        const audioBlob = new Blob(audioChunks);
        const audioUrl = URL.createObjectURL(audioBlob);
        document.getElementById('audio-playback').src = audioUrl;
        document.getElementById('audio-playback').style.display = 'block';

        // Simple feedback mechanism (this can be improved)
        const feedback = uploadedText.split(' ').length === audioChunks.length ? 
            "Great job! You recited the text correctly." : 
            "Keep practicing! Try to recite the text more accurately.";
        document.getElementById('feedback').innerText = feedback;
    };

    setTimeout(() => {
        mediaRecorder.stop();
    }, 5000); // Record for 5 seconds
});
