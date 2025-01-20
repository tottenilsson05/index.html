import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

class IndemnifiedScene {
  constructor() {
    document.title = "$2nazicats";
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.isRotating = true;
    this.rotationSpeed = 1;
    this.errors = [];
    this.time = 0;
    this.aiNodes = [];
    this.cssScene = new THREE.Scene();
    this.cssRenderer = new CSS3DRenderer();
    this.textElements = [];
    this.locationRequested = false;
    this.init();
    this.initTimestamp();
    this.initCatWindow();
  }

  init() {
    // Setup renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('scene-container').appendChild(this.renderer.domElement);

    // Setup CSS renderer
    this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
    this.cssRenderer.domElement.style.position = 'absolute';
    this.cssRenderer.domElement.style.top = '0';
    this.cssRenderer.domElement.style.pointerEvents = 'none';
    document.getElementById('scene-container').appendChild(this.cssRenderer.domElement);

    // Setup camera
    this.camera.position.z = 5;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(ambientLight, directionalLight);

    // Create the main object
    this.createObject();

    // Create error objects
    this.createErrors(250);

    // Create AI nodes
    this.createAINodes(100);

    // Setup controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Setup event listeners
    window.addEventListener('resize', () => this.onWindowResize());
    this.setupControlListeners();

    // Add rotating text elements
    this.createRotatingTexts();

    // Start animation loop
    this.animate();
  }

  createObject() {
    const geometry = new THREE.IcosahedronGeometry(1, 1);
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ff88,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    
    this.object = new THREE.Mesh(geometry, material);
    
    // Add inner solid object
    const innerGeometry = new THREE.IcosahedronGeometry(0.8, 1);
    const innerMaterial = new THREE.MeshPhongMaterial({
      color: 0x004422,
      transparent: true,
      opacity: 0.6,
    });
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    
    this.object.add(innerMesh);
    this.scene.add(this.object);
  }

