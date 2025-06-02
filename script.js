// Game state variables
let power = 100;
let security = 0;
let connectionStrength = 100;
let gameOver = false;
let gameStartTime = null;
let taskQueue = [];
let commandHistory = [];
let historyIndex = -1;
let terminalLines = [];
let difficultyMultiplier = 1;
let soundEnabled = true;
let objectives = [
    { id: "obj1", text: "Infiltrate main server", completed: false, systemId: 6 },
    { id: "obj2", text: "Extract encryption keys", completed: false, systemId: 4 },
    { id: "obj3", text: "Download financial data", completed: false, systemId: 2 },
    { id: "obj4", text: "Erase access logs", completed: false, systemId: 3 },
    { id: "obj5", text: "Exit without detection", completed: false, requires: ["obj1", "obj2", "obj3", "obj4"] }
];
let systems = [
    { name: "Firewall", status: "Protected", difficulty: 1 },
    { name: "Authentication Server", status: "Protected", difficulty: 2 },
    { name: "User Database", status: "Protected", difficulty: 2 },
    { name: "File System", status: "Protected", difficulty: 3 },
    { name: "Encryption Keys", status: "Protected", difficulty: 3 },
    { name: "Admin Server", status: "Protected", difficulty: 4 },
    { name: "Main Frame", status: "Protected", difficulty: 5 }
];

// Sound effects
const notificationSound = new Audio('notification.wav');
const hackingSound = new Audio('hacking.wav');

// DOM Elements
const outputElement = document.getElementById('output');
const commandInput = document.getElementById('commandInput');
const powerBar = document.getElementById('powerBar');
const powerValue = document.getElementById('powerValue');
const securityBar = document.getElementById('securityBar');
const securityValue = document.getElementById('securityValue');
const connectionBar = document.getElementById('connectionBar');
const connectionValue = document.getElementById('connectionValue');
const notification = document.getElementById('notification');
const notificationContent = document.querySelector('.notification-content');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalBtn = document.getElementById('modal-btn');
const modalSecondaryBtn = document.getElementById('modal-secondary-btn');
const modalClose = document.querySelector('.modal-close');
const loadingScreen = document.getElementById('loading-screen');
const missionTimer = document.getElementById('mission-timer');
const targetsList = document.getElementById('targets-list');
const objectivesList = document.getElementById('objectives-list');
const connectionStatus = document.getElementById('connection-status');
const networkMap = document.getElementById('network-map');

// Control button elements
const scanBtn = document.getElementById('scan');
const hackBtn = document.getElementById('hack');
const decryptBtn = document.getElementById('decrypt');
const downloadBtn = document.getElementById('download');
const obfuscateBtn = document.getElementById('obfuscate');
const boostBtn = document.getElementById('boost');
const backdoorBtn = document.getElementById('backdoor');
const analyzeBtn = document.getElementById('analyze');

// Settings elements
const soundToggle = document.getElementById('sound-toggle');
const difficultySelect = document.getElementById('difficulty');
const themeSelect = document.getElementById('theme');

// Initialize the game
function initGame() {
    // Show loading screen for 3.5 seconds
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            // Focus the command input
            commandInput.focus();
        }, 500);
    }, 3500);

    // Initialize particle.js
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: '#0fe4cb' },
            shape: { type: 'triangle', stroke: { width: 0, color: '#000000' } },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: '#0fe4cb', opacity: 0.4, width: 1 },
            move: { enable: true, speed: 2, direction: 'none', random: true, straight: false, out_mode: 'out' }
        },
        interactivity: {
            detect_on: 'canvas',
            events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true },
            modes: {
                grab: { distance: 140, line_linked: { opacity: 1 } },
                bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 },
                repulse: { distance: 200, duration: 0.4 },
                push: { particles_nb: 4 },
                remove: { particles_nb: 2 }
            }
        },
        retina_detect: true
    });

    // Preload sounds
    notificationSound.load();
    hackingSound.load();

    // Initialize mission timer
    gameStartTime = Date.now();
    updateTimer();

    // Initialize the network map
    initNetworkMap();

    // Initialize target systems list
    updateTargetsList();

    // Initialize objectives list
    updateObjectivesList();

    // Display intro message
    displayIntro();

    // Set up event listeners
    commandInput.addEventListener('keydown', handleCommandInput);
    scanBtn.addEventListener('click', () => executeCommand('scan'));
    hackBtn.addEventListener('click', () => executeCommand('hack'));
    decryptBtn.addEventListener('click', () => executeCommand('decrypt'));
    downloadBtn.addEventListener('click', () => executeCommand('download'));
    obfuscateBtn.addEventListener('click', () => executeCommand('obfuscate'));
    boostBtn.addEventListener('click', () => executeCommand('boost'));
    backdoorBtn.addEventListener('click', () => executeCommand('backdoor'));
    analyzeBtn.addEventListener('click', () => executeCommand('analyze'));
    modalClose.addEventListener('click', closeModal);
    modalBtn.addEventListener('click', closeModal);
    modalSecondaryBtn.addEventListener('click', closeModal);

    // Settings event listeners
    soundToggle.addEventListener('change', toggleSound);
    difficultySelect.addEventListener('change', changeDifficulty);
    themeSelect.addEventListener('change', changeTheme);

    // Add visual effects to buttons
    addButtonEffects();

    // Update stat displays
    updateStats();

    // Add click-to-focus functionality to the terminal
    document.querySelector('.terminal').addEventListener('click', () => {
        commandInput.focus();
    });

    // Set interval for timer updates
    setInterval(updateTimer, 1000);

    // Set interval for random connection strength fluctuations
    setInterval(updateConnectionStrength, 5000);
}

// Add hover and click effects to buttons
function addButtonEffects() {
    const buttons = document.querySelectorAll('.control-btn, .tool-btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
        });
        button.addEventListener('mousedown', () => {
            button.style.transform = 'translateY(1px)';
        });
        button.addEventListener('mouseup', () => {
            button.style.transform = 'translateY(-2px)';
        });
    });
}

