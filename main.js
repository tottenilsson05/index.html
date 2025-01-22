import { Rorschach3DVisualization } from './display3d.js';
import { RorschachAsciiVisualization } from './displayAscii.js';
import { shapePresets } from './shapes.js';
import { radioManager } from './internetRadio.js';
import { audioReactivity } from './audioReactivity.js'; // Import the audioReactivity module

class RorschachApp {
  constructor() {
    window.addEventListener('error', (e) => {
      // Ignore 404s for images as they're not critical
      if (e.target && (e.target.tagName === 'IMG' || e.target.tagName === 'IMAGE')) {
        e.preventDefault();
        return;
      }
    });

    // Initialize Web Audio API
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.bufferLength = null;
    this.audioInitialized = false;

    // Set default values with cycledBlots
    this.defaultSettings = {
      evolutionSpeed: 5,
      complexity: 20,
      colorPalette: 'vibrant',
      audioVisualizationMode: 'amplitude',
      currentPreset: 'cycledBlots'  // Set default preset to cycledBlots
    };

    // Timer for cycledBlots
    this.cycleTimer = null;

    // Set default audio intensity
    this.audioIntensity = 1;

    // Initialize audio data reference
    this.audioData = null;

    // Ensure DOM is loaded before initializing
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.init();
      });
    } else {
      this.init();
    }
  }

  init() {
    // Check if all required DOM elements exist
    const requiredElements = [
      'display-mode',
      'shape-preset', 
      'regenerate',
      'speed',
      'complexity',
      'color-palette',
      'reset',
      'fullscreen',
      'save-image',
      'help',
      'infinite-morph',
      'radio-player',
      'audio-player',
      'station-select'
    ];

    // Verify all elements exist before proceeding
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    if (missingElements.length > 0) {
      console.error('Missing required DOM elements:', missingElements);
      return; // Exit initialization if elements are missing
    }

    // Add button to initialize audio
    this.addAudioInitButton();

    this.visualization = null;
    this.displayMode = '3d';
    this.currentPreset = 'cycledBlots';

    // Initialize audio data
    this.audioData = {
      getAudioData: this.getAudioData.bind(this),
      audioContext: this.audioContext,
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
      audioIntensity: this.audioIntensity
    };

    this.bindUIElements();
    this.initVisualization();
    this.initRadioPlayer();

    // Add audio visualization mode selector
    this.addAudioVisualizationControls();

    // Apply default settings
    this.applyDefaultSettings();
  }

  applyDefaultSettings() {
    // Store references to DOM elements
    const speedSlider = document.getElementById('speed');
    const complexitySlider = document.getElementById('complexity'); 
    const colorPalette = document.getElementById('color-palette');
    const audioVisualizationMode = document.getElementById('audio-visualization-mode');
    const shapePreset = document.getElementById('shape-preset');

    // Check elements exist before setting values
    if (speedSlider) {
      speedSlider.value = this.defaultSettings.evolutionSpeed;
    }
    
    if (complexitySlider) {
      complexitySlider.value = this.defaultSettings.complexity; 
    }
    
    if (colorPalette) {
      colorPalette.value = this.defaultSettings.colorPalette;
    }
    
    if (audioVisualizationMode) {
      audioVisualizationMode.value = this.defaultSettings.audioVisualizationMode;
    }

    if (shapePreset) {
      shapePreset.value = this.defaultSettings.currentPreset;
    }

    // Apply settings to visualization if it exists
    if (this.visualization) {
      if (typeof this.visualization.setEvolutionSpeed === 'function') {
        this.visualization.setEvolutionSpeed(this.defaultSettings.evolutionSpeed);
      }
      if (typeof this.visualization.setComplexity === 'function') {
        this.visualization.setComplexity(this.defaultSettings.complexity);
      }
      if (typeof this.visualization.setColorPalette === 'function') {
        this.visualization.setColorPalette(this.defaultSettings.colorPalette);
      }
      if (typeof this.visualization.setAudioVisualizationMode === 'function') {
        this.visualization.setAudioVisualizationMode(this.defaultSettings.audioVisualizationMode);
      }
    }
  }

  initVisualization() {
    if (this.visualization) {
      this.visualization.dispose();
    }

    // Pass the updated audioData object
    this.audioData.audioIntensity = this.audioIntensity;
    if (this.displayMode === '3d') {
      this.visualization = new Rorschach3DVisualization(this.currentPreset, this.audioData);
    } else if (this.displayMode === 'ascii') {
      this.visualization = new RorschachAsciiVisualization(this.currentPreset, this.audioData);
    }

    // Apply default settings after initialization
    this.applyDefaultSettings();

    // If cycledBlots is selected, start the cycling
    if (this.currentPreset === 'cycledBlots') {
      this.startCycledBlots();
    }
  }

  startCycledBlots() {
    if (this.currentPreset !== 'cycledBlots') {
      return;
    }

    // If currently showing random, don't start cycling
    if (this.currentPreset === 'random') {
      return;
    }

    // Clear any existing timer
    if (this.cycleTimer) {
      clearTimeout(this.cycleTimer);
    }

    const cycledBlots = shapePresets.cycledBlots;
    if (!cycledBlots) return;

    // Function to cycle to the next preset
    const cycleToNextPreset = () => {
      const { preset, interval } = cycledBlots.getNextPreset();
      this.currentPreset = preset;
      this.visualization.updatePreset(this.currentPreset);
      
      // Set the next cycle
      this.cycleTimer = setTimeout(cycleToNextPreset, interval);
    };

    // Initialize with the current preset
    const { preset, interval } = cycledBlots.getNextPreset();
    this.currentPreset = preset;
    this.visualization.updatePreset(this.currentPreset);

    // Set the first cycle
    this.cycleTimer = setTimeout(cycleToNextPreset, interval);
  }

  stopCycledBlots() {
    if (this.cycleTimer) {
      clearTimeout(this.cycleTimer);
      this.cycleTimer = null;
    }
  }

  addAudioInitButton() {
    const radioPlayer = document.getElementById('radio-player');
    const initButton = document.createElement('button');
    initButton.textContent = 'Click to Enable Audio';
    initButton.className = 'audio-init-button';
    initButton.addEventListener('click', () => {
      this.initAudioContext();
      initButton.style.display = 'none';
    });
    radioPlayer.insertBefore(initButton, radioPlayer.firstChild);
  }

  initAudioContext() {
    if (this.audioInitialized) return;
    
    radioManager.init().then(success => {
      if (success) {
        this.audioInitialized = true;
        this.setupAudioPlayer();
      } else {
        this.showAudioError('Audio system initialization failed. Please try reloading the page.');
      }
    });
  }

  initRadioPlayer() {
    const stations = radioManager.getStations();
    const stationSelect = document.getElementById('station-select');
    stationSelect.innerHTML = '';
    
    stations.forEach((station, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${station.name} (${station.genre}, ${station.location})`;
      stationSelect.appendChild(option);
    });
  }

  async setupAudioPlayer() {
    const audioPlayer = document.getElementById('audio-player');
    const stationSelect = document.getElementById('station-select');
    
    if (!audioPlayer || !radioManager.getAudioContext()) return;

    radioManager.setupAudioElement(audioPlayer);

    // Initialize analyser and data arrays
    this.analyser = radioManager.getAnalyser();
    this.audioContext = radioManager.getAudioContext(); // Ensure audioContext is assigned
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);

    // Initialize audioReactivity
    audioReactivity.init(this.audioContext, this.analyser);

    // Update audioData with the latest audioContext
    this.audioData.audioContext = this.audioContext;

    const playStation = async (station) => {
      try {
        await radioManager.tryStream(station, audioPlayer);
        this.clearAudioError();
      } catch (error) {
        console.error('Playback Error:', error);
        this.showAudioError(`Unable to play ${station.name}. Please try another station.`);
        
        // Try next station
        const nextIndex = (parseInt(stationSelect.value) + 1) % radioManager.getStations().length;
        stationSelect.value = nextIndex;
        playStation(radioManager.getStations()[nextIndex]);
      }
    };

    stationSelect.addEventListener('change', (e) => {
      const station = radioManager.getStations()[e.target.value];
      if (station) {
        this.clearAudioError();
        playStation(station);
      }
    });

    // Initialize with first station
    if (radioManager.getStations().length > 0) {
      playStation(radioManager.getStations()[0]);
    }
  }

  showAudioError(message) {
    let errorDiv = document.querySelector('.audio-error');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'audio-error';
      const audioPlayer = document.getElementById('audio-player');
      audioPlayer.parentNode.insertBefore(errorDiv, audioPlayer.nextSibling);
    }
    errorDiv.textContent = message;
  }

  clearAudioError() {
    const errorDiv = document.querySelector('.audio-error');
    if (errorDiv) {
      errorDiv.remove();
    }
  }

  addAudioVisualizationControls() {
    const controls = document.querySelector('.controls');
    
    const audioVisualizationDiv = document.createElement('div');
    audioVisualizationDiv.className = 'audio-visualization';
    
    const label = document.createElement('label');
    label.textContent = 'Audio Reactivity';
    
    const select = document.createElement('select');
    select.id = 'audio-visualization-mode';
    
    const options = [
      { value: 'none', text: 'None' },
      { value: 'amplitude', text: 'Amplitude' },
      { value: 'frequency', text: 'Frequency Bands' },
      { value: 'waveform', text: 'Waveform' }
    ];
    
    options.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option.value;
      opt.textContent = option.text;
      select.appendChild(opt);
    });
    
    select.addEventListener('change', (e) => {
      if (this.visualization) {
        this.visualization.setAudioVisualizationMode(e.target.value);
      }
    });
    
    label.appendChild(select);
    audioVisualizationDiv.appendChild(label);

    // Add the intensity slider
    const intensityLabel = document.createElement('label');
    intensityLabel.textContent = 'Audio Intensity';

    const intensitySlider = document.createElement('input');
    intensitySlider.type = 'range';
    intensitySlider.id = 'audio-intensity';
    intensitySlider.min = '0';
    intensitySlider.max = '2';
    intensitySlider.step = '0.1';
    intensitySlider.value = this.audioIntensity;

    intensitySlider.addEventListener('input', (e) => {
      this.audioIntensity = parseFloat(e.target.value);
      if (this.audioData) {
        this.audioData.audioIntensity = this.audioIntensity;
      }
    });

    intensityLabel.appendChild(intensitySlider);
    audioVisualizationDiv.appendChild(intensityLabel);
    
    controls.appendChild(audioVisualizationDiv);
  }

  getAudioData() {
    if (!this.analyser || !this.audioContext) return null; // Ensure audioContext is initialized
    
    // Get frequency data
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate average amplitude
    const average = Array.from(this.dataArray)
      .reduce((sum, value) => sum + value, 0) / this.bufferLength;
    
    // Get specific frequency bands
    const bass = this.getAverageFrequencyRange(20, 140);
    const mid = this.getAverageFrequencyRange(140, 2000);
    const treble = this.getAverageFrequencyRange(2000, 20000);

    return {
      average,
      frequencyData: this.dataArray,
      bass,
      mid,
      treble,
      time: this.audioContext ? this.audioContext.currentTime : 0
    };
  }

  getAverageFrequencyRange(startFreq, endFreq) {
    if (!this.analyser || !this.audioContext) return 0; // Ensure audioContext is initialized
    
    const nyquist = this.audioContext.sampleRate / 2;
    const startIndex = Math.floor((startFreq / nyquist) * this.bufferLength);
    const endIndex = Math.floor((endFreq / nyquist) * this.bufferLength);
    
    let sum = 0;
    for (let i = startIndex; i <= endIndex; i++) {
      sum += this.dataArray[i];
    }
    
    return sum / (endIndex - startIndex + 1);
  }

  bindUIElements() {
    try {
      const displayModeSelect = document.getElementById('display-mode');
      if (displayModeSelect) {
        displayModeSelect.addEventListener('change', (e) => {
          this.displayMode = e.target.value;
          this.initVisualization();
        });
      }

      const shapePresetSelect = document.getElementById('shape-preset');
      if (shapePresetSelect) {
        shapePresetSelect.addEventListener('change', (e) => {
          if (this.currentPreset === 'cycledBlots') {
            this.stopCycledBlots();
          }
          
          this.currentPreset = e.target.value;
          if (this.visualization) {
            this.visualization.updatePreset(this.currentPreset);
          }

          if (this.currentPreset === 'cycledBlots') {
            this.startCycledBlots();
          }
        });
      }

      const regenerateBtn = document.getElementById('regenerate');
      if (regenerateBtn) {
        regenerateBtn.addEventListener('click', () => {
          if (this.visualization && typeof this.visualization.regenerate === 'function') {
            this.visualization.regenerate();
          }
        });
      }

      const speedSlider = document.getElementById('speed');
      if (speedSlider) {
        speedSlider.addEventListener('input', (e) => {
          if (this.visualization && typeof this.visualization.setEvolutionSpeed === 'function') {
            const speed = parseFloat(e.target.value);
            this.visualization.setEvolutionSpeed(speed);
          }
        });
      }

      const complexitySlider = document.getElementById('complexity');
      if (complexitySlider) {
        complexitySlider.addEventListener('input', (e) => {
          if (this.visualization && typeof this.visualization.setComplexity === 'function') {
            const complexity = parseInt(e.target.value);
            this.visualization.setComplexity(complexity);
            this.visualization.regenerate();
          }
        });
      }

      const colorPaletteSelect = document.getElementById('color-palette');
      if (colorPaletteSelect) {
        colorPaletteSelect.addEventListener('change', (e) => {
          if (this.visualization && typeof this.visualization.setColorPalette === 'function') {
            this.visualization.setColorPalette(e.target.value);
          }
        });
      }

      const resetBtn = document.getElementById('reset');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (this.visualization && typeof this.visualization.reset === 'function') {
            this.visualization.reset();
          }
        });
      }

      const fullscreenBtn = document.getElementById('fullscreen');
      if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
              console.warn('Error attempting to enable fullscreen:', err);
            });
          } else if (document.exitFullscreen) {
            document.exitFullscreen().catch(err => {
              console.warn('Error attempting to exit fullscreen:', err);
            });
          }
        });
      }

      const saveBtn = document.getElementById('save-image');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          if (this.visualization && typeof this.visualization.saveImage === 'function') {
            this.visualization.saveImage();
          }
        });
      }

      const helpBtn = document.getElementById('help');
      if (helpBtn) {
        helpBtn.addEventListener('click', () => {
          const modal = document.getElementById('help-modal');
          if (modal) modal.style.display = 'block';
        });
      }

      const closeModal = document.querySelector('.close');
      if (closeModal) {
        closeModal.addEventListener('click', () => {
          const modal = document.getElementById('help-modal');
          if (modal) modal.style.display = 'none';
        });
      }

      window.addEventListener('click', (event) => {
        const modal = document.getElementById('help-modal');
        if (modal && event.target === modal) {
          modal.style.display = 'none';
        }
      });

      const infiniteMorphCheckbox = document.getElementById('infinite-morph');
      if (infiniteMorphCheckbox) {
        infiniteMorphCheckbox.addEventListener('change', (e) => {
          if (this.visualization) {
            this.visualization.infiniteMorph = e.target.checked;
          }
        });
      }

    } catch (error) {
      console.error('Error binding UI elements:', error);
    }
  }

  addZoomControl() {
    // This method is implemented within the visualization classes
    // No additional code needed here unless specific zoom controls are required
  }

  dispose() {
    if (this.visualization) {
      this.visualization.dispose();
    }
    this.stopCycledBlots();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new RorschachApp();
});