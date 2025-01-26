function createSpiralPath(startRadius, endRadius, startAngle, revolutions, points) {
  let d = 'M ';
  const angleStep = (revolutions * 2 * Math.PI) / (points - 1);
  const radiusStep = (endRadius - startRadius) / (points - 1);
  
  for (let i = 0; i < points; i++) {
    const angle = startAngle + (i * angleStep);
    const radius = startRadius + (i * radiusStep);
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    if (i === 0) {
      d += `${x} ${y}`;
    } else {
      d += ` L ${x} ${y}`;
    }
  }
  
  return d;
}

function generateSpirals() {
  const svg = document.getElementById('spiral');
  const numSpirals = 12;
  
  for (let i = 0; i < numSpirals; i++) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.classList.add('spiral-path');
    
    const startAngle = (i * 2 * Math.PI) / numSpirals;
    const pathData = createSpiralPath(10, 450, startAngle, 8, 300);
    
    path.setAttribute('d', pathData);
    path.style.strokeDasharray = '10,10';
    path.style.animationDelay = `${-i * 0.5}s`;
    
    svg.appendChild(path);
  }
}

window.addEventListener('load', generateSpirals);