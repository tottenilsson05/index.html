export class PowerUp {
  constructor(game) {
    this.game = game;
    this.x = Math.random() * 700 + 50;
    this.y = Math.random() * 500 + 50;
    this.type = ['rapidFire', 'spreadShot', 'shield'][Math.floor(Math.random() * 3)];
    this.duration = 300;
    this.element = this.createPowerUpElement();
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
    game.arena.appendChild(this.element);
  }

  createPowerUpElement() {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    el.setAttribute("viewBox", "0 0 100 100");
    el.setAttribute("class", "powerup upgrade");
    
    el.innerHTML = `
      <polygon points="20,20 80,20 80,80 20,80" stroke-width="4"/>
      <text x="50" y="55" text-anchor="middle" fill="#ff0" font-size="12">
        ${this.type.toUpperCase()}
      </text>
    `;
    
    return el;
  }

  apply(player) {
    player.powerUps[this.type] = this.duration;
  }

  update() {
    // Add floating animation if desired
  }
}