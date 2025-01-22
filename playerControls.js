import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

export class PlayerControls {
  constructor(controls, camera, settings, doors) {
    if (!controls || !camera || !settings) {
      console.error('Missing required parameters in PlayerControls');
      return;
    }

    this.controls = controls;
    this.camera = camera;
    this.settings = settings;
    this.doors = doors || {};
    
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.canPassThroughDoor = false;
    this.isActive = false;
    
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.prevTime = performance.now();
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.PI_2 = Math.PI / 2;

    // Movement properties with smoother values
    this.headBobTimer = 0;
    this.headBobAmplitude = 0.05; // Reduced for smoother bob
    this.headBobFrequency = 2; // Reduced for smoother movement
    this.initialCameraY = 2;
    this.currentSpeed = 0;
    this.targetSpeed = 0;
    this.acceleration = 0.08; // Added for smoother acceleration
    this.deceleration = 0.05; // Added for smoother deceleration
    this.maxSpeed = 2.5; // Slightly reduced max speed

    // Reduced sway properties
    this.swayAngle = 0;
    this.targetSwayAngle = 0;
    this.verticalSwayOffset = 0;
    this.maxSwayAngle = 0.015; // Reduced sway

    this.boundKeyDown = this.onKeyDown.bind(this);
    this.boundKeyUp = this.onKeyUp.bind(this);

    this.initControls();
    this.setupMouseSensitivity();

    if (this.controls) {
      this.controls.addEventListener('lock', () => {
        this.isActive = true;
      });

      this.controls.addEventListener('unlock', () => {
        this.isActive = false;
        this.resetMovement();
      });
    }
  }

  isMoving() {
    return this.moveForward || this.moveBackward || this.moveLeft || this.moveRight;
  }

  updateHeadBob(delta) {
    if (!this.settings.headBob || !this.isMoving()) {
      this.camera.position.y += (this.initialCameraY - this.camera.position.y) * 0.1;
      this.camera.rotation.z += (0 - this.camera.rotation.z) * 0.1;
      return;
    }

    this.headBobTimer += delta * this.currentSpeed * this.headBobFrequency;
    const bobOffset = Math.sin(this.headBobTimer) * this.headBobAmplitude * this.currentSpeed;
    
    this.verticalSwayOffset *= 0.9; 
    this.verticalSwayOffset += (Math.random() - 0.5) * 0.005; 
    
    const targetY = this.initialCameraY + bobOffset + this.verticalSwayOffset;
    this.camera.position.y += (targetY - this.camera.position.y) * 0.1;
    
    this.targetSwayAngle = (Math.random() - 0.5) * this.maxSwayAngle;
    this.swayAngle += (this.targetSwayAngle - this.swayAngle) * 0.05;
    this.camera.rotation.z += (this.swayAngle - this.camera.rotation.z) * 0.1;
  }

  setupMouseSensitivity() {
    if (!this.controls) return;

    this.controls.onMouseMove = (event) => {
      if (!this.isActive) return;

      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;
      const sensitivity = (this.settings?.mouseSensitivity ?? 0.5) * 0.5;
      const invertY = this.settings?.invertY ? -1 : 1;

      this.euler.setFromQuaternion(this.camera.quaternion);
      this.euler.y -= movementX * 0.002 * sensitivity;
      this.euler.x -= movementY * 0.002 * sensitivity * invertY;
      this.euler.x = Math.max(-this.PI_2, Math.min(this.PI_2, this.euler.x));
      
      this.camera.quaternion.setFromEuler(this.euler);
    };
  }

  initControls() {
    document.addEventListener('keydown', this.boundKeyDown);
    document.addEventListener('keyup', this.boundKeyUp);
  }

  onKeyDown(event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = true;
        break;
    }
  }

  onKeyUp(event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = false;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = false;
        break;
    }
  }

  resetMovement() {
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
  }

  update() {
    if (!this.controls.isLocked || !this.isActive) return;

    try {
      const time = performance.now();
      const delta = (time - this.prevTime) / 1000;

      this.velocity.x -= this.velocity.x * 10.0 * delta; // Smoother friction
      this.velocity.z -= this.velocity.z * 10.0 * delta;

      this.direction.set(0, 0, 0);

      // Calculate movement direction
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(this.camera.quaternion);
      forward.y = 0;
      forward.normalize();

      const right = new THREE.Vector3(1, 0, 0);
      right.applyQuaternion(this.camera.quaternion);
      right.y = 0;
      right.normalize();

      if (this.moveForward) this.direction.add(forward);
      if (this.moveBackward) this.direction.sub(forward);
      if (this.moveRight) this.direction.add(right);
      if (this.moveLeft) this.direction.sub(right);
      this.direction.normalize();

      // Smooth acceleration and deceleration
      if (this.isMoving()) {
        this.targetSpeed = this.maxSpeed;
      } else {
        this.targetSpeed = 0;
      }

      // Smooth speed transition
      if (this.currentSpeed < this.targetSpeed) {
        this.currentSpeed += this.acceleration;
      } else if (this.currentSpeed > this.targetSpeed) {
        this.currentSpeed -= this.deceleration;
      }

      // Clamp speed
      this.currentSpeed = Math.max(0, Math.min(this.currentSpeed, this.maxSpeed));

      // Apply movement
      this.velocity.x = this.direction.x * this.currentSpeed;
      this.velocity.z = this.direction.z * this.currentSpeed;

      const nextPosition = this.controls.getObject().position.clone();
      nextPosition.x += this.velocity.x * delta;
      nextPosition.z += this.velocity.z * delta;

      // Collision checks and movement remain the same
      const doorZPosition = 15;
      const doorPassageRange = 1;
      const nearLeftDoor = Math.abs(nextPosition.x - (-5)) < 1 && 
                          Math.abs(nextPosition.z - doorZPosition) < doorPassageRange;
      const nearRightDoor = Math.abs(nextPosition.x - 5) < 1 && 
                           Math.abs(nextPosition.z - doorZPosition) < doorPassageRange;
      const nearFrontDoor = Math.abs(nextPosition.x) < 1 && 
                           Math.abs(nextPosition.z - (-19.95)) < doorPassageRange;

      if ((nearLeftDoor || nearRightDoor || Math.abs(nextPosition.x) < 4.5)) {
        this.controls.getObject().position.x += this.velocity.x * delta;
      }
      if ((nearFrontDoor || Math.abs(nextPosition.z) < 19.5)) {
        this.controls.getObject().position.z += this.velocity.z * delta;
      }

      this.updateHeadBob(delta);
      this.prevTime = time;

    } catch (error) {
      console.warn('Error in player controls update:', error);
      this.isActive = false;
      this.resetMovement();
    }
  }
}