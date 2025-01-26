class DOSTerminal {
  constructor() {
    this.output = document.getElementById('output');
    this.input = document.getElementById('userInput');
    this.setupEventListeners();
    this.commandHistory = [];
    this.historyIndex = -1;
    this.currentModel = 'chat';  // Chat style
    this.currentLLM = 'gpt-3.5'; // Default LLM model
    this.terminalScreen = document.getElementById('terminalScreen');
    this.startupScreen = document.getElementById('startupScreen');
    this.biosScreen = document.getElementById('biosScreen');
    this.loadingScreen = document.getElementById('loadingScreen');
    this.loadingBar = document.getElementById('loadingBar');
    this.monitorContainer = document.querySelector('.monitor-container');
    this.memoryTestPosition = 0;
    this.conversationHistory = []; // Initialize conversation history
    this.powerButton = this.createPowerButton();
    this.monitorContainer.parentNode.appendChild(this.powerButton);
    this.startBootAnimation();
    this.isMonitorOn = true; // Track monitor state
  }

  createPowerButton() {
    const pcContainer = document.createElement('div');
    pcContainer.classList.add('pc-container');

    const pcBody = document.createElement('div');
    pcBody.classList.add('pc-body');
    pcContainer.appendChild(pcBody);

    const pcStripe = document.createElement('div');
    pcStripe.classList.add('pc-stripe');
    pcBody.appendChild(pcStripe);

    const powerButton = document.createElement('div');
    powerButton.classList.add('power-button');
    powerButton.addEventListener('click', () => this.togglePower());
    pcBody.appendChild(powerButton);

    return pcContainer;
  }

  togglePower() {
    if (this.isMonitorOn) {
      this.turnOffMonitor();
    } else {
      this.restartMonitor();
    }
  }

  turnOffMonitor() {
    if (!this.isMonitorOn) return; // Prevent turning off if already off
    this.isMonitorOn = false;
    this.monitorContainer.classList.add('monitor-off');
    this.terminalScreen.style.display = 'none';
    this.powerButton.querySelector('.power-button').classList.remove('on'); // Ensure button reflects off state
  }

  restartMonitor() {
    if (this.isMonitorOn) return; // Prevent restarting if already on
    this.isMonitorOn = true;
    this.monitorContainer.classList.remove('monitor-off');
    this.startupScreen.style.display = 'block';
    this.biosScreen.style.display = 'block'; // Ensure BIOS screen is visible
    this.loadingScreen.style.display = 'none';
    this.terminalScreen.style.display = 'none';
    this.powerButton.querySelector('.power-button').classList.add('on'); // Ensure button reflects on state
    this.output.innerHTML = ''; // Clear terminal output
    this.conversationHistory = []; // Clear conversation history
    this.commandHistory = []; // Clear command history
    this.historyIndex = -1; // Reset history index
    this.startBootAnimation();
  }

  startBootAnimation() {
    this.biosScreen.style.display = 'block'; // Make sure BIOS screen is visible at start
    this.playBiosAnimation().then(() => {
      this.playLoadingAnimation().then(() => {
        this.startupScreen.style.display = 'none';
        this.terminalScreen.style.display = 'flex'; // Or 'block' depending on your layout
        this.powerButton.querySelector('.power-button').classList.add('on'); // Set power button to 'on'
        this.init();
      });
    });
  }

  async playBiosAnimation() {
    return new Promise(resolve => {
      const biosTextElement = document.getElementById('biosText');
      const fullBiosText = biosTextElement.textContent;
      biosTextElement.textContent = '';

      let index = 0;
      let inMemoryTest = false;
      let memoryValue = 0;

      const biosInterval = setInterval(() => {
        // Special handling for memory test section
        if (fullBiosText[index] === '.' && inMemoryTest) {
          memoryValue += 64;
          biosTextElement.textContent = biosTextElement.textContent.slice(0, -5) +
            `${memoryValue.toString().padStart(5)}K`;
          if (memoryValue >= 640) {
            inMemoryTest = false;
            index++;
          }
          return;
        }

        // Start memory test when we hit the first digits
        if (fullBiosText.slice(index, index + 2) === "0K") {
          inMemoryTest = true;
        }

        biosTextElement.textContent += fullBiosText[index];
        index++;

        if (index >= fullBiosText.length) {
          clearInterval(biosInterval);
          setTimeout(() => {
            this.biosScreen.style.display = 'none';
            this.loadingScreen.style.display = 'block';
            resolve();
          }, 1000);
        }
      }, 30);
    });
  }

  async playLoadingAnimation() {
    return new Promise(resolve => {
      let width = 0;
      const loadingInterval = setInterval(() => {
        width += 2; // Adjust loading speed here
        this.loadingBar.style.width = width + '%';
        if (width >= 100) {
          clearInterval(loadingInterval);
          setTimeout(resolve, 500); // Short delay after loading completes
        }
      }, 50); // Interval timing for loading bar
    });
  }

  async init() {
    // Initialize the file system
    this.fileSystem = {
      'README.TXT': 'Welcome to WebDOS!\nType HELP for commands.\n\nThis is a text file example.',
      'HELLO.BAT': '@ECHO OFF\nECHO Hello, World!',
      'CONFIG.SYS': 'DEVICE=C:\\DOS\\HIMEM.SYS\nDEVICE=C:\\DOS\\EMM386.EXE RAM',
      'TEST.EXE': '[Binary executable file]',
      'DATA.DAT': '[Binary data file]',
      'GAME.COM': '[DOS command file]',
      'IMAGE.BMP': '[16-color bitmap image file]',
      'MUSIC.MID': '[MIDI music file]'
    };

    this.printLine('WebDOS AI Terminal [Version 1.0]', 'system-text');
    this.printLine('(c) 1994 Imaginative Creations. All rights reserved.', 'system-text');
    this.printLine('', 'system-text');
    this.printLine('Type "help" for available commands.', 'system-text');
    this.printLine(`Current Chat Style: ${this.currentModel}`, 'system-text');
    this.printLine(`Current LLM Model: ${this.currentLLM}`, 'system-text');
    this.printLine('', 'system-text');
  }

  setupEventListeners() {
    this.input.addEventListener('keydown', (e) => this.handleKeypress(e));
    this.input.addEventListener('input', () => this.adjustInputHeight());
  }

  async handleKeypress(e) {
    if (e.key === 'Enter') {
      const command = this.input.value.trim();
      if (command) {
        this.commandHistory.push(command);
        this.historyIndex = this.commandHistory.length;
        await this.processCommand(command);
        this.input.value = '';
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.input.value = this.commandHistory[this.historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
        this.input.value = this.commandHistory[this.historyIndex];
      } else {
        this.historyIndex = this.commandHistory.length;
        this.input.value = '';
      }
    }
  }

  adjustInputHeight() {
    // Reset height to auto to calculate the new height
    this.input.style.height = 'auto';
    // Set the height to scrollHeight if it's more than one line
    this.input.style.height = `${Math.max(this.input.scrollHeight, 20)}px`;
    // Ensure the content scrolls into view
    this.output.scrollTop = this.output.scrollHeight;
  }

  printLine(text, className = '') {
    const line = document.createElement('div');
    line.className = className;
    line.textContent = text;
    this.output.appendChild(line);
    this.output.scrollTop = this.output.scrollHeight;
  }

  async processCommand(command) {
    this.input.style.height = '20px'; // Reset height after command is processed
    this.printLine(`C:\\> ${command}`, 'user-text');

    const parts = command.toLowerCase().split(' ');
    const mainCommand = parts[0];
    const args = parts.slice(1);

    switch (mainCommand) {
      case 'help':
        this.showHelp();
        break;
      case 'cls':
        this.output.innerHTML = '';
        break;
      case 'ver':
        this.printLine('WebDOS AI Terminal [Version 1.0]', 'system-text');
        break;
      case 'dir':
        this.showDirectory();
        break;
      case 'type':
        if (args.length === 0) {
          this.printLine('ERROR: File name must be specified', 'error-text');
        } else {
          this.typeFile(args.join(' ').toUpperCase());
        }
        break;
      case 'exit':
        this.turnOffMonitor(); // Turn off monitor instead of "Nice try" message
        break;
      case 'model':
        if (args.length === 0) {
          this.showModels();
        } else {
          this.changeModel(args[0]);
        }
        break;
      case 'llm':
        if (args.length === 0) {
          this.showLLMs();
        } else {
          this.changeLLM(args[0]);
        }
        break;
      default:
        await this.getAIResponse(command);
    }
  }

  showHelp() {
    const commands = [
      'Available commands:',
      'HELP         - Shows this help message',
      'CLS          - Clears the screen',
      'VER          - Shows version information',
      'DIR          - Lists files in current directory',
      'TYPE <file>  - Displays contents of a text file',
      'EXIT         - Turns off the monitor',
      'MODEL        - Shows available chat styles',
      'MODEL <name> - Switch to specified chat style',
      'LLM          - Shows available AI models',
      'LLM <name>   - Switch to specified AI model',
      '',
      'Available chat styles:',
      'CHAT    - General chatbot (default)',
      'EXPERT  - Technical expert mode',
      'CREATIVE - Creative writing mode',
      'CONCISE - Brief responses mode',
      '',
      'Available LLM models:',
      'GPT-3.5  - FastGPT model (default)',
      'GPT-4    - Advanced GPT model',
      'CLAUDE   - Anthropic Claude model',
      'LLAMA    - Open source LLaMA model',
      'DEEPSEEK - DeepSeek Coder model',
      '',
      'Any other input will be treated as a message to the AI.'
    ];

    commands.forEach(cmd => this.printLine(cmd, 'system-text'));
  }

  showDirectory() {
    this.printLine('', 'system-text');
    this.printLine(' Directory of C:\\', 'system-text');
    this.printLine('', 'system-text');
    
    // Calculate total files and bytes
    const totalFiles = Object.keys(this.fileSystem).length;
    const totalBytes = Object.entries(this.fileSystem)
      .reduce((acc, [_, content]) => acc + content.length, 0);

    // Display files
    Object.keys(this.fileSystem).sort().forEach(filename => {
      const size = this.fileSystem[filename].length;
      const date = '08-14-1994  09:34AM';
      this.printLine(
        `${date}    ${size.toString().padStart(8)} ${filename}`, 
        'system-text'
      );
    });

    this.printLine('', 'system-text');
    this.printLine(
      `     ${totalFiles} File(s)     ${totalBytes} bytes`, 
      'system-text'
    );
    this.printLine('     0 Dir(s)      523,264 bytes free', 'system-text');
    this.printLine('', 'system-text');
  }

  typeFile(filename) {
    if (!this.fileSystem[filename]) {
      this.printLine(`ERROR: File '${filename}' not found`, 'error-text');
      return;
    }

    const extension = filename.split('.').pop().toLowerCase();
    this.printLine('', 'system-text');

    switch (extension) {
      case 'txt':
      case 'bat':
      case 'sys':
        // Display text file contents directly
        this.fileSystem[filename].split('\n').forEach(line => {
          this.printLine(line, 'system-text');
        });
        break;

      case 'exe':
        this.printLine('Error: Cannot execute binary file', 'error-text');
        this.printLine('File type: DOS Executable', 'system-text');
        break;

      case 'com':
        this.printLine('Error: Cannot execute COM file', 'error-text');
        this.printLine('File type: DOS Command File', 'system-text');
        break;

      case 'dat':
        this.printLine('Error: Cannot display binary data file', 'error-text');
        this.printLine('File type: Binary Data File', 'system-text');
        break;

      case 'bmp':
        this.printLine('Error: Cannot display bitmap image', 'error-text');
        this.printLine('File type: 16-color Bitmap Image', 'system-text');
        break;

      case 'mid':
        this.printLine('Error: Cannot play MIDI file', 'error-text');
        this.printLine('File type: MIDI Audio File', 'system-text');
        break;

      default:
        this.printLine('Error: Unknown file type', 'error-text');
    }
    
    this.printLine('', 'system-text');
  }

  async getAIResponse(message) {
    this.printLine('Processing...', 'system-text');
    
    const modelPrompts = {
      chat: 'You are a helpful AI assistant in a DOS-style interface. Keep responses conversational but concise.',
      expert: 'You are a technical expert AI in a DOS-style interface. Provide detailed technical explanations.',
      creative: 'You are a creative writing AI in a DOS-style interface. Be imaginative and entertaining.',
      concise: 'You are a brief-response AI in a DOS-style interface. Keep all responses under 50 words.'
    };

    // Maximum number of retries
    const maxRetries = 3;
    let currentTry = 0;
    let lastError = null;

    while (currentTry < maxRetries) {
      try {
        // Add user message to conversation history
        if (currentTry === 0) { // Only add to history on first try
          this.conversationHistory.push({ role: 'user', content: message });
        }

        const response = await fetch('/api/ai_completion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            prompt: `${modelPrompts[this.currentModel]}
            You are in a conversation with a user. Please remember previous turns in the conversation.
            Respond to the user's message in a way that feels like you're a program from the DOS era.
            Use plain text only.

            interface Response {
              reply: string;
            }

            {
              "reply": "UNDERSTOOD. Processing your request based on our previous exchange..."
            }
            `,
            data: this.conversationHistory,
            model: this.currentLLM // Add the selected LLM model to the request
          }),
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Remove the "Processing..." message
        if (this.output.lastChild) {
          this.output.removeChild(this.output.lastChild);
        }

        // Split the response into lines and print each one
        data.reply.split('\n').forEach(line => {
          this.printLine(line, 'ai-text');
        });

        // Add AI response to conversation history
        this.conversationHistory.push({ role: 'assistant', content: data.reply });
        
        // If successful, break out of retry loop
        break;

      } catch (error) {
        lastError = error;
        currentTry++;
        
        // Remove the "Processing..." message
        if (this.output.lastChild) {
          this.output.removeChild(this.output.lastChild);
        }

        // If we haven't reached max retries, show attempting reconnect message
        if (currentTry < maxRetries) {
          this.printLine(`Connection attempt ${currentTry} of ${maxRetries} failed. Retrying...`, 'system-text');
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, currentTry), 8000)));
        }
      }
    }

    // If all retries failed, show detailed error message
    if (currentTry === maxRetries) {
      let errorMessage = 'ERROR: Unable to process command. ';
      
      if (lastError instanceof TypeError && lastError.message === 'Failed to fetch') {
        errorMessage += 'Network connection unavailable.';
      } else if (lastError?.name === 'AbortError') {
        errorMessage += 'Request timed out.';
      } else if (lastError instanceof Error) {
        errorMessage += `${lastError.message}`;
      } else {
        errorMessage += 'Unknown error occurred.';
      }
      
      this.printLine(errorMessage, 'error-text');
      this.printLine('Please check your connection and try again.', 'error-text');
      
      // Remove the failed message from conversation history
      this.conversationHistory.pop();
    }
  }

  showLLMs() {
    const llms = [
      'Available LLM Models:',
      'GPT-3.5  - FastGPT model (default)',
      'GPT-4    - Advanced GPT model',
      'CLAUDE   - Anthropic Claude model',
      'LLAMA    - Open source LLaMA model',
      'DEEPSEEK - DeepSeek Coder model',
      '',
      'Use LLM <name> to switch models (e.g., LLM GPT-4)'
    ];

    llms.forEach(llm => this.printLine(llm, 'system-text'));
  }

  changeLLM(newLLM) {
    const validLLMs = ['gpt-3.5', 'gpt-4', 'claude', 'llama', 'deepseek'];
    const llmName = newLLM.toLowerCase();

    if (!validLLMs.includes(llmName)) {
      this.printLine('ERROR: Invalid LLM model specified. Use LLM command to see available models.', 'error-text');
      return;
    }

    this.printLine('WARNING: Changing LLM models will reset the current chat context.', 'system-text');
    this.currentLLM = llmName;
    this.conversationHistory = []; // Reset conversation history
    this.printLine(`LLM Model changed to: ${this.currentLLM}`, 'system-text');
    this.printLine('', 'system-text');
  }

  showModels() {
    const models = [
      'Available AI Models:',
      'CHAT    - General chatbot (default)',
      'EXPERT  - Technical expert mode',
      'CREATIVE - Creative writing mode',
      'CONCISE - Brief responses mode',
      '',
      'Use MODEL <name> to switch models (e.g., MODEL EXPERT)'
    ];

    models.forEach(model => this.printLine(model, 'system-text'));
  }

  changeModel(newModel) {
    const validModels = ['chat', 'expert', 'creative', 'concise'];

    if (!validModels.includes(newModel.toLowerCase())) {
      this.printLine('ERROR: Invalid model specified. Use MODEL command to see available models.', 'error-text');
      return;
    }

    this.printLine('WARNING: Changing models will reset the current chat context.', 'system-text');
    this.currentModel = newModel.toLowerCase();
    this.conversationHistory = []; // Reset conversation history
    this.printLine(`Model changed to: ${this.currentModel}`, 'system-text');
    this.printLine('', 'system-text');
  }
}

// Initialize the terminal
const terminal = new DOSTerminal();