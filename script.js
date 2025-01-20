// Sound effect
const selectSound = new Audio('/vk_Select.wav');

// Update clock
function updateClock() {
  const time = new Date().toLocaleTimeString();
  document.querySelector('.time').textContent = time;
}
setInterval(updateClock, 1000);
updateClock();

// Start menu
const startBtn = document.querySelector('.start-btn');
const startMenu = document.querySelector('.start-menu');
let startMenuOpen = false;

startBtn.addEventListener('click', () => {
  selectSound.play();
  startMenuOpen = !startMenuOpen;
  startMenu.classList.toggle('hidden');
  startBtn.style.borderTop = startMenuOpen ? '2px solid #808080' : '2px solid #fff';
  startBtn.style.borderLeft = startMenuOpen ? '2px solid #808080' : '2px solid #fff';
  startBtn.style.borderRight = startMenuOpen ? '2px solid #fff' : '2px solid #808080';
  startBtn.style.borderBottom = startMenuOpen ? '2px solid #fff' : '2px solid #808080';
});

// Window management
const windows = document.querySelector('.windows');
let activeWindow = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

class Window {
  constructor(title, content, icon) {
    this.element = document.createElement('div');
    this.element.className = 'window';
    this.element.style.top = '50px';
    this.element.style.left = '50px';
    
    const header = document.createElement('div');
    header.className = 'window-header';
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'window-title';
    titleDiv.innerHTML = `${icon}<span>${title}</span>`;
    
    const closeBtn = document.createElement('div');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = 'X';
    closeBtn.addEventListener('click', () => this.close());
    
    header.appendChild(titleDiv);
    header.appendChild(closeBtn);
    
    const windowContent = document.createElement('div');
    windowContent.className = 'window-content';
    windowContent.appendChild(content);
    
    this.element.appendChild(header);
    this.element.appendChild(windowContent);
    
    this.setupDragging(header);
    windows.appendChild(this.element);
    
    this.focus();
  }
  
  setupDragging(header) {
    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      activeWindow = this.element;
      const rect = this.element.getBoundingClientRect();
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;
      this.focus();
    });
  }
  
  focus() {
    document.querySelectorAll('.window').forEach(w => w.style.zIndex = '1');
    this.element.style.zIndex = '2';
  }
  
  close() {
    selectSound.play();
    this.element.remove();
  }
}

