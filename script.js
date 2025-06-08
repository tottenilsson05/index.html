import { gsap } from "gsap";

const logo = document.getElementById('logo');
const titleSpans = document.querySelectorAll('#title span');

// Set initial states for animation
gsap.set(logo, { autoAlpha: 0, scale: 0.5 });
gsap.set(titleSpans, { autoAlpha: 0, y: 70 });

// Intro animation timeline
const tl = gsap.timeline({ defaults: { ease: "back.out(1.7)" } });

tl.to(logo, {
    autoAlpha: 1,
    scale: 1,
    duration: 1,
    delay: 0.3
}).to(titleSpans, {
    autoAlpha: 1,
    y: 0,
    stagger: 0.1,
    duration: 0.6
}, "-=0.7");

// Continuous float animation for the logo
gsap.to(logo, {
    y: -15,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    duration: 2.5,
    delay: tl.duration() // Start after timeline finishes
});

// Mouse move interaction for a 3D tilt effect
document.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;

    const xPos = (clientX / innerWidth) - 0.5;
    const yPos = (clientY / innerHeight) - 0.5;

    gsap.to(logo, {
        rotationY: xPos * 25,
        rotationX: -yPos * 25,
        ease: 'power1.out',
        duration: 0.7
    });
});

