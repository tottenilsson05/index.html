import { getCurrentUserStats, getPublishedUserProjects, getCurrentUserProfile } from './websim-utils.js';

class ProjectHub {
  constructor() {
    this.statsBoard = document.getElementById('user-stats');
    this.projectDoorsContainer = document.getElementById('project-doors');
    this.particlesContainer = document.querySelector('.particles');
    this.profilePicture = document.getElementById('profile-picture');
    this.setupAmbientEffects();
    this.createParticles();
  }

  createParticles() {
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      // Randomize particle position
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      
      // Randomize particle size
      const size = Math.random() * 5 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Randomize animation delay and duration
      particle.style.animationDelay = `${Math.random() * 10}s`;
      particle.style.animationDuration = `${Math.random() * 10 + 5}s`;
      
      this.particlesContainer.appendChild(particle);
    }
  }

  setupAmbientEffects() {
    this.projectDoorsContainer.addEventListener('mousemove', (e) => {
      const doors = document.querySelectorAll('.project-door');
      doors.forEach(door => {
        const rect = door.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        door.style.transform = `
          perspective(1000px) 
          rotateX(${(y - rect.height/2) / 20}deg) 
          rotateY(${-(x - rect.width/2) / 20}deg)
        `;
      });
    });

    this.projectDoorsContainer.addEventListener('mouseleave', () => {
      const doors = document.querySelectorAll('.project-door');
      doors.forEach(door => {
        door.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
      });
    });
  }

  async initializePage() {
    await this.loadUserStats();
    await this.loadProjectDoors();
    await this.loadUserProfile();
  }

  async loadUserStats() {
    try {
      const stats = await getCurrentUserStats();
      document.getElementById('total-likes').textContent = stats.total_likes;
      document.getElementById('total-views').textContent = stats.total_views;
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  }

  async loadProjectDoors() {
    try {
      const projects = await getPublishedUserProjects();
      if (projects.length === 0) {
        this.showNoProjectsMessage();
      } else {
        projects.forEach(this.createProjectDoor.bind(this));
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  }

  createProjectDoor(project) {
    const doorElement = document.createElement('div');
    doorElement.classList.add('project-door');
    
    // Use "Imposter Social Network" as a fallback title
    const projectTitle = project.title || 'Imposter Social Network';
    
    doorElement.innerHTML = `
      <div class="project-door-frame"></div>
      <div class="project-door-cover"></div>
      <div class="project-door-panel">
        <h3>${projectTitle}</h3>
        <p>Likes: ${project.stats.likes}</p>
        <p>Views: ${project.stats.views}</p>
      </div>
      <div class="project-door-preview">
        <h3>${projectTitle}</h3>
        <img class="project-screenshot" src="https://images.websim.ai/v1/site/${project.id}/200" alt="Project Screenshot" onerror="this.style.display='none'">
        <div class="project-details">
          <p>Likes: ${project.stats.likes}</p>
          <p>Views: ${project.stats.views}</p>
        </div>
      </div>
      <div class="project-door-handle"></div>
    `;
    
    doorElement.addEventListener('click', () => {
      window.location.href = `https://websim.ai/p/${project.id}`;
    });

    this.projectDoorsContainer.appendChild(doorElement);
  }

  showNoProjectsMessage() {
    const noProjectsElement = document.createElement('div');
    noProjectsElement.classList.add('no-projects');
    noProjectsElement.innerHTML = `
      <p>No published projects found.</p>
      <p>Create and publish a project to see it here!</p>
    `;
    this.projectDoorsContainer.appendChild(noProjectsElement);
  }

  async loadUserProfile() {
    try {
      const user = await getCurrentUserProfile();
      if (user && user.username) {
        // Set profile picture
        this.profilePicture.src = `https://images.websim.ai/avatar/${user.username}`;
        this.profilePicture.alt = `${user.username}'s Profile Picture`;
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const hub = new ProjectHub();
  hub.initializePage();
});