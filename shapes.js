import { transitionManager } from './transitions.js';

export const shapePresets = {
  cycledBlots: {
    cycleIntervals: [6666, 9999, 13666], 
    currentPreset: 'random',
    lastTransitionTime: Date.now(),
    presetOrder: [
      'demonFace',
      'titanFace', 
      'ghostFace',
      'undeadBrain',
      'voidBrain',
      'hellButterfly',
      'demonicBat',
      'cursedOwl',
      'hellhound'
    ],
    
    getNextPreset() {
      // Don't include random in the cycle
      const availablePresets = this.presetOrder;
      const randomIndex = Math.floor(Math.random() * availablePresets.length);
      const nextPreset = availablePresets[randomIndex];
      
      // Start transition from current to next preset
      const sourcePreset = this.currentPreset === 'random' ? null : shapePresets[this.currentPreset];
      const targetPreset = nextPreset === 'random' ? null : shapePresets[nextPreset];
      
      if (sourcePreset && targetPreset) {
        transitionManager.startTransition(sourcePreset, targetPreset);
      }
      
      this.currentPreset = nextPreset;
      this.lastTransitionTime = Date.now();
      
      const randomIntervalIndex = Math.floor(Math.random() * this.cycleIntervals.length);
      return {
        preset: nextPreset,
        interval: this.cycleIntervals[randomIntervalIndex]
      };
    },

    getCurrentPreset() {
      // If current preset is random, return null to keep random generation
      if (this.currentPreset === 'random') {
        return null;
      }

      // Check if we're in a transition
      const transitionState = transitionManager.getCurrentState();
      if (transitionState && !transitionState.isComplete) {
        return {
          features: transitionState.features,
          isTransitioning: true,
          progress: transitionState.progress
        };
      }

      // Return current preset
      return shapePresets[this.currentPreset];
    }
  },
  random: null, 
  demonFace: {
    bounds: { x: 2, y: 2.5, z: 0.7 },
    features: [
      { pos: [0, 0.8, 0], size: 1.8, density: 1.3 },     // Demonic Head
      { pos: [0.5, 0.5, 0], size: 0.3, density: 1.5 },   // Glowing Eye Socket
      { pos: [-0.5, 0.5, 0], size: 0.3, density: 1.5 },  // Glowing Eye Socket
      { pos: [0.5, 0.5, 0], size: 0.15, density: 1.8 },  // Burning Eye
      { pos: [-0.5, 0.5, 0], size: 0.15, density: 1.8 }, // Burning Eye
      { pos: [0, 0.2, 0], size: 0.25, density: 1.2 },    // Twisted Nose
      { pos: [0, -0.2, 0], size: 0.5, density: 1.6 },    // Fanged Maw
      { pos: [0.8, 1.2, 0], size: 0.6, density: 1.1 },   // Curved Horn
      { pos: [-0.8, 1.2, 0], size: 0.6, density: 1.1 },  // Curved Horn
      { pos: [0.4, -0.4, 0], size: 0.3, density: 1.4 },  // Sharp Fang
      { pos: [-0.4, -0.4, 0], size: 0.3, density: 1.4 }, // Sharp Fang
      { pos: [1.0, 0.2, 0], size: 0.4, density: 0.9 },   // Hellfire Aura
      { pos: [-1.0, 0.2, 0], size: 0.4, density: 0.9 }   // Hellfire Aura
    ]
  },

  titanFace: {
    bounds: { x: 2.5, y: 2.5, z: 0.7 },
    features: [
      { pos: [0, 0.8, 0], size: 2.0, density: 1.4 },     // Colossal Head
      { pos: [0.6, 0.5, 0], size: 0.4, density: 1.6 },   // Void Eye Socket
      { pos: [-0.6, 0.5, 0], size: 0.4, density: 1.6 },  // Void Eye Socket
      { pos: [0, 0.2, 0], size: 0.3, density: 1.3 },     // Twisted Nose
      { pos: [0, -0.3, 0], size: 0.7, density: 1.8 },    // Monstrous Maw
      { pos: [1.0, 1.2, 0], size: 0.8, density: 1.2 },   // Bone Protrusion
      { pos: [-1.0, 1.2, 0], size: 0.8, density: 1.2 },  // Bone Protrusion
      { pos: [0.5, -0.5, 0], size: 0.4, density: 1.5 },  // Exposed Teeth
      { pos: [-0.5, -0.5, 0], size: 0.4, density: 1.5 }, // Exposed Teeth
      { pos: [1.2, 0.3, 0], size: 0.6, density: 1.0 },   // Flesh Tendrils
      { pos: [-1.2, 0.3, 0], size: 0.6, density: 1.0 }   // Flesh Tendrils
    ]
  },

  ghostFace: {
    bounds: { x: 2, y: 2.5, z: 0.7 },
    features: [
      { pos: [0, 0.7, 0], size: 1.6, density: 0.6 },     // Ethereal Head
      { pos: [0.4, 0.4, 0], size: 0.3, density: 0.8 },   // Hollow Eye
      { pos: [-0.4, 0.4, 0], size: 0.3, density: 0.8 },  // Hollow Eye
      { pos: [0, 0, 0], size: 0.2, density: 0.5 },       // Void Where Nose Should Be
      { pos: [0, -0.3, 0], size: 0.4, density: 0.7 },    // Screaming Mouth
      { pos: [0.8, 0.8, 0], size: 0.5, density: 0.4 },   // Ethereal Wisps
      { pos: [-0.8, 0.8, 0], size: 0.5, density: 0.4 },  // Ethereal Wisps
      { pos: [0.6, -0.2, 0], size: 0.3, density: 0.5 },  // Distorted Cheek
      { pos: [-0.6, -0.2, 0], size: 0.3, density: 0.5 }  // Distorted Cheek
    ]
  },

  undeadBrain: {
    bounds: { x: 2, y: 2, z: 0.7 },
    features: [
      { pos: [0, 0.5, 0], size: 1.3, density: 1.2 },     // Rotting Mass
      { pos: [0.5, 0.3, 0], size: 0.6, density: 1.4 },   // Infected Hemisphere
      { pos: [-0.5, 0.3, 0], size: 0.6, density: 1.4 },  // Infected Hemisphere
      { pos: [0.3, 0.6, 0], size: 0.4, density: 1.3 },   // Pulsing Lobe
      { pos: [-0.3, 0.6, 0], size: 0.4, density: 1.3 },  // Pulsing Lobe
      { pos: [0.4, 0.0, 0], size: 0.5, density: 1.2 },   // Decaying Matter
      { pos: [-0.4, 0.0, 0], size: 0.5, density: 1.2 },  // Decaying Matter
      { pos: [0, -0.3, 0], size: 0.3, density: 1.1 },    // Corrupted Stem
      { pos: [0.2, 0.4, 0], size: 0.2, density: 1.5 },   // Void Fissure
      { pos: [-0.2, 0.4, 0], size: 0.2, density: 1.5 }   // Void Fissure
    ]
  },

  voidBrain: {
    bounds: { x: 2.5, y: 2.5, z: 1 },
    features: [
      { pos: [0, 0.5, 0], size: 1.6, density: 1.4 },     // Void Core
      { pos: [0.7, 0.4, 0], size: 0.8, density: 1.2 },   // Dark Matter Cluster
      { pos: [-0.7, 0.4, 0], size: 0.8, density: 1.2 },  // Dark Matter Cluster
      { pos: [0, -0.4, 0], size: 0.6, density: 1.0 },    // Entropy Stream
      { pos: [0, 1.0, 0], size: 0.7, density: 1.1 },     // Chaos Crown
      { pos: [1.2, 0, 0], size: 0.5, density: 0.8 },     // Reality Tear
      { pos: [-1.2, 0, 0], size: 0.5, density: 0.8 },    // Reality Tear
      { pos: [0.4, 0.8, 0], size: 0.3, density: 1.5 },   // Void Tendril
      { pos: [-0.4, 0.8, 0], size: 0.3, density: 1.5 }   // Void Tendril
    ]
  },

  hellButterfly: {
    bounds: { x: 2.5, y: 2, z: 0.5 },
    features: [
      { pos: [1.0, 0.3, 0], size: 1.2, density: 0.9 },   // Burning Wing
      { pos: [-1.0, 0.3, 0], size: 1.2, density: 0.9 },  // Burning Wing
      { pos: [0, 0, 0], size: 0.3, density: 1.2 },       // Corrupted Body
      { pos: [0, 0.4, 0], size: 0.2, density: 1.0 },     // Skull Head
      { pos: [1.2, 0.4, 0], size: 0.8, density: 0.8 },   // Wing Bones
      { pos: [-1.2, 0.4, 0], size: 0.8, density: 0.8 },  // Wing Bones
      { pos: [0.8, 0.2, 0], size: 0.6, density: 1.1 },   // Hellfire Pattern
      { pos: [-0.8, 0.2, 0], size: 0.6, density: 1.1 }   // Hellfire Pattern
    ]
  },

  demonicBat: {
    bounds: { x: 2.5, y: 2, z: 0.5 },
    features: [
      { pos: [1.2, 0, 0], size: 1.4, density: 0.8 },     // Twisted Wing
      { pos: [-1.2, 0, 0], size: 1.4, density: 0.8 },    // Twisted Wing
      { pos: [0, 0.2, 0], size: 0.4, density: 1.1 },     // Corrupted Body
      { pos: [0, 0.5, 0], size: 0.3, density: 1.0 },     // Demon Head
      { pos: [0.8, 0.1, 0], size: 0.6, density: 0.9 },   // Bone Spikes
      { pos: [-0.8, 0.1, 0], size: 0.6, density: 0.9 },  // Bone Spikes
      { pos: [0.2, 0.5, 0], size: 0.15, density: 1.2 },  // Horned Ear
      { pos: [-0.2, 0.5, 0], size: 0.15, density: 1.2 }  // Horned Ear
    ]
  },

  cursedOwl: {
    bounds: { x: 2, y: 2.5, z: 0.6 },
    features: [
      { pos: [0, 0.8, 0], size: 1.2, density: 1.0 },     // Cursed Head
      { pos: [0.4, 0.9, 0], size: 0.5, density: 1.4 },   // Void Eye
      { pos: [-0.4, 0.9, 0], size: 0.5, density: 1.4 },  // Void Eye
      { pos: [0, 0.6, 0], size: 0.2, density: 1.2 },     // Hooked Beak
      { pos: [0.8, 0.2, 0], size: 0.9, density: 0.8 },   // Shadow Wing
      { pos: [-0.8, 0.2, 0], size: 0.9, density: 0.8 },  // Shadow Wing
      { pos: [0.6, 1.1, 0], size: 0.4, density: 0.9 },   // Demon Horn
      { pos: [-0.6, 1.1, 0], size: 0.4, density: 0.9 }   // Demon Horn
    ]
  },

  hellhound: {
    bounds: { x: 2.5, y: 2, z: 0.6 },
    features: [
      { pos: [0, 0.5, 0], size: 0.8, density: 1.1 },     // Demon Head
      { pos: [0.2, 0.7, 0], size: 0.2, density: 1.3 },   // Burning Eye
      { pos: [-0.2, 0.7, 0], size: 0.2, density: 1.3 },  // Burning Eye
      { pos: [0, 0.3, 0], size: 0.4, density: 1.2 },     // Snarling Snout
      { pos: [0.6, 0.8, 0], size: 0.3, density: 1.0 },   // Horned Ear
      { pos: [-0.6, 0.8, 0], size: 0.3, density: 1.0 },  // Horned Ear
      { pos: [0, 0.1, 0], size: 0.3, density: 1.4 },     // Fanged Maw
      { pos: [0.3, 0.2, 0], size: 0.4, density: 0.9 },   // Hellfire Mane
      { pos: [-0.3, 0.2, 0], size: 0.4, density: 0.9 }   // Hellfire Mane
    ]
  },

  getVariation: function(baseValue, variationAmount = 0.3) {
    return baseValue * (1 + (Math.random() - 0.5) * variationAmount);
  },

  getPositionVariation: function(pos, amount = 0.2) {
    return [
      pos[0] + (Math.random() - 0.5) * amount,
      pos[1] + (Math.random() - 0.5) * amount,
      pos[2] + (Math.random() - 0.5) * amount
    ];
  },

  randomizeFeature: function(feature) {
    const randomizedFeature = {
      pos: this.getPositionVariation(feature.pos),
      size: this.getVariation(feature.size),
      density: this.getVariation(feature.density)
    };
    return randomizedFeature;
  }
};