import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { PointerLockControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/PointerLockControls.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Settings } from './settings.js';
import { PlayerControls } from './playerControls.js';
import { createEnvironment } from './environment.js';

let camera, scene, renderer, controls, composer;
let playerControls;
let doors;
let settings;
let audioListener;
let backgroundMusic;

// Define the fisheye shader
const FisheyeShader = {
  uniforms: {
    'tDiffuse': { value: null },
    'strength': { value: 1 },
    'time': { value: 0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float strength;
    uniform float time;
    varying vec2 vUv;

    void main() {
      vec2 coords = vUv - 0.5;
      float dist = length(coords);
      
      // Dynamic strength based on time
      float dynamicStrength = strength * (1.0 + 0.1 * sin(time));
      
      if (dist < 0.5) {
        coords *= (1.0 + dist * dist * dynamicStrength * 2.0);
      }
      vec2 finalCoords = coords + 0.5;
      
      // Add chromatic aberration
      float aberration = 0.01 * dynamicStrength;
      vec4 cr = texture2D(tDiffuse, finalCoords + vec2(aberration, 0.0));
      vec4 cg = texture2D(tDiffuse, finalCoords);
      vec4 cb = texture2D(tDiffuse, finalCoords - vec2(aberration, 0.0));
      
      gl_FragColor = vec4(cr.r, cg.g, cb.b, 1.0);
    }
  `
};

function initAudio() {
  try {
    if (!audioListener || !camera) return;
    
    backgroundMusic = new THREE.Audio(audioListener);
    const audioLoader = new THREE.AudioLoader();
    
    audioLoader.load('Voicy_kirby=backrooms.mp3', 
      (buffer) => {
        if (backgroundMusic) {
          backgroundMusic.setBuffer(buffer);
          backgroundMusic.setLoop(true);
          backgroundMusic.setVolume(0.5);
          backgroundMusic.play();
        }
      },
      undefined,
      (error) => {
        console.error('Error loading audio:', error);
      }
    );
  } catch (error) {
    console.error('Audio initialization error:', error);
  }
}

function init() {
  try {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.02);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.rotation.order = 'YXZ';
    
    audioListener = new THREE.AudioListener();
    if (camera && audioListener) {
      camera.add(audioListener);
      initAudio();
    }

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    document.body.appendChild(renderer.domElement);

    // Set up post-processing
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Add bloom pass
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5, 0.4, 0.85
    );
    composer.addPass(bloomPass);

    // Add fisheye pass
    const fisheyePass = new ShaderPass(FisheyeShader);
    fisheyePass.renderToScreen = true;
    composer.addPass(fisheyePass);

    // Add near death effect pass
    const nearDeathPass = new ShaderPass({
      uniforms: {
        'tDiffuse': { value: null },
        'time': { value: 0 },
        'grainIntensity': { value: 2 },
        'vignetteIntensity': { value: 6.5 },
        'saturation': { value: 0.5 },
        'pulseIntensity': { value: 3 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float time;
        uniform float grainIntensity;
        uniform float vignetteIntensity;
        uniform float saturation;
        uniform float pulseIntensity;
        varying vec2 vUv;
        
        float random(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453);
        }
        
        vec3 desaturate(vec3 color, float factor) {
          vec3 lum = vec3(0.299, 0.587, 0.114);
          vec3 gray = vec3(dot(lum, color));
          return mix(color, gray, factor);
        }
        
        void main() {
          vec4 color = texture2D(tDiffuse, vUv);
          
          vec2 seed = vUv + time;
          float grain = random(seed) * grainIntensity;
          
          float pulse = sin(time * 2.0) * pulseIntensity;
          float vignette = pow(length(vUv - 0.5) * 2.0, vignetteIntensity + pulse);
          
          color.rgb = desaturate(color.rgb, 1.0 - saturation);
          color.rgb = mix(color.rgb, vec3(grain), 0.15);
          color.rgb *= 1.0 - vignette * 0.7;
          
          color.rgb += vec3(0.05, 0.02, 0.02) * (1.0 - vignette);
          
          gl_FragColor = color;
        }
      `
    });
    composer.addPass(nearDeathPass);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0xff8c75, 0.5, 15);
    pointLight1.position.set(0, 3, -15);
    scene.add(pointLight1);

    settings = new Settings();
    doors = createEnvironment(scene);

    camera.position.y = 2;
    camera.position.set(0, 2, -17);
    camera.lookAt(0, 2, 0);
    
    controls = new PointerLockControls(camera, document.body);
    controls.getObject().position.copy(camera.position);
    
    playerControls = new PlayerControls(controls, camera, settings, doors);

    setupEventListeners();
    animate();

  } catch (error) {
    console.error('Initialization error:', error);
    displayError(error.message);
  }
}

function setupEventListeners() {
  document.addEventListener('click', () => {
    if (controls && !controls.isLocked) {
      controls.lock().catch(error => {
        console.warn('Pointer lock request failed:', error);
      });
    }
  });

  window.addEventListener('resize', onWindowResize, false);
}

let time = 0;
function animate() {
  requestAnimationFrame(animate);
  try {
    time += 0.01;
    
    if (playerControls && composer && scene && camera) {
      playerControls.update();
      
      // Update shader uniforms
      const fisheyePass = composer.passes[2];
      fisheyePass.uniforms.time.value = time;
      fisheyePass.uniforms.strength.value = 0.5 + Math.sin(time * 0.5) * 0.1;
      
      const nearDeathPass = composer.passes[3];
      nearDeathPass.uniforms.time.value = time;
      nearDeathPass.uniforms.pulseIntensity.value = 0.1 + Math.sin(time) * 0.05;
      
      const baseFOV = 75;
      const targetFOV = playerControls.isMoving() ? baseFOV + 3 : baseFOV;
      camera.fov += (targetFOV - camera.fov) * 0.05;
      camera.updateProjectionMatrix();
      
      composer.render();
    }
  } catch (error) {
    console.error('Animation error:', error);
  }
}

function onWindowResize() {
  if (camera && renderer && composer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  }
}

function displayError(message) {
  const errorMessage = document.createElement('div');
  errorMessage.style.color = 'red';
  errorMessage.style.position = 'absolute';
  errorMessage.style.top = '10px';
  errorMessage.style.left = '10px';
  errorMessage.style.padding = '10px';
  errorMessage.style.background = 'rgba(0,0,0,0.8)';
  errorMessage.textContent = 'Failed to initialize: ' + message;
  document.body.appendChild(errorMessage);
}

init();