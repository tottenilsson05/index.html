// script.js
// For now, CSS handles animations.
// This file can be used for more complex interactions later if needed.

console.log("HOBI website script loaded!");

// Example of a small JS enhancement:
// Add a subtle mouse move effect to the logo
const logo = document.getElementById('logo');
const container = document.querySelector('.container');

if (logo && container) {
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // Reduce the effect strength
        const tiltX = (y / rect.height) * 10; // Max 5 degrees tilt
        const tiltY = -(x / rect.width) * 10; // Max 5 degrees tilt

        logo.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.05)`; // Keep existing scale if needed or combine with pulse
    });

    container.addEventListener('mouseleave', () => {
        // Reset to its CSS animation state
        // Note: This might conflict slightly with the CSS float animation's transform.
        // For more robust control, JS would need to fully manage the transform or use additive transforms.
        // For simplicity here, we'll just reset the transform that JS applied.
        // The CSS animations will continue to apply their own transforms.
        logo.style.transform = '';
    });
}

