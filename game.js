import { Player } from './player.js';
import { Enemy, FastEnemy, BossEnemy, RansomwareEnemy, TrojanEnemy, CIHEnemy } from './enemy.js';
import { Bullet } from './player.js';
import { PowerUp } from './powerup.js';

class Game {
  constructor() {
    this.arena = document.getElementById('arena');
    this.player = new Player(this);
    this.enemies = [];
    this.bullets = [];
    this.powerUps = [];
    this.score = 0;
    this.lastSpawn = 0;
    this.lastPowerUpSpawn = 0;
    this.spawnInterval = 2000;
    this.powerUpInterval = 10000;
    this.wave = 1;
    this.gameLoop = this.gameLoop.bind(this);
    this.ransomwareRaidTimer = 0;
    this.isRansomwareRaid = false;
    this.floatingTexts = [];
    this.isPaused = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false
    };
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateWave(1);
    requestAnimationFrame(this.gameLoop);
  }

  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      const rect = this.arena.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });

    document.addEventListener('click', () => {
      if (!this.isPaused) {
        this.player.shoot(this.mouseX, this.mouseY);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        if (!this.isPaused) this.player.useSpecialAbility();
      }
      if (e.code === 'KeyE') {
        this.togglePause();
      }
      if (e.key.toLowerCase() in this.keys) {
        this.keys[e.key.toLowerCase()] = true;
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.key.toLowerCase() in this.keys) {
        this.keys[e.key.toLowerCase()] = false;
      }
    });
  }

  spawnEnemy() {
    const now = Date.now();
    if (now - this.lastSpawn > this.spawnInterval) {
      let enemy;
      const rand = Math.random();
      
      if (this.isRansomwareRaid) {
        enemy = new RansomwareEnemy(this);
      } else if (this.wave % 5 === 0) {  
        // Only spawn CIH if there are less than 2 on screen
        const cihCount = this.enemies.filter(e => e instanceof CIHEnemy).length;
        if (cihCount < 2) {
          enemy = new CIHEnemy(this);
        } else {
          enemy = new Enemy(this);
        }
      } else if (rand < 0.2) {
        enemy = new FastEnemy(this);
      } else if (rand < 0.4) {
        enemy = new TrojanEnemy(this);
      } else {
        enemy = new Enemy(this);
      }
      
      this.enemies.push(enemy);
      this.lastSpawn = now;
      this.spawnInterval = Math.max(500, this.spawnInterval - 50);
    }
  }

  spawnPowerUp() {
    const now = Date.now();
    if (now - this.lastPowerUpSpawn > this.powerUpInterval) {
      const powerUp = new PowerUp(this);
      this.powerUps.push(powerUp);
      this.lastPowerUpSpawn = now;
    }
  }

  updateScore(points) {
    this.score += points;
    document.querySelector('#score span').textContent = this.score;
    
    if (this.score >= this.wave * 1000) {
      this.startIntermission();
    }
  }

  startIntermission() {
    this.isPaused = true;
    const intermissionEl = document.createElement('div');
    intermissionEl.id = 'intermission';
    intermissionEl.innerHTML = `
      <h2>Wave ${this.wave} Complete!</h2>
      <p>Next wave in: <span>5</span></p>
    `;
    this.arena.appendChild(intermissionEl);

    let timeLeft = 5;
    const countdown = setInterval(() => {
      timeLeft--;
      intermissionEl.querySelector('span').textContent = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(countdown);
        intermissionEl.remove();
        this.isPaused = false;
        this.updateWave(this.wave + 1);
      }
    }, 1000);
  }

  updateWave(wave) {
    this.wave = wave;
    document.querySelector('#wave span').textContent = wave;
    this.spawnInterval = Math.max(500, 2000 - (wave * 100));
    
    // Start ransomware raid every 3 waves
    if (wave % 3 === 0) {
      this.startRansomwareRaid();
    }
  }

  removeEntity(entity) {
    entity.element.remove();
    if (entity instanceof Enemy) {
      this.enemies = this.enemies.filter(e => e !== entity);
    } else if (entity instanceof Bullet) {
      this.bullets = this.bullets.filter(b => b !== entity);
    } else if (entity instanceof PowerUp) {
      this.powerUps = this.powerUps.filter(p => p !== entity);
    }
  }

  checkCollisions() {
    for (const bullet of this.bullets) {
      for (const enemy of this.enemies) {
        if (this.detectCollision(bullet, enemy)) {
          enemy.takeDamage(bullet.damage);
          this.removeEntity(bullet);
          if (enemy.health <= 0) {
            this.removeEntity(enemy);
            this.updateScore(enemy.points);
          }
        }
      }
    }

    for (const enemy of this.enemies) {
      if (this.detectCollision(this.player, enemy)) {
        this.player.takeDamage(enemy.damage);
      }
    }

    for (const powerUp of this.powerUps) {
      if (this.detectCollision(this.player, powerUp)) {
        powerUp.apply(this.player);
        this.removeEntity(powerUp);
      }
    }
  }

  detectCollision(a, b) {
    const aRect = a.element.getBoundingClientRect();
    const bRect = b.element.getBoundingClientRect();
    return !(
      aRect.top + aRect.height < bRect.top ||
      aRect.top > bRect.top + bRect.height ||
      aRect.left + aRect.width < bRect.left ||
      aRect.left > bRect.left + bRect.width
    );
  }

  startRansomwareRaid() {
    this.isRansomwareRaid = true;
    this.ransomwareRaidTimer = 600; // 10 seconds at 60fps
    this.addFloatingText(400, 300, "RANSOMWARE RAID!", "#f00", 30);
  }

  addFloatingText(x, y, text, color, size = 20) {
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.color = color;
    el.style.fontSize = `${size}px`;
    this.arena.appendChild(el);
    
    this.floatingTexts.push({
      element: el,
      life: 60
    });
  }

  updateFloatingTexts() {
    this.floatingTexts = this.floatingTexts.filter(text => {
      text.life--;
      text.element.style.opacity = text.life / 60;
      text.element.style.transform = `translateY(${(60 - text.life) * -1}px)`;
      
      if (text.life <= 0) {
        text.element.remove();
        return false;
      }
      return true;
    });
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    document.getElementById('pause-menu').style.display = this.isPaused ? 'block' : 'none';
  }

  gameLoop() {
    if (!this.isPaused) {
      // Update player position based on WASD keys
      let dx = 0, dy = 0;
      if (this.keys.w) dy -= 3; 
      if (this.keys.s) dy += 3; 
      if (this.keys.a) dx -= 3; 
      if (this.keys.d) dx += 3;
      
      this.player.moveBy(dx, dy);
      
      if (this.isRansomwareRaid) {
        this.ransomwareRaidTimer--;
        if (this.ransomwareRaidTimer <= 0) {
          this.isRansomwareRaid = false;
        }
      }
      
      this.updateFloatingTexts();
      this.spawnEnemy();
      this.spawnPowerUp();
      this.checkCollisions();
      
      this.bullets.forEach(bullet => bullet.update());
      this.enemies.forEach(enemy => enemy.update());
      this.powerUps.forEach(powerUp => powerUp.update());
      this.player.update();
    }
    requestAnimationFrame(this.gameLoop);
  }
}

new Game();