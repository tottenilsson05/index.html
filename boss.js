export class AbyssalDevourer {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 200;
    this.height = 120;
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.phase = 1;
    this.angle = 0;
    this.circleRadius = 300;
    this.circleCenter = { x, y };
    this.baseSpeed = 5;
    this.speed = 5;
    this.bubbles = [];
    this.minions = [];
    this.pollutionCloud = [];
    this.purificationLevel = 0;
    this.isStunned = false;
    this.stunDuration = 0;
    this.attackCooldown = 0;
    // Visual effects
    this.pulseAngle = 0;
    this.corals = this.generateCorals();
    // New phase timing mechanism
    this.phaseTimer = 0;
    this.phaseDuration = 20 * 60; // 20 seconds at 60fps
    this.totalPhases = 3;
    this.currentPhaseIndex = 0;
    this.phaseCompleted = false;
    this.isDefeated = false;  // New flag to indicate defeat
    this.isInFinalPhase = false;
  }

  generateCorals() {
    const corals = [];
    const coralCount = 8;
    for (let i = 0; i < coralCount; i++) {
      corals.push({
        angle: (i * Math.PI * 2) / coralCount,
        length: 30 + Math.random() * 20,
        width: 8 + Math.random() * 4
      });
    }
    return corals;
  }

  update(player) {
    // If defeated in phase 3, stop all actions
    if (this.isDefeated || this.isInFinalPhase) {
      return;
    }

    this.pulseAngle += 0.05;
    
    if (this.isStunned) {
      this.stunDuration--;
      if (this.stunDuration <= 0) {
        this.isStunned = false;
      }
      return;
    }

    // Phase timing logic
    this.phaseTimer++;
    if (this.phaseTimer >= this.phaseDuration) {
      this.advancePhase();
      this.phaseTimer = 0;
    }

    // More aggressive player pursuit across all phases
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    this.speed = 5; // Always set speed to 5
    
    if (dist > 50) {  // Add a small buffer to prevent constant jittering
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
    }

    // Attack patterns
    if (this.attackCooldown <= 0) {
      switch (this.currentPhaseIndex) {
        case 0:
          this.createPollutionBubbles();
          this.attackCooldown = 120;
          break;
        case 1:
          this.spawnMinions();
          this.createShockwave();
          this.attackCooldown = 180;
          break;
        case 2:
          this.createPollutionCloud();
          this.attackCooldown = 90;
          break;
      }
    }

    this.attackCooldown--;

    // Update projectiles and effects
    this.updateBubbles();
    this.updateMinions(player);
    this.updatePollutionCloud();

    // If all phases are complete, trigger purification
    if (this.currentPhaseIndex >= this.totalPhases) {
      this.purify(0.05); // Gradually purify
    }

    // When reaching phase 3 and completing the phase, trigger final phase
    if (this.currentPhaseIndex >= 3 && this.phaseTimer >= this.phaseDuration) {
      this.isInFinalPhase = true;
      this.speed = 0; // Stop moving
      this.attackCooldown = Infinity; // Stop attacking
      this.bubbles = []; // Clear existing bubbles
      this.minions = []; // Clear minions
      this.pollutionCloud = []; // Clear pollution cloud
    }
  }

  createPollutionBubbles() {
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5;
      this.bubbles.push({
        x: this.x + Math.cos(angle) * 50,
        y: this.y + Math.sin(angle) * 50,
        vx: Math.cos(angle) * 3,
        vy: Math.sin(angle) * 3,
        radius: 20,
        lifetime: 180
      });
    }
  }

  createShockwave() {
    const shockwaveSpeed = 5;
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      this.bubbles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * shockwaveSpeed,
        vy: Math.sin(angle) * shockwaveSpeed,
        radius: 30,
        lifetime: 120,
        isShockwave: true
      });
    }
  }

  spawnMinions() {
    for (let i = 0; i < 3; i++) {
      const angle = (Math.PI * 2 * i) / 3;
      this.minions.push({
        x: this.x + Math.cos(angle) * 100,
        y: this.y + Math.sin(angle) * 100,
        angle: Math.random() * Math.PI * 2,
        speed: 2 + Math.random(),
        size: 30
      });
    }
  }

  createPollutionCloud() {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 50 + Math.random() * 100;
      this.pollutionCloud.push({
        x: this.x + Math.cos(angle) * distance,
        y: this.y + Math.sin(angle) * distance,
        opacity: 0.8,
        radius: 30 + Math.random() * 20,
        lifetime: 240
      });
    }
  }

  updateBubbles() {
    this.bubbles = this.bubbles.filter(bubble => {
      bubble.x += bubble.vx;
      bubble.y += bubble.vy;
      bubble.lifetime--;
      return bubble.lifetime > 0;
    });
  }

  updateMinions(player) {
    this.minions = this.minions.filter(minion => {
      const dx = player.x - minion.x;
      const dy = player.y - minion.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 10) {
        minion.x += (dx / dist) * minion.speed;
        minion.y += (dy / dist) * minion.speed;
      }
      
      minion.angle += 0.1;
      return dist > 5;
    });
  }

  updatePollutionCloud() {
    this.pollutionCloud = this.pollutionCloud.filter(cloud => {
      cloud.lifetime--;
      cloud.opacity = (cloud.lifetime / 240) * 0.8;
      return cloud.lifetime > 0;
    });
  }

  advancePhase() {
    this.currentPhaseIndex++;
    
    // Reset certain behaviors when changing phase
    this.bubbles = [];
    this.minions = [];
    this.pollutionCloud = [];

    // Always set speed to 5 when changing phases
    this.speed = 5;
    this.baseSpeed = 5;

    switch (this.currentPhaseIndex) {
      case 1:
        this.circleRadius = 300;
        break;
      case 2:
        this.circleRadius = 250;
        break;
      case 3:
        this.circleRadius = 200;
        break;
    }
  }

  draw(ctx) {
    if (this.isDefeated) {
      // Draw a purification effect when defeated
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = 'rgba(76, 201, 240, 0.5)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // Draw pollution cloud effect
    this.pollutionCloud.forEach(cloud => {
      const gradient = ctx.createRadialGradient(
        cloud.x, cloud.y, 0,
        cloud.x, cloud.y, cloud.radius
      );
      gradient.addColorStop(0, `rgba(114, 9, 183, ${cloud.opacity})`);
      gradient.addColorStop(1, `rgba(114, 9, 183, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw main body
    ctx.save();
    ctx.translate(this.x, this.y);
    
    const scale = 1 + Math.sin(this.pulseAngle) * 0.1;
    ctx.scale(scale, scale);

    // Draw shark body
    if (this.isInFinalPhase) {
      const bodyGradient = ctx.createLinearGradient(-this.width/2, 0, this.width/2, 0);
      bodyGradient.addColorStop(0, 'rgba(76, 201, 240, 0.8)');
      bodyGradient.addColorStop(1, 'rgba(72, 149, 239, 0.6)');
      
      ctx.fillStyle = bodyGradient;
    } else {
      const bodyGradient = ctx.createLinearGradient(-this.width/2, 0, this.width/2, 0);
      bodyGradient.addColorStop(0, `rgba(114, 9, 183, ${0.8 - this.purificationLevel * 0.3})`);
      bodyGradient.addColorStop(1, `rgba(86, 11, 173, ${0.8 - this.purificationLevel * 0.3})`);
      
      ctx.fillStyle = bodyGradient;
    }
    
    ctx.beginPath();
    ctx.moveTo(-this.width/2, 0);
    ctx.quadraticCurveTo(
      0, -this.height/2,
      this.width/2, 0
    );
    ctx.quadraticCurveTo(
      0, this.height/2,
      -this.width/2, 0
    );
    ctx.fill();

    // Draw coral spikes
    this.corals.forEach(coral => {
      ctx.save();
      ctx.rotate(coral.angle + Math.sin(this.pulseAngle) * 0.2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(coral.length, 0);
      ctx.lineWidth = coral.width;
      ctx.strokeStyle = `rgba(247, 37, 133, ${0.8 - this.purificationLevel * 0.3})`;
      ctx.stroke();
      ctx.restore();
    });

    // Draw eye
    const eyeGlow = Math.sin(this.pulseAngle) * 0.3 + 0.7;
    ctx.beginPath();
    ctx.arc(this.width/4, -this.height/4, 15, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(247, 37, 133, ${eyeGlow})`;
    ctx.fill();

    ctx.restore();

    // Draw bubbles
    this.bubbles.forEach(bubble => {
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      if (bubble.isShockwave) {
        ctx.strokeStyle = `rgba(247, 37, 133, ${bubble.lifetime / 120})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      } else {
        ctx.fillStyle = `rgba(114, 9, 183, ${bubble.lifetime / 180})`;
        ctx.fill();
      }
    });

    // Draw minions
    this.minions.forEach(minion => {
      ctx.save();
      ctx.translate(minion.x, minion.y);
      ctx.rotate(minion.angle);
      
      ctx.beginPath();
      ctx.moveTo(-minion.size/2, 0);
      ctx.lineTo(0, -minion.size/2);
      ctx.lineTo(minion.size/2, 0);
      ctx.lineTo(0, minion.size/2);
      ctx.closePath();
      ctx.fillStyle = 'rgba(114, 9, 183, 0.8)';
      ctx.fill();
      
      ctx.restore();
    });

    // Add health bar
    const healthBarWidth = this.width * 1.5;
    const healthBarHeight = 10;
    const healthPercentage = this.health / this.maxHealth;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(
      this.x - healthBarWidth/2,
      this.y - this.height/2 - 30,
      healthBarWidth,
      healthBarHeight
    );
    
    ctx.fillStyle = `rgba(247, 37, 133, ${0.8 - this.purificationLevel * 0.3})`;
    ctx.fillRect(
      this.x - healthBarWidth/2,
      this.y - this.height/2 - 30,
      healthBarWidth * healthPercentage,
      healthBarHeight
    );

    // Add phase indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '16px Arial';
    ctx.fillText(`Fase: ${this.currentPhaseIndex}`, 
      this.x - this.width/2, 
      this.y - this.height/2 - 50
    );

    // Add phase timer indicator
    const timerPercentage = (this.phaseDuration - this.phaseTimer) / this.phaseDuration;
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillRect(
      this.x - this.width/2, 
      this.y - this.height/2 - 40, 
      this.width * timerPercentage, 
      5
    );
  }

  takeDamage(amount) {
    if (this.isInFinalPhase) {
      return; // No damage in final phase
    }
    if (!this.isStunned) {
      this.health = Math.max(0, this.health - amount);
      if (this.health === 0) {
        // Boss defeated logic here
        this.isStunned = true;
        this.stunDuration = Infinity; // Keep stunned when defeated
      }
    }
  }

  purify(amount) {
    this.purificationLevel = Math.min(1, this.purificationLevel + amount);
    if (this.purificationLevel >= 1) {
      this.isStunned = true;
      this.stunDuration = 180;
    }
  }

  checkCollisions(player) {
    if (this.isDefeated) {
      return false;
    }

    // Check bubble collisions
    for (const bubble of this.bubbles) {
      const dx = player.x + player.width/2 - bubble.x;
      const dy = player.y + player.height/2 - bubble.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < bubble.radius + 20) {
        if (bubble.isShockwave) {
          // Push player away
          player.x += dx / distance * 10;
          player.y += dy / distance * 10;
        }
        return true;
      }
    }

    // Check minion collisions
    for (const minion of this.minions) {
      const dx = player.x + player.width/2 - minion.x;
      const dy = player.y + player.height/2 - minion.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minion.size + 20) {
        return true;
      }
    }

    // Check body collision
    const dx = player.x + player.width/2 - this.x;
    const dy = player.y + player.height/2 - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < this.width/2;
  }
}