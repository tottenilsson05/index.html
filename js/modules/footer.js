import { gsap } from 'gsap';

export class Footer {
  constructor() {
    this.init();
  }

  init() {
    this.createFooter();
    this.initializeAnimations();
    this.initializeWaveEffect();
  }

  createFooter() {
    const footer = document.createElement('footer');
    footer.className = 'main-footer';
    
    footer.innerHTML = `
      <div class="footer-wave">
        <canvas id="waveCanvas"></canvas>
      </div>
      
      <div class="footer-content">
        <div class="footer-grid">
          <div class="footer-section">
            <h4>Navigation</h4>
            <ul>
              <li><a href="#hero">Home</a></li>
              <li><a href="#projects">Projects</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h4>Connect</h4>
            <ul>
              <li><a href="https://github.com" target="_blank" rel="noopener">GitHub</a></li>
              <li><a href="https://linkedin.com" target="_blank" rel="noopener">LinkedIn</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noopener">Twitter</a></li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h4>Let's Work Together</h4>
            <p>Have a project in mind? Let's create something amazing together.</p>
            <a href="#contact" class="footer-cta">Get in Touch</a>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; ${new Date().getFullYear()} Your Name. All rights reserved.</p>
          <div class="tech-stack">
            <span>Built with:</span>
            <div class="tech-icons">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%2300ff00' d='M12 2L2 7v10l10 5 10-5V7L12 2zm0 18.5L4 17v-7l8 4 8-4v7l-8 3.5zm0-11L4 7l8-3 8 3-8 4z'/%3E%3C/svg%3E" alt="GSAP" title="GSAP">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23ff0000' d='M12 2L2 7v10l10 5 10-5V7L12 2zm0 18.5L4 17v-7l8 4 8-4v7l-8 3.5zm0-11L4 7l8-3 8 3-8 4z'/%3E%3C/svg%3E" alt="Three.js" title="Three.js">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%230000ff' d='M12 2L2 7v10l10 5 10-5V7L12 2zm0 18.5L4 17v-7l8 4 8-4v7l-8 3.5zm0-11L4 7l8-3 8 3-8 4z'/%3E%3C/svg%3E" alt="ScrollTrigger" title="ScrollTrigger">
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(footer);
  }

  initializeAnimations() {
    gsap.to('.main-footer', {
      autoAlpha: 1,
      duration: 1,
      delay: 1
    });
    
    ScrollTrigger.create({
      trigger: '.main-footer',
      start: 'top bottom-=100',
      onEnter: () => {
        gsap.from('.footer-section', {
          y: 50,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power2.out'
        });
        
        gsap.from('.footer-bottom', {
          y: 30,
          opacity: 0,
          duration: 0.8,
          delay: 0.6,
          ease: 'power2.out'
        });
      }
    });
  }

  initializeWaveEffect() {
    const canvas = document.getElementById('waveCanvas');
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = 200;
    
    const waves = {
      y: height * 0.5,
      length: 0.01,
      amplitude: 20,
      frequency: 0.01
    };
    
    let increment = waves.frequency;
    
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(0, height);
      
      for (let i = 0; i <= width; i++) {
        const y = waves.y + Math.sin(i * waves.length + increment) * waves.amplitude;
        ctx.lineTo(i, y);
      }
      
      ctx.lineTo(width, height);
      ctx.closePath();
      
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, 'var(--primary-color)');
      gradient.addColorStop(0.5, 'var(--secondary-color)');
      gradient.addColorStop(1, 'var(--primary-color)');
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      increment += waves.frequency;
      requestAnimationFrame(animate);
    };
    
    animate();
    
    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = 200;
      waves.y = height * 0.5;
    });
  }
}