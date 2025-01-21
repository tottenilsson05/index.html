const messages = [
  "Initializing ElonTok systems...",
  "Loading neural networks...",
  "Calibrating meme processors...",
  "Establishing fun matrix...",
  "Ready for maximum entertainment."
];

export class Terminal {
  constructor() {
    this.content = document.querySelector('.terminal-content');
    this.currentLine = 0;
    this.init();
  }

  async init() {
    for (const message of messages) {
      await this.typeMessage(message);
      await this.wait(1000);
    }
  }

  async typeMessage(message) {
    const line = document.createElement('div');
    line.className = 'line';
    
    const prompt = document.createElement('span');
    prompt.className = 'prompt';
    prompt.textContent = '>';
    
    const text = document.createElement('span');
    text.className = 'text';
    
    line.appendChild(prompt);
    line.appendChild(text);
    this.content.appendChild(line);

    for (const char of message) {
      text.textContent += char;
      await this.wait(50);
    }
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

new Terminal();