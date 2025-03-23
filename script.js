// Initialize particles.js
particlesJS('particles-js', {
  particles: {
    number: { value: 80, density: { enable: true, value_area: 800 } },
    color: { value: '#ffffff' },
    shape: { type: 'circle' },
    opacity: {
      value: 0.5,
      random: true,
      animation: {
        enable: true,
        speed: 1,
        minimumValue: 0.1,
        sync: false
      }
    },
    size: {
      value: 3,
      random: true,
      animation: {
        enable: true,
        speed: 2,
        minimumValue: 0.3,
        sync: false
      }
    },
    move: {
      enable: true,
      speed: 1,
      direction: 'none',
      random: false,
      straight: false,
      outModes: { default: 'out' },
      attract: { enable: false, rotateX: 600, rotateY: 1200 }
    }
  },
  interactivity: {
    detectsOn: 'canvas',
    events: {
      onHover: { enable: true, mode: 'repulse' },
      onClick: { enable: true, mode: 'push' },
      resize: true
    },
    modes: {
      repulse: { distance: 100, duration: 0.4 },
      push: { particles_nb: 4 }
    }
  },
  retina_detect: true
});

// Add scroll reveal animations
function addScrollReveal() {
  const sections = document.querySelectorAll('section');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'all 0.6s ease-out';
    observer.observe(section);
  });
}

async function fetchUserProjects(username) {
  try {
    const response = await fetch(`/api/v1/users/${username}/projects?posted=true`);
    const data = await response.json();
    return data.projects.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

async function fetchUserLikes(username) {
  try {
    const response = await fetch(`/api/v1/users/${username}/likes`);
    const data = await response.json();
    return data.likes.data;
  } catch (error) {
    console.error('Error fetching likes:', error);
    return [];
  }
}

async function fetchUserStats(username) {
  try {
    const response = await fetch(`/api/v1/users/${username}/stats`);
    const data = await response.json();
    return data.stats;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { total_likes: 0, total_views: 0 };
  }
}

async function fetchUserFollowers(username) {
  try {
    const response = await fetch(`/api/v1/users/${username}/followers?count=true`);
    const data = await response.json();
    return data.followers.meta.count || 0;
  } catch (error) {
    console.error('Error fetching followers:', error);
    return 0;
  }
}

async function fetchUserFollowing(username) {
  try {
    const response = await fetch(`/api/v1/users/${username}/following?count=true`);
    const data = await response.json();
    return data.following.meta.count || 0;
  } catch (error) {
    console.error('Error fetching following:', error);
    return 0;
  }
}

function renderProjectCard(project, site) {
  if (!project) return '';
  
  const imageUrl = site ? `https://images.websim.ai/v1/site/${site.id}/600` : '';
  const title = project.title || 'Untitled Project';
  const stats = project.stats || { views: 0, likes: 0, comments: 0 };
  
  return `
    <a href="https://websim.ai/p/${project.id}" class="project-card">
      <div class="project-image" style="background-image: url('${imageUrl}')"></div>
      <div class="project-info">
        <div class="project-title">${title}</div>
        <div class="project-stats">
          <span>👁️ ${stats.views}</span>
          <span>❤️ ${stats.likes}</span>
          <span>💬 ${stats.comments}</span>
        </div>
      </div>
    </a>
  `;
}

// Initialize everything when the page loads
async function init() {
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProfile);
  } else {
    initializeProfile();
  }
}

async function initializeProfile() {
  const user = {
    username: 'Soupepe',
    description: '',
    avatar_url: null
  };

  // Set profile info - check if elements exist first
  const usernameEl = document.querySelector('.accent');
  if (usernameEl) usernameEl.textContent = user.username;

  const avatarEl = document.getElementById('avatar-img');
  if (avatarEl) avatarEl.style.backgroundImage = `url('SouPepe.png')`;

  try {
    // Fetch and set user stats
    const stats = await fetchUserStats(user.username);
    const likesEl = document.getElementById('total-likes');
    const viewsEl = document.getElementById('total-views');
    if (likesEl) likesEl.textContent = stats.total_likes;
    if (viewsEl) viewsEl.textContent = stats.total_views;

    // Fetch and set follower/following counts
    const followersCount = await fetchUserFollowers(user.username);
    const followingCount = await fetchUserFollowing(user.username);
    const followersEl = document.getElementById('followers-count');
    const followingEl = document.getElementById('following-count');
    if (followersEl) followersEl.textContent = followersCount;
    if (followingEl) followingEl.textContent = followingCount;

    // Load projects
    const projects = await fetchUserProjects(user.username);
    const projectsGrid = document.getElementById('projects-grid');
    if (projectsGrid) {
      projectsGrid.innerHTML = projects
        .map(({ project, site }) => renderProjectCard(project, site))
        .join('');
    }

    // Load likes
    const likes = await fetchUserLikes(user.username);
    const likesGrid = document.getElementById('likes-grid');
    if (likesGrid) {
      likesGrid.innerHTML = likes
        .map(({ project, site }) => renderProjectCard(project, site))
        .join('');
    }

    // Add scroll reveal after content is loaded
    addScrollReveal();
  } catch (error) {
    console.error('Error initializing profile:', error);
  }

  // Set up tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      const tabContent = document.getElementById(tab.dataset.tab);
      if (tabContent) tabContent.classList.add('active');
    });
  });
}

init();