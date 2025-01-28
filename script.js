document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('.cool-button');
  const body = document.body;

  // Sparkle effect
  function createSparkle() {
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');
    sparkle.style.position = 'fixed';
    sparkle.style.width = '10px';
    sparkle.style.height = '10px';
    sparkle.style.background = 'white';
    sparkle.style.borderRadius = '50%';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.zIndex = '9999';
    
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    
    body.appendChild(sparkle);
    
    gsap.to(sparkle, {
      opacity: 0,
      scale: 2,
      duration: 1,
      onComplete: () => body.removeChild(sparkle)
    });
  }

  button.addEventListener('click', () => {
    // Create multiple sparkles
    for (let i = 0; i < 20; i++) {
      createSparkle();
    }
    alert('RADICAL!!!! ');
  });

  // Continuous background sparkles
  setInterval(createSparkle, 500);
});