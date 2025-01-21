export class Enemy {
  constructor(game) {
    this.game = game;
    this.x = Math.random() * 800;
    this.y = Math.random() < 0.5 ? -30 : 630;
    this.health = 3;
    this.maxHealth = this.health;
    this.speed = 1;
    this.damage = 10;
    this.points = 100;
    this.element = this.createEnemyElement();
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
    game.arena.appendChild(this.element);
    this.isRunningAway = false;
    this.healCooldown = 0;
    this.healthBar = this.createHealthBar();
    this.element.appendChild(this.healthBar);
  }

  createEnemyElement() {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    el.setAttribute("viewBox", "0 0 100 100");
    el.setAttribute("class", "enemy program-npc");
    
    el.innerHTML = `
      <circle cx="50" cy="50" r="40" stroke-width="4"/>
      <circle cx="35" cy="40" r="5"/>
      <circle cx="65" cy="40" r="5"/>
    `;
    
    return el;
  }

  createHealthBar() {
    const healthBar = document.createElementNS("http://www.w3.org/2000/svg", "g");
    healthBar.innerHTML = `
      <rect x="10" y="80" width="80" height="10" fill="#400" rx="2" />
      <rect x="10" y="80" width="80" height="10" fill="#0f0" class="health-fill" rx="2" />
    `;
    return healthBar;
  }

  update() {
    if (this.isRunningAway) {
      // Run away from player
      const dx = this.game.player.x - this.x;
      const dy = this.game.player.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      this.x -= (dx / dist) * this.speed * 1.5;
      this.y -= (dy / dist) * this.speed * 1.5;
    } else {
      const dx = this.game.player.x - this.x;
      const dy = this.game.player.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 100 && this.healCooldown <= 0) {
        this.game.player.heal(10);
        this.healCooldown = 120; // 2 second cooldown
        this.isRunningAway = true;
        setTimeout(() => {
          this.game.removeEntity(this);
        }, 3000);
      }
      
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
    }
    
    if (this.healCooldown > 0) this.healCooldown--;
    
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }

  takeDamage(amount) {
    this.health -= amount;
    const healthPercent = (this.health / this.maxHealth) * 100;
    const healthFill = this.healthBar.querySelector('.health-fill');
    healthFill.setAttribute('width', `${(healthPercent * 80) / 100}`);
    this.element.classList.add('hit');
    setTimeout(() => this.element.classList.remove('hit'), 200);
    
    if (this instanceof Enemy && !(this instanceof CIHEnemy || this instanceof TrojanEnemy || this instanceof BossEnemy || this instanceof RansomwareEnemy || this instanceof FastEnemy)) {
      this.isRunningAway = true;
      // If the program dies, penalize the player's score
      if (this.health <= 0) {
        this.game.updateScore(-200); // Subtract 200 points for killing a friendly program
        this.game.addFloatingText(this.x, this.y, "-200 Points! Don't attack programs!", "#f00");
      }
    }
  }
}

export class FastEnemy extends Enemy {
  constructor(game) {
    super(game);
    this.health = 2;
    this.speed = 1.5; 
    this.damage = 5;
    this.points = 150;
    this.speedX = 0;
    this.speedY = 0;
    this.friction = 0.98; 
    this.element.classList.remove('program-npc');
    this.element.classList.add('virus', 'fast-enemy');
  }

  createEnemyElement() {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    el.setAttribute("viewBox", "0 0 100 100");
    el.setAttribute("class", "enemy virus");
    
    el.innerHTML = `
      <path d="M50,10 L90,90 L10,90 Z" stroke-width="4"/>
      <circle cx="50" cy="50" r="10"/>
    `;
    
    return el;
  }

  update() {
    const dx = this.game.player.x - this.x;
    const dy = this.game.player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    this.speedX += (dx / dist) * 0.3;
    this.speedY += (dy / dist) * 0.3;
    
    const currentSpeed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
    if (currentSpeed > this.speed) {
      this.speedX = (this.speedX / currentSpeed) * this.speed;
      this.speedY = (this.speedY / currentSpeed) * this.speed;
    }
    
    this.speedX *= this.friction;
    this.speedY *= this.friction;
    
    this.x += this.speedX;
    this.y += this.speedY;
    
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }
}

export class CIHEnemy extends Enemy {
  constructor(game) {
    super(game);
    this.health = 20;  
    this.maxHealth = 20;
    this.speed = 0.5;
    this.damage = 25;
    this.points = 1000;
    this.lastShot = 0;
    this.element.classList.remove('program-npc');
    this.element.classList.add('cih-enemy');
  }

