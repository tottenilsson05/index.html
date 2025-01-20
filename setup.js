class BoxCatSetup {
  static start() {
    this.createSetupScreen();
    this.currentStep = 0;
    this.userConfig = {
      pcName: '',
      userName: '',
      password: '',
      browserAccount: {
        email: '',
        password: ''
      }
    };
    this.showStep();
  }

  static createSetupScreen() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'setup-overlay';
    
    this.content = document.createElement('div');
    this.content.className = 'setup-content';
    
    this.header = document.createElement('div');
    this.header.className = 'setup-header';
    this.header.innerHTML = '<h2>BoxCat OS Setup</h2>';
    
    this.body = document.createElement('div');
    this.body.className = 'setup-body';
    
    this.footer = document.createElement('div');
    this.footer.className = 'setup-footer';
    
    this.content.appendChild(this.header);
    this.content.appendChild(this.body);
    this.content.appendChild(this.footer);
    this.overlay.appendChild(this.content);
    document.body.appendChild(this.overlay);
  }

  static steps = [
    {
      title: 'Welcome to BoxCat OS Setup',
      content: `
        <p>This program will help you configure BoxCat OS for your computer.</p>
        <p>Please make sure your computer meets the following requirements:</p>
        <ul>
          <li>386 or 486 processor</li>
          <li>4MB RAM minimum</li>
          <li>80MB hard disk space</li>
          <li>VGA compatible display</li>
        </ul>
      `,
      buttons: ['Next >']
    },
    {
      title: 'System Identification',
      content: `
        <p>Please enter your computer name and user information:</p>
        <div class="setup-option">
          <label>Computer Name:</label>
          <input type="text" id="pcName" placeholder="BOXCAT-PC" value="BOXCAT-PC">
        </div>
        <div class="setup-option">
          <label>Your Name:</label>
          <input type="text" id="userName" placeholder="Enter your name">
        </div>
        <div class="setup-option">
          <label>Password Protection:</label>
          <select id="passwordProtection">
            <option value="no">No password protection</option>
            <option value="yes">Use password protection</option>
          </select>
        </div>
        <div class="setup-option password-section" style="display: none;">
          <label>Password:</label>
          <input type="password" id="password" placeholder="Enter password">
        </div>
      `,
      validate: () => {
        const pcName = document.getElementById('pcName').value.trim();
        const userName = document.getElementById('userName').value.trim();
        const usePassword = document.getElementById('passwordProtection').value === 'yes';
        const password = document.getElementById('password')?.value || '';

        if (!pcName || !userName) {
          alert('Please enter both computer name and user name.');
          return false;
        }

        if (usePassword && !password) {
          alert('Please enter a password.');
          return false;
        }

        this.userConfig.pcName = pcName;
        this.userConfig.userName = userName;
        this.userConfig.password = usePassword ? password : '';
        return true;
      },
      buttons: ['< Back', 'Next >']
    },
    {
      title: 'goCat Browser Setup',
      content: `
        <h3 style="margin-bottom: 20px;">Would you like to create a goCat browser account?</h3>
        <div class="setup-option" style="display: flex; gap: 10px; justify-content: center;">
          <button class="setup-button" id="yesGoCat" style="width: 200px;">Yes, create goCat account</button>
          <button class="setup-button" id="noGoCat" style="width: 200px;">No thanks, skip this</button>
        </div>
        <div class="browser-setup" style="display: none; margin-top: 20px; border-top: 2px solid #808080; padding-top: 20px;">
          <div class="setup-option">
            <label>Email Address:</label>
            <input type="email" id="browserEmail" placeholder="you@boxcat.com">
          </div>
          <div class="setup-option">
            <label>Password:</label>
            <input type="password" id="browserPassword" placeholder="Enter password">
          </div>
          <div class="benefits-box" style="margin-top: 20px; background: #fff; border: 2px solid #808080; padding: 16px;">
            <p style="color: #000080; font-weight: bold;">Your goCat account includes:</p>
            <ul style="margin-top: 10px;">
              <li> BoxCat Mail (2MB storage!)</li>
              <li> BoxCat Cloud Storage (2MB free!)</li>
              <li> BoxCat Chat</li>
              <li> Personal Homepage</li>
              <li> Access to BoxCat Forums</li>
            </ul>
          </div>
        </div>
      `,
      validate: () => {
        if (document.querySelector('.browser-setup').style.display === 'block') {
          const email = document.getElementById('browserEmail').value.trim();
          const password = document.getElementById('browserPassword').value;
          
          if (!email || !password) {
            alert('Please complete all browser account fields.');
            return false;
          }
          
          if (!email.includes('@')) {
            alert('Please enter a valid email address.');
            return false;
          }

          this.userConfig.browserAccount = { email, password };
        } else {
          this.userConfig.browserAccount = { email: '', password: '' };
        }
        return true;
      },
      buttons: ['< Back', 'Next >'],
      onShow: () => {
        const yesButton = document.getElementById('yesGoCat');
        const noButton = document.getElementById('noGoCat');
        const browserSetup = document.querySelector('.browser-setup');

        yesButton.addEventListener('click', () => {
          browserSetup.style.display = 'block';
          yesButton.style.background = '#000080';
          yesButton.style.color = '#fff';
          yesButton.style.borderColor = '#000';
          noButton.style.background = '';
          noButton.style.color = '';
          noButton.style.borderColor = '';
        });

        noButton.addEventListener('click', () => {
          browserSetup.style.display = 'none';
          noButton.style.background = '#000080';
          noButton.style.color = '#fff';
          noButton.style.borderColor = '#000';
          yesButton.style.background = '';
          yesButton.style.color = '';
          yesButton.style.borderColor = '';
        });
      }
    },
    {
      title: 'Display Settings',
      content: `
        <p>Select your display configuration:</p>
        <div class="setup-option">
          <select>
            <option>VGA (640x480)</option>
            <option>SVGA (800x600)</option>
            <option>SVGA (1024x768)</option>
          </select>
        </div>
      `,
      buttons: ['< Back', 'Next >']
    },
    {
      title: 'Sound Configuration',
      content: `
        <p>Configure your sound card:</p>
        <div class="setup-option">
          <label>Sound Card Type:</label>
          <select>
            <option>Sound Blaster 16</option>
            <option>Sound Blaster Pro</option>
            <option>AdLib</option>
            <option>No Sound Card</option>
          </select>
        </div>
        <div class="setup-option">
          <label>Port:</label>
          <select>
            <option>220h</option>
            <option>240h</option>
          </select>
        </div>
      `,
      buttons: ['< Back', 'Next >']
    },
    {
      title: 'Setup Complete',
      content: `
        <h3>Configuration Summary:</h3>
        <div id="setup-summary"></div>
        <p>BoxCat OS has been configured successfully!</p>
        <p>Click Finish to save changes and restart the system.</p>
      `,
      onShow: () => {
        const summary = document.getElementById('setup-summary');
        summary.innerHTML = `
          <div class="summary-item">
            <strong>Computer Name:</strong> ${this.userConfig.pcName}
          </div>
          <div class="summary-item">
            <strong>User Name:</strong> ${this.userConfig.userName}
          </div>
          <div class="summary-item">
            <strong>Password Protection:</strong> ${this.userConfig.password ? 'Enabled' : 'Disabled'}
          </div>
          <div class="summary-item">
            <strong>goCat Account:</strong> ${this.userConfig.browserAccount.email || 'Not configured'}
          </div>
        `;
      },
      buttons: ['< Back', 'Finish']
    }
  ];

  static showStep() {
    const step = this.steps[this.currentStep];
    this.header.innerHTML = `<h2>${step.title}</h2>`;
    this.body.innerHTML = step.content;
    this.footer.innerHTML = step.buttons.map(text => 
      `<button class="setup-button">${text}</button>`
    ).join('');

    // Add event listeners for special fields
    if (this.currentStep === 1) {
      const passwordProtection = document.getElementById('passwordProtection');
      const passwordSection = document.querySelector('.password-section');
      passwordProtection.addEventListener('change', () => {
        passwordSection.style.display = 
          passwordProtection.value === 'yes' ? 'block' : 'none';
      });
    }

    if (this.currentStep === 2) {
      if (step.onShow) {
        step.onShow();
      }
    }

    this.footer.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => {
        if (button.textContent === 'Next >') {
          if (step.validate && !step.validate()) {
            return;
          }
          this.currentStep++;
          this.showStep();
        } else if (button.textContent === '< Back') {
          this.currentStep--;
          this.showStep();
        } else if (button.textContent === 'Finish') {
          this.complete();
        }
      });
    });
  }

  static complete() {
    // Save user configuration to localStorage
    localStorage.setItem('boxcat_config', JSON.stringify(this.userConfig));

    this.body.innerHTML = `
      <div style="text-align: center;">
        <h3>Finalizing Installation</h3>
        <p>Saving configuration...</p>
        <p>Creating user profile: ${this.userConfig.userName}</p>
        ${this.userConfig.browserAccount.email ? `
          <p>Setting up goCat browser account: ${this.userConfig.browserAccount.email}</p>
          <p>Configuring BoxCat Mail...</p>
          <p>Setting up Cloud Storage...</p>
          <p>Connecting to BoxCat Chat...</p>
        ` : ''}
        <p>System will restart in 5 seconds.</p>
        <div class="loading-text">/l\\_/</div>
      </div>
    `;
    this.footer.innerHTML = '';
    
    let loadingPhase = 0;
    const loadingStates = ['/l\\_/', '/l_\\/', '\\l_\\/', '\\l\\_\\'];
    const loadingInterval = setInterval(() => {
      const loadingText = this.body.querySelector('.loading-text');
      loadingText.textContent = loadingStates[loadingPhase];
      loadingPhase = (loadingPhase + 1) % loadingStates.length;
    }, 200);

    setTimeout(() => {
      clearInterval(loadingInterval);
      this.overlay.remove();
      
      // Reload the page to start fresh with the new config
      location.reload();
    }, 5000);
  }
}

// Make BoxCatSetup available globally
window.BoxCatSetup = BoxCatSetup;

// Add some style updates
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .setup-option {
    margin: 16px 0;
  }
  
  .setup-option input {
    width: 100%;
    max-width: 300px;
    padding: 4px;
    font-family: 'Web437_IBM_VGA_8x16', monospace;
  }
  
  .setup-note {
    margin-top: 16px;
    color: #000080;
  }
  
  .summary-item {
    margin: 8px 0;
  }
  
  #setup-summary {
    background: #fff;
    border: 2px solid #808080;
    padding: 16px;
    margin: 16px 0;
  }
`;
document.head.appendChild(styleSheet);