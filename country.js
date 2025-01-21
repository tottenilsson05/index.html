export class Country {
  constructor(name, baseManpower = 1000) {
    this.name = name;
    this.manpower = baseManpower;
    this.money = 1000;
    this.steel = 0;
    this.warExhaustion = 0;
    this.factories = 0;
    this.tanks = 0;
    this.cities = 1; 
    this.conqueredTerritories = [];
    this.happiness = 50;
    this.alignment = null;
    this.civilUnrest = 0;
    this.formable = null;
    this.checkFormables();
  }

  calculateHappiness() {
    let baseHappiness = Math.min(100, Math.floor(
      (this.money * this.cities) / 
      (this.warExhaustion + (this.manpower / 4))
    ));
    
    // Add 5% per city
    baseHappiness += this.cities * 5;
    
    // Cap at 100%
    this.happiness = Math.min(100, baseHappiness);
    
    this.civilUnrest = this.happiness < 30 ? (30 - this.happiness) : 0;
    
    return this.happiness;
  }

  setAlignment(alignment) {
    this.alignment = alignment;
    
    switch(alignment) {
      case 'Capitalism':
        this.moneyMultiplier = 1.5;
        this.manpowerMultiplier = 0.8;
        break;
      case 'Socialism':
        this.moneyMultiplier = 0.8;
        this.happinessBonus = 20;
        break;
      case 'Fascism':
        this.manpowerMultiplier = 1.5;
        this.warExhaustionMultiplier = 0.7;
        break;
      case 'Communism':
        this.productionMultiplier = 1.3;
        this.moneyMultiplier = 0.7;
        break;
      default:
        this.moneyMultiplier = 1;
        this.manpowerMultiplier = 1;
        this.happinessBonus = 0;
        this.warExhaustionMultiplier = 1;
        this.productionMultiplier = 1;
    }
  }

  updateResources() {
    const baseProduction = this.factories * 100;
    this.money += baseProduction * (this.moneyMultiplier || 1);
    this.steel += (this.factories * 10) * (this.productionMultiplier || 1);
    
    // Reduce war exhaustion over time
    if (this.warExhaustion > 0) {
      this.warExhaustion = Math.max(0, this.warExhaustion - 0.5); // Gradually decrease war exhaustion
    }
    
    this.calculateHappiness();
    this.checkRebellions();
    this.checkFormation();
  }

  checkRebellions() {
    if (this.happiness <= 30 && this.conqueredTerritories.length > 0) {
      this.conqueredTerritories = this.conqueredTerritories.filter(territory => {
        const rebellionChance = this.civilUnrest / 100;
        return Math.random() > rebellionChance;
      });
    }
  }

  canAttack() {
    return this.warExhaustion < 100;
  }

  checkFormables() {
    const europeanCountries = [
      'France', 'Germany', 'Italy', 'Spain', 'United Kingdom', 'Poland',
      'Romania', 'Netherlands', 'Belgium', 'Greece', 'Portugal', 'Sweden',
      'Hungary', 'Austria', 'Switzerland', 'Denmark', 'Finland', 'Norway'
    ];

    const asianCountries = [
      'China', 'Japan', 'Korea', 'Vietnam', 'Thailand', 'Indonesia',
      'Malaysia', 'Philippines', 'India', 'Pakistan', 'Bangladesh'
    ];

    if (europeanCountries.includes(this.name)) {
      this.formable = {
        name: 'European Union',
        requiredTerritories: europeanCountries,
        benefits: {
          moneyMultiplier: 2,
          productionMultiplier: 1.5,
          warExhaustionMultiplier: 0.5
        }
      };
    } else if (asianCountries.includes(this.name)) {
      this.formable = {
        name: 'Asian Alliance',
        requiredTerritories: asianCountries,
        benefits: {
          manpowerMultiplier: 2,
          productionMultiplier: 2,
          happinessBonus: 20
        }
      };
    }
  }

  checkFormation() {
    if (!this.formable) return false;
    
    const hasAllTerritories = this.formable.requiredTerritories.every(territory =>
      this.name === territory || this.conqueredTerritories.includes(territory)
    );

    if (hasAllTerritories) {
      this.applyFormableBenefits();
      return true;
    }
    return false;
  }

  applyFormableBenefits() {
    const benefits = this.formable.benefits;
    this.moneyMultiplier = (this.moneyMultiplier || 1) * (benefits.moneyMultiplier || 1);
    this.productionMultiplier = (this.productionMultiplier || 1) * (benefits.productionMultiplier || 1);
    this.manpowerMultiplier = (this.manpowerMultiplier || 1) * (benefits.manpowerMultiplier || 1);
    this.warExhaustionMultiplier = (this.warExhaustionMultiplier || 1) * (benefits.warExhaustionMultiplier || 1);
    this.happinessBonus = (this.happinessBonus || 0) + (benefits.happinessBonus || 0);
    
    // Show formation message
    if (window.game) {
      window.game.showMessage(`Formed ${this.formable.name}! New bonuses applied!`);
    }
  }
}