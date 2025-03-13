// AI Ouija Board with ML Learning Process and Emotional AI Ghost

// Define the possible emotions and their display settings
const EMOTIONS = [
    'neutral',
    'happy',
    'sad',
    'angry',
    'excited', 
    'confused'
];

class NeuralNavigator {
    constructor() {
        // Neural network weights
        this.weights = {
            inputToHidden: this.initializeWeights(4, 8),   // 4 inputs (x, y, targetX, targetY) to 8 hidden
            hiddenToOutput: this.initializeWeights(8, 4)   // 8 hidden to 4 outputs (up, down, left, right)
        };
        
        this.learningRate = 0.1;
        this.iterations = 0;
        this.successRate = 0;
        this.recentAttempts = [];
        this.debugHistory = [];
        
        // Memory bank to store successful moves
        this.memoryBank = {};
        this.badMovesMemory = {}; // New: track bad moves to avoid them
        this.memoryRecallThreshold = 0.6; // Threshold for using memory recall
        
        // New: Add short-term letter memory for repeated characters
        this.shortTermLetterMemory = {};
        this.shortTermMemoryDuration = 10; // Number of iterations to retain short-term memory
        
        // Initialize debug display
        this.initDebugDisplay();
    }
    
    initializeWeights(inputSize, outputSize) {
        const weights = [];
        for (let i = 0; i < inputSize; i++) {
            const neuronWeights = [];
            for (let j = 0; j < outputSize; j++) {
                // Initialize with small random values between -0.5 and 0.5
                neuronWeights.push(Math.random() - 0.5);
            }
            weights.push(neuronWeights);
        }
        return weights;
    }
    
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }
    
    feedForward(inputs) {
        // Calculate hidden layer activations
        const hiddenLayer = [];
        for (let i = 0; i < this.weights.inputToHidden[0].length; i++) {
            let sum = 0;
            for (let j = 0; j < inputs.length; j++) {
                sum += inputs[j] * this.weights.inputToHidden[j][i];
            }
            hiddenLayer.push(this.sigmoid(sum));
        }
        
        // Calculate output layer activations
        const outputLayer = [];
        for (let i = 0; i < this.weights.hiddenToOutput[0].length; i++) {
            let sum = 0;
            for (let j = 0; j < hiddenLayer.length; j++) {
                sum += hiddenLayer[j] * this.weights.hiddenToOutput[j][i];
            }
            outputLayer.push(this.sigmoid(sum));
        }
        
        return { hiddenLayer, outputLayer };
    }
    
    decideMoveDirection(currentX, currentY, targetX, targetY) {
        // Normalize inputs to be between 0 and 1
        const inputs = [
            currentX / 100,
            currentY / 100,
            targetX / 100,
            targetY / 100
        ];
        
        // New: Check short-term letter memory first for recently visited letters
        const targetKey = `${Math.round(targetX)},${Math.round(targetY)}`;
        if (this.shortTermLetterMemory[targetKey] && 
            this.shortTermLetterMemory[targetKey].iterations > this.iterations - this.shortTermMemoryDuration) {
            
            // Use the exact path from short-term memory with high confidence
            return {
                direction: this.shortTermLetterMemory[targetKey].direction,
                confidence: 0.95,
                memoryRecall: true,
                shortTermMemory: true,
                allOutputs: [0.95, 0.95, 0.95, 0.95] // Dummy values
            };
        }
        
        // Try to recall from memory bank first
        const memoryKey = this.getMemoryKey(currentX, currentY, targetX, targetY);
        if (this.memoryBank[memoryKey] && Math.random() < this.memoryRecallThreshold) {
            // Use remembered successful move with some probability
            return {
                direction: this.memoryBank[memoryKey],
                confidence: 0.9,
                memoryRecall: true,
                allOutputs: [0.9, 0.9, 0.9, 0.9] // Dummy values
            };
        }
        
        // Check if we should avoid bad moves
        const badMemoryKey = memoryKey + "|bad";
        const badDirections = this.badMovesMemory && this.badMovesMemory[badMemoryKey] ? 
            this.badMovesMemory[badMemoryKey] : [];
        
        // Get network output
        const { outputLayer } = this.feedForward(inputs);
        
        // Find the highest activation output that isn't in the bad directions list
        let highestIdx = 0;
        let highestVal = -1;
        const directions = ['up', 'down', 'left', 'right'];
        
        // Get distance vector to target to determine good directions
        const dx = targetX - currentX;
        const dy = targetY - currentY;
        const preferredDirections = [];
        
        // Add direction preferences based on target location
        if (dy < 0) preferredDirections.push('up');
        if (dy > 0) preferredDirections.push('down');
        if (dx < 0) preferredDirections.push('left');
        if (dx > 0) preferredDirections.push('right');
        
        // Check for directional avoidance (new)
        const currentGridX = Math.round(currentX/10)*10;
        const currentGridY = Math.round(currentY/10)*10;
        
        // First, give preference to directions that point toward the target
        for (let i = 0; i < outputLayer.length; i++) {
            // Boost output for preferred directions
            let adjustedOutput = outputLayer[i];
            if (preferredDirections.includes(directions[i])) {
                adjustedOutput *= 1.5; // 50% boost for directions that point toward target
            }
            
            // Check directional avoidance count
            const directionalKey = `${currentGridX},${currentGridY}|${directions[i]}`;
            const avoidanceCount = this.badMovesMemory[directionalKey] || 0;
            
            // Apply penalty based on how many times this direction was bad in similar positions
            if (avoidanceCount > 0) {
                adjustedOutput /= (1 + avoidanceCount * 0.5); // Reduce confidence based on avoidance count
            }
            
            if (adjustedOutput > highestVal && !badDirections.includes(directions[i])) {
                highestVal = adjustedOutput;
                highestIdx = i;
            }
        }
        
        // If all directions are bad or no clear winner, prioritize directions toward target
        if (highestVal < 0.3) {
            // Filter valid directions that aren't in bad list
            const validDirections = directions.filter(dir => !badDirections.includes(dir));
            
            // Prioritize directions that point toward the target
            const validPreferred = validDirections.filter(dir => preferredDirections.includes(dir));
            
            if (validPreferred.length > 0) {
                // If we have valid preferred directions, randomly choose one
                const randomIdx = Math.floor(Math.random() * validPreferred.length);
                return {
                    direction: validPreferred[randomIdx],
                    confidence: 0.4,
                    memoryRecall: false,
                    avoidingBad: true,
                    allOutputs: outputLayer
                };
            } else if (validDirections.length > 0) {
                // If no preferred but some valid, choose randomly from valid
                const randomIdx = Math.floor(Math.random() * validDirections.length);
                return {
                    direction: validDirections[randomIdx],
                    confidence: 0.3,
                    memoryRecall: false,
                    avoidingBad: true,
                    allOutputs: outputLayer
                };
            }
        }
        
        // Map index to direction
        return { 
            direction: directions[highestIdx],
            confidence: outputLayer[highestIdx],
            memoryRecall: false,
            allOutputs: outputLayer
        };
    }
    
    // Helper function to create a memory key
    getMemoryKey(currentX, currentY, targetX, targetY) {
        // Round to grid cells of 5% for better generalization
        const gridX = Math.floor(currentX / 5) * 5;
        const gridY = Math.floor(currentY / 5) * 5;
        const gridTargetX = Math.floor(targetX / 5) * 5;
        const gridTargetY = Math.floor(targetY / 5) * 5;
        return `${gridX},${gridY}|${gridTargetX},${gridTargetY}`;
    }

    calculateReward(currentX, currentY, targetX, targetY, previousX, previousY) {
        // Calculate distances
        const prevDistance = Math.sqrt(Math.pow(previousX - targetX, 2) + Math.pow(previousY - targetY, 2));
        const newDistance = Math.sqrt(Math.pow(currentX - targetX, 2) + Math.pow(currentY - targetY, 2));
        
        // Proportional reward based on distance improvement
        const distanceImprovement = prevDistance - newDistance;
        let reward = distanceImprovement * 3;
        
        // Find the direction that was taken
        let direction = 'up'; // Default
        if (currentY > previousY) direction = 'down';
        else if (currentY < previousY) direction = 'up';
        else if (currentX < previousX) direction = 'left';
        else if (currentX > previousX) direction = 'right';
        
        // If we're getting closer, positive reward
        if (newDistance < prevDistance) {
            reward = Math.max(1.0, reward); // At least 1.0 for getting closer
            
            // Add exponential bonus for getting very close
            if (newDistance < 15) {
                reward += (15 - newDistance) / 3;
            }
            
            // Add to memory bank if this was a good move
            if (reward > 1.5) {
                const memoryKey = this.getMemoryKey(previousX, previousY, targetX, targetY);
                this.memoryBank[memoryKey] = direction;
            }
        } 
        // If we're at the target, big reward
        else if (newDistance < 5) {
            reward = 3.0;
            
            // Definitely remember this successful path
            const memoryKey = this.getMemoryKey(previousX, previousY, targetX, targetY);
            this.memoryBank[memoryKey] = direction;
            
            // New: Add to short-term letter memory with exact coordinates
            const targetKey = `${Math.round(targetX)},${Math.round(targetY)}`;
            this.shortTermLetterMemory[targetKey] = {
                direction: direction,
                iterations: this.iterations,
                from: { x: previousX, y: previousY },
                to: { x: targetX, y: targetY }
            };
        }
        // Otherwise, negative reward
        else {
            // Make punishment stronger to discourage back-tracking
            reward = Math.min(-2.0, reward * 3); // Increased negative reward for moving away (was -1.5 and *2)
            
            // Add additional penalty the farther away we get
            const distanceDiff = newDistance - prevDistance;
            reward -= distanceDiff * 1.0; // Increased penalty factor (was 0.5)
            
            // Remember this bad move to avoid repeating it
            const badMemoryKey = this.getMemoryKey(previousX, previousY, targetX, targetY) + "|bad";
            
            // Store the bad direction to avoid it in future
            if (!this.badMovesMemory) this.badMovesMemory = {};
            if (!this.badMovesMemory[badMemoryKey]) this.badMovesMemory[badMemoryKey] = [];
            if (!this.badMovesMemory[badMemoryKey].includes(direction)) {
                this.badMovesMemory[badMemoryKey].push(direction);
            }
            
            // New: Create directional avoidance system
            const directionalKey = `${Math.round(previousX/10)*10},${Math.round(previousY/10)*10}|${direction}`;
            if (!this.badMovesMemory[directionalKey]) {
                this.badMovesMemory[directionalKey] = 0;
            }
            this.badMovesMemory[directionalKey] += 1; // Increment avoidance counter for this direction
        }
        
        return reward;
    }
    
    learn(currentX, currentY, targetX, targetY, previousX, previousY, direction) {
        // Increment training iterations
        this.iterations++;
        
        // Prepare inputs
        const inputs = [
            previousX / 100,
            previousY / 100,
            targetX / 100,
            targetY / 100
        ];
        
        // Calculate reward
        const reward = this.calculateReward(currentX, currentY, targetX, targetY, previousX, previousY);
        
        // Create target outputs based on the reward
        const targetOutputs = [0, 0, 0, 0]; // [up, down, left, right]
        const directionMap = { 'up': 0, 'down': 1, 'left': 2, 'right': 3 };
        
        // More nuanced learning - set all outputs low, but the chosen direction matches reward
        for (let i = 0; i < 4; i++) {
            targetOutputs[i] = 0.1; // Baseline low activation
        }
        
        // The chosen direction gets reward-based target
        targetOutputs[directionMap[direction]] = reward > 0 ? Math.min(0.9, 0.2 + reward/5) : 0.05;
        
        // Update success rate tracking with more nuanced values
        this.recentAttempts.push(reward > 0 ? Math.min(1, reward/2) : 0);
        if (this.recentAttempts.length > 20) this.recentAttempts.shift();
        this.successRate = this.recentAttempts.reduce((sum, val) => sum + val, 0) / this.recentAttempts.length;
        
        // More adaptive learning rate based on success
        if (this.successRate > 0.7) {
            this.learningRate = Math.max(0.01, this.learningRate * 0.98);
            this.memoryRecallThreshold = Math.min(0.8, this.memoryRecallThreshold + 0.01);
        } else if (this.successRate < 0.4) {
            this.learningRate = Math.min(0.5, this.learningRate * 1.05);
            this.memoryRecallThreshold = Math.max(0.3, this.memoryRecallThreshold - 0.01);
        }
        
        // Perform backpropagation
        const error = this.backpropagate(inputs, targetOutputs, this.learningRate);
        
        // Log debug info
        this.logDebugInfo({
            iteration: this.iterations,
            direction,
            reward,
            error,
            successRate: this.successRate,
            learningRate: this.learningRate,
            memorySize: Object.keys(this.memoryBank).length,
            memoryRecall: this.memoryRecallThreshold.toFixed(2),
            inputs,
            outputs: targetOutputs
        });
        
        return reward;
    }
    
    backpropagate(inputs, targetOutputs, learningRate) {
        // Forward pass
        const { hiddenLayer, outputLayer } = this.feedForward(inputs);
        
        // Calculate output layer errors
        const outputErrors = [];
        for (let i = 0; i < outputLayer.length; i++) {
            outputErrors.push(targetOutputs[i] - outputLayer[i]);
        }
        
        // Calculate hidden layer errors
        const hiddenErrors = [];
        for (let i = 0; i < hiddenLayer.length; i++) {
            let error = 0;
            for (let j = 0; j < outputLayer.length; j++) {
                error += outputErrors[j] * this.weights.hiddenToOutput[i][j];
            }
            hiddenErrors.push(error);
        }
        
        // Update hidden to output weights
        for (let i = 0; i < hiddenLayer.length; i++) {
            for (let j = 0; j < outputLayer.length; j++) {
                const delta = outputErrors[j] * outputLayer[j] * (1 - outputLayer[j]) * hiddenLayer[i];
                this.weights.hiddenToOutput[i][j] += learningRate * delta;
            }
        }
        
        // Update input to hidden weights
        for (let i = 0; i < inputs.length; i++) {
            for (let j = 0; j < hiddenLayer.length; j++) {
                const delta = hiddenErrors[j] * hiddenLayer[j] * (1 - hiddenLayer[j]) * inputs[i];
                this.weights.inputToHidden[i][j] += learningRate * delta;
            }
        }
        
        // Return total error magnitude for monitoring
        return outputErrors.reduce((sum, err) => sum + Math.abs(err), 0);
    }
    
    logDebugInfo(info) {
        // Add to history
        this.debugHistory.push(info);
        if (this.debugHistory.length > 20) this.debugHistory.shift();
        
        // Update UI
        document.querySelector('.iteration-counter').textContent = `Iteration: ${info.iteration}`;
        document.querySelector('.success-rate').textContent = `${Math.round(info.successRate * 100)}%`;
        document.querySelector('.learning-rate').textContent = info.learningRate.toFixed(4);
        document.querySelector('.last-error').textContent = info.error.toFixed(4);
        document.querySelector('.last-decision').textContent = `${info.direction} (${info.reward > 0 ? 'Good' : 'Bad'})`;
        
        // Add memory info if element exists
        const memoryElement = document.querySelector('.memory-size');
        if (memoryElement) {
            const badMovesCount = Object.keys(this.badMovesMemory || {}).length;
            const shortTermCount = Object.keys(this.shortTermLetterMemory).length;
            memoryElement.textContent = `${info.memorySize} paths (${info.memoryRecall}), ${badMovesCount} avoided, ${shortTermCount} short-term`;
        }
        
        // Update progress bar
        const progressBar = document.querySelector('.debug-bar');
        progressBar.style.width = `${Math.min(100, info.iteration / 10)}%`;
        
        // Update log
        const logContainer = document.querySelector('.debug-log');
        const logEntry = document.createElement('div');
        logEntry.textContent = `[${info.iteration}] ${info.direction.toUpperCase()} → ${info.reward > 0 ? '✓' : '✗'} (${info.reward.toFixed(1)})`;
        logEntry.style.color = info.reward > 0 ? '#0f0' : '#f00';
        logContainer.prepend(logEntry);
        
        // Limit log entries
        if (logContainer.children.length > 5) {
            logContainer.removeChild(logContainer.lastChild);
        }
    }
    
    initDebugDisplay() {
        // Create debug container if it doesn't exist
        if (!document.querySelector('.neural-debug')) {
            const debugContainer = document.createElement('div');
            debugContainer.className = 'neural-debug';
            
            const debugTitle = document.createElement('div');
            debugTitle.className = 'debug-title';
            debugTitle.innerHTML = '<span>Neural Network Learning Debug</span><span class="iteration-counter">Iteration: 0</span>';
            debugContainer.appendChild(debugTitle);
            
            // Success rate display
            const successRateRow = document.createElement('div');
            successRateRow.className = 'debug-row';
            successRateRow.innerHTML = '<div class="debug-label">Success Rate:</div><div class="debug-value success-rate">0%</div>';
            debugContainer.appendChild(successRateRow);
            
            // Learning rate display
            const learningRateRow = document.createElement('div');
            learningRateRow.className = 'debug-row';
            learningRateRow.innerHTML = '<div class="debug-label">Learning Rate:</div><div class="debug-value learning-rate">0.1</div>';
            debugContainer.appendChild(learningRateRow);
            
            // Memory size display
            const memoryRow = document.createElement('div');
            memoryRow.className = 'debug-row';
            memoryRow.innerHTML = '<div class="debug-label">Memory Bank:</div><div class="debug-value memory-size">0 paths (0.6)</div>';
            debugContainer.appendChild(memoryRow);
            
            // Error display
            const errorRow = document.createElement('div');
            errorRow.className = 'debug-row';
            errorRow.innerHTML = '<div class="debug-label">Last Error:</div><div class="debug-value last-error">N/A</div>';
            debugContainer.appendChild(errorRow);
            
            // Last decision
            const decisionRow = document.createElement('div');
            decisionRow.className = 'debug-row';
            decisionRow.innerHTML = '<div class="debug-label">Last Decision:</div><div class="debug-value last-decision">N/A</div>';
            debugContainer.appendChild(decisionRow);
            
            // Learning progress bar
            const progressRow = document.createElement('div');
            progressRow.className = 'debug-row';
            progressRow.innerHTML = '<div class="debug-label">Learning Progress:</div>';
            debugContainer.appendChild(progressRow);
            
            const progressGraph = document.createElement('div');
            progressGraph.className = 'debug-graph';
            const progressBar = document.createElement('div');
            progressBar.className = 'debug-bar';
            progressGraph.appendChild(progressBar);
            progressRow.appendChild(progressGraph);
            
            // Recent log
            const logTitle = document.createElement('div');
            logTitle.className = 'debug-label';
            logTitle.textContent = 'Recent Activity:';
            debugContainer.appendChild(logTitle);
            
            const logContainer = document.createElement('div');
            logContainer.className = 'debug-log';
            debugContainer.appendChild(logContainer);
            
            // Add to controls
            document.querySelector('.controls').appendChild(debugContainer);
        }
    }
}

