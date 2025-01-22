export class ShapeTransitionManager {
  constructor() {
    this.transitionTime = 2000; // 2 seconds for full transition
    this.burstTime = 1000; // 1 second for burst phase
    this.currentTransition = null;
    this.lastUpdate = 0;
    
    // Burst parameters
    this.burstForce = 5; // Maximum force multiplier for burst
    this.burstDecay = 0.95; // How quickly burst force decreases
  }

  startTransition(sourcePreset, targetPreset) {
    if (!sourcePreset || !targetPreset) return null;
    
    const mappedFeatures = this.mapFeatures(sourcePreset.features, targetPreset.features);
    
    // Add burst velocities to each feature
    mappedFeatures.source = mappedFeatures.source.map(feature => ({
      ...feature,
      burstVel: this.calculateBurstVelocity(feature.pos)
    }));

    mappedFeatures.target = mappedFeatures.target.map(feature => ({
      ...feature,
      burstVel: this.calculateBurstVelocity(feature.pos)
    }));
    
    this.currentTransition = {
      startTime: Date.now(),
      source: mappedFeatures.source,
      target: mappedFeatures.target,
      progress: 0,
      burstPhase: true // Start with burst phase
    };

    return this.currentTransition;
  }

  calculateBurstVelocity(pos) {
    // Calculate burst direction from center
    const angle = Math.atan2(pos[1], pos[0]);
    const distance = Math.sqrt(pos[0] * pos[0] + pos[1] * pos[1]);
    const randomness = 0.5; // Add some randomness to burst

    return [
      Math.cos(angle) * this.burstForce * (1 + Math.random() * randomness),
      Math.sin(angle) * this.burstForce * (1 + Math.random() * randomness),
      (Math.random() - 0.5) * this.burstForce // Random Z direction
    ];
  }

  getCurrentState() {
    if (!this.currentTransition) return null;

    const now = Date.now();
    const elapsed = now - this.currentTransition.startTime;
    this.currentTransition.progress = Math.min(elapsed / this.transitionTime, 1);

    // Determine if we're in burst or reform phase
    const burstProgress = Math.min(elapsed / this.burstTime, 1);
    const isInBurst = burstProgress < 1;
    this.currentTransition.burstPhase = isInBurst;

    let interpolatedFeatures;
    if (isInBurst) {
      // Burst phase - expand outward
      interpolatedFeatures = this.currentTransition.source.map(feature => 
        this.applyBurst(feature, burstProgress)
      );
    } else {
      // Reform phase - interpolate to target
      const reformProgress = (elapsed - this.burstTime) / (this.transitionTime - this.burstTime);
      const t = this.easeInOutCubic(Math.max(0, Math.min(1, reformProgress)));
      
      interpolatedFeatures = this.currentTransition.source.map((sourceFeature, index) => {
        const targetFeature = this.currentTransition.target[index];
        return this.interpolateFeature(sourceFeature, targetFeature, t);
      });
    }

    const isComplete = this.currentTransition.progress >= 1;
    if (isComplete) {
      this.currentTransition = null;
    }

    return {
      features: interpolatedFeatures,
      progress: this.currentTransition ? this.currentTransition.progress : 1,
      burstPhase: isInBurst,
      isComplete
    };
  }

  applyBurst(feature, progress) {
    const burstScale = Math.sin(progress * Math.PI); // Peak at middle of burst
    
    return {
      ...feature,
      pos: [
        feature.pos[0] + feature.burstVel[0] * burstScale,
        feature.pos[1] + feature.burstVel[1] * burstScale,
        feature.pos[2] + feature.burstVel[2] * burstScale
      ],
      size: feature.size * (1 - progress * 0.5), // Shrink slightly during burst
      density: feature.density * (1 - progress * 0.3) // Reduce density during burst
    };
  }

  mapFeatures(sourceFeatures, targetFeatures) {
    const maxLength = Math.max(sourceFeatures.length, targetFeatures.length);
    const paddedSource = [...sourceFeatures];
    const paddedTarget = [...targetFeatures];

    while (paddedSource.length < maxLength) {
      paddedSource.push(this.createInterpolatedFeature(sourceFeatures));
    }
    while (paddedTarget.length < maxLength) {
      paddedTarget.push(this.createInterpolatedFeature(targetFeatures));
    }

    return {
      source: paddedSource,
      target: paddedTarget
    };
  }

  createInterpolatedFeature(features) {
    const randomFeature = features[Math.floor(Math.random() * features.length)];
    return {
      pos: [...randomFeature.pos],
      size: randomFeature.size,
      density: randomFeature.density
    };
  }

  interpolateFeature(source, target, t) {
    return {
      pos: [
        this.lerp(source.pos[0], target.pos[0], t),
        this.lerp(source.pos[1], target.pos[1], t),
        this.lerp(source.pos[2], target.pos[2], t)
      ],
      size: this.lerp(source.size, target.size, t),
      density: this.lerp(source.density, target.density, t)
    };
  }

  lerp(start, end, t) {
    return start * (1 - t) + end * t;
  }

  easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  addTransitionVariation(feature, progress) {
    const variation = Math.sin(progress * Math.PI * 2) * 0.2;
    return {
      ...feature,
      size: feature.size * (1 + variation),
      density: feature.density * (1 + variation * 0.5)
    };
  }

  reset() {
    this.currentTransition = null;
  }
}

export const transitionManager = new ShapeTransitionManager();