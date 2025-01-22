import { shapePresets } from './shapes.js';

export class RorschachAsciiVisualization {
  constructor(currentPreset, audioData) {
    this.currentPreset = currentPreset || 'random';
    this.audioData = audioData;
    this.audioVisualizationMode = 'amplitude'; // Set default audio mode
    this.lastAudioTime = 0;
    this.audioReactiveParams = {
      density: 1,
      contrast: 1,
      movement: 1,
      patternScale: 1
    };

    // Set default values
    this.evolutionSpeed = 5;
    this.complexity = 20;
    this.colorPalette = 'vibrant';

    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.invertedPoints = new Set(); // Track inverted positions

    // Define multiple character sets for different density levels
    this.ASCII_SETS = {
      ultra_dense:    '█▀▄▌▐░',
      dense:          '▓▒@#+=', 
      medium:         '8%&?!:',
      light:          '*~^;,.',
      ultra_light:    '· ',
    };
    this.ASCII_WIDTH = 160;
    this.ASCII_HEIGHT = 100;
    this.zoomLevel = 1;
    this.asciiChars = this.generateDensityMap();

    this.infiniteMorph = false;
    this.morphResetTimeout = null;

    this.setup();
    this.addEventListeners();
    this.addZoomControl();
    this.animate();
  }

