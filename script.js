const lollipopField = document.querySelector('.lollipop-field');

function createLollipop() {
    const lollipop = document.createElement('div');
    lollipop.classList.add('lollipop');

    // Random color
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    lollipop.style.backgroundColor = randomColor;

    // Random position
    const randomX = Math.random() * 100; // Percentage
    lollipop.style.left = `${randomX}vw`;

    // Random animation duration (slight variation)
    const randomDuration = 5 + Math.random() * 2;
    lollipop.style.animationDuration = `${randomDuration}s`;

    //Random size
    const randomSize = 30 + Math.random() * 30;
    lollipop.style.width = `${randomSize}px`;
    lollipop.style.height = `${randomSize * 2}px`;


    lollipopField.appendChild(lollipop);

    // Remove lollipop after animation completes
    lollipop.addEventListener('animationiteration', () => {
        lollipop.remove();
    });
}

// Create lollipops periodically
setInterval(createLollipop, 500);

