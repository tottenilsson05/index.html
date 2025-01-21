import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export class ProjectsSection {
  constructor() {
    this.currentIndex = 0;
    this.projects = [
      {
        id: 1,
        title: "AI Code Assistant",
        summary: "Advanced code completion and generation powered by machine learning",
        description: "Boost your productivity with context-aware code suggestions and automated refactoring powered by state-of-the-art language models.",
        icon: `<svg viewBox="0 0 24 24" class="holo-icon"><path d="M13.325 3.05L8.667 20.432l1.932.518 4.658-17.382-1.932-.518zM7.612 18.36l1.36-1.448-.001-.108c0-1.216-.995-2.203-2.219-2.203-1.224 0-2.219.987-2.219 2.203 0 1.216.995 2.203 2.219 2.203 1.151 0 2.095-.923 2.196-2.078l-1.336 1.431zm8.776 0l1.36-1.448-.001-.108c0-1.216-.995-2.203-2.219-2.203-1.224 0-2.219.987-2.219 2.203 0 1.216.995 2.203 2.219 2.203 1.151 0 2.095-.923 2.196-2.078l-1.336 1.431z"/></svg>`,
        tags: ["AI", "Development", "Productivity"],
        color: "#ff4b4b",
        link: "https://toolz.digital/code-assistant"
      },
      {
        id: 2,
        title: "Visual Design Generator",
        summary: "Create stunning visuals with AI-powered design tools", 
        description: "Transform your ideas into professional designs instantly with our AI-powered design generator. Perfect for mockups, social media, and marketing materials.",
        icon: `<svg viewBox="0 0 24 24" class="holo-icon"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM10.622 8.415l4.879 3.252a.4.4 0 0 1 0 .666l-4.88 3.252a.4.4 0 0 1-.621-.332V8.747a.4.4 0 0 1 .622-.332z"/></svg>`,
        tags: ["Design", "AI", "Creative"],
        color: "#4a90e2",
        link: "https://toolz.digital/design-generator"
      },
      {
        id: 3,
        title: "Data Analysis Suite", 
        summary: "Intelligent data analysis and visualization platform",
        description: "Turn complex data into actionable insights with our comprehensive analysis suite. Features automated reporting, predictive analytics, and interactive visualizations.",
        icon: `<svg viewBox="0 0 24 24" class="holo-icon"><path d="M5 12a7 7 0 1 1 14 0 7 7 0 0 1-14 0zm7-9a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 4v10l6-5-6-5z"/></svg>`,
        tags: ["Analytics", "Data", "Business"],
        color: "#ffa500",
        link: "https://toolz.digital/data-analysis"
      },
      {
        id: 4,
        title: "Content Creator Pro",
        summary: "AI-powered content generation and optimization",
        description: "Create engaging content at scale with our advanced AI writing assistant. Includes SEO optimization, tone analysis, and multilingual support.",
        icon: `<svg viewBox="0 0 24 24" class="holo-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1v5h5v10H6V4h7zm-2 8v2h6v-2h-6zm0 4v2h6v-2h-6z"/></svg>`,
        tags: ["Content", "AI", "Marketing"],
        color: "#e44d26",
        link: "https://toolz.digital/content-creator"
      },
      {
        id: 5,
        title: "Workflow Automator",
        summary: "Smart automation for complex business processes",
        description: "Streamline your operations with intelligent workflow automation. Features visual process builder, integration hub, and performance analytics.",
        icon: `<svg viewBox="0 0 24 24" class="holo-icon"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM10.622 8.415l4.879 3.252a.4.4 0 0 1 0 .666l-4.88 3.252a.4.4 0 0 1-.621-.332V8.747a.4.4 0 0 1 .622-.332z"/></svg>`,
        tags: ["Automation", "Business", "Productivity"],
        color: "#9b59b6",
        link: "https://toolz.digital/workflow-automator"
      }
    ];
    this.init();
  }

  async init() {
    this.initializeCarousel();
    this.initializeAnimations();
    this.initializeInteractions();
  }

  initializeCarousel() {
    const projectsContainer = document.querySelector('.projects-grid');
    if (!projectsContainer) return;
    
    projectsContainer.innerHTML = `
      <div class="holocard-carousel">
        <div class="carousel-container">
          ${this.projects.map((project, index) => this.createHoloCard(project, index)).join('')}
        </div>
        <div class="carousel-controls">
          <button class="carousel-btn prev" aria-label="Previous project">
            <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>
          <div class="carousel-indicators">
            ${this.projects.map((_, i) => `<div class="indicator ${i === 0 ? 'active' : ''}"></div>`).join('')}
          </div>
          <button class="carousel-btn next" aria-label="Next project">
            <svg viewBox="0 0 24 24"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>
          </button>
        </div>
      </div>
    `;
  }

  createHoloCard(project, index) {
    return `
      <div class="holocard" data-index="${index}">
        <div class="holocard-inner">
          <div class="holocard-front" style="--card-color: ${project.color}">
            <div class="holo-effect"></div>
            <div class="card-icon">
              ${project.icon}
            </div>
            <h3>${project.title}</h3>
            <p>${project.summary}</p>
            <div class="card-tags">
              ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          </div>
          <div class="holocard-back" style="--card-color: ${project.color}">
            <div class="holo-effect"></div>
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <a href="${project.link}" class="card-link" target="_blank" rel="noopener">
              Learn More
              <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  initializeAnimations() {
    const cards = document.querySelectorAll('.holocard');
    
    // Initial layout
    gsap.set(cards, {
      opacity: 0,
      scale: 0.8,
      rotationY: 45,
      z: -500
    });
    
    // Animate in
    gsap.to(cards, {
      opacity: 1,
      scale: 1,
      rotationY: 0,
      z: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".holocard-carousel",
        start: "top center+=100",
        toggleActions: "play none none reverse"
      }
    });

    // Setup card positions
    this.updateCardPositions();
  }

  updateCardPositions() {
    const cards = document.querySelectorAll('.holocard');
    const centerIndex = this.currentIndex;
    
    cards.forEach((card, i) => {
      const offset = i - centerIndex;
      const xPos = offset * 120;
      const zPos = Math.abs(offset) * -100;
      const opacity = 1 - Math.abs(offset) * 0.2;
      const scale = 1 - Math.abs(offset) * 0.1;
      
      gsap.to(card, {
        x: xPos,
        z: zPos,
        opacity: opacity,
        scale: scale,
        rotationY: offset * 10,
        duration: 0.6,
        ease: "power2.out"
      });
    });

    // Update indicators
    document.querySelectorAll('.indicator').forEach((indicator, i) => {
      indicator.classList.toggle('active', i === this.currentIndex);
    });
  }

  initializeInteractions() {
    // Card hover effects
    document.querySelectorAll('.holocard').forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card.querySelector('.holocard-inner'), {
          rotateY: 180,
          duration: 0.6,
          ease: "power2.inOut"
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card.querySelector('.holocard-inner'), {
          rotateY: 0,
          duration: 0.6,
          ease: "power2.inOut"
        });
      });
    });

    // Carousel navigation
    document.querySelector('.carousel-btn.prev')?.addEventListener('click', () => {
      this.currentIndex = Math.max(0, this.currentIndex - 1);
      this.updateCardPositions();
    });

    document.querySelector('.carousel-btn.next')?.addEventListener('click', () => {
      this.currentIndex = Math.min(this.projects.length - 1, this.currentIndex + 1);
      this.updateCardPositions();
    });

    // Touch/drag functionality
    let startX = 0;
    let isDragging = false;
    
    const carousel = document.querySelector('.carousel-container');
    
    carousel?.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const diff = startX - e.clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.currentIndex = Math.min(this.projects.length - 1, this.currentIndex + 1);
        } else {
          this.currentIndex = Math.max(0, this.currentIndex - 1);
        }
        this.updateCardPositions();
        isDragging = false;
      }
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }
}