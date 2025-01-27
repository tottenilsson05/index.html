// Configuración global
let difficultyLevel = 1;
let timeElapsed = 0;
const maxDifficulty = 10;
const difficultyInterval = 300; // Incremento cada 300 frames

// Actualización del nivel de dificultad
function updateDifficulty() {
    if (timeElapsed % difficultyInterval === 0 && difficultyLevel < maxDifficulty) {
        difficultyLevel++;
        enemySpawnInterval = Math.max(60, enemySpawnInterval - 10); // Reducir intervalo de aparición
        enemies.forEach(enemy => enemy.speed += 0.2); // Incrementar velocidad de enemigos existentes
    }
    timeElapsed++;
}

// Escopeta con dispersión ajustada y retroceso
function shootShotgun() {
    const pelletsPerShot = 5;
    const spreadAngle = Math.PI / 6; // Ángulo de dispersión más amplio

    for (let i = 0; i < pelletsPerShot; i++) {
        const angleOffset = (Math.random() - 0.5) * spreadAngle; // Variación aleatoria
        const finalAngle = player.rotationAngle + angleOffset;

        const speedX = Math.cos(finalAngle) * 6;
        const speedY = Math.sin(finalAngle) * 6;

        const startX = player.x + Math.cos(player.rotationAngle) * player.weaponLength;
        const startY = player.y + Math.sin(player.rotationAngle) * player.weaponLength;

        const pellet = createProjectile(startX, startY, speedX, speedY, 'orange', true, 5, 5, 5, 10); // Usar 'orange' para los perdigones y aumentar el daño
        pellet.piercing = false;
        playerProjectiles.push(pellet);
    }

    // Aplicar retroceso
    player.x -= Math.cos(player.rotationAngle) * 10;
    player.y -= Math.sin(player.rotationAngle) * 10;
}

// Pistola láser con rayo continuo
function shootLaser() {
    if (player.shootTimer > 0) return;

    const laserDuration = 30; // Duración del rayo en frames
    const laserDamage = 20; // Daño del láser

    const startX = player.x + Math.cos(player.rotationAngle) * player.weaponLength;
    const startY = player.y + Math.sin(player.rotationAngle) * player.weaponLength;

    // Crear un rayo visual
    const laser = {
        x: startX,
        y: startY,
        angle: player.rotationAngle,
        length: 800, // Largo del rayo
        width: 6,
        damage: laserDamage,
        duration: laserDuration,
        isLaser: true
    };

    // Dañar enemigos en la trayectoria
    enemies.forEach(enemy => {
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angleToEnemy = Math.atan2(dy, dx);
        if (
            distance < laser.length &&
            Math.abs(angleToEnemy - player.rotationAngle) < 0.1 // En la trayectoria
        ) {
            enemy.health -= laser.damage;
        }
    });

    playerProjectiles.push(laser);
    player.shootTimer = player.weaponCooldowns.laser;
}

// Modificación en la probabilidad de recompensas
function handleEnemyDeath(enemy) {
    const dropChance = Math.max(0.5 - 0.05 * difficultyLevel, 0.1); // Disminuir la probabilidad con el tiempo

    if (Math.random() < dropChance) {
        const dropType = Math.random();
        if (dropType < 0.4) {
            gameItems.push(createGameItem(enemy.x, enemy.y, 'coin'));
        } else if (dropType < 0.6) {
            gameItems.push(createGameItem(enemy.x, enemy.y, 'health'));
        } else {
            gameItems.push(createGameItem(enemy.x, enemy.y, 'armor'));
        }
    }

    // Incrementar puntuación
    score += 10 * difficultyLevel;
}

// Llamar a la función de actualización de dificultad en el bucle principal
function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateDifficulty();

    updatePlayer();
    updateProjectiles();
    updateEnemies();
    checkCollisions();
    updateGameItems();

    drawPlayer();
    playerProjectiles.forEach(drawProjectile);
    enemies.forEach(drawEnemy);
    enemyProjectiles.forEach(drawProjectile);

    animationFrameId = requestAnimationFrame(gameLoop);

    updateHealthDisplay();
    updateCoinDisplay();
    updateScoreDisplay();
}