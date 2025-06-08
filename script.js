const logo = document.getElementById('logo');

logo.addEventListener('click', () => {
    if (logo.classList.contains('clicked')) {
        return;
    }

    logo.classList.add('clicked');
    
    logo.addEventListener('animationend', () => {
        logo.classList.remove('clicked');
    }, { once: true });
});

const logo = document.getElementById('logo');

// Web Audio API setup
let audioContext;
let pumpBuffer;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        fetch('pump.mp3')
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                pumpBuffer = audioBuffer;
            })
            .catch(e => console.error("Error with decoding audio data", e));
    }
}

function playPumpSound() {
    if (!audioContext || !pumpBuffer) return;
    const source = audioContext.createBufferSource();
    source.buffer = pumpBuffer;
    source.connect(audioContext.destination);
    source.start(0);
}


logo.addEventListener('click', () => {
    // Initialize audio on the first user interaction
    initAudio();

    if (logo.classList.contains('clicked')) {
        return;
    }
    
    playPumpSound();

    logo.classList.add('clicked');
    
    logo.addEventListener('animationend', () => {
        logo.classList.remove('clicked');
    }, { once: true });
});

