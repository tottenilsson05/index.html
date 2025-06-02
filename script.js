// script.js
// This file can be used for more complex animations or interactivity in the future.
// For now, all animations are handled by CSS.

console.log("Bella website initialized!");

// Example of a potential future enhancement:
// document.addEventListener('mousemove', (e) => {
//     const logo = document.getElementById('logo');
//     const { clientX, clientY } = e;
//     const { innerWidth, innerHeight } = window;
//
//     // Calculate movement - this is a very subtle parallax effect
//     const moveX = (clientX / innerWidth - 0.5) * 20; // Max 10px movement
//     const moveY = (clientY / innerHeight - 0.5) * 20; // Max 10px movement
//
//     if (logo) {
//         // Apply with a slight delay or smoothing if using requestAnimationFrame
//         logo.style.transform = `translate(${moveX}px, ${-20 + moveY}px)`; // Combine with existing float
//     }
// });
// Note: The above mousemove effect would conflict with the CSS float animation directly.
// It would require either removing the CSS animation for transform or a more complex JS animation setup (e.g., GSAP).
// Keeping it simple for now.

