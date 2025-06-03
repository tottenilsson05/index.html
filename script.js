// script.js - For potential future interactivity

console.log("DACOS website loaded!");

// Example of adding a little more dynamic behavior to the logo
const logo = document.getElementById('logo');

if (logo) {
    logo.addEventListener('mousedown', () => {
        logo.style.transform = 'scale(0.95) rotateZ(-5deg)';
    });

    logo.addEventListener('mouseup', () => {
        logo.style.transform = 'scale(1.1) rotateZ(5deg)'; // Return to hover state
    });
    
    // Ensure it returns to normal if mouse leaves while pressed
    logo.addEventListener('mouseleave', () => {
        // Check if it's not currently being hovered (which has its own transform)
        if (!logo.matches(':hover')) {
            logo.style.transform = 'scale(1) rotateZ(0deg)'; // Reset to base float animation context
        }
    });
}

// Simple star-like particle effect (optional, can be expanded)
function createSparkle() {
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');
    document.body.appendChild(sparkle);

    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const duration = Math.random() * 1.5 + 0.5; // 0.5 to 2 seconds
    const size = Math.random() * 3 + 1; // 1px to 4px

    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    sparkle.style.position = 'fixed';
    sparkle.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 80%)`;
    sparkle.style.borderRadius = '50%';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.opacity = '0';
    sparkle.style.animation = `sparkleFade ${duration}s linear`;
    
    // Add keyframes for sparkleFade dynamically
    // This avoids polluting CSS file if not always used or for many variations
    // But for simplicity here, we'll assume a CSS keyframe exists or add it
    const styleSheet = document.styleSheets[0]; // Assuming style.css is the first
    try {
        if (![...styleSheet.cssRules].some(rule => rule.name === 'sparkleFade')) {
             styleSheet.insertRule(`
                @keyframes sparkleFade {
                    0% { opacity: 1; transform: scale(0.5); }
                    50% { opacity: 0.8; transform: scale(1.2); }
                    100% { opacity: 0; transform: scale(0.5) translateY(-20px); }
                }
            `, styleSheet.cssRules.length);
        }
    } catch (e) {
        console.warn("Could not insert sparkleFade keyframes dynamically:", e);
        // Fallback: ensure sparkleFade is in style.css if this fails often
    }


    setTimeout(() => {
        sparkle.remove();
    }, duration * 1000);
}

// Create a few sparkles periodically
// Check if the user prefers reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
    setInterval(createSparkle, 300); // Add a new sparkle every 300ms
}

