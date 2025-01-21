document.addEventListener('DOMContentLoaded', () => {
  const art = document.getElementById('ascii-art');
  
  // Random flicker effect
  setInterval(() => {
    art.style.opacity = Math.random() * 0.2 + 0.8;
  }, 100);
});