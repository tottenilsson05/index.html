import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { shapePresets } from './shapes.js';

export class Rorschach3DVisualization {
  constructor(currentPreset, audioData) {
    this.currentPreset = currentPreset || 'random';
    this.audioData = audioData;
    this.audioVisualizationMode = 'amplitude'; 
    this.lastAudioTime = 0;
    this.audioReactiveParams = {
      baseScale: 1,
      colorIntensity: 1,
      movementIntensity: 1,
      rotationSpeed: 1
    };
    
    this.isDragging = false;
    this.invertedParticles = new Set();
    this.morphingParticles = new Map(); 
    this.shapeTypes = [
      new THREE.SphereGeometry(0.15, 32, 32),
      new THREE.BoxGeometry(0.25, 0.25, 0.25),
      new THREE.ConeGeometry(0.15, 0.3, 6),
      new THREE.OctahedronGeometry(0.2),
      new THREE.TorusGeometry(0.15, 0.05, 16, 6)
    ];
    this.infiniteMorph = false;
    this.morphResetTimeout = null;
    
    // Set default values
    this.evolutionSpeed = 5;
    this.complexity = 20;
    this.colorPalette = 'vibrant';
    this.particleSizeVariance = [0.05, 0.25];
    this.isAnimating = true;
    
    this.setup();
    this.createScene();
    this.initPostProcessing();
    this.addEventListeners();
    this.addZoomControl();
    this.animate();
  }

  setup() {
    this.container = document.getElementById('container');
    this.camera = new THREE.PerspectiveCamera(
      70, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    this.camera.position.z = 5;

    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
    this.particles = [];
    this.loadingScreen = document.getElementById('loading-screen');
    
    // Hide ASCII container if visible
    const asciiContainer = document.getElementById('ascii-container');
    if (asciiContainer) {
      asciiContainer.style.display = 'none';
    }

    // Show the 3D container
    this.container.style.display = 'block';

    // Show the loading screen
    if (this.loadingScreen) {
      this.loadingScreen.style.display = 'block';
    }
  }

  createScene() {
    this.generateBlot();
    if (this.loadingScreen) {
      this.loadingScreen.style.display = 'none';
    }

    // Add raycaster for particle detection
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Add mouse events
    this.renderer.domElement.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.handleInversion(e);
    });

