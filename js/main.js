import { createHeroTimeline, initParallax, initGlitchEffect } from './modules/animations.js';
import { DataMesh } from './modules/dataMesh.js';
import { ProjectsSection } from './modules/projects.js';
import { AboutSection } from './modules/about.js';
import { ContactSection } from './modules/contact.js';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

class App {
  constructor() {
    this.initializeApp();
  }
  
  async initializeApp() {
    try {
      // Initialize data mesh
      const dataMeshContainer = document.querySelector('.data-mesh-container');
      this.dataMesh = new DataMesh(dataMeshContainer);
      
      // Initialize animations
      await this.initializeAnimations();
      
      // Initialize sections
      this.projectsSection = new ProjectsSection(); 
      this.aboutSection = new AboutSection();
      this.contactSection = new ContactSection();
      
      // Initialize interactions last
      this.initializeInteractions();
      
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }
  
  async initializeAnimations() {
    // Create and play hero timeline
    const heroTimeline = createHeroTimeline();
    heroTimeline.play();
    
    // Initialize parallax effects
    initParallax();
    
    // Initialize glitch effect
    initGlitchEffect();
  }
  
  initializeInteractions() {
    // Custom cursor
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let followerX = 0;
    let followerY = 0;
    
    // Show the custom cursor only after it's positioned correctly
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Show cursors on first mouse movement
      if (cursor.style.opacity === '0') {
        gsap.to([cursor, follower], {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
    
    gsap.ticker.add(() => {
      cursorX += (mouseX - cursorX) * 0.2;
      cursorY += (mouseY - cursorY) * 0.2;
      followerX += (mouseX - followerX) * 0.1;
      followerY += (mouseY - followerY) * 0.1;
      
      gsap.set(cursor, { x: cursorX, y: cursorY });
      gsap.set(follower, { x: followerX, y: followerY });
    });
    
    // Hide cursors when mouse leaves window
    document.addEventListener('mouseleave', () => {
      gsap.to([cursor, follower], {
        opacity: 0,
        duration: 0.3
      });
    });
    
    document.addEventListener('mouseenter', () => {
      gsap.to([cursor, follower], {
        opacity: 1,
        duration: 0.3
      });
    });
    
    // Button hover effects
    document.querySelectorAll('.primary-btn, .secondary-btn').forEach(button => {
      button.addEventListener('mouseenter', () => {
        gsap.to(follower, {
          scale: 1.5,
          duration: 0.3
        });
      });
      
      button.addEventListener('mouseleave', () => {
        gsap.to(follower, {
          scale: 1,
          duration: 0.3
        });
      });
    });
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    ScrollTrigger.getAll().forEach(st => st.disable());
  } else {
    ScrollTrigger.getAll().forEach(st => st.enable());
  }
});