class StartupSequence {
  constructor() {
    this.createOverlay();
    this.startSequence();
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: black;
      color: #00ff00;
      font-family: 'Web437_IBM_VGA_8x16', monospace;
      padding: 20px;
      z-index: 9999;
      white-space: pre;
      overflow: hidden;
    `;
    document.body.appendChild(this.overlay);
  }

  async startSequence() {
    const steps = [
      { text: 'BoxCat Basic System Check v1.0\n', delay: 1000 },
      { text: 'Copyright (c) 1993 BoxCat Systems\n\n', delay: 500 },
      { text: 'Memory Test:    640K OK\n', delay: 800 },
      { text: 'Extended Memory: 4096K OK\n', delay: 400 },
      { text: 'Loading HIMEM.SYS....', delay: 800 },
      { text: 'OK\n', delay: 400 },
      { text: 'Loading CONFIG.SYS....', delay: 800 },
      { text: 'OK\n', delay: 400 },
      { text: 'Loading MOUSE.COM....', delay: 800 },
      { text: 'OK\n', delay: 400 },
      { text: 'Loading SMARTDRV.EXE....', delay: 800 },
      { text: 'OK\n', delay: 400 },
      { text: '\nBOXCAT OS VERSION 1.0 BETA (1993)\n', delay: 1000 },
      { text: 'CGA/EGA/VGA Display Detected\n', delay: 500 },
      { text: 'Sound Blaster: Port 220h, IRQ 5, DMA 1\n\n', delay: 500 },
      { text: 'Starting GUI...', delay: 1000 }
    ];

    let fullText = '';
    
    for (const step of steps) {
      await this.wait(step.delay);
      fullText += step.text;
      this.overlay.textContent = fullText;
    }

    await this.wait(1000);
    
    // Check if setup has been completed or if we're in a reset process
    const config = localStorage.getItem('boxcat_config');
    const inSetup = sessionStorage.getItem('boxcat_in_setup');
    
    if (!config && !inSetup) {
      // If no config found and not in setup, start setup
      this.overlay.remove();
      BoxCatSetup.start();
    } else {
      // If config exists or we're in setup process, continue to desktop
      this.fadeOut();
      // Clear the setup flag if it exists
      sessionStorage.removeItem('boxcat_in_setup');
    }
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  fadeOut() {
    let opacity = 1;
    const fadeInterval = setInterval(() => {
      opacity -= 0.1;
      this.overlay.style.opacity = opacity;
      
      if (opacity <= 0) {
        clearInterval(fadeInterval);
        this.overlay.remove();
      }
    }, 50);
  }
}

// Start the sequence when the page loads
window.addEventListener('load', () => {
  new StartupSequence();
});