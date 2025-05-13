const flepImage = document.getElementById('flepImage');
let audioContext;
let audioBuffer;

// Initialize AudioContext on user interaction
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        fetch('flep_sound.mp3')
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
            .then(decodedBuffer => {
                audioBuffer = decodedBuffer;
            })
            .catch(error => console.error('Error loading audio:', error));
    }
}

function playSound() {
    if (audioContext && audioBuffer && audioContext.state === 'running') {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);
    } else if (audioContext && audioContext.state === 'suspended') {
        // Try to resume context if suspended (e.g., by browser policies)
        audioContext.resume().then(() => {
            if (audioBuffer) {
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.start(0);
            }
        });
    } else {
        console.log("Audio context not ready or buffer not loaded.");
    }
}

flepImage.addEventListener('click', () => {
    // Initialize audio on first click
    if (!audioContext) {
        initAudio();
    } else {
         // Ensure context is running for subsequent clicks
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }

    // Add shake animation
    flepImage.classList.add('shake');
    
    // Play sound
    playSound();

    // Remove shake animation after it finishes
    flepImage.addEventListener('animationend', () => {
        flepImage.classList.remove('shake');
    }, { once: true }); // Important: use 'once: true' to auto-remove listener
});

// Also initialize audio on any user interaction if not already clicked
document.body.addEventListener('click', initAudio, { once: true });
document.body.addEventListener('keydown', initAudio, { once: true });


