class RetroConsole {
  constructor() {
    this.powerButton = document.querySelector('.power');
    this.resetButton = document.querySelector('.reset');
    this.powerLight = document.querySelector('.power-light');
    this.screenBezel = document.querySelector('.screen-bezel');
    this.gameFrame = document.querySelector('iframe');
    this.gameLinks = document.querySelectorAll('.game-link');
    this.games = {
      'harvest-moon': 'https://www.retrogames.cc/embed/32201-harvest-moon-64-usa.html',
      'super-mario': 'https://www.retrogames.cc/embed/44121-flat-lethal-lava-land.html',
      'goldeneye': 'https://www.retrogames.cc/embed/32126-007-goldeneye-europe.html',
      'pony-kart': 'https://www.retrogames.cc/embed/45774-pony-kart-64.html'
    };
    this.currentGame = 'harvest-moon';
    this.isOn = false;

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    this.powerButton.addEventListener('click', () => this.togglePower());
    this.resetButton.addEventListener('click', () => this.reset());
    
    // Add event listeners for game links
    this.gameLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const gameId = link.dataset.game;
        this.switchGame(gameId);
        
        // Update active state of links
        this.gameLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }

  switchGame(gameId) {
    if (!this.isOn) return;
    
    this.currentGame = gameId;
    this.playSound(300, 'square', 0.2);
    
    // Quick screen flicker effect
    this.screenBezel.classList.remove('on');
    setTimeout(() => {
      this.screenBezel.classList.add('on');
      this.gameFrame.src = this.games[gameId];
    }, 300);
  }

  togglePower() {
    this.isOn = !this.isOn;
    
    if (this.isOn) {
      this.powerUp();
    } else {
      this.powerDown();
    }
  }

  powerUp() {
    this.playSound(200, 'triangle', 0.3);
    
    this.powerLight.classList.add('on');
    this.screenBezel.classList.add('on');
    this.gameFrame.src = this.games[this.currentGame];
  }

  powerDown() {
    this.playSound(100, 'triangle', 0.3);
    
    this.powerLight.classList.remove('on');
    this.screenBezel.classList.remove('on');
    this.gameFrame.src = 'about:blank';
  }

  reset() {
    if (!this.isOn) return;
    
    this.playSound(150, 'square', 0.2);
    
    this.screenBezel.classList.remove('on');
    setTimeout(() => {
      this.screenBezel.classList.add('on');
      this.gameFrame.src = this.games[this.currentGame];
    }, 500);
  }

  playSound(frequency, type = 'sine', duration = 0.1) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new RetroConsole();
});