// Display intro message
function displayIntro() {
    const introLines = [
        { text: "INITIALIZING SYSTEM...", delay: 500, class: "highlight-text" },
        { text: "ESTABLISHING SECURE CONNECTION...", delay: 1000, class: "highlight-text" },
        { text: "CONNECTION ESTABLISHED.", delay: 800, class: "success-text" },
        { text: "WELCOME TO CYBER INFILTRATION SIMULATOR v3.7.2", delay: 1200, class: "highlight-text" },
        { text: "-----------------------------------------------------", delay: 300, class: "" },
        { text: "This terminal provides access to various cybersecurity operations.", delay: 800, class: "" },
        { text: "Your mission: Infiltrate the target system and extract sensitive data.", delay: 800, class: "" },
        { text: "Be careful: Each operation consumes POWER and may increase SECURITY BREACH levels.", delay: 800, class: "warning-text" },
        { text: "If power reaches 0% or security breach reaches a critical level, you will be detected.", delay: 800, class: "error-text" },
        { text: "-----------------------------------------------------", delay: 300, class: "" },
        { text: "Type 'help' for a list of available commands.", delay: 500, class: "highlight-text" },
        { text: "", delay: 300, class: "" }
    ];

    displayLinesSequentially(introLines, 0);
}

// Display lines sequentially with a typing effect
function displayLinesSequentially(lines, index) {
    if (index >= lines.length) return;

    const line = lines[index];
    addLine(line.text, line.class);

    setTimeout(() => {
        displayLinesSequentially(lines, index + 1);
    }, line.delay);
}

// Add a line to the terminal output
function addLine(text, className = '') {
    const line = document.createElement('div');
    line.className = className;
    line.textContent = text;
    outputElement.appendChild(line);
    terminalLines.push({ element: line, text: text, class: className });
    outputElement.scrollTop = outputElement.scrollHeight;
}

// Handle command input
function handleCommandInput(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const command = commandInput.value.trim().toLowerCase();
        if (command) {
            commandHistory.push(command);
            historyIndex = commandHistory.length;
            addLine(`root@infiltrator:~$ ${command}`);
            executeCommand(command);
            commandInput.value = '';
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            commandInput.value = commandHistory[historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            commandInput.value = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            commandInput.value = '';
        }
    } else if (e.key === 'Tab') {
        e.preventDefault();
        autocompleteCommand();
    }
}

// Autocomplete command
function autocompleteCommand() {
    const input = commandInput.value.trim().toLowerCase();
    if (!input) return;

    const commands = ['help', 'scan', 'hack', 'infiltrate', 'decrypt', 'download', 'extract', 'status', 'clear', 'reset', 'obfuscate', 'boost', 'backdoor', 'analyze'];

    for (const cmd of commands) {
        if (cmd.startsWith(input)) {
            commandInput.value = cmd;
            break;
        }
    }
}

// Execute a command
function executeCommand(command) {
    if (gameOver) {
        showNotification("System compromised. Restart required.", "error");
        return;
    }

    const args = command.split(' ');
    const cmd = args[0];

    switch (cmd) {
        case 'help':
            showHelp();
            break;
        case 'scan':
            scanSystem();
            break;
        case 'hack':
        case 'infiltrate':
            hackSystem(args[1]);
            break;
        case 'decrypt':
            decryptData(args[1]);
            break;
        case 'download':
        case 'extract':
            downloadData(args[1]);
            break;
        case 'status':
            showStatus();
            break;
        case 'clear':
            clearTerminal();
            break;
        case 'reset':
            resetGame();
            break;
        case 'obfuscate':
            obfuscateConnection();
            break;
        case 'boost':
            boostPower();
            break;
        case 'backdoor':
            installBackdoor();
            break;
        case 'analyze':
            analyzeSystem();
            break;
        default:
            addLine(`Command not recognized: ${cmd}`, 'error-text');
            addLine("Type 'help' for available commands.", 'highlight-text');
    }
}

// Display help information
function showHelp() {
    const helpLines = [
        { text: "AVAILABLE COMMANDS:", delay: 300, class: "highlight-text" },
        { text: "-----------------------------------------------------", delay: 100, class: "" },
        { text: "scan         - Scan for vulnerabilities in the system", delay: 300, class: "" },
        { text: "hack [id]    - Attempt to infiltrate a specific system component", delay: 300, class: "" },
        { text: "decrypt [id] - Attempt to decrypt secured data", delay: 300, class: "" },
        { text: "download [id] - Extract data from a compromised system", delay: 300, class: "" },
        { text: "status       - Display current mission status", delay: 300, class: "" },
        { text: "clear        - Clear terminal output", delay: 300, class: "" },
        { text: "reset        - Reset the simulation", delay: 300, class: "" },
        { text: "help         - Display this help information", delay: 300, class: "" },
        { text: "-----------------------------------------------------", delay: 100, class: "" },
        { text: "ADVANCED COMMANDS:", delay: 300, class: "highlight-text" },
        { text: "-----------------------------------------------------", delay: 100, class: "" },
        { text: "obfuscate    - Hide your tracks by obfuscating connection", delay: 300, class: "" },
        { text: "boost        - Temporarily boost processing power", delay: 300, class: "" },
        { text: "backdoor     - Plant a backdoor for future access", delay: 300, class: "" },
        { text: "analyze      - Analyze security patterns", delay: 300, class: "" },
        { text: "-----------------------------------------------------", delay: 100, class: "" }
    ];

    displayLinesSequentially(helpLines, 0);
}

