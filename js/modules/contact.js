import { gsap } from 'gsap';

export class ContactSection {
  constructor() {
    this.init();
  }

  init() {
    this.initializeForm();
    this.initializeAnimations();
    this.initializeMap();
  }

  initializeForm() {
    const form = document.querySelector('.contact-form');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      
      try {
        // Animate button during submission
        const button = form.querySelector('button');
        const originalText = button.textContent;
        button.disabled = true;
        
        gsap.to(button, {
          scale: 0.95,
          duration: 0.2
        });
        
        button.textContent = 'Sending...';
        
        // Simulate form submission (replace with actual API call)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Success animation
        this.showNotification('Message sent successfully!', 'success');
        form.reset();
        
        // Reset button
        button.textContent = originalText;
        button.disabled = false;
        
        gsap.to(button, {
          scale: 1,
          duration: 0.2
        });
        
      } catch (error) {
        console.error('Error submitting form:', error);
        this.showNotification('Error sending message. Please try again.', 'error');
      }
    });

    // Add floating label animations
    const inputs = form.querySelectorAll('.form-group input, .form-group textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
      });
      
      input.addEventListener('blur', () => {
        if (!input.value) {
          input.parentElement.classList.remove('focused');
        }
      });
    });
  }

  initializeAnimations() {
    // Animate contact info icons
    gsap.from('.contact-info-item', {
      scrollTrigger: {
        trigger: '.contact-info',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power2.out'
    });

    // Animate form elements
    gsap.from('.contact-form .form-group', {
      scrollTrigger: {
        trigger: '.contact-form',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out'
    });
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    gsap.fromTo(notification, 
      { 
        opacity: 0, 
        y: 20 
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
        onComplete: () => {
          setTimeout(() => {
            gsap.to(notification, {
              opacity: 0,
              y: 20,
              duration: 0.3,
              onComplete: () => notification.remove()
            });
          }, 3000);
        }
      }
    );
  }

  initializeMap() {
    // Initialize interactive map background (simplified version)
    const canvas = document.querySelector('.map-canvas');
    const ctx = canvas.getContext('2d');
    
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    
    window.addEventListener('resize', resize);
    resize();
    
    // Create animated background pattern
    const drawPattern = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const time = Date.now() * 0.001;
      const size = 30;
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      
      for (let x = 0; x < canvas.width / size; x++) {
        for (let y = 0; y < canvas.height / size; y++) {
          const xPos = x * size;
          const yPos = y * size;
          
          ctx.beginPath();
          ctx.arc(
            xPos + Math.sin(time + x * 0.5) * 5,
            yPos + Math.cos(time + y * 0.5) * 5,
            2,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }
      }
      
      requestAnimationFrame(drawPattern);
    };
    
    drawPattern();
  }
}