// Enhanced AudioReactivityManager with precise timing and optimized performance
export class AudioReactivityManager {
  constructor() {
    // Core audio components
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.scriptNode = null;
    this.gainNode = null;
    this.bufferLength = null;
    this.audioInitialized = false;
    this.scheduledTime = 0;
    
    // Configuration
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    this.config = {
      fftSize: this.isMobile ? 1024 : 2048,
      smoothingTimeConstant: this.isMobile ? 0.9 : 0.85,
      updateInterval: this.isMobile ? 1/30 : 1/60, // 30fps on mobile, 60fps on desktop
      maxDecibels: -10,
      minDecibels: -90,
      preallocatedBuffers: 3
    };

    // Enhanced frequency band definitions with mobile optimization
    this.frequencyBands = {
      sub: { min: 20, max: 60 },
      bass: { min: 60, max: 250 },
      lowMid: { min: 250, max: 500 },
      mid: { min: 500, max: 2000 },
      highMid: { min: 2000, max: 4000 },
      presence: { min: 4000, max: 6000 },
      brilliance: { min: 6000, max: 20000 }
    };

    // Performance optimization buffers
    this.bufferPool = new Map();
    this.processingQueue = [];
    this.lastProcessedTime = 0;
    this.scheduledUpdates = new Set();
    
    // Enhanced timing model
    this.timingModel = {
      lookAhead: 0.1,      // Look-ahead window in seconds
      scheduleAheadTime: 0.1, // How far ahead to schedule audio
      updateInterval: 0.03  // Update interval in seconds
    };

    // Mobile-specific optimizations
    if (this.isMobile) {
      this.initMobileOptimizations();
    }

    // Initialize audio processing worker if supported
    this.initAudioWorker();
  }

  async init() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext({
        latencyHint: this.isMobile ? 'playback' : 'interactive',
        sampleRate: this.isMobile ? 44100 : 48000
      });

      // Initialize analyser with optimized settings
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.config.fftSize;
      this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant;
      this.analyser.maxDecibels = this.config.maxDecibels;
      this.analyser.minDecibels = this.config.minDecibels;

      // Set up gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);

      // Initialize script processor for precise timing
      this.initScriptProcessor();

      // Pre-allocate buffers
      this.bufferLength = this.analyser.frequencyBinCount;
      this.preallocateBuffers();

      // Start precise timing loop
      this.startPreciseTimingLoop();

