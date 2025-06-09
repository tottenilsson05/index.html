document.addEventListener('DOMContentLoaded', () => {
    const logoContainer = document.querySelector('.logo-container');

    function createSparkleAroundLogo() {
        if (!logoContainer) return;

        const sparkle = document.createElement('div');
        sparkle.classList.add('sparkle');
        
        const size = Math.random() * 15 + 5; // 5px to 20px
        sparkle.style.width = `${size}px`;
        sparkle.style.height = `${size}px`;
        
        const logoRect = logoContainer.getBoundingClientRect();
        
        // Use a wider radius to spread sparkles out
        const angle = Math.random() * Math.PI * 2;
        const radius = (logoRect.width / 2) + (Math.random() * 100);

        // Center of logo
        const logoCenterX = logoRect.left + logoRect.width / 2;
        const logoCenterY = logoRect.top + logoRect.height / 2;

        const currentTransform = new DOMMatrix(getComputedStyle(logoContainer).transform);
        const offsetY = currentTransform.m42;

        // Position sparkle
        sparkle.style.left = `${logoCenterX + Math.cos(angle) * radius - size / 2}px`;
        sparkle.style.top = `${logoCenterY + offsetY + Math.sin(angle) * radius - size / 2}px`;
        
        document.body.appendChild(sparkle);
        
        setTimeout(() => {
            sparkle.remove();
        }, 1000); // Match animation duration in CSS
    }
    
    // Create sparkles automatically around the logo
    setInterval(createSparkleAroundLogo, 150);

    // Create sparkles on mouse move
    const createSparkleAtCursor = (e) => {
        const sparkle = document.createElement('div');
        sparkle.classList.add('sparkle');

        const size = Math.random() * 10 + 5; // 5px to 15px
        sparkle.style.width = `${size}px`;
        sparkle.style.height = `${size}px`;
        
        // Add a little random offset to make it less tied to the cursor
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;

        sparkle.style.left = `${e.clientX + offsetX - size/2}px`;
        sparkle.style.top = `${e.clientY + offsetY - size/2}px`;
        
        document.body.appendChild(sparkle);

        setTimeout(() => {
            sparkle.remove();
        }, 1000);
    };

    let canSparkle = true;
    document.body.addEventListener('mousemove', (e) => {
        if (canSparkle) {
            createSparkleAtCursor(e);
            canSparkle = false;
            setTimeout(() => {
                canSparkle = true;
            }, 50); // Throttle sparkle creation
        }
    });
});

