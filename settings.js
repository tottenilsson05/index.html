export class Settings {
  constructor() {
    // Default settings
    this.mouseSensitivity = 0.5;
    this.invertY = false;
    this.headBob = true;
    
    // Try to load saved settings
    this.loadSettings();
    this.initUI();
  }

  loadSettings() {
    try {
      const savedSettings = localStorage.getItem('gameSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        this.mouseSensitivity = settings.mouseSensitivity ?? 0.5;
        this.invertY = settings.invertY ?? false;
        this.headBob = settings.headBob ?? true;
      }
    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
  }

  saveSettings() {
    try {
      localStorage.setItem('gameSettings', JSON.stringify({
        mouseSensitivity: this.mouseSensitivity,
        invertY: this.invertY,
        headBob: this.headBob
      }));
    } catch (error) {
      console.warn('Failed to save settings:', error);
    }
  }

  initUI() {
    try {
      // Get UI elements
      const elements = {
        panel: document.getElementById('settings-panel'),
        slider: document.getElementById('mouseSensitivity'),
        value: document.getElementById('sensitivityValue'),
        invertY: document.getElementById('invertY'),
        headBob: document.getElementById('headBob'),
        close: document.getElementById('closeSettings')
      };

      // Validate all elements exist
      Object.entries(elements).forEach(([key, element]) => {
        if (!element) throw new Error(`Settings UI element '${key}' not found`);
      });

      // Set initial values
      elements.slider.value = this.mouseSensitivity;
      elements.value.textContent = this.mouseSensitivity.toFixed(1);
      elements.invertY.checked = this.invertY;
      elements.headBob.checked = this.headBob;

      // Event listeners
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          elements.panel.classList.toggle('hidden');
        }
      });

      elements.slider.addEventListener('input', (e) => {
        this.mouseSensitivity = parseFloat(e.target.value);
        elements.value.textContent = this.mouseSensitivity.toFixed(1);
        this.saveSettings();
      });

      elements.invertY.addEventListener('change', (e) => {
        this.invertY = e.target.checked;
        this.saveSettings();
      });

      elements.headBob.addEventListener('change', (e) => {
        this.headBob = e.target.checked;
        this.saveSettings();
      });

      elements.close.addEventListener('click', () => {
        elements.panel.classList.add('hidden');
      });

    } catch (error) {
      console.error('Settings UI initialization error:', error);
      const errorMsg = document.createElement('div');
      errorMsg.style.color = 'red';
      errorMsg.style.position = 'absolute';
      errorMsg.style.top = '0';
      errorMsg.style.left = '0';
      errorMsg.style.padding = '10px';
      errorMsg.textContent = 'Settings UI Error: ' + error.message;
      document.body.appendChild(errorMsg);
    }
  }
}