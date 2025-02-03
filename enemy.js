export class PoisonousCoral {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 70;
    this.height = 70;
    this.spikes = [];
    this.attackCooldown = 0;
    this.attackRate = 120; // Frames between attacks
    this.isStunned = false;
    this.stunDuration = 0;
    this.pulseAngle = Math.random() * Math.PI * 2;
  }

  update(player) {
    // Update pulse animation
    this.pulseAngle += 0.02;
    
    if (this.isStunned) {
      this.stunDuration--;
      if (this.stunDuration <= 0) {
        this.isStunned = false;
      }
      return;
    }

    // Check if player is in range to trigger attack
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 200 && this.attackCooldown <= 0) {
      this.shoot(player);
      this.attackCooldown = this.attackRate;
    }

    if (this.attackCooldown > 0) {
      this.attackCooldown--;
    }

    // Update spikes
    this.spikes = this.spikes.filter(spike => {
      spike.x += spike.vx;
      spike.y += spike.vy;
      spike.lifetime--;
      return spike.lifetime > 0;
    });
  }

  shoot(player) {
    const angle = Math.atan2(player.y - this.y, player.x - this.x);
    const speed = 3;
    
    // Create 3 spikes in a spread pattern
    for (let i = -1; i <= 1; i++) {
      const spreadAngle = angle + (i * Math.PI / 8);
      this.spikes.push({
        x: this.x + this.width / 2,
        y: this.y + this.height / 2,
        vx: Math.cos(spreadAngle) * speed,
        vy: Math.sin(spreadAngle) * speed,
        lifetime: 180 // 3 seconds at 60fps
      });
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    // Pulsing effect
    const scale = 1 + Math.sin(this.pulseAngle) * 0.1;
    ctx.scale(scale, scale);

    // Draw base
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2);
    if (this.isStunned) {
      gradient.addColorStop(0, 'rgba(255, 200, 200, 0.8)');
      gradient.addColorStop(1, 'rgba(200, 100, 100, 0.6)');
    } else {
      gradient.addColorStop(0, 'rgba(255, 0, 100, 0.8)');
      gradient.addColorStop(1, 'rgba(200, 0, 50, 0.6)');
    }

    // Draw coral branches
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(
        15, -10,
        30, Math.sin(this.pulseAngle + i) * 5
      );
      ctx.lineWidth = 4;
      ctx.strokeStyle = this.isStunned ? 'rgba(255, 200, 200, 0.6)' : 'rgba(255, 0, 100, 0.6)';
      ctx.stroke();
      ctx.restore();
    }

    // Draw center
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.restore();

    // Draw spikes
    this.spikes.forEach(spike => {
      ctx.save();
      ctx.translate(spike.x, spike.y);
      ctx.rotate(Math.atan2(spike.vy, spike.vx));
      
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(10, 0);
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255, 0, 100, 0.8)';
      ctx.stroke();
      
      ctx.restore();
    });
  }

  stun() {
    this.isStunned = true;
    this.stunDuration = 180; // 3 seconds at 60fps
  }

  checkCollisionWithPlayer(player) {
    // Check spike collisions
    for (const spike of this.spikes) {
      const dx = (spike.x) - (player.x + player.width / 2);
      const dy = (spike.y) - (player.y + player.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 20) { // Collision radius
        return true;
      }
    }
    return false;
  }
}