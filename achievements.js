class Achievements {
  constructor() {
    this.achievements = {
      firstCall: {
        id: 'firstCall',
        name: 'First Day on the Job',
        description: 'Handle your first emergency call',
        icon: '📞',
        unlocked: false,
        condition: () => true // Unlocks after first call
      },
      perfectDay: {
        id: 'perfectDay',
        name: 'Perfect Shift',
        description: 'Complete a day with 100% accuracy',
        icon: '⭐',
        unlocked: false,
        condition: (stats) => stats.dailyAccuracy === 100
      },
      speedDemon: {
        id: 'speedDemon',
        name: 'Speed Demon',
        description: 'Correctly identify a monster in under 5 seconds',
        icon: '⚡',
        unlocked: false,
        condition: (stats) => stats.lastGuessTime < 5000
      },
      veteran: {
        id: 'veteran',
        name: 'Veteran Dispatcher',
        description: 'Reach Day 7',
        icon: '🎖️',
        unlocked: false,
        condition: (stats) => stats.currentDay >= 7
      },
      masterDispatcher: {
        id: 'masterDispatcher',
        name: 'Master Dispatcher',
        description: 'Unlock all monsters',
        icon: '👑',
        unlocked: false,
        condition: (stats) => stats.unlockedMonsters >= 75
      },
      glitchHunter: {
        id: 'glitchHunter',
        name: 'Glitch Hunter',
        description: 'Experience 10 glitched calls',
        icon: '🌟',
        unlocked: false,
        condition: (stats) => stats.glitchedCalls >= 10
      },
      hardcoreAgent: {
        id: 'hardcoreAgent',
        name: 'Hardcore Agent',
        description: 'Complete a day in Hard Mode',
        icon: '💪',
        unlocked: false,
        condition: (stats) => stats.gameMode === 'hard' && stats.completedDay
      },
      quickThinking: {
        id: 'quickThinking',
        name: 'Quick Thinking',
        description: 'Successfully handle 5 timed calls in a row',
        icon: '⏱️',
        unlocked: false,
        condition: (stats) => stats.consecutiveTimedCalls >= 5
      },
      nightShift: {
        id: 'nightShift',
        name: 'Night Shift Champion',
        description: 'Complete 50 calls during the night shift',
        icon: '🌙',
        unlocked: false,
        condition: (stats) => stats.nightShiftCalls >= 50
      },
      monsterWhisperer: {
        id: 'monsterWhisperer',
        name: 'Monster Whisperer',
        description: 'Achieve a 90% accuracy rate over 100 calls',
        icon: '🗣️',
        unlocked: false,
        condition: (stats) => stats.totalCalls >= 100 && stats.overallAccuracy >= 90
      },
      codeBreaker: {
        id: 'codeBreaker',
        name: 'Code Breaker',
        description: 'Find all easter eggs',
        icon: '🔍',
        unlocked: false,
        condition: (stats) => stats.easterEggsFound >= 3
      },
      persistentAgent: {
        id: 'persistentAgent',
        name: 'Persistent Agent',
        description: 'Play for 7 consecutive days',
        icon: '📅',
        unlocked: false,
        condition: (stats) => stats.consecutiveDays >= 7
      }
    };

    this.loadAchievements();
    this.initializeListeners();
  }

  loadAchievements() {
    const savedAchievements = localStorage.getItem('teamtex-achievements');
    if (savedAchievements) {
      const saved = JSON.parse(savedAchievements);
      Object.keys(saved).forEach(id => {
        if (this.achievements[id]) {
          this.achievements[id].unlocked = saved[id].unlocked;
        }
      });
    }
    this.updateAchievementDisplay();
  }

  saveAchievements() {
    localStorage.setItem('teamtex-achievements', JSON.stringify(this.achievements));
    this.updateAchievementDisplay();
  }

  unlockAchievement(id) {
    if (this.achievements[id] && !this.achievements[id].unlocked) {
      this.achievements[id].unlocked = true;
      this.saveAchievements();
      this.showAchievementNotification(this.achievements[id]);
    }
  }

  showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <span class="achievement-icon">${achievement.icon}</span>
      <div class="achievement-text">
        <h4>Achievement Unlocked!</h4>
        <p>${achievement.name}</p>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  updateAchievementDisplay() {
    const achievementsList = document.getElementById('achievementsList');
    achievementsList.innerHTML = '';

    Object.values(this.achievements).forEach(achievement => {
      const achievementElement = document.createElement('div');
      achievementElement.className = `achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`;
      achievementElement.innerHTML = `
        <span class="achievement-icon">${achievement.icon}</span>
        <div class="achievement-info">
          <h3>${achievement.name}</h3>
          <p>${achievement.description}</p>
        </div>
        <span class="achievement-status">${achievement.unlocked ? '✓' : '?'}</span>
      `;
      achievementsList.appendChild(achievementElement);
    });
  }

  initializeListeners() {
    const achievementsModal = document.getElementById('achievementsModal');
    const openAchievements = document.getElementById('openAchievementsMenu');
    const closeAchievements = document.getElementById('closeAchievements');

    openAchievements.addEventListener('click', () => {
      achievementsModal.style.display = 'flex';
      this.updateAchievementDisplay();
    });

    closeAchievements.addEventListener('click', () => {
      achievementsModal.style.display = 'none';
    });
  }

  checkAchievements(stats) {
    Object.values(this.achievements).forEach(achievement => {
      if (!achievement.unlocked && achievement.condition(stats)) {
        this.unlockAchievement(achievement.id);
      }
    });
  }
}

const gameAchievements = new Achievements();