class QuantumField {
  constructor() {
    this.appName = 'Nexi Labs AI';
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 100;
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.createParticles();
    this.animate();
    
    document.querySelector('.quantum-particles').appendChild(this.canvas);
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        color: `hsl(${Math.random() * 60 + 200}, 70%, 50%)`
      });
    }
  }

  animate() {
    this.ctx.fillStyle = 'rgba(10, 10, 26, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = particle.color;
      this.ctx.fill();
    });

    requestAnimationFrame(() => this.animate());
  }
}

class QuantumEntanglement {
  constructor() {
    this.states = [
      'Nexi Core Active',
      'AI Superposition',
      'Quantum Entangled',
      'Neural Tunneling',
      'Wave Function Processing'
    ];
    this.status = document.querySelector('.entanglement-status');
    this.updateStatus();
  }

  updateStatus() {
    setInterval(() => {
      const randomState = this.states[Math.floor(Math.random() * this.states.length)];
      this.status.textContent = `Quantum Entanglement Status: ${randomState}`;
    }, 3000);
  }
}

// Initialize quantum effects
document.addEventListener('DOMContentLoaded', () => {
  new QuantumField();
  new QuantumEntanglement();
});