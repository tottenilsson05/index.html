export class NeuralNetwork {
  constructor(container) {
    this.container = container;
    this.nodes = [];
    this.connections = [];
    this.svg = this.createSVG();
    this.init();
    this.animate();
  }

  createSVG() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    this.container.appendChild(svg);
    return svg;
  }

  init() {
    // Create nodes
    const layers = [4, 6, 6, 4];
    let xOffset = 40;
    
    layers.forEach((nodeCount, layerIndex) => {
      const spacing = this.container.clientHeight / (nodeCount + 1);
      for (let i = 0; i < nodeCount; i++) {
        const x = xOffset;
        const y = spacing * (i + 1);
        this.nodes.push({ x, y, layer: layerIndex });
      }
      xOffset += this.container.clientWidth / (layers.length + 1);
    });

    // Create connections
    this.nodes.forEach((node, i) => {
      const nextLayer = this.nodes.filter(n => n.layer === node.layer + 1);
      nextLayer.forEach(target => {
        this.connections.push({
          source: node,
          target,
          activity: Math.random()
        });
      });
    });
  }

  draw() {
    this.svg.innerHTML = '';
    
    // Draw connections
    this.connections.forEach(conn => {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", conn.source.x);
      line.setAttribute("y1", conn.source.y);
      line.setAttribute("x2", conn.target.x);
      line.setAttribute("y2", conn.target.y);
      line.setAttribute("stroke", `rgba(0, 255, 157, ${conn.activity})`);
      line.setAttribute("stroke-width", "1");
      this.svg.appendChild(line);
    });

    // Draw nodes
    this.nodes.forEach(node => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", node.x);
      circle.setAttribute("cy", node.y);
      circle.setAttribute("r", "4");
      circle.setAttribute("fill", "#00ff9d");
      this.svg.appendChild(circle);
    });
  }

  animate() {
    this.connections.forEach(conn => {
      conn.activity = Math.max(0.1, Math.sin(Date.now() / 1000 + conn.source.x));
    });
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize the neural network visualization
const networkContainer = document.querySelector('.neural-network');
new NeuralNetwork(networkContainer);