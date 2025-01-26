document.addEventListener('DOMContentLoaded', () => {
  const clock = document.getElementById('clock');
  const desktopIcons = document.querySelectorAll('.icon, .app-icon');
  
  // Modify windows initialization to be more robust
  const windows = {
    terminal: document.getElementById('terminal-window'),
    browser: document.getElementById('browser-window'),
    fileManager: null  // Will be created dynamically
  };

  // Robust window toggle function
  function toggleWindow(windowElement) {
    if (!windowElement) return;

    // Hide all windows first
    Object.values(windows).forEach(w => {
      if (w) w.style.display = 'none';
    });
    
    // Toggle current window
    windowElement.style.display = windowElement.style.display === 'block' ? 'none' : 'block';
  }

  // Clock update
  function updateClock() {
    const now = new Date();
    if (clock) {
      clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }
  updateClock();
  setInterval(updateClock, 1000);

  // Create file manager window dynamically
  function createFileManagerWindow() {
    const fileManagerWindow = document.createElement('div');
    fileManagerWindow.className = 'window file-manager-window';
    fileManagerWindow.id = 'file-manager-window';
    fileManagerWindow.innerHTML = `
      <div class="window-header">
        <span>File Manager</span>
        <div class="window-controls">
          <span>-</span>
          <span>□</span>
          <span>✕</span>
        </div>
      </div>
      <div class="window-content file-manager-content">
        <div class="file-list">
          <div class="file-item" data-restricted="true">
            <img src="https://cdn-icons-png.flaticon.com/512/2503/2503508.png" alt="Folder">
            <span>GTA VI Files</span>
            <div class="locked-overlay">
              <svg class="locked-icon" viewBox="0 0 24 24">
                <path d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v3h1m-6-5a2 2 0 0 0-2 2v3h4V6a2 2 0 0 0-2-2z"/>
              </svg>
              <p>RESTRICTED ACCESS</p>
            </div>
          </div>
          <div class="file-item">
            <img src="https://cdn-icons-png.flaticon.com/512/2503/2503508.png" alt="Folder">
            <span>Documents</span>
          </div>
          <div class="file-item">
            <img src="https://cdn-icons-png.flaticon.com/512/2503/2503508.png" alt="Folder">
            <span>Downloads</span>
          </div>
        </div>
      </div>
    `;
    document.querySelector('.desktop').appendChild(fileManagerWindow);
    windows.fileManager = fileManagerWindow;

    // Add file item click handler for restricted files
    const gtaFileItem = fileManagerWindow.querySelector('.file-item[data-restricted="true"]');
    gtaFileItem.addEventListener('click', () => {
      window.location.href = 'gamefiles.html';
    });

    // Add window control listeners
    const controls = fileManagerWindow.querySelectorAll('.window-controls span');
    controls[2].addEventListener('click', () => {
      fileManagerWindow.style.display = 'none';
    });
  }

  // Create settings window dynamically
  function createSettingsWindow() {
    const settingsWindow = document.createElement('div');
    settingsWindow.className = 'window settings-window';
    settingsWindow.id = 'settings-window';
    settingsWindow.innerHTML = `
      <div class="window-header">
        <span>System Settings</span>
        <div class="window-controls">
          <span>-</span>
          <span>□</span>
          <span>✕</span>
        </div>
      </div>
      <div class="window-content settings-content">
        <h2>Kali Linux Settings</h2>
        <div class="settings-section">
          <h3>Display</h3>
          <label>
            <input type="checkbox" checked> Dark Mode
          </label>
        </div>
        <div class="settings-section">
          <h3>Network</h3>
          <p>Connected to: wlan0</p>
          <p>IP Address: 192.168.1.100</p>
        </div>
      </div>
    `;
    document.querySelector('.desktop').appendChild(settingsWindow);

    // Add window control listeners
    const controls = settingsWindow.querySelectorAll('.window-controls span');
    controls[2].addEventListener('click', () => {
      settingsWindow.style.display = 'none';
    });
  }

  // Event listeners for desktop icons
  function setupIconListeners() {
    const allIcons = document.querySelectorAll('.icon, .app-icon');
    allIcons.forEach(icon => {
      icon.addEventListener('dblclick', () => {
        const appName = icon.getAttribute('data-app');
        switch(appName) {
          case 'terminal':
            toggleWindow(windows.terminal);
            break;
          case 'browser':
            toggleWindow(windows.browser);
            break;
          case 'file-manager':
            if (!windows.fileManager) {
              createFileManagerWindow();
            }
            toggleWindow(windows.fileManager);
            break;
          case 'settings':
            if (!document.getElementById('settings-window')) {
              createSettingsWindow();
            }
            toggleWindow(document.getElementById('settings-window'));
            break;
        }
      });
    });
  }

  setupIconListeners();

  // Window control buttons
  document.querySelectorAll('.window-controls span:last-child').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      closeBtn.closest('.window').style.display = 'none';
    });
  });

  // Terminal input handling 
  const terminalInput = document.querySelector('.terminal-input');
  const terminalOutput = document.querySelector('.terminal-output');

  // Predefined hacking scenario
  const hackingScenario = {
    currentStep: 0,
    steps: [
      {
        prompt: "INITIATING REMOTE CONNECTION...",
        expectedInput: "connect"
      },
      {
        prompt: "SCANNING NETWORK PROTOCOLS...",
        expectedInput: "bypass"
      },
      {
        prompt: "ACCESSING ROCKSTAR GAMES INTERNAL NETWORK...",
        expectedInput: "infiltrate"
      },
      {
        prompt: "ACCESS POINT LOCATED. PROCEED TO DECRYPT?",
        expectedInput: "decrypt"
      }
    ],
    reset() {
      this.currentStep = 0;
    }
  };

  function processTerminalCommand(command) {
    const normalizedCommand = command.toLowerCase().trim();
    
    // If we're in the hacking scenario
    if (hackingScenario.currentStep < hackingScenario.steps.length) {
      const currentStep = hackingScenario.steps[hackingScenario.currentStep];
      
      if (normalizedCommand === currentStep.expectedInput) {
        // Successful step
        terminalOutput.innerHTML += `<p>>> ${currentStep.prompt}</p>`;
        hackingScenario.currentStep++;
        
        // Final step - redirect to connection page
        if (hackingScenario.currentStep === hackingScenario.steps.length) {
          terminalOutput.innerHTML += `<p>>> CONNECTION ESTABLISHED. REDIRECTING...</p>`;
          setTimeout(() => {
            window.location.href = 'index.html';  // Replace with your initial connection page
          }, 2000);
        }
      } else {
        // Incorrect command
        terminalOutput.innerHTML += `<p>>> ERROR: INVALID COMMAND. TRY AGAIN.</p>`;
      }
    } else {
      // Default terminal commands
      switch(normalizedCommand) {
        case 'clear':
          terminalOutput.innerHTML = '';
          break;
        case 'help':
          terminalOutput.innerHTML += `
            <p>HACKING SEQUENCE COMMANDS:</p>
            <p>- connect: Initiate remote connection</p>
            <p>- bypass: Scan network protocols</p>
            <p>- infiltrate: Access internal network</p>
            <p>- decrypt: Proceed to access point</p>
          `;
          break;
        default:
          terminalOutput.innerHTML += `<p>>> UNKNOWN COMMAND. TYPE 'help' FOR GUIDANCE.</p>`;
      }
    }
    
    terminalInput.value = '';
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  terminalInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const command = terminalInput.value.trim();
      terminalOutput.innerHTML += `<p>┌──(hacker㉿kali)-[~]</p>`;
      terminalOutput.innerHTML += `<p>└─$ ${command}</p>`;
      
      processTerminalCommand(command);
    }
  });

  // Start menu functionality
  const startMenuButton = document.querySelector('.start-menu-button');
  const startMenu = document.createElement('div');
  startMenu.className = 'start-menu';
  startMenu.innerHTML = `
    <div class="start-menu-content">
      <div class="start-menu-item" data-app="terminal">
        <img src="https://cdn-icons-png.flaticon.com/512/919/919837.png" alt="Terminal">
        <span>Terminal</span>
      </div>
      <div class="start-menu-item" data-app="browser">
        <img src="https://cdn-icons-png.flaticon.com/512/888/888879.png" alt="Browser">
        <span>Browser</span>
      </div>
      <div class="start-menu-item" data-app="settings">
        <img src="https://cdn-icons-png.flaticon.com/512/2040/2040504.png" alt="Settings">
        <span>Settings</span>
      </div>
      <div class="start-menu-item" data-app="logout">
        <img src="https://cdn-icons-png.flaticon.com/512/2150/2150480.png" alt="Logout">
        <span>Logout</span>
      </div>
    </div>
  `;
  document.querySelector('.desktop').appendChild(startMenu);
  startMenu.style.display = 'none';

  startMenuButton.addEventListener('click', () => {
    startMenu.style.display = startMenu.style.display === 'none' ? 'block' : 'none';
  });

  // Start menu item listeners
  const startMenuItems = startMenu.querySelectorAll('.start-menu-item');
  startMenuItems.forEach(item => {
    item.addEventListener('click', () => {
      const appName = item.getAttribute('data-app');
      switch(appName) {
        case 'terminal':
          if (!windows.terminal) {
            windows.terminal = document.getElementById('terminal-window');
          }
          toggleWindow(windows.terminal);
          break;
        case 'browser':
          if (!windows.browser) {
            windows.browser = document.getElementById('browser-window');
          }
          toggleWindow(windows.browser);
          break;
        case 'settings':
          if (!document.getElementById('settings-window')) {
            createSettingsWindow();
          }
          toggleWindow(document.getElementById('settings-window'));
          break;
        case 'logout':
          window.location.href = 'index.html';
          break;
      }
      startMenu.style.display = 'none';
    });
  });

  // Close start menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!startMenuButton.contains(e.target) && !startMenu.contains(e.target)) {
      startMenu.style.display = 'none';
    }
  });

  // Add error handling and logging
  window.addEventListener('error', (event) => {
    console.error('Unhandled error:', event.error);
  });

  function setupBrowserWindow() {
    const browserWindow = document.getElementById('browser-window');
    const browserIframe = browserWindow.querySelector('iframe');
    const addressBar = document.createElement('div');
    addressBar.innerHTML = `
      <div class="browser-address-bar">
        <button class="browser-back">←</button>
        <button class="browser-forward">→</button>
        <input type="text" class="browser-url" placeholder="Enter URL">
        <button class="browser-go">GO</button>
        <button class="browser-refresh">⟳</button>
      </div>
    `;
    browserWindow.querySelector('.window-header').after(addressBar);

    // Style the address bar
    addressBar.querySelector('.browser-address-bar').style.cssText = `
      display: flex;
      align-items: center;
      background: #222;
      padding: 5px;
      gap: 5px;
    `;
    
    const addressInput = addressBar.querySelector('.browser-url');
    const goButton = addressBar.querySelector('.browser-go');
    
    addressInput.style.cssText = `
      flex-grow: 1;
      background: #333;
      color: #0f0;
      border: none;
      padding: 5px;
    `;
    
    goButton.style.cssText = `
      background: #444;
      color: #0f0;
      border: none;
      padding: 5px 10px;
      cursor: pointer;
    `;

    function loadSite(url) {
      // Only allow specific site
      if (url.toLowerCase().includes('gta6rockstargames.faq')) {
        browserIframe.srcdoc = `
          <html>
            <head>
              <style>
                body { 
                  background-color: black; 
                  color: #0f0; 
                  font-family: monospace; 
                  padding: 20px; 
                }
                h1 { color: #0f0; }
                p { color: #0f0; }
              </style>
            </head>
            <body>
              <h1>GTA VI - Rockstar Games FAQ</h1>
              <p>NOTICE: This is a simulated page for research purposes.</p>
              <p>Rumored Release Date: TBD</p>
              <p>Location: Modern-day Vice City</p>
              <p>Status: Under Active Development</p>
              <p><strong>WARNING: ALL INFORMATION IS SPECULATIVE</strong></p>
            </body>
          </html>
        `;
        addressInput.value = url;
      } else {
        browserIframe.srcdoc = `
          <html>
            <body style="background-color: black; color: green; font-family: monospace; display: flex; justify-content: center; align-items: center; height: 100vh;">
              ERROR: ONLY gta6rockstargames.faq IS ACCESSIBLE
            </body>
          </html>
        `;
        addressInput.value = '';
      }
    }

    // GO button click handler
    goButton.addEventListener('click', () => {
      const url = addressInput.value.trim();
      loadSite(url);
    });

    // Enter key on input
    addressInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const url = addressInput.value.trim();
        loadSite(url);
      }
    });

    // Set initial blank state
    browserIframe.srcdoc = `
      <html>
        <body style="background-color: black; color: green; font-family: monospace; display: flex; justify-content: center; align-items: center; height: 100vh;">
          ENTER gta6rockstargames.faq IN ADDRESS BAR
        </body>
      </html>
    `;
  }

  // Initialize browser window
  setupBrowserWindow();
});