const translations = {
  en: {
    samples: "Samples",
    health: "Life Energy",
    beamCooldown: "Purification Beam",
    ready: "Ready",
    seconds: "sec",
    portalButton: "Devouring Abyss Portal",
    returnButton: "Return to Ocean",
    beamButton: "Purification Beam [Q]",
    codeInput: "Enter code",
    submitCode: "Submit Code",
    codeCorrect: "Correct code!",
    codeIncorrect: "Incorrect code!",
    gameOver: "GAME OVER",
    shipDestroyed: "Your Peregrinna ship was destroyed...",
    restartJourney: "Restart Journey",
    shopSpeed: "Speed Potion (3 samples)",
    shopHealth: "Life Energy Potion (5 samples)",
    shopBeam: "Beam Cooldown Reduction (10 samples)",
    itemPurchased: "Item purchased!",
    chatPlaceholder: "Type your message...",
    send: "Send"
  },
  pt: {
    samples: "Amostras",
    health: "Energia Vital",
    beamCooldown: "Raio de Purificação",
    ready: "Pronto",
    seconds: "seg",
    portalButton: "Portal do Abismo Devorador",
    returnButton: "Retornar ao Oceano",
    beamButton: "Raio de Purificação [Q]",
    codeInput: "Digite o código",
    submitCode: "Enviar Código",
    codeCorrect: "Código correto!",
    codeIncorrect: "Código incorreto!",
    gameOver: "FIM DE JOGO",
    shipDestroyed: "Sua nave Peregrinna foi destruída...",
    restartJourney: "Reiniciar Jornada",
    shopSpeed: "Poção de Velocidade (3 amostras)",
    shopHealth: "Poção de Energia Vital (5 amostras)",
    shopBeam: "Redução de Cooldown do Raio (10 amostras)",
    itemPurchased: "Item comprado!",
    chatPlaceholder: "Digite sua mensagem...",
    send: "Enviar"
  }
};

let currentLanguage = 'en';

import { Player } from './player.js';
import { Creature } from './creature.js';
import { Pollution } from './pollution.js';
import { PoisonousCoral } from './enemy.js';
import { AbyssalDevourer } from './boss.js';
import { PowerCrystalManager, PowerCrystal } from './power-crystals.js';
const backgroundMusic = document.getElementById('backgroundMusic');
const bossBattleMusic = document.getElementById('bossBattleMusic');

