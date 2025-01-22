import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

export function createEnvironment(scene) {
  // Create textured floor
  const textureLoader = new THREE.TextureLoader();
  
  // Load floor texture
  const floorTexture = textureLoader.load('./tile32_2.png');
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(10, 40);
  
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    map: floorTexture,
    roughness: 0.9,
    metalness: 0.1
  });
  
  // Load wall texture
  const wallTexture = textureLoader.load('./wall33_5.png');
  wallTexture.wrapS = THREE.RepeatWrapping;
  wallTexture.wrapT = THREE.RepeatWrapping;

  // Create a single material for all walls
  const wallMaterial = new THREE.MeshStandardMaterial({ 
    map: wallTexture,
    roughness: 0.7,
    metalness: 0.1
  });

  // Apply consistent texture scaling
  wallMaterial.map.repeat.set(8, 1); // Adjust repeat for fitting

  // Floor
  const floorGeometry = new THREE.PlaneGeometry(10, 40);
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // Ceiling
  const ceilingMaterial = new THREE.MeshStandardMaterial({ 
    map: floorTexture,
    roughness: 0.8,
    metalness: 0.2
  });
  const ceiling = new THREE.Mesh(floorGeometry, ceilingMaterial);
  ceiling.position.y = 4;
  ceiling.rotation.x = Math.PI / 2;
  scene.add(ceiling);

  // Walls
  const sideWallGeometry = new THREE.PlaneGeometry(40, 4);
  const endWallGeometry = new THREE.PlaneGeometry(10, 4);

  const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
  leftWall.position.set(-5, 2, 0);
  leftWall.rotation.y = Math.PI / 2;
  scene.add(leftWall);

  const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
  rightWall.position.set(5, 2, 0);
  rightWall.rotation.y = -Math.PI / 2;
  scene.add(rightWall);

  const frontWall = new THREE.Mesh(endWallGeometry, wallMaterial);
  frontWall.position.set(0, 2, -20);
  scene.add(frontWall);

  const backWall = new THREE.Mesh(endWallGeometry, wallMaterial);
  backWall.position.set(0, 2, 20);
  backWall.rotation.y = Math.PI;
  scene.add(backWall);

  // Door setup
  const doorTexture = textureLoader.load('./door18_2.png');
  const doorMaterial = new THREE.MeshStandardMaterial({ 
    map: doorTexture,
    transparent: true,
    side: THREE.DoubleSide
  });

  const doorWidth = 2;
  const doorHeight = 3;
  const doorGeometry = new THREE.PlaneGeometry(doorWidth, doorHeight);

  const leftDoor = new THREE.Mesh(doorGeometry, doorMaterial);
  leftDoor.position.set(-4.95, doorHeight/2, 15);
  leftDoor.rotation.y = Math.PI / 2;
  leftDoor.name = 'leftDoor';
  scene.add(leftDoor);

  const rightDoor = new THREE.Mesh(doorGeometry, doorMaterial);
  rightDoor.position.set(4.95, doorHeight/2, 15);
  rightDoor.rotation.y = -Math.PI / 2;
  rightDoor.name = 'rightDoor';
  scene.add(rightDoor);

  const frontDoor = new THREE.Mesh(doorGeometry, doorMaterial);
  frontDoor.position.set(0, doorHeight/2, -19.95);
  frontDoor.name = 'frontDoor';
  scene.add(frontDoor);

  // Door frames setup (Remain unchanged)
  const frameGeometry = new THREE.BoxGeometry(0.2, doorHeight + 0.2, 0.2);
  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });

  const leftDoorFrame1 = new THREE.Mesh(frameGeometry, frameMaterial);
  leftDoorFrame1.position.set(-4.95, doorHeight/2, 15 - doorWidth/2);
  scene.add(leftDoorFrame1);

  const leftDoorFrame2 = new THREE.Mesh(frameGeometry, frameMaterial);
  leftDoorFrame2.position.set(-4.95, doorHeight/2, 15 + doorWidth/2);
  scene.add(leftDoorFrame2);

  const rightDoorFrame1 = new THREE.Mesh(frameGeometry, frameMaterial);
  rightDoorFrame1.position.set(4.95, doorHeight/2, 15 - doorWidth/2);
  scene.add(rightDoorFrame1);

  const rightDoorFrame2 = new THREE.Mesh(frameGeometry, frameMaterial);
  rightDoorFrame2.position.set(4.95, doorHeight/2, 15 + doorWidth/2);
  scene.add(rightDoorFrame2);

  const frontDoorFrame1 = new THREE.Mesh(frameGeometry, frameMaterial);
  frontDoorFrame1.position.set(-doorWidth/2, doorHeight/2, -19.95);
  scene.add(frontDoorFrame1);

  const frontDoorFrame2 = new THREE.Mesh(frameGeometry, frameMaterial);
  frontDoorFrame2.position.set(doorWidth/2, doorHeight/2, -19.95);
  scene.add(frontDoorFrame2);

  const topFrameGeometry = new THREE.BoxGeometry(0.2, 0.2, doorWidth);
  
  const leftTopFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
  leftTopFrame.position.set(-4.95, doorHeight + 0.1, 15);
  scene.add(leftTopFrame);

  const rightTopFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
  rightTopFrame.position.set(4.95, doorHeight + 0.1, 15);
  scene.add(rightTopFrame);

  const frontTopFrame = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, 0.2, 0.2), frameMaterial);
  frontTopFrame.position.set(0, doorHeight + 0.1, -19.95);
  scene.add(frontTopFrame);

  return { leftDoor, rightDoor, frontDoor };
}