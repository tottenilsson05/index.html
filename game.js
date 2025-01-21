import { WorldMap } from './worldMap.js';
import { Country } from './country.js';

class Game {
  constructor() {
    this.year = new Date().getFullYear();
    this.countries = new Map();
    this.selectedCountry = null;
    this.worldMap = new WorldMap(this);
    this.alignments = ['Capitalism', 'Socialism', 'Fascism', 'Communism'];
    this.setupNotifications();
    this.initGame();
  }

  setupNotifications() {
    // Create notification container if it doesn't exist
    if (!document.getElementById('notification-container')) {
      const container = document.createElement('div');
      container.id = 'notification-container';
      document.body.appendChild(container);
    }
  }

  showNotification(message) {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Set initial opacity to 1 to override the animation's end state
    notification.style.opacity = '1';
    
    container.appendChild(notification);

    // Remove notification after 5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.remove();
      }, 300); // Allow time for fade out animation
    }, 5000);
  }

  async initGame() {
    await this.worldMap.init();
    await this.initCountries();
    this.startGameLoop();
    this.updateYearDisplay();
  }

  async initCountries() {
    try {
      // Fetch population data from REST Countries API
      const response = await fetch('https://restcountries.com/v3.1/all');
      if (!response.ok) throw new Error('Failed to fetch country data');
      const countriesData = await response.json();
      
      this.initializeCountriesWithData(countriesData);
    } catch (error) {
      console.warn('Failed to fetch country data, using fallback values:', error);
      this.initializeCountriesWithFallback();
    }
  }

  initializeCountriesWithData(countriesData) {
    this.worldMap.countryData.features.forEach(feature => {
      const countryName = feature.properties.name;
      const countryData = countriesData.find(c => 
        c.name.common === countryName || 
        c.name.official === countryName
      );
      
      // Base manpower on real population (1 manpower per 10,000 people)
      const population = countryData ? countryData.population : 100000;
      const baseManpower = Math.max(1000, Math.floor(population / 10000));
      
      this.countries.set(countryName, new Country(countryName, baseManpower));
    });
  }

  initializeCountriesWithFallback() {
    // Fallback data for major countries (population in millions)
    const fallbackPopulations = {
      'United States': 331,
      'China': 1411,
      'India': 1380,
      'Russia': 144,
      'Brazil': 213,
      'Japan': 125,
      'Germany': 83,
      'United Kingdom': 67,
      'France': 67,
      'Italy': 60,
    };

    this.worldMap.countryData.features.forEach(feature => {
      const countryName = feature.properties.name;
      // Use fallback data if available, otherwise use a random population between 1-50 million
      const populationInMillions = fallbackPopulations[countryName] || 
        Math.floor(Math.random() * 49) + 1;
      
      const baseManpower = Math.max(1000, Math.floor((populationInMillions * 1000000) / 10000));
      this.countries.set(countryName, new Country(countryName, baseManpower));
    });
  }

  selectAlignment(alignment) {
    if (!this.selectedCountry) return;
    
    const country = this.countries.get(this.selectedCountry);
    country.setAlignment(alignment);
    this.updateUI();
    
    // Hide alignment selection
    document.getElementById('alignment-select').classList.add('hidden');
  }

  selectCountry(countryName) {
    if (this.selectedCountry === countryName) return;
    
    this.selectedCountry = countryName;
    const uiContainer = document.getElementById('ui-container');
    uiContainer.classList.remove('hidden');
    uiContainer.classList.remove('collapsed');
    
    // Show alignment selection if not already chosen
    const country = this.countries.get(countryName);
    if (!country.alignment) {
      document.getElementById('alignment-select').classList.remove('hidden');
    }
    
    this.updateUI();
    this.worldMap.updateColors();
  }

  toggleUI() {
    const uiContainer = document.getElementById('ui-container');
    uiContainer.classList.toggle('collapsed');
  }

  updateUI() {
    if (!this.selectedCountry) return;
    
    const country = this.countries.get(this.selectedCountry);
    document.getElementById('country-name').textContent = this.selectedCountry;
    document.getElementById('manpower').textContent = country.manpower;
    document.getElementById('money').textContent = country.money;
    document.getElementById('steel').textContent = country.steel;
    document.getElementById('war-exhaustion').textContent = country.warExhaustion;
    document.getElementById('happiness').textContent = country.calculateHappiness();
    document.getElementById('civil-unrest').textContent = country.civilUnrest;
    document.getElementById('cities').textContent = country.cities;
    if (country.alignment) {
      document.getElementById('alignment').textContent = country.alignment;
    }
  }

  build(type) {
    if (!this.selectedCountry) return;
    
    const country = this.countries.get(this.selectedCountry);
    const costs = {
      city: 500,
      factory: 1000,
      tank: {
        money: 2000,
        steel: 5
      }
    };

    switch(type) {
      case 'city':
      case 'factory':
        if (country.money >= costs[type]) {
          country.money -= costs[type];
          if (type === 'city') {
            country.manpower += 1000;
            country.cities++;
          } else {
            country.factories++;
          }
          this.updateUI();
        }
        break;
      case 'tank':
        if (country.money >= costs.tank.money && country.steel >= costs.tank.steel) {
          country.money -= costs.tank.money;
          country.steel -= costs.tank.steel;
          country.tanks++;
          country.manpower += 2000; // Increased manpower bonus from tanks
          this.updateUI();
        }
        break;
    }
  }

  promptAttack(targetCountry) {
    // Validate input and check if countries exist
    if (!this.selectedCountry || !targetCountry) {
      console.error('Invalid country selection');
      return;
    }

    const attacker = this.countries.get(this.selectedCountry);
    const defender = this.countries.get(targetCountry);

    // Check if both countries exist
    if (!attacker || !defender) {
      console.error('One or both countries do not exist');
      return;
    }

    // Check if trying to attack own territory
    if (attacker.conqueredTerritories.includes(targetCountry)) {
      this.showMessage("Cannot attack your own territory!");
      return;
    }

    const attackModal = document.getElementById('attack-modal');
    const targetNameSpan = document.getElementById('target-country-name');
    const attackerStrength = document.getElementById('attacker-strength');
    const defenderStrength = document.getElementById('defender-strength');
    
    targetNameSpan.textContent = targetCountry;
    attackerStrength.textContent = attacker.manpower;
    defenderStrength.textContent = defender.manpower;
    
    attackModal.classList.remove('hidden');

    // Setup event listeners for the attack modal
    document.getElementById('confirm-attack').onclick = () => {
      attackModal.classList.add('hidden');
      this.startBattle(this.selectedCountry, targetCountry);
    };
    
    document.getElementById('cancel-attack').onclick = () => {
      attackModal.classList.add('hidden');
    };
  }

  startBattle(attackerName, defenderName) {
    // Validate inputs
    if (!attackerName || !defenderName) {
      console.error('Invalid country names in battle');
      return;
    }

    const attacker = this.countries.get(attackerName);
    const defender = this.countries.get(defenderName);
    
    // Validate both countries exist
    if (!attacker || !defender) {
      console.error('One or both countries no longer exist');
      return;
    }

    // Check if trying to attack own current territory
    if (attacker.conqueredTerritories.includes(defenderName)) {
      this.showMessage("Cannot attack your own territory!");
      return;
    }
    
    if (!attacker.canAttack()) {
      this.showMessage("War exhaustion too high! Cannot attack!");
      return;
    }

    // Calculate total manpower including conquered territories
    const getFullManpower = (country) => {
      let totalManpower = country.manpower;
      country.conqueredTerritories.forEach(territory => {
        const territoryCountry = this.countries.get(territory);
        if (territoryCountry) {
          totalManpower += territoryCountry.manpower;
        }
      });
      return totalManpower;
    };

    const attackerManpower = getFullManpower(attacker);
    const defenderManpower = getFullManpower(defender);
    
    const winner = attackerManpower > defenderManpower ? attackerName : defenderName;
    const loser = winner === attackerName ? defenderName : attackerName;
    
    let battleMessage = `${attackerName} attacks ${defenderName}!`;
    
    // Add recapture message if applicable
    const isRecapture = attacker.conqueredTerritories.some(territory => 
      defender.conqueredTerritories.includes(territory)
    );
    if (isRecapture && winner === attackerName) {
      battleMessage += " Recaptured lost territory!";
    }
    
    battleMessage += ` ${winner} is victorious!`;
    this.showNotification(battleMessage);
    
    const winningCountry = this.countries.get(winner);
    const losingCountry = this.countries.get(loser);
    
    // If the player loses, restart the game
    if (loser === this.selectedCountry) {
      this.showMessage("Game Over! Your country has been defeated!");
      setTimeout(() => {
        location.reload();
      }, 2000);
      return;
    }

    // Transfer all resources and territories
    const transferResources = (fromCountry, toCountry) => {
      toCountry.manpower += Math.floor(fromCountry.manpower * 0.7);
      toCountry.money += fromCountry.money;
      toCountry.steel += fromCountry.steel;
      toCountry.cities += fromCountry.cities;
      
      fromCountry.conqueredTerritories.forEach(territory => {
        if (this.countries.has(territory)) {
          const territoryCountry = this.countries.get(territory);
          if (territoryCountry) {
            toCountry.manpower += Math.floor(territoryCountry.manpower * 0.7);
            toCountry.money += territoryCountry.money;
            toCountry.steel += territoryCountry.steel;
            toCountry.cities += territoryCountry.cities;
          }
        }
      });
    };

    transferResources(losingCountry, winningCountry);
    
    // Add loser and its territories to winner's conquered territories
    winningCountry.conqueredTerritories = [
      ...winningCountry.conqueredTerritories,
      ...losingCountry.conqueredTerritories,
      loser
    ];
    
    // Remove duplicates from conquered territories
    winningCountry.conqueredTerritories = [...new Set(winningCountry.conqueredTerritories)];
    
    // Remove the losing country from the game
    this.countries.delete(loser);
    losingCountry.conqueredTerritories.forEach(territory => {
      this.countries.delete(territory);
    });
    
    // Apply war exhaustion
    const affectedCountry = this.countries.get(winner === this.selectedCountry ? winner : winner);
    if (affectedCountry) {
      affectedCountry.warExhaustion += 10 * (affectedCountry.warExhaustionMultiplier || 1);
    }
    
    // Update the map
    this.worldMap.updateTerritory(loser, winner);
    this.worldMap.updateColors();
    
    // Check for formable nations
    winningCountry.checkFormation();
    
    this.updateUI();
  }

  aiTurn() {
    const countryNames = Array.from(this.countries.keys());
    if (countryNames.length < 2) return; // Need at least 2 countries for battle
    
    const attackerName = countryNames[Math.floor(Math.random() * countryNames.length)];
    const attacker = this.countries.get(attackerName);
    
    if (!attacker) return; // Skip if country no longer exists
    
    // Get all possible targets that are not the current territory
    const possibleTargets = countryNames.filter(name => {
      // Make sure the target exists and isn't current territory
      if (!this.countries.has(name)) return false;
      if (name === attackerName) return false;
      if (attacker.conqueredTerritories?.includes(name)) return false;
      return true;
    });
    
    // Prioritize recapturing lost territories
    const lostTerritories = possibleTargets.filter(targetName => {
      const targetCountry = this.countries.get(targetName);
      return targetCountry.conqueredTerritories.some(territory => 
        attacker.conqueredTerritories.includes(territory)
      );
    });
    
    // Choose target, preferring lost territories if available
    const targets = lostTerritories.length > 0 ? lostTerritories : possibleTargets;
    
    if (targets.length > 0) {
      const defenderName = targets[Math.floor(Math.random() * targets.length)];
      const defender = this.countries.get(defenderName);
      
      // Final validation before battle
      if (attacker && defender && attacker.canAttack()) {
        this.startBattle(attackerName, defenderName);
      }
    }
  }

  showMessage(message) {
    const messageModal = document.getElementById('message-modal');
    const messageText = document.getElementById('message-text');
    
    messageText.textContent = message;
    messageModal.classList.remove('hidden');
    
    setTimeout(() => {
      messageModal.classList.add('hidden');
    }, 2000);
  }

  startGameLoop() {
    // Update resources every minute
    setInterval(() => {
      this.countries.forEach(country => {
        country.updateResources();
        // Add steel production from factories
        country.steel += country.factories * 1;
      });
      this.updateUI();
    }, 60000);

    // Reduce war exhaustion every minute
    setInterval(() => {
      this.countries.forEach(country => {
        country.warExhaustion = Math.max(0, country.warExhaustion - 50);
      });
      this.updateUI();
    }, 60000);

    // Update year every 3 minutes
    setInterval(() => {
      this.year++;
      this.updateYearDisplay();
    }, 180000);

    // AI countries attack more frequently (every 10-15 seconds)
    setInterval(() => {
      this.aiTurn();
    }, Math.random() * 5000 + 10000); // Random interval between 10-15 seconds
  }

  updateYearDisplay() {
    document.getElementById('year-display').textContent = `Year: ${this.year}`;
  }
}

window.game = new Game();