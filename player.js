export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 60;
    this.height = 40;
    this.speed = 5;
    this.velocity = { x: 0, y: 0 };
    this.maxHealth = 150; // Increased max health cap
    this.health = 100;
    this.invulnerableTime = 0;
    this.emotionalState = 1.0; 
    this.glowPulse = 0;
    
    this.controls = {
      up: false,
      down: false,
      left: false,
      right: false,
      dash: false,
      beam: false
    };

    // Dash properties
    this.isDashing = false;
    this.dashCooldown = 0;
    this.dashDuration = 15; // Frames of dash
    this.dashCooldownTime = 60; // Cooldown between dashes
    this.dashSpeed = 15; // Speed multiplier during dash

    // Beam ability properties
    this.beam = {
      isActive: false,
      cooldown: 0,
      maxCooldown: 300, // 5 seconds at 60fps
      duration: 60, // 5 second beam duration
      range: 300,
      damage: 1000000
    };

    this.isExploding = false;
    this.explosionProgress = 0;
    this.explosionDuration = 60; // 1 second at 60fps
    this.username = null;
    this.userId = null; 
  }

  handleInput(event, isKeyDown) {
    const keyActions = {
      'ArrowUp': 'up',
      'ArrowDown': 'down',
      'ArrowLeft': 'left',
      'ArrowRight': 'right',
      'w': 'up',
      's': 'down',
      'a': 'left',
      'd': 'right',
      ' ': 'dash', // Spacebar for dash
      'q': 'beam' // Q key for beam ability
    };

    const action = keyActions[event.key];
    if (action) {
      this.controls[action] = isKeyDown;
    }
  }

  update() {
    // Dash mechanics
    if (this.controls.dash && this.dashCooldown <= 0) {
      this.isDashing = true;
      this.dashDuration = 15;
      this.dashCooldown = this.dashCooldownTime;
    }

    // Dash logic
    if (this.isDashing) {
      // Determine dash direction based on current movement
      const dashMultiplierX = this.velocity.x !== 0 ? this.velocity.x / Math.abs(this.velocity.x) : 0;
      const dashMultiplierY = this.velocity.y !== 0 ? this.velocity.y / Math.abs(this.velocity.y) : 0;

      this.x += this.speed * this.dashSpeed * dashMultiplierX;
      this.y += this.speed * this.dashSpeed * dashMultiplierY;

      this.dashDuration--;
      if (this.dashDuration <= 0) {
        this.isDashing = false;
      }
    } else {
      // Normal movement
      this.velocity.x = (this.controls.right - this.controls.left) * this.speed;
      this.velocity.y = (this.controls.down - this.controls.up) * this.speed;

      this.x += this.velocity.x;
      this.y += this.velocity.y;
    }

    // Cooldown management
    if (this.dashCooldown > 0) {
      this.dashCooldown--;
    }

    // Beam ability logic
    if (this.controls.beam && this.beam.cooldown <= 0) {
      this.beam.isActive = true;
      this.beam.cooldown = this.beam.maxCooldown;
      this.beam.duration = 60;
    }

    // Manage beam state
    if (this.beam.isActive) {
      this.beam.duration--;
      if (this.beam.duration <= 0) {
        this.beam.isActive = false;
      }
    }

    // Cooldown management
    if (this.beam.cooldown > 0) {
      this.beam.cooldown--;
    }

    // Update glow effect
    this.glowPulse += 0.03;

    if (this.invulnerableTime > 0) {
      this.invulnerableTime--;
    }

    this.emotionalState = Math.max(0.5, Math.min(1.0, this.health / this.maxHealth));

    // Handle player death explosion
    if (this.health <= 0 && !this.isExploding) {
      this.isExploding = true;
      this.explosionProgress = 0;
    }

    if (this.isExploding) {
      this.explosionProgress++;
      if (this.explosionProgress >= this.explosionDuration) {
        // Trigger game over or reset
        this.triggerGameOver();
      }
    }
  }

  draw(ctx) {
    if (this.isExploding) {
      this.drawExplosion(ctx);
      return;
    }

    if (this.invulnerableTime > 0 && Math.floor(this.invulnerableTime / 5) % 2 === 0) {
      return;
    }
    
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    
    // Dash visual effect
    const dashIntensity = this.isDashing ? 0.5 : 0;
    
    // Create gradient for the semi-translucent hull
    const glowIntensity = 0.3 + Math.sin(this.glowPulse) * 0.2;
    const hullGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2);
    hullGradient.addColorStop(0, `rgba(76, 201, 240, ${(0.6 + dashIntensity) * this.emotionalState})`);
    hullGradient.addColorStop(1, `rgba(72, 149, 239, ${(0.3 + dashIntensity) * this.emotionalState})`);

    // Draw the organic submarine body
    ctx.beginPath();
    ctx.moveTo(-this.width / 2, 0);
    ctx.bezierCurveTo(
      -this.width / 4, -this.height / 2,
      this.width / 4, -this.height / 2,
      this.width / 2, 0
    );
    ctx.bezierCurveTo(
      this.width / 4, this.height / 2,
      -this.width / 4, this.height / 2,
      -this.width / 2, 0
    );
    ctx.fillStyle = hullGradient;
    ctx.fill();

    // Draw bioluminescent details
    this.drawBioluminescence(ctx);
    
    // Draw Maris in the cockpit
    this.drawMaris(ctx);

    // Draw organic fins
    this.drawFins(ctx);
    
    ctx.restore();

    // Draw username above player ship if available
    if (this.username) {
      ctx.save();
      ctx.font = '14px Arial';
      ctx.fillStyle = '#4cc9f0';
      ctx.textAlign = 'center';
      const textY = this.y - 20;
      ctx.fillText(this.username, this.x + this.width/2, textY);
      ctx.restore();
    }

    // Draw dash cooldown indicator
    this.drawDashIndicator(ctx);

    // Draw beam after drawing the player
    this.drawBeam(ctx);
  }

  drawDashIndicator(ctx) {
    const cooldownPercentage = 1 - (this.dashCooldown / this.dashCooldownTime);
    
    ctx.save();
    ctx.fillStyle = `rgba(76, 201, 240, ${cooldownPercentage})`;
    ctx.fillRect(
      this.x, 
      this.y + this.height + 10, 
      this.width * cooldownPercentage, 
      5
    );
    ctx.restore();
  }

  drawBioluminescence(ctx) {
    const glowColor = `rgba(157, 214, 255, ${0.5 + Math.sin(this.glowPulse) * 0.2})`;
    
    // Draw glowing patterns
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 2;
    
    // Upper pattern
    ctx.beginPath();
    ctx.moveTo(-this.width / 3, -this.height / 3);
    ctx.quadraticCurveTo(0, -this.height / 2, this.width / 3, -this.height / 3);
    ctx.stroke();
    
    // Lower pattern
    ctx.beginPath();
    ctx.moveTo(-this.width / 3, this.height / 3);
    ctx.quadraticCurveTo(0, this.height / 2, this.width / 3, this.height / 3);
    ctx.stroke();
  }

  drawMaris(ctx) {
    // Draw cockpit window
    ctx.fillStyle = `rgba(184, 227, 255, ${0.3 + Math.sin(this.glowPulse) * 0.1})`;
    ctx.beginPath();
    ctx.ellipse(-5, 0, 15, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw Maris's silhouette
    ctx.fillStyle = `rgba(0, 150, 199, ${0.8 * this.emotionalState})`;
    ctx.beginPath();
    ctx.ellipse(-5, 0, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw flowing hair
    const hairColor = `rgba(0, 191, 255, ${0.6 * this.emotionalState})`;
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = hairColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-8, -2);
      ctx.quadraticCurveTo(
        -15 - Math.sin(this.glowPulse + i) * 3,
        i * 2 - 5,
        -20 - Math.sin(this.glowPulse + i) * 5,
        i * 2 - 3
      );
      ctx.stroke();
    }
  }

  drawFins(ctx) {
    const finColor = `rgba(76, 201, 240, ${0.4 * this.emotionalState})`;
    ctx.fillStyle = finColor;
    
    // Top fin
    ctx.beginPath();
    ctx.moveTo(-5, -this.height / 2);
    ctx.quadraticCurveTo(
      0, -this.height * 0.8,
      5, -this.height / 2
    );
    ctx.fill();
    
    // Bottom fin
    ctx.beginPath();
    ctx.moveTo(-5, this.height / 2);
    ctx.quadraticCurveTo(
      0, this.height * 0.8,
      5, this.height / 2
    );
    ctx.fill();
  }

  drawBeam(ctx) {
    if (!this.beam.isActive) return;

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    
    // Beam visual effect
    const gradient = ctx.createLinearGradient(0, 0, this.beam.range, 0);
    gradient.addColorStop(0, `rgba(76, 201, 240, ${this.emotionalState})`);
    gradient.addColorStop(1, `rgba(76, 201, 240, 0)`);
    
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(this.beam.range, -10);
    ctx.lineTo(this.beam.range, 10);
    ctx.lineTo(0, 10);
    ctx.closePath();
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.restore();
  }

  drawExplosion(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    
    // Explosion animation
    const progress = this.explosionProgress / this.explosionDuration;
    const maxRadius = this.width * 3;
    const currentRadius = progress * maxRadius;
    
    // Create radial gradient for explosion
    const gradient = ctx.createRadialGradient(
      0, 0, 0, 
      0, 0, currentRadius
    );
    gradient.addColorStop(0, `rgba(255, 100, 0, ${1 - progress})`);
    gradient.addColorStop(0.5, `rgba(255, 50, 0, ${0.8 * (1 - progress)})`);
    gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
    
    ctx.beginPath();
    ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.restore();
  }

  triggerGameOver() {
    // Dispatch a custom event to handle game over in the Game class
    const gameOverEvent = new Event('gameOver');
    window.dispatchEvent(gameOverEvent);
  }

  takeDamage(amount) {
    if (this.invulnerableTime <= 0) {
      this.health = Math.max(0, this.health - amount);
      this.invulnerableTime = 60; // 1 second invulnerability
      this.emotionalState = Math.max(0.5, Math.min(1.0, this.health / this.maxHealth));
    }
  }

  isColliding(entity) {
    return (this.x < entity.x + entity.width &&
            this.x + this.width > entity.x &&
            this.y < entity.y + entity.height &&
            this.y + this.height > entity.y);
  }
}