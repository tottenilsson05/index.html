document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let particles = [];
    const particleCount = prefersReducedMotion ? 25 : 50; // Fewer particles if motion is reduced

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 4 + 1.5; // Size between 1.5 and 5.5
            this.speedX = (Math.random() * 0.6 - 0.3); // Slower horizontal speed
            this.speedY = (Math.random() * 0.6 - 0.3); // Slower vertical speed
            // Lighter green, semi-transparent particles
            this.color = `rgba(173, 255, 47, ${Math.random() * 0.4 + 0.1})`; // Greenyellow, more transparent
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Boundary check and position clamping
            if (this.x + this.size < 0 || this.x - this.size > width) {
                // If completely off screen, reset to other side
                this.x = (this.speedX > 0) ? -this.size : width + this.size;
            }
            if (this.y + this.size < 0 || this.y - this.size > height) {
                this.y = (this.speedY > 0) ? -this.size : height + this.size;
            }
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = []; 
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function drawStaticParticles() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(particle => particle.draw());
    }
    
    function animateParticles() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        requestAnimationFrame(animateParticles);
    }

    // Initialize and start animation based on motion preference
    initParticles(); // Initialize particle positions first

    if (prefersReducedMotion) {
        drawStaticParticles(); // Draw particles once, statically
    } else {
        animateParticles(); // Start the animation loop
    }

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initParticles(); // Re-initialize particles for new size
        if (prefersReducedMotion) {
            drawStaticParticles();
        }
        // If not reduced motion, the animation loop will continue and adjust.
        // No need to restart animateParticles() as it's self-looping with requestAnimationFrame.
    });
});

