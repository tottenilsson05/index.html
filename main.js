import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

// Neural Network Animation with improved visuals and larger size
const createNeuralNetwork = () => {
  const svg = d3.select('.neural-network');
  const width = 800; // Increased from 600
  const height = 600; // Increased from 400

  // More complex network structure with more nodes
  const layers = [5, 8, 10, 8, 5]; // Increased number of nodes per layer
  const nodes = [];
  let nodeId = 0;

  // Create nodes with staggered positioning
  layers.forEach((layer, i) => {
    const layerWidth = width / (layers.length - 1);
    for (let j = 0; j < layer; j++) {
      nodes.push({
        id: nodeId++,
        x: i * layerWidth + 50,
        y: (height / (layer + 1)) * (j + 1),
        layer: i
      });
    }
  });

  // Enhanced connection pattern
  const links = [];
  nodes.forEach(source => {
    nodes.forEach(target => {
      if (source.layer === target.layer - 1) {
        links.push({
          source,
          target,
          value: Math.random()
        });
      }
    });
  });

  // Enhanced visual styling
  svg.selectAll('*').remove();

  // Add gradient definitions
  const gradient = svg.append('defs')
    .append('linearGradient')
    .attr('id', 'link-gradient')
    .attr('gradientUnits', 'userSpaceOnUse');

  gradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', 'var(--primary-color)');

  gradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', 'var(--accent-color)');

  // Create groups for links and nodes
  const linksGroup = svg.append('g').attr('class', 'links');
  const nodesGroup = svg.append('g').attr('class', 'nodes');

  // Draw links with gradient
  const linkElements = linksGroup.selectAll('line')
    .data(links)
    .join('line')
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y)
    .style('stroke', 'url(#link-gradient)')
    .style('stroke-width', d => d.value * 2)
    .style('opacity', 0.2);

  // Draw nodes with glow effect
  const nodeElements = nodesGroup.selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', 4)
    .attr('fill', 'var(--primary-color)')
    .style('filter', 'url(#glow)');

  // Add glow filter
  const defs = svg.append('defs');
  const filter = defs.append('filter')
    .attr('id', 'glow');

  filter.append('feGaussianBlur')
    .attr('stdDeviation', '2')
    .attr('result', 'coloredBlur');

  const feMerge = filter.append('feMerge');
  feMerge.append('feMergeNode')
    .attr('in', 'coloredBlur');
  feMerge.append('feMergeNode')
    .attr('in', 'SourceGraphic');

  // Enhanced animation
  function animate() {
    nodeElements
      .transition()
      .duration(2000)
      .attr('r', 6)
      .transition()
      .duration(2000)
      .attr('r', 4)
      .on('end', animate);

    linkElements
      .transition()
      .duration(2000)
      .style('opacity', 0.4)
      .transition()
      .duration(2000)
      .style('opacity', 0.2);
  }

  animate();
};

// Navbar Toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Improved smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      navLinks.classList.remove('active');
    }
  });
});

// Enhanced intersection observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate');
      entry.target.style.opacity = '1';
    }
  });
}, observerOptions);

// Observe hero content with smoother animation
document.querySelectorAll('.hero-content').forEach(element => {
  element.style.opacity = '0';
  observer.observe(element);
});

// Observe other elements with the same observer
document.querySelectorAll('.service-card, .section-header').forEach(element => {
  element.style.opacity = '0';
  observer.observe(element);
});

// Initialize
window.addEventListener('load', () => {
  createNeuralNetwork();
  
  // Navbar scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > lastScroll) {
      navbar.style.transform = 'translateY(-100%)';
    } else {
      navbar.style.transform = 'translateY(0)';
    }
    lastScroll = currentScroll;
  });
});