  setup() {
    this.asciiContainer = document.getElementById('ascii-container');
    this.asciiCanvas = document.getElementById('asciiCanvas');
    
    // Hide 3D container if visible
    const container = document.getElementById('container');
    if (container) {
      container.style.display = 'none';
    }

    // Show ASCII container
    this.asciiContainer.style.display = 'flex';
    this.isAnimating = true;

    // Set up color styles
    this.updateColorPalette();

    // Add mouse event listeners
    this.asciiCanvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.handleInversion(e);
    });

    this.asciiCanvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.handleInversion(e);
      }
    });

    document.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
  }

  generateDensityMap() {
    let chars = '';
    // Combine character sets with weighting for better gradients
    Object.values(this.ASCII_SETS).forEach(set => {
      chars += set.repeat(3); // Repeat each set to create smoother transitions
    });
    return chars;
  }

  generateInkblot() {
    // Update audio reactive parameters
    this.updateAudioReactiveParams();

    const width = this.ASCII_WIDTH;
    const height = this.ASCII_HEIGHT;
    const pattern = Array(height).fill().map(() => Array(width).fill(0));
    
    const preset = shapePresets[this.currentPreset];
    if (preset) {
      preset.features.forEach(feature => {
        const randomizedFeature = shapePresets.randomizeFeature(feature);
        const [baseX, baseY] = randomizedFeature.pos;
        const count = Math.floor(
          randomizedFeature.density * 
          this.complexity * 
          5 * 
          this.audioReactiveParams.density
        );
        
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * 
            randomizedFeature.size * 
            width/4 * 
            this.audioReactiveParams.patternScale;
          
          const variation = Math.sin(angle * 4) * 
            width/8 * 
            this.audioReactiveParams.movement;
          
          const x = Math.floor(width/2 + (baseX + Math.cos(angle) * (radius + variation)) * width/4);
          const mirrorX = Math.floor(width/2 - (baseX + Math.cos(angle) * (radius + variation)) * width/4);
          const y = Math.floor(height/2 + (baseY + Math.sin(angle) * (radius + variation)) * height/4);
          
          const density = randomizedFeature.density * 
            (0.5 + Math.random() * 0.5) * 
            this.audioReactiveParams.contrast;
          
          const spotSize = Math.floor(
            randomizedFeature.size * 
            (8 + Math.random() * 4) * 
            this.audioReactiveParams.patternScale
          );
          
          this.applyDensitySpot(pattern, x, y, spotSize, density);
          this.applyDensitySpot(pattern, mirrorX, y, spotSize, density);
        }
        
        // Add some random noise spots for more variation
        const noiseCount = Math.floor(Math.random() * 5);
        for (let i = 0; i < noiseCount; i++) {
          const x = Math.floor(Math.random() * width/2 + width/4);
          const mirrorX = width - x;
          const y = Math.floor(Math.random() * height);
          const size = Math.floor(Math.random() * 10 + 5);
          const density = Math.random() * 0.4 + 0.1;
          
          this.applyDensitySpot(pattern, x, y, size, density);
          this.applyDensitySpot(pattern, mirrorX, y, size, density);
        }
      });
    } else {
      // Enhanced random pattern generation for non-preset shapes
      for (let i = 0; i < this.complexity * 20; i++) {
        const x = Math.floor(Math.random() * width/2 + width/4);
        const mirrorX = width - x;
        const y = Math.floor(Math.random() * height);
        const size = Math.floor(Math.random() * 15 + 5);
        const density = Math.random() * 0.8 + 0.2;
        
        this.applyDensitySpot(pattern, x, y, size, density);
        this.applyDensitySpot(pattern, mirrorX, y, size, density);
      }
    }

    return pattern;
  }

  applyDensitySpot(pattern, centerX, centerY, size, density) {
    for (let y = -size; y <= size; y++) {
      for (let x = -size; x <= size; x++) {
        const px = Math.floor(centerX + x);
        const py = Math.floor(centerY + y);
        
        if (px >= 0 && px < this.ASCII_WIDTH && py >= 0 && py < this.ASCII_HEIGHT) {
          const distance = Math.sqrt(x*x + y*y);
          if (distance <= size) {
            const angle = Math.atan2(y, x);
            const variation = Math.sin(angle * 4) * 0.3; // Add angular variation
            const falloff = 1 - (distance / size);
            const finalDensity = density * falloff * (1 + variation);
            pattern[py][px] += finalDensity;
          }
        }
      }
    }
  }

  updateColorPalette() {
    let styles = '';
    switch (this.colorPalette) {
      case 'rainbow':
        styles = `
          @keyframes rainbow {
            0% { color: #ff0000; }
            17% { color: #ffa500; }
            33% { color: #ffff00; }
            50% { color: #00ff00; }
            67% { color: #0000ff; }
            83% { color: #4b0082; }
            100% { color: #8f00ff; }
          }
          #asciiCanvas { animation: rainbow 10s linear infinite; }
        `;
        break;
      case 'pastel':
        this.asciiCanvas.style.color = '#ffb3ba';
        styles = `
          #asciiCanvas { text-shadow: 2px 2px 4px rgba(255, 179, 186, 0.5); }
        `;
        break;
      case 'vibrant':
        this.asciiCanvas.style.color = '#00ff00';
        styles = `
          #asciiCanvas { text-shadow: 0 0 5px #00ff00, 0 0 10px #00ff00; }
        `;
        break;
      case 'monochrome':
      default:
        this.asciiCanvas.style.color = '#ffffff';
        this.asciiCanvas.style.textShadow = 'none';
        break;
    }

    // Apply the styles
    let styleSheet = document.getElementById('ascii-styles');
    if (!styleSheet) {
      styleSheet = document.createElement('style');
      styleSheet.id = 'ascii-styles';
      document.head.appendChild(styleSheet);
    }
    styleSheet.textContent = styles;
  }

  convertToAscii(pattern) {
    return pattern.map((row, y) => 
      row.map((density, x) => {
        const posKey = `${x},${y}`;
        let normalizedDensity = Math.min(Math.max(density, 0), 1);
        
        // Invert density if point is in inverted set
        if (this.invertedPoints.has(posKey)) {
          normalizedDensity = 1 - normalizedDensity;
        }
        
        const charIndex = Math.floor(normalizedDensity * (this.asciiChars.length - 1));
        return this.asciiChars[charIndex];
      }).join('')
    ).join('\n');
  }

  handleInversion(e) {
    const rect = this.asciiCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert mouse position to ASCII character position
    const charWidth = rect.width / this.ASCII_WIDTH;
    const charHeight = rect.height / this.ASCII_HEIGHT;
    const charX = Math.floor(x / charWidth);
    const charY = Math.floor(y / charHeight);
    
    // Create unique key for this position
    const posKey = `${charX},${charY}`;
    
    // Toggle inversion for this point
    if (this.invertedPoints.has(posKey)) {
      this.invertedPoints.delete(posKey);
    } else {
      this.invertedPoints.add(posKey);
    }
    
    // Clear any existing reset timeout
    if (this.morphResetTimeout) {
      clearTimeout(this.morphResetTimeout);
    }

    // If infinite morph is not enabled, schedule reset
    if (!this.infiniteMorph) {
      this.morphResetTimeout = setTimeout(() => {
        this.invertedPoints.clear();
        this.regenerate();
      }, 3000); // Reset after 3 seconds
    }

    // Force regeneration of the pattern
    this.regenerate();
  }

  addZoomControl() {
    this.asciiCanvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      
      const zoomSpeed = 0.1;
      this.zoomLevel += event.deltaY < 0 ? zoomSpeed : -zoomSpeed;
      this.zoomLevel = Math.max(0.5, Math.min(3, this.zoomLevel));
      
      const fontSize = 8 * this.zoomLevel;
      this.asciiCanvas.style.fontSize = `${fontSize}px`;
    });
  }

  animate() {
    if (!this.isAnimating) return;
    
    const now = Date.now();
    const delta = (now - this.lastRender) / 1000;
    
    if (delta > 1 / (30 * this.evolutionSpeed)) {
      const pattern = this.generateInkblot();
      const asciiArt = this.convertToAscii(pattern);
      this.asciiCanvas.textContent = asciiArt;
      this.lastRender = now;
    }
    
    requestAnimationFrame(() => this.animate());
  }

  // Interface methods to match 3D visualization
  setColorPalette(palette) {
    this.colorPalette = palette;
    this.updateColorPalette();
  }

  setAudioVisualizationMode(mode) {
    this.audioVisualizationMode = mode;
    this.audioReactiveParams = {
      density: 1,
      contrast: 1,
      movement: 1,
      patternScale: 1
    };
  }

  updateAudioReactiveParams() {
    if (!this.audioData || this.audioVisualizationMode === 'none') return;

    const audioInfo = this.audioData.getAudioData();
    if (!audioInfo || audioInfo.time === this.lastAudioTime) return;
    this.lastAudioTime = audioInfo.time;

    const DENSITY_FACTOR = 0.5;
    const CONTRAST_FACTOR = 0.7;
    const MOVEMENT_FACTOR = 1.5;
    const SCALE_FACTOR = 0.3;

    switch (this.audioVisualizationMode) {
      case 'amplitude':
        const normalizedAmplitude = audioInfo.average / 255;
        this.audioReactiveParams = {
          density: 1 + normalizedAmplitude * DENSITY_FACTOR,
          contrast: 1 + normalizedAmplitude * CONTRAST_FACTOR,
          movement: 1 + normalizedAmplitude * MOVEMENT_FACTOR,
          patternScale: 1 + normalizedAmplitude * SCALE_FACTOR
        };
        break;

      case 'frequency':
        const bassNorm = audioInfo.bass / 255;
        const midNorm = audioInfo.mid / 255;
        const trebleNorm = audioInfo.treble / 255;
        
        this.audioReactiveParams = {
          density: 1 + bassNorm * DENSITY_FACTOR,
          contrast: 1 + midNorm * CONTRAST_FACTOR,
          movement: 1 + trebleNorm * MOVEMENT_FACTOR,
          patternScale: 1 + bassNorm * SCALE_FACTOR
        };
        break;

      case 'waveform':
        const waveformIntensity = Array.from(audioInfo.frequencyData)
          .reduce((sum, val) => sum + val, 0) / (audioInfo.frequencyData.length * 255);
        
        this.audioReactiveParams = {
          density: 1 + Math.sin(audioInfo.time * 2) * waveformIntensity * DENSITY_FACTOR,
          contrast: 1 + Math.cos(audioInfo.time * 3) * waveformIntensity * CONTRAST_FACTOR,
          movement: 1 + Math.sin(audioInfo.time * 4) * waveformIntensity * MOVEMENT_FACTOR,
          patternScale: 1 + waveformIntensity * SCALE_FACTOR
        };
        break;
    }

    // Multiply params by audioIntensity
    const intensityFactor = this.audioData.audioIntensity || 1;
    Object.keys(this.audioReactiveParams).forEach(key => {
      this.audioReactiveParams[key] *= intensityFactor;
      // Clamp values if necessary
      this.audioReactiveParams[key] = Math.min(this.audioReactiveParams[key], 5);
    });
  }

  updatePreset(newPreset) {
    this.currentPreset = newPreset;
  }

  setEvolutionSpeed(speed) {
    this.evolutionSpeed = parseFloat(speed);

    // Restart animation loop if it was stopped
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.animate();
    }
  }

  setComplexity(value) {
    this.complexity = value;
  }

  regenerate() {
    // Clear existing inversions unless infinite morph is enabled
    if (!this.infiniteMorph) {
      this.invertedPoints.clear();
    }
    
    // Generate new pattern
    const pattern = this.generateInkblot();
    const asciiArt = this.convertToAscii(pattern);
    this.asciiCanvas.textContent = asciiArt;
  }

  reset() {
    this.isAnimating = false;
    this.regenerate();
  }

  saveImage() {
    const ascii = this.asciiCanvas.textContent;
    const blob = new Blob([ascii], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rorschach_ascii.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  dispose() {
    this.isAnimating = false;
  }

  addEventListeners() {
    const speedSlider = document.getElementById('speed');
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        this.evolutionSpeed = parseFloat(e.target.value);
      });
    }

    const complexitySlider = document.getElementById('complexity');
    if (complexitySlider) {
      complexitySlider.addEventListener('input', (e) => {
        this.complexity = parseInt(e.target.value);
        this.regenerate();
      });
    }

    // Only add the save-image event listener if it exists
    const saveImageBtn = document.getElementById('save-image');
    if (saveImageBtn) {
      saveImageBtn.addEventListener('click', () => {
        this.saveImage();
      });
    }

    const infiniteMorphCheckbox = document.getElementById('infinite-morph');
    if (infiniteMorphCheckbox) {
      infiniteMorphCheckbox.addEventListener('change', (e) => {
        this.infiniteMorph = e.target.checked;
        if (!this.infiniteMorph) {
          // Reset all inversions when turning off infinite mode
          this.invertedPoints.clear();
          this.regenerate();
        }
      });
    }
  }
}