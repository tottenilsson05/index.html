import anime from 'animejs';

document.addEventListener('DOMContentLoaded', () => {
  const logo = document.getElementById('logo');
  const title = document.getElementById('title');

  // Initial Title Animation (Fade in and prepare for CSS glow pulse)
  anime({
    targets: title,
    translateY: '0px', // Animate to 0px from current (30px via CSS)
    opacity: 1,       // Animate to 1 from current (0 via CSS)
    duration: 1000,
    easing: 'easeOutExpo',
    delay: 200,
    complete: () => {
      title.classList.add('pulse-glow-active'); // CSS will handle the pulsing glow
    }
  });

  // Default Logo Animation (Gentle Bobbing/Swaying)
  let currentLogoAnimation = anime({
    targets: logo,
    translateY: ['-8px', '8px'], // Bob up and down
    rotate: ['-2deg', '2deg'],   // Gentle sway
    duration: 3000, // Slower, more gentle
    loop: true,
    direction: 'alternate',
    easing: 'easeInOutSine'
  });

  logo.addEventListener('mouseenter', () => {
    if (currentLogoAnimation) {
        currentLogoAnimation.pause();
    }
    anime.remove(logo); // Remove existing animation instances from the target

    // Quick, playful hover animation
    anime({
      targets: logo,
      keyframes: [
        { translateY: -15, rotate: -6, scale: 1.1, duration: 150 },
        { translateY: 0, rotate: 6, scale: 1, duration: 150 },
        { translateY: -10, rotate: -4, scale: 1.05, duration: 120 },
        { translateY: 0, rotate: 4, scale: 1, duration: 120 },
        { translateY: -5, rotate: 0, scale: 1.02, duration: 100 },
        { translateY: 0, rotate: 0, scale: 1, duration: 100 }
      ],
      easing: 'easeInOutSine',
      // No explicit complete needed here, mouseleave handles restarting default anim
    });
  });

  logo.addEventListener('mouseleave', () => {
    anime.remove(logo); // Ensure any running (hover) animation is stopped and removed

    // Restart the default gentle animation
    currentLogoAnimation = anime({
      targets: logo,
      translateY: ['-8px', '8px'],
      rotate: ['-2deg', '2deg'],
      scale: 1, // Explicitly reset scale
      duration: 3000,
      loop: true,
      direction: 'alternate',
      easing: 'easeInOutSine'
    });
  });
});