// Scan the system
function scanSystem() {
    // Power cost: 5 * difficulty
    const powerCost = 5 * difficultyMultiplier;
    if (!checkPower(powerCost)) return;

    consumePower(powerCost);
    updateStats();
    showNotification("Scanning system for vulnerabilities...", "info");

    addLine("Scanning system for vulnerabilities...", "highlight-text");
    addLine("-----------------------------------------------------", "");

    setTimeout(() => {
        let found = false;
        for (let i = 0; i < systems.length; i++) {
            const system = systems[i];
            if (system.status === "Protected") {
                addLine(`[${i}] ${system.name} - ${system.status} (Difficulty: ${"*".repeat(system.difficulty)})`); 
                found = true;
            } else if (system.status === "Infiltrated") {
                addLine(`[${i}] ${system.name} - ${system.status} (Ready for data extraction)`, "success-text");
                found = true;
            } else if (system.status === "Extracted") {
                addLine(`[${i}] ${system.name} - ${system.status} (Data already extracted)`, "warning-text");
                found = true;
            }
        }

        if (!found) {
            addLine("No systems detected. Network may be offline.", "error-text");
        }

        addLine("-----------------------------------------------------", "");
        addLine("Scan complete. Use 'hack [id]' to infiltrate a specific system.", "highlight-text");

        // Decrease connection strength slightly after scan
        updateConnectionStrength(-5);
    }, 1500);
}

// Hack a specific system
function hackSystem(id) {
    if (id === undefined) {
        addLine("Error: No target specified. Usage: hack [id]", "error-text");
        return;
    }

    const systemId = parseInt(id);
    if (isNaN(systemId) || systemId < 0 || systemId >= systems.length) {
        addLine(`Error: Invalid system ID '${id}'`, "error-text");
        return;
    }

    const system = systems[systemId];

    if (system.status === "Extracted") {
        addLine(`${system.name} has already been fully compromised.`, "warning-text");
        return;
    }

    if (system.status === "Infiltrated") {
        addLine(`${system.name} is already infiltrated. Use 'download ${systemId}' to extract data.`, "warning-text");
        return;
    }

    // Power cost: 10 * difficulty * difficultyMultiplier
    const powerCost = 10 * system.difficulty * difficultyMultiplier;
    if (!checkPower(powerCost)) return;

    consumePower(powerCost);
    updateStats();

    addLine(`Attempting to infiltrate ${system.name}...`, "highlight-text");
    showNotification(`Infiltrating ${system.name}...`, "info");

    // Play hacking sound
    playSound(hackingSound);

    // Security risk: 5 * difficulty * difficultyMultiplier
    const securityRisk = 5 * system.difficulty * difficultyMultiplier;

    // Simulate the hack with a mini-game
    showHackingGame(systemId, system, securityRisk);
}

// Show a hacking mini-game
function showHackingGame(systemId, system, securityRisk) {
    // Higher difficulty = lower success chance
    const difficultyFactor = system.difficulty * 0.1 * difficultyMultiplier;
    const hackSuccess = Math.random() < (0.9 - difficultyFactor);

    modalTitle.textContent = `INFILTRATING: ${system.name}`;
    modalSecondaryBtn.style.display = "none";

    let progressText = "";
    for (let i = 0; i < 5; i++) {
        progressText += `<div class="hack-progress-step" id="hack-step-${i}">[ ] ${getRandomHackingStep()}</div>`;
    }

    modalBody.innerHTML = `
        <div class="hack-progress">
            ${progressText}
        </div>
        <div class="hack-result" id="hack-result"></div>
    `;

    modal.style.display = "block";
    modalBtn.style.display = "none";

    const steps = document.querySelectorAll('.hack-progress-step');
    const resultDiv = document.getElementById('hack-result');

    // Animate the hacking steps
    let currentStep = 0;
    const interval = setInterval(() => {
        if (currentStep < steps.length) {
            steps[currentStep].innerHTML = steps[currentStep].innerHTML.replace('[ ]', '[<span class="success-text">✓</span>]');
            currentStep++;

            // Update network map with activity
            if (hackSuccess) {
                highlightNetworkNode(systemId);
            }
        } else {
            clearInterval(interval);

            setTimeout(() => {
                if (hackSuccess) {
                    resultDiv.innerHTML = `<span class="success-text">SUCCESS: ${system.name} has been infiltrated!</span>`;
                    modalBtn.textContent = "CONTINUE";
                    modalBtn.style.display = "block";

                    // Update system status
                    systems[systemId].status = "Infiltrated";
                    addLine(`Successfully infiltrated ${system.name}!`, "success-text");
                    addLine(`Use 'download ${systemId}' to extract data.`, "highlight-text");

                    // Add security risk
                    updateSecurity(securityRisk);
                    updateConnectionStrength(-10);
                    showNotification(`${system.name} successfully infiltrated!`, "success");

                    // Update targets list and network map
                    updateTargetsList();
                    updateNetworkMap();

                    // Check if Main Frame was infiltrated for objective completion
                    if (systemId === 6) { // Main Frame
                        completeObjective("obj1");
                    }
                } else {
                    resultDiv.innerHTML = `<span class="error-text">FAILED: Unable to breach ${system.name}!</span>`;
                    modalBtn.textContent = "RETRY";
                    modalBtn.style.display = "block";

                    addLine(`Failed to infiltrate ${system.name}.`, "error-text");

                    // Add higher security risk for failure
                    updateSecurity(securityRisk * 1.5);
                    updateConnectionStrength(-15);
                    showNotification(`Failed to infiltrate ${system.name}!`, "error");
                }
            }, 800);
        }
    }, 600);
}