      this.audioInitialized = true;
      return true;
    } catch (error) {
      console.error('Audio initialization failed:', error);
      return false;
    }
  }

  initScriptProcessor() {
    const bufferSize = this.isMobile ? 4096 : 1024;
    this.scriptNode = this.audioContext.createScriptProcessor(bufferSize, 1, 1);
    this.scriptNode.onaudioprocess = this.handleAudioProcess.bind(this);
    this.scriptNode.connect(this.audioContext.destination);
  }

  handleAudioProcess(event) {
    const currentTime = this.audioContext.currentTime;
    
    // Only process if enough time has elapsed
    if (currentTime - this.lastProcessedTime >= this.config.updateInterval) {
      this.processAudioData(currentTime);
      this.lastProcessedTime = currentTime;
    }
  }

  preallocateBuffers() {
    for (let i = 0; i < this.config.preallocatedBuffers; i++) {
      this.bufferPool.set(i, {
        frequency: new Float32Array(this.bufferLength),
        timeDomain: new Float32Array(this.bufferLength)
      });
    }
  }

  async initAudioWorker() {
    if (window.Worker) {
      try {
        const workerBlob = new Blob([`
          self.onmessage = function(e) {
            const { frequency, timeDomain } = e.data;
            // Perform intensive calculations in worker
            const processed = processAudioData(frequency, timeDomain);
            self.postMessage(processed);
          };

          function processAudioData(frequency, timeDomain) {
            // Implement audio processing logic here
            return {
              frequency: frequency,
              timeDomain: timeDomain,
              processed: true
            };
          }
        `], { type: 'application/javascript' });

        this.audioWorker = new Worker(URL.createObjectURL(workerBlob));
        this.audioWorker.onmessage = this.handleWorkerMessage.bind(this);
      } catch (error) {
        console.warn('Audio worker initialization failed:', error);
      }
    }
  }

  handleWorkerMessage(event) {
    const processedData = event.data;
    if (processedData.processed) {
      this.updateVisualization(processedData);
    }
  }

  startPreciseTimingLoop() {
    const loop = () => {
      const currentTime = this.audioContext.currentTime;
      
      // Schedule upcoming audio events
      while (this.scheduledTime < currentTime + this.timingModel.scheduleAheadTime) {
        this.scheduleNextUpdate(this.scheduledTime);
        this.scheduledTime += this.timingModel.updateInterval;
      }

      // Request next frame
      requestAnimationFrame(loop);
    };

    this.scheduledTime = this.audioContext.currentTime;
    requestAnimationFrame(loop);
  }

  scheduleNextUpdate(time) {
    if (!this.scheduledUpdates.has(time)) {
      const event = {
        time: time,
        execute: () => this.processAudioData(time)
      };
      
      this.scheduledUpdates.add(time);
      this.processingQueue.push(event);

      // Clean up old events
      while (this.processingQueue.length > 0 && 
             this.processingQueue[0].time < time - this.timingModel.lookAhead) {
        this.processingQueue.shift();
      }
    }
  }

  processAudioData(time) {
    if (!this.analyser || !this.audioInitialized) return null;

    const buffer = this.getNextBuffer();
    if (!buffer) return null;

    this.analyser.getFloatFrequencyData(buffer.frequency);
    this.analyser.getFloatTimeDomainData(buffer.timeDomain);

    const processedData = this.isMobile ? 
      this.processMobileOptimized(buffer) : 
      this.processFullFidelity(buffer);

    return {
      raw: {
        frequency: buffer.frequency,
        timeDomain: buffer.timeDomain
      },
      processed: processedData,
      time: time
    };
  }

  getNextBuffer() {
    // Rotate through preallocated buffers
    const nextIndex = (this.lastBufferIndex + 1) % this.config.preallocatedBuffers;
    this.lastBufferIndex = nextIndex;
    return this.bufferPool.get(nextIndex);
  }

  initMobileOptimizations() {
    // Implement mobile-specific optimizations
    this.mobileOptimizations = {
      skipFrames: 2,  // Process every nth frame
      frameCount: 0,
      reducedBands: {  // Simplified frequency bands for mobile
        low: { min: 20, max: 250 },
        mid: { min: 250, max: 2000 },
        high: { min: 2000, max: 6000 }
      }
    };
  }

  processMobileOptimized(buffer) {
    // Skip frames for mobile optimization
    this.mobileOptimizations.frameCount++;
    if (this.mobileOptimizations.frameCount % this.mobileOptimizations.skipFrames !== 0) {
      return this.lastProcessedData;
    }

    // Simplified processing for mobile
    const bands = {};
    Object.entries(this.mobileOptimizations.reducedBands).forEach(([band, range]) => {
      bands[band] = this.calculateBandEnergy(buffer.frequency, range.min, range.max);
    });

    this.lastProcessedData = {
      bands,
      energy: (bands.low + bands.mid + bands.high) / 3
    };

    return this.lastProcessedData;
  }

  processFullFidelity(buffer) {
    // Full processing for desktop
    const bands = {};
    Object.entries(this.frequencyBands).forEach(([band, range]) => {
      bands[band] = this.calculateBandEnergy(buffer.frequency, range.min, range.max);
    });

    return {
      bands,
      energy: Object.values(bands).reduce((sum, val) => sum + val, 0) / Object.keys(bands).length,
      waveform: Array.from(buffer.timeDomain)
    };
  }

  calculateBandEnergy(frequencyData, minFreq, maxFreq) {
    const nyquist = this.audioContext.sampleRate / 2;
    const startBin = Math.floor((minFreq / nyquist) * this.bufferLength);
    const endBin = Math.floor((maxFreq / nyquist) * this.bufferLength);
    
    let sum = 0;
    for (let i = startBin; i <= endBin; i++) {
      // Convert from dB to linear scale
      sum += Math.pow(10, frequencyData[i] / 20);
    }
    
    return sum / (endBin - startBin + 1);
  }

  dispose() {
    if (this.scriptNode) {
      this.scriptNode.disconnect();
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
    }
    if (this.analyser) {
      this.analyser.disconnect();
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    if (this.audioWorker) {
      this.audioWorker.terminate();
    }
    
    this.scheduledUpdates.clear();
    this.processingQueue = [];
    this.bufferPool.clear();
  }

  updateVisualization(processedData) {
    // Implement visualization update logic here
    console.log('Visualization updated:', processedData);
  }
}

// Create and export singleton instance
export const audioReactivity = new AudioReactivityManager();