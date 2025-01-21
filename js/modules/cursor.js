import { gsap } from 'gsap';

export class CursorSystem {
  constructor() {
    this.cursor = document.querySelector('.cursor');
    this.follower = document.querySelector('.cursor-follower');
    this.links = document.querySelectorAll('a, button, .interactive');
    
    this.cursorPos = { x: 0, y: 0 };
    this.followerPos = { x: 0, y: 0 };
    
    this.init();
  }

  init() {
    this.initializeCursor();
    this.initializeMagneticElements();
    this.initializeEvents();
  }

  initializeCursor() {
    // Set initial positions off screen
    gsap.set([this.cursor, this.follower], {
      xPercent: -50,
      yPercent: -50,
      x: -100,
      y: -100
    });
    
    // Show cursors
    gsap.to([this.cursor, this.follower], {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out'
    });
  }

  initializeMagneticElements() {
    this.links.forEach(link => {
      // Create magnetic effect
      link.addEventListener('mouseenter', () => {
        gsap.to(this.follower, {
          scale: 1.5,
          duration: 0.3,
          ease: 'power2.out'
        });
        
        gsap.to(this.cursor, {
          scale: 0.5,
          duration: 0.3,
          ease: 'power2.out'
        });
        
        link.addEventListener('mousemove', (e) => this.handleMagneticMove(e, link));
      });

      link.addEventListener('mouseleave', () => {
        gsap.to([this.follower, this.cursor], {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
        
        gsap.to(link, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });
  }

  handleMagneticMove(e, element) {
    const rect = element.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    
    gsap.to(element, {
      x: relX * 0.2,
      y: relY * 0.2,
      duration: 0.3,
      ease: 'power2.out'
    });
  }

  initializeEvents() {
    document.addEventListener('mousemove', (e) => {
      this.cursorPos.x = e.clientX;
      this.cursorPos.y = e.clientY;
    });

    gsap.ticker.add(() => {
      const dt = 1.0 - Math.pow(0.8, gsap.ticker.deltaRatio());
      
      this.followerPos.x += (this.cursorPos.x - this.followerPos.x) * dt;
      this.followerPos.y += (this.cursorPos.y - this.followerPos.y) * dt;
      
      gsap.set(this.cursor, {
        x: this.cursorPos.x,
        y: this.cursorPos.y
      });
      
      gsap.set(this.follower, {
        x: this.followerPos.x,
        y: this.followerPos.y
      });
    });

    // Hide cursors when leaving window
    document.addEventListener('mouseleave', () => {
      gsap.to([this.cursor, this.follower], {
        opacity: 0,
        duration: 0.2
      });
    });

    document.addEventListener('mouseenter', () => {
      gsap.to([this.cursor, this.follower], {
        opacity: 1,
        duration: 0.2
      });
    });
  }
}