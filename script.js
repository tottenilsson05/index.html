let stars = '';
for (let i = 0; i < 100; i++) {
  const x = Math.random() * 100;
  const y = Math.random() * 100;
  const duration = 3 + Math.random() * 4;
  const delay = Math.random() * 2;
  const size = Math.random() * 3;
  stars += `
    <div class="star" style="
      left: ${x}%;
      top: ${y}%;
      width: ${size}px;
      height: ${size}px;
      background: white;
      position: absolute;
      border-radius: 50%;
      animation: twinkle ${duration}s ${delay}s infinite;
    "></div>
  `;
}
document.querySelector('.stars').innerHTML = stars;

async function loadFollowers(username, container) {
  const response = await fetch(`/api/v1/users/${username}/followers`);
  const data = await response.json();
  
  container.innerHTML = '';
  data.followers.data.forEach(({follow}) => {
    const follower = document.createElement('div');
    follower.className = 'user-item';
    follower.innerHTML = `
      <a href="https://websim.ai/@${follow.user.username}" class="user-link">
        <img src="https://images.websim.ai/avatar/${follow.user.username}" alt="${follow.user.username}" class="user-avatar">
        <span class="user-name">@${follow.user.username}</span>
      </a>
    `;
    container.appendChild(follower);
  });
}

async function loadFollowing(username, container) {
  const response = await fetch(`/api/v1/users/${username}/following`);
  const data = await response.json();
  
  container.innerHTML = '';
  data.following.data.forEach(({follow}) => {
    const following = document.createElement('div');
    following.className = 'user-item';
    following.innerHTML = `
      <a href="https://websim.ai/@${follow.user.username}" class="user-link">
        <img src="https://images.websim.ai/avatar/${follow.user.username}" alt="${follow.user.username}" class="user-avatar">
        <span class="user-name">@${follow.user.username}</span>
      </a>
    `;
    container.appendChild(following);
  });
}

async function initProfile() {
  const user = await window.websim.getCreatedBy();
  if (!user) return;

  // Set profile image and username
  const avatarUrl = `https://images.websim.ai/avatar/${user.username}`;
  document.getElementById('user-avatar').style.backgroundImage = `url('${avatarUrl}')`;
  document.getElementById('user-avatar').style.backgroundSize = 'cover';
  document.getElementById('username-display').textContent = `@${user.username}`;
  
  // Get user stats
  const statsResponse = await fetch(`/api/v1/users/${user.username}/stats`);
  const statsData = await statsResponse.json();
  document.getElementById('total-likes').textContent = statsData.stats.total_likes;

  // Get followers count
  const followersResponse = await fetch(`/api/v1/users/${user.username}/followers?count=true`);
  const followersData = await followersResponse.json();
  document.getElementById('followers-count').textContent = followersData.followers.meta.count || 0;

  // Get following count
  const followingResponse = await fetch(`/api/v1/users/${user.username}/following?count=true`);
  const followingData = await followingResponse.json();
  document.getElementById('following-count').textContent = followingData.following.meta.count || 0;

  // Load followers and following lists
  loadFollowers(user.username, document.getElementById('followers-list'));
  loadFollowing(user.username, document.getElementById('following-list'));

  // Set custom bio
  document.getElementById('bio').textContent = "Hello guys my name is ImAUser but you can just call me cloud, I used to have social anxiety and used to stutter a lot. but after visitng websim I am better.";

  // Load projects
  const projectsResponse = await fetch(`/api/v1/users/${user.username}/projects?posted=true`);
  const projectsData = await projectsResponse.json();
  
  const projectsGrid = document.getElementById('projects-grid');
  projectsGrid.innerHTML = '';

  projectsData.projects.data.forEach(({ project, site }) => {
    if (!site) return;
    
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const imageUrl = `https://images.websim.ai/v1/site/${site.id}/600`;
    
    card.innerHTML = `
      <img class="project-image" src="${imageUrl}" alt="${project.title || 'Project'}">
      <div class="project-info">
        <h3 class="project-title">${project.title || 'Untitled Project'}</h3>
        ${project.description ? `<p class="project-description">${project.description}</p>` : ''}
      </div>
    `;
    
    card.addEventListener('click', () => {
      window.location.href = `https://websim.ai/c/${site.id}`;
    });
    
    projectsGrid.appendChild(card);
  });
}

// Music player functionality
const playPauseBtn = document.querySelector('.play-pause');
const audio = document.getElementById('bgMusic');
const songDisplay = document.querySelector('.song-info span');
let isPlaying = true;

