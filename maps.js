// Create map data
export const MAPS = [
  {
    id: 'ancient-ruins',
    name: 'Ancient Ruins',
    description: 'A maze of crumbling stone walls and overgrown vegetation.',
    wallColor: 0x886622,
    floorTexture: 'stone',
    lighting: 'warm',
    fogColor: 0x443311,
    ambientColor: 0x554433,
    gradient: 'linear-gradient(45deg, #886622, #443311)'
  },
  {
    id: 'cyber-grid',
    name: 'Cyber Grid',
    description: 'Digital pathways in a neon-lit virtual space.',
    wallColor: 0x00ffff,
    floorTexture: 'grid',
    lighting: 'neon',
    fogColor: 0x000033,
    ambientColor: 0x003366,
    gradient: 'linear-gradient(45deg, #00ffff, #000033)'
  },
  {
    id: 'abandoned-factory',
    name: 'Abandoned Factory',
    description: 'A dimly lit, industrial environment with old machinery.',
    wallColor: 0x665544,
    floorTexture: 'concrete',
    lighting: 'dim',
    fogColor: 0x333333,
    ambientColor: 0x444444,
    gradient: 'linear-gradient(45deg, #665544, #333333)'
  },
  {
    id: 'creepy-carnival',
    name: 'Creepy Carnival',
    description: 'A spooky, abandoned carnival with rickety booths and Ferris wheels.',
    wallColor: 0x990033,
    floorTexture: 'wood',
    lighting: 'flickering',
    fogColor: 0x660066,
    ambientColor: 0x993333,
    gradient: 'linear-gradient(45deg, #990033, #660066)'
  },
  {
    id: 'deserted-island',
    name: 'Deserted Island',
    description: 'A tropical island with sandy beaches and palm trees.',
    wallColor: 0x44ccff,
    floorTexture: 'sand',
    lighting: 'sunny',
    fogColor: 0x00ccff,
    ambientColor: 0x66cccc,
    gradient: 'linear-gradient(45deg, #44ccff, #00ccff)'
  },
  {
    id: 'dystopian-city',
    name: 'Dystopian City',
    description: 'A dark, gritty cityscape with towering skyscrapers and neon lights.',
    wallColor: 0x3366ff,
    floorTexture: 'asphalt',
    lighting: 'neon',
    fogColor: 0x003366,
    ambientColor: 0x004466,
    gradient: 'linear-gradient(45deg, #3366ff, #003366)'
  },
  {
    id: 'enchanted-forest',
    name: 'Enchanted Forest',
    description: 'A mystical forest with glowing mushrooms and twinkling fireflies.',
    wallColor: 0x33cc33,
    floorTexture: 'dirt',
    lighting: 'soft',
    fogColor: 0x006600,
    ambientColor: 0x009900,
    gradient: 'linear-gradient(45deg, #33cc33, #006600)'
  },
  {
    id: 'futuristic-lab',
    name: 'Futuristic Lab',
    description: 'A high-tech laboratory with sleek equipment and holographic displays.',
    wallColor: 0x66ccff,
    floorTexture: 'metal',
    lighting: 'bright',
    fogColor: 0x00ccff,
    ambientColor: 0x66cccc,
    gradient: 'linear-gradient(45deg, #66ccff, #00ccff)'
  },
  {
    id: 'haunted-mansion',
    name: 'Haunted Mansion',
    description: 'A spooky, abandoned mansion with cobwebs and creaking doors.',
    wallColor: 0x996666,
    floorTexture: 'wood',
    lighting: 'dim',
    fogColor: 0x663333,
    ambientColor: 0x996666,
    gradient: 'linear-gradient(45deg, #996666, #663333)'
  },
  {
    id: 'icy-tundra',
    name: 'Icy Tundra',
    description: 'A frozen, barren landscape with snow and ice.',
    wallColor: 0x66cccc,
    floorTexture: 'snow',
    lighting: 'cold',
    fogColor: 0x00cccc,
    ambientColor: 0x66cccc,
    gradient: 'linear-gradient(45deg, #66cccc, #00cccc)'
  },
  {
    id: 'jungle-temple',
    name: 'Jungle Temple',
    description: 'An ancient temple hidden deep in the jungle.',
    wallColor: 0x33cc66,
    floorTexture: 'stone',
    lighting: 'warm',
    fogColor: 0x006633,
    ambientColor: 0x009966,
    gradient: 'linear-gradient(45deg, #33cc66, #006633)'
  },
  {
    id: 'kaleidoscope',
    name: 'Kaleidoscope',
    description: 'A colorful, ever-changing environment with shifting patterns and shapes.',
    wallColor: 0x99ccff,
    floorTexture: 'prism',
    lighting: 'psychedelic',
    fogColor: 0x00ccff,
    ambientColor: 0x66cccc,
    gradient: 'linear-gradient(45deg, #99ccff, #00ccff)'
  },
  {
    id: 'mysterious-swamp',
    name: 'Mysterious Swamp',
    description: 'A murky, mystical swamp with twisting waterways and glowing plants.',
    wallColor: 0x336633,
    floorTexture: 'mud',
    lighting: 'soft',
    fogColor: 0x003300,
    ambientColor: 0x006600,
    gradient: 'linear-gradient(45deg, #336633, #003300)'
  },
  {
    id: 'neon-nightclub',
    name: 'Neon Nightclub',
    description: 'A vibrant, pulsing nightclub with flashing lights and thumping music.',
    wallColor: 0x66ffcc,
    floorTexture: 'dancefloor',
    lighting: 'disco',
    fogColor: 0x00ffcc,
    ambientColor: 0x66ffcc,
    gradient: 'linear-gradient(45deg, #66ffcc, #00ffcc)'
  },
  {
    id: 'old-library',
    name: 'Old Library',
    description: 'A dusty, abandoned library with old books and creaking shelves.',
    wallColor: 0x996633,
    floorTexture: 'wood',
    lighting: 'dim',
    fogColor: 0x663300,
    ambientColor: 0x996633,
    gradient: 'linear-gradient(45deg, #996633, #663300)'
  },
  {
    id: 'pipeworks',
    name: 'Pipeworks',
    description: 'A maze of pipes and machinery in a steampunk-inspired environment.',
    wallColor: 0x663333,
    floorTexture: 'metal',
    lighting: 'warm',
    fogColor: 0x333333,
    ambientColor: 0x444444,
    gradient: 'linear-gradient(45deg, #663333, #333333)'
  },
  {
    id: 'ruined-castle',
    name: 'Ruined Castle',
    description: 'A crumbling, abandoned castle with overgrown walls and towers.',
    wallColor: 0x886622,
    floorTexture: 'stone',
    lighting: 'warm',
    fogColor: 0x443311,
    ambientColor: 0x554433,
    gradient: 'linear-gradient(45deg, #886622, #443311)'
  },
  {
    id: 'space-station',
    name: 'Space Station',
    description: 'A futuristic space station with sleek corridors and zero-gravity areas.',
    wallColor: 0x66ccff,
    floorTexture: 'metal',
    lighting: 'bright',
    fogColor: 0x00ccff,
    ambientColor: 0x66cccc,
    gradient: 'linear-gradient(45deg, #66ccff, #00ccff)'
  },
  {
    id: 'steampunk-city',
    name: 'Steampunk City',
    description: 'A city with a mix of Victorian and industrial elements, powered by steam and clockwork.',
    wallColor: 0x996633,
    floorTexture: 'cobblestone',
    lighting: 'warm',
    fogColor: 0x663300,
    ambientColor: 0x996633,
    gradient: 'linear-gradient(45deg, #996633, #663300)'
  },
  {
    id: 'surreal-landscape',
    name: 'Surreal Landscape',
    description: 'A dreamlike environment with melting objects and distorted perspectives.',
    wallColor: 0x99ccff,
    floorTexture: 'prism',
    lighting: 'psychedelic',
    fogColor: 0x00ccff,
    ambientColor: 0x66cccc,
    gradient: 'linear-gradient(45deg, #99ccff, #00ccff)'
  },
  {
    id: 'techno-club',
    name: 'Techno Club',
    description: 'A high-energy nightclub with flashing lights and pulsating music.',
    wallColor: 0x66ffcc,
    floorTexture: 'dancefloor',
    lighting: 'disco',
    fogColor: 0x00ffcc,
    ambientColor: 0x66ffcc,
    gradient: 'linear-gradient(45deg, #66ffcc, #00ffcc)'
  },
  {
    id: 'underwater-ruins',
    name: 'Underwater Ruins',
    description: 'An ancient city hidden beneath the waves, with crumbling structures and marine life.',
    wallColor: 0x44ccff,
    floorTexture: 'coral',
    lighting: 'soft',
    fogColor: 0x00ccff,
    ambientColor: 0x66cccc,
    gradient: 'linear-gradient(45deg, #44ccff, #00ccff)'
  },
  {
    id: 'victorian-mansion',
    name: 'Victorian Mansion',
    description: 'A grand, ornate mansion with intricate furnishings and luxurious decor.',
    wallColor: 0x996666,
    floorTexture: 'wood',
    lighting: 'warm',
    fogColor: 0x663333,
    ambientColor: 0x996666,
    gradient: 'linear-gradient(45deg, #996666, #663333)'
  },
  {
    id: 'wild-west',
    name: 'Wild West',
    description: 'A dusty, lawless frontier town with saloons and outlaws.',
    wallColor: 0x886622,
    floorTexture: 'wood',
    lighting: 'warm',
    fogColor: 0x443311,
    ambientColor: 0x554433,
    gradient: 'linear-gradient(45deg, #886622, #443311)'
  }
];