// Window dragging
document.addEventListener('mousemove', (e) => {
  if (isDragging && activeWindow) {
    const maxX = window.innerWidth - activeWindow.offsetWidth;
    const maxY = window.innerHeight - activeWindow.offsetHeight;
    
    let newX = e.clientX - dragOffset.x;
    let newY = e.clientY - dragOffset.y;
    
    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));
    
    activeWindow.style.left = newX + 'px';
    activeWindow.style.top = newY + 'px';
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

// Apps
const apps = {
  terminal: {
    title: 'Terminal',
    icon: `<svg viewBox="0 0 24 24" width="20" height="20">
      <path d="M4 4h16v16H4V4m2 2v12h12V6H6z" fill="white"/>
      <path d="M8 8l3 3-3 3m4 1h4" stroke="white" fill="none" stroke-width="2"/>
    </svg>`,
    create: () => {
      const content = document.createElement('div');
      content.className = 'terminal-content';
      
      // Enhanced terminal with command history and more commands
      let commandHistory = [];
      let historyIndex = -1;
      let currentPath = 'C:\\>';
      
      const commands = {
        help: () => `
Available commands:
  help     - Show this help message
  dir      - List directory contents
  cd       - Change directory
  echo     - Display a message
  cls      - Clear screen
  ver      - Show system version
  time     - Show current time
  date     - Show current date
  cat      - Display file contents
  color    - Change terminal colors
  tree     - Show directory tree
`,
        dir: () => `
Directory of C:\\
  <DIR>    SYSTEM
  <DIR>    PROGRAMS
  <DIR>    USERS
  <DIR>    GAMES
         220 README.TXT
         186 CONFIG.SYS
       1,458 AUTOEXEC.BAT
`,
        ver: () => 'BoxCat OS [Version 1.0 Beta]\nCopyright (c) 1993 BoxCat Systems',
        time: () => new Date().toLocaleTimeString(),
        date: () => new Date().toLocaleDateString(),
        cat: (args) => {
          if (args === 'README.TXT') {
            return 'Welcome to BoxCat OS!\nThank you for choosing our operating system.\n\nFor help, type "help" at the prompt.';
          }
          return 'File not found.';
        },
        tree: () => `
C:\\
├───SYSTEM
│   ├───DRIVERS
│   └───CONFIG
├───PROGRAMS
│   ├───GAMES
│   └───UTILS
└───USERS
    └───DEFAULT
`,
        color: (args) => {
          const colors = args.split(' ');
          if (colors.length === 2) {
            content.style.color = colors[0];
            content.style.background = colors[1];
            return 'Color scheme updated.';
          }
          return 'Usage: color <foreground> <background>';
        }
      };

      let terminalOutput = 'BoxCat OS [Version 1.0 Beta]\n\nC:\\>';
      const updateDisplay = () => {
        content.textContent = terminalOutput;
        content.scrollTop = content.scrollHeight;
      };

      updateDisplay();

      const processCommand = (cmd) => {
        const parts = cmd.trim().toLowerCase().split(' ');
        const command = parts[0];
        const args = parts.slice(1).join(' ');
        
        let output = '';
        if (command in commands) {
          output = commands[command](args);
        } else if (command === 'cls') {
          terminalOutput = '';
        } else if (command === 'cd') {
          if (args) {
            currentPath = `C:\\${args}>`;
          } else {
            output = currentPath.slice(0, -1);
          }
        } else if (command === 'echo') {
          output = args || '';
        } else if (command !== '') {
          output = `'${command}' is not recognized as an internal or external command.`;
        }
        
        terminalOutput += '\n' + output + '\n' + currentPath;
        updateDisplay();
      };

      content.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const lines = terminalOutput.split('\n');
          const currentCommand = lines[lines.length - 1].slice(currentPath.length);
          if (currentCommand) {
            commandHistory.push(currentCommand);
            historyIndex = commandHistory.length;
          }
          processCommand(currentCommand);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (historyIndex > 0) {
            historyIndex--;
            const lines = terminalOutput.split('\n');
            lines[lines.length - 1] = currentPath + commandHistory[historyIndex];
            terminalOutput = lines.join('\n');
            updateDisplay();
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            const lines = terminalOutput.split('\n');
            lines[lines.length - 1] = currentPath + commandHistory[historyIndex];
            terminalOutput = lines.join('\n');
            updateDisplay();
          }
        }
      });

      content.addEventListener('keypress', (e) => {
        const lines = terminalOutput.split('\n');
        const currentLine = lines[lines.length - 1];
        if (currentLine.length >= currentPath.length) {
          lines[lines.length - 1] += e.key;
          terminalOutput = lines.join('\n');
          updateDisplay();
        }
        e.preventDefault();
      });

      content.contentEditable = true;
      content.spellcheck = false;
      return content;
    }
  },

  notes: {
    title: 'Notes',
    icon: `<svg viewBox="0 0 24 24" width="20" height="20">
      <path d="M3 3h18v18H3V3m2 2v14h14V5H5z" fill="white"/>
      <path d="M7 7h10v2H7V7m0 4h10v2H7v-2m0 4h7v2H7v-2" fill="white"/>
    </svg>`,
    create: () => {
      const content = document.createElement('div');
      content.className = 'notes-content';

      // Enhanced notes with formatting toolbar and file management
      const toolbar = document.createElement('div');
      toolbar.className = 'notes-toolbar';
      toolbar.innerHTML = `
        <div class="notes-file-actions">
          <button class="notes-btn" data-action="new">New</button>
          <button class="notes-btn" data-action="open">Open</button>
          <button class="notes-btn" data-action="save">Save</button>
        </div>
        <div class="notes-format-actions">
          <button class="notes-btn" data-format="bold">B</button>
          <button class="notes-btn" data-format="italic">I</button>
          <button class="notes-btn" data-format="underline">U</button>
          <select class="notes-font-size">
            ${[8, 10, 12, 14, 16, 18, 20].map(size => 
              `<option value="${size}"${size === 12 ? ' selected' : ''}>${size}px</option>`
            ).join('')}
          </select>
        </div>
      `;

      const editor = document.createElement('div');
      editor.className = 'notes-editor';
      editor.contentEditable = true;
      editor.innerHTML = 'Start typing...';

      const statusBar = document.createElement('div');
      statusBar.className = 'notes-status-bar';
      statusBar.innerHTML = '<span>Ready</span><span>Characters: 0</span>';

      content.appendChild(toolbar);
      content.appendChild(editor);
      content.appendChild(statusBar);

      // Add styles
      const style = document.createElement('style');
      style.textContent = `
        .notes-content {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .notes-toolbar {
          display: flex;
          justify-content: space-between;
          padding: 8px;
          background: #c0c0c0;
          border-bottom: 2px solid #808080;
        }
        .notes-btn {
          margin: 0 2px;
          padding: 4px 8px;
          background: #c0c0c0;
          border: 2px solid;
          border-top-color: #fff;
          border-left-color: #fff;
          border-right-color: #808080;
          border-bottom-color: #808080;
        }
        .notes-btn:active {
          border-top-color: #808080;
          border-left-color: #808080;
          border-right-color: #fff;
          border-bottom-color: #fff;
        }
        .notes-editor {
          flex: 1;
          padding: 8px;
          background: #fff;
          overflow-y: auto;
        }
        .notes-status-bar {
          display: flex;
          justify-content: space-between;
          padding: 4px 8px;
          background: #c0c0c0;
          border-top: 2px solid #808080;
        }
        .notes-font-size {
          width: 60px;
        }
      `;
      document.head.appendChild(style);

      // Handle formatting
      toolbar.addEventListener('click', (e) => {
        const button = e.target.closest('.notes-btn');
        if (!button) return;

        const action = button.dataset.action;
        const format = button.dataset.format;

        if (action === 'new') {
          if (confirm('Create new document? Unsaved changes will be lost.')) {
            editor.innerHTML = '';
          }
        } else if (action === 'save') {
          const saveDate = new Date().toLocaleString();
          statusBar.firstChild.textContent = `Last saved: ${saveDate}`;
          localStorage.setItem('boxcat_notes_' + saveDate, editor.innerHTML);
        } else if (action === 'open') {
          const notes = Object.keys(localStorage)
            .filter(key => key.startsWith('boxcat_notes_'))
            .map(key => ({ key, date: key.replace('boxcat_notes_', '') }));
          
          if (notes.length === 0) {
            alert('No saved notes found.');
            return;
          }

          const notesList = notes.map((note, i) => 
            `${i + 1}. ${note.date}`
          ).join('\n');

          const choice = prompt(`Select a note to open:\n\n${notesList}`);
          if (choice && notes[choice - 1]) {
            editor.innerHTML = localStorage.getItem(notes[choice - 1].key);
          }
        } else if (format) {
          document.execCommand(format, false);
        }
      });

      // Handle font size changes
      toolbar.querySelector('.notes-font-size').addEventListener('change', (e) => {
        document.execCommand('fontSize', false, e.target.value);
      });

      // Update character count
      editor.addEventListener('input', () => {
        const chars = editor.innerText.length;
        statusBar.lastChild.textContent = `Characters: ${chars}`;
      });

      // Add easter egg detection
      editor.addEventListener('input', () => {
        // Update character count
        const chars = editor.innerText.length;
        statusBar.lastChild.textContent = `Characters: ${chars}`;

        // Check for easter egg
        if (editor.innerText.includes('aveto2013')) {
          // Remove the text immediately
          editor.innerText = editor.innerText.replace('aveto2013', '');
          
          // Play a special sound
          selectSound.play();

          // Create the special window
          const specialWindow = new Window('???', (() => {
            const specialContent = document.createElement('div');
            specialContent.style.cssText = `
              padding: 20px;
              text-align: center;
              background: #000080;
              color: white;
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-family: 'Web437_IBM_VGA_8x16', monospace;
            `;
            
            specialContent.innerHTML = `
              <div style="animation: rainbow 2s linear infinite;">
                <h1 style="font-size: 24px; margin-bottom: 20px;">🌟 Thank you aveto2013! 🌟</h1>
              </div>
              <p style="margin: 10px 0;">You found the secret easter egg!</p>
              <p style="margin: 10px 0;">Special thanks for being awesome!</p>
              <div style="margin-top: 20px;">
                <pre style="color: #00ff00;">
   /\\___/\\
  (  o o  )
  (  =^=  ) 
   (______)
                </pre>
              </div>
            `;

            // Add rainbow animation
            const style = document.createElement('style');
            style.textContent = `
              @keyframes rainbow {
                0% { color: #ff0000; }
                20% { color: #ffff00; }
                40% { color: #00ff00; }
                60% { color: #00ffff; }
                80% { color: #ff00ff; }
                100% { color: #ff0000; }
              }
            `;
            document.head.appendChild(style);

            return specialContent;
          })(), `
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="#ff00ff"/>
              <text x="12" y="16" text-anchor="middle" fill="white" style="font-size: 12px;">?</text>
            </svg>
          `);

          // Add some sparkle effects
          const sparkles = 20;
          for (let i = 0; i < sparkles; i++) {
            const sparkle = document.createElement('div');
            sparkle.style.cssText = `
              position: fixed;
              width: 4px;
              height: 4px;
              background: white;
              border-radius: 50%;
              pointer-events: none;
              z-index: 10000;
            `;
            document.body.appendChild(sparkle);

            const startX = Math.random() * window.innerWidth;
            const startY = Math.random() * window.innerHeight;
            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 100;

            sparkle.animate([
              {
                left: `${startX}px`,
                top: `${startY}px`,
                opacity: 1,
                transform: 'scale(1)'
              },
              {
                left: `${startX + Math.cos(angle) * distance}px`,
                top: `${startY + Math.sin(angle) * distance}px`,
                opacity: 0,
                transform: 'scale(0)'
              }
            ], {
              duration: 1000 + Math.random() * 1000,
              easing: 'ease-out'
            }).onfinish = () => sparkle.remove();
          }
        }
      });

      return content;
    }
  },

  browser: {
    title: 'goCatTheInternet',
    icon: `<svg viewBox="0 0 24 24" width="20" height="20">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="white"/>
      <path d="M12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8m0 2c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6" fill="#000080"/>
      <path d="M12 8v8M8 12h8" stroke="white" stroke-width="2"/>
    </svg>`,
    create: () => {
      const content = document.createElement('div');
      content.className = 'browser-content';
      
      const toolbar = document.createElement('div');
      toolbar.className = 'browser-toolbar';
      
      const backBtn = document.createElement('button');
      backBtn.className = 'browser-btn';
      backBtn.textContent = '←';
      
      const forwardBtn = document.createElement('button');
      forwardBtn.className = 'browser-btn';
      forwardBtn.textContent = '→';
      
      const homeBtn = document.createElement('button');
      homeBtn.className = 'browser-btn';
      homeBtn.textContent = 'Home';
      
      const urlBar = document.createElement('input');
      urlBar.className = 'url-bar';
      urlBar.value = 'https://gocat.boxcat/home';
      
      const goBtn = document.createElement('button');
      goBtn.className = 'browser-btn';
      goBtn.textContent = 'Go!';
      
      toolbar.append(backBtn, forwardBtn, homeBtn, urlBar, goBtn);
      
      const viewport = document.createElement('div');
      viewport.className = 'browser-viewport';

      // Create home page content
      const loadHomePage = () => {
        const homePage = document.createElement('div');
        homePage.className = 'browser-home';
        
        const logo = document.createElement('div');
        logo.innerHTML = `<svg viewBox="0 0 200 100" width="200" height="100">
          <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
                fill="#000080" style="font-size: 40px; font-weight: bold;">
            goCat!
          </text>
        </svg>`;
        
        const searchBox = document.createElement('input');
        searchBox.className = 'search-box';
        searchBox.placeholder = 'Search the Internet...';
        
        const links = document.createElement('div');
        links.className = 'browser-links';
        links.innerHTML = `
          <a href="https://boxcat.news" class="browser-link">BoxCat News</a>
          <a href="https://mail.boxcat.com" class="browser-link">BoxCat Mail</a>
          <a href="https://boxcat.maps" class="browser-link">BoxCat Maps</a>
          <a href="https://meow.boxcat.com" class="browser-link">Meow Search</a>
          <a href="https://download.cats.boxcat" class="browser-link">downloadCATS</a>
        `;
        
        homePage.append(logo, searchBox, links);
        return homePage;
      };

      // WebsimSocket for website data
      const room = new WebsimSocket();

      // Fake website content database with new GoCatWeb Builder
      const websites = {
        'boxcat.news': {
          title: 'BoxCat News',
          content: `
            <div style="font-family: 'Web437_IBM_VGA_8x16', monospace;">
              <h1>BoxCat News - Since 1993</h1>
              <hr>
              <div class="news-item">
                <h2>New Computer Revolution: GUI Is The Future</h2>
                <p>Experts predict graphical interfaces will change computing forever. Our tech analysts discuss the rise of windows, icons, and mouse pointers in modern computing.</p>
              </div>
              <div class="news-item">
                <h2>Introducing The Information Superhighway</h2>
                <p>What is this "Internet" thing everyone's talking about? We explore the fascinating world of modems, bulletin boards, and the promise of global connectivity.</p>
              </div>
              <div class="news-item">
                <h2>BoxCat OS: The Future of Personal Computing?</h2>
                <p>Our comprehensive review of the newest operating system on the market. Is this the Windows competitor we've been waiting for?</p>
              </div>
              <div class="news-item">
                <h2>Coming Soon: GoCatWeb Builder</h2>
                <p>Our new website builder tool is in development. Stay tuned for its release in a future BoxCat OS update!</p>
              </div>
            </div>
          `
        },
        'mail.boxcat.com': {
          title: 'BoxCat Mail',
          content: `
            <div style="padding: 20px; font-family: 'Web437_IBM_VGA_8x16', monospace;">
              <h1>BoxCat Mail</h1>
              <p style="color: red;">* Please sign in to access your mailbox *</p>
              <form style="margin-top: 20px;">
                <div style="margin-bottom: 10px;">
                  <label>Email:</label><br>
                  <input type="text" style="width: 200px;" placeholder="username@boxcat.com">
                </div>
                <div style="margin-bottom: 10px;">
                  <label>Password:</label><br>
                  <input type="password" style="width: 200px;">
                </div>
                <button type="button" class="browser-btn">Sign In</button>
              </form>
              <div style="margin-top: 20px;">
                <p>New to BoxCat Mail?</p>
                <p>Get your free account with 2MB storage!</p>
              </div>
            </div>
          `
        },
        'boxcat.maps': {
          title: 'BoxCat Maps',
          content: `
            <div style="padding: 20px; font-family: 'Web437_IBM_VGA_8x16', monospace;">
              <h1>BoxCat Maps</h1>
              <div style="color: red; margin: 20px 0;">
                * This service requires the BoxCat Maps Plugin (Coming Soon) *
              </div>
              <pre style="background: #000080; color: white; padding: 10px;">
╔════════════════════╗
║    BoxCat Maps    ║
║   Coming Soon!    ║
║                  ║
║  [ Preview ]     ║
║    ╭─────╮      ║
║    │  N  │      ║
║    │W+E  │      ║
║    │  S  │      ║
║    ╰─────╯      ║
╚════════════════════╝
              </pre>
              <p style="margin-top: 20px;">Features coming in the next update:</p>
              <ul>
                <li>Digital street maps</li>
                <li>Point-to-point directions</li>
                <li>Local business finder</li>
                <li>Print-friendly maps</li>
              </ul>
            </div>
          `
        },
        'meow.boxcat.com': {
          title: 'Meow Search',
          content: `
            <div style="padding: 20px; text-align: center; font-family: 'Web437_IBM_VGA_8x16', monospace;">
              <h1 style="color: #000080; font-size: 32px;">Meow Search</h1>
              <div style="margin: 30px 0;">
                <input type="text" style="width: 80%; max-width: 400px; padding: 5px;" placeholder="Search the information superhighway...">
                <button class="browser-btn">Search!</button>
              </div>
              <div style="margin-top: 40px;">
                <h3>Popular Categories:</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 20px;">
                  <a href="#" class="browser-link">Computing</a>
                  <a href="#" class="browser-link">Games</a>
                  <a href="#" class="browser-link">News</a>
                  <a href="#" class="browser-link">Shopping</a>
                  <a href="#" class="browser-link">Sports</a>
                  <a href="#" class="browser-link">Weather</a>
                </div>
              </div>
              <div style="margin-top: 40px; color: #666;">
                <p>Indexing the World Wide Web since 1993</p>
                <p>Over 1,000 websites indexed!</p>
              </div>
            </div>
          `
        },
        'meow.boxcat.com': {
          title: 'Meow Search',
          content: `
            <div style="padding: 20px; text-align: center; font-family: 'Web437_IBM_VGA_8x16', monospace;">
              <h1 style="color: #000080; font-size: 32px;">Meow Search</h1>
              <div style="margin: 30px 0;">
                <input type="text" style="width: 80%; max-width: 400px; padding: 5px;" placeholder="Search the information superhighway...">
                <button class="browser-btn">Search!</button>
              </div>
              <div style="margin-top: 40px;">
                <h3>Popular Categories:</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 20px;">
                  <a href="#" class="browser-link">Computing</a>
                  <a href="#" class="browser-link">Games</a>
                  <a href="#" class="browser-link">News</a>
                  <a href="#" class="browser-link">Shopping</a>
                  <a href="#" class="browser-link">Sports</a>
                  <a href="#" class="browser-link">Weather</a>
                </div>
              </div>
              <div style="margin-top: 40px; color: #666;">
                <p>Indexing the World Wide Web since 1993</p>
                <p>Over 1,000 websites indexed!</p>
              </div>
            </div>
          `
        },
        'download.cats.boxcat': {
          title: 'downloadCATS - Download Apps & Games',
          content: `
            <div style="padding: 20px; font-family: 'Web437_IBM_VGA_8x16', monospace;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h1>downloadCATS</h1>
                <button class="browser-btn" id="scanButton" onclick="alert('NoVirusCAT Scanner is scanning...')">🔍 Scan with NoVirusCAT</button>
              </div>
              
              <div style="background: #ffeb3b; padding: 10px; border: 2px solid #808080; margin-bottom: 20px;">
                <strong>⚠️ Warning:</strong> Always scan downloads with NoVirusCAT before running them!
              </div>

              <div style="display: grid; gap: 20px;">
                <div class="download-category">
                  <h2>🎮 Games</h2>
                  <div class="download-grid">
                    <div class="download-item safe">
                      <h3>BoxCat Adventures</h3>
                      <p>A fun platformer game! Help BoxCat collect mice and avoid dogs.</p>
                      <p class="file-info">Size: 1.2MB | ✅ Safe</p>
                      <button class="browser-btn download-btn" onclick="alert('Downloading BoxCat Adventures...')">Download</button>
                    </div>
                    
                    <div class="download-item virus">
                      <h3>Super Meow Bros</h3>
                      <p>FREE GAME NO VIRUS TRUST ME!!!</p>
                      <p class="file-info">Size: 50KB | ⚠️ Suspicious</p>
                      <button class="browser-btn download-btn" onclick="alert('WARNING: NoVirusCAT detected MEOW-TROJAN-1993!')">Download</button>
                    </div>

                    <div class="download-item safe">
                      <h3>Paw Paw Revolution</h3>
                      <p>Dance to the rhythm! The hottest new game of 1993!</p>
                      <p class="file-info">Size: 2.1MB | ✅ Safe</p>
                      <button class="browser-btn download-btn" onclick="alert('Downloading Paw Paw Revolution...')">Download</button>
                    </div>
                  </div>
                </div>

                <div class="download-category">
                  <h2>💾 Applications</h2>
                  <div class="download-grid">
                    <div class="download-item safe">
                      <h3>PawPaint Pro</h3>
                      <p>Professional image editor for cats!</p>
                      <p class="file-info">Size: 3.4MB | ✅ Safe</p>
                      <button class="browser-btn download-btn" onclick="alert('Downloading PawPaint Pro...')">Download</button>
                    </div>

                    <div class="download-item virus">
                      <h3>FREE RAM DOWNLOADER</h3>
                      <p>DOWNLOAD MORE RAM FOR FREE! MAKE PC FASTER!!!</p>
                      <p class="file-info">Size: 13KB | ⚠️ Very Suspicious</p>
                      <button class="browser-btn download-btn" onclick="alert('WARNING: NoVirusCAT detected WHISKERS-RANSOMWARE!')">Download</button>
                    </div>

                    <div class="download-item safe">
                      <h3>MeowPlayer 2.0</h3>
                      <p>Play all your favorite MIDI tunes!</p>
                      <p class="file-info">Size: 0.8MB | ✅ Safe</p>
                      <button class="browser-btn download-btn" onclick="alert('Downloading MeowPlayer 2.0...')">Download</button>
                    </div>
                  </div>
                </div>

                <div class="download-category">
                  <h2>🛡️ Security</h2>
                  <div class="download-grid">
                    <div class="download-item safe">
                      <h3>NoVirusCAT 1.0</h3>
                      <p>Essential virus protection for your BoxCat OS!</p>
                      <p class="file-info">Size: 1.5MB | ✅ Official BoxCat Software</p>
                      <button class="browser-btn download-btn" onclick="alert('Downloading NoVirusCAT 1.0...')">Download</button>
                    </div>

                    <div class="download-item virus">
                      <h3>CatGuard Pro</h3>
                      <p>BEST ANTIVIRUS 100% WORKING [CRACKED]</p>
                      <p class="file-info">Size: 28KB | ⚠️ Extremely Suspicious</p>
                      <button class="browser-btn download-btn" onclick="alert('WARNING: NoVirusCAT detected PURR-MALWARE-1993!')">Download</button>
                    </div>

                    <div class="download-item safe">
                      <h3>PawFire Wall</h3>
                      <p>Protect your network with our advanced firewall!</p>
                      <p class="file-info">Size: 0.9MB | ✅ Safe</p>
                      <button class="browser-btn download-btn" onclick="alert('Downloading PawFire Wall...')">Download</button>
                    </div>
                  </div>
                </div>
              </div>

              <style>
                .download-grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                  gap: 15px;
                  margin-top: 10px;
                }
                
                .download-item {
                  border: 2px solid #808080;
                  padding: 15px;
                  background: #fff;
                }
                
                .download-item.virus {
                  border-color: #ff9800;
                }
                
                .download-item h3 {
                  margin: 0 0 10px 0;
                  color: #000080;
                }
                
                .file-info {
                  font-size: 12px;
                  color: #666;
                  margin: 10px 0;
                }
                
                .download-category {
                  background: #f0f0f0;
                  padding: 15px;
                  border: 2px solid #808080;
                }
                
                .download-category h2 {
                  margin: 0 0 10px 0;
                  color: #000080;
                }
                
                #scanButton {
                  background: #4caf50;
                  color: white;
                  border-color: #45a049;
                }
              </style>
            </div>
          `
        },
        'meow.boxcat.com': {
          title: 'Meow Search',
          content: `
            <div style="padding: 20px; text-align: center; font-family: 'Web437_IBM_VGA_8x16', monospace;">
              <h1 style="color: #000080; font-size: 32px;">Meow Search</h1>
              <div style="margin: 30px 0;">
                <input type="text" style="width: 80%; max-width: 400px; padding: 5px;" placeholder="Search the information superhighway...">
                <button class="browser-btn">Search!</button>
              </div>
              <div style="margin-top: 40px;">
                <h3>Popular Categories:</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 20px;">
                  <a href="#" class="browser-link">Computing</a>
                  <a href="#" class="browser-link">Games</a>
                  <a href="#" class="browser-link">News</a>
                  <a href="#" class="browser-link">Shopping</a>
                  <a href="#" class="browser-link">Sports</a>
                  <a href="#" class="browser-link">Weather</a>
                </div>
              </div>
              <div style="margin-top: 40px; color: #666;">
                <p>Indexing the World Wide Web since 1993</p>
                <p>Over 1,000 websites indexed!</p>
              </div>
            </div>
          `
        }
      };

      // Function to load website content
      const loadWebsite = async (url) => {
        urlBar.value = url;
        const domain = url.split('/')[2];
        
        // Check if it's a user-created website
        if (domain.endsWith('.gocatweb.boxcat')) {
          const subdomain = domain.split('.')[0];
          const websites = await room.collection('website')
            .filter({ subdomain })
            .getList();
          
          if (websites.length > 0) {
            const website = websites[0];
            viewport.innerHTML = `
              <div style="background-color: ${website.bgColor}; padding: 20px; min-height: 100%;">
                <h1>${website.name}</h1>
                <div class="user-content">${website.content}</div>
                <hr>
                <footer>Created by ${website.username} on GoCatWeb</footer>
              </div>
            `;
            return;
          }
        }
        
        // Load built-in websites
        if (websites[domain]) {
          document.title = websites[domain].title + ' - BoxCat Browser';
          viewport.innerHTML = websites[domain].content;
        } else {
          viewport.innerHTML = `
            <div style="padding: 20px; text-align: center;">
              <h2>404 - Page Not Found</h2>
              <p>The page you're looking for doesn't exist in this demo.</p>
            </div>
          `;
        }
      };

      // Set up event listeners
      urlBar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          loadWebsite(urlBar.value);
        }
      });

      goBtn.addEventListener('click', () => {
        loadWebsite(urlBar.value);
      });

      homeBtn.addEventListener('click', () => {
        urlBar.value = 'https://gocat.boxcat/home';
        viewport.innerHTML = '';
        viewport.appendChild(loadHomePage());
      });

      // Initial load of home page
      viewport.appendChild(loadHomePage());

      // Handle link clicks
      viewport.addEventListener('click', (e) => {
        if (e.target.classList.contains('browser-link')) {
          e.preventDefault();
          loadWebsite(e.target.href);
        }
      });

      content.append(toolbar, viewport);
      return content;
    }
  },
  settings: {
    title: 'System Settings',
    icon: `<svg viewBox="0 0 24 24" width="20" height="20">
      <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" fill="white"/>
    </svg>`,
    create: () => {
      const content = document.createElement('div');
      content.className = 'settings-content';

      const tabs = document.createElement('div');
      tabs.className = 'settings-tabs';
      tabs.innerHTML = `
        <button class="settings-tab active" data-tab="display">Display</button>
        <button class="settings-tab" data-tab="sound">Sound</button>
        <button class="settings-tab" data-tab="system">System</button>
      `;

      const settingsBody = document.createElement('div');
      settingsBody.className = 'settings-body';

      const resetButton = `
        <div class="setting-item" style="margin-top: 20px; border-top: 1px solid #808080; padding-top: 20px;">
          <button class="reset-btn">Reset BoxCat OS</button>
        </div>
      `;

      const wallpapers = [
        { name: 'Default Teal', color: '#008080' },
        { name: 'Classic Blue', color: '#000080' },
        { name: 'Forest Green', color: '#006400' },
        { name: 'Burgundy', color: '#800000' },
        { name: 'Gray', color: '#808080' },
        { name: 'Pattern 1', pattern: 'repeating-linear-gradient(45deg, #008080 0px, #008080 10px, #006666 10px, #006666 20px)' },
        { name: 'Pattern 2', pattern: 'radial-gradient(circle at center, #008080, #000080)' },
        { name: 'Pattern 3', pattern: 'linear-gradient(45deg, #008080 25%, transparent 25%), linear-gradient(-45deg, #008080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #008080 75%), linear-gradient(-45deg, transparent 75%, #008080 75%)' }
      ];

      const sections = {
        display: `
          <div class="settings-section">
            <h3>Display Settings</h3>
            <div class="setting-item">
              <label>Resolution:</label>
              <select>
                <option>640x480</option>
                <option>800x600</option>
                <option>1024x768</option>
              </select>
            </div>
            <div class="setting-item">
              <label>Color Depth:</label>
              <select>
                <option>16 Colors</option>
                <option>256 Colors</option>
                <option>High Color (16-bit)</option>
              </select>
            </div>
            <div class="setting-item">
              <label>Wallpaper:</label>
              <div class="wallpaper-grid">
                ${wallpapers.map((wp, index) => `
                  <div class="wallpaper-preview" data-index="${index}" style="background: ${wp.color || wp.pattern}"></div>
                `).join('')}
              </div>
            </div>
            ${resetButton}
          </div>
        `,
        sound: `
          <div class="settings-section">
            <h3>Sound Settings</h3>
            <div class="setting-item">
              <label>Sound Card:</label>
              <select>
                <option>Sound Blaster 16</option>
                <option>Sound Blaster Pro</option>
                <option>AdLib</option>
              </select>
            </div>
            ${resetButton}
          </div>
        `,
        system: `
          <div class="settings-section">
            <h3>System Information</h3>
            <div class="system-info">
              <p>BoxCat OS Version 1.0 Beta (1993)</p>
              <p>Memory: 4MB RAM</p>
              <p>Processor: 486DX/33 MHz</p>
              <p>Hard Disk: 120MB</p>
              <div class="setting-item" style="margin-top: 20px; border-top: 1px solid #808080; padding-top: 20px;">
                <label style="color: red; font-weight: bold;">⚠️ Security Settings:</label>
                <div style="margin-top: 10px;">
                  <input type="checkbox" id="disableProtection"> 
                  <label for="disableProtection" style="color: red;">Disable NoVirusCAT Protection (DANGEROUS!)</label>
                </div>
                <p style="color: #800000; margin-top: 5px; font-size: 0.9em;">
                  Warning: Disabling virus protection allows running infected files. 
                  This is extremely dangerous and not recommended!
                </p>
              </div>
            </div>
            ${resetButton}
          </div>
        `
      };

      settingsBody.innerHTML = sections.display;

      tabs.addEventListener('click', (e) => {
        if (e.target.classList.contains('settings-tab')) {
          tabs.querySelectorAll('.settings-tab').forEach(tab => tab.classList.remove('active'));
          e.target.classList.add('active');
          const tabName = e.target.dataset.tab;
          settingsBody.innerHTML = sections[tabName];
          setupResetButton(settingsBody);
          if (tabName === 'display') {
            setupWallpaperPreviews(settingsBody);
          }
          if (tabName === 'system') {
            setupVirusProtection();
          }
        }
      });

      content.appendChild(tabs);
      content.appendChild(settingsBody);
      
      setupResetButton(settingsBody);
      setupWallpaperPreviews(settingsBody);
      
      return content;
    }
  },
  chat: {
    title: 'BoxChat',
    icon: `<svg viewBox="0 0 24 24" width="20" height="20">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="white"/>
      <path d="M6 9h12M6 13h8" stroke="#000080" fill="none" stroke-width="2"/>
    </svg>`,
    create: () => {
      const room = new WebsimSocket();
      const content = document.createElement('div');
      content.className = 'chat-content';
      
      const chatHeader = document.createElement('div');
      chatHeader.className = 'chat-header';
      chatHeader.innerHTML = `
        <div class="chat-tabs">
          <button class="chat-tab active" data-tab="public">Public Chat</button>
          <button class="chat-tab" data-tab="games">Games</button>
          <button class="chat-tab" data-tab="help">Help</button>
        </div>
        <div class="online-users">
          Online: <span class="user-count">1</span>
        </div>
      `;
      
      const messages = document.createElement('div');
      messages.className = 'chat-messages';
      
      const gameArea = document.createElement('div');
      gameArea.className = 'chat-games hidden';
      gameArea.innerHTML = `
        <div class="game-options">
          <button class="game-btn" data-game="tictactoe">Tic Tac Toe</button>
          <button class="game-btn" data-game="hangman">Hangman</button>
          <button class="game-btn" data-game="guess">Number Guess</button>
        </div>
        <div class="game-area"></div>
      `;
      
      const helpArea = document.createElement('div');
      helpArea.className = 'chat-help hidden';
      helpArea.innerHTML = `
        <h3>Chat Commands:</h3>
        <ul>
          <li>/help - Show this help</li>
          <li>/clear - Clear chat</li>
          <li>/me [action] - Perform an action</li>
          <li>/botcat [question] - Ask BotCat a question</li>
          <li>/whisper [user] [message] - Send private message</li>
        </ul>
        <h3>Tips:</h3>
        <ul>
          <li>Use emojis like :cat: :smile: :heart:</li>
          <li>Click on usernames to view profile</li>
          <li>Double-click messages to react</li>
        </ul>
      `;
      
      const inputArea = document.createElement('div');
      inputArea.className = 'chat-input-area';
      
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'chat-input';
      input.placeholder = 'Type a message... (@ for mentions, / for commands)';
      
      const sendButton = document.createElement('button');
      sendButton.className = 'chat-send-btn';
      sendButton.textContent = 'Send';
      
      const emojiButton = document.createElement('button');
      emojiButton.className = 'chat-emoji-btn';
      emojiButton.innerHTML = '😺';
      
      inputArea.appendChild(emojiButton);
      inputArea.appendChild(input);
      inputArea.appendChild(sendButton);
      
      content.appendChild(chatHeader);
      content.appendChild(messages);
      content.appendChild(gameArea);
      content.appendChild(helpArea);
      content.appendChild(inputArea);

      // Add enhanced styles
      const style = document.createElement('style');
      style.textContent = `
        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          background: #c0c0c0;
          border-bottom: 2px solid #808080;
        }
        .chat-tabs {
          display: flex;
          gap: 4px;
        }
        .chat-tab {
          padding: 4px 8px;
          background: #c0c0c0;
          border: 2px solid;
          border-top-color: #fff;
          border-left-color: #fff;
          border-right-color: #808080;
          border-bottom-color: #808080;
        }
        .chat-tab.active {
          background: #000080;
          color: #fff;
        }
        .chat-emoji-btn {
          padding: 4px 8px;
          background: #c0c0c0;
          border: 2px solid;
          border-top-color: #fff;
          border-left-color: #fff;
          border-right-color: #808080;
          border-bottom-color: #808080;
        }
        .chat-message {
          position: relative;
        }
        .chat-message:hover .message-actions {
          display: flex;
        }
        .message-actions {
          display: none;
          position: absolute;
          right: 4px;
          top: 4px;
          gap: 4px;
        }
        .message-action {
          padding: 2px 4px;
          background: #c0c0c0;
          border: 1px solid #808080;
          cursor: pointer;
        }
        .hidden {
          display: none;
        }
      `;
      document.head.appendChild(style);

      // Enhanced message handling
      const emojis = {
        ':cat:': '😺',
        ':smile:': '😊',
        ':heart:': '❤️',
        ':star:': '⭐',
        ':sun:': '☀️',
        ':moon:': '🌙'
      };

      const processMessage = (text) => {
        // Replace emojis
        Object.entries(emojis).forEach(([code, emoji]) => {
          text = text.replaceAll(code, emoji);
        });

        // Handle commands
        if (text.startsWith('/')) {
          const [command, ...args] = text.slice(1).split(' ');
          switch (command) {
            case 'me':
              return { type: 'action', text: args.join(' ') };
            case 'clear':
              messages.innerHTML = '';
              return null;
            case 'help':
              helpArea.classList.remove('hidden');
              messages.classList.add('hidden');
              gameArea.classList.add('hidden');
              return null;
          }
        }

        return { type: 'message', text };
      };

      // Subscribe to messages with enhanced rendering
      room.collection('message').subscribe((messageList) => {
        messages.innerHTML = '';
        messageList.forEach(msg => {
          const msgEl = document.createElement('div');
          msgEl.className = 'chat-message';
          
          const isAction = msg.text.startsWith('/me ');
          
          msgEl.innerHTML = `
            <img src="https://images.websim.ai/avatar/${msg.username}" class="chat-avatar">
            <div class="chat-message-content">
              <div class="chat-username">${msg.username}</div>
              <div class="chat-text">${
                isAction ? 
                  `<i>* ${msg.username} ${msg.text.slice(4)}</i>` : 
                  msg.text
              }</div>
            </div>
            <div class="message-actions">
              <button class="message-action">👍</button>
              <button class="message-action">❤️</button>
              <button class="message-action">💬</button>
            </div>
          `;
          messages.appendChild(msgEl);
        });
        messages.scrollTop = messages.scrollHeight;
      });

      // Handle sending messages
      const sendMessage = async () => {
        const text = input.value.trim();
        if (text) {
          const processed = processMessage(text);
          if (processed) {
            await room.collection('message').create(processed);
          }
          input.value = '';
        }
      };

      sendButton.addEventListener('click', sendMessage);
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          sendMessage();
        }
      });

      // Enhanced BotCat responses
      const botResponse = async (text) => {
        if (text.toLowerCase().includes('botcat')) {
          try {
            const response = await fetch('/api/ai_completion', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify({
                prompt: `You are BotCat, a helpful and playful AI assistant in BoxCat OS chat from 1993.
                Respond in a friendly, retro computing style with cat-themed personality.
                Current message: "${text}"
                
                <typescript-interface>
                interface Response {
                  reply: string;
                  action?: string;
                }
                </typescript-interface>
                
                <example>
                {
                  "reply": "Purrfect question! The new Sound Blaster 16 is great for MIDI music! Have you tried it yet? =^.^=",
                  "action": "purrs happily while thinking about music"
                }
                </example>`,
                data: text
              }),
            });
            const data = await response.json();
            await room.collection('message').create({
              text: data.reply,
              username: 'BotCat'
            });
            if (data.action) {
              await room.collection('message').create({
                text: `/me ${data.action}`,
                username: 'BotCat'
              });
            }
          } catch (error) {
            console.error('Error getting AI response:', error);
          }
        }
      };

      // Handle tab switching
      chatHeader.addEventListener('click', (e) => {
        const tab = e.target.closest('.chat-tab');
        if (!tab) return;

        chatHeader.querySelectorAll('.chat-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const tabName = tab.dataset.tab;
        messages.classList.add('hidden');
        gameArea.classList.add('hidden');
        helpArea.classList.add('hidden');

        if (tabName === 'public') {
          messages.classList.remove('hidden');
        } else if (tabName === 'games') {
          gameArea.classList.remove('hidden');
        } else if (tabName === 'help') {
          helpArea.classList.remove('hidden');
        }
      });

      // Emoji picker
      emojiButton.addEventListener('click', () => {
        const picker = document.createElement('div');
        picker.className = 'emoji-picker';
        picker.style.cssText = `
          position: absolute;
          bottom: 100%;
          left: 0;
          background: #fff;
          border: 2px solid #808080;
          padding: 8px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
        `;
        
        Object.values(emojis).forEach(emoji => {
          const btn = document.createElement('button');
          btn.textContent = emoji;
          btn.onclick = () => {
            input.value += emoji;
            picker.remove();
          };
          picker.appendChild(btn);
        });
        
        inputArea.appendChild(picker);
        
        // Close picker when clicking outside
        const closeHandler = (e) => {
          if (!picker.contains(e.target) && e.target !== emojiButton) {
            picker.remove();
            document.removeEventListener('click', closeHandler);
          }
        };
        document.addEventListener('click', closeHandler);
      });

      // Update user count
      room.party.subscribe((peers) => {
        const count = Object.keys(peers).length;
        chatHeader.querySelector('.user-count').textContent = count;
      });

      return content;
    }
  },
  downloads: {
    title: 'Downloads',
    icon: `<svg viewBox="0 0 24 24" width="20" height="20">
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="white"/>
    </svg>`,
    create: () => {
      const content = document.createElement('div');
      content.className = 'downloads-content';

      // Get downloads from localStorage
      const downloads = JSON.parse(localStorage.getItem('boxcat_downloads') || '[]');
      const virusProtectionEnabled = localStorage.getItem('virusProtection') !== 'disabled';

      if (downloads.length === 0) {
        content.innerHTML = `
          <div class="no-downloads">
            <p>No files downloaded yet.</p>
            <p>Visit downloadCATS to get some apps and games!</p>
          </div>
        `;
        return content;
      }

      content.innerHTML = `
        ${virusProtectionEnabled ? '' : `
          <div style="background: #800000; color: white; padding: 10px; margin-bottom: 20px; border: 2px solid red;">
            ⚠️ WARNING: NoVirusCAT Protection is DISABLED! Your system is at risk!
          </div>
        `}
        <div class="downloads-list">
          ${downloads.map(file => `
            <div class="download-item ${file.virus ? 'virus' : 'safe'}">
              <div class="file-icon">
                ${file.type === 'app' ? `
                  <svg viewBox="0 0 24 24" width="32" height="32">
                    <rect x="2" y="2" width="20" height="20" rx="2" fill="#000080"/>
                    <path d="M6 12h12M12 6v12" stroke="white" stroke-width="2"/>
                  </svg>
                ` : `
                  <svg viewBox="0 0 24 24" width="32" height="32">
                    <rect x="2" y="2" width="20" height="20" rx="2" fill="#008000"/>
                    <path d="M7 12h10M12 7l5 5-5 5" stroke="white" stroke-width="2" fill="none"/>
                  </svg>
                `}
              </div>
              <div class="file-info">
                <h3>${file.name}</h3>
                <p>Size: ${file.size}</p>
                <p class="security-status">
                  ${file.virus ? 
                    (virusProtectionEnabled ? 
                      '⚠️ WARNING: NoVirusCAT detected a threat!' : 
                      '⚠️ DANGER: File contains malware! Protection disabled!') : 
                    '✅ Scanned by NoVirusCAT - Safe'}
                </p>
              </div>
              <div class="file-actions">
                ${file.virus ? 
                  (virusProtectionEnabled ? `
                    <button class="browser-btn delete-btn" data-id="${file.id}">Delete</button>
                    <button class="browser-btn quarantine-btn" data-id="${file.id}">Quarantine</button>
                  ` : `
                    <button class="browser-btn run-btn virus-btn" data-id="${file.id}">Run Anyway (!)</button>
                    <button class="browser-btn delete-btn" data-id="${file.id}">Delete</button>
                  `) : `
                    <button class="browser-btn run-btn" data-id="${file.id}">Run</button>
                    <button class="browser-btn delete-btn" data-id="${file.id}">Delete</button>
                `}
              </div>
            </div>
          `).join('')}
        </div>
      `;

      // Add event listeners
      content.querySelectorAll('.run-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const fileId = btn.dataset.id;
          const file = downloads.find(f => f.id === fileId);
          if (file) {
            if (file.virus && btn.classList.contains('virus-btn')) {
              // Run virus file
              const really = window.confirm(
                "⚠️ EXTREME DANGER ⚠️\n\n" +
                "You are about to run a file that contains malware!\n" +
                "This could harm your computer and data!\n\n" +
                "Are you absolutely sure you want to continue?"
              );
              if (really) {
                runVirusFile(file);
              }
            } else {
              runDownloadedFile(file);
            }
          }
        });
      });

      // ... keep existing button handlers ...

      return content;
    }
  }
};

