import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/controls/OrbitControls.js';

class EarthSimulation {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('worldCanvas'),
            antialias: true 
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        
        this.particleCount = 50000;
        this.particles = this.createParticles();
        this.starField = this.createStarField();
        
        this.initialCameraPosition = new THREE.Vector3(0, 0, 5);
        this.camera.position.copy(this.initialCameraPosition);
        
        // Camera movement properties
        this.movementSpeed = 0.05;
        this.rotationSpeed = 0.03; 
        this.keyState = {};
        
        // Camera rotation setup
        this.cameraRotationMatrix = new THREE.Matrix4();
        this.rotationMatrix = new THREE.Matrix4();
        
        this.animate();
        this.setupEventListeners();
        this.setupButtons();
        this.setupKeyboardControls();
    }
    
    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        
        for (let i = 0; i < this.particleCount; i++) {
            // Spherical coordinate generation for roughly spherical shape
            const phi = Math.acos(1 - 2 * Math.random());
            const theta = Math.random() * 2 * Math.PI;
            
            const radius = 1 + Math.random() * 0.2; // Slight variation in radius
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            positions.push(x, y, z);
            
            // Color gradient based on position
            const r = Math.abs(x);
            const g = Math.abs(y);
            const b = Math.abs(z);
            
            colors.push(r, g, b);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.02,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        
        const particleSystem = new THREE.Points(geometry, material);
        this.scene.add(particleSystem);
        
        return particleSystem;
    }
    
    createStarField() {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        
        for (let i = 0; i < 10000; i++) {
            // Distribute stars in a large sphere
            const phi = Math.acos(1 - 2 * Math.random());
            const theta = Math.random() * 2 * Math.PI;
            
            const radius = 50 + Math.random() * 20; // Larger radius for background
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            positions.push(x, y, z);
            
            // Color gradient from red to blue
            const t = Math.random(); // Random interpolation
            const r = 1 - t; // Red component decreases
            const b = t; // Blue component increases
            const w = 1; // White/brightness component
            
            colors.push(r, w, b);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        
        const starField = new THREE.Points(geometry, material);
        this.scene.add(starField);
        
        return starField;
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update camera position based on keyboard input
        this.updateCameraPosition();
        this.updateCameraRotation();
        
        // Slow rotation of particles and stars
        this.particles.rotation.y += 0.001;
        this.particles.rotation.x += 0.0005;
        this.starField.rotation.y += 0.0005;
        this.starField.rotation.x += 0.0002;
        
        this.renderer.render(this.scene, this.camera);
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    setupButtons() {
        const centerEarthBtn = document.getElementById('centerEarthBtn');
        const resetCameraBtn = document.getElementById('resetCameraBtn');
        
        centerEarthBtn.addEventListener('click', () => this.zoomToEarthCore());
        resetCameraBtn.addEventListener('click', () => this.resetCamera());
    }
    
    setupKeyboardControls() {
        // Track key states
        window.addEventListener('keydown', (event) => {
            this.keyState[event.key.toLowerCase()] = true;
        });
        
        window.addEventListener('keyup', (event) => {
            this.keyState[event.key.toLowerCase()] = false;
        });
    }
    
    updateCameraPosition() {
        // Create a movement vector
        const moveVector = new THREE.Vector3();
        
        // Create direction vectors
        const forward = new THREE.Vector3(0, 0, -1);
        const right = new THREE.Vector3(1, 0, 0);
        const up = new THREE.Vector3(0, 1, 0);
        
        // Apply current rotation to direction vectors
        forward.applyMatrix4(this.cameraRotationMatrix);
        right.applyMatrix4(this.cameraRotationMatrix);
        
        // W/S - move forward/backward along forward vector
        if (this.keyState['w']) {
            moveVector.add(forward.multiplyScalar(this.movementSpeed));
        }
        if (this.keyState['s']) {
            moveVector.sub(forward.multiplyScalar(this.movementSpeed));
        }
        
        // A/D - move left/right along right vector
        if (this.keyState['a']) {
            moveVector.sub(right.multiplyScalar(this.movementSpeed));
        }
        if (this.keyState['d']) {
            moveVector.add(right.multiplyScalar(this.movementSpeed));
        }
        
        // Apply the movement
        this.camera.position.add(moveVector);
    }
    
    updateCameraRotation() {
        // Reset rotation matrix
        this.rotationMatrix.identity();
        
        // Q/E rotation logic
        if (this.keyState['q'] || this.keyState['e']) {
            // Determine rotation axis based on Shift key
            const isShiftPressed = this.keyState['shift'];
            const rotationAxis = isShiftPressed ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
            const rotationDirection = this.keyState['q'] ? 1 : -1;
            
            // Create rotation matrix
            this.rotationMatrix.makeRotationAxis(rotationAxis, rotationDirection * this.rotationSpeed);
            
            // Combine rotations
            this.cameraRotationMatrix.multiply(this.rotationMatrix);
            
            // Apply rotation to camera
            this.camera.quaternion.setFromRotationMatrix(this.cameraRotationMatrix);
        }
    }
    
    zoomToEarthCore() {
        // Animate camera to the center of the Earth
        const targetPosition = new THREE.Vector3(0, 0, 0);
        const duration = 1000; // 1 second
        const startPosition = this.camera.position.clone();
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = this.easeInOutCubic(progress);
            
            this.camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    resetCamera() {
        // Animate camera back to initial position
        const duration = 1000; // 1 second
        const startPosition = this.camera.position.clone();
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = this.easeInOutCubic(progress);
            
            this.camera.position.lerpVectors(startPosition, this.initialCameraPosition, easeProgress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    // Cubic ease in-out function for smooth animation
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
}

// Initialize the simulation when the page loads
window.addEventListener('load', () => {
    new EarthSimulation();
});