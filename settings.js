// path: settings.js
class Settings {
  constructor() {
    this.settings = {
      sfx: true,
      screenEffects: true,
      glitchEffects: true,
      reducedMotion: false,
      highContrast: false,
      musicVolume: 50
    };

    this.loadSettings();
    this.initializeListeners();
    this.initializeMusic();
  }

  loadSettings() {
    const savedSettings = localStorage.getItem('teamtex-settings');
    if (savedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
    }
    this.applySettings();
  }

  saveSettings() {
    localStorage.setItem('teamtex-settings', JSON.stringify(this.settings));
    this.applySettings();
  }

  applySettings() {
    document.body.classList.toggle('reduced-motion', this.settings.reducedMotion);
    document.body.classList.toggle('high-contrast', this.settings.highContrast);
    document.body.classList.toggle('no-effects', !this.settings.screenEffects);
    document.body.classList.toggle('no-glitch', !this.settings.glitchEffects);

    // Update checkboxes and volume slider
    document.getElementById('sfxToggle').checked = this.settings.sfx;
    document.getElementById('screenEffectsToggle').checked = this.settings.screenEffects;
    document.getElementById('glitchEffectsToggle').checked = this.settings.glitchEffects;
    document.getElementById('reducedMotionToggle').checked = this.settings.reducedMotion;
    document.getElementById('highContrastToggle').checked = this.settings.highContrast;
    document.getElementById('musicVolumeSlider').value = this.settings.musicVolume;
  }

  initializeListeners() {
    const settingsModal = document.getElementById('settingsModal');
    const openSettings = document.getElementById('openSettingsMenu');
    const closeSettings = document.getElementById('closeSettings');

    openSettings.addEventListener('click', () => {
      settingsModal.style.display = 'flex';
    });

    closeSettings.addEventListener('click', () => {
      settingsModal.style.display = 'none';
    });

    // Settings toggles
    document.getElementById('sfxToggle').addEventListener('change', (e) => {
      this.settings.sfx = e.target.checked;
      this.saveSettings();
    });

    document.getElementById('screenEffectsToggle').addEventListener('change', (e) => {
      this.settings.screenEffects = e.target.checked;
      this.saveSettings();
    });

    document.getElementById('glitchEffectsToggle').addEventListener('change', (e) => {
      this.settings.glitchEffects = e.target.checked;
      this.saveSettings();
    });

    document.getElementById('reducedMotionToggle').addEventListener('change', (e) => {
      this.settings.reducedMotion = e.target.checked;
      this.saveSettings();
    });

    document.getElementById('highContrastToggle').addEventListener('change', (e) => {
      this.settings.highContrast = e.target.checked;
      this.saveSettings();
    });

    document.getElementById('musicVolumeSlider').addEventListener('input', (e) => {
      this.setVolume(parseInt(e.target.value));
    });

    // Start music when game starts
    document.getElementById('startGame').addEventListener('click', () => {
      this.playMusic();
    });

    // Stop music when returning to menu
    document.getElementById('backToMenu').addEventListener('click', () => {
      this.stopMusic();
    });
  }

  initializeMusic() {
    this.backgroundMusic = new Audio('Background Music.m4a');
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = this.settings.musicVolume / 100;
  }

  playMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.play().catch(e => console.log('Audio play failed:', e));
    }
  }

  stopMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
  }

  setVolume(value) {
    if (this.backgroundMusic) {
      this.settings.musicVolume = value;
      this.backgroundMusic.volume = value / 100;
      this.saveSettings();
    }
  }
}

const gameSettings = new Settings();