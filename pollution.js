export class Pollution {
  constructor(x, y) {
    this.x = x;
    this.y = y;
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
    
    // Draw pollution particle
    ctx.fillStyle = 'rgba(114, 9, 183, 0.6)';
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const radius = i % 2 === 0 ? 10 : 5;
      ctx.lineTo(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius
      );
    }
    ctx.closePath();
    ctx.fill();
    
    // Add glow effect
    ctx.strokeStyle = 'rgba(247, 37, 133, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
  }
}