let selectedMap = null;

// Initialize map selection
export function initMapMenu() {
  const mapGrid = document.querySelector('.map-grid');
  const clickSound = document.getElementById('click-sound');
  
  MAPS.forEach(mapData => {
    const card = document.createElement('div');
    card.className = 'map-card';
    card.innerHTML = `
      <div class="map-preview" style="background: ${mapData.gradient}"></div>
      <div class="map-name">${mapData.name}</div>
      <div class="map-description">${mapData.description}</div>
      <button class="enable-button" data-map-id="${mapData.id}">
        ${selectedMap === mapData.id ? 'Enabled' : 'Enable'}
      </button>
    `;

    card.querySelector('.enable-button').addEventListener('click', (e) => {
      clickSound.play();
      const button = e.target;
      
      // Disable all other buttons
      document.querySelectorAll('.enable-button').forEach(btn => {
        btn.classList.remove('enabled');
        btn.textContent = 'Enable';
      });
      
      // Enable selected button
      button.classList.add('enabled');
      button.textContent = 'Enabled';
      selectedMap = mapData.id;
      
      // Save selection to localStorage
      localStorage.setItem('selectedMap', mapData.id);
    });

    mapGrid.appendChild(card);
  });

  // Load saved map selection
  const savedMap = localStorage.getItem('selectedMap');
  if (savedMap) {
    const savedButton = document.querySelector(`.enable-button[data-map-id="${savedMap}"]`);
    if (savedButton) {
      savedButton.click();
    }
  }
}

export function getSelectedMap() {
  return MAPS.find(map => map.id === selectedMap) || MAPS[0];
}