// Decrypt data
function decryptData(id) {
    if (id === undefined) {
        addLine("Error: No target specified. Usage: decrypt [id]", "error-text");
        return;
    }

    const systemId = parseInt(id);
    if (isNaN(systemId) || systemId < 0 || systemId >= systems.length) {
        addLine(`Error: Invalid system ID '${id}'`, "error-text");
        return;
    }

    const system = systems[systemId];

    if (system.status === "Protected") {
        addLine(`${system.name} must be infiltrated first. Use 'hack ${systemId}' to infiltrate.`, "warning-text");
        return;
    }

    if (system.status === "Extracted") {
        addLine(`${system.name} data has already been extracted.`, "warning-text");
        return;
    }

    // Power cost: 8 * difficulty * difficultyMultiplier
    const powerCost = 8 * system.difficulty * difficultyMultiplier;
    if (!checkPower(powerCost)) return;

    consumePower(powerCost);
    updateStats();

    addLine(`Decrypting ${system.name} data...`, "highlight-text");
    showNotification(`Decrypting ${system.name} data...`, "info");

    // Play hacking sound
    playSound(hackingSound);

    // Show decryption animation
    showDecryptionAnimation(systemId, system);
}

// Show a decryption animation
function showDecryptionAnimation(systemId, system) {
    modalTitle.textContent = `DECRYPTING: ${system.name}`;
    modalSecondaryBtn.style.display = "none";

    modalBody.innerHTML = `
        <div class="decrypt-container">
            <div class="decrypt-text" id="decrypt-text"></div>
            <div class="decrypt-progress" id="decrypt-progress">0%</div>
        </div>
    `;

    modal.style.display = "block";
    modalBtn.style.display = "none";

    const decryptText = document.getElementById('decrypt-text');
    const decryptProgress = document.getElementById('decrypt-progress');

    // Generate encrypted text
    let encryptedText = "";
    for (let i = 0; i < 200; i++) {
        encryptedText += getRandomChar();
    }

    decryptText.textContent = encryptedText;

    // Animate decryption
    let progress = 0;
    const decryptionData = generateDecryptionData();

    const interval = setInterval(() => {
        progress += 1;
        decryptProgress.textContent = `${progress}%`;

        if (progress >= 100) {
            clearInterval(interval);
            decryptText.innerHTML = `<span class="success-text">DECRYPTION COMPLETE!</span><br><pre>${JSON.stringify(decryptionData, null, 2)}</pre>`;
            modalBtn.textContent = "CONTINUE";
            modalBtn.style.display = "block";

            addLine(`Successfully decrypted ${system.name} data.`, "success-text");
            addLine(`Use 'download ${systemId}' to extract the decrypted data.`, "highlight-text");

            // If Encryption Keys are decrypted, complete that objective
            if (systemId === 4) { // Encryption Keys
                completeObjective("obj2");
            }

            // If File System is decrypted, complete the "erase access logs" objective
            if (systemId === 3) { // File System
                completeObjective("obj4");
            }

            updateConnectionStrength(-5);
            showNotification(`${system.name} data successfully decrypted!`, "success");
        }
    }, 50);
}

// Download/extract data
function downloadData(id) {
    if (id === undefined) {
        addLine("Error: No target specified. Usage: download [id]", "error-text");
        return;
    }

    const systemId = parseInt(id);
    if (isNaN(systemId) || systemId < 0 || systemId >= systems.length) {
        addLine(`Error: Invalid system ID '${id}'`, "error-text");
        return;
    }

    const system = systems[systemId];

    if (system.status === "Protected") {
        addLine(`${system.name} must be infiltrated first. Use 'hack ${systemId}' to infiltrate.`, "warning-text");
        return;
    }

    if (system.status === "Extracted") {
        addLine(`${system.name} data has already been extracted.`, "warning-text");
        return;
    }

    // Power cost: 7 * difficulty * difficultyMultiplier
    const powerCost = 7 * system.difficulty * difficultyMultiplier;
    if (!checkPower(powerCost)) return;

    consumePower(powerCost);
    updateSecurity(4 * system.difficulty * difficultyMultiplier); // High security risk
    updateStats();

    addLine(`Extracting data from ${system.name}...`, "highlight-text");
    showNotification(`Extracting data from ${system.name}...`, "info");

    // Play hacking sound
    playSound(hackingSound);

    // Show download animation
    showDownloadAnimation(systemId, system);
}

// Show download animation
function showDownloadAnimation(systemId, system) {
    modalTitle.textContent = `EXTRACTING DATA: ${system.name}`;
    modalSecondaryBtn.style.display = "none";

    modalBody.innerHTML = `
        <div class="download-container">
            <div class="download-progress-container">
                <div class="download-progress" id="download-progress"></div>
            </div>
            <div class="download-status" id="download-status">Initializing data transfer...</div>
        </div>
    `;

    modal.style.display = "block";
    modalBtn.style.display = "none";

    const downloadProgress = document.getElementById('download-progress');
    const downloadStatus = document.getElementById('download-status');

    // Animate download
    let progress = 0;
    const downloadSpeed = Math.floor(Math.random() * 5) + 1; // Random speed between 1-5
    const fileSize = system.difficulty * 50; // File size based on difficulty

    const interval = setInterval(() => {
        progress += downloadSpeed;
        const percentage = Math.min(100, Math.floor((progress / fileSize) * 100));
        downloadProgress.style.width = `${percentage}%`;

        downloadStatus.textContent = `Downloading: ${progress}MB of ${fileSize}MB (${percentage}%)`;

        if (progress >= fileSize) {
            clearInterval(interval);
            downloadStatus.innerHTML = `<span class="success-text">DOWNLOAD COMPLETE!</span>`;
            modalBtn.textContent = "CONTINUE";
            modalBtn.style.display = "block";

            // Update system status
            systems[systemId].status = "Extracted";
            addLine(`Successfully extracted data from ${system.name}!`, "success-text");

            // Update connection strength
            updateConnectionStrength(-15);

            // Update targets list and network map
            updateTargetsList();
            updateNetworkMap();

            // If User Database is extracted, complete that objective
            if (systemId === 2) { // User Database
                completeObjective("obj3");
            }

            // Check if all required objectives are completed to complete the final objective
            checkFinalObjective();

            // Check if all systems are extracted
            checkGameCompletion();

            showNotification(`${system.name} data successfully extracted!`, "success");
        }
    }, 200);
}

