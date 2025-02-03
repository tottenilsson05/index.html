export class Creature {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 50;
    this.isPolluted = Math.random() > 0.5;
    this.angle = 0;
    this.speed = 1;
    this.amplitude = 30;
    this.frequency = 0.02;
    this.baseY = y;
  }

  update() {
    this.angle += this.frequency;
    this.x -= this.speed;
    this.y = this.baseY + Math.sin(this.angle) * this.amplitude;

    if (this.x + this.width < 0) {
      this.x = 800;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    
    if (this.isPolluted) {
      this.drawPollutedCreature(ctx);
    } else {
      this.drawHealthyCreature(ctx);
    }
    
    ctx.restore();
  }

  drawHealthyCreature(ctx) {
    // Draw body
    ctx.fillStyle = '#64dfdf';
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.quadraticCurveTo(0, -15, 20, 0);
    ctx.quadraticCurveTo(0, 15, -20, 0);
    ctx.fill();
    
    // Draw fins
    ctx.fillStyle = '#48b2b2';
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-5, -10);
    ctx.lineTo(0, 0);
    ctx.fill();
    
    // Draw eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(10, -5, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPollutedCreature(ctx) {
    // Draw distorted body
    ctx.fillStyle = '#7209b7';
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.quadraticCurveTo(-5, -20, 20, 0);
    ctx.quadraticCurveTo(-5, 20, -20, 0);
    ctx.fill();
    
    // Draw spikes
    ctx.strokeStyle = '#560bad';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(
        Math.cos(i * Math.PI / 2.5) * 15,
        Math.sin(i * Math.PI / 2.5) * 15
      );
      ctx.stroke();
    }
    
    // Draw glowing eye
    ctx.fillStyle = '#f72585';
    ctx.beginPath();
    ctx.arc(10, -5, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  heal() {
    this.isPolluted = false;
  }
}