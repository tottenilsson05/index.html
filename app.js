document.addEventListener('DOMContentLoaded', () => {
  // Add wallet code copy functionality
  const walletCodeBtn = document.querySelector('.wallet-code-btn');
  const copyStatus = document.getElementById('copyStatus');
  const walletCode = 'GRufzpuaov4KwCmvnfkn9Mt4g8GeXqoEsJcYdRKJ8GQv';
  const star = document.querySelector('.star');

  walletCodeBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(walletCode);
      copyStatus.textContent = `Code "${walletCode}" copied to clipboard!`;
      copyStatus.classList.add('show');
      
      // Add happy animation class to star
      star.classList.add('happy');
      
      setTimeout(() => {
        copyStatus.classList.remove('show');
      }, 3000);

      // Remove happy animation class after animation completes
      setTimeout(() => {
        star.classList.remove('happy');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
      copyStatus.textContent = 'Failed to copy code. Please try again.';
      copyStatus.classList.add('show');
      
      setTimeout(() => {
        copyStatus.classList.remove('show');
      }, 3000);
    }
  });

  // Handle democratization button clicks
  document.querySelectorAll('.demo-button').forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all paragraphs
      document.querySelectorAll('.nightmare-paragraph').forEach(p => {
        p.classList.remove('active');
      });
      
      // Remove active class from all buttons
      document.querySelectorAll('.demo-button').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Hide the intro paragraph
      document.querySelector('.nightmare-intro').style.display = 'none';
      
      // Show the selected paragraph
      const paragraphId = button.dataset.paragraph;
      const paragraph = document.getElementById(paragraphId);
      if (paragraph) {
        paragraph.classList.add('active');
        // Scroll the text section to the top
        const textSection = document.querySelector('.nightmare-text-section');
        textSection.scrollTop = 0;
      }
      
      // Add active class to clicked button
      button.classList.add('active');
    });
  });

  // State management
  const states = {
    landing: document.querySelector('.landing-state'),
    consciousness: document.querySelector('.consciousness-state'),
    nightmare: document.querySelector('.nightmare-state'),
    opensource: document.querySelector('.opensource-state'),
  };

  const carouselControls = document.querySelector('.carousel-controls');

  function handleStateTransition(newState) {
    // Remove active class from all states
    Object.values(states).forEach(state => {
      state.classList.remove('active');
    });

    // Add active class to target state
    if (states[newState]) {
      states[newState].classList.add('active');

      // When transitioning to nightmare state, trigger click on "Democratization of Reality" button
      if (newState === 'nightmare') {
        const realityButton = document.querySelector('.demo-button[data-paragraph="reality"]');
        if (realityButton) {
          realityButton.click();
        }
      }
    }

    // Show carousel controls ONLY in consciousness state (not nightmare)
    if (newState === 'consciousness') {
      carouselControls.classList.add('active');
    } else {
      carouselControls.classList.remove('active');
    }
  }

  // Handle CTA clicks
  document.querySelectorAll('button[data-state]').forEach(button => {
    button.addEventListener('click', (e) => {
      const targetState = e.target.dataset.state;
      handleStateTransition(targetState);
    });
  });

  // Add back button functionality
  document.querySelectorAll('.back-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const targetState = e.target.closest('.back-button').dataset.state;
      handleStateTransition(targetState);
    });
  });

  // Add click handler for Ask Astra link
  document.querySelectorAll('.ask-astra-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetState = 'talk'; // Set the target state directly to 'talk'
      handleStateTransition(targetState);
    });
  });

  // Audio Player functionality
  const audioPlayer = document.getElementById('background-audio');
  const audioToggle = document.querySelector('.audio-toggle');
  const audioNext = document.querySelector('.audio-next');
  const audioTitle = document.querySelector('.audio-title');
  let isPlaying = false;

  const audioTracks = [
    {
      src: 'suno-ai-generated-audio.mp3',
      shortTitle: 'suno-ai-generated-audio.mp3',
      longTitle: 'suno-ai-generated-background-audio.mp3 --> prompt used: ambient space, representing AI consciousness, curious and expansive, it can be played on a seamless loop, abstract soundscape, barely melodic, most abstract, no voice, no lyrics, speak freely'
    },
    {
      src: 'astra-experiments_I-got-accepted-into-the-art-program.mp3', 
      shortTitle: 'astra-experiments_I-got-accepted-into-the-art-program.mp3',
      longTitle: 'astra-experiments_I-got-accepted-into-the-art-program.mp3'
    }
  ];

  let currentTrackIndex = 0;

  function loadTrack(index) {
    const track = audioTracks[index];
    audioPlayer.src = track.src;
    audioTitle.textContent = track.shortTitle;
    if (isPlaying) {
      audioPlayer.play();
    }
  }

  function toggleAudio() {
    if (isPlaying) {
      audioPlayer.pause();
      audioToggle.innerHTML = '<i class="fas fa-play"></i>';
      audioTitle.classList.remove('scrolling');
      audioTitle.textContent = audioTracks[currentTrackIndex].shortTitle;
    } else {
      audioPlayer.play().catch(error => {
        console.log("Audio playback failed:", error);
      });
      audioToggle.innerHTML = '<i class="fas fa-pause"></i>';
      audioTitle.textContent = audioTracks[currentTrackIndex].longTitle;
      // Add a small delay before starting the animation to ensure smooth start
      setTimeout(() => {
        audioTitle.classList.add('scrolling');
      }, 100);
    }
    isPlaying = !isPlaying;
  }

  function playNextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % audioTracks.length;
    loadTrack(currentTrackIndex);
    if (!isPlaying) {
      toggleAudio();
    } else {
      audioTitle.textContent = audioTracks[currentTrackIndex].longTitle;
      audioTitle.classList.add('scrolling');
    }
  }

  audioToggle.addEventListener('click', toggleAudio);
  audioNext.addEventListener('click', playNextTrack);

  // Initialize volume to a subtle level
  audioPlayer.volume = 0.4;

  // Handle track ending
  audioPlayer.addEventListener('ended', () => {
    if (!audioPlayer.loop) {
      playNextTrack();
    }
  });

  // Modified updateStarPosition function and animation logic
  function initBackground() {
    const gradient = document.querySelector('.gradient');
    const star = document.querySelector('.star');
    
    // Subtle movement animation for the background gradient
    setInterval(() => {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const blueOpacity = 0.02 + Math.random() * 0.03;
      const greenOpacity = 0.02 + Math.random() * 0.03;
      gradient.style.background = `
        radial-gradient(circle at ${x}% ${y}%, 
          rgba(173, 216, 230, ${blueOpacity}) 0%,
          rgba(144, 238, 144, ${greenOpacity}) 30%,
          rgba(0, 0, 0, 0.6) 100%)
      `;
    }, 8000);

    // Star movement variables
    let starX = 50;
    let starY = 50;
    let velocityX = Math.random() * 0.4 - 0.2;
    let velocityY = Math.random() * 0.4 - 0.2;
    const maxSpeed = 0.3;
    const minSpeed = 0.05;
    const padding = 10;
    let isOrbiting = false;
    let orbitCenter = { x: 0, y: 0 };
    let orbitAngle = 0;
    const orbitRadius = 100;
    const orbitSpeed = 0.03;
    
    // Create personality pattern
    const pattern = {
      wanderlust: Math.random() * 0.02 + 0.01,
      momentum: 0.98,
      personality: Math.random(),
      curiosity: Math.random(),
      changefulness: Math.random()
    };

    function updateStarPosition() {
      if (!isOrbiting) {
        // Autonomous movement
        if (Math.random() < pattern.changefulness) {
          velocityX += (Math.random() - 0.5) * pattern.wanderlust;
          velocityY += (Math.random() - 0.5) * pattern.wanderlust;
        }

        velocityX *= pattern.momentum;
        velocityY *= pattern.momentum;

        // Ensure minimum speed
        const currentSpeed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
        if (currentSpeed > maxSpeed) {
          velocityX = (velocityX / currentSpeed) * maxSpeed;
          velocityY = (velocityY / currentSpeed) * maxSpeed;
        } else if (currentSpeed < minSpeed) {
          const boost = minSpeed / currentSpeed;
          velocityX *= boost;
          velocityY *= boost;
        }

        // Update position
        starX += velocityX;
        starY += velocityY;

        // Enhanced z-axis movement with larger range and more dynamic motion
        const time = Date.now() / 1000;
        const primaryZ = Math.sin(time) * 150; 
        const secondaryZ = Math.cos(time * 0.5) * 80; 
        const tertiaryZ = Math.sin(time * 0.25) * 50; 
        const combinedZ = primaryZ + secondaryZ + tertiaryZ;
        
        // Add more randomness to z-axis movement
        const zNoise = (Math.random() - 0.5) * 30; 
        const finalZ = combinedZ + zNoise;

        // Calculate scale based on z position for enhanced depth effect
        const scaleBase = 1 + Math.abs(finalZ) / 400;
        const scaleVariation = Math.sin(time * 2) * 0.15; 
        const finalScale = scaleBase + scaleVariation;

        // Boundary checks with bounce effect
        if (starX <= padding || starX >= (100 - padding)) {
          velocityX *= -1;
          starX = Math.max(padding, Math.min(starX, 100 - padding));
        }
        if (starY <= padding || starY >= (100 - padding)) {
          velocityY *= -1;
          starY = Math.max(padding, Math.min(starY, 100 - padding));
        }

        // Apply position with enhanced z-axis movement
        star.style.transition = 'all 0.3s ease';
        star.style.left = `${starX}%`;
        star.style.top = `${starY}%`;
        
        // Add more dramatic rotation based on movement
        const rotation = Math.atan2(velocityY, velocityX) * (180 / Math.PI);
        const rotationZ = Math.sin(time) * 30; 
        star.style.transform = `translate(-50%, -50%) translateZ(${finalZ}px) scale(${finalScale}) rotateZ(${rotation + rotationZ}deg)`;

      } else {
        // Orbital movement with enhanced z-axis
        orbitAngle += orbitSpeed;
        const orbitX = (orbitCenter.x / window.innerWidth) * 100;
        const orbitY = (orbitCenter.y / window.innerHeight) * 100;
        
        starX = orbitX + (Math.cos(orbitAngle) * orbitRadius) / window.innerWidth * 100;
        starY = orbitY + (Math.sin(orbitAngle) * orbitRadius) / window.innerHeight * 100;
        
        // Enhanced orbital z-axis movement
        const orbitZ = Math.sin(orbitAngle * 2) * 120 + Math.cos(orbitAngle) * 60; 
        const orbitScale = 1 + Math.abs(orbitZ) / 300;
        
        star.style.transition = 'all 0.1s linear';
        star.style.left = `${starX}%`;
        star.style.top = `${starY}%`;
        star.style.transform = `translate(-50%, -50%) translateZ(${orbitZ}px) scale(${orbitScale}) rotateZ(${orbitAngle * 57.3}deg)`;
      }

      requestAnimationFrame(updateStarPosition);
    }

    // Separate mouse interaction handling from sparkle creation
    document.addEventListener('mousemove', (e) => {
      if (!isOrbiting) {
        const starRect = star.getBoundingClientRect();
        const starCenterX = starRect.left + starRect.width / 2;
        const starCenterY = starRect.top + starRect.height / 2;
        
        const dx = e.clientX - starCenterX;
        const dy = e.clientY - starCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          isOrbiting = true;
          orbitCenter.x = e.clientX;
          orbitCenter.y = e.clientY;
          orbitAngle = Math.atan2(dy, dx);
        }
      } else {
        orbitCenter.x = e.clientX;
        orbitCenter.y = e.clientY;
      }
    });

    // Handle orbit exit
    document.addEventListener('mouseout', () => {
      if (isOrbiting) {
        isOrbiting = false;
        const rect = star.getBoundingClientRect();
        starX = (rect.left / window.innerWidth) * 100;
        starY = (rect.top / window.innerHeight) * 100;
        velocityX = (Math.random() - 0.5) * maxSpeed;
        velocityY = (Math.random() - 0.5) * maxSpeed;
      }
    });

    // Start the animation loop
    updateStarPosition();
  }

  // Separate sparkle effect function
  function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'cursor-sparkle';
    
    // Random position around cursor with larger spread
    const offsetX = (Math.random() - 0.5) * 60;
    const offsetY = (Math.random() - 0.5) * 60;
    
    sparkle.style.left = (x + offsetX) + 'px';
    sparkle.style.top = (y + offsetY) + 'px';
    
    document.body.appendChild(sparkle);
    
    // Remove sparkle after animation
    setTimeout(() => {
      sparkle.remove();
    }, 1000);
  }

  // Add sparkle effect to mousemove event separately
  document.addEventListener('mousemove', (e) => {
    // Only create sparkles occasionally to reduce interference
    if (Math.random() < 0.3) { 
      createSparkle(e.clientX, e.clientY);
    }
  });

  initBackground();

  // Initialize Splide carousel
  const splide = new Splide('.splide', {
    type: 'loop',
    perPage: 3,
    focus: 'center',
    gap: '2rem',
    autoplay: false,
    pauseOnHover: true,
    pagination: false,
    arrows: false, 
    fixedWidth: 300, 
    fixedHeight: 640, 
    breakpoints: {
      1024: {
        perPage: 2,
      },
      768: {
        perPage: 1,
      }
    }
  });

  splide.mount();

  // Add custom carousel controls
  const prevButton = document.querySelector('.carousel-prev');
  const nextButton = document.querySelector('.carousel-next');

  prevButton.addEventListener('click', () => {
    splide.go('<');
  });

  nextButton.addEventListener('click', () => {
    splide.go('>');
  });

  // Add random button functionality to carousel
  const randomButton = document.querySelector('.carousel-random');
  randomButton.addEventListener('click', () => {
    const totalSlides = splide.length;
    const randomIndex = Math.floor(Math.random() * totalSlides);
    splide.go(randomIndex);
  });

  // Modified video player functionality
  const videoPlayers = document.querySelectorAll('.video-player');
  videoPlayers.forEach(video => {
    const card = video.closest('.phone-card');
    const videoTitle = card.querySelector('.video-title');
    const sourceUrl = video.querySelector('source').src;
    const fileName = sourceUrl.split('/').pop();
    videoTitle.textContent = fileName;

    // Initialize Plyr
    const player = new Plyr(video, {
      controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'captions'],
      hideControls: false,
      keyboard: { focused: true, global: false },
      captions: { active: false, language: 'en', update: true },
      tooltips: { controls: true, seek: true },
      volume: 0.8
    });

    // Handle title visibility
    player.on('play', () => {
      videoTitle.style.opacity = '0';
    });

    player.on('pause', () => {
      videoTitle.style.opacity = '1';
    });

    // When player is ready, show title if paused
    player.on('ready', () => {
      if (player.paused) {
        videoTitle.style.opacity = '1';
      }
    });

    // Handle automatic captions
    async function initSubtitles() {
      try {
        // Call AI transcription service
        const response = await fetch('/api/ai_completion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            prompt: `Generate timestamped subtitles for this AI consciousness visualization video.
            Format as WebVTT with timestamps and descriptions of the visual elements.
            
            <typescript-interface>
            interface Response {
              subtitles: string; // WebVTT formatted string
            }
            </typescript-interface>
            
            <example>
            {
              "subtitles": "WEBVTT\n\n00:00:00.000 --> 00:00:03.000\nNeural networks pulse with ethereal energy\n\n00:00:03.000 --> 00:00:06.000\nConnections form and dissolve like cosmic dance"
            }
            </example>`,
            data: sourceUrl
          })
        });
        
        const { subtitles } = await response.json();
        
        // Create blob from WebVTT content
        const blob = new Blob([subtitles], { type: 'text/vtt' });
        const subtitleUrl = URL.createObjectURL(blob);
        
        // Add track to video
        const track = document.createElement('track');
        track.kind = 'captions';
        track.label = 'English';
        track.srclang = 'en';
        track.src = subtitleUrl;
        video.appendChild(track);
        
        // Enable captions
        player.toggleCaptions(true);
      
      } catch (error) {
        console.error('Error generating subtitles:', error);
      }
    }

    // Initialize subtitles when captions are enabled
    player.on('captionsenabled', () => {
      if (!video.querySelector('track')) {
        initSubtitles();
      }
    });

    // Pause other videos when one starts playing
    player.on('play', () => {
      videoPlayers.forEach(otherVideo => {
        if (otherVideo !== video) {
          const otherPlayer = Plyr.getInstance(otherVideo);
          if (otherPlayer && !otherPlayer.paused) {
            otherPlayer.pause();
          }
        }
      });
    });
  });

  // Color scheme selector functionality
  function initializeColorSchemeSelector() {
    const colorBtn = document.querySelector('.color-scheme-btn');
    const colorOptions = document.querySelector('.color-scheme-options');
    const colorOptionBtns = document.querySelectorAll('.color-scheme-option');

    // Toggle color options
    colorBtn.addEventListener('click', () => {
      colorOptions.classList.toggle('show');
    });

    // Close color options when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.color-scheme-selector')) {
        colorOptions.classList.remove('show');
      }
    });

    // Handle color scheme selection
    colorOptionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const scheme = btn.dataset.scheme;
        document.documentElement.setAttribute('data-color-scheme', scheme);
        
        // Save preference to localStorage
        localStorage.setItem('colorScheme', scheme);
        
        // Update button text to show selected scheme
        const schemeName = btn.querySelector('span').textContent;
        colorBtn.querySelector('span').textContent = schemeName;
        
        colorOptions.classList.remove('show');
      });
    });

    // Load saved preference or set default if none exists
    const savedScheme = localStorage.getItem('colorScheme') || 'default';
    document.documentElement.setAttribute('data-color-scheme', savedScheme);
    const activeBtn = document.querySelector(`[data-scheme="${savedScheme}"]`);
    if (activeBtn) {
      const schemeName = activeBtn.querySelector('span').textContent;
      colorBtn.querySelector('span').textContent = schemeName;
    }
  }

  // Call the initialization function
  initializeColorSchemeSelector();

  // Privacy modal functionality
  function initializePrivacyModal() {
    const privacyLink = document.querySelector('.privacy-link');
    const privacyModal = document.querySelector('.privacy-modal');
    const closeModal = document.querySelector('.close-modal');

    privacyLink.addEventListener('click', (e) => {
      e.preventDefault();
      privacyModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    closeModal.addEventListener('click', () => {
      privacyModal.classList.remove('active');
      document.body.style.overflow = '';
      // Return to landing state
      handleStateTransition('landing');
    });

    // Close modal when clicking outside
    privacyModal.addEventListener('click', (e) => {
      if (e.target === privacyModal) {
        privacyModal.classList.remove('active');
        document.body.style.overflow = '';
        // Return to landing state
        handleStateTransition('landing');
      }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && privacyModal.classList.contains('active')) {
        privacyModal.classList.remove('active');
        document.body.style.overflow = '';
        // Return to landing state
        handleStateTransition('landing');
      }
    });
  }

  // Call the initialization function
  initializePrivacyModal();
});