const songs = [
  {
    src: "We're Finally Landing 4.mp3",
    title: "We're Finally Landing - by Home"
  },
  {
    src: "scizzie - aquatic ambience 0.mp3",
    title: "Aquatic Ambience - by Scizzie"
  },
  {
    src: "C418 - Wet Hands - Minecraft Volume Alpha 0.mp3",
    title: "Wet Hands - by C418"
  },
  {
    src: "It's just a burning memory but more nostalgic (Read description) 0.mp3",
    title: "It's just a burning memory but more nostalgic - by embrr_"
  },
  {
    src: "hisohkah, WMD - School Rooftop (Bird Sounds) 0.mp3",
    title: "School Rooftop (Bird Sounds) - by hisohkah, WMD"
  }
];

let currentSongIndex = Math.floor(Math.random() * songs.length);

function loadAndPlaySong(index) {
  const song = songs[index];
  audio.src = song.src;
  songDisplay.textContent = song.title;
  if (isPlaying) {
    audio.play().catch(err => {
      isPlaying = false;
      playPauseBtn.innerHTML = '<path d="M8 5v14l11-7z"/>';
    });
  }
}

window.addEventListener('load', () => {
  loadAndPlaySong(currentSongIndex);
});

playPauseBtn.addEventListener('click', () => {
  isPlaying = !isPlaying;
  if (isPlaying) {
    audio.play();
    playPauseBtn.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
  } else {
    audio.pause();
    playPauseBtn.innerHTML = '<path d="M8 5v14l11-7z"/>';
  }
});

// Play next song when current one ends
audio.addEventListener('ended', () => {
  currentSongIndex = Math.floor(Math.random() * songs.length);
  loadAndPlaySong(currentSongIndex);
  document.querySelector('.progress').style.width = '0%';
});

// Update progress bar based on audio time
audio.addEventListener('timeupdate', () => {
  const progress = (audio.currentTime / audio.duration) * 100;
  document.querySelector('.progress').style.width = `${progress}%`;
});

// Add smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';

// Toggle followers/following lists
document.querySelectorAll('.stat').forEach(stat => {
  stat.addEventListener('click', (e) => {
    const type = e.currentTarget.getAttribute('data-type');
    if (type === 'followers' || type === 'following') {
      document.getElementById('followers-modal').style.display = 'flex';
      document.querySelectorAll('.list-content').forEach(content => {
        content.style.display = 'none';
      });
      document.getElementById(`${type}-list`).style.display = 'block';
      document.getElementById('modal-title').textContent = type.charAt(0).toUpperCase() + type.slice(1);
    }
  });
});

// Close modal
document.querySelector('.close-modal').addEventListener('click', () => {
  document.getElementById('followers-modal').style.display = 'none';
});

// Add pixel rain effect
function createPixelRain() {
  const rain = document.createElement('div');
  rain.className = 'pixel-rain';
  document.body.appendChild(rain);

  for (let i = 0; i < 50; i++) {
    const pixel = document.createElement('div');
    pixel.className = 'rain-pixel';
    pixel.style.left = `${Math.random() * 100}%`;
    pixel.style.animationDuration = `${Math.random() * 2 + 1}s`;
    pixel.style.animationDelay = `${Math.random() * 2}s`;
    rain.appendChild(pixel);
  }
}

function createRain() {
  const rain = document.createElement('div');
  rain.className = 'rain-container';
  document.body.appendChild(rain);

  for (let i = 0; i < 100; i++) {
    const drop = document.createElement('div');
    drop.className = 'rain-drop';
    drop.style.left = `${Math.random() * 100}%`;
    drop.style.animationDuration = `${Math.random() * 1 + 0.5}s`;
    drop.style.animationDelay = `${Math.random() * 2}s`;
    rain.appendChild(drop);
  }

  setTimeout(() => {
    rain.remove();
  }, 30000); // Remove rain after 30 seconds
}

function createSeasonalEffects() {
  const date = new Date();
  const month = date.getMonth(); // 0-11
  const day = date.getDate();

  // Remove any existing seasonal classes
  document.body.classList.remove(
    'theme-christmas',
    'theme-halloween',
    'theme-easter',
    'theme-thanksgiving',
    'theme-valentines'
  );

  // Apply seasonal themes
  if (month === 11) { // December
    document.body.classList.add('theme-christmas');
    createSnow();
  } else if (month === 9) { // October
    document.body.classList.add('theme-halloween');
  } else if (month === 3) { // April
    document.body.classList.add('theme-easter');
  } else if (month === 10) { // November
    document.body.classList.add('theme-thanksgiving');
  } else if (month === 1) { // February
    document.body.classList.add('theme-valentines');
    if (day === 2) {
      showBirthdayMessage();
    }
  }
}

