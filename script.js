// Get references to the DOM elements
const clockElement = document.getElementById('clock');
const timezoneSelector = document.getElementById('timezone');

// Function to format the time as HH:MM:SS
function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour12: false });
}

// Function to update the clock
function updateClock() {
    const timezone = timezoneSelector.value;
    const now = new Date();
    const options = { timeZone: timezone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const timeString = new Intl.DateTimeFormat('en-US', options).format(now);
    clockElement.textContent = timeString;
}

// Event listener for timezone changes
timezoneSelector.addEventListener('change', updateClock);

// Initial clock update and start the interval
updateClock();
setInterval(updateClock, 1000);
