import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', () => {
    // Three.js setup
    let scene, camera, renderer, controls;
    let player, playerLight;
    const enemies = [];
    const projectiles = [];
    const gameItems = [];

    function initThreeJS() {
        // Scene setup
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000011);

        // Camera setup
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 15, 15);
        camera.lookAt(0, 0, 0);

        // Renderer setup
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('gameContainer').appendChild(renderer.domElement);

        // Controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxPolarAngle = Math.PI / 2;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // Grid
        const gridHelper = new THREE.GridHelper(100, 100, 0x444444, 0x222222);
        scene.add(gridHelper);

        // Initialize player
        createPlayer();

        // Handle window resize
        window.addEventListener('resize', onWindowResize, false);
    }

    function createPlayer() {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        player = new THREE.Mesh(geometry, material);
        player.position.y = 1;
        scene.add(player);

        // Player light
        playerLight = new THREE.PointLight(0x00ff00, 1, 10);
        playerLight.position.copy(player.position);
        scene.add(playerLight);
    }

    function createEnemy() {
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const enemy = new THREE.Mesh(geometry, material);
        
        // Random position around the player
        const angle = Math.random() * Math.PI * 2;
        const distance = 30;
        enemy.position.x = Math.cos(angle) * distance;
        enemy.position.z = Math.sin(angle) * distance;
        enemy.position.y = 1;

        scene.add(enemy);
        enemies.push(enemy);
    }

    function createProjectile(direction) {
        const geometry = new THREE.SphereGeometry(0.2, 8, 8);
        const material = new THREE.MeshPhongMaterial({ color: 0x00ffff });
        const projectile = new THREE.Mesh(geometry, material);
        projectile.position.copy(player.position);
        projectile.velocity = direction.multiplyScalar(0.5);
        
        scene.add(projectile);
        projectiles.push(projectile);
    }

    function updateProjectiles() {
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const projectile = projectiles[i];
            projectile.position.add(projectile.velocity);

            // Check for collisions with enemies
            enemies.forEach((enemy, enemyIndex) => {
                if (projectile.position.distanceTo(enemy.position) < 2) {
                    scene.remove(enemy);
                    enemies.splice(enemyIndex, 1);
                    scene.remove(projectile);
                    projectiles.splice(i, 1);
                }
            });

            // Remove projectiles that are too far
            if (projectile.position.length() > 100) {
                scene.remove(projectile);
                projectiles.splice(i, 1);
            }
        }
    }

    function updateEnemies() {
        enemies.forEach(enemy => {
            const direction = new THREE.Vector3()
                .subVectors(player.position, enemy.position)
                .normalize();
            enemy.position.add(direction.multiplyScalar(0.1));

            // Check collision with player
            if (enemy.position.distanceTo(player.position) < 2) {
                // Handle player damage
                console.log('Player hit!');
            }
        });
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Mouse controls
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    document.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    document.addEventListener('click', () => {
        raycaster.setFromCamera(mouse, camera);
        const direction = new THREE.Vector3();
        raycaster.ray.direction.normalize();
        direction.copy(raycaster.ray.direction);
        createProjectile(direction);
    });

    // Keyboard controls
    const keys = {};
    document.addEventListener('keydown', (e) => keys[e.key] = true);
    document.addEventListener('keyup', (e) => keys[e.key] = false);

    function updatePlayer() {
        const moveSpeed = 0.2;
        if (keys['w'] || keys['ArrowUp']) player.position.z -= moveSpeed;
        if (keys['s'] || keys['ArrowDown']) player.position.z += moveSpeed;
        if (keys['a'] || keys['ArrowLeft']) player.position.x -= moveSpeed;
        if (keys['d'] || keys['ArrowRight']) player.position.x += moveSpeed;

        playerLight.position.copy(player.position);
        camera.position.set(
            player.position.x,
            player.position.y + 15,
            player.position.z + 15
        );
        camera.lookAt(player.position);
    }

    function animate() {
        requestAnimationFrame(animate);

        updatePlayer();
        updateProjectiles();
        updateEnemies();

        if (Math.random() < 0.02 && enemies.length < 10) {
            createEnemy();
        }

        controls.update();
        renderer.render(scene, camera);
    }

    // Initialize game elements
    const elements = {
        canvas: document.getElementById('gameCanvas'),
        scoreDisplay: document.getElementById('score'),
        gameOverDisplay: document.getElementById('gameOver'),
        pauseScreen: document.getElementById('pauseScreen'),
        resumeButton: document.getElementById('resumeButton'),
        restartButtonPause: document.getElementById('restartButtonPause'),
        mainMenuButtonPause: document.getElementById('mainMenuButtonPause'),
        healthDisplayElement: document.getElementById('healthDisplay'),
        shieldDisplayElement: document.querySelector('#shieldDisplay'),
        shieldBarElement: document.querySelector('#shieldDisplay .shield-bar-value'),
        mainMenu: document.getElementById('mainMenu'),
        playButton: document.getElementById('playButton'),
        shopButton: document.getElementById('shopButton'),
        exitButton: document.getElementById('exitButton'),
        shopMenu: document.getElementById('shopMenu'),
        backToMainMenuButton: document.getElementById('backToMainMenu'),
        gameContainer: document.getElementById('gameContainer'),
        coinDisplayElement: document.getElementById('coinDisplayGame'),
        restartButtonGameOver: document.getElementById('restartButton'),
        mainMenuButtonGameOver: document.getElementById('mainMenuButton'),
        playerNameInput: document.getElementById('playerNameInput'),
        confirmNameButton: document.getElementById('confirmNameButton'),
        welcomePopup: document.getElementById('welcomePopup'),
        welcomeName: document.getElementById('welcomeName'),
        difficultyMenu: document.getElementById('difficultyMenu'),
        easyButton: document.getElementById('easyButton'),
        mediumButton: document.getElementById('mediumButton'),
        hardButton: document.getElementById('hardButton'),
        backToMainMenuFromDifficulty: document.getElementById('backToMainMenuFromDifficulty')
    };

    let playerName = '';
    let selectedDifficulty = 'easy';
    let score = 0;
    let coins = parseInt(localStorage.getItem('coins')) || 0;
    let savedWeapons = JSON.parse(localStorage.getItem('ownedWeapons')) || ['pistol'];

    let playerData = {
        health: 100,
        shield: 0,
        shieldTimer: 0,
        shieldMaxTime: 600,
        damageTakenTimer: 0,
        currentSpeedX: 0,
        currentSpeedY: 0,
        name: ''
    };

    // Auto-rellenar el nombre como "Player" si no se ingresa uno
    elements.confirmNameButton.addEventListener('click', () => {
        const name = elements.playerNameInput.value.trim();
        playerName = name || "Player"; // Asignar "Player" si no se ingresa un nombre
        elements.playerNameInput.style.display = 'none';
        elements.confirmNameButton.style.display = 'none';
        elements.playButton.style.display = 'block';
        elements.shopButton.style.display = 'block';
        elements.exitButton.style.display = 'block';

        // Mostrar el pop-up de bienvenida
        elements.welcomeName.textContent = playerName;
        elements.welcomePopup.style.display = 'block';

        // Ocultar el pop-up después de 3 segundos
        setTimeout(() => {
            elements.welcomePopup.style.display = 'none';
        }, 3000);
    });

    // Iniciar el juego al hacer clic en "Play"
    elements.playButton.addEventListener('click', () => {
        if (playerName) {
            elements.mainMenu.style.display = 'none';
            elements.shopMenu.style.display = 'none';
            elements.difficultyMenu.style.display = 'flex';
        } else {
            alert('Please enter your name first.');
        }
    });

    // Botón para entrar en la tienda
    elements.shopButton.addEventListener('click', () => {
        elements.mainMenu.style.display = 'none';
        elements.shopMenu.style.display = 'flex';
        initializeWeaponShop();
        updateCoinDisplay();
    });

    // Selección de dificultad
    elements.easyButton.addEventListener('click', () => startGame('easy'));
    elements.mediumButton.addEventListener('click', () => startGame('medium'));
    elements.hardButton.addEventListener('click', () => startGame('hard'));

    // Volver al menú principal desde el menú de dificultad
    elements.backToMainMenuFromDifficulty.addEventListener('click', () => {
        elements.difficultyMenu.style.display = 'none';
        elements.mainMenu.style.display = 'flex';
    });

    // Iniciar el juego con la dificultad seleccionada
    function startGame(difficulty) {
        selectedDifficulty = difficulty;
        elements.difficultyMenu.style.display = 'none';
        elements.gameContainer.style.display = 'block';
        elements.gameContainer.classList.add('fade-in');
        initThreeJS();
        animate();
    }

    // Actualizar la pantalla de salud
    function updateHealthDisplay() {
        const healthBar = elements.healthDisplayElement.querySelector('.health-bar-value');
        healthBar.style.width = `${playerData.health}%`;
        healthBar.textContent = ` ${playerData.health}%`;

        if (playerData.health <= 25) {
            healthBar.classList.add('low');
            healthBar.classList.remove('medium');
        } else if (playerData.health <= 50) {
            healthBar.classList.add('medium');
            healthBar.classList.remove('low');
        } else {
            healthBar.classList.remove('low');
            healthBar.classList.remove('medium');
        }

        if (playerData.shield > 0) {
            elements.shieldDisplayElement.style.display = 'flex';
            const shieldPercentage = (playerData.shieldTimer / playerData.shieldMaxTime) * 100;
            elements.shieldBarElement.style.width = `${shieldPercentage}%`;
            elements.shieldBarElement.textContent = ` ${Math.ceil(shieldPercentage)}%`;
        } else {
            elements.shieldDisplayElement.style.display = 'none';
            elements.shieldBarElement.style.width = '0%';
            elements.shieldBarElement.textContent = '';
        }
    }

    // Actualizar la pantalla de monedas
    function updateCoinDisplay() {
        elements.coinDisplayElement.textContent = `Credits: ${coins}`;
    }

    // Actualizar la pantalla de puntuación
    function updateScoreDisplay() {
        elements.scoreDisplay.textContent = `Combat Score: ${score}`;
    }

    // Inicializar la tienda de armas
    function initializeWeaponShop() {
        const weaponSelection = document.getElementById('weaponSelection');
        weaponSelection.innerHTML = '';

        const weaponButtons = [
            {
                id: 'weapon-pistol',
                name: 'Pistola de plasma',
                type: 'pistol',
                cost: 0,
                description: 'Disparo básico',
                fireFunction: shootPistol,
                cooldown: 250 // 0.25 segundos
            },
            {
                id: 'weapon-shotgun',
                name: 'Dispersor cuántico',
                type: 'shotgun',
                cost: 20,
                description: 'Disparo disperso x3',
                fireFunction: shootShotgun,
                cooldown: 500 // 0.5 segundos
            },
            {
                id: 'weapon-laser',
                name: 'Rayo de fusión',
                type: 'laser',
                cost: 30,
                description: 'Rayo láser penetrante',
                fireFunction: shootLaser,
                cooldown: 1000 // 1 segundo
            }
        ];

        weaponButtons.forEach(weapon => {
            const button = document.createElement('button');
            button.id = weapon.id;
            button.className = 'weapon-button';
            button.dataset.weapon = weapon.type;
            button.innerHTML = `
                ${weapon.name}<br>
                <span class="weapon-stat">${weapon.description}</span>
                ${weapon.cost > 0 ? `<span class="weapon-cost">${weapon.cost} Credits</span>` : ''}
            `;
            
            button.addEventListener('click', () => handleWeaponClick(weapon.type));
            weaponSelection.appendChild(button);
        });

        updateWeaponShopDisplay();
    }

    // Manejar clic en un arma
    function handleWeaponClick(weaponType) {
        if (weaponType === 'pistol') {
            setWeapon('pistol');
        } else if (!savedWeapons.includes(weaponType)) {
            purchaseWeapon(weaponType);
        } else {
            setWeapon(weaponType);
        }
    }

    // Comprar un arma
    function purchaseWeapon(weaponType) {
        const weapon = getWeapon(weaponType);
        if (coins >= weapon.cost) {
            coins -= weapon.cost;
            savedWeapons.push(weaponType);
            setWeapon(weaponType);
            updateCoinDisplay();
            updateWeaponShopDisplay();
            
            // Guardar en localStorage
            localStorage.setItem('coins', coins);
            localStorage.setItem('ownedWeapons', JSON.stringify(savedWeapons));
            localStorage.setItem('currentWeapon', weaponType);
        } else {
            // Si no tienes suficiente dinero, cambiar el estilo del botón
            const button = document.getElementById(getWeapon(weaponType).id);
            button.classList.add('denied');

            // Restaurar el estilo después de 1 segundo
            setTimeout(() => {
                button.classList.remove('denied');
            }, 1000);
        }
    }

    // Actualizar la pantalla de la tienda de armas
    function updateWeaponShopDisplay() {
        const weaponButtons = getWeaponButtons();
        weaponButtons.forEach(weapon => {
            const button = document.getElementById(weapon.id);
            if (button) {
                if (savedWeapons.includes(weapon.type)) {
                    button.classList.add('owned');
                    if (weapon.cost > 0) {
                        button.querySelector('.weapon-cost').textContent = 'Owned';
                    }
                } else {
                    button.classList.remove('owned');
                }
                if (getSelectedWeapon() === weapon.type) {
                    button.classList.add('selected');
                } else {
                    button.classList.remove('selected');
                }
            }
        });
    }

    // Configurar el arma actual
    function setWeapon(weaponType) {
        localStorage.setItem('currentWeapon', weaponType);
    }

    // Obtener el arma seleccionada
    function getSelectedWeapon() {
        return localStorage.getItem('currentWeapon');
    }

    // Obtener un arma
    function getWeapon(weaponType) {
        const weaponButtons = getWeaponButtons();
        return weaponButtons.find(w => w.type === weaponType);
    }

    // Obtener las armas
    function getWeaponButtons() {
        return [
            {
                id: 'weapon-pistol',
                name: 'Pistola de plasma',
                type: 'pistol',
                cost: 0,
                description: 'Disparo básico',
                fireFunction: shootPistol,
                cooldown: 250 // 0.25 segundos
            },
            {
                id: 'weapon-shotgun',
                name: 'Dispersor cuántico',
                type: 'shotgun',
                cost: 20,
                description: 'Disparo disperso x3',
                fireFunction: shootShotgun,
                cooldown: 500 // 0.5 segundos
            },
            {
                id: 'weapon-laser',
                name: 'Rayo de fusión',
                type: 'laser',
                cost: 30,
                description: 'Rayo láser penetrante',
                fireFunction: shootLaser,
                cooldown: 1000 // 1 segundo
            }
        ];
    }

    // Disparar la pistola
    function shootPistol() {
        const direction = new THREE.Vector3();
        raycaster.setFromCamera(mouse, camera);
        direction.copy(raycaster.ray.direction);
        createProjectile(direction);
    }

    // Disparar la escopeta
    function shootShotgun() {
        for (let i = -1; i <= 1; i++) {
            const direction = new THREE.Vector3();
            raycaster.setFromCamera(mouse, camera);
            direction.copy(raycaster.ray.direction);
            direction.x += i * 0.1;
            createProjectile(direction);
        }
    }

    // Disparar el láser
    function shootLaser() {
        const direction = new THREE.Vector3();
        raycaster.setFromCamera(mouse, camera);
        direction.copy(raycaster.ray.direction);
        createProjectile(direction);
    }

    // Mostrar el menú principal
    function showMainMenu() {
        cancelAnimationFrame(animate);
        elements.gameOverDisplay.style.display = 'none';
        elements.pauseScreen.style.display = 'none';
        elements.shopMenu.style.display = 'none';
        elements.gameContainer.style.display = 'none';
        elements.mainMenu.style.display = 'flex';
    }

    // Botón de salida
    elements.exitButton.addEventListener('click', () => {
        console.log("Exit game");
    });

    // Volver al menú principal desde la tienda
    elements.backToMainMenuButton.addEventListener('click', showMainMenu);

    showMainMenu();
});