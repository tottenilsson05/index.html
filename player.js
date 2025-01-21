import { Enemy, CIHEnemy, TrojanEnemy, BossEnemy } from './enemy.js';

export class Player {
  constructor(game) {
    this.game = game;
    this.x = 400;
    this.y = 300;
    this.health = 100;
    this.maxHealth = 100;
    this.element = this.createPlayerElement();
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
    game.arena.appendChild(this.element);
    
    this.powerUps = {
      rapidFire: 0,
      spreadShot: 0,
      shield: 0
    };
    
    this.specialAbilityCooldown = 0;
    this.speedX = 0;
    this.speedY = 0;
  }

  createPlayerElement() {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    el.setAttribute("viewBox", "0 0 100 100");
    el.setAttribute("class", "player");
    
    el.innerHTML = `
      <circle cx="50" cy="50" r="40" fill="none" stroke="#0f0" stroke-width="4"/>
      <circle cx="35" cy="40" r="5" fill="#0f0"/>
      <circle cx="65" cy="40" r="5" fill="#0f0"/>
      <rect x="10" y="85" width="80" height="5" fill="#400" />
      <rect x="10" y="85" width="80" height="5" fill="#0f0" class="health-fill" />
    `;
    
    return el;
  }

  move(x, y) {
    this.x = x;
    this.y = y;
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
  }

  moveBy(dx, dy) {
    const newX = Math.max(20, Math.min(780, this.x + dx));
    const newY = Math.max(20, Math.min(580, this.y + dy));
    this.move(newX, newY);
  }

  takeDamage(amount) {
    if (this.powerUps.shield > 0) return;
    
    this.health = Math.max(0, this.health - amount);
    document.querySelector('#health span').textContent = this.health;
    const healthPercent = (this.health / this.maxHealth) * 100;
    const healthFill = this.element.querySelector('.health-fill');
    healthFill.setAttribute('width', `${(healthPercent * 80) / 100}`);
    
    this.element.classList.add('hit');
    setTimeout(() => this.element.classList.remove('hit'), 200);
    
    if (this.health <= 0) {
      alert('Game Over! Score: ' + this.game.score);
      location.reload();
    }
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
    document.querySelector('#health span').textContent = this.health;
    const healthPercent = (this.health / this.maxHealth) * 100;
    const healthFill = this.element.querySelector('.health-fill');
    healthFill.setAttribute('width', `${(healthPercent * 80) / 100}`);
  }

  shoot(targetX, targetY) {
    if (this.powerUps.spreadShot > 0) {
      for (let angle = -30; angle <= 30; angle += 30) {
        this.createBullet(targetX, targetY, angle);
      }
    } else {
      this.createBullet(targetX, targetY, 0);
    }
  }

  createBullet(targetX, targetY, angleOffset = 0) {
    const angle = Math.atan2(targetY - this.y, targetX - this.x) + (angleOffset * Math.PI / 180);
    const bullet = new Bullet(
      this.game,
      this.x,
      this.y,
      angle,
      this.powerUps.rapidFire > 0 ? 2 : 1
    );
    this.game.bullets.push(bullet);
  }

  useSpecialAbility() {
    if (this.specialAbilityCooldown > 0) return;
    
    const shockwave = document.createElement('div');
    shockwave.className = 'shockwave';
    shockwave.style.left = `${this.x}px`;
    shockwave.style.top = `${this.y}px`;
    this.game.arena.appendChild(shockwave);
    
    this.game.enemies.forEach(enemy => {
      if (enemy instanceof Enemy) {  // Ensure it's an enemy
        const dx = enemy.x - this.x;
        const dy = enemy.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          if (!(enemy instanceof Enemy && enemy.isRunningAway)) {  // Don't damage friendly programs
            enemy.takeDamage(5);
            // Add stun effect
            enemy.speed *= 0.5;
            setTimeout(() => {
              if (enemy && enemy.speed) {  // Check if enemy still exists
                enemy.speed *= 2;  // Restore original speed
              }
            }, 2000);  // 2 second stun
          }
        }
      }
    });
    
    setTimeout(() => shockwave.remove(), 1000);
    this.specialAbilityCooldown = 300;
  }

  update() {
    if (this.specialAbilityCooldown > 0) {
      this.specialAbilityCooldown--;
    }
    
    Object.keys(this.powerUps).forEach(key => {
      if (this.powerUps[key] > 0) {
        this.powerUps[key]--;
      }
    });
    
    if (this.powerUps.shield > 0) {
      this.element.classList.add('shield');
    } else {
      this.element.classList.remove('shield');
    }
  }
}

export class Bullet {
  constructor(game, x, y, angle, damage = 1) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.speed = 7; 
    this.damage = damage;
    this.angle = angle;
    
    this.element = document.createElement('div');
    this.element.className = 'bullet';
    if (damage > 1) this.element.classList.add('powered');
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
    game.arena.appendChild(this.element);
  }

  update() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;

    if (this.y < 0 || this.y > 600 || this.x < 0 || this.x > 800) {
      this.game.removeEntity(this);
    }
  }
}