export class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 800;
    this.canvas.height = 600;
    
    this.worldWidth = 10000;  
    this.worldHeight = 10000;
    
    this.camera = {
      x: 0,
      y: 0,
      width: this.canvas.width,
      height: this.canvas.height
    };
    
    this.player = new Player(this.worldWidth / 2, this.worldHeight / 2);
    this.creatures = [];
    this.pollutionSamples = [];
    this.enemies = [];
    this.samplesCollected = 0;
    
    this.isAbyssalRealm = false;
    this.boss = null;
    this.isBossFight = false;
    
    this.infiniteEnergyMode = false;
    this.gameOver = false;
    
    this.otherPlayers = new Map();
    this.room = new WebsimSocket();
    
    this.setupEventListeners();
    this.setupPortalButton();
    this.setupBeamButton();
    this.setupCodeSystem();
    this.spawnInitialEntities();
    this.createInfiniteEnergyMenu();
    this.setupShop();
    this.setupMultiplayer();
    this.setupChat();
    this.setupPlayerChatMessages();

    // Add game over event listener
    window.addEventListener('gameOver', () => {
      this.handleGameOver();
    });

    this.setupLanguageButton();
    
    this.powerCrystalManager = new PowerCrystalManager(this);
    this.guardians = [];
    this.powerCrystalManager.spawnCrystals();
    
    this.setupMusic();
  }

  createInfiniteEnergyMenu() {
    const menuDiv = document.createElement('div');
    menuDiv.id = 'infinite-energy-menu';
    menuDiv.style.display = 'none';
    menuDiv.style.position = 'fixed';
    menuDiv.style.top = '50%';
    menuDiv.style.left = '50%';
    menuDiv.style.transform = 'translate(-50%, -50%)';
    menuDiv.style.background = 'rgba(0, 20, 40, 0.95)';
    menuDiv.style.color = '#4cc9f0';
    menuDiv.style.padding = '30px';
    menuDiv.style.borderRadius = '15px';
    menuDiv.style.textAlign = 'center';
    menuDiv.style.maxWidth = '400px';
    menuDiv.style.zIndex = '1000';
    menuDiv.innerHTML = `
      <h2>Modo de Energia Infinita Ativado!</h2>
      <p>Sua nave Peregrinna agora possui energia vital ilimitada.</p>
      <ul style="list-style-type: none; padding: 0; margin: 20px 0;">
        <li> Vida: Infinita</li>
        <li> Purificação: Sem limites</li>
        <li> Dash: Ilimitado</li>
        <li> Amostras: Infinitas</li>
      </ul>
      <div style="display: flex; justify-content: space-between;">
        <button id="close-infinite-energy-menu" style="
          background: linear-gradient(45deg, #4cc9f0, #4895ef);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          margin-top: 20px;
        ">Fechar</button>
        <button id="set-boss-phase-3" style="
          background: linear-gradient(45deg, #f72585, #7209b7);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          margin-top: 20px;
        ">Ir para Fase 3 do Chefão</button>
      </div>
    `;
    
    document.body.appendChild(menuDiv);

    document.getElementById('close-infinite-energy-menu').addEventListener('click', () => {
      menuDiv.style.display = 'none';
    });

    document.getElementById('set-boss-phase-3').addEventListener('click', () => {
      if (this.boss) {
        this.boss.currentPhaseIndex = 3;
        this.boss.phaseTimer = 0;
        this.isBossFight = true;
        this.isAbyssalRealm = true;
        menuDiv.style.display = 'none';
        
        // Update portal button to reflect Abyssal Realm
        const button = document.getElementById('portal-button');
        button.textContent = "Retornar ao Oceano";
        button.style.background = "linear-gradient(45deg, #4cc9f0, #4895ef)";
        button.style.borderColor = "#4cc9f0";
        
        this.player.emotionalState = 0.6;
      }
    });
  }

  setupEventListeners() {
    document.getElementById('start-game').addEventListener('click', () => {
      document.querySelector('.intro-screen').style.display = 'none';
      this.start();
    });

    document.addEventListener('keydown', (e) => this.player.handleInput(e, true));
    document.addEventListener('keyup', (e) => this.player.handleInput(e, false));
    
    document.getElementById('portal-button').addEventListener('click', () => {
      this.toggleAbyssalRealm();
    });
    
    document.getElementById('beam-button').addEventListener('click', () => {
      this.player.controls.beam = true;
      setTimeout(() => {
        this.player.controls.beam = false;
      }, 100);
    });
  }

  setupPortalButton() {
    const button = document.getElementById('portal-button');
    button.textContent = "Portal do Abismo Devorador";
    button.style.background = "linear-gradient(45deg, #7209b7, #560bad)";
    button.style.borderColor = "#f72585";
  }

  setupBeamButton() {
    const beamButton = document.getElementById('beam-button');
    const beamCooldownEl = document.getElementById('beam-cooldown');
  }

  setupCodeSystem() {
    const codeSubmit = document.getElementById('code-submit');
    const codeInput = document.getElementById('code-input');
    const codeMessage = document.getElementById('code-message');

    codeSubmit.addEventListener('click', () => {
      const code = codeInput.value;
      if (code === '7040') {
        codeMessage.style.color = '#4cc9f0';
        codeMessage.textContent = 'Código correto!';
        
        // Activate infinite energy mode and infinite samples
        this.infiniteEnergyMode = true;
        this.samplesCollected = Infinity;
        document.getElementById('samples-count').textContent = '∞';
        
        // Show infinite energy menu
        const infiniteEnergyMenu = document.getElementById('infinite-energy-menu');
        infiniteEnergyMenu.style.display = 'block';
        
        setTimeout(() => {
          codeMessage.textContent = '';
        }, 3000);
      } else {
        codeMessage.style.color = '#f72585';
        codeMessage.textContent = 'Código incorreto!';
        setTimeout(() => {
          codeMessage.textContent = '';
        }, 3000);
      }
      codeInput.value = '';
    });

    // Allow Enter key to submit code
    codeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        codeSubmit.click();
      }
    });
  }

  setupShop() {
    const shopButton = document.querySelector('.shop-button');
    const shopContainer = document.querySelector('.shop-container');
    const closeShop = document.querySelector('.close-shop');
    const shopItems = document.querySelector('.shop-items');

    // Toggle shop visibility
    shopButton.addEventListener('click', () => {
      shopContainer.classList.add('show');
    });

    closeShop.addEventListener('click', () => {
      shopContainer.classList.remove('show');
    });

    // Shop items data
    const items = [
      {
        type: 'speed',
        cost: 3,
        name: 'Speed Potion',
        description: 'Increases movement speed temporarily'
      },
      {
        type: 'health',
        cost: 5,
        name: 'Life Energy Potion',
        description: 'Restores and increases life energy'
      },
      {
        type: 'beam',
        cost: 10,
        name: 'Beam Cooldown Reducer',
        description: 'Reduces purification beam cooldown'
      },
      {
        type: 'shield',
        cost: 8,
        name: 'Shield Crystal',
        description: 'Temporary protection against pollution'
      },
      {
        type: 'guardian',
        cost: 12,
        name: 'Guardian Crystal',
        description: 'Summons a protective guardian'
      }
    ];

    // Create shop items
    items.forEach(item => {
      const itemElement = document.createElement('button');
      itemElement.className = 'shop-item';
      itemElement.innerHTML = `
        <div>${item.name}</div>
        <div><small>${item.description}</small></div>
        <div>Cost: ${item.cost} samples</div>
      `;

      itemElement.addEventListener('click', () => {
        if (this.samplesCollected >= item.cost) {
          this.purchaseItem(item.type, item.cost);
        }
      });

      shopItems.appendChild(itemElement);
    });
  }

  purchaseItem(type, cost) {
    let success = true;

    switch(type) {
      case 'speed':
        this.player.speed += 2;
        break;
      case 'health':
        const maxHealth = 150;
        const healthGain = 50;
        this.player.health = Math.min(maxHealth, this.player.health + healthGain);
        document.getElementById('health').textContent = this.player.health;
        break;
      case 'beam':
        this.player.beam.maxCooldown = Math.max(60, this.player.beam.maxCooldown - 30);
        break;
      case 'shield':
        const crystal = new PowerCrystal(this.player.x, this.player.y, 'shield');
        this.powerCrystalManager.inventory.push(crystal);
        break;
      case 'guardian':
        const guardianCrystal = new PowerCrystal(this.player.x, this.player.y, 'guardian');
        this.powerCrystalManager.inventory.push(guardianCrystal);
        break;
      default:
        success = false;
    }

    if (success) {
      // Deduct the cost
      this.samplesCollected -= cost;
      document.getElementById('samples-count').textContent = this.samplesCollected;

      // Update crystal inventory if needed
      if (type === 'shield' || type === 'guardian') {
        this.powerCrystalManager.updateCrystalInventoryUI();
      }

      // Show purchase feedback
      const feedback = document.createElement('div');
      feedback.className = 'purchase-feedback';
      feedback.textContent = translations[currentLanguage].itemPurchased;
      document.body.appendChild(feedback);
      
      setTimeout(() => {
        feedback.remove();
      }, 2000);
    }
  }

  setupLanguageButton() {
    const langButton = document.getElementById('language-button');
    langButton.addEventListener('click', () => {
      currentLanguage = currentLanguage === 'en' ? 'pt' : 'en';
      langButton.textContent = currentLanguage === 'en' ? '🇧🇷' : '🇺🇸';
      this.updateLanguage();
    });
  }

  updateLanguage() {
    // Update HUD
    document.querySelector('.samples').firstChild.textContent = `${translations[currentLanguage].samples}: `;
    document.querySelector('.health').firstChild.textContent = `${translations[currentLanguage].health}: `;
    document.querySelector('.beam-cooldown').firstChild.textContent = `${translations[currentLanguage].beamCooldown}: `;
    
    // Update buttons
    document.getElementById('portal-button').textContent = this.isAbyssalRealm ? 
      translations[currentLanguage].returnButton : 
      translations[currentLanguage].portalButton;
    
    document.getElementById('beam-button').textContent = translations[currentLanguage].beamButton;
    
    // Update code input
    document.getElementById('code-input').placeholder = translations[currentLanguage].codeInput;
    document.getElementById('code-submit').textContent = translations[currentLanguage].submitCode;

    // Update shop button
    document.querySelector('.shop-button').textContent = 
      currentLanguage === 'en' ? 'Shop' : 'Loja';
  
    // Update shop title
    document.querySelector('.shop-title').textContent = 
      currentLanguage === 'en' ? 'Oceanic Shop' : 'Loja Oceânica';
  }

  setupMultiplayer() {
    // Set up initial player info
    this.room.party.subscribe((peers) => {
      // Update player info
      this.player.userId = this.room.party.client.id;
      this.player.username = this.room.party.client.username;
      
      // Handle other peers
      for (const clientId in peers) {
        if (clientId !== this.player.userId && !this.otherPlayers.has(clientId)) {
          this.otherPlayers.set(clientId, {
            player: new Player(this.worldWidth / 2, this.worldHeight / 2),
            lastUpdate: Date.now()
          });
          this.otherPlayers.get(clientId).player.username = peers[clientId].username;
          this.otherPlayers.get(clientId).player.userId = clientId;
        }
      }
      
      // Remove disconnected players
      for (const [clientId] of this.otherPlayers) {
        if (!peers[clientId]) {
          this.otherPlayers.delete(clientId);
        }
      }
    });

    // Handle player position updates
    this.room.onmessage = (event) => {
      const data = event.data;
      switch (data.type) {
        case "playerUpdate":
          if (data.clientId !== this.player.userId) {
            const otherPlayer = this.otherPlayers.get(data.clientId);
            if (otherPlayer) {
              otherPlayer.player.x = data.x;
              otherPlayer.player.y = data.y;
              otherPlayer.player.health = data.health;
              otherPlayer.player.emotionalState = data.emotionalState;
              otherPlayer.player.controls = data.controls;
              otherPlayer.lastUpdate = Date.now();
            }
          }
          break;
        case "chat":
          this.addPlayerChatMessage(data.username, data.message);
          break;
      }
    };

    // Send player updates
    setInterval(() => {
      this.room.send({
        type: "playerUpdate",
        x: this.player.x,
        y: this.player.y,
        health: this.player.health,
        emotionalState: this.player.emotionalState,
        controls: this.player.controls
      });
    }, 50);
  }

  setupChat() {
    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat-container';
    chatContainer.innerHTML = `
      <div class="chat-messages"></div>
      <div class="chat-input-container">
        <input type="text" class="chat-input" placeholder="${translations[currentLanguage].chatPlaceholder}">
        <button class="chat-send">${translations[currentLanguage].send}</button>
      </div>
    `;
    document.body.appendChild(chatContainer);

    const chatInput = chatContainer.querySelector('.chat-input');
    const chatSend = chatContainer.querySelector('.chat-send');
    const chatMessages = chatContainer.querySelector('.chat-messages');

    const sendMessage = () => {
      const message = chatInput.value.trim();
      if (message) {
        this.room.send({
          type: "chat",
          message: message,
          username: this.player.username
        });
        chatInput.value = '';
      }
    };

    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  setupPlayerChatMessages() {
    this.playerChatMessages = new Map();
  }

  addPlayerChatMessage(username, message) {
    // Add the standard chat message
    this.addChatMessage(username, message);
    
    // Create a temporary floating chat message above the player's head
    if (this.otherPlayers.has(username)) {
      const playerData = this.otherPlayers.get(username);
      playerData.chatMessage = {
        text: message,
        timer: 7 * 60 // 7 seconds at 60 fps
      };
    }
    
    // If it's the current player, create a message for them too
    if (this.player.username === username) {
      this.player.chatMessage = {
        text: message,
        timer: 7 * 60 // 7 seconds at 60 fps
      };
    }
  }

  addChatMessage(username, message) {
    const chatMessages = document.querySelector('.chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message';
    messageElement.innerHTML = `<span class="username">${username}:</span> ${message}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  draw() {
    this.ctx.save();
    this.ctx.translate(-this.camera.x, -this.camera.y);
    
    this.ctx.clearRect(this.camera.x, this.camera.y, this.canvas.width, this.canvas.height);
    
    this.drawWaterEffect();
    
    if (this.isBossFight && this.boss) {
      this.boss.draw(this.ctx);
    } else {
      this.pollutionSamples.forEach(sample => sample.draw(this.ctx));
      this.creatures.forEach(creature => creature.draw(this.ctx));
      this.enemies.forEach(enemy => enemy.draw(this.ctx));
    }
    
    // Draw other players
    this.otherPlayers.forEach((data, clientId) => {
      data.player.draw(this.ctx);
      
      // Draw chat message if exists
      if (data.chatMessage) {
        this.drawPlayerChatMessage(data.player, data.chatMessage);
        
        // Decrement timer
        data.chatMessage.timer--;
        if (data.chatMessage.timer <= 0) {
          data.chatMessage = null;
        }
      }
    });

    // Draw main player chat message
    if (this.player.chatMessage) {
      this.drawPlayerChatMessage(this.player, this.player.chatMessage);
      
      // Decrement timer
      this.player.chatMessage.timer--;
      if (this.player.chatMessage.timer <= 0) {
        this.player.chatMessage = null;
      }
    }

    // Draw main player
    this.player.draw(this.ctx);
    
    // Draw power crystals
    this.powerCrystalManager.crystals.forEach(crystal => {
      crystal.draw(this.ctx);
    });

    // Draw guardians
    this.guardians.forEach(guardian => {
      guardian.draw(this.ctx);
    });
    
    this.ctx.restore();
  }

  drawPlayerChatMessage(player, chatMessage) {
    this.ctx.save();
    this.ctx.font = '14px Arial';
    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'center';
    
    // Position above the player, with a slight offset
    const textY = player.y - 50;
    const textX = player.x + player.width / 2;
    
    // Create a semi-transparent background for readability
    const textWidth = this.ctx.measureText(chatMessage.text).width;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(
      textX - textWidth / 2 - 10, 
      textY - 20, 
      textWidth + 20, 
      30
    );
    
    // Draw text
    this.ctx.fillStyle = 'white';
    this.ctx.fillText(chatMessage.text, textX, textY);
    
    this.ctx.restore();
  }

  toggleAbyssalRealm() {
    this.isAbyssalRealm = !this.isAbyssalRealm;
    const button = document.getElementById('portal-button');
    
    if (this.isAbyssalRealm) {
      button.textContent = translations[currentLanguage].returnButton;
      button.style.background = "linear-gradient(45deg, #4cc9f0, #4895ef)";
      button.style.borderColor = "#4cc9f0";
      this.player.emotionalState = 0.6; // Darker emotional state in abyssal realm
      if (!this.boss) {
        this.boss = new AbyssalDevourer(
          this.player.x + 400,
          this.player.y
        );
        this.isBossFight = true;
      }
      backgroundMusic.pause();
      bossBattleMusic.volume = 0.6;
      bossBattleMusic.play().catch(e => console.error("Boss music play error:", e));
    } else {
      button.textContent = translations[currentLanguage].portalButton;
      button.style.background = "linear-gradient(45deg, #7209b7, #560bad)";
      button.style.borderColor = "#f72585";
      this.player.emotionalState = 1.0; // Reset emotional state
      this.isBossFight = false;
      this.boss = null;
      bossBattleMusic.pause();
      backgroundMusic.play().catch(e => console.error("Music play error:", e));
    }
  }

  setupMusic() {
    backgroundMusic.volume = 0.5;
    backgroundMusic.play().catch(e => console.error("Music play error:", e));
  }

  advancePhase() {
    if (this.boss && this.boss.currentPhaseIndex === 3) {
      bossBattleMusic.playbackRate = 1.2; // Slightly faster, more intense
    }
  }

  toggleMusic() {
    if (this.isAbyssalRealm) {
      bossBattleMusic.paused ? bossBattleMusic.play() : bossBattleMusic.pause();
    } else {
      backgroundMusic.paused ? backgroundMusic.play() : backgroundMusic.pause();
    }
  }

  spawnInitialEntities() {
    for (let i = 0; i < 50; i++) {
      this.creatures.push(new Creature(
        Math.random() * this.worldWidth,
        Math.random() * this.worldHeight
      ));
    }

    for (let i = 0; i < 100; i++) {
      this.pollutionSamples.push(new Pollution(
        Math.random() * this.worldWidth,
        Math.random() * this.worldHeight
      ));
    }

    for (let i = 0; i < 25; i++) {
      this.enemies.push(new PoisonousCoral(
        Math.random() * this.worldWidth,
        Math.random() * this.worldHeight
      ));
    }
  }

  update() {
    // Skip update if game is over
    if (this.gameOver) return;

    // If infinite energy mode is on, keep health and cooldowns reset
    if (this.infiniteEnergyMode) {
      this.player.health = 100;
      this.player.beam.cooldown = 0;
      this.player.dashCooldown = 0;
      // Prevent game over in infinite energy mode
      this.player.isExploding = false;
    }

    this.player.update();
    this.updateCamera();

    if (this.isBossFight && this.boss) {
      this.boss.update(this.player);
      
      if (this.boss.checkCollisions(this.player)) {
        this.player.takeDamage(10);
        document.getElementById('health').textContent = this.player.health;
      }
      
      if (this.player.isColliding(this.boss) && this.player.emotionalState > 0.8) {
        this.boss.purify(0.01);
      }
    } else {
      this.creatures.forEach(creature => {
        creature.update();
        if (this.player.isColliding(creature)) {
          if (creature.isPolluted) {
            creature.heal();
          }
        }
      });

      this.pollutionSamples = this.pollutionSamples.filter(sample => {
        if (this.player.isColliding(sample)) {
          this.samplesCollected++;
          document.getElementById('samples-count').textContent = this.samplesCollected;
          return false;
        }
        return true;
      });

      this.enemies.forEach(enemy => {
        enemy.update(this.player);
        
        if (this.player.isColliding(enemy) && this.player.emotionalState > 0.8) {
          enemy.stun();
        }
        
        if (enemy.checkCollisionWithPlayer(this.player)) {
          this.player.takeDamage(10);
          document.getElementById('health').textContent = this.player.health;
        }
      });
    }

    // Beam ability interactions
    if (this.player.beam.isActive) {
      // Interact with creatures
      this.creatures.forEach(creature => {
        if (creature.isPolluted && this.isInBeamRange(creature)) {
          creature.heal();
        }
      });

      // Interact with enemies
      this.enemies.forEach(enemy => {
        if (this.isInBeamRange(enemy)) {
          enemy.stun();
        }
      });

      // Interact with boss
      if (this.isBossFight && this.boss) {
        if (this.isInBeamRange(this.boss)) {
          this.boss.purify(this.player.beam.damage / 60); 
          this.boss.takeDamage(this.player.beam.damage / 60); 
        }
      }
    }

    // Update beam cooldown display
    const beamCooldownEl = document.getElementById('beam-cooldown');
    if (this.player.beam.cooldown > 0) {
      beamCooldownEl.textContent = `${Math.ceil(this.player.beam.cooldown / 60)} ${translations[currentLanguage].seconds}`;
    } else {
      beamCooldownEl.textContent = translations[currentLanguage].ready;
    }

    // Update HUD text based on game state
    const healthEl = document.getElementById('health');
    if (this.isBossFight) {
      healthEl.textContent = `${translations[currentLanguage].health}: ${this.player.health}`;
      healthEl.style.color = '#f72585';  // Adding a dramatic color for boss fight
    } else {
      healthEl.textContent = `${this.player.health}`;
      healthEl.style.color = '#4cc9f0';  // Restore original color
    }

    // Update other players
    for (const [clientId, data] of this.otherPlayers) {
      data.player.update();
    }
    
    // Collect power crystals
    this.powerCrystalManager.crystals = this.powerCrystalManager.crystals.filter(crystal => {
      if (this.player.isColliding(crystal)) {
        this.powerCrystalManager.collectCrystal(this.player, crystal);
        return false;
      }
      return true;
    });

    // Update guardians
    this.guardians.forEach(guardian => {
      guardian.update(this);
    });
  }

  updateCamera() {
    this.camera.x = this.player.x - this.canvas.width / 2 + this.player.width / 2;
    this.camera.y = this.player.y - this.canvas.height / 2 + this.player.height / 2;
  }

  isInBeamRange(entity) {
    const dx = entity.x - (this.player.x + this.player.width / 2);
    const dy = entity.y - (this.player.y + this.player.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < this.player.beam.range;
  }

  drawWaterEffect() {
    const normalizedY = (this.player.y / this.worldHeight);
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.worldHeight);
    
    if (this.isAbyssalRealm) {
      gradient.addColorStop(0, `rgba(20, 0, 40, ${0.3 + normalizedY * 0.4})`);
      gradient.addColorStop(0.5, `rgba(10, 0, 30, ${0.4 + normalizedY * 0.5})`);
      gradient.addColorStop(1, `rgba(5, 0, 20, ${0.6 + normalizedY * 0.7})`);
    } else {
      gradient.addColorStop(0, `rgba(0, 50, 80, ${0.1 + normalizedY * 0.3})`);
      gradient.addColorStop(0.5, `rgba(0, 20, 40, ${0.2 + normalizedY * 0.4})`);
      gradient.addColorStop(1, `rgba(0, 8, 20, ${0.4 + normalizedY * 0.6})`);
    }
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.worldWidth, this.worldHeight);

    if (this.isAbyssalRealm) {
      this.drawAbyssalParticles();
    }
  }

  drawAbyssalParticles() {
    const time = Date.now() * 0.001;
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.sin(time + i) * 100) + this.camera.x + (i * 30);
      const y = (Math.cos(time + i) * 100) + this.camera.y + (i * 30);
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, 2, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(247, 37, 133, ${0.3 + Math.sin(time + i) * 0.2})`;
      this.ctx.fill();
    }
  }

  start() {
    const gameLoop = () => {
      this.update();
      this.draw();
      requestAnimationFrame(gameLoop);
    };
    gameLoop();
  }

  handleGameOver() {
    this.gameOver = true;
    
    // Create game over screen
    const gameOverScreen = document.createElement('div');
    gameOverScreen.style.position = 'fixed';
    gameOverScreen.style.top = '0';
    gameOverScreen.style.left = '0';
    gameOverScreen.style.width = '100%';
    gameOverScreen.style.height = '100%';
    gameOverScreen.style.background = 'rgba(0, 0, 0, 0.8)';
    gameOverScreen.style.display = 'flex';
    gameOverScreen.style.flexDirection = 'column';
    gameOverScreen.style.justifyContent = 'center';
    gameOverScreen.style.alignItems = 'center';
    gameOverScreen.style.color = '#f72585';
    gameOverScreen.style.zIndex = '1000';
    gameOverScreen.innerHTML = `
      <h1>${translations[currentLanguage].gameOver}</h1>
      <p>${translations[currentLanguage].shipDestroyed}</p>
      <button id="restart-game" style="
        margin-top: 20px;
        padding: 10px 20px;
        background: #4cc9f0;
        border: none;
        color: white;
        border-radius: 10px;
        cursor: pointer;
      ">${translations[currentLanguage].restartJourney}</button>
    `;
    
    document.body.appendChild(gameOverScreen);
    
    // Add restart event listener
    document.getElementById('restart-game').addEventListener('click', () => {
      // Remove game over screen
      document.body.removeChild(gameOverScreen);
      
      // Reset game
      this.resetGame();
    });
  }

  resetGame() {
    // Reset all game states
    this.player = new Player(this.worldWidth / 2, this.worldHeight / 2);
    this.creatures = [];
    this.pollutionSamples = [];
    this.enemies = [];
    this.samplesCollected = 0;
    this.isAbyssalRealm = false;
    this.boss = null;
    this.isBossFight = false;
    this.gameOver = false;
    
    // Respawn initial entities
    this.spawnInitialEntities();
    
    // Reset HUD
    document.getElementById('samples-count').textContent = '0';
    document.getElementById('health').textContent = '100';
    
    // Reset portal button
    const button = document.getElementById('portal-button');
    button.textContent = translations[currentLanguage].portalButton;
    button.style.background = "linear-gradient(45deg, #7209b7, #560bad)";
    button.style.borderColor = "#f72585";
  }
}

const game = new Game();