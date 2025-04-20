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

// Function to transcribe audio using a speech-to-text API
async function transcribeAudio(audioBlob) {
    const apiKey = 'YOUR_API_KEY'; // Replace with your Speech-to-Text API key
    const apiUrl = 'YOUR_API_URL'; // Replace with your Speech-to-Text API endpoint

    const formData = new FormData();
    formData.append('file', audioBlob);
    formData.append('language', 'ar'); // Specify the language (e.g., Arabic)

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            body: formData
        });

        if (!response.ok) throw new Error('Failed to transcribe audio');
        const data = await response.json();
        return data.transcription; // Adjust based on the API response format
    } catch (error) {
        console.error('Error during transcription:', error);
        return null;
    }
}

// Function to calculate the similarity between two strings
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
