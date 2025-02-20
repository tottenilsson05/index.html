// path: script.js
document.addEventListener('DOMContentLoaded', async () => {
  const MonsterCache = {
    cache: new Map(),

    async getMonsterInfo(monster) {
      if (this.cache.has(monster.name)) {
        console.log(`Cache hit for ${monster.name}`);
        return this.cache.get(monster.name);
      }

      console.log(`Cache miss for ${monster.name}, generating...`);
      const info = {
        analysis: await this.generateAnalysis(monster),
        reports: await this.generateReports(monster),
        protocols: await this.generateProtocols(monster)
      };

      this.cache.set(monster.name, info);
      return info;
    },

    async generateAnalysis(monster) {
      console.time(`API Call: Analysis for ${monster.name}`);
      try {
        const response = await fetch('/api/ai_completion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            prompt: `Generate a unique 2-paragraph in-depth analysis of the monster "${monster.name}". Focus on its potential origins, behaviors, and threat level, written in a mysterious and scientific tone, suitable for a monster information database in a 1998 setting.
            Monster Description: ${monster.description}

            Format: Plain text, 2 paragraphs.`,
            data: { monsterName: monster.name, monsterDescription: monster.description }
          }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const analysisText = await response.text();
        console.timeEnd(`API Call: Analysis for ${monster.name}`);
        return analysisText;
      } catch (error) {
        console.error('Error generating monster analysis:', error);
        return "Analysis data unavailable.";
      }
    },

    async generateReports(monster) {
      console.time(`API Call: Reports for ${monster.name}`);
      try {
        const response = await fetch('/api/ai_completion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            prompt: `Generate 3 unique incident reports related to the monster "${monster.name}". Each report should be brief (1-2 sentences), set in a different plausible location and date between 1985-1995, and maintain a cryptic, classified tone.
            Monster Description: ${monster.description}

            Format: Respond with a list of incident reports as plain text, each on a new line.
            Example:
            March 15, 1985 - Portland, OR: Incident reported involving unusual activity. Details classified.
            July 23, 1989 - Detroit, MI: Unconfirmed sighting. Area under surveillance.
            December 1, 1992 - Chicago, IL: Containment breach suspected. Protocol initiated.`,
            response_format: 'text',
            data: { monsterName: monster.name, monsterDescription: monster.description }
          }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const reportsText = await response.text();
        const reportsArray = reportsText.trim().split('\n');
        console.timeEnd(`API Call: Reports for ${monster.name}`);
        return reportsArray.map(report => `
          <div class="report">
            <p>${report}</p>
          </div>
        `).join('');
      } catch (error) {
        console.error('Error generating monster reports:', error);
        return "<div class='report'><p>Incident reports unavailable.</p></div>";
      }
    },

    async generateProtocols(monster) {
      console.time(`API Call: Protocols for ${monster.name}`);
      try {
        const response = await fetch('/api/ai_completion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            prompt: `Generate unique containment protocols for the monster "${monster.name}". Focus on non-lethal, precautionary measures suitable for field agents in 1998. Protocols should be concise, action-oriented, and reflect the monster's described nature. 2-3 sentences.
            Monster Description: ${monster.description}

            Format: Plain text, 2-3 sentences.`,
            data: { monsterName: monster.name, monsterDescription: monster.description }
          }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const protocolsText = await response.text();
        console.timeEnd(`API Call: Protocols for ${monster.name}`);
        return protocolsText;
      } catch (error) {
        console.error('Error generating monster protocols:', error);
        return "Containment protocols unavailable.";
      }
    }
  };

  let monsters = [];
  let currentMonster = null;
  let correctGuesses = localStorage.getItem('correctGuesses') ? parseInt(localStorage.getItem('correctGuesses')) : 0;
  let totalGuesses = localStorage.getItem('totalGuesses') ? parseInt(localStorage.getItem('totalGuesses')) : 0;
  let currentDay = localStorage.getItem('currentDay') ? parseInt(localStorage.getItem('currentDay')) : 1;
  let gameMode = localStorage.getItem('gameMode') || 'normal';
  let unlockedMonsterCount = Math.min(10 + (currentDay - 1) * 5, 75);
  let unlockedMonsterNames = [];
  let callsPerDayIncrease = 20;
  let callTimeoutDuration = 90000; // 1.5 minutes in milliseconds
  let glitchSkipDuration = 90000; // 1.5 minutes
  let callTimerInterval;
  let isAutoSkipping = false;
  let strikes = 3;
  let usedMonsters = new Set();
  let isCallActive = false; // Track if a call is active

  const mainMenu = document.getElementById('mainMenu');
  const gameContainer = document.getElementById('gameContainer');
  const startGameBtn = document.getElementById('startGame');
  const monsterListUl = document.getElementById('monsterList');
  const logContentDiv = document.getElementById('logContent');
  const loadingMessage = document.createElement('div');
  loadingMessage.id = 'loadingMessage';
  loadingMessage.innerHTML = `
    <span class="loading-prefix">></span> <span class="loading-text">LOADING MONSTERS</span><span class="loading-dots"></span>
  `;
  logContentDiv.appendChild(loadingMessage);
  const callDisplay = document.getElementById('callDisplay');
  const monsterGuessInput = document.getElementById('monsterGuessInput');
  const submitGuessBtn = document.getElementById('submitGuessBtn');
  const feedbackDisplay = document.getElementById('feedbackDisplay');
  const newCallBtn = document.getElementById('newCallBtn');
  const startupTextElement = document.querySelector('.startup-text');
  const startGameButton = document.getElementById('startGame');
  const loadingBar = document.querySelector('.loading-bar');

  let bossFeedbackDisplay = document.createElement('div');
  bossFeedbackDisplay.id = 'bossFeedbackDisplay';
  logContentDiv.parentNode.insertBefore(bossFeedbackDisplay, logContentDiv);
  let accuracyDisplay = document.createElement('div');
  accuracyDisplay.id = 'accuracyDisplay';
  bossFeedbackDisplay.parentNode.insertBefore(accuracyDisplay, bossFeedbackDisplay);
  let dayDisplay = document.createElement('div');
  dayDisplay.id = 'dayDisplay';
  accuracyDisplay.parentNode.insertBefore(dayDisplay, accuracyDisplay);
  let tutorialOverlay = document.createElement('div');
  tutorialOverlay.id = 'tutorialOverlay';
  tutorialOverlay.innerHTML = `
    <div id="tutorialContent">
      <h2>Welcome to TeamTEX</h2>
      <div class="origin-story">
        <p>MARCH 15, 1998</p>
        <p>The fluorescent lights flicker as you enter the small office building. The newspaper ad that brought you here seems almost surreal now:</p>
        <p class="job-ad">"WANTED: Night Shift Operator - TeamTEX Monster Support Services. Must handle unusual situations. No experience necessary. Competitive pay. Medical benefits include supernatural injury coverage."</p>
        <p>The interview was strange - questions about your belief in the paranormal, reaction tests to bizarre sounds, and a final question: "What do you know about the 1983 Incident?"</p>
        <p>Now you're here, sitting at a desk with a glowing green monitor, ready for your first shift...</p>
      </div>
      <p>Select your difficulty level:</p>
      <div class="difficulty-options">
        <button id="casualMode" class="difficulty-btn">CASUAL MODE<br><small>5 monsters, very specific calls</small></button>
        <button id="normalMode" class="difficulty-btn highlighted">NORMAL MODE<br><small>10 monsters, balanced difficulty</small></button>
        <button id="hardMode" class="difficulty-btn">HARD MODE<br><small>All 75 monsters, cryptic calls</small></button>
      </div>
    </div>
  `;
  document.body.appendChild(tutorialOverlay);

  let difficultySettings = {
    casual: {
      unlockedCount: 5,
      timeLimit: 0,
      callSpecificity: 'high',
      callsPerDay: 10
    },
    normal: {
      unlockedCount: 10,
      timeLimit: 90000, // 1.5 minutes
      callSpecificity: 'medium',
      callsPerDay: 20
    },
    hard: {
      unlockedCount: 75,
      timeLimit: 90000, // 1.5 minutes
      callSpecificity: 'low',
      callsPerDay: 30
    }
  };

  document.getElementById('casualMode').addEventListener('click', () => setGameMode('casual'));
  document.getElementById('normalMode').addEventListener('click', () => setGameMode('normal'));
  document.getElementById('hardMode').addEventListener('click', () => setGameMode('hard'));

  function setGameMode(mode) {
    gameMode = mode;
    localStorage.setItem('gameMode', mode);
    currentDay = 1;
    correctGuesses = 0;
    totalGuesses = 0;
    localStorage.setItem('currentDay', '1');
    localStorage.setItem('correctGuesses', '0');
    localStorage.setItem('totalGuesses', '0');

    const settings = difficultySettings[mode];
    unlockedMonsterCount = mode === 'hard' ? 75 : (mode === 'casual' ? 5 : 10);

    usedMonsters.clear();

    updateUnlockedMonsters();
    tutorialOverlay.style.display = 'none';
    dayDisplay.textContent = `Day: ${currentDay}`;
    accuracyDisplay.textContent = `Accuracy: 0% Correct: 0`;
    generateCall();
  }

  let remainingTimeDisplay = document.createElement('div');
  remainingTimeDisplay.id = 'remainingTimeDisplay';
  callDisplay.parentNode.insertBefore(remainingTimeDisplay, callDisplay);
  remainingTimeDisplay.style.display = 'none';

  let strikesDisplay = document.createElement('div');
  strikesDisplay.id = 'strikesDisplay';
  dayDisplay.parentNode.insertBefore(strikesDisplay, dayDisplay);

  startGameBtn.addEventListener('click', () => {
    mainMenu.style.display = 'none';
    gameContainer.style.display = 'flex';
    startShift();
  });

  async function startShift() {
    const eventChance = Math.random();
    if (eventChance < 0.3) {
      const events = [
        'power-fluctuation',
        'system-glitch',
        'interference',
        'emergency-broadcast'
      ];
      triggerRandomEvent(events[Math.floor(Math.random() * events.length)]);
    }
  }

  function triggerRandomEvent(eventType) {
    switch(eventType) {
      case 'power-fluctuation':
        document.body.classList.add('power-flicker');
        setTimeout(() => document.body.classList.remove('power-flicker'), 5000);
        break;
      case 'system-glitch':
        const elements = document.querySelectorAll('main *');
        elements.forEach(el => el.classList.add('system-malfunction'));
        setTimeout(() => elements.forEach(el => el.classList.remove('system-malfunction')), 3000);
        gameStats.glitchedCalls++;
        gameAchievements.checkAchievements(gameStats);
        break;
      case 'interference':
        const callDisplay = document.getElementById('callDisplay');
        callDisplay.classList.add('interference');
        setTimeout(() => callDisplay.classList.remove('interference'), 4000);
        break;
      case 'emergency-broadcast':
        showEmergencyBroadcast();
        break;
    }
  }

  async function showEmergencyBroadcast() {
    const broadcast = await fetch('/api/ai_completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Generate a short emergency broadcast message about a monster-related incident. Should be cryptic and unsettling.

        Format: Plain text, 2-3 sentences only.
        Example: "ALERT: Quarantine protocols activated in Sector 7. Unknown biological manifestation detected. All field agents maintain radio silence."`,
        data: {}
      }),
    });

    const broadcastText = await broadcast.text();
    const overlay = document.createElement('div');
    overlay.className = 'emergency-broadcast';
    overlay.textContent = broadcastText;
    document.body.appendChild(overlay);
    setTimeout(() => document.body.removeChild(overlay), 6000);
  }

  async function getMonsterData() {
    const storedMonsters = localStorage.getItem('monsterData');
    if (storedMonsters) {
      return JSON.parse(storedMonsters);
    }

    try {
      const response = await fetch('/api/ai_completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Generate a JSON array of 75 unique monster entries. Each should follow this format:

          {
            "name": "Unique monster name",
            "description": "2-3 paragraphs describing the monster's general nature, observed behaviors, and notable characteristics. Focus on creating an atmosphere of mystery rather than specific details.",
            "habitat": "Brief description of where the monster is typically found or its preferred environment",
            "log": "A short field report or observation entry"
          }

          Make each monster distinct and mysterious. Avoid overly specific abilities or effects. Focus on creating an unsettling atmosphere.`,
          data: {}
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      localStorage.setItem('monsterData', JSON.stringify(data.monsters));
      return data.monsters;
    } catch (error) {
      console.error('Error fetching monster data:', error);
      return [];
    }
  }

  async function initializeGame() {
    monsters = await getMonsterData();

    // Loading complete, remove animation and enable button
    startupTextElement.classList.remove('typing-animation');
    startupTextElement.innerHTML = 'SHIFT READY'; // Change text to indicate ready

    const loadingBarContainer = document.querySelector('.loading-bar-container');
    if (loadingBarContainer) {
      loadingBarContainer.style.display = 'none'; // Hide loading bar
    }
    startGameButton.disabled = false; // Enable the start button
    if (logContentDiv.contains(loadingMessage)) {
      logContentDiv.removeChild(loadingMessage);
    }
    updateUnlockedMonsters(); // Call this here to populate monster list after loading
    if (monsters.length > 0) {
      displayMonsterLog(monsters[0], 0); // Call this here to display the first monster log after loading
    } else {
      logContentDiv.innerHTML = '<h1>Error loading monster data.</h1><p>Please try again later.</p>';
    }
  }

  initializeGame();


  function updateUnlockedMonsters() {
    unlockedMonsterCount = difficultySettings[gameMode].unlockedCount;
    unlockedMonsterNames = monsters.slice(0, unlockedMonsterCount).map(monster => monster.name);
    monsterListUl.innerHTML = '';
    monsters.slice(0, unlockedMonsterCount).forEach((monster, index) => {
      const listItem = document.createElement('li');
      listItem.textContent = monster.name;
      listItem.addEventListener('click', () => {
        displayMonsterLog(monster, index);
      });
      monsterListUl.appendChild(listItem);
    });

    if (unlockedMonsterCount < 75) {
      const navHeader = document.querySelector('#monsterMenu h2');
      navHeader.textContent = `Monster Index (Day ${currentDay} - ${unlockedMonsterCount}/${75} Unlocked)`;
    } else {
      const navHeader = document.querySelector('#monsterMenu h2');
      navHeader.textContent = `Monster Index (Day ${currentDay} - All Monsters Unlocked)`;
    }
  }

  function updateStrikesDisplay() {
    strikesDisplay.textContent = `Strikes Remaining: ${'❤️'.repeat(strikes)}`;
    strikesDisplay.style.color = strikes === 1 ? '#ff0000' : '#0f0';
  }
  updateStrikesDisplay();

  async function displayMonsterLog(monster, index) {
    logContentDiv.innerHTML = `
      <div class="monster-log active wiki-style" id="monsterLog-${index}">
        <h2>${monster.name}</h2>
        <div class="wiki-header">
          <div class="wiki-id">ID: TEX-${String(index + 1).padStart(3, '0')}</div>
          <div class="wiki-class">Classification: ${getMonsterClass(monster)}</div>
          <div class="wiki-status">Status: Active</div>
        </div>
        <div class="wiki-content">
          <div class="wiki-summary" style="height: auto; min-height: 800px;">
            <p class="monster-description">${monster.description}</p>
            <div id="monsterAnalysis-${index}"></div>
          </div>
          <div class="wiki-details" style="height: auto; min-height: 800px;">
            <h3>Habitat</h3>
            <p class="monster-habitat">${monster.habitat}</p>
            <h3>Incident Reports</h3>
            <div class="incident-reports" id="monsterReports-${index}">
            </div>
            <h3>Containment Protocols</h3>
            <p id="monsterProtocols-${index}"></p>
            <div class="wiki-footer">
              <p>Last Updated: ${getRandomPastDate()}</p>
              <p>Security Clearance: Level 2</p>
            </div>
          </div>
        </div>
      </div>
    `;
    // Fetch and display monster info using MonsterCache
    const monsterInfo = await MonsterCache.getMonsterInfo(monster);

    const monsterLogElement = logContentDiv.querySelector(`#monsterLog-${index}`);

    if (monsterLogElement) {
      const analysisElement = monsterLogElement.querySelector(`#monsterAnalysis-${index}`);
      const reportsElement = monsterLogElement.querySelector(`#monsterReports-${index}`);
      const protocolsElement = monsterLogElement.querySelector(`#monsterProtocols-${index}`);

      if (analysisElement) analysisElement.innerHTML = monsterInfo.analysis;
      if (reportsElement) reportsElement.innerHTML = monsterInfo.reports;
      if (protocolsElement) protocolsElement.textContent = monsterInfo.protocols;
    } else {
      console.error("Monster log element not found!");
    }
  }

  function getMonsterClass(monster) {
    const classes = ['Epsilon', 'Delta', 'Gamma', 'Beta', 'Alpha', 'Omega'];
    const threatLevels = ['Minor', 'Moderate', 'Significant', 'Severe', 'Critical', 'Apocalyptic'];
    const index = Math.floor(Math.random() * classes.length);
    return `${classes[index]}-Class (${threatLevels[index]} Threat)`;
  }

  function getRandomPastDate() {
    const start = new Date('1983-01-01');
    const end = new Date('1998-01-01');
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  let incomingCallSound = new Audio('default_ringtone.ogg');
  incomingCallSound.loop = true;
  let typingSound = new Audio('gaster-talking-made-with-Voicemod.mp3');
  typingSound.loop = true;
  let isTypingSoundPlaying = false;

  async function generateCall() {
    if (isAutoSkipping || isCallActive) return; // Prevent new calls during an active call
    isCallActive = true;
    newCallBtn.disabled = true; // Disable new call button

    let possibleMonsters = monsters.filter(monster =>
      unlockedMonsterNames.includes(monster.name) && !usedMonsters.has(monster.name)
    );

    if (possibleMonsters.length < (currentDay >= 2 ? 2 : 1) ) {
      usedMonsters.clear();
      possibleMonsters = monsters.filter(monster =>
        unlockedMonsterNames.includes(monster.name)
      );
    }

    let selectedMonsters = [];
    if (currentDay >= 2 && Math.random() < 0.5) { // 50% chance for two monsters from day 2 onwards
      let monster1 = possibleMonsters[Math.floor(Math.random() * possibleMonsters.length)];
      selectedMonsters.push(monster1);
      possibleMonsters = possibleMonsters.filter(m => m !== monster1); // Ensure no duplicate monsters in one call
      if (possibleMonsters.length > 0) { // Ensure there is another monster to pick
        let monster2 = possibleMonsters[Math.floor(Math.random() * possibleMonsters.length)];
        selectedMonsters.push(monster2);
      }
    } else {
      selectedMonsters.push(possibleMonsters[Math.floor(Math.random() * possibleMonsters.length)]);
    }

    if (selectedMonsters.length === 0) {
      console.error('No monster selected');
      isCallActive = false;
      newCallBtn.disabled = false;
      return;
    }

    selectedMonsters.forEach(monster => usedMonsters.add(monster.name));
    currentMonster = selectedMonsters; // Store selected monsters array

    callDisplay.textContent = '';
    feedbackDisplay.textContent = '';
    bossFeedbackDisplay.textContent = '';
    monsterGuessInput.value = '';
    clearCallTimer();
    callDisplay.classList.remove('glitching-call');
    newCallBtn.classList.add('buzzing-button'); // Add buzzing animation class

    if (currentDay === 7 && correctGuesses >= callsPerDayIncrease - 1) {
      triggerEndingSequence();
      return;
    }

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    const monsterNamesForPrompt = selectedMonsters.map(m => m.name).join(" and ");
    const monsterDescriptionsForPrompt = selectedMonsters.map(m => `${m.name}: ${m.description}`).join("\n");

    incomingCallSound.play().catch(e => console.error("Failed to play incoming call sound:", e)); // Play ringtone

    try {
      const response = await fetch('/api/ai_completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Create a distressed emergency call about encountering monster(s) ${monsterNamesForPrompt}. Make it sound urgent and desperate, but don't directly name the monster(s). Include relevant details that hint at the monster(s) nature. 2-3 sentences.

          Monsters: ${monsterNamesForPrompt}
          Descriptions:
          ${monsterDescriptionsForPrompt}

          Format:
          [INCOMING CALL - ${hours}:${minutes}:${seconds}]
          [CALLER ID: UNKNOWN]

          <call content here>`,
          data: {}
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const callText = await response.text();

      const textElement = document.createElement('p');
      textElement.className = 'typing-animation';
      callDisplay.appendChild(textElement);

      let i = 0;
      const typeText = () => {
        if (i === 0) {
          incomingCallSound.pause(); // Stop ringtone when typing starts
          incomingCallSound.currentTime = 0;
          typingSound.play().catch(e => console.error("Failed to play typing sound:", e)); // Play typing sound
          isTypingSoundPlaying = true;
          newCallBtn.classList.remove('buzzing-button'); // Remove buzzing class when typing starts
        }
        if (i < callText.length) {
          textElement.textContent += callText.charAt(i);
          i++;
          setTimeout(typeText, 50);
        } else {
          typingSound.pause(); // Stop typing sound when finished
          typingSound.currentTime = 0;
          isTypingSoundPlaying = false;
        }
      };
      typeText();

      if (gameMode === 'hard' || (gameMode === 'normal' && Math.random() < 0.3)) {
        startCallTimer(difficultySettings[gameMode].timeLimit);
      }
    } catch (error) {
      console.error('Error generating call:', error);
      callDisplay.textContent = 'Error receiving call. Please try again.';
      currentMonster = null;
      isCallActive = false;
      newCallBtn.disabled = false;
      newCallBtn.classList.remove('buzzing-button'); // Ensure buzzing is removed on error
      incomingCallSound.pause(); // Stop ringtone in case of error
      incomingCallSound.currentTime = 0;
      typingSound.pause(); // Stop typing sound in case of error
      typingSound.currentTime = 0;
      isTypingSoundPlaying = false;
    }
  }

  function triggerEndingSequence() {
    const textElement = document.createElement('p');
    textElement.className = 'typing-animation';
    callDisplay.innerHTML = '';
    callDisplay.appendChild(textElement);

    let finalMessage = "behind you";
    let i = 0;
    const typeText = () => {
      if (i < finalMessage.length) {
        textElement.textContent += finalMessage.charAt(i);
        i++;
        setTimeout(typeText, 100);
      } else {
        setTimeout(startEndingSequence, 2000);
      }
    };
    typeText();
  }

  function startEndingSequence() {
    document.body.classList.add('red-alert');
    newCallBtn.classList.add('glitch-button');

    const endingOverlay = document.createElement('div');
    endingOverlay.className = 'ending-sequence';
    endingOverlay.innerHTML = `
      <h1 style="animation: textglitch 0.5s infinite">END OF SHIFT</h1>
      <p style="font-size: 0.5em; margin-top: 20px">Endless Mode Unlocked</p>
    `;
    document.body.appendChild(endingOverlay);

    localStorage.setItem('endlessModeUnlocked', 'true');

    setTimeout(() => {
      document.body.classList.remove('red-alert');
      endingOverlay.remove();
      mainMenu.style.display = 'block';
      gameContainer.style.display = 'none';
      location.reload();
    }, 5000);
  }

  function startCallTimer(duration) {
    remainingTimeDisplay.style.display = 'block';
    let timeLeft = duration / 1000;
    remainingTimeDisplay.textContent = `Time Remaining: ${timeLeft}s`;
    callTimerInterval = setInterval(() => {
      timeLeft--;
      remainingTimeDisplay.textContent = `Time Remaining: ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(callTimerInterval);
        remainingTimeDisplay.style.display = 'none';
        checkGuess(true);
      }
    }, 1000);
  }

  function clearCallTimer() {
    clearInterval(callTimerInterval);
    remainingTimeDisplay.style.display = 'none';
  }

  async function checkGuess(isTimeout = false) {
    clearCallTimer();
    newCallBtn.disabled = false; // Re-enable new call button
    isCallActive = false; // Reset call active status
    newCallBtn.classList.remove('buzzing-button'); // Remove buzzing if it's still active
    incomingCallSound.pause(); // Stop ringtone if still playing
    incomingCallSound.currentTime = 0;
    typingSound.pause(); // Stop typing sound if still playing
    typingSound.currentTime = 0;
    isTypingSoundPlaying = false;


    if (!currentMonster && !isTimeout) {
      feedbackDisplay.textContent = 'No call received. Please request a call first.';
      return;
    }

    let isCorrectGuess = false;
    let guessResultType = "incorrect"; // "correct", "close", "incorrect"
    if (!isTimeout) {
      const guess = monsterGuessInput.value.trim();
      const actualMonsterNames = currentMonster.map(m => m.name);
      const actualMonsterNamesString = actualMonsterNames.join(", ");

      try {
        const response = await fetch('/api/ai_completion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            prompt: `Determine if the user's monster guess is correct or close to the actual monster name(s).

            User Guess: "${guess}"
            Actual Monster Name(s): "${actualMonsterNamesString}"

            Respond with "correct" if the guess exactly matches all of the actual monster names (if multiple).
            Respond with "close" if the guess is a plausible variation, misspelling, or abbreviation of at least one of the actual monster names, but not all if there are multiple actual monsters.
            Respond with "incorrect" if the guess is completely different from the actual monster name(s).

            Format: Plain text, one word: "correct", "close", or "incorrect".`,
            data: { guess: guess, actualMonsterNames: actualMonsterNamesString }
          }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        guessResultType = await response.text();
        guessResultType = guessResultType.trim().toLowerCase(); // Normalize response

        if (guessResultType === "correct") {
          isCorrectGuess = true;
        } else if (guessResultType === "close") {
          isCorrectGuess = false; // Treat "close" as incorrect for now, adjust feedback if needed
        } else {
          isCorrectGuess = false;
        }
      } catch (error) {
        console.error('Error validating guess with AI:', error);
        isCorrectGuess = guess.toLowerCase() === actualMonsterNamesString.toLowerCase(); // Fallback to simple comparison
        guessResultType = isCorrectGuess ? "correct" : "incorrect";
      }
    }

    if (!isCorrectGuess) {
      strikes--;
      updateStrikesDisplay();

      if (strikes <= 0) {
        localStorage.clear();
        document.body.classList.add('call-failure');
        setTimeout(() => {
          alert('CRITICAL FAILURE - All progress lost. Restarting system...');
          location.reload();
        }, 1000);
        return;
      }
    }

    totalGuesses++;

    const monsterNamesText = currentMonster.map(m => m.name).join(" and ");

    if (isCorrectGuess && !isTimeout) {
      correctGuesses++;
      feedbackDisplay.textContent = `Correct! Monster(s) identified: ${monsterNamesText}. Caller reported situation resolved.`;
    } else {
      document.body.classList.add('call-failure');
      setTimeout(() => document.body.classList.remove('call-failure'), 1000);

      if (isTimeout) {
        feedbackDisplay.textContent = `Call timed out... Agent, you need to be quicker! Monster(s) were: ${monsterNamesText}.`;
      } else if (guessResultType === "close") {
        feedbackDisplay.textContent = `Close guess! But not quite right. Monster(s) were: ${monsterNamesText}.`;
      }
      else {
        feedbackDisplay.textContent = `Incorrect identification! Caller response lost. Monster(s) were: ${monsterNamesText}.`;
      }
    }

    localStorage.setItem('correctGuesses', correctGuesses.toString());
    localStorage.setItem('totalGuesses', totalGuesses.toString());
    accuracyDisplay.textContent = `Accuracy: ${calculateAccuracy()}% Correct: ${correctGuesses}`;

    const bossFeedback = await getBossFeedback(isCorrectGuess || isTimeout, monsterNamesText);
    bossFeedbackDisplay.textContent = bossFeedback;

    currentMonster = null;

    let callStartTime = Date.now();

    gameStats.lastGuessTime = Date.now() - callStartTime;
    gameStats.totalCalls++;
    gameStats.dailyAccuracy = calculateAccuracy();
    gameStats.overallAccuracy = (correctGuesses / totalGuesses) * 100;

    if (!isTimeout && isCorrectGuess) {
      if (gameMode === 'hard' || (gameMode === 'normal' && Math.random() < 0.3)) gameStats.consecutiveTimedCalls++;
      else gameStats.consecutiveTimedCalls = 0;
    } else {
      gameStats.consecutiveTimedCalls = 0;
    }

    gameAchievements.checkAchievements(gameStats);

    if (correctGuesses >= callsPerDayIncrease && unlockedMonsterCount < 75) {
      currentDay++;
      localStorage.setItem('currentDay', currentDay.toString());
      localStorage.setItem('correctGuesses', '0');
      correctGuesses = 0;
      if (gameMode !== 'hard') {
        unlockedMonsterCount = Math.min(unlockedMonsterCount + 5, 75);
      }
      updateUnlockedMonsters();
      dayDisplay.textContent = `Day: ${currentDay}`;
      tutorialOverlay.style.display = 'block';
      tutorialOverlay.innerHTML = `
        <div id="tutorialContent">
          <h2>Day ${currentDay} at TeamTEX</h2>
          <div class="daily-story">
            ${getDailyStory(currentDay)}
          </div>
          <p>New monsters unlocked! Check the updated Monster Index.</p>
          <p>Today's target: ${callsPerDayIncrease} correct identifications.</p>
          <button id="dismissTutorial">Start Day ${currentDay}</button>
        </div>
      `;
      const dismissTutorialBtnNewDay = document.getElementById('dismissTutorial');
      dismissTutorialBtnNewDay.addEventListener('click', () => {
        tutorialOverlay.style.display = 'none';
        generateCall();
      });
      callsPerDayIncrease += 5;
    }
  }

  function getDailyStory(day) {
    // ...existing code...
  }

  newCallBtn.addEventListener('click', generateCall);
  submitGuessBtn.addEventListener('click', () => checkGuess(false));

  // ...rest of existing code...
});