  createEnemyElement() {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    el.setAttribute("viewBox", "0 0 100 100");
    el.setAttribute("class", "enemy cih-enemy");
    
    el.innerHTML = `
      <circle cx="50" cy="50" r="45" stroke="#f00" stroke-width="4" fill="none"/>
      <line x1="30" y1="50" x2="70" y2="50" stroke="#f00" stroke-width="4"/>
    `;
    
    return el;
  }

  update() {
    super.update();
    
    const now = Date.now();
    if (now - this.lastShot > 2000) { // Shoot every 2 seconds
      this.shootRock();
      this.lastShot = now;
    }
  }

  shootRock() {
    const rock = document.createElement('div');
    rock.className = 'rock';
    rock.style.left = `${this.x}px`;
    rock.style.top = `${this.y}px`;
    this.game.arena.appendChild(rock);

    const angle = Math.atan2(this.game.player.y - this.y, this.game.player.x - this.x);
    let rockX = this.x;
    let rockY = this.y;
    const speed = 2;

    const moveRock = () => {
      rockX += Math.cos(angle) * speed;
      rockY += Math.sin(angle) * speed;
      rock.style.left = `${rockX}px`;
      rock.style.top = `${rockY}px`;

      if (rockX < 0 || rockX > 800 || rockY < 0 || rockY > 600) {
        this.explodeRock(rockX, rockY);
        rock.remove();
      } else {
        requestAnimationFrame(moveRock);
      }
    };

    moveRock();
  }

  explodeRock(x, y) {
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.style.left = `${x}px`;
    explosion.style.top = `${y}px`;
    this.game.arena.appendChild(explosion);

    // Damage player if in explosion radius
    const dx = this.game.player.x - x;
    const dy = this.game.player.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 100) {
      this.game.player.takeDamage(15);
    }

    setTimeout(() => explosion.remove(), 500);
  }
}

export class RansomwareEnemy extends Enemy {
  constructor(game) {
    super(game);
    this.health = 4;
    this.speed = 1.5;
    this.damage = 15;
    this.points = 200;
    this.element.classList.remove('program-npc');
    this.element.classList.add('ransomware', 'ransomware-enemy');
  }

  createEnemyElement() {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    el.setAttribute("viewBox", "0 0 100 100");
    el.setAttribute("class", "enemy ransomware");
    
    el.innerHTML = `
      <circle cx="50" cy="30" r="20" stroke-width="4"/>
      <path d="M35,25 L65,35 M65,25 L35,35" stroke="currentColor" stroke-width="4"/>
      <rect x="30" y="30" width="40" height="60" stroke-width="4"/>
    `;
    
    return el;
  }
}

export class TrojanEnemy extends Enemy {
  constructor(game) {
    super(game);
    this.health = 5;
    this.speed = 1;
    this.damage = 15;
    this.points = 250;
    this.lungeTimer = 0;
    this.isLunging = false;
    this.element.classList.remove('program-npc');
    this.element.classList.add('malware');
  }

  createEnemyElement() {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    el.setAttribute("viewBox", "0 0 100 100");
    el.setAttribute("class", "enemy malware");
    
    el.innerHTML = `
      <rect x="20" y="20" width="60" height="60" stroke-width="4"/>
      <polygon points="30,40 70,40 50,70" fill="#00f"/>
    `;
    
    return el;
  }

  takeDamage(amount) {
    this.health -= amount;
    this.element.classList.add('hit');
    setTimeout(() => this.element.classList.remove('hit'), 200);
  }

  update() {
    if (!this.isLunging) {
      this.lungeTimer++;
      if (this.lungeTimer >= 1200) { // 20 seconds at 60fps
        this.isLunging = true;
        this.speed = 4;
      }
      super.update();
    } else {
      const dx = this.game.player.x - this.x;
      const dy = this.game.player.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
      this.element.style.left = `${this.x}px`;
      this.element.style.top = `${this.y}px`;
    }
  }
}

export class BossEnemy extends Enemy {
  constructor(game) {
    super(game);
    this.health = 20;
    this.speed = 0.5;
    this.damage = 20;
    this.points = 500;
    this.element.classList.remove('program-npc');
    this.element.classList.add('malware', 'boss-enemy');
  }

  createEnemyElement() {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    el.setAttribute("viewBox", "0 0 100 100");
    el.setAttribute("class", "enemy malware");
    
    el.innerHTML = `
      <rect x="10" y="10" width="80" height="80" stroke-width="4"/>
      <polygon points="30,30 70,30 50,70" fill="#00f"/>
    `;
    
    return el;
  }

  // Override takeDamage to prevent running away
  takeDamage(amount) {
    this.health -= amount;
    this.element.classList.add('hit');
    setTimeout(() => this.element.classList.remove('hit'), 200);
  }
}