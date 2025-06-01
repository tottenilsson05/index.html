// script.js - For potential future interactivity

document.addEventListener('DOMContentLoaded', () => {
    const titleElement = document.querySelector('.title');
    const originalTextShadow = titleElement.style.textShadow;

    // Example of a subtle interactive animation: enhance glow on mouse over title
    titleElement.addEventListener('mouseenter', () => {
        titleElement.style.textShadow = `
            0 0 8px #fff,
            0 0 15px #fff,
            0 0 25px #ffee00,  /* Yellow glow */
            0 0 35px #ffee00,
            0 0 45px #ffee00,
            0 0 55px #ffaa00,  /* Orange glow */
            0 0 70px #ffaa00,
            0 0 90px #ff8c00   /* Deeper Orange glow */
        `;
        titleElement.style.transition = 'text-shadow 0.3s ease-in-out';
    });

    titleElement.addEventListener('mouseleave', () => {
        titleElement.style.textShadow = originalTextShadow; // Revert to CSS defined shadow
         // If originalTextShadow was empty, might need to set it to the specific value from CSS
        if (!originalTextShadow) {
             titleElement.style.textShadow = `
                0 0 5px #fff,
                0 0 10px #fff,
                0 0 15px #ffee00,  /* Yellow glow */
                0 0 20px #ffee00,
                0 0 25px #ffee00,
                0 0 35px #ffaa00,  /* Orange glow */
                0 0 45px #ffaa00`; /* Orange glow */
        }
    });

    // Add a subtle particle effect for "cool" background animation
    const numParticles = 50;
    const particleContainer = document.body;

    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.top = `${Math.random() * 100}vh`;
        particle.style.width = `${Math.random() * 3 + 1}px`;
        particle.style.height = particle.style.width;
        particle.style.backgroundColor = Math.random() > 0.5 ? '#ff00de' : '#00aaff'; // Neon pink or blue
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particle.style.animationDuration = `${Math.random() * 10 + 5}s`; // Slower, more subtle movement
        particleContainer.appendChild(particle);
    }

    // Add particle styles dynamically
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
        .particle {
            position: absolute;
            border-radius: 50%;
            opacity: 0; /* Start invisible */
            animation: driftAndFade 10s infinite linear;
            pointer-events: none; /* Particles should not interfere with interactions */
        }

        @keyframes driftAndFade {
            0%, 100% {
                transform: translate(0, 0) scale(0.5);
                opacity: 0;
            }
            25% {
                opacity: ${Math.random() * 0.3 + 0.1}; /* Vary max opacity for different particles */
            }
            50% {
                transform: translate(${Math.random() * 60 - 30}px, ${Math.random() * 60 - 30}px) scale(1);
                opacity: ${Math.random() * 0.7 + 0.3};
            }
            75% {
                opacity: ${Math.random() * 0.3 + 0.1};
            }
        }
    `;
    document.head.appendChild(styleSheet);

    console.log("Simba website initialized with cool animations!");
});