document.addEventListener('DOMContentLoaded', () => {
    const titleElement = document.getElementById('title');
    const originalText = titleElement.textContent;
    titleElement.textContent = ''; // Clear original text to rebuild with spans

    // Wrap each letter in a span for individual animation
    originalText.split('').forEach((char, index) => {
        const span = document.createElement('span');
        if (char === ' ') {
            span.innerHTML = '&nbsp;'; // Use non-breaking space for layout
        } else {
            span.textContent = char;
        }
        // Stagger the animation start for each letter
        span.style.animationDelay = `${index * 0.12}s`;
        titleElement.appendChild(span);
    });

    const logo = document.getElementById('logo');
    let isClickAnimating = false;

    logo.addEventListener('click', () => {
        if (isClickAnimating) return; // Prevent re-triggering if animation is already playing
        isClickAnimating = true;

        // Temporarily store the original animation to restore it later
        const originalLogoAnimation = logo.style.animation;
        
        // Set current transform state explicitly to avoid jump if coming from hover
        // This can be tricky with combined transforms. For simplicity, we'll let clickEffect override.
        // The 'clickEffect' animation is designed to start from a base state (scale 1, rotate 0).
        // If the logo is hovered (e.g. scale 1.15), there might be a slight visual jump.
        // For this exercise, this is acceptable.

        // Apply the click animation
        logo.style.animation = 'clickEffect 0.6s ease-in-out';

        // After the click animation ends, restore the original bobbing animation
        logo.addEventListener('animationend', function handleAnimationEnd() {
            logo.style.animation = originalLogoAnimation; // Restore original inline style (if any)
             // If originalLogoAnimation was empty, it means CSS rule was driving it.
             // Setting to empty string will correctly re-apply CSS rule from stylesheet.
            if (!originalLogoAnimation) {
                logo.style.animation = ''; // Clears inline style, CSS rule takes over.
            }
            
            isClickAnimating = false;
            logo.removeEventListener('animationend', handleAnimationEnd); // Clean up listener
        });
    });
});