  createErrors(count) {
    const errorGeometry = new THREE.TetrahedronGeometry(0.1, 0);
    const errorMaterial = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });

    for (let i = 0; i < count; i++) {
      const error = new THREE.Mesh(errorGeometry, errorMaterial);
      
      // Random initial positions in a sphere around the center
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 3;
      
      error.position.x = radius * Math.sin(theta) * Math.cos(phi);
      error.position.y = radius * Math.sin(theta) * Math.sin(phi);
      error.position.z = radius * Math.cos(theta);
      
      // Store initial position for animation
      error.userData.initialPos = error.position.clone();
      error.userData.speed = 0.5 + Math.random() * 1.5;
      error.userData.offset = Math.random() * Math.PI * 2;
      
      this.errors.push(error);
      this.scene.add(error);
    }
  }

  createAINodes(count) {
    // Create a unique geometry for AI nodes
    const nodeGeometry = new THREE.OctahedronGeometry(0.15, 0);
    
    // Create special glow material
    const nodeMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      shininess: 90,
      transparent: true,
      opacity: 0.8,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5
    });

    const connectionMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.2
    });

    for (let i = 0; i < count; i++) {
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
      
      // Position nodes in a more structured pattern suggesting a neural network
      const radius = 4 + Math.random() * 2;
      const theta = (i / count) * Math.PI * 2;
      const height = (Math.random() - 0.5) * 4;
      
      node.position.x = radius * Math.cos(theta);
      node.position.y = height;
      node.position.z = radius * Math.sin(theta);
      
      // Store animation parameters
      node.userData.basePosition = node.position.clone();
      node.userData.phase = Math.random() * Math.PI * 2;
      node.userData.amplitude = 0.1 + Math.random() * 0.2;
      node.userData.frequency = 0.5 + Math.random() * 1;
      
      // Create connections between nearby nodes
      if (i > 0) {
        const prevNode = this.aiNodes[i - 1];
        const connectionGeometry = new THREE.BufferGeometry().setFromPoints([
          node.position,
          prevNode.position
        ]);
        const line = new THREE.Line(connectionGeometry, connectionMaterial);
        this.scene.add(line);
        node.userData.connection = line;
      }
      
      this.aiNodes.push(node);
      this.scene.add(node);
    }
  }

  setupControlListeners() {
    document.getElementById('rotate').addEventListener('click', () => {
      this.isRotating = !this.isRotating;
    });

    document.getElementById('scale').addEventListener('input', (e) => {
      const scale = parseFloat(e.target.value);
      this.object.scale.setScalar(scale);
    });

    document.getElementById('speed').addEventListener('input', (e) => {
      this.rotationSpeed = parseFloat(e.target.value);
    });
  }

  createRotatingTexts() {
    const texts = [
      { text: '1.8e308 confirmed? real?', y: 1.5 },
      { text: 'undefined is not an object sphere rotation glimse@<99>true:', y: -1.5, isError: true },
      { text: 'sonnet 3.5', y: 2.0 },
      { text: '-1 runs remaining', y: -2.0 },
      { text: 'BASIC PLAN', y: 0.5 }
    ];

    texts.forEach(textConfig => {
      const element = document.createElement('div');
      element.className = 'rotating-text';
      if (textConfig.isError) {
        element.className += ' error-box';
        const span = document.createElement('span');
        span.textContent = textConfig.text;
        element.appendChild(span);
      } else {
        element.textContent = textConfig.text;
      }
      element.style.color = textConfig.isError ? '#ff0000' : 'white';
      element.style.fontSize = '24px';
      element.style.fontFamily = 'Arial, sans-serif';
      element.style.padding = '10px';
      element.style.whiteSpace = 'nowrap';
      
      const textObj = new CSS3DObject(element);
      textObj.position.set(0, textConfig.y, 0);
      textObj.scale.set(0.01, 0.01, 0.01);
      this.cssScene.add(textObj);
      this.textElements.push(textObj);
    });

    // Create Earth
    const earthGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x4477ff,
      shininess: 25,
      transparent: true,
      opacity: 0.8
    });

    // Create atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(0.52, 32, 32);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x88aaff,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    });

    // Create continents using noise-like patterns
    const continentsGeometry = new THREE.SphereGeometry(0.501, 32, 32);
    const continentsMaterial = new THREE.MeshPhongMaterial({
      color: 0x33aa33,
      transparent: true,
      opacity: 0.7
    });

    this.earth = new THREE.Group();
    const earthCore = new THREE.Mesh(earthGeometry, earthMaterial);
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    const continents = new THREE.Mesh(continentsGeometry, continentsMaterial);

    // Add cloud layer
    const cloudGeometry = new THREE.SphereGeometry(0.515, 32, 32);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);

    this.earth.add(earthCore);
    this.earth.add(atmosphere);
    this.earth.add(continents);
    this.earth.add(clouds);
    
    // Position Earth in the scene
    this.earth.position.set(-3, -2, -3);
    this.scene.add(this.earth);
  }

  updateErrors() {
    this.time += 0.01;
    
    this.errors.forEach((error, index) => {
      const initialPos = error.userData.initialPos;
      const speed = error.userData.speed;
      const offset = error.userData.offset;
      
      // Create complex orbital movement
      error.position.x = initialPos.x * Math.cos(this.time * speed + offset);
      error.position.y = initialPos.y * Math.sin(this.time * speed + offset);
      error.position.z = initialPos.z * Math.cos(this.time * speed * 0.5 + offset);
      
      // Rotate each error
      error.rotation.x += 0.02;
      error.rotation.y += 0.03;
      
      // Pulse size
      const scale = 1 + 0.2 * Math.sin(this.time * 3 + index);
      error.scale.setScalar(scale);
    });
  }

  updateAINodes() {
    const time = this.time;
    
    this.aiNodes.forEach((node, index) => {
      // Create floating motion
      const basePos = node.userData.basePosition;
      const phase = node.userData.phase;
      const amplitude = node.userData.amplitude;
      const frequency = node.userData.frequency;
      
      node.position.x = basePos.x + Math.sin(time * frequency + phase) * amplitude;
      node.position.y = basePos.y + Math.cos(time * frequency + phase) * amplitude;
      node.position.z = basePos.z + Math.sin(time * frequency * 0.5 + phase) * amplitude;
      
      // Rotate nodes
      node.rotation.x += 0.01;
      node.rotation.y += 0.01;
      
      // Pulse opacity and emissive intensity
      const material = node.material;
      material.opacity = 0.5 + 0.3 * Math.sin(time * 2 + index);
      material.emissiveIntensity = 0.3 + 0.2 * Math.sin(time * 3 + index);
      
      // Update connection lines
      if (node.userData.connection) {
        const prevNode = this.aiNodes[index - 1];
        const positions = node.userData.connection.geometry.attributes.position;
        positions.setXYZ(0, node.position.x, node.position.y, node.position.z);
        positions.setXYZ(1, prevNode.position.x, prevNode.position.y, prevNode.position.z);
        positions.needsUpdate = true;
      }
    });
  }

  updateRotatingTexts() {
    const time = this.time;
    this.textElements.forEach((textObj, index) => {
      const radius = 2 + Math.sin(time * 0.5 + index) * 0.5;
      textObj.position.x = Math.sin(time + index * 1.2) * radius;
      textObj.position.z = Math.cos(time + index * 1.2) * radius;
      textObj.rotation.y = -Math.atan2(textObj.position.x, textObj.position.z) + Math.PI;
      
      // Add some vertical motion
      textObj.position.y += Math.sin(time * 0.8 + index * 0.5) * 0.01;
    });

    // Rotate Earth
    if (this.earth) {
      this.earth.rotation.y += 0.002;
      
      // Add subtle wobble
      this.earth.rotation.x = Math.sin(time * 0.2) * 0.1;
      
      // Make clouds rotate slightly faster
      this.earth.children[3].rotation.y += 0.0005;
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
  }

  initTimestamp() {
    this.timestampElement = document.getElementById('timestamp');
    this.updateTimestamp();
    // Update timestamp every second
    setInterval(() => this.updateTimestamp(), 1000);
  }

  async initCatWindow() {
    const catContainer = document.getElementById('cat-container');
    
    // Create two cats
    for (let catIndex = 0; catIndex < 2; catIndex++) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 100 100");
      
      // Cat head
      const head = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      head.setAttribute("cx", "50");
      head.setAttribute("cy", "50");
      head.setAttribute("r", "30");
      head.setAttribute("fill", "none");
      head.setAttribute("stroke", catIndex === 0 ? "cyan" : "#ff69b4"); // First cat cyan, second pink
      head.setAttribute("stroke-width", "2");
      
      // Cat ears
      const leftEar = document.createElementNS("http://www.w3.org/2000/svg", "path");
      leftEar.setAttribute("d", "M35,30 L25,10 L45,25 Z");
      leftEar.setAttribute("fill", catIndex === 0 ? "cyan" : "#ff69b4");
      
      const rightEar = document.createElementNS("http://www.w3.org/2000/svg", "path");
      rightEar.setAttribute("d", "M65,30 L75,10 L55,25 Z");
      rightEar.setAttribute("fill", catIndex === 0 ? "cyan" : "#ff69b4");
      
      // Cat eyes
      const leftEye = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      leftEye.setAttribute("cx", "35");
      leftEye.setAttribute("cy", "45");
      leftEye.setAttribute("r", "5");
      leftEye.setAttribute("fill", catIndex === 0 ? "cyan" : "#ff69b4");
      
      const rightEye = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      rightEye.setAttribute("cx", "65");
      rightEye.setAttribute("cy", "45");
      rightEye.setAttribute("r", "5");
      rightEye.setAttribute("fill", catIndex === 0 ? "cyan" : "#ff69b4");
      
      // Animate eyes with different timing for each cat
      const eyeAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animate");
      eyeAnimation.setAttribute("attributeName", "r");
      eyeAnimation.setAttribute("values", "5;3;5");
      eyeAnimation.setAttribute("dur", catIndex === 0 ? "2s" : "2.5s");
      eyeAnimation.setAttribute("repeatCount", "indefinite");
      
      leftEye.appendChild(eyeAnimation.cloneNode());
      rightEye.appendChild(eyeAnimation);
      
      // Cat nose
      const nose = document.createElementNS("http://www.w3.org/2000/svg", "path");
      nose.setAttribute("d", "M50,55 L45,60 L55,60 Z");
      nose.setAttribute("fill", catIndex === 0 ? "cyan" : "#ff69b4");
      
      // Cat whiskers
      const whiskers = document.createElementNS("http://www.w3.org/2000/svg", "g");
      whiskers.setAttribute("stroke", catIndex === 0 ? "cyan" : "#ff69b4");
      whiskers.setAttribute("stroke-width", "1");
      
      const whiskerPaths = [
        "M30,60 L10,55",
        "M30,65 L10,65",
        "M30,70 L10,75",
        "M70,60 L90,55",
        "M70,65 L90,65",
        "M70,70 L90,75"
      ];
      
      whiskerPaths.forEach(d => {
        const whisker = document.createElementNS("http://www.w3.org/2000/svg", "path");
        whisker.setAttribute("d", d);
        whiskers.appendChild(whisker);
      });
      
      svg.appendChild(head);
      svg.appendChild(leftEar);
      svg.appendChild(rightEar);
      svg.appendChild(leftEye);
      svg.appendChild(rightEye);
      svg.appendChild(nose);
      svg.appendChild(whiskers);
      
      // Add digital effects with different timing for each cat
      const digitalEffects = document.createElementNS("http://www.w3.org/2000/svg", "g");
      for (let i = 0; i < 10; i++) {
        const effect = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        effect.setAttribute("cx", Math.random() * 100);
        effect.setAttribute("cy", Math.random() * 100);
        effect.setAttribute("r", Math.random() * 2);
        effect.setAttribute("fill", catIndex === 0 ? "cyan" : "#ff69b4");
        effect.setAttribute("opacity", "0.5");
        
        const animation = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        animation.setAttribute("attributeName", "opacity");
        animation.setAttribute("values", "0.5;0;0.5");
        animation.setAttribute("dur", `${1 + Math.random() * 2 + catIndex}s`);
        animation.setAttribute("repeatCount", "indefinite");
        
        effect.appendChild(animation);
        digitalEffects.appendChild(effect);
      }
      
      svg.appendChild(digitalEffects);
      catContainer.appendChild(svg);
    }
  }

  updateTimestamp() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Try to get location using the browser's geolocation API
    if (navigator.geolocation && !this.locationRequested) {
      this.locationRequested = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.updateLocationDisplay(position.coords.latitude, position.coords.longitude);
        },
        () => {
          this.timestampElement.innerHTML = `
            <div>${timeString}</div>
            <div>${dateString}</div>
            <div>${timezone}</div>
            <div>Location: Unknown</div>
          `;
        }
      );
    }
  }

  async updateLocationDisplay(lat, lon) {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      const data = await response.json();
      const location = data.display_name.split(',')[0];
      
      this.timestampElement.innerHTML = `
        <div>${new Date().toLocaleTimeString()}</div>
        <div>${new Date().toLocaleDateString()}</div>
        <div>${Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
        <div>Location: ${location}</div>
      `;
    } catch (error) {
      this.timestampElement.innerHTML = `
        <div>${new Date().toLocaleTimeString()}</div>
        <div>${new Date().toLocaleDateString()}</div>
        <div>${Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
        <div>Location: Error fetching</div>
      `;
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.isRotating) {
      this.object.rotation.x += 0.01 * this.rotationSpeed;
      this.object.rotation.y += 0.01 * this.rotationSpeed;
    }

    this.updateErrors();
    this.updateAINodes();
    this.updateRotatingTexts();
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.cssRenderer.render(this.cssScene, this.camera);
  }
}

// Initialize the scene
new IndemnifiedScene();