class ScaryScene {
  constructor() {
    this.scene = document.getElementById('scene');
    this.shadows = document.getElementById('shadows');
    this.flashlight = document.getElementById('flashlight');
    this.ambientSound = document.getElementById('ambient-sound');
    this.movableDot = document.getElementById('movable-dot');
    
    this.setupEventListeners();
    this.createShadows();
    this.startAmbience();
    this.setupDotMovement();
  }

  setupEventListeners() {
    document.addEventListener('mousemove', this.updateFlashlight.bind(this));
    document.addEventListener('click', this.triggerJump.bind(this));
  }

  createShadows() {
    for (let i = 0; i < 20; i++) {
      const shadow = document.createElement('div');
      shadow.classList.add('shadow');
      shadow.style.width = `${Math.random() * 100 + 50}px`;
      shadow.style.height = shadow.style.width;
      shadow.style.left = `${Math.random() * 100}%`;
      shadow.style.top = `${Math.random() * 100}%`;
      shadow.style.animationDelay = `${Math.random() * 5}s`;
      this.shadows.appendChild(shadow);
    }
  }

  updateFlashlight(event) {
    this.flashlight.style.left = `${event.clientX - 100}px`;
    this.flashlight.style.top = `${event.clientY - 100}px`;
  }

  triggerJump() {
    const randomShadow = this.shadows.children[Math.floor(Math.random() * this.shadows.children.length)];
    randomShadow.style.transform = 'scale(2) translateY(-50px)';
    setTimeout(() => {
      randomShadow.style.transform = '';
    }, 500);
  }

  startAmbience() {
    if (this.ambientSound) {
      this.ambientSound.volume = 0.3;
      this.ambientSound.play().catch(error => {
        console.warn('Audio autoplay prevented:', error);
      });
    }
  }

  setupDotMovement() {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    const dragStart = (e) => {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;

      if (e.target === this.movableDot) {
        isDragging = true;
      }
    };

    const drag = (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        this.setTranslate(currentX, currentY, this.movableDot);
      }
    };

    const dragEnd = () => {
      initialX = currentX;
      initialY = currentY;

      isDragging = false;
    };

    this.movableDot.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
  }

  setTranslate(xPos, yPos, el) {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ScaryScene();
});