document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.querySelector('.play-btn');
    const backgroundMusic = document.getElementById('background-music');
    const sceneAudio = document.getElementById('scene-audio');
    const sceneAudioEng = document.getElementById('scene-audio-eng');
    const introScreen = document.querySelector('.intro-screen');
    const mainScreen = document.querySelector('.main-screen');
    const sceneOverlay = document.querySelector('.scene-overlay');
    const officeScreen = document.querySelector('.office-screen');
    const authorElements = document.querySelectorAll('.author');
    const languageRadios = document.querySelectorAll('input[name="language"]');
    const doorButtons = document.querySelectorAll('.door-btn');

    // Set background music to a lower volume (around 20%)
    backgroundMusic.volume = 0.2;

    // Enhanced music start function with multiple fallbacks
    function startMusic() {
        const tryPlayMusic = () => {
            if (backgroundMusic.paused) {
                backgroundMusic.play().catch(error => {
                    console.log('Autoplay was prevented: ', error);
                });
            }
        };

        // Try multiple ways to start music
        tryPlayMusic();
        
        // Add multiple event listeners
        ['click', 'touchstart', 'mousedown'].forEach(eventType => {
            document.addEventListener(eventType, tryPlayMusic, { 
                passive: true, 
                once: false 
            });
        });
    }

    // Intro animation sequence
    function showAuthors() {
        authorElements.forEach((author, index) => {
            setTimeout(() => {
                author.style.animation = 'fadeInAuthors 1s forwards';
            }, index * 1000);
        });

        // Hide authors and show main screen after a delay
        setTimeout(() => {
            introScreen.style.display = 'none';
            mainScreen.classList.remove('hidden');
        }, 3000);
    }

    // Start music
    startMusic();

    // Start authors display after logo animation
    setTimeout(showAuthors, 2000);

    // Enhanced play button event listener
    function handlePlayClick(event) {
        event.preventDefault();
        event.stopPropagation();
        
        // Determine which audio to play based on language selection
        const selectedLanguage = document.querySelector('input[name="language"]:checked').value;
        const sceneAudioToPlay = selectedLanguage === 'eng' ? sceneAudioEng : sceneAudio;
        const sceneDuration = selectedLanguage === 'eng' ? 51000 : 63000;
        
        // Ensure music is playing
        backgroundMusic.play().catch(error => {
            console.log('Music play error:', error);
        });
        
        // Set scene audio volume to maximum (but within valid range)
        sceneAudioToPlay.volume = 1.0; // Maximum allowed volume
        
        // Fade out main screen
        mainScreen.style.opacity = '0';
        mainScreen.style.transition = 'opacity 0.5s ease';
        
        // Show scene overlay
        sceneOverlay.classList.remove('hidden');
        setTimeout(() => {
            sceneOverlay.classList.add('show');
        }, 50);

        // Play scene audio
        sceneAudioToPlay.play().catch(error => {
            console.log('Scene audio play error:', error);
        });

        // Automatically transition to office after scene duration
        setTimeout(() => {
            sceneOverlay.classList.remove('show');
            
            // Hide scene overlay after fade out
            setTimeout(() => {
                sceneOverlay.classList.add('hidden');
                officeScreen.classList.remove('hidden');
            }, 500);
        }, sceneDuration);
    }

    // Door button interaction
    doorButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const doorType = event.currentTarget.dataset.door;
            console.log(`Clicked door: ${doorType}`);
            // You can add specific logic for each door type here
        });
    });

    // Add multiple event listeners to ensure interactivity
    ['click', 'touchstart'].forEach(eventType => {
        playBtn.addEventListener(eventType, handlePlayClick, { 
            passive: false 
        });
    });
});