import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export class AboutSection {
  constructor() {
    this.init();
    this.skills = {
      core: ['JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'React', 'Node.js'],
      animation: ['GSAP', 'Three.js', 'ScrollTrigger', 'Framer Motion', 'CSS Animations'],
      tools: ['Git', 'Webpack', 'Vite', 'Docker', 'VS Code', 'Figma']
    };
  }

  init() {
    this.initializeSkillGraphs();
    this.initializeAnimations();
    this.initializeInteractions();
  }

  initializeSkillGraphs() {
    // Create hexagonal skill visualization
    const container = document.querySelector('.skills-hexagons');
    
    Object.entries(this.skills).forEach(([category, skills]) => {
      const categoryEl = document.createElement('div');
      categoryEl.className = 'skill-category';
      categoryEl.innerHTML = `
        <h3>${category.charAt(0).toUpperCase() + category.slice(1)} Skills</h3>
        <div class="hexagon-container">
          ${skills.map((skill, index) => `
            <div class="hexagon-wrapper" style="--delay: ${index * 0.1}s">
              <div class="hexagon">
                <div class="hexagon-content">
                  <span>${skill}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      container.appendChild(categoryEl);
    });
  }

  initializeAnimations() {
    // Animate bio text
    gsap.from('.about-bio p', {
      scrollTrigger: {
        trigger: '.about-bio',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2
    });

    // Animate skill hexagons
    gsap.from('.hexagon-wrapper', {
      scrollTrigger: {
        trigger: '.skills-hexagons',
        start: 'top 70%',
        toggleActions: 'play none none reverse'
      },
      scale: 0,
      opacity: 0,
      rotation: 180,
      duration: 0.8,
      stagger: {
        amount: 1,
        grid: 'auto',
        from: 'center'
      },
      ease: 'back.out(1.7)'
    });

    // Animate progress bars
    gsap.from('.experience-item', {
      scrollTrigger: {
        trigger: '.experience-timeline',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      xPercent: -100,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power2.out'
    });
  }

  initializeInteractions() {
    // Add hover effects for hexagons
    document.querySelectorAll('.hexagon').forEach(hexagon => {
      hexagon.addEventListener('mouseenter', () => {
        gsap.to(hexagon, {
          scale: 1.1,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      hexagon.addEventListener('mouseleave', () => {
        gsap.to(hexagon, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });
  }
}