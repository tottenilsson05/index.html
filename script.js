document.addEventListener('DOMContentLoaded', () => {
    const titleElement = document.getElementById('title');
    if (titleElement) {
        const text = titleElement.textContent;
        titleElement.textContent = ''; // Clear original text to replace with spans

        text.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.classList.add('title-char');
            // Stagger the animation start for each character
            span.style.animationDelay = `${index * 0.1}s`;
            titleElement.appendChild(span);
        });
    } else {
        console.error("Title element #title not found.");
    }
});

