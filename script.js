document.addEventListener('DOMContentLoaded', () => {
  const fartButton = document.getElementById('fartButton');
  const soundWave = document.getElementById('soundWave');

  fartButton.addEventListener('click', () => {
    // Play sound
    playSound();

    // Trigger sound wave animation
    soundWave.style.animation = 'soundWaveAnimation 0.5s linear infinite alternate';

    // Stop animation after a short delay
    setTimeout(() => {
      soundWave.style.animation = 'none';
    }, 500);
  });

  function playSound() {
    // Dynamically create and play the audio element
    const audio = new Audio('fart.mp3'); 
    audio.play().catch(error => {
      console.error("Failed to play the audio:", error);
      alert("Audio playback failed. Ensure your browser allows autoplay or consider providing a user-initiated event for audio playback.");
    });
  }
});