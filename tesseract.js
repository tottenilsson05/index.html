class Tesseract {
  constructor() {
    this.initializeStars();
    
    this.canvas = document.getElementById('tesseractCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.points = [];
    this.edges = [];
    this.faces = [];
    this.setupCanvas();
    this.bindControls();
    
    // Default parameters
    this.rotationXY = 0;
    this.rotationZW = 0;
    this.size = 100;
    this.perspective = 5;
    this.speedXY = 0.01;
    this.speedZW = 0.01;
    this.faceOpacity = 0; // 0: transparent, 0.3: translucent, 1: opaque
    
    // Camera parameters
    this.cameraAngleX = 0;
    this.cameraAngleY = 0;
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    
    // Add touch/mouse event listeners
    this.setupInteraction();
    this.setupTransparencyControls();
    
    // Get angle display elements
    this.xyAngleDisplay = document.getElementById('xyAngle');
    this.zwAngleDisplay = document.getElementById('zwAngle');
    this.cameraXDisplay = document.getElementById('cameraX');
    this.cameraYDisplay = document.getElementById('cameraY');
    
    this.settings = {
      showStars: true,
      lightMode: false,
      cubeColor: '#4a9eff',
      language: 'en',
      currentShape: 'tesseract' // Set default shape to 'tesseract'
    };
    
    this.translations = {
      en: { 
        settings: 'Settings', 
        stars: 'Show Stars', 
        lightMode: 'Light Mode', 
        cubeColor: 'Cube Color', 
        language: 'Language',
        shapes: 'Shapes', 
        tesseract: 'Tesseract', 
        hypersphere: 'Hypersphere' 
      },
      es: { 
        settings: 'Ajustes', 
        stars: 'Mostrar Estrellas', 
        lightMode: 'Modo Claro', 
        cubeColor: 'Color del Cubo', 
        language: 'Idioma',
        shapes: 'Formas', 
        tesseract: 'Teseracto', 
        hypersphere: 'Hiperesfera' 
      },
      fr: { 
        settings: 'Paramètres', 
        stars: 'Afficher les Étoiles', 
        lightMode: 'Mode Clair', 
        cubeColor: 'Couleur du Cube', 
        language: 'Langue',
        shapes: 'Formes', 
        tesseract: 'Tesseract', 
        hypersphere: 'Hypersphère' 
      },
      de: { 
        settings: 'Einstellungen', 
        stars: 'Sterne Anzeigen', 
        lightMode: 'Hellmodus', 
        cubeColor: 'Würfelfarbe', 
        language: 'Sprache',
        shapes: 'Formen', 
        tesseract: 'Tesserakt', 
        hypersphere: 'Hypersphäre' 
      },
      it: { 
        settings: 'Impostazioni', 
        stars: 'Mostra Stelle', 
        lightMode: 'Modalità Chiara', 
        cubeColor: 'Colore Cubo', 
        language: 'Lingua',
        shapes: 'Forme', 
        tesseract: 'Tesseratto', 
        hypersphere: 'Ipersfera' 
      },
      pt: { 
        settings: 'Configurações', 
        stars: 'Mostrar Estrelas', 
        lightMode: 'Modo Claro', 
        cubeColor: 'Cor do Cubo', 
        language: 'Idioma',
        shapes: 'Formas', 
        tesseract: 'Tesseracto', 
        hypersphere: 'Hipersfera' 
      },
      ru: { 
        settings: 'Настройки', 
        stars: 'Показать Звезды', 
        lightMode: 'Светлый Режим', 
        cubeColor: 'Цвет Куба', 
        language: 'Язык',
        shapes: 'Фигуры', 
        tesseract: 'Тессеракт', 
        hypersphere: 'Гиперсфера' 
      },
      zh: { 
        settings: '设置', 
        stars: '显示星星', 
        lightMode: '明亮模式', 
        cubeColor: '立方体颜色', 
        language: '语言',
        shapes: '形状', 
        tesseract: '超立方体', 
        hypersphere: '超球体' 
      },
      ja: { 
        settings: '設定', 
        stars: '星を表示', 
        lightMode: 'ライトモード', 
        cubeColor: 'キューブの色', 
        language: '言語',
        shapes: '形状', 
        tesseract: 'テッセラクト', 
        hypersphere: 'ハイパースフィア' 
      },
      ko: { 
        settings: '설정', 
        stars: '별 표시', 
        lightMode: '라이트 모드', 
        cubeColor: '큐브 색상', 
        language: '언어',
        shapes: '형태', 
        tesseract: '초 立方体', 
        hypersphere: '초 구체' 
      },
      ar: { 
        settings: 'إعدادات', 
        stars: 'عرض النجوم', 
        lightMode: 'الوضع المضيء', 
        cubeColor: 'لون المكعب', 
        language: 'اللغة',
        shapes: 'الأشكال', 
        tesseract: 'التسركت', 
        hypersphere: 'الهيبسفير' 
      },
      hi: { 
        settings: 'सेटिंग्स', 
        stars: 'तारे दिखाएं', 
        lightMode: 'लाइट मोड', 
        cubeColor: 'क्यूब का रंग', 
        language: 'भाषा',
        shapes: 'आकार', 
        tesseract: 'टेसरैक्ट', 
        hypersphere: 'हाइपरस्फियर' 
      },
      tr: { 
        settings: 'Ayarlar', 
        stars: 'Yıldızları Göster', 
        lightMode: 'Aydınlık Mod', 
        cubeColor: 'Küp Rengi', 
        language: 'Dil',
        shapes: 'Şekiller', 
        tesseract: 'Tesserakt', 
        hypersphere: 'Hipersfer' 
      },
      nl: { 
        settings: 'Instellingen', 
        stars: 'Toon Sterren', 
        lightMode: 'Lichte Modus', 
        cubeColor: 'Kubus Kleur', 
        language: 'Taal',
        shapes: 'Vormen', 
        tesseract: 'Tesseract', 
        hypersphere: 'Hypersfeer' 
      },
      pl: { 
        settings: 'Ustawienia', 
        stars: 'Pokaż Gwiazdy', 
        lightMode: 'Tryb Jasny', 
        cubeColor: 'Kolor Kostki', 
        language: 'Język',
        shapes: 'Kształty', 
        tesseract: 'Tesserakt', 
        hypersphere: 'Hipersfera' 
      },
    };
    
    this.initializeGeometry();
    this.initializeSettings();
    
    // Start animation
    this.animate();
  }

  setupTransparencyControls() {
    const buttons = ['transparent', 'translucent', 'opaque'];
    const opacities = [0, 0.3, 1];

    buttons.forEach((id, index) => {
      document.getElementById(id).addEventListener('click', () => {
        this.faceOpacity = opacities[index];
        
        // Update active button state
        buttons.forEach(btnId => {
          document.getElementById(btnId).classList.remove('active');
        });
        document.getElementById(id).classList.add('active');
      });
    });
  }

  setupInteraction() {
    const startDrag = (x, y) => {
      this.isDragging = true;
      this.lastMouseX = x;
      this.lastMouseY = y;
    };

    const endDrag = () => {
      this.isDragging = false;
    };

    const drag = (x, y) => {
      if (!this.isDragging) return;
      
      const deltaX = x - this.lastMouseX;
      const deltaY = y - this.lastMouseY;
      
      this.cameraAngleX += deltaY * 0.01;
      this.cameraAngleY += deltaX * 0.01;
      
      this.cameraAngleX = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.cameraAngleX));
      
      this.lastMouseX = x;
      this.lastMouseY = y;
    };

    this.canvas.addEventListener('mousedown', (e) => {
      startDrag(e.clientX, e.clientY);
    });
    
    window.addEventListener('mousemove', (e) => {
      drag(e.clientX, e.clientY);
    });
    
    window.addEventListener('mouseup', endDrag);

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY);
    });
    
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      drag(touch.clientX, touch.clientY);
    });
    
    this.canvas.addEventListener('touchend', endDrag);
  }

  updateDirectionIndicator() {
    const svg = document.querySelector('.direction-indicator svg g');
    
    // Create transformation matrix based on camera angles
    const transform = `
      rotate(${this.cameraAngleY * 180 / Math.PI}) 
      rotate(${this.cameraAngleX * 180 / Math.PI}, 0, 1)
    `;
    
    svg.setAttribute('transform', transform);

    // Update cube vertices
    const cubeSize = 10;
    const vertices = [
      [-cubeSize, -cubeSize, -cubeSize], // 0
      [cubeSize, -cubeSize, -cubeSize],  // 1
      [cubeSize, cubeSize, -cubeSize],   // 2
      [-cubeSize, cubeSize, -cubeSize],  // 3
      [-cubeSize, -cubeSize, cubeSize],  // 4
      [cubeSize, -cubeSize, cubeSize],   // 5
      [cubeSize, cubeSize, cubeSize],    // 6
      [-cubeSize, cubeSize, cubeSize]    // 7
    ];

    // Rotate vertices
    const rotatedVertices = vertices.map(v => {
      // First rotate around X
      let [x, y, z] = v;
      let y1 = y * Math.cos(this.cameraAngleX) - z * Math.sin(this.cameraAngleX);
      let z1 = y * Math.sin(this.cameraAngleX) + z * Math.cos(this.cameraAngleX);
      
      // Then rotate around Y
      let x2 = x * Math.cos(this.cameraAngleY) + z1 * Math.sin(this.cameraAngleY);
      let z2 = -x * Math.sin(this.cameraAngleY) + z1 * Math.cos(this.cameraAngleY);
      
      return [x2, y1, z2];
    });

    // Update cube path
    const cubePath = document.getElementById('cube-path');
    if (cubePath) {
      const edges = [
        [0,1], [1,2], [2,3], [3,0], // front face
        [4,5], [5,6], [6,7], [7,4], // back face
        [0,4], [1,5], [2,6], [3,7]  // connecting edges
      ];

      const pathData = edges.map(([i, j]) => {
        const v1 = rotatedVertices[i];
        const v2 = rotatedVertices[j];
        return `M ${v1[0]} ${v1[1]} L ${v2[0]} ${v2[1]}`;
      }).join(' ');

      cubePath.setAttribute('d', pathData);
    }

    // Update orientation labels positions
    const labelPositions = {
      'front-label': [0, 0, -cubeSize - 5],
      'back-label': [0, 0, cubeSize + 5],
      'left-label': [-cubeSize - 5, 0, 0],
      'right-label': [cubeSize + 5, 0, 0],
      'top-label': [0, -cubeSize - 5, 0],
      'bottom-label': [0, cubeSize + 5, 0]
    };

    // Update each label position
    Object.entries(labelPositions).forEach(([id, pos]) => {
      const label = document.getElementById(id);
      if (label) {
        const [x, y, z] = pos;
        let y1 = y * Math.cos(this.cameraAngleX) - z * Math.sin(this.cameraAngleX);
        let z1 = y * Math.sin(this.cameraAngleX) + z * Math.cos(this.cameraAngleX);
        
        let x2 = x * Math.cos(this.cameraAngleY) + z1 * Math.sin(this.cameraAngleY);
        let z2 = -x * Math.sin(this.cameraAngleY) + z1 * Math.cos(this.cameraAngleY);

        // Calculate visibility based on z-coordinate
        const visibility = z2 > 0 ? 'hidden' : 'visible';
        label.setAttribute('visibility', visibility);
        
        // Update position
        label.setAttribute('x', x2);
        label.setAttribute('y', y1);
        
        // Scale text size based on z-depth
        const scale = 1 - (z2 / 50); // Adjust divisor to control scaling effect
        label.setAttribute('font-size', `${3 * scale}px`);
      }
    });
  }

  setupCanvas() {
    const updateSize = () => {
      const size = Math.min(window.innerWidth - 40, 500);
      this.canvas.width = size;
      this.canvas.height = size;
    };
    
    window.addEventListener('resize', updateSize);
    updateSize();
  }

  bindControls() {
    document.getElementById('speedXY').addEventListener('input', (e) => {
      this.speedXY = parseFloat(e.target.value);
    });
    
    document.getElementById('speedZW').addEventListener('input', (e) => {
      this.speedZW = parseFloat(e.target.value);
    });
    
    document.getElementById('size').addEventListener('input', (e) => {
      this.size = parseFloat(e.target.value);
    });
    
    document.getElementById('perspective').addEventListener('input', (e) => {
      this.perspective = parseFloat(e.target.value);
    });
  }

  initializeGeometry() {
    // Reset arrays
    this.points = [];
    this.edges = [];
    this.faces = [];

    if (this.settings.currentShape === 'tesseract') {
      this.initializeTesseract();
    } else if (this.settings.currentShape === 'hypersphere') {
      this.initializeHypersphere();
    }
  }

  initializeTesseract() {
    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
          for (let w = -1; w <= 1; w += 2) {
            this.points.push([x, y, z, w]);
          }
        }
      }
    }

    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        let diffCount = 0;
        for (let k = 0; k < 4; k++) {
          if (this.points[i][k] !== this.points[j][k]) diffCount++;
        }
        if (diffCount === 1) {
          this.edges.push([i, j]);
        }
      }
    }

    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        for (let k = j + 1; k < 16; k++) {
          for (let l = k + 1; l < 16; l++) {
            if (this.isSquareFace(i, j, k, l)) {
              this.faces.push([i, j, k, l]);
            }
          }
        }
      }
    }
  }

  isSquareFace(i, j, k, l) {
    const points = [this.points[i], this.points[j], this.points[k], this.points[l]];
    const diffs = [];
    
    for (let m = 0; m < points.length; m++) {
      for (let n = m + 1; n < points.length; n++) {
        let diff = 0;
        for (let d = 0; d < 4; d++) {
          if (points[m][d] !== points[n][d]) diff++;
        }
        diffs.push(diff);
      }
    }
    
    diffs.sort();
    return JSON.stringify(diffs) === JSON.stringify([1, 1, 1, 1, 2, 2]);
  }

  initializeHypersphere() {
    // Generate points on a 4D hypersphere with more elegant and controlled distribution
    const resolution = 12; // Increased resolution for more detailed shape
    const radius = 1;

    this.points = [];
    this.edges = [];
    this.faces = [];

    // Use Fibonacci sphere method for more uniform point distribution
    for (let i = 0; i < resolution * resolution; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / (resolution * resolution));
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      // 4D point generation with additional complexity
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      const w = radius * Math.sin(phi) * Math.cos(theta + Math.PI/4);

      this.points.push([x, y, z, w]);
    }

    // Create more nuanced edge connections
    const connectionThreshold = 0.4;
    for (let i = 0; i < this.points.length; i++) {
      for (let j = i + 1; j < this.points.length; j++) {
        const dist = Math.sqrt(
          this.points[i].reduce((sum, coord, idx) => 
            sum + Math.pow(coord - this.points[j][idx], 2), 0)
        );
        
        if (dist < connectionThreshold) {
          this.edges.push([i, j]);
        }
      }
    }

    // Create more organic face formations
    for (let i = 0; i < this.points.length - 2; i++) {
      for (let j = i + 1; j < this.points.length - 1; j++) {
        for (let k = j + 1; k < this.points.length; k++) {
          const d1 = this.distance(this.points[i], this.points[j]);
          const d2 = this.distance(this.points[j], this.points[k]);
          const d3 = this.distance(this.points[k], this.points[i]);
          
          if (d1 < connectionThreshold && 
              d2 < connectionThreshold && 
              d3 < connectionThreshold) {
            this.faces.push([i, j, k, k]);
          }
        }
      }
    }
  }

  distance(p1, p2) {
    return Math.sqrt(p1.reduce((sum, coord, idx) => sum + Math.pow(coord - p2[idx], 2), 0));
  }

  rotate4D(point, angleXY, angleZW) {
    let [x, y, z, w] = point;
    
    let x1 = x * Math.cos(angleXY) - y * Math.sin(angleXY);
    let y1 = x * Math.sin(angleXY) + y * Math.cos(angleXY);
    
    let z1 = z * Math.cos(angleZW) - w * Math.sin(angleZW);
    let w1 = z * Math.sin(angleZW) + w * Math.cos(angleZW);
    
    return [x1, y1, z1, w1];
  }

  applyCameraRotation(point) {
    let [x, y, z] = point;
    
    let y1 = y * Math.cos(this.cameraAngleX) - z * Math.sin(this.cameraAngleX);
    let z1 = y * Math.sin(this.cameraAngleX) + z * Math.cos(this.cameraAngleX);
    
    let x1 = x * Math.cos(this.cameraAngleY) + z1 * Math.sin(this.cameraAngleY);
    let z2 = -x * Math.sin(this.cameraAngleY) + z1 * Math.cos(this.cameraAngleY);
    
    return [x1, y1, z2];
  }

  project4Dto3D(point) {
    const w = point[3];
    const projectionFactor = 1 / (this.perspective - w);
    return [
      point[0] * projectionFactor,
      point[1] * projectionFactor,
      point[2] * projectionFactor
    ];
  }

  project3Dto2D(point) {
    const scale = this.size;
    return [
      this.canvas.width/2 + point[0] * scale,
      this.canvas.height/2 + point[1] * scale
    ];
  }

  drawTesseract() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const projectedPoints = this.points.map(p => {
      const rotated = this.rotate4D(p, this.rotationXY, this.rotationZW);
      const projected3D = this.project4Dto3D(rotated);
      const cameraRotated = this.applyCameraRotation(projected3D);
      return this.project3Dto2D(cameraRotated);
    });

    // Draw outlines first for hypersphere
    if (this.settings.currentShape === 'hypersphere') {
      this.ctx.strokeStyle = this.settings.cubeColor;
      this.ctx.lineWidth = 1;
      this.ctx.shadowBlur = 5;
      this.ctx.shadowColor = `${this.settings.cubeColor}80`;

      this.edges.forEach(edge => {
        const [p1, p2] = edge;
        this.ctx.beginPath();
        this.ctx.moveTo(projectedPoints[p1][0], projectedPoints[p1][1]);
        this.ctx.lineTo(projectedPoints[p2][0], projectedPoints[p2][1]);
        this.ctx.stroke();
      });

      this.ctx.shadowBlur = 0;
    }

    // Draw faces first
    if (this.faceOpacity > 0) {
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = `${this.settings.cubeColor}80`; // 50% opacity
      
      this.faces.forEach(face => {
        this.ctx.beginPath();
        this.ctx.moveTo(projectedPoints[face[0]][0], projectedPoints[face[0]][1]);
        this.ctx.lineTo(projectedPoints[face[1]][0], projectedPoints[face[1]][1]);
        this.ctx.lineTo(projectedPoints[face[2]][0], projectedPoints[face[2]][1]);
        this.ctx.lineTo(projectedPoints[face[3]][0], projectedPoints[face[3]][1]);
        this.ctx.closePath();

        const centerX = (projectedPoints[face[0]][0] + projectedPoints[face[2]][0]) / 2;
        const centerY = (projectedPoints[face[0]][1] + projectedPoints[face[2]][1]) / 2;
        const gradient = this.ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, this.size / 2
        );
        gradient.addColorStop(0, `${this.settings.cubeColor}${Math.round(this.faceOpacity * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${this.settings.cubeColor}${Math.round(this.faceOpacity * 0.7 * 255).toString(16).padStart(2, '0')}`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
      });
      
      this.ctx.shadowBlur = 0;
    }

    // Draw edges for transparent and translucent modes
    if (this.faceOpacity <= 0.3) {
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = `${this.settings.cubeColor}cc`; // 80% opacity
      
      this.ctx.strokeStyle = this.faceOpacity === 0 ? 
        this.settings.cubeColor : 
        `${this.settings.cubeColor}cc`; // 80% opacity
      this.ctx.lineWidth = 2;
      
      this.edges.forEach(edge => {
        const [p1, p2] = edge;
        this.ctx.beginPath();
        this.ctx.moveTo(projectedPoints[p1][0], projectedPoints[p1][1]);
        this.ctx.lineTo(projectedPoints[p2][0], projectedPoints[p2][1]);
        this.ctx.stroke();
      });

      this.ctx.shadowBlur = 0;

      // Only draw points in transparent mode
      if (this.faceOpacity === 0) {
        this.ctx.fillStyle = '#fff';
        this.ctx.shadowBlur = 6;
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        
        projectedPoints.forEach(point => {
          this.ctx.beginPath();
          this.ctx.arc(point[0], point[1], 4, 0, Math.PI * 2);
          this.ctx.fill();
        });
      }
    }
  }

  updateAngleDisplays() {
    // Convert radians to degrees and normalize to 0-360
    const normalizeAngle = (rad) => {
      let deg = (rad * 180 / Math.PI) % 360;
      return deg < 0 ? deg + 360 : deg;
    };

    const xyDeg = normalizeAngle(this.rotationXY);
    const zwDeg = normalizeAngle(this.rotationZW);
    const camXDeg = normalizeAngle(this.cameraAngleX);
    const camYDeg = normalizeAngle(this.cameraAngleY);

    this.xyAngleDisplay.textContent = `${Math.round(xyDeg)}°`;
    this.zwAngleDisplay.textContent = `${Math.round(zwDeg)}°`;
    this.cameraXDisplay.textContent = `${Math.round(camXDeg)}°`;
    this.cameraYDisplay.textContent = `${Math.round(camYDeg)}°`;
  }

  initializeSettings() {
    // Create settings button
    const settingsButton = document.createElement('div');
    settingsButton.className = 'settings-button';
    settingsButton.innerHTML = `
      <img src="Untitled882_20250122132237.png" alt="Settings">
    `;
    document.body.appendChild(settingsButton);

    // Create settings modal
    const settingsModal = document.createElement('div');
    settingsModal.className = 'settings-modal hidden';
    settingsModal.innerHTML = this.generateSettingsHTML();
    document.body.appendChild(settingsModal);

    // Toggle settings modal
    settingsButton.addEventListener('click', () => {
      settingsModal.classList.toggle('hidden');
    });

    // Initialize settings controls
    this.initializeSettingsControls();
  }

  generateSettingsHTML() {
    const t = this.translations[this.settings.language];
    const colors = [
      { name: 'Blue', value: '#4a9eff' },
      { name: 'Red', value: '#ff4a4a' },
      { name: 'Green', value: '#4aff4a' },
      { name: 'Purple', value: '#9f4aff' },
      { name: 'Orange', value: '#ff9f4a' },
      { name: 'Pink', value: '#ff4a9f' }
    ];

    const shapes = [
      { id: 'tesseract', name: t.tesseract },
      { id: 'hypersphere', name: t.hypersphere }
    ];

    return `
      <h3>${t.settings}</h3>
      
      <div class="settings-section">
        <div class="settings-section-title">${t.shapes}</div>
        <select class="shape-select" id="shapeSelect">
          ${shapes.map(shape => `
            <option value="${shape.id}" ${this.settings.currentShape === shape.id ? 'selected' : ''}>
              ${shape.name}
            </option>
          `).join('')}
        </select>
      </div>

      <div class="settings-section">
        <div class="switch-container">
          <span>${t.stars}</span>
          <label class="switch">
            <input type="checkbox" id="starsToggle" ${this.settings.showStars ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>
        
        <div class="switch-container">
          <span>${t.lightMode}</span>
          <label class="switch">
            <input type="checkbox" id="lightModeToggle" ${this.settings.lightMode ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">${t.cubeColor}</div>
        <div class="color-buttons">
          ${colors.map(color => `
            <button class="color-button ${this.settings.cubeColor === color.value ? 'active' : ''}"
                    style="background-color: ${color.value}"
                    data-color="${color.value}">
              ${color.name}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">${t.language}</div>
        <select class="language-select" id="languageSelect">
          ${Object.entries(this.translations).map(([code, trans]) => `
            <option value="${code}" ${this.settings.language === code ? 'selected' : ''}>
              ${trans.settings}
            </option>
          `).join('')}
        </select>
      </div>
    `;
  }

  initializeSettingsControls() {
    // Stars toggle
    document.getElementById('starsToggle').addEventListener('change', (e) => {
      this.settings.showStars = e.target.checked;
      const starsContainer = document.querySelector('.stars');
      starsContainer.style.display = e.target.checked ? 'block' : 'none';
    });

    // Light mode toggle
    document.getElementById('lightModeToggle').addEventListener('change', (e) => {
      this.settings.lightMode = e.target.checked;
      document.body.classList.toggle('light-mode', e.target.checked);
    });

    // Color buttons
    document.querySelectorAll('.color-button').forEach(button => {
      button.addEventListener('click', () => {
        this.settings.cubeColor = button.dataset.color;
        document.querySelectorAll('.color-button').forEach(btn => {
          btn.classList.toggle('active', btn === button);
        });
        // Update cube color in the visualization
        this.updateCubeColor();
      });
    });

    // Language select
    document.getElementById('languageSelect').addEventListener('change', (e) => {
      this.settings.language = e.target.value;
      const modal = document.querySelector('.settings-modal');
      modal.innerHTML = this.generateSettingsHTML();
      this.initializeSettingsControls();
    });

    // Shape select
    document.getElementById('shapeSelect').addEventListener('change', (e) => {
      this.settings.currentShape = e.target.value;
      this.initializeGeometry(); // Reinitialize geometry based on selected shape
    });
  }

  updateCubeColor() {
    // Only update specific elements that should change color
    const elementsToUpdate = [
      '#cube-path',
      '.color-button.active'
    ];

    elementsToUpdate.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element.tagName === 'path') {
          element.style.stroke = this.settings.cubeColor;
        } else {
          element.style.backgroundColor = this.settings.cubeColor;
        }
      });
    });
  }

  initializeStars() {
    const starsContainer = document.createElement('div');
    starsContainer.className = 'stars';
    document.body.appendChild(starsContainer);

    // Create more stars for a denser effect
    for (let i = 0; i < 200; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      
      // Random position
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      
      // Varied star sizes for more depth
      const size = Math.random() * 3 + 0.5;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      
      // Random twinkle duration between 1-5s
      star.style.setProperty('--twinkle-duration', `${Math.random() * 4 + 1}s`);
      
      // Random initial delay
      star.style.animationDelay = `${Math.random() * 5}s`;
      
      // Random brightness
      star.style.opacity = Math.random() * 0.5 + 0.5;
      
      starsContainer.appendChild(star);
    }
  }

  animate() {
    this.rotationXY += this.speedXY;
    this.rotationZW += this.speedZW;
    
    // Normalize rotations to keep them within 0-2π
    this.rotationXY %= (Math.PI * 2);
    this.rotationZW %= (Math.PI * 2);
    
    this.drawTesseract();
    this.updateDirectionIndicator();
    this.updateAngleDisplays();
    requestAnimationFrame(() => this.animate());
  }
}

new Tesseract();