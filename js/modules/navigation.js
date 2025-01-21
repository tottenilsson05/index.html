import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export class Navigation {
  constructor() {
    this.init();
    this.currentSection = 'hero';
    this.isMenuOpen = false;
  }

  init() {
    this.createNavigation();
    this.initializeScrollSpy();
    this.initializeAnimations();
    this.initializeEvents();
  }

  createNavigation() {
    const nav = document.createElement('nav');
    nav.className = 'main-nav';
    
    nav.innerHTML = `
      <div class="nav-brand">
        <a href="#hero" class="logo">
          <svg viewBox="0 0 50 50" class="logo-svg">
            <path d="M25,5 L45,15 L45,35 L25,45 L5,35 L5,15 Z" fill="none" stroke="currentColor"/>
            <path d="M25,5 L25,45" fill="none" stroke="currentColor" class="logo-line"/>
          </svg>
          <span>Portfolio</span>
        </a>
      </div>
      
      <button class="menu-toggle" aria-label="Toggle Menu">
        <span class="menu-icon"></span>
      </button>
      
      <div class="nav-content">
        <ul class="nav-links">
          <li><a href="#hero" class="nav-link active" data-section="hero">Home</a></li>
          <li><a href="#projects" class="nav-link" data-section="projects">Projects</a></li>
          <li><a href="#about" class="nav-link" data-section="about">About</a></li>
          <li><a href="#contact" class="nav-link" data-section="contact">Contact</a></li>
        </ul>
        
        <div class="nav-footer">
          <div class="social-links">
            <a href="https://github.com" target="_blank" rel="noopener" class="social-link">
              <svg viewBox="0 0 24 24" class="social-icon">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener" class="social-link">
              <svg viewBox="0 0 24 24" class="social-icon">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener" class="social-link">
              <svg viewBox="0 0 24 24" class="social-icon">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    `;
    
    document.body.prepend(nav);
    
    // Create progress indicator
    const progress = document.createElement('div');
    progress.className = 'scroll-progress';
    nav.appendChild(progress);
  }

  initializeScrollSpy() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Create scroll triggers for each section
    sections.forEach(section => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => this.updateActiveLink(section.id),
        onEnterBack: () => this.updateActiveLink(section.id)
      });
    });

    // Create scroll progress indicator
    ScrollTrigger.create({
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        gsap.to('.scroll-progress', {
          scaleX: self.progress,
          duration: 0.1,
          ease: 'none'
        });
      }
    });
  }

  updateActiveLink(sectionId) {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.dataset.section === sectionId) {
        link.classList.add('active');
      }
    });
    
    this.currentSection = sectionId;
  }

  initializeAnimations() {
    // Animate nav items on load
    gsap.from('.nav-brand', {
      y: -50,
      opacity: 0,
      duration: 1,
      ease: 'power2.out'
    });

    gsap.from('.nav-link', {
      y: -50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out'
    });

    // Logo animation
    const logoTimeline = gsap.timeline({
      repeat: -1,
      repeatDelay: 3
    });

    logoTimeline
      .to('.logo-line', {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: 'power2.inOut'
      })
      .to('.logo-svg path', {
        stroke: 'var(--secondary-color)',
        duration: 1,
        ease: 'none'
      })
      .to('.logo-svg path', {
        stroke: 'var(--primary-color)',
        duration: 1,
        ease: 'none'
      });
  }

  initializeEvents() {
    // Smooth scroll
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        
        if (this.isMenuOpen) {
          this.toggleMenu();
        }
        
        this.smoothScroll(target);
      });
    });

    // Menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    menuToggle.addEventListener('click', () => this.toggleMenu());

    // Hide menu on resize if open
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.isMenuOpen) {
        this.toggleMenu();
      }
    });
  }

  toggleMenu() {
    const nav = document.querySelector('.main-nav');
    const navContent = document.querySelector('.nav-content');
    
    this.isMenuOpen = !this.isMenuOpen;
    nav.classList.toggle('menu-open');
    
    if (this.isMenuOpen) {
      gsap.fromTo(navContent, 
        { 
          opacity: 0,
          y: -20
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        }
      );
    } else {
      gsap.to(navContent, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: 'power2.in'
      });
    }
  }

  smoothScroll(target) {
    gsap.to(window, {
      duration: 1,
      scrollTo: {
        y: target,
        autoKill: false
      },
      ease: 'power2.inOut'
    });
  }
}