// Function to run downloaded files
function runDownloadedFile(file) {
  switch (file.name) {
    case 'BoxCat Adventures':
      new Window('BoxCat Adventures', createGameWindow(), `
        <svg viewBox="0 0 24 24" width="20" height="20">
          <rect x="2" y="2" width="20" height="20" rx="2" fill="#008000"/>
          <circle cx="12" cy="12" r="5" fill="white"/>
        </svg>
      `);
      break;
    case 'PawPaint Pro':
      new Window('PawPaint Pro', createPaintWindow(), `
        <svg viewBox="0 0 24 24" width="20" height="20">
          <rect x="2" y="2" width="20" height="20" rx="2" fill="#800080"/>
          <path d="M6 18l12-12M6 6l12 12" stroke="white" stroke-width="2"/>
        </svg>
      `);
      break;
    case 'MeowPlayer 2.0':
      new Window('MeowPlayer 2.0', createMusicWindow(), `
        <svg viewBox="0 0 24 24" width="20" height="20">
          <rect x="2" y="2" width="20" height="20" rx="2" fill="#000080"/>
          <path d="M8 8l8 4-8 4z" fill="white"/>
        </svg>
      `);
      break;
    default:
      alert('This application is still installing...');
  }
}

// Add function to run virus files
function runVirusFile(file) {
  switch (file.name) {
    case 'Super Meow Bros':
      createVirusGame();
      break;
      
    // ... (other virus cases remain the same) ...
  }
}