    this.renderer.domElement.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.handleInversion(e);
      }
    });

    document.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
  }

  initPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, 0.4, 0.85
    );
    this.composer.addPass(bloomPass);
  }

  addEventListeners() {
    window.addEventListener('resize', this.onWindowResize.bind(this));

    const regenerateBtn = document.getElementById('regenerate');
    if (regenerateBtn) {
      regenerateBtn.addEventListener('click', () => {
        this.isAnimating = true;
        this.regenerate();
      });
    }

    const speedSlider = document.getElementById('speed');
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        this.setEvolutionSpeed(e.target.value);
      });
    }

    const complexitySlider = document.getElementById('complexity');
    if (complexitySlider) {
      complexitySlider.addEventListener('input', (e) => {
        this.complexity = parseInt(e.target.value);
        this.regenerate();
      });
    }

    const colorPaletteSelect = document.getElementById('color-palette');
    if (colorPaletteSelect) {
      colorPaletteSelect.addEventListener('change', (e) => {
        this.colorPalette = e.target.value;
        this.regenerate();
      });
    }

    const resetBtn = document.getElementById('reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetBlot();
      });
    }

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
          // Reset all morphing particles when turning off infinite mode
          this.particles.forEach(particle => {
            this.resetMorphing(particle);
          });
        }
      });
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }

  regenerate() {
    // Clear existing particles
    this.particles.forEach(p => this.scene.remove(p));
    this.particles = [];
    this.invertedParticles.clear();
    this.morphingParticles.clear();
    
    // Regenerate the blot
    this.createScene();
  }

  generateBlot() {
    // Clear existing particles
    this.particles.forEach(p => this.scene.remove(p));
    this.particles = [];

    const centerPoints = this.generateInkBlotShape();
    const geometries = [
      new THREE.SphereGeometry(0.15, 32, 32),
      new THREE.SphereGeometry(0.10, 32, 32),
      new THREE.SphereGeometry(0.20, 32, 32)
    ];

    centerPoints.forEach(point => {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const scale = THREE.MathUtils.randFloat(
        this.particleSizeVariance[0],
        this.particleSizeVariance[1]
      );

      const material = new THREE.MeshBasicMaterial({
        color: this.getParticleColor(),
        transparent: true,
        opacity: THREE.MathUtils.randFloat(0.4, 0.9)
      });

      const particle = new THREE.Mesh(geometry, material);
      particle.scale.setScalar(scale);

      particle.position.copy(point);
      particle.userData.originalPos = particle.position.clone();
      particle.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      );

      // Restore inverted state if particle was previously inverted
      if (this.invertedParticles.has(particle.id)) {
        const currentColor = particle.material.color;
        particle.material.color.setRGB(
          1 - currentColor.r,
          1 - currentColor.g,
          1 - currentColor.b
        );
      }

      // Create mirror particle
      const mirrorParticle = particle.clone();
      mirrorParticle.position.x *= -1;
      mirrorParticle.userData.originalPos = mirrorParticle.position.clone();
      mirrorParticle.userData.velocity = particle.userData.velocity.clone();
      mirrorParticle.userData.velocity.x *= -1;

      if (this.invertedParticles.has(mirrorParticle.id)) {
        const currentColor = mirrorParticle.material.color;
        mirrorParticle.material.color.setRGB(
          1 - currentColor.r,
          1 - currentColor.g,
          1 - currentColor.b
        );
      }

      this.particles.push(particle, mirrorParticle);
      this.scene.add(particle, mirrorParticle);
    });
  }

  generateInkBlotShape() {
    const points = [];
    let currentPreset = this.currentPreset === 'cycledBlots' ?
      shapePresets.cycledBlots.getCurrentPreset() :
      shapePresets[this.currentPreset];
  
    // If currentPreset is null or undefined (for random) or cycledBlots returning random,
    // generate random points
    if (!currentPreset) {
      return this.generateRandomPoints();
    }
  
    const basePoints = currentPreset.features ? 
      this.generatePresetPoints(currentPreset) :
      this.generateRandomPoints();

    // Add noise and variation to the base points
    basePoints.forEach(basePoint => {
      const noiseScale = 0.3;
      for (let i = 0; i < 5; i++) {
        const noise = new THREE.Vector3(
          (Math.random() - 0.5) * noiseScale,
          (Math.random() - 0.5) * noiseScale,
          (Math.random() - 0.5) * noiseScale
        );
        points.push(basePoint.clone().add(noise));
      }
    });

    return points;
  }

  generatePresetPoints(preset) {
    // Add safety check
    if (!preset || !preset.features) {
      return this.generateRandomPoints();
    }

    const points = [];
    preset.features.forEach(feature => {
      // Randomize the feature while maintaining its core characteristics
      const randomizedFeature = shapePresets.randomizeFeature(feature);
      const [x, y, z] = randomizedFeature.pos;
      const count = Math.floor(randomizedFeature.density * this.complexity * 10);
      
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * randomizedFeature.size;
        const variation = Math.sin(angle * 3) * 0.2;
        
        const px = x + Math.cos(angle) * (radius + variation);
        const py = y + Math.sin(angle) * (radius + variation);
        const pz = z + (Math.random() - 0.5) * 0.2;
        
        points.push(new THREE.Vector3(px, py, pz));
      }
    });
    return points;
  }

  generateRandomPoints() {
    const points = [];
    const numPoints = this.complexity * 30;

    const layers = 3;
    for (let layer = 0; layer < layers; layer++) {
      const layerScale = 1 - (layer * 0.2);

      for (let i = 0; i < numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 2;
        const noise = Math.sin(t * 3) * 0.5
          + Math.cos(t * 5) * 0.3
          + Math.sin(t * 7) * 0.2;

        const r = 2 * (1 + noise) * layerScale;
        const x = Math.cos(t) * r * 0.5;
        const y = Math.sin(t) * r;
        const z = (Math.random() - 0.5) * 0.5 * layerScale;

        points.push(new THREE.Vector3(x, y, z));
      }
    }
    return points;
  }

  getParticleColor() {
    switch (this.colorPalette) {
      case 'bloodfire':
        const bloodHue = Math.random() * 0.1; // Red range
        const bloodSat = 0.8 + Math.random() * 0.2;
        return new THREE.Color().setHSL(bloodHue, bloodSat, 0.5);
      
      case 'voidPlasma':
        const voidHue = 0.75 + Math.random() * 0.1; // Purple range
        return new THREE.Color().setHSL(voidHue, 0.9, 0.3 + Math.random() * 0.2);
      
      case 'hellscape':
        const hellHue = Math.random() < 0.5 ? 
          Math.random() * 0.1 : // Red
          0.05 + Math.random() * 0.05; // Orange
        return new THREE.Color().setHSL(hellHue, 1.0, 0.4);
      
      case 'demonicGlow':
        const glowHue = 0.95 + Math.random() * 0.1; // Deep red to purple
        return new THREE.Color().setHSL(glowHue, 0.9, 0.6);
      
      case 'unholyAura':
        const auraHue = 0.3 + Math.random() * 0.1; // Sickly green
        return new THREE.Color().setHSL(auraHue, 0.7, 0.3 + Math.random() * 0.2);
        
      default:
        // Maintain original monochrome as fallback
        const shade = Math.random() * 0.7;
        return new THREE.Color(shade, shade, shade);
    }
  }

  addZoomControl() {
    this.zoomLevel = 1;
    this.container.addEventListener('wheel', (event) => {
      event.preventDefault();
      
      // Adjust zoom based on wheel direction
      const zoomSpeed = 0.1;
      this.zoomLevel += event.deltaY < 0 ? -zoomSpeed : zoomSpeed;
      
      // Clamp zoom level
      this.zoomLevel = Math.max(0.5, Math.min(5, this.zoomLevel));
      
      // Update camera position
      this.camera.position.z = 5 / this.zoomLevel;
      this.camera.updateProjectionMatrix();
    });
  }

  setAudioVisualizationMode(mode) {
    this.audioVisualizationMode = mode;
    // Reset any audio-specific parameters
    this.audioReactiveParams = {
      baseScale: 1,
      colorIntensity: 1,
      movementIntensity: 1,
      rotationSpeed: 1
    };
  }

  updateAudioReactiveParams() {
    if (!this.audioData || this.audioVisualizationMode === 'none') return;

    const audioInfo = this.audioData.getAudioData();
    if (!audioInfo || audioInfo.time === this.lastAudioTime) return;
    this.lastAudioTime = audioInfo.time;

    switch (this.audioVisualizationMode) {
      case 'amplitude':
        const normalizedAmplitude = audioInfo.average / 255;
        this.audioReactiveParams = {
          baseScale: 1 + normalizedAmplitude * 2.5,
          colorIntensity: 1 + normalizedAmplitude * 2.0,
          movementIntensity: 1 + normalizedAmplitude * 3.0,
          rotationSpeed: 1 + normalizedAmplitude * 1.5
        };
        break;

      case 'frequency':
        const bassNorm = audioInfo.bass / 255;
        const midNorm = audioInfo.mid / 255;
        const trebleNorm = audioInfo.treble / 255;

        this.audioReactiveParams = {
          baseScale: 1 + bassNorm * 2.0 + midNorm * 1.5,
          colorIntensity: 1 + midNorm * 1.5 + trebleNorm * 1.0,
          movementIntensity: 1 + bassNorm * 2.5 + trebleNorm * 1.5,
          rotationSpeed: 1 + (midNorm + trebleNorm) * 1.0
        };
        break;

      case 'waveform':
        const waveformIntensity = Array.from(audioInfo.frequencyData)
          .reduce((sum, val) => sum + val, 0) / (audioInfo.frequencyData.length * 255);

        this.audioReactiveParams = {
          baseScale: 1 + Math.sin(audioInfo.time * 2) * waveformIntensity * 2.5,
          colorIntensity: 1 + Math.cos(audioInfo.time * 3) * waveformIntensity * 2.0,
          movementIntensity: 1 + Math.sin(audioInfo.time * 4) * waveformIntensity * 3.0,
          rotationSpeed: 1 + waveformIntensity * 1.5
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

    // Ensure params don't go below 1.0 or above reasonable maximums
    Object.keys(this.audioReactiveParams).forEach(key => {
      this.audioReactiveParams[key] = Math.max(1.0, 
        Math.min(5.0, this.audioReactiveParams[key]));
    });
  }

  updateParticles() {
    if (!this.isAnimating) return;

    // Update audio reactive parameters
    this.updateAudioReactiveParams();

    const time = this.clock.getElapsedTime() * this.evolutionSpeed;

    this.particles.forEach(particle => {
      // Apply audio reactive scaling
      const baseScale = particle.userData.originalScale || 1;
      particle.scale.setScalar(baseScale * this.audioReactiveParams.baseScale);

      // Enhanced noise movement with audio reactivity
      const noiseScale = 0.3 * this.audioReactiveParams.movementIntensity;
      const noiseFreq = 0.15;
      const xNoise = Math.sin(time * noiseFreq + particle.position.x * noiseScale) * 0.002
        + Math.cos(time * noiseFreq * 1.3 + particle.position.y * noiseScale) * 0.001;
      const yNoise = Math.cos(time * noiseFreq + particle.position.y * noiseScale) * 0.002
        + Math.sin(time * noiseFreq * 1.7 + particle.position.x * noiseScale) * 0.001;
      const zNoise = Math.sin(time * noiseFreq * 1.5 + particle.position.z * noiseScale) * 0.001;

      particle.userData.velocity.add(new THREE.Vector3(xNoise, yNoise, zNoise));
      particle.userData.velocity.multiplyScalar(0.95);
      particle.position.add(particle.userData.velocity);

      const attraction = particle.userData.originalPos.clone()
        .sub(particle.position)
        .multiplyScalar(0.008);
      particle.userData.velocity.add(attraction);

      // Enhanced color and opacity with audio reactivity
      const distanceFromCenter = particle.position.length();
      const opacityNoise = Math.sin(time + distanceFromCenter) * 0.2;
      
      particle.material.opacity = THREE.MathUtils.lerp(
        0.8,
        0.2,
        Math.min(1, (distanceFromCenter / 3) + opacityNoise)
      ) * this.audioReactiveParams.colorIntensity;

      if (this.colorPalette === 'monochrome') {
        const shade = THREE.MathUtils.lerp(
          0.1,
          0.6,
          Math.sin(time * 0.5 + distanceFromCenter) * 0.5 + 0.5
        ) * this.audioReactiveParams.colorIntensity;
        particle.material.color.setRGB(shade, shade, shade);
      } else if (this.colorPalette === 'rainbow' || this.colorPalette === 'vibrant') {
        const hue = (time * 0.05 + particle.position.x * 0.1 + particle.position.y * 0.1) % 1;
        const saturation = 0.7 * this.audioReactiveParams.colorIntensity;
        const lightness = 0.5 * this.audioReactiveParams.colorIntensity;
        particle.material.color.setHSL(hue, saturation, lightness);
      }

      // Handle morphing with audio reactivity
      if (this.morphingParticles.has(particle.id)) {
        const morphData = this.morphingParticles.get(particle.id);
        
        morphData.morphProgress += morphData.morphSpeed * this.audioReactiveParams.rotationSpeed;
        
        if (morphData.morphProgress >= 1) {
          // Switch to next shape
          morphData.currentShapeIndex = (morphData.currentShapeIndex + morphData.direction) % this.shapeTypes.length;
          if (morphData.currentShapeIndex === 0 || morphData.currentShapeIndex === this.shapeTypes.length - 1) {
            morphData.direction *= -1;
          }
          morphData.morphProgress = 0;
          
          // Apply new geometry
          const oldGeometry = particle.geometry;
          particle.geometry = this.shapeTypes[morphData.currentShapeIndex].clone();
          oldGeometry.dispose();
          
          // Gradually slow down morphing
          morphData.morphSpeed *= 0.95;
          if (morphData.morphSpeed < 0.01) {
            this.morphingParticles.delete(particle.id);
          }
        }
        
        // Apply rotation during morphing
        particle.rotation.x += morphData.morphSpeed * 0.5;
        particle.rotation.y += morphData.morphSpeed * 0.3;
      }
    });

    // Apply audio-reactive rotation to the entire scene
    this.scene.rotation.y = Math.sin(time * 0.1) * 0.1 * this.audioReactiveParams.rotationSpeed;
    this.scene.rotation.x = Math.cos(time * 0.15) * 0.05 * this.audioReactiveParams.rotationSpeed;
  }

  resetBlot() {
    this.particles.forEach(particle => {
      particle.position.copy(particle.userData.originalPos);
      particle.userData.velocity.set(0, 0, 0);
    });
    this.clock.start();
    this.isAnimating = false;
  }

  saveImage() {
    // Create a new canvas for high-res capture
    const canvas = document.createElement('canvas');
    canvas.width = 3840; 
    canvas.height = 2160; 
    
    // Create temporary renderer for high-res capture
    const tempRenderer = new THREE.WebGLRenderer({ 
      canvas: canvas,
      antialias: true,
      preserveDrawingBuffer: true
    });
    tempRenderer.setSize(canvas.width, canvas.height);
    
    // Adjust camera for the new aspect ratio
    const tempCamera = this.camera.clone();
    tempCamera.aspect = canvas.width / canvas.height;
    tempCamera.updateProjectionMatrix();
    
    // Render the scene
    tempRenderer.render(this.scene, tempCamera);
    
    // Convert to image and download
    const imgData = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imgData;
    link.download = 'rorschach_3d.png';
    link.click();
    
    // Cleanup
    tempRenderer.dispose();
  }

  handleInversion(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.particles);

    intersects.forEach(intersect => {
      const particle = intersect.object;
      const nearbyParticles = this.getNearbyParticles(particle.position, 0.5);
      
      // Handle color inversion
      if (this.invertedParticles.has(particle.id)) {
        this.invertedParticles.delete(particle.id);
        const originalColor = this.getParticleColor();
        particle.material.color.copy(originalColor);
      } else {
        this.invertedParticles.add(particle.id);
        const currentColor = particle.material.color;
        particle.material.color.setRGB(
          1 - currentColor.r,
          1 - currentColor.g,
          1 - currentColor.b
        );
      }
      
      // Initiate shape morphing for clicked and nearby particles
      this.initiateMorphing(particle);
      nearbyParticles.forEach(nearby => this.initiateMorphing(nearby));
    });
  }

  getNearbyParticles(position, radius) {
    return this.particles.filter(p => {
      return p.position.distanceTo(position) < radius;
    });
  }

  initiateMorphing(particle) {
    if (!this.morphingParticles.has(particle.id)) {
      this.morphingParticles.set(particle.id, {
        currentShapeIndex: 0,
        morphProgress: 0,
        morphSpeed: 0.05 + Math.random() * 0.1,
        direction: 1,
        startTime: Date.now() 
      });
    }

    // Increase morph speed for dragging
    if (this.isDragging) {
      const morphData = this.morphingParticles.get(particle.id);
      morphData.morphSpeed = Math.min(morphData.morphSpeed * 1.2, 0.3);
    }

    // Clear any existing reset timeout
    if (this.morphResetTimeout) {
      clearTimeout(this.morphResetTimeout);
    }

    // If infinite morph is not enabled, schedule reset
    if (!this.infiniteMorph) {
      this.morphResetTimeout = setTimeout(() => {
        this.resetMorphing(particle);
      }, 3000); 
    }
  }

  resetMorphing(particle) {
    if (this.morphingParticles.has(particle.id)) {
      particle.geometry.dispose();
      particle.geometry = this.shapeTypes[0].clone(); 
      this.morphingParticles.delete(particle.id);
    }
  }

  setEvolutionSpeed(speed) {
    this.evolutionSpeed = parseFloat(speed);

    // Restart animation loop if it was stopped
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.animate();
    }
  }

  updatePreset(newPreset) {
    this.currentPreset = newPreset;
    this.generateBlot();
  }

  animate() {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    this.updateParticles();
    this.composer.render();
  }

  dispose() {
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    cancelAnimationFrame(this.animationId);
    this.renderer.domElement.remove();
  }
}