import { gsap } from "gsap";

const logo = document.querySelector('.logo');
const title = document.querySelector('.title');

// --- Initial states for animation ---
gsap.set(logo, { scale: 0, rotation: -180 });
gsap.set(title, { y: 100, opacity: 0 });

// --- On-load Animation Timeline ---
const tl = gsap.timeline({ defaults: { ease: 'back.out(1.7)' } });

tl.to(logo, { 
    scale: 1, 
    rotation: 0, 
    duration: 1.2 
  })
  .to(title, { 
    y: 0, 
    opacity: 1, 
    duration: 1 
  }, "-=0.8")
  .add(() => {
    // --- Continuous "pumping" animation ---
    // Starts after the intro animation is complete
    gsap.to(logo, {
        scale: 1.05,
        duration: 0.7,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
    });
  });

// --- Interactive Click Animation ---
logo.addEventListener('click', () => {
    // Prevents spamming the animation
    if (gsap.isTweening(logo)) return;

    gsap.timeline()
        .to(logo, {
            rotation: '+=360',
            duration: 0.5,
            ease: 'power2.out'
        })
        .to(logo, {
            scale: 1.2,
            duration: 0.25,
            yoyo: true,
            repeat: 1,
            ease: 'power1.inOut'
        }, 0); // Start at the same time as rotation
});