// Obfuscate connection
function obfuscateConnection() {
    const powerCost = 15 * difficultyMultiplier;
    if (!checkPower(powerCost)) return;

    consumePower(powerCost);
    updateStats();

    addLine("Activating connection obfuscation protocols...", "highlight-text");
    showNotification("Obfuscating connection signature...", "info");

    playSound(hackingSound);

    // Decrease security level
    const securityReduction = Math.min(security, 20);

    setTimeout(() => {
        updateSecurity(-securityReduction);
        updateStats();
        addLine(`Successfully reduced security detection level by ${securityReduction}%.`, "success-text");
        showNotification("Connection signature successfully masked!", "success");
    }, 2000);
}

// Boost power
function boostPower() {
    if (power >= 95) {
        addLine("Power levels already near maximum capacity.", "warning-text");
        return;
    }

    const securityCost = 15 * difficultyMultiplier;

    if (security + securityCost > 100) {
        addLine("Warning: Boosting power would exceed critical security levels.", "error-text");
        return;
    }

    addLine("Initiating power subsystem override...", "highlight-text");
    showNotification("Boosting power levels...", "info");

    playSound(hackingSound);

    // Increase security but also increase power
    const powerBoost = 20;

    setTimeout(() => {
        power = Math.min(100, power + powerBoost);
        updateSecurity(securityCost);
        updateStats();
        addLine(`Successfully boosted power levels by ${powerBoost}%.`, "success-text");
        addLine(`Warning: Security breach level increased by ${securityCost}%.`, "warning-text");
        showNotification("Power boost successful!", "success");
    }, 2000);
}

// Install backdoor
function installBackdoor() {
    const powerCost = 20 * difficultyMultiplier;
    if (!checkPower(powerCost)) return;

    consumePower(powerCost);
    updateStats();

    addLine("Attempting to install system backdoor...", "highlight-text");
    showNotification("Installing backdoor...", "info");

    playSound(hackingSound);

    // Random chance of success based on security level
    const successChance = 0.8 - (security / 200); // Higher security = lower chance
    const success = Math.random() < successChance;

    setTimeout(() => {
        if (success) {
            // Find a protected system to infiltrate
            const protectedSystems = systems.filter(system => system.status === "Protected");

            if (protectedSystems.length > 0) {
                const randomSystem = protectedSystems[Math.floor(Math.random() * protectedSystems.length)];
                const systemIndex = systems.findIndex(s => s.name === randomSystem.name);

                if (systemIndex !== -1) {
                    systems[systemIndex].status = "Infiltrated";
                    updateTargetsList();
                    updateNetworkMap();

                    addLine(`Backdoor installed! ${randomSystem.name} has been infiltrated.`, "success-text");
                    showNotification(`Backdoor successful: ${randomSystem.name} infiltrated!`, "success");

                    // Check if this completes any objectives
                    if (systemIndex === 6) { // Main Frame
                        completeObjective("obj1");
                    }

                    return;
                }
            }

            // If no protected systems or something went wrong
            addLine("Backdoor installed, but all systems are already compromised.", "warning-text");
            showNotification("Backdoor installed, no new access gained.", "warning");
        } else {
            updateSecurity(15 * difficultyMultiplier);
            updateStats();
            addLine("Failed to install backdoor. Security systems alerted!", "error-text");
            showNotification("Backdoor installation failed!", "error");
        }
    }, 3000);
}

// Analyze system
function analyzeSystem() {
    const powerCost = 8 * difficultyMultiplier;
    if (!checkPower(powerCost)) return;

    consumePower(powerCost);
    updateStats();

    addLine("Analyzing security protocols and system architecture...", "highlight-text");
    showNotification("Analyzing system...", "info");

    playSound(hackingSound);

    setTimeout(() => {
        // Temporarily reduce difficulty for future operations
        difficultyMultiplier = Math.max(0.5, difficultyMultiplier - 0.2);

        addLine("Analysis complete. Security weaknesses identified.", "success-text");
        addLine("All operations will be more efficient for a limited time.", "highlight-text");
        showNotification("Security analysis complete!", "success");

        // Reset difficulty after 60 seconds
        setTimeout(() => {
            difficultyMultiplier = parseFloat(difficultySelect.value);
            addLine("Security systems have adapted. Efficiency bonus expired.", "warning-text");
        }, 60000);
    }, 2500);
}

// Update mission timer
function updateTimer() {
    if (!gameStartTime || gameOver) return;

    const currentTime = Date.now();
    const elapsedTime = currentTime - gameStartTime;

    const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
    const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);

    missionTimer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Update targets list
function updateTargetsList() {
    targetsList.innerHTML = '';

    systems.forEach((system, index) => {
        const targetItem = document.createElement('div');
        targetItem.className = `target-item ${system.status.toLowerCase()}`;
        targetItem.dataset.id = index;

        const systemName = document.createElement('span');
        systemName.textContent = system.name;

        const statusBadge = document.createElement('span');
        statusBadge.className = `target-status status-${system.status.toLowerCase()}`;
        statusBadge.textContent = system.status;

        targetItem.appendChild(systemName);
        targetItem.appendChild(statusBadge);

        targetItem.addEventListener('click', () => {
            if (system.status === "Protected") {
                executeCommand(`hack ${index}`);
            } else if (system.status === "Infiltrated") {
                executeCommand(`download ${index}`);
            }
        });

        targetsList.appendChild(targetItem);
    });
}

// Update objectives list
function updateObjectivesList() {
    objectivesList.innerHTML = '';

    objectives.forEach((objective) => {
        const objectiveItem = document.createElement('li');
        objectiveItem.className = `objective ${objective.completed ? 'completed' : ''}`;
        objectiveItem.dataset.id = objective.id;
        objectiveItem.textContent = objective.text;

        objectivesList.appendChild(objectiveItem);
    });
}

