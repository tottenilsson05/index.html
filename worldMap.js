export class WorldMap {
  constructor(game) {
    this.game = game;
    this.svg = null;
    this.countryData = null;
    this.zoom = null;
    this.hasSelectedCountry = false;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.colorScale = d3.scaleOrdinal()
      .range([
        '#8B0000', '#8B4500', '#8B8B00', '#458B00',
        '#006400', '#008B45', '#008B8B', '#00458B',
        '#00008B', '#45008B', '#8B008B', '#8B0045',
        '#CD5C5C', '#CD8C4F', '#548B54', '#548BBC',
        '#4F4F8B', '#8C4F8B', '#8B4563', '#8B795E',
        '#548B6C', '#4F8B8B', '#6C548B', '#8B4570'
      ]);
  }

  async init() {
    try {
      const projection = d3.geoMercator()
        .scale(this.width / 2 / Math.PI)
        .center([0, 0])
        .translate([this.width / 2, this.height / 2]);
      
      this.projection = projection; 
      const path = d3.geoPath().projection(projection);
      
      this.svg = d3.select('#map-container')
        .append('svg')
        .attr('width', this.width)
        .attr('height', this.height);

      // Create a container for the map that will be transformed
      const g = this.svg.append('g');

      // Initialize zoom behavior
      this.zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        });

      this.svg.call(this.zoom);
      
      try {
        const response = await fetch('https://unpkg.com/world-atlas@2/countries-110m.json');
        if (!response.ok) throw new Error('Failed to fetch map data');
        const worldData = await response.json();
        this.countryData = topojson.feature(worldData, worldData.objects.countries);
      } catch (error) {
        console.error('Error loading map data:', error);
        throw new Error('Failed to initialize map: Could not load geographical data');
      }
      
      // Add color generation for countries
      g.selectAll('path')
        .data(this.countryData.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('class', 'country')
        .style('fill', d => this.colorScale(d.properties.name))
        .style('stroke', '#2a2a2a')
        .style('stroke-width', '0.5')
        .on('click', (event, d) => this.handleCountryClick(event, d, path));
        
    } catch (error) {
      console.error('Error initializing map:', error);
      // Show error message to user
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = 'Error loading map. Please refresh the page or try again later.';
      document.body.appendChild(errorDiv);
    }
  }

  handleCountryClick(event, d, path) {
    if (!d || !d.properties || !d.properties.name) {
      console.error('Invalid country data:', d);
      return;
    }

    if (!this.hasSelectedCountry) {
      this.zoomToCountry(d, path);
      this.hasSelectedCountry = true;
      this.game.selectCountry(d.properties.name);
    } else if (d.properties.name === this.game.selectedCountry) {
      this.zoomToCountry(d, path);
    } else if (this.game.countries.has(d.properties.name)) { 
      this.game.promptAttack(d.properties.name);
    }
  }

  getNeighboringCountries(countryFeature) {
    // Remove the neighbor check since we can attack any country
    return new Set(
      this.countryData.features
        .map(f => f.properties.name)
        .filter(name => 
          name !== countryFeature.properties.name && 
          !this.game.countries.get(countryFeature.properties.name)?.conqueredTerritories.includes(name)
        )
    );
  }

  zoomToCountry(d, path) {
    const bounds = path.bounds(d);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;
    const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / this.width, dy / this.height)));
    const translate = [this.width / 2 - scale * x, this.height / 2 - scale * y];

    this.svg.transition()
      .duration(750)
      .call(
        this.zoom.transform,
        d3.zoomIdentity
          .translate(translate[0], translate[1])
          .scale(scale)
      );
  }

  updateColors() {
    const selectedCountry = this.game.countries.get(this.game.selectedCountry);
    if (!selectedCountry) return;

    const selectedFeature = this.countryData.features.find(
      f => f.properties.name === this.game.selectedCountry
    );
    
    let neighbors = new Set();
    if (selectedFeature) {
      neighbors = this.getNeighboringCountries(selectedFeature);
    }

    this.svg.selectAll('.country')
      .attr('class', d => {
        const name = d.properties.name;
        if (name === this.game.selectedCountry) {
          return 'country selected';
        }
        if (selectedCountry.conqueredTerritories.includes(name)) {
          return 'country selected conquered';
        }
        if (neighbors.has(name)) {
          return 'country neighbor';
        }
        return 'country';
      });
  }

  createBattleEffects(attackerName, defenderName) {
    const attacker = this.countryData.features.find(f => f.properties.name === attackerName);
    const defender = this.countryData.features.find(f => f.properties.name === defenderName);
    
    const [ax, ay] = d3.geoCentroid(attacker);
    const [dx, dy] = d3.geoCentroid(defender);
    
    const [px1, py1] = this.projection([ax, ay]);
    const [px2, py2] = this.projection([dx, dy]);
    
    // Create battle container
    const battleContainer = this.svg.append('g')
      .attr('class', 'battle-effects');

    // Create line of battle
    const battleLine = battleContainer.append('line')
      .attr('x1', px1)
      .attr('y1', py1)
      .attr('x2', px1)
      .attr('y2', py1)
      .style('stroke', 'rgba(255, 100, 50, 0.6)')
      .style('stroke-width', 2);

    battleLine.transition()
      .duration(750)
      .attr('x2', px2)
      .attr('y2', py2);

    // Create multiple explosions along the path
    const numExplosions = 5;
    for (let i = 0; i < numExplosions; i++) {
      setTimeout(() => {
        const t = i / (numExplosions - 1);
        const x = px1 + (px2 - px1) * t;
        const y = py1 + (py2 - py1) * t;
        
        const explosion = battleContainer.append('g')
          .attr('transform', `translate(${x}, ${y})`);
        
        // Inner explosion
        explosion.append('circle')
          .attr('r', 0)
          .style('fill', 'rgba(255, 200, 50, 0.6)')
          .attr('filter', 'url(#glow)')
          .transition()
          .duration(600)
          .attr('r', 15)
          .style('opacity', 0)
          .remove();

        // Outer shockwave
        explosion.append('circle')
          .attr('r', 0)
          .style('fill', 'none')
          .style('stroke', 'rgba(255, 100, 50, 0.4)')
          .style('stroke-width', 2)
          .transition()
          .duration(800)
          .attr('r', 25)
          .style('opacity', 0)
          .remove();

        setTimeout(() => explosion.remove(), 800);
      }, i * 200);
    }

    return battleContainer;
  }

  clearBattleEffects(battleContainer) {
    battleContainer.remove();
  }

  showVictoryEffects(winner, loser) {
    const winnerFeature = this.countryData.features.find(f => f.properties.name === winner);
    const [x, y] = d3.geoCentroid(winnerFeature);
    
    // Create victory animation
    const victory = this.svg.append('g')
      .attr('class', 'victory-effect')
      .attr('transform', `translate(${this.projection([x, y])[0]}, ${this.projection([x, y])[1]})`);

    // Create expanding rings
    victory.append('circle')
      .attr('r', 0)
      .style('fill', 'none')
      .style('stroke', 'rgba(100, 255, 100, 0.6)')
      .style('stroke-width', 2)
      .transition()
      .duration(1000)
      .attr('r', 40)
      .style('opacity', 0)
      .remove();

    setTimeout(() => victory.remove(), 1000);
  }

  updateTerritory(loser, winner) {
    const winnerCountry = this.game.countries.get(winner);
    const conqueredTerritories = winnerCountry.conqueredTerritories;

    // Update fill color to match winner's color for all conquered territories
    const winnerColor = this.svg.selectAll('.country')
      .filter(d => d.properties.name === winner)
      .style('fill');

    // Update the loser and all its previously conquered territories
    this.svg.selectAll('.country')
      .filter(d => {
        const name = d.properties.name;
        return name === loser || conqueredTerritories.includes(name);
      })
      .style('fill', winnerColor)
      .classed('conquered', true)
      .classed('selected', false);

    // Update borders for all connected territories
    this.svg.selectAll('.country')
      .filter(d => {
        const name = d.properties.name;
        return name === winner || conqueredTerritories.includes(name);
      })
      .style('stroke', '#2a2a2a')
      .style('stroke-width', '0.5');
  }
}