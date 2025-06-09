const logo = document.getElementById('logo');
const MAX_ROTATION = 15;

document.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;

    // Normalize mouse position from -1 to 1
    const xRatio = (clientX / innerWidth - 0.5) * 2;
    const yRatio = (clientY / innerHeight - 0.5) * 2;

    const rotateY = xRatio * MAX_ROTATION;
    const rotateX = -yRatio * MAX_ROTATION;

    logo.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
});

document.body.addEventListener('mouseleave', () => {
    logo.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
});

