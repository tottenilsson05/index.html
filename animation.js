let isDragging = false;
let currentX = 0;
let currentY = 0;
let initialX = 0;
let initialY = 0;
let xOffset = 0;
let yOffset = 0;

const noob = document.querySelector('.noob');
const scene = document.querySelector('.scene');

// Initialize position if not already set
if (!scene.style.transform) {
  scene.style.transform = 'translate(0px, 0px)';
}

scene.addEventListener('mousedown', dragStart);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', dragEnd);

// Touch events for mobile
scene.addEventListener('touchstart', dragStart);
document.addEventListener('touchmove', drag);
document.addEventListener('touchend', dragEnd);

function dragStart(e) {
  if (e.type === "touchstart") {
    initialX = e.touches[0].clientX - xOffset;
    initialY = e.touches[0].clientY - yOffset;
  } else {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
  }

  if (e.target.closest('.noob')) {
    isDragging = true;
  }
}

function drag(e) {
  if (isDragging) {
    e.preventDefault();
    
    if (e.type === "touchmove") {
      currentX = e.touches[0].clientX - initialX;
      currentY = e.touches[0].clientY - initialY;
    } else {
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
    }

    xOffset = currentX;
    yOffset = currentY;

    scene.style.transform = `translate(${currentX}px, ${currentY}px)`;
    
    // Calculate 3D rotation based on velocity
    const rect = noob.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const angleX = (e.clientY - centerY) / 50;
    const angleY = -(e.clientX - centerX) / 50;
    
    noob.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg)`;
  }
}

function dragEnd() {
  isDragging = false;
}