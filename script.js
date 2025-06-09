document.addEventListener('DOMContentLoaded', () => {

    function createFallingEgg() {
        const egg = document.createElement('div');
        egg.classList.add('falling-egg');

        // Random horizontal position
        egg.style.left = Math.random() * 100 + 'vw';

        // Random animation duration
        const duration = Math.random() * 5 + 5; // 5 to 10 seconds
        egg.style.animationDuration = duration + 's';

        // Random size
        const size = Math.random() * 40 + 20; // 20px to 60px
        egg.style.width = size + 'px';
        egg.style.height = size + 'px';
        
        // Random delay before starting
        const delay = Math.random() * 5;
        egg.style.animationDelay = delay + 's';

        document.body.appendChild(egg);

        // Remove the egg after it has fallen off the screen
        setTimeout(() => {
            egg.remove();
        }, (duration + delay) * 1000);
    }

    // Create an initial burst of eggs to fill the screen
    for (let i = 0; i < 20; i++) {
        createFallingEgg();
    }

    // Continuously create new eggs
    setInterval(createFallingEgg, 500);

});