function showBirthdayMessage() {
  const message = document.createElement('div');
  message.className = 'birthday-message';
  message.innerHTML = `
    <div class="birthday-content">
      <h2>🎂 Happy Birthday! 🎂</h2>
      <p>Today is my birthday! Thanks for visiting!</p>
    </div>
  `;
  document.body.appendChild(message);
  
  setTimeout(() => {
    message.remove();
  }, 10000);
}

function createSnow() {
  const snow = document.createElement('div');
  snow.className = 'snow-container';
  document.body.appendChild(snow);

  for (let i = 0; i < 50; i++) {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.innerHTML = '❄';
    snowflake.style.left = `${Math.random() * 100}%`;
    snowflake.style.animationDuration = `${Math.random() * 3 + 2}s`;
    snowflake.style.animationDelay = `${Math.random() * 2}s`;
    snow.appendChild(snowflake);
  }
}

// Function to trigger random calming events
function triggerCalmingEvent() {
  const events = [
    createRain,
    createShootingStars,
    createButterflies,
    createFloatingLights,
    createAuroraBorealis
  ];
  
  const randomEvent = events[Math.floor(Math.random() * events.length)];
  randomEvent();
}

function createShootingStars() {
  const container = document.createElement('div');
  container.className = 'shooting-stars';
  document.body.appendChild(container);

  for (let i = 0; i < 5; i++) {
    const star = document.createElement('div');
    star.className = 'shooting-star';
    star.style.top = `${Math.random() * 50}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 3}s`;
    container.appendChild(star);
  }

  setTimeout(() => {
    container.remove();
  }, 10000);
}

function createButterflies() {
  const container = document.createElement('div');
  container.className = 'butterflies';
  document.body.appendChild(container);

  for (let i = 0; i < 10; i++) {
    const butterfly = document.createElement('div');
    butterfly.className = 'butterfly';
    butterfly.style.left = `${Math.random() * 100}%`;
    butterfly.style.animationDuration = `${Math.random() * 5 + 10}s`;
    butterfly.style.animationDelay = `${Math.random() * 5}s`;
    container.appendChild(butterfly);
  }

  setTimeout(() => {
    container.remove();
  }, 20000);
}

function createFloatingLights() {
  const container = document.createElement('div');
  container.className = 'floating-lights';
  document.body.appendChild(container);

  for (let i = 0; i < 20; i++) {
    const light = document.createElement('div');
    light.className = 'floating-light';
    light.style.left = `${Math.random() * 100}%`;
    light.style.top = `${Math.random() * 100}%`;
    light.style.animationDuration = `${Math.random() * 4 + 4}s`;
    light.style.animationDelay = `${Math.random() * 4}s`;
    container.appendChild(light);
  }

  setTimeout(() => {
    container.remove();
  }, 15000);
}

function createAuroraBorealis() {
  const aurora = document.createElement('div');
  aurora.className = 'aurora-container';
  for (let i = 0; i < 3; i++) {
    const wave = document.createElement('div');
    wave.className = 'aurora-wave';
    wave.style.animationDelay = `${i * 2}s`;
    aurora.appendChild(wave);
  }
  document.body.appendChild(aurora);

  setTimeout(() => {
    aurora.remove();
  }, 20000);
}

// Update retro cursor effect
function createRetroCursor() {
}

// Initialize all effects
window.addEventListener('load', () => {
  bootSequence();
  createPixelRain();
  initProfile();
  
  playPauseBtn.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'; // Show pause icon by default
  
  createSeasonalEffects();
  
  // Trigger calming events randomly (every 60-180 seconds)
  setInterval(() => {
    if (Math.random() < 0.3) { // 30% chance to trigger
      triggerCalmingEvent();
    }
  }, 60000 + Math.random() * 120000);
});

// Add retro boot sequence
function bootSequence() {
  const boot = document.createElement('div');
  boot.className = 'boot-sequence';
  boot.innerHTML = `
    <div class="boot-text">
      <div>LOADING PROFILE OS v1.0</div>
      <div>INITIALIZING...</div>
      <div class="progress">
        <div class="progress-bar"></div>
      </div>
    </div>
  `;
  document.body.appendChild(boot);

  setTimeout(() => {
    boot.style.opacity = '0';
    setTimeout(() => boot.remove(), 1000);
  }, 3000);
}