let messages = [
  "This isn't happening...",
  "Why did this happen?",
  "I miss how things were...",
  "It hurts so much...",
  "Please come back..."
];

const sadMessages = [...messages];
const happyMessages = [
  "Life is beautiful!",
  "So much joy!",
  "Everything is awesome!",
  "Pure happiness!",
  "Feeling fantastic!"
];

const messageElement = document.querySelector('.message');
const scene = document.querySelector('.scene');
const button = document.querySelector('.button');
const head = document.querySelector('.head');
let currentIndex = 0;
let isHappy = false;

function changeMessage() {
  messageElement.style.opacity = 0;
  
  setTimeout(() => {
    currentIndex = (currentIndex + 1) % messages.length;
    messageElement.textContent = messages[currentIndex];
    messageElement.style.opacity = 1;
  }, 2000);
}

setInterval(changeMessage, 4000);

function randomMovement() {
  const randomX = (Math.random() - 0.5) * 2;
  const randomY = (Math.random() - 0.5) * 2;
  head.style.transform = `translate(${randomX}px, ${randomY}px)`;
  requestAnimationFrame(randomMovement);
}

randomMovement();

button.addEventListener('click', () => {
  isHappy = !isHappy;
  scene.classList.toggle('happy');
  
  if (isHappy) {
    messages = happyMessages;
    button.textContent = "Sad";
    document.querySelector('.mouth').setAttribute('d', 'M 30 65 Q 50 80 70 65');
    createConfetti();
  } else {
    messages = sadMessages;
    button.textContent = "Happy";
    document.querySelector('.mouth').setAttribute('d', 'M 30 70 Q 50 55 70 70');
  }
  
  currentIndex = 0;
  changeMessage();
});

function createConfetti() {
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
  
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.animation = `confettiFall ${1 + Math.random() * 2}s forwards`;
    
    document.body.appendChild(confetti);
    
    setTimeout(() => {
      confetti.remove();
    }, 3000);
  }
}