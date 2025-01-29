// Add fade-in animation when page loads
document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('.stat-box, .disclaimer, .notes, .catti-image, .title-group');
  
  elements.forEach((element, index) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, index * 200);
  });
});

// Add hover effect to stat boxes
const statBoxes = document.querySelectorAll('.stat-box');

statBoxes.forEach(box => {
  box.addEventListener('mouseover', () => {
    box.style.transform = 'scale(1.02)';
    box.style.transition = 'transform 0.3s ease';
  });
  
  box.addEventListener('mouseout', () => {
    box.style.transform = 'scale(1)';
  });
});