class GhostAI {
    constructor() {
        this.emotion = 'neutral';
        this.confidence = 0;
        this.learningRate = 0.05;
        this.conversationHistory = [];
        this.letterPositions = {};
        this.currentPath = [];
        this.personality = "a mysterious spirit communicating through a Ouija board";
        
        // Replace Q-learning with Neural Network
        this.neuralNavigator = new NeuralNavigator();
        
        // Previous position tracker for learning
        this.previousPosition = { x: 50, y: 50 };
        
        // Audio context for voice synthesis
        this.audioContext = null;
        this.voiceEffects = {
            distortion: null,
            reverb: null,
            delay: null
        };
    }
    
    // Initialize audio context and effects
    initAudio() {
        try {
            // Only initialize once and only when needed (on first audio play)
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                // Create distortion effect
                this.voiceEffects.distortion = this.audioContext.createWaveShaper();
                this.makeDistortionCurve(this.voiceEffects.distortion, 50);
                
                // Create reverb effect
                this.voiceEffects.reverb = this.audioContext.createConvolver();
                this.createReverb(this.voiceEffects.reverb);
                
                // Create delay effect
                this.voiceEffects.delay = this.audioContext.createDelay(0.5);
                this.voiceEffects.delay.delayTime.value = 0.3;
                
                // Create feedback for delay
                this.voiceEffects.feedback = this.audioContext.createGain();
                this.voiceEffects.feedback.gain.value = 0.3;
                
                // Connect feedback loop for delay
                this.voiceEffects.delay.connect(this.voiceEffects.feedback);
                this.voiceEffects.feedback.connect(this.voiceEffects.delay);
            }
        } catch (e) {
            console.error("Web Audio API not supported:", e);
        }
    }
    
    // Function to create distortion curve for voice effect
    makeDistortionCurve(distortion, amount) {
        const k = amount;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < n_samples; ++i) {
            const x = i * 2 / n_samples - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        
        distortion.curve = curve;
        distortion.oversample = '4x';
    }
    
    // Create impulse response for reverb
    createReverb(convolverNode) {
        // Create an impulse response buffer
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * 2; // 2 seconds
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);
        const leftChannel = impulse.getChannelData(0);
        const rightChannel = impulse.getChannelData(1);
        
        // Fill buffer with noise with exponential decay
        for (let i = 0; i < length; i++) {
            const decay = Math.pow(0.5, i / (sampleRate * 0.5)); // 0.5s decay
            leftChannel[i] = (Math.random() * 2 - 1) * decay;
            rightChannel[i] = (Math.random() * 2 - 1) * decay;
        }
        
        convolverNode.buffer = impulse;
    }
    
    // Speak using the Web Speech API with ghost effects
    speakMessage(message) {
        if (!message) return;
        
        // Check if audio is enabled
        const audioEnabled = document.getElementById('enable-audio').checked;
        if (!audioEnabled) return;
        
        // Initialize audio if not already done
        this.initAudio();
        
        // Indicate that audio processing is happening
        const outputText = document.getElementById('output-text');
        outputText.innerHTML += '<div class="processing-audio">Converting to spectral voice...</div>';
        
        try {
            // Create speech synthesis utterance
            const utterance = new SpeechSynthesisUtterance(message);
            
            // Adjust voice based on ghost emotion
            switch(this.emotion) {
                case 'angry':
                    utterance.pitch = 0.7;
                    utterance.rate = 1.2;
                    break;
                case 'sad':
                    utterance.pitch = 0.8;
                    utterance.rate = 0.8;
                    break;
                case 'happy':
                    utterance.pitch = 1.1;
                    utterance.rate = 1.1;
                    break;
                case 'excited':
                    utterance.pitch = 1.2;
                    utterance.rate = 1.3;
                    break;
                case 'confused':
                    utterance.pitch = 1.0;
                    utterance.rate = 0.9;
                    break;
                default: // neutral
                    utterance.pitch = 0.9;
                    utterance.rate = 0.95;
            }
            
            // Try to get a spooky voice
            const voices = window.speechSynthesis.getVoices();
            const preferredVoices = voices.filter(voice => 
                voice.name.toLowerCase().includes('whisper') || 
                voice.name.toLowerCase().includes('deep') ||
                voice.name.toLowerCase().includes('dark')
            );
            
            if (preferredVoices.length > 0) {
                utterance.voice = preferredVoices[0];
            }
            
            // Create audio element for additional effects processing
            const audioElement = document.createElement('audio');
            audioElement.className = 'ghost-voice';
            audioElement.style.display = 'none';
            document.body.appendChild(audioElement);
            
            // Add random static/white noise bursts during playback
            this.addStaticNoiseEffect(message.length * 100);
            
            // Play the speech
            utterance.onend = () => {
                // Remove processing indicator when speech ends
                const processingEl = document.querySelector('.processing-audio');
                if (processingEl) processingEl.remove();
                
                // Clean up audio element
                setTimeout(() => {
                    if (audioElement) audioElement.remove();
                }, 1000);
            };
            
            window.speechSynthesis.speak(utterance);
            
        } catch (error) {
            console.error("Speech synthesis failed:", error);
            const processingEl = document.querySelector('.processing-audio');
            if (processingEl) processingEl.textContent = "Voice manifestation failed...";
        }
    }
    
    // Add static noise effect like spirit box/EVP
    addStaticNoiseEffect(duration) {
        try {
            // Create a series of short white noise bursts
            const burstCount = Math.floor(duration / 200) + 3; // At least 3 bursts
            
            for (let i = 0; i < burstCount; i++) {
                setTimeout(() => {
                    // Create noise burst
                    const oscillator = this.audioContext.createOscillator();
                    const noiseGain = this.audioContext.createGain();
                    
                    // Create noise by rapidly changing frequency
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.value = 100 + Math.random() * 1000;
                    
                    // Set volume (random volume for more natural effect)
                    noiseGain.gain.value = 0.01 + Math.random() * 0.05;
                    
                    // Create filter to shape noise
                    const filter = this.audioContext.createBiquadFilter();
                    filter.type = 'bandpass';
                    filter.frequency.value = 800 + Math.random() * 2000;
                    filter.Q.value = 0.7;
                    
                    // Connect and start
                    oscillator.connect(filter);
                    filter.connect(this.voiceEffects.distortion);
                    this.voiceEffects.distortion.connect(this.voiceEffects.reverb);
                    this.voiceEffects.reverb.connect(this.voiceEffects.delay);
                    this.voiceEffects.delay.connect(noiseGain);
                    noiseGain.connect(this.audioContext.destination);
                    
                    // Start and stop with short duration
                    oscillator.start();
                    
                    // Random duration for more supernatural effect
                    const burstDuration = 50 + Math.random() * 150;
                    
                    // Clean up
                    setTimeout(() => {
                        oscillator.stop();
                        oscillator.disconnect();
                        filter.disconnect();
                        noiseGain.disconnect();
                    }, burstDuration);
                    
                }, 200 * i + Math.random() * 300); // Stagger the bursts with randomness
            }
        } catch (e) {
            console.error("Audio effect error:", e);
        }
    }
    
    // Update personality description
    setPersonality(description) {
        this.personality = description || "a mysterious spirit communicating through a Ouija board";
    }
    
    // Update emotion based on question and response content
    updateEmotion(question, response) {
        // Simple emotion rules based on content
        if (!question || !response) {
            this.setEmotion('neutral');
            return;
        }
        
        const lowerQuestion = question.toLowerCase();
        const lowerResponse = response.toLowerCase();
        
        // Check for emotional triggers in question
        if (lowerQuestion.includes('love') || lowerQuestion.includes('happy') || 
            lowerQuestion.includes('friend') || lowerQuestion.includes('good')) {
            this.setEmotion('happy');
        } else if (lowerQuestion.includes('sad') || lowerQuestion.includes('death') || 
                  lowerQuestion.includes('miss') || lowerQuestion.includes('lost')) {
            this.setEmotion('sad');
        } else if (lowerQuestion.includes('hate') || lowerQuestion.includes('angry') || 
                  lowerQuestion.includes('mad')) {
            this.setEmotion('angry');
        } else if (lowerQuestion.includes('why') || lowerQuestion.includes('how come') || 
                  lowerQuestion.includes('confus')) {
            this.setEmotion('confused');
        } else if (lowerQuestion.includes('wow') || lowerQuestion.includes('amazing') || 
                  lowerQuestion.includes('excit')) {
            this.setEmotion('excited');
        } else {
            // Determine emotion based on response
            if (lowerResponse.includes('yes') || lowerResponse.includes('happy') || 
                lowerResponse.includes('love')) {
                this.setEmotion('happy');
            } else if (lowerResponse.includes('no') || lowerResponse.includes('sad') || 
                      lowerResponse.includes('sorry')) {
                this.setEmotion('sad');
            } else if (lowerResponse.includes('angry') || lowerResponse.includes('hate') || 
                      lowerResponse.includes('!')) {
                this.setEmotion('angry');
            } else if (lowerResponse.includes('?') || lowerResponse.includes('perhaps') || 
                      lowerResponse.includes('maybe')) {
                this.setEmotion('confused');
            } else if (lowerResponse.includes('wow') || lowerResponse.includes('amazing') || 
                      lowerResponse.length > 30) {
                this.setEmotion('excited');
            } else {
                this.setEmotion('neutral');
            }
        }
    }
    
    setEmotion(emotion) {
        this.emotion = emotion;
        
        // Update visual representation
        const ghostElement = document.querySelector('.ghost');
        ghostElement.className = 'ghost'; // Reset
        ghostElement.classList.add(emotion);
        
        // Update emotion display
        document.getElementById('current-emotion').textContent = 
            emotion.charAt(0).toUpperCase() + emotion.slice(1);
    }
    
    calculatePathToLetter(targetLetter) {
        const planchette = document.querySelector('.planchette');
        const currentX = parseInt(planchette.style.left) || 50;
        const currentY = parseInt(planchette.style.top) || 50;
        
        if (!this.letterPositions[targetLetter]) {
            console.error(`Position for letter ${targetLetter} not found`);
            return { x: currentX, y: currentY };
        }
        
        const targetX = this.letterPositions[targetLetter].x;
        const targetY = this.letterPositions[targetLetter].y;
        
        // Save current position for learning
        const previousX = this.previousPosition.x;
        const previousY = this.previousPosition.y;
        
        // Use neural network to decide move
        const { direction, confidence } = this.neuralNavigator.decideMoveDirection(currentX, currentY, targetX, targetY);
        
        // Calculate new position based on the chosen direction
        let newX = currentX;
        let newY = currentY;
        
        const stepSize = 10 + (1 - confidence) * 20; // Less confident = bigger steps
        
        if (direction === 'up') newY = Math.max(0, currentY - stepSize);
        else if (direction === 'down') newY = Math.min(100, currentY + stepSize);
        else if (direction === 'left') newX = Math.max(0, currentX - stepSize);
        else if (direction === 'right') newX = Math.min(100, currentX + stepSize);
        
        // Learn from this move
        this.neuralNavigator.learn(newX, newY, targetX, targetY, previousX, previousY, direction);
        
        // Update previous position for next learning cycle
        this.previousPosition = { x: newX, y: newY };
        
        // If we're close to target, just return target
        const distX = Math.abs(newX - targetX);
        const distY = Math.abs(newY - targetY);
        if (distX < 8 && distY < 8) {
            return { x: targetX, y: targetY };
        }
        
        // Otherwise return the calculated position
        return { x: newX, y: newY };
    }
    
    async getResponse(question) {
        try {
            // Add the question to the conversation history
            this.conversationHistory.push({
                role: "user",
                content: question
            });
            
            // Keep only the last 5 messages to avoid context overflow
            if (this.conversationHistory.length > 10) {
                this.conversationHistory = this.conversationHistory.slice(-10);
            }
            
            // Create system prompt using the personality description
            const systemPrompt = `You are ${this.personality}. Keep responses concise (under 50 characters if possible). Occasionally be cryptic or mysterious. Don't use quotes around your response.`;
            
            // Get AI response
            const completion = await websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    ...this.conversationHistory
                ]
            });
            
            const response = completion.content.trim();
            
            // Add the response to history
            this.conversationHistory.push({
                role: "assistant",
                content: response
            });
            
            // Update ghost emotion based on the interaction
            this.updateEmotion(question, response);
            
            return response;
        } catch (error) {
            console.error("Error getting AI response:", error);
            this.setEmotion('confused');
            return "I CANNOT ANSWER NOW";
        }
    }
}