// Complete an objective
function completeObjective(objectiveId) {
    const objective = objectives.find(obj => obj.id === objectiveId);
    if (objective && !objective.completed) {
        objective.completed = true;
        updateObjectivesList();
        showNotification(`Objective completed: ${objective.text}`, "success");
    }
}

// Check if final objective should be completed
function checkFinalObjective() {
    const finalObjective = objectives.find(obj => obj.id === "obj5");

    if (finalObjective && !finalObjective.completed) {
        // Check if all required objectives are completed
        const allRequiredCompleted = finalObjective.requires.every(reqId => {
            const reqObj = objectives.find(obj => obj.id === reqId);
            return reqObj && reqObj.completed;
        });

        if (allRequiredCompleted) {
            completeObjective("obj5");
        }
    }
}

// Initialize network map
function initNetworkMap() {
    const width = networkMap.clientWidth;
    const height = networkMap.clientHeight;

    // Clear any existing SVG
    while (networkMap.firstChild) {
        networkMap.removeChild(networkMap.firstChild);
    }

    // Create SVG
    const svg = d3.select(networkMap)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Create nodes data
    const nodes = systems.map((system, i) => ({
        id: i,
        name: system.name,
        status: system.status,
        difficulty: system.difficulty
    }));

    // Create links data - connect systems in a network
    const links = [];

    // Connect each node to some others
    nodes.forEach((node, i) => {
        const numLinks = Math.floor(Math.random() * 2) + 1; // 1-2 links per node

        for (let j = 0; j < numLinks; j++) {
            let targetIdx;
            do {
                targetIdx = Math.floor(Math.random() * nodes.length);
            } while (targetIdx === i || links.some(link => 
                (link.source === i && link.target === targetIdx) || 
                (link.source === targetIdx && link.target === i)
            ));

            links.push({ source: i, target: targetIdx });
        }
    });

    // Create the force simulation
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(70))
        .force("charge", d3.forceManyBody().strength(-120))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(20));

    // Create links
    const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("class", "link");

    // Create nodes
    const node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("class", d => `node ${d.status.toLowerCase()}`)
        .attr("r", d => 5 + d.difficulty)
        .attr("id", d => `node-${d.id}`)
        .on("mouseover", (event, d) => {
            const tooltip = svg.append("text")
                .attr("class", "node-tooltip")
                .attr("x", d.x + 15)
                .attr("y", d.y - 10)
                .text(`${d.name} (${d.status})`);

            const bbox = tooltip.node().getBBox();

            svg.insert("rect", ".node-tooltip")
                .attr("class", "tooltip-bg")
                .attr("x", bbox.x - 5)
                .attr("y", bbox.y - 5)
                .attr("width", bbox.width + 10)
                .attr("height", bbox.height + 10)
                .attr("rx", 5)
                .attr("ry", 5);
        })
        .on("mouseout", () => {
            svg.selectAll(".node-tooltip, .tooltip-bg").remove();
        })
        .on("click", (event, d) => {
            if (d.status === "Protected") {
                executeCommand(`hack ${d.id}`);
            } else if (d.status === "Infiltrated") {
                executeCommand(`download ${d.id}`);
            }
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // Add node labels
    const nodeLabels = svg.append("g")
        .selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .attr("class", "node-label")
        .attr("dy", -10)
        .text(d => d.id);

    // Update positions on simulation tick
    simulation.on("tick", () => {
        link
            .attr("x1", d => Math.max(10, Math.min(width - 10, d.source.x)))
            .attr("y1", d => Math.max(10, Math.min(height - 10, d.source.y)))
            .attr("x2", d => Math.max(10, Math.min(width - 10, d.target.x)))
            .attr("y2", d => Math.max(10, Math.min(height - 10, d.target.y)));

        node
            .attr("cx", d => Math.max(10, Math.min(width - 10, d.x)))
            .attr("cy", d => Math.max(10, Math.min(height - 10, d.y)));

        nodeLabels
            .attr("x", d => Math.max(10, Math.min(width - 10, d.x)))
            .attr("y", d => Math.max(10, Math.min(height - 10, d.y)));
    });

    // Drag functions
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

// Update network map based on system statuses
function updateNetworkMap() {
    systems.forEach((system, i) => {
        const node = document.getElementById(`node-${i}`);
        if (node) {
            node.classList.remove("protected", "infiltrated", "extracted");
            node.classList.add(system.status.toLowerCase());
        }
    });
}

// Highlight a node in the network map
function highlightNetworkNode(nodeId) {
    const node = document.getElementById(`node-${nodeId}`);
    if (node) {
        node.classList.add("pulse");
        setTimeout(() => {
            node.classList.remove("pulse");
        }, 2000);
    }
}

// Check if all systems have been extracted
function checkGameCompletion() {
    const allExtracted = systems.every(system => system.status === "Extracted");
    const allObjectivesCompleted = objectives.every(obj => obj.completed);

    if (allExtracted || allObjectivesCompleted) {
        setTimeout(() => {
            showGameCompleteModal();
        }, 1500);
    }
}

// Show game completion modal
function showGameCompleteModal() {
    modalTitle.textContent = "MISSION COMPLETE";
    modalSecondaryBtn.style.display = "none";

    // Calculate score based on time, power remaining, and security level
    const elapsedTime = Date.now() - gameStartTime;
    const elapsedMinutes = Math.floor(elapsedTime / (1000 * 60));
    const timeScore = Math.max(0, 100 - elapsedMinutes * 5);

    const powerScore = power;
    const securityScore = Math.max(0, 100 - security);

    const totalScore = Math.floor((timeScore + powerScore + securityScore) / 3);

    modalBody.innerHTML = `
        <div class="completion-message">
            <p class="success-text">Congratulations! Mission successfully completed.</p>
            <div class="score-breakdown">
                <div class="score-item">
                    <span>Time Score:</span>
                    <span>${timeScore}</span>
                </div>
                <div class="score-item">
                    <span>Power Efficiency:</span>
                    <span>${powerScore}</span>
                </div>
                <div class="score-item">
                    <span>Stealth Rating:</span>
                    <span>${securityScore}</span>
                </div>
                <div class="score-total">
                    <span>FINAL SCORE:</span>
                    <span class="highlight-text">${totalScore}</span>
                </div>
            </div>
            <p>Your skills as a cyber infiltration specialist are impressive!</p>
        </div>
    `;

    modal.style.display = "block";
    modalBtn.textContent = "NEW MISSION";
    modalBtn.onclick = resetGame;

    addLine("-----------------------------------------------------", "");
    addLine("MISSION COMPLETE! All objectives accomplished.", "success-text");
    addLine("Extracted data has been securely transmitted to your command center.", "highlight-text");
    addLine("Type 'reset' to start a new mission.", "highlight-text");
    addLine("-----------------------------------------------------", "");

    showNotification("Mission complete! Objectives accomplished.", "success");

    gameOver = true;
}

// Show system status
function showStatus() {
    addLine("CURRENT MISSION STATUS:", "highlight-text");
    addLine("-----------------------------------------------------", "");
    addLine(`Power: ${power}%`, power < 30 ? "error-text" : (power < 50 ? "warning-text" : ""));
    addLine(`Security Breach: ${security}%`, security > 70 ? "error-text" : (security > 50 ? "warning-text" : ""));
    addLine(`Connection Strength: ${connectionStrength}%`, connectionStrength < 30 ? "error-text" : (connectionStrength < 50 ? "warning-text" : ""));

    let protectedCount = 0;
    let infiltratedCount = 0;
    let extractedCount = 0;

    systems.forEach(system => {
        if (system.status === "Protected") protectedCount++;
        if (system.status === "Infiltrated") infiltratedCount++;
        if (system.status === "Extracted") extractedCount++;
    });

    addLine(`Systems protected: ${protectedCount}`, protectedCount > 0 ? "warning-text" : "");
    addLine(`Systems infiltrated: ${infiltratedCount}`, infiltratedCount > 0 ? "highlight-text" : "");
    addLine(`Systems extracted: ${extractedCount}`, extractedCount > 0 ? "success-text" : "");

    // Show objectives status
    addLine("-----------------------------------------------------", "");
    addLine("MISSION OBJECTIVES:", "highlight-text");

    objectives.forEach(objective => {
        addLine(`[${objective.completed ? '✓' : ' '}] ${objective.text}`, 
                objective.completed ? "success-text" : "");
    });

    addLine("-----------------------------------------------------", "");
}

// Clear the terminal
function clearTerminal() {
    outputElement.innerHTML = '';
    terminalLines = [];
    addLine("Terminal cleared.", "highlight-text");
}

// Reset the game
function resetGame() {
    power = 100;
    security = 0;
    connectionStrength = 100;
    gameOver = false;
    gameStartTime = Date.now();
    commandHistory = [];
    historyIndex = -1;
    difficultyMultiplier = parseFloat(difficultySelect.value);

    // Reset systems
    systems.forEach(system => {
        system.status = "Protected";
    });

    // Reset objectives
    objectives.forEach(objective => {
        objective.completed = false;
    });

    // Update UI elements
    updateTimer();
    updateTargetsList();
    updateObjectivesList();
    updateNetworkMap();
    updateStats();

    // Reset connection status
    connectionStatus.textContent = "CONNECTED";
    connectionStatus.classList.remove("disconnected");

    // Clear terminal and display intro
    clearTerminal();
    displayIntro();
    closeModal();
}

// Update power and security stats
function updateStats() {
    powerBar.style.width = `${power}%`;
    powerValue.textContent = `${power}%`;

    securityBar.style.width = `${security}%`;
    securityValue.textContent = `${security}%`;

    connectionBar.style.width = `${connectionStrength}%`;
    connectionValue.textContent = `${connectionStrength}%`;

    // Update connection status display
    if (connectionStrength < 30) {
        connectionStatus.textContent = "UNSTABLE";
        connectionStatus.classList.add("disconnected");
    } else {
        connectionStatus.textContent = "CONNECTED";
        connectionStatus.classList.remove("disconnected");
    }

    // Check for game over conditions
    if (power <= 0 || security >= 100 || connectionStrength <= 0) {
        gameOver = true;
        showGameOverModal();
    }
}

// Update connection strength
function updateConnectionStrength(amount = 0) {
    // Random fluctuation if no amount provided
    if (amount === 0) {
        // Small random fluctuation between -3 and +2
        amount = Math.floor(Math.random() * 6) - 3;
    }

    connectionStrength = Math.max(0, Math.min(100, connectionStrength + amount));
    connectionBar.style.width = `${connectionStrength}%`;
    connectionValue.textContent = `${connectionStrength}%`;

    // Update connection status display
    if (connectionStrength < 30) {
        connectionStatus.textContent = "UNSTABLE";
        connectionStatus.classList.add("disconnected");
    } else {
        connectionStatus.textContent = "CONNECTED";
        connectionStatus.classList.remove("disconnected");
    }

    // Check if connection is lost
    if (connectionStrength <= 0 && !gameOver) {
        gameOver = true;
        showGameOverModal("CONNECTION LOST");
    }
}

// Show game over modal
function showGameOverModal(reason = null) {
    if (!reason) {
        reason = power <= 0 ? "POWER FAILURE" : 
                (security >= 100 ? "SECURITY BREACH DETECTED" : 
                "CONNECTION LOST");
    }

    modalTitle.textContent = "MISSION FAILED";
    modalSecondaryBtn.style.display = "none";

    modalBody.innerHTML = `
        <div class="game-over-message">
            <p class="error-text">ALERT: ${reason}</p>
            <p>Your infiltration has been detected!</p>
            <p>The target system has initiated countermeasures and your connection has been severed.</p>
            <p>Mission status: FAILED</p>
        </div>
    `;

    modal.style.display = "block";
    modalBtn.textContent = "RESTART MISSION";
    modalBtn.onclick = resetGame;

    addLine("-----------------------------------------------------", "");
    addLine(`CRITICAL ERROR: ${reason}`, "error-text");
    addLine("Connection terminated by remote host.", "error-text");
    addLine("Mission failed. Type 'reset' to restart.", "highlight-text");
    addLine("-----------------------------------------------------", "");

    showNotification("Mission failed! Connection terminated.", "error");
}

// Check if there's enough power for an operation
function checkPower(cost) {
    if (power < cost) {
        addLine(`Error: Insufficient power for this operation. Required: ${cost}%, Available: ${power}%`, "error-text");
        showNotification("Insufficient power for operation!", "error");
        return false;
    }
    return true;
}

// Consume power
function consumePower(amount) {
    power = Math.max(0, power - amount);
}

// Update security level
function updateSecurity(amount) {
    security = Math.max(0, Math.min(100, security + amount));
}

// Show notification
function showNotification(message, type = "info") {
    notificationContent.textContent = message;
    notification.className = `notification ${type}`;

    // Play notification sound
    playSound(notificationSound);

    // Add show class after a small delay to ensure transition works
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Close modal
function closeModal() {
    modal.style.display = "none";
    modalBtn.onclick = closeModal;
    modalSecondaryBtn.style.display = "block";
}

// Toggle sound effects
function toggleSound() {
    soundEnabled = soundToggle.checked;
}

// Change difficulty level
function changeDifficulty() {
    difficultyMultiplier = parseFloat(difficultySelect.value);
    addLine(`Difficulty level set to: ${difficultySelect.options[difficultySelect.selectedIndex].text}`, "highlight-text");
}

// Change theme
function changeTheme() {
    const theme = themeSelect.value;
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`);
    addLine(`Interface theme changed to: ${themeSelect.options[themeSelect.selectedIndex].text}`, "highlight-text");
}

// Play sound if enabled
function playSound(sound) {
    if (soundEnabled) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Sound play error:", e));
    }
}

// Utility functions
function getRandomChar() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:,.<>?/';
    return chars.charAt(Math.floor(Math.random() * chars.length));
}

function getRandomHackingStep() {
    const steps = [
        "Bypassing firewall protection",
        "Executing buffer overflow attack",
        "Injecting SQL queries",
        "Cracking password hash",
        "Exploiting zero-day vulnerability",
        "Bypassing 2FA authentication",
        "Injecting shellcode",
        "Establishing reverse shell",
        "Elevating privileges",
        "Disabling intrusion detection",
        "Modifying access controls",
        "Bypassing input validation"
    ];
    return steps[Math.floor(Math.random() * steps.length)];
}

function generateDecryptionData() {
    const dataTypes = [
        { type: "user_credentials", content: generateCredentials() },
        { type: "financial_records", content: generateFinancialData() },
        { type: "encryption_keys", content: generateEncryptionKeys() },
        { type: "server_access", content: generateServerAccess() }
    ];

    return dataTypes[Math.floor(Math.random() * dataTypes.length)];
}

function generateCredentials() {
    const usernames = ["admin", "jsmith", "aharris", "sysadmin", "root", "jdoe", "mking"];
    const domains = ["company.com", "secureserver.net", "corp-domain.org", "internal-net.local"];

    const users = [];
    const count = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < count; i++) {
        const username = usernames[Math.floor(Math.random() * usernames.length)];
        const password = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
        const email = `${username}@${domains[Math.floor(Math.random() * domains.length)]}`;

        users.push({ username, password, email });
    }

    return users;
}

function generateFinancialData() {
    const data = {
        accounts: [],
        transactions: []
    };

    const accountCount = Math.floor(Math.random() * 2) + 1;
    const transactionCount = Math.floor(Math.random() * 5) + 3;

    for (let i = 0; i < accountCount; i++) {
        data.accounts.push({
            id: Math.random().toString(36).substring(2, 8),
            balance: Math.floor(Math.random() * 100000) / 100,
            type: Math.random() > 0.5 ? "savings" : "checking"
        });
    }

    for (let i = 0; i < transactionCount; i++) {
        data.transactions.push({
            id: Math.random().toString(36).substring(2, 10),
            amount: Math.floor(Math.random() * 10000) / 100,
            date: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString().split('T')[0],
            description: ["Payment", "Transfer", "Deposit", "Withdrawal"][Math.floor(Math.random() * 4)]
        });
    }

    return data;
}

function generateEncryptionKeys() {
    const algorithms = ["RSA", "AES", "ECC", "DES", "3DES"];
    const keys = [];

    const keyCount = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < keyCount; i++) {
        const algorithm = algorithms[Math.floor(Math.random() * algorithms.length)];
        const key = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);

        keys.push({ algorithm, key, created: new Date(Date.now() - Math.floor(Math.random() * 365) * 86400000).toISOString().split('T')[0] });
    }

    return keys;
}

function generateServerAccess() {
    const serverTypes = ["database", "web", "file", "mail", "authentication"];
    const servers = [];

    const serverCount = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < serverCount; i++) {
        const type = serverTypes[Math.floor(Math.random() * serverTypes.length)];
        const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
        const port = [22, 80, 443, 3306, 5432, 8080, 8443][Math.floor(Math.random() * 7)];

        servers.push({ type, ip, port, access_level: ["user", "admin", "root"][Math.floor(Math.random() * 3)] });
    }

    return servers;
}

// Initialize the game when the page loads
window.addEventListener('load', initGame);