function createVirusGame() {
  const gameWindow = document.createElement('div');
  gameWindow.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: black;
    color: lime;
    font-family: 'Web437_IBM_VGA_8x16', monospace;
    z-index: 10000;
  `;

  const game = document.createElement('div');
  game.style.cssText = `
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;

  let playerPos = 50;
  let score = 0;
  let obstacles = [];
  let gameLoop;
  let gameOver = false;

  game.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h1>Super Meow Bros</h1>
      <p>Score: <span id="score">0</span></p>
      <p>Use Left/Right arrows or A/D keys to move</p>
    </div>
    <div id="gameArea" style="width: 300px; height: 400px; border: 2px solid lime; position: relative; overflow: hidden;">
      <div id="player" style="width: 20px; height: 20px; position: absolute; bottom: 10px; left: ${playerPos}px;">😺</div>
    </div>
  `;

  gameWindow.appendChild(game);
  document.body.appendChild(gameWindow);

  const gameArea = game.querySelector('#gameArea');
  const player = game.querySelector('#player');
  const scoreDisplay = game.querySelector('#score');

  function createObstacle() {
    const obstacle = document.createElement('div');
    obstacle.style.cssText = `
      width: 20px;
      height: 20px;
      position: absolute;
      top: -20px;
      left: ${Math.random() * (gameArea.offsetWidth - 20)}px;
      color: red;
    `;
    obstacle.textContent = '💣';
    obstacle.className = 'obstacle';
    gameArea.appendChild(obstacle);
    obstacles.push(obstacle);
  }

  function moveObstacles() {
    obstacles.forEach((obstacle, index) => {
      const currentTop = parseInt(obstacle.style.top);
      if (currentTop > gameArea.offsetHeight) {
        obstacle.remove();
        obstacles.splice(index, 1);
        score++;
        scoreDisplay.textContent = score;
      } else {
        obstacle.style.top = (currentTop + 2) + 'px';
        
        // Collision detection
        const playerRect = player.getBoundingClientRect();
        const obstacleRect = obstacle.getBoundingClientRect();
        
        if (!(playerRect.right < obstacleRect.left || 
            playerRect.left > obstacleRect.right || 
            playerRect.bottom < obstacleRect.top || 
            playerRect.top > obstacleRect.bottom)) {
          gameOver = true;
          endGame();
        }
      }
    });
  }

  function endGame() {
    clearInterval(gameLoop);
    gameOver = true;
    
    // Create glitch effect
    let glitchPhase = 0;
    const glitchInterval = setInterval(() => {
      if (glitchPhase < 10) {
        game.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
        game.style.filter = `hue-rotate(${Math.random() * 360}deg)`;
        glitchPhase++;
      } else {
        clearInterval(glitchInterval);
        
        // Show virus message
        gameWindow.innerHTML = `
          <div style="padding: 20px; text-align: center;">
            <pre style="color: red;">
GAME OVER - SYSTEM CORRUPTED

M̷̨̛̖͈̲̘͚̲͎̘̣̪̹̖̻̎̆̈́̇͊̈̋̃͘͝E̸̼͈͓̲̖̺̗̹̳͔̗̩̣̿̎̆̀̈́̈́͜Ơ̵̧̨̡̢̺͚͙̠̪̬̯̯̪̎̊̊̈̓͒̄̅̊̈̈́̎͜͝W̶̝͇͚̙̜̦͖̙̼̫̙͉̰̽̽̐͌̿͜-̶̧̡̢̘̬̗̱̪̳̫̬͕̆̉̋͛̕T̷͖̽͗̉̆̓͘R̸̰̞̘̫̳͔̪̟̩̫̤̬̦͌̽͌͌̈́̆̏̈́̽͠Ǫ̶̨̯̲͙͉̠̦̜̗̰͔̦̿͋̀̈́̌̀̀͜J̷̡̰͖̱̱̖̜̤͛̇̈A̷̡̲͇͈͎̜̔͆̄̄̽͊̽̋͐̾̚͝͝ͅN̶͓̺̱̤̜̱̤̪̩̗̮̦̊ͅ-̶̠͎̬͖̲͚̍͋̋̈́͂̒̉͛̈̌̋͝1̶̡̝͕͕̝͚̝̗͓̃̅̂̌͘9̷̗͈̼̻͚̺̝̞̰̜̬̯̗̋̑́̈́̌͝9̸̛̤͍͕̻̩̫̯̬̝͍̯̖̋̄̍͗͊͊̂̈͘̚͜ͅ3̸̨̘͈̱̭̱͔͙͙̱̿͋̆̽͠

YOUR SYSTEM HAS BEEN INFECTED!
</pre>
            <p style="color: lime; margin-top: 20px; font-size: 1.2em;">
              All your files are being corrupted...
              Your high scores have been deleted...
              Your cat pictures are being randomized...
            </p>
            <p style="color: white; margin-top: 20px;">
              The only way to recover is to reset BoxCat OS!
              But the reset button won't work! 
              You're trapped in here forever!
            </p>
            <div class="glitch-text" style="color: red; font-size: 2em; margin-top: 20px;">
              HAVE A NICE DAY! 😺
            </div>
          </div>
        `;

        // Override reset functionality
        window.BoxCatSetup = null;
        localStorage.setItem('boxcat_infected', 'true');
        
        // Create endless glitch popups
        let popupCount = 0;
        const createGlitchPopup = () => {
          if (popupCount < 20) {
            const popup = document.createElement('div');
            popup.style.cssText = `
              position: fixed;
              top: ${Math.random() * 80}vh;
              left: ${Math.random() * 80}vw;
              background: #ff0000;
              color: white;
              padding: 20px;
              border: 2px solid white;
              z-index: ${10001 + popupCount};
              font-family: monospace;
              transform: rotate(${Math.random() * 20 - 10}deg);
            `;
            popup.innerHTML = `
              <h3>SYSTEM ERROR</h3>
              <p>Cannot reset system!</p>
              <p>Virus protection: DISABLED</p>
              <p>Status: CORRUPTED</p>
            `;
            document.body.appendChild(popup);
            popupCount++;
          }
        };
        
        setInterval(createGlitchPopup, 1000);

        // Create glitch audio
        const glitchSound = new Audio('data:audio/wav;base64,UklGRhwPAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YfgOAAD//2cASZJ5rY+EY1MkHRsTAwDu6evs%0A');
        glitchSound.loop = true;
        glitchSound.play();
      }
    }, 100);
  }

  // Game loop
  gameLoop = setInterval(() => {
    if (!gameOver) {
      if (Math.random() < 0.05) createObstacle();
      moveObstacles();
    }
  }, 50);

  // Controls
  document.addEventListener('keydown', function(e) {
    if (gameOver) return;
    
    switch(e.key) {
      case 'ArrowLeft':
      case 'a':
        playerPos = Math.max(0, playerPos - 10);
        player.style.left = playerPos + 'px';
        break;
      case 'ArrowRight':
      case 'd':
        playerPos = Math.min(gameArea.offsetWidth - 20, playerPos + 10);
        player.style.left = playerPos + 'px';
        break;
    }
  });
}

// Add the chat app to the start menu
const menuItems = document.querySelector('.menu-items');
const chatMenuItem = document.createElement('div');
chatMenuItem.className = 'menu-item';
chatMenuItem.dataset.app = 'chat';
chatMenuItem.innerHTML = `
  ${apps.chat.icon}
  BoxChat
`;
menuItems.insertBefore(chatMenuItem, menuItems.children[1]);

// Add Downloads to start menu
const downloadsMenuItem = document.createElement('div');
downloadsMenuItem.className = 'menu-item';
downloadsMenuItem.dataset.app = 'downloads';
downloadsMenuItem.innerHTML = `
  ${apps.downloads.icon}
  Downloads
`;
menuItems.insertBefore(downloadsMenuItem, menuItems.children[2]);

document.querySelectorAll('.menu-item').forEach(item => {
  item.addEventListener('click', () => {
    selectSound.play();
    const appName = item.dataset.app;
    const app = apps[appName];
    new Window(app.title, app.create(), app.icon);
    startMenu.classList.add('hidden');
    startMenuOpen = false;
    startBtn.style.borderTop = '2px solid #fff';
    startBtn.style.borderLeft = '2px solid #fff';
    startBtn.style.borderRight = '2px solid #808080';
    startBtn.style.borderBottom = '2px solid #808080';
  });
});

// Modified download button handler in downloadCATS
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('download-btn')) {
    const itemName = e.target.closest('.download-item').querySelector('h3').textContent;
    const isVirus = e.target.closest('.download-item').classList.contains('virus');
    
    if (isVirus) {
      alert('WARNING: NoVirusCAT detected a threat!');
    }

    // Add to downloads
    const downloads = JSON.parse(localStorage.getItem('boxcat_downloads') || '[]');
    downloads.push({
      id: Date.now().toString(),
      name: itemName,
      size: isVirus ? '50KB' : '1.2MB',
      type: itemName.includes('Player') ? 'media' : 'app',
      virus: isVirus,
      downloadDate: new Date().toISOString()
    });
    localStorage.setItem('boxcat_downloads', JSON.stringify(downloads));
    
    if (!isVirus) {
      alert(`${itemName} has been downloaded successfully!`);
    }
  }
});

function setupResetButton(container) {
  const resetBtn = container.querySelector('.reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const confirmDialog = document.createElement('div');
      confirmDialog.className = 'confirm-dialog';
      confirmDialog.innerHTML = `
        <div class="confirm-content">
          <h3>Warning!</h3>
          <p>Are you sure you want to reset BoxCat OS?</p>
          <p>You will lose all apps you have downloaded.</p>
          <div class="confirm-buttons">
            <button class="setup-button" id="cancelReset">Cancel</button>
            <button class="setup-button" id="confirmReset">Continue</button>
          </div>
        </div>
      `;
      document.body.appendChild(confirmDialog);

      document.getElementById('cancelReset').onclick = () => {
        confirmDialog.remove();
      };

      document.getElementById('confirmReset').onclick = () => {
        confirmDialog.remove();
        startReset();
      };
    });
  }
}

function setupVirusProtection() {
  const checkbox = settingsBody.querySelector('#disableProtection');
  if (checkbox) {
    checkbox.checked = localStorage.getItem('virusProtection') === 'disabled';
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        const confirm = window.confirm(
          "⚠️ EXTREME DANGER ⚠️\n\n" +
          "You are about to disable NoVirusCAT Protection!\n\n" +
          "This will allow potentially dangerous files to run on your system.\n" +
          "Your computer and data may be at risk!\n\n" +
          "Are you absolutely sure you want to continue?"
        );
        if (confirm) {
          localStorage.setItem('virusProtection', 'disabled');
          alert('NoVirusCAT Protection has been disabled. BE CAREFUL!');
        } else {
          checkbox.checked = false;
        }
      } else {
        localStorage.setItem('virusProtection', 'enabled');
        alert('NoVirusCAT Protection has been re-enabled. Stay safe!');
      }
    });
  }
}

function setupWallpaperPreviews(container) {
  const previews = container.querySelectorAll('.wallpaper-preview');
  previews.forEach(preview => {
    preview.addEventListener('click', () => {
      const index = preview.dataset.index;
      const wallpaper = wallpapers[index];
      const desktop = document.querySelector('.desktop');
      desktop.style.background = wallpaper.color || wallpaper.pattern;
      previews.forEach(p => p.classList.remove('active'));
      preview.classList.add('active');
      selectSound.play();
    });
  });
}

function startReset() {
  // Instead of removing config immediately, we'll set a flag
  sessionStorage.setItem('boxcat_in_setup', 'true');
  
  const resetScreen = document.createElement('div');
  resetScreen.className = 'reset-screen';
  resetScreen.innerHTML = `
    <div class="reset-content">
      <h2>BoxCat OS Installation</h2>
      <p>Please insert installation DVD or select download option.</p>
      <div class="reset-buttons">
        <button class="setup-button" id="dvdInstall">Install from DVD</button>
        <button class="setup-button" id="downloadInstall">Download and Install</button>
      </div>
    </div>
  `;
  document.body.appendChild(resetScreen);

  const startInstallation = () => {
    resetScreen.innerHTML = `
      <div class="reset-content">
        <h2>Welcome to BoxCat OS!</h2>
        <p>Preparing your system...</p>
        <div class="loading-container">
          <div class="loading-text">/l\\_/</div>
        </div>
        <p>Please wait, this may take several minutes...</p>
      </div>
    `;

    let loadingPhase = 0;
    const loadingStates = ['/l\\_/', '/l_\\/', '\\l_\\/', '\\l\\_\\'];
    const loadingInterval = setInterval(() => {
      const loadingText = resetScreen.querySelector('.loading-text');
      loadingText.textContent = loadingStates[loadingPhase];
      loadingPhase = (loadingPhase + 1) % loadingStates.length;
    }, 200);

    // After showing the installation screen, remove the old config and start setup
    setTimeout(() => {
      clearInterval(loadingInterval);
      localStorage.removeItem('boxcat_config'); // Now we remove the config
      resetScreen.remove();
      BoxCatSetup.start();
    }, 5000);
  };

  document.getElementById('dvdInstall').onclick = startInstallation;
  document.getElementById('downloadInstall').onclick = startInstallation;
}