class OuijaBoard {
    constructor() {
        this.ghost = new GhostAI();
        this.isAnimating = false;
        this.response = "";
        this.currentIndex = 0;
        
        this.initBoard();
        this.setupEventListeners();
        this.createAIInfoModal();
    }
    
    initBoard() {
        // Map letter positions
        const letters = document.querySelectorAll('.letter');
        letters.forEach(letter => {
            const rect = letter.getBoundingClientRect();
            const board = document.querySelector('.ouija-board').getBoundingClientRect();
            
            // Store the relative position as percentage
            const x = ((rect.left + rect.width/2) - board.left) / board.width * 100;
            const y = ((rect.top + rect.height/2) - board.top) / board.height * 100;
            
            const letterValue = letter.getAttribute('data-letter');
            this.ghost.letterPositions[letterValue] = { x, y, element: letter };
        });
        
        // Initialize planchette position
        const planchette = document.querySelector('.planchette');
        planchette.style.left = '50%';
        planchette.style.top = '50%';
    }
    
    setupEventListeners() {
        const askButton = document.getElementById('ask-button');
        const questionInput = document.getElementById('question-input');
        const personalityInput = document.getElementById('personality-input');
        const aiInfoButton = document.getElementById('ai-info-button');
        
        askButton.addEventListener('click', () => this.askQuestion());
        questionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.askQuestion();
        });
        
        // Add input event listener for live question changes
        questionInput.addEventListener('input', () => this.handleLiveQuestionChange());
        
        // Add personality input change listener
        personalityInput.addEventListener('input', () => {
            this.ghost.setPersonality(personalityInput.value.trim());
        });
        
        // AI Info button listener
        aiInfoButton.addEventListener('click', () => this.showAIInfo());
    }
    
    handleLiveQuestionChange() {
        // Only handle live changes if we're already animating
        if (!this.isAnimating) return;
        
        const newQuestion = document.getElementById('question-input').value.trim();
        if (newQuestion === '') return;
        
        // Cancel current animation
        this.cancelCurrentAnimation();
        
        // Update and start new animation with the changed question
        setTimeout(() => this.askQuestion(), 300);
    }
    
    cancelCurrentAnimation() {
        // Reset animation state but preserve learning data
        this.currentIndex = 0;
        
        // Clear output
        const outputText = document.getElementById('output-text');
        outputText.textContent = 'Spirits are changing their mind...';
        
        // Move planchette back to center quickly
        const planchette = document.querySelector('.planchette');
        planchette.classList.add('moving');
        planchette.style.left = '50%';
        planchette.style.top = '50%';
        
        setTimeout(() => {
            planchette.classList.remove('moving');
        }, 300);
    }
    
    async askQuestion() {
        if (this.isAnimating && !document.getElementById('output-text').textContent.includes('changing')) {
            // Cancel current animation if question is being changed during animation
            this.cancelCurrentAnimation();
        }
        
        const questionInput = document.getElementById('question-input');
        const question = questionInput.value.trim();
        
        if (question === '') return;
        
        // Set animating flag but don't disable input
        this.isAnimating = true;
        document.getElementById('ask-button').disabled = true;
        
        // Clear previous output
        const outputText = document.getElementById('output-text');
        outputText.textContent = '';
        
        // Make planchette shake a bit to indicate thinking
        const planchette = document.querySelector('.planchette');
        planchette.style.transform = 'translate(-50%, -50%) rotate(5deg)';
        setTimeout(() => {
            planchette.style.transform = 'translate(-50%, -50%) rotate(-5deg)';
        }, 200);
        setTimeout(() => {
            planchette.style.transform = 'translate(-50%, -50%) rotate(0deg)';
        }, 400);
        
        // Get AI response
        this.response = await this.ghost.getResponse(question);
        this.currentIndex = 0;
        
        // Start spelling out the response
        this.spellNextLetter();
    }
    
    spellNextLetter() {
        if (this.currentIndex >= this.response.length) {
            this.finishAnimation();
            return;
        }
        
        const letterToSpell = this.response[this.currentIndex].toUpperCase();
        
        // Move to the letter
        this.moveToLetter(letterToSpell).then(() => {
            // Add letter to output only after we've reached the target position
            const outputText = document.getElementById('output-text');
            outputText.textContent += this.response[this.currentIndex];
            
            // Highlight the letter
            const letterElement = this.ghost.letterPositions[letterToSpell]?.element;
            if (letterElement) {
                letterElement.classList.add('highlight');
                setTimeout(() => {
                    letterElement.classList.remove('highlight');
                }, 200); // Faster highlight (was 300ms)
            }
            this.currentIndex++;
            
            // Add some randomness to timing for a more natural feel, but make it faster overall
            const delay = 150 + Math.random() * 250; // Faster typing (was 300 + Math.random() * 500)
            setTimeout(() => this.spellNextLetter(), delay);
        });
    }
    
    moveToLetter(letter) {
        return new Promise(resolve => {
            const planchette = document.querySelector('.planchette');
            planchette.classList.add('moving');
            
            // Get target position using neural network path finding
            const targetPos = this.ghost.calculatePathToLetter(letter);
            
            // Add some subtle randomness to movement
            const jitterX = (Math.random() - 0.5) * 3;
            const jitterY = (Math.random() - 0.5) * 3;
            
            // Set the new position
            planchette.style.left = `${targetPos.x + jitterX}%`;
            planchette.style.top = `${targetPos.y + jitterY}%`;
            
            // Add visual feedback based on memory type
            if (targetPos.shortTermMemory) {
                // Visual feedback for short-term memory recall (purple glow)
                planchette.classList.remove('memory-recall', 'avoiding-bad');
                planchette.classList.add('short-term-memory');
                setTimeout(() => planchette.classList.remove('short-term-memory'), 300);
            } else if (targetPos.memoryRecall) {
                planchette.classList.add('memory-recall');
                planchette.classList.remove('avoiding-bad', 'short-term-memory');
                setTimeout(() => planchette.classList.remove('memory-recall'), 300);
            } else if (targetPos.avoidingBad) {
                planchette.classList.add('avoiding-bad');
                planchette.classList.remove('memory-recall', 'short-term-memory');
                setTimeout(() => planchette.classList.remove('avoiding-bad'), 300);
            }
            
            // Wait for animation to complete - faster timing (400ms instead of 600ms)
            setTimeout(() => {
                planchette.classList.remove('moving');
                
                // Check if we've actually reached the target letter before resolving
                const distToTarget = Math.sqrt(
                    Math.pow(targetPos.x - this.ghost.letterPositions[letter]?.x, 2) +
                    Math.pow(targetPos.y - this.ghost.letterPositions[letter]?.y, 2)
                );
                
                if (distToTarget < 8) {
                    // We're close enough to the target
                    resolve();
                } else {
                    // Not at target yet, try moving again
                    this.moveToLetter(letter).then(resolve);
                }
            }, 400); // Faster movement (was 600ms)
        });
    }
    
    finishAnimation() {
        // Re-enable ask button while keeping animation flag
        this.isAnimating = false;
        document.getElementById('ask-button').disabled = false;
        
        // Note: We no longer disable the question input at all

        // Add sound effect now that we've completed spelling
        if (this.response && this.response.length > 0) {
            // Play EVP/Spirit box style audio of the message
            this.ghost.speakMessage(this.response);
        }

        // Move planchette back to center with a bit of randomness
        const planchette = document.querySelector('.planchette');
        // Center position with slight jitter
        const centerX = 50 + (Math.random() - 0.5) * 10;
        const centerY = 50 + (Math.random() - 0.5) * 10;
        
        planchette.style.left = `${centerX}%`;
        planchette.style.top = `${centerY}%`;
        
        setTimeout(() => {
            planchette.classList.remove('moving');
        }, 1000);
    }
    
    createAIInfoModal() {
        // Create modal structure
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        
        const modalTitle = document.createElement('h2');
        modalTitle.className = 'modal-title';
        modalTitle.textContent = 'Ghost AI Learning System';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.textContent = '×';
        
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeButton);
        modalContent.appendChild(modalHeader);
        
        // Neural Network explanation
        const networkSection = document.createElement('div');
        networkSection.className = 'info-section';
        
        const networkTitle = document.createElement('h3');
        networkTitle.textContent = 'Neural Network Navigation';
        networkSection.appendChild(networkTitle);
        
        const networkDesc = document.createElement('p');
        networkDesc.innerHTML = `The ghost uses a <span class="info-highlight">neural network</span> to learn how to navigate the Ouija board. It has a 4-input layer (current X/Y position and target X/Y position), an 8-neuron hidden layer, and a 4-output layer (up/down/left/right movement decisions).`;
        networkSection.appendChild(networkDesc);
        
        // Reward system explanation
        const rewardSection = document.createElement('div');
        rewardSection.className = 'info-section';
        
        const rewardTitle = document.createElement('h3');
        rewardTitle.textContent = 'Reward System';
        rewardSection.appendChild(rewardTitle);
        
        const rewardDesc = document.createElement('p');
        rewardDesc.innerHTML = `The AI uses a <span class="info-highlight">sophisticated reward-based learning system</span>:
        <br>• <span class="info-highlight">Proportional rewards</span> based on how much closer to target it gets
        <br>• <span class="info-highlight">+1.0 to +3.0 reward</span> when moving closer to target letter
        <br>• <span class="info-highlight">Extra bonus</span> when getting very close to target
        <br>• <span class="info-highlight">-2.0 penalty</span> when moving away from target letter`;
        rewardSection.appendChild(rewardDesc);
        
        // Letter targeting explanation
        const letterSection = document.createElement('div');
        letterSection.className = 'info-section';
        
        const letterTitle = document.createElement('h3');
        letterTitle.textContent = 'Letter Targeting';
        letterSection.appendChild(letterTitle);
        
        const letterDesc = document.createElement('p');
        letterDesc.innerHTML = `The ghost knows the exact position of each letter on the board. The neural network learns to efficiently move the planchette from its current position to a target letter. The letter is only registered once the planchette is within a close proximity (8% of board width) to the target letter.`;
        letterSection.appendChild(letterDesc);
        
        // Learning Process explanation
        const learningSection = document.createElement('div');
        learningSection.className = 'info-section';
        
        const learningTitle = document.createElement('h3');
        learningTitle.textContent = 'Adaptive Learning';
        learningSection.appendChild(learningTitle);
        
        const learningDesc = document.createElement('p');
        learningDesc.innerHTML = `The system includes <span class="info-highlight">adaptive learning rates</span>:
        <br>• Learning rate increases when success rate is low
        <br>• Learning rate decreases when success rate is high
        <br>• All learning data is retained when the question changes mid-session`;
        learningSection.appendChild(learningDesc);
        
        // Memory Bank explanation (new section)
        const memorySection = document.createElement('div');
        memorySection.className = 'info-section';
        
        const memoryTitle = document.createElement('h3');
        memoryTitle.textContent = 'Memory Bank System';
        memorySection.appendChild(memoryTitle);
        
        const memoryDesc = document.createElement('p');
        memoryDesc.innerHTML = `The ghost utilizes a <span class="info-highlight">multi-layered memory system</span> that:
        <br>• <span class="info-highlight">Short-term letter memory</span> for recently visited letters (purple glow)
        <br>• <span class="info-highlight">Remembers successful paths</span> from one area to another (green glow)
        <br>• <span class="info-highlight">Tracks and avoids bad moves</span> that increase distance to target
        <br>• <span class="info-highlight">Recalls previous successful moves</span> when in similar situations
        <br>• <span class="info-highlight">Adapts memory usage</span> based on current success rate
        <br>• <span class="info-highlight">Generalizes spatial positions</span> to 5% grid cells for better recall`;
        memorySection.appendChild(memoryDesc);
        
        // Add a new section for negative reinforcement
        const negativeSection = document.createElement('div');
        negativeSection.className = 'info-section';
        
        const negativeTitle = document.createElement('h3');
        negativeTitle.textContent = 'Negative Reinforcement';
        negativeSection.appendChild(negativeTitle);
        
        const negativeDesc = document.createElement('p');
        negativeDesc.innerHTML = `The ghost employs enhanced <span class="info-highlight">negative reinforcement learning</span>:
        <br>• <span class="info-highlight">Strong penalties</span> (-2.0 to -5.0) for moving away from target
        <br>• <span class="info-highlight">Additional distance-based penalty</span> for large backward movements
        <br>• <span class="info-highlight">Bad moves memory</span> to avoid repeating mistakes in similar contexts
        <br>• <span class="info-highlight">Direction avoidance system</span> that builds aversion to directions that were consistently bad
        <br>• <span class="info-highlight">Target vector guidance</span> that boosts confidence for directions toward the target
        <br>• <span class="info-highlight">Cumulative avoidance learning</span> that increases penalties for repeatedly bad directions`;
        negativeSection.appendChild(negativeDesc);
        
        // Add all sections to modal
        modalContent.appendChild(networkSection);
        modalContent.appendChild(rewardSection);
        modalContent.appendChild(letterSection);
        modalContent.appendChild(learningSection);
        modalContent.appendChild(memorySection);
        modalContent.appendChild(negativeSection); // Add new negative reinforcement section
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Now add the close button event listeners after the modal is created
        document.querySelector('.close-button').addEventListener('click', () => {
            document.querySelector('.modal').style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === document.querySelector('.modal')) {
                document.querySelector('.modal').style.display = 'none';
            }
        });
    }
    
    showAIInfo() {
        document.querySelector('.modal').style.display = 'flex';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const ouijaBoard = new OuijaBoard();
});