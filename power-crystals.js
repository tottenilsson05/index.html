export class PowerCrystal {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = 20;
    this.height = 20;
    this.pulse = 0;
  }

  draw(ctx) {
    this.pulse += 0.05;
    const scale = 1 + Math.sin(this.pulse) * 0.2;
    
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.scale(scale, scale);
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width);
    switch(this.type) {
      case 'shield':
        gradient.addColorStop(0, 'rgba(76, 201, 240, 0.8)');
        gradient.addColorStop(1, 'rgba(72, 149, 239, 0.3)');
        break;
      case 'guardian':
        gradient.addColorStop(0, 'rgba(247, 37, 133, 0.8)');
        gradient.addColorStop(1, 'rgba(114, 9, 183, 0.3)');
        break;
      case 'speed':
        gradient.addColorStop(0, 'rgba(72, 219, 251, 0.8)');
        gradient.addColorStop(1, 'rgba(29, 209, 161, 0.3)');
        break;
    }
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
}

export class PowerCrystalManager {
  constructor(game) {
    this.game = game;
    this.crystals = [];
    this.inventory = [];
    this.createPowerCrystalsContainer();
  }

  createPowerCrystalsContainer() {
    const container = document.querySelector('.power-crystals-container');
    const inventoryEl = document.getElementById('power-crystals-inventory');
    
    if (!container || !inventoryEl) {
      console.error('Power crystals container not found');
      return;
    }
  }

  spawnCrystals() {
    const crystalTypes = ['shield', 'guardian', 'speed'];
    
    for (let i = 0; i < 10; i++) {
      const type = crystalTypes[Math.floor(Math.random() * crystalTypes.length)];
      this.crystals.push(new PowerCrystal(
        Math.random() * this.game.worldWidth,
        Math.random() * this.game.worldHeight,
        type
      ));
    }
  }

  collectCrystal(player, crystal) {
    // Add crystal to inventory
    this.inventory.push(crystal);
    
    // Update UI
    this.updateCrystalInventoryUI();

    // Optionally apply immediate effect
    switch(crystal.type) {
      case 'shield':
        // Activate temporary shield
        console.log('Shield activated');
        break;
      case 'guardian':
        // Summon guardian
        const guardian = this.createGuardian(player);
        this.game.guardians.push(guardian);
        break;
      case 'speed':
        // Temporary speed boost
        player.speed += 2;
        setTimeout(() => {
          player.speed -= 2;
        }, 5000); // 5 seconds boost
        break;
    }
  }

  createGuardian(player) {
    return {
      x: player.x + 100,
      y: player.y,
      width: 50,
      height: 50,
      update: (game) => {
        // Simple guardian behavior: follow player and attack enemies
        const closestEnemy = game.enemies.reduce((closest, enemy) => {
          const dx = enemy.x - this.x;
          const dy = enemy.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          return !closest || dist < closest.dist ? { enemy, dist } : closest;
        }, null);

        if (closestEnemy) {
          // Move towards enemy
          const angle = Math.atan2(
            closestEnemy.enemy.y - this.y, 
            closestEnemy.enemy.x - this.x
          );
          this.x += Math.cos(angle) * 2;
          this.y += Math.sin(angle) * 2;

          // Attack if close
          if (closestEnemy.dist < 50) {
            closestEnemy.enemy.stun();
          }
        } else {
          // Follow player if no enemy
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 100) {
            this.x += (dx / dist) * 2;
            this.y += (dy / dist) * 2;
          }
        }
      },
      draw: (ctx) => {
        ctx.save();
        ctx.fillStyle = 'rgba(247, 37, 133, 0.8)';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };
  }

  updateCrystalInventoryUI() {
    const inventoryEl = document.getElementById('power-crystals-inventory');
    if (!inventoryEl) return;

    // Clear existing crystals
    inventoryEl.innerHTML = '';

    // Create crystal elements
    this.inventory.forEach(crystal => {
      const crystalEl = document.createElement('div');
      crystalEl.className = 'power-crystal';
      crystalEl.setAttribute('data-type', crystal.type);
      crystalEl.textContent = crystal.type[0].toUpperCase(); // First letter of type
      
      // Add click event to use crystal
      crystalEl.addEventListener('click', () => {
        this.useCrystal(crystal);
      });

      inventoryEl.appendChild(crystalEl);
    });
  }

  useCrystal(crystal) {
    const player = this.game.player;
    
    // Remove crystal from inventory
    const index = this.inventory.indexOf(crystal);
    if (index > -1) {
      this.inventory.splice(index, 1);
    }

    // Apply crystal effect
    switch(crystal.type) {
      case 'shield':
        // Activate temporary invulnerability
        player.invulnerableTime = 180; // 3 seconds
        break;
      case 'guardian':
        // Summon guardian
        const guardian = this.createGuardian(player);
        this.game.guardians.push(guardian);
        break;
      case 'speed':
        // Temporary speed boost
        player.speed += 3;
        setTimeout(() => {
          player.speed -= 3;
        }, 5000); // 5 seconds boost
        break;
    }

    // Update UI
    this.updateCrystalInventoryUI();
  }
}