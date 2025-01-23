document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI elements with null checks
  const drivesList = document.getElementById('drivesList') || createDrivesList();
  const connectButtons = document.querySelectorAll('.connect-btn') || [];
  const downloadBtn = document.querySelector('.download-btn');
  
  // Simulated connected drives data
  let connectedDrives = [];

  // Create drivesList if missing
  function createDrivesList() {
    const list = document.createElement('div');
    list.id = 'drivesList';
    document.querySelector('.drives-list')?.appendChild(list);
    return list;
  }

  // Safe element creation helper
  function safeCreateElement(tag, className, parent) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (parent) parent.appendChild(element);
    return element;
  }

  // Browser compatibility check with error handling
  function checkBrowserSupport() {
    const browserSupportEl = document.querySelector('.browser-support');
    if (!browserSupportEl) return true;

    const ua = navigator.userAgent;
    const browserInfo = safeCreateElement('div', 'browser-info', browserSupportEl);
    
    let isSupported = true;
    let browserName = '';
    
    if (ua.includes('Chrome')) {
      browserName = 'Chrome';
    } else if (ua.includes('Firefox')) {
      browserName = 'Firefox';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      browserName = 'Safari';
    } else if (ua.includes('Edge')) {
      browserName = 'Edge';
    } else if (ua.includes('Opera')) {
      browserName = 'Opera';
    } else {
      isSupported = false;
    }
    
    browserInfo.innerHTML = `
      <div class="browser-status ${isSupported ? 'supported' : 'unsupported'}">
        <span>${browserName || 'Unknown Browser'}</span>
        <span>${isSupported ? '✓ Fully Compatible' : '⚠ Limited Compatibility'}</span>
      </div>
    `;
    
    return isSupported;
  }

  // Initialize browser features with error handling
  function initializeBrowserFeatures() {
    const browserSupportEl = document.querySelector('.browser-support');
    if (!browserSupportEl) return true;

    const features = {
      webStorage: !!window.localStorage,
      webWorkers: !!window.Worker,
      webGL: (function() {
        try {
          return !!window.WebGLRenderingContext && 
                 !!document.createElement('canvas').getContext('experimental-webgl');
        } catch(e) {
          return false;
        }
      })(),
      indexedDB: !!window.indexedDB
    };
    
    Object.entries(features).forEach(([feature, supported]) => {
      const featureEl = safeCreateElement('div', 
        `feature-status ${supported ? 'active' : 'inactive'}`, 
        browserSupportEl
      );
      featureEl.textContent = `${feature}: ${supported ? 'Active' : 'Inactive'}`;
    });
    
    return Object.values(features).every(v => v);
  }

  // Update configuration constants
  const CONFIG = {
    appName: 'Nexi Labs AI',
    version: '2.25.0',
    downloadUrl: 'https://nexi-labs.ai/downloads/manager.exe',
    fileName: 'NexiLabsManager-2.25.0.exe'
  };

  // Add quantum connection effect
  function quantumConnectEffect(button) {
    button.innerHTML = '<span class="quantum-spinner"></span>';
    button.classList.add('connecting');
    
    setTimeout(() => {
      const particles = [];
      for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.className = 'quantum-particle';
        button.appendChild(particle);
        particles.push(particle);
      }
      
      particles.forEach(particle => {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 5 + Math.random() * 5;
        const dx = Math.cos(angle) * velocity;
        const dy = Math.sin(angle) * velocity;
        
        particle.style.transform = `translate(${dx * 10}px, ${dy * 10}px)`;
        particle.style.opacity = '0';
      });
    }, 1000);
  }

  // Modified connect function with error handling
  function connectDrive(service) {
    const serviceCard = document.querySelector(`[data-service="${service}"]`);
    if (!serviceCard) return;

    const btn = serviceCard.querySelector('.connect-btn');
    if (!btn) return;
    
    if (typeof Storage !== "undefined") {
      navigator.storage?.persist().then(granted => {
        if (granted) {
          quantumConnectEffect(btn);
          initializeWebStorage(service);
        } else {
          alert('Storage permission is required for quantum bridge operation');
        }
      }).catch(() => {
        alert('Storage permission request failed');
      });
    } else {
      alert('Your browser does not support required storage features');
    }
  }

  // Initialize web storage for drive
  function initializeWebStorage(service) {
    const driveKey = `quantum-drive-${service}-${Date.now()}`;
    const driveData = {
      id: Date.now(),
      service: service,
      name: `${service.charAt(0).toUpperCase() + service.slice(1)} Drive`,
      connected: true,
      created: new Date().toISOString()
    };
    
    try {
      localStorage.setItem(driveKey, JSON.stringify(driveData));
      connectedDrives.push(driveData);
      updateDrivesList();
    } catch (e) {
      console.error('Storage error:', e);
      alert('Failed to initialize quantum bridge storage');
    }
  }

  function updateDrivesList() {
    drivesList.innerHTML = '';
    
    if (connectedDrives.length === 0) {
      drivesList.innerHTML = '<p>No drives connected</p>';
      return;
    }

    connectedDrives.forEach(drive => {
      const driveItem = document.createElement('div');
      driveItem.className = 'drive-item';
      driveItem.innerHTML = `
        <svg class="drive-icon ${drive.service}-icon" viewBox="0 0 24 24">
          ${getServiceIcon(drive.service)}
        </svg>
        <div class="drive-info">
          <div class="drive-name">${drive.name}</div>
          <div class="drive-status">Connected as ${String.fromCharCode(67 + connectedDrives.indexOf(drive))}</div>
        </div>
        <div class="drive-actions">
          <button class="drive-action-btn">Open</button>
          <button class="drive-action-btn disconnect-btn" data-id="${drive.id}">Disconnect</button>
        </div>
      `;
      drivesList.appendChild(driveItem);
    });

    // Add disconnect handlers
    document.querySelectorAll('.disconnect-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const driveId = e.target.dataset.id;
        disconnectDrive(driveId);
      });
    });
  }

  function disconnectDrive(driveId) {
    connectedDrives = connectedDrives.filter(drive => drive.id != driveId);
    updateDrivesList();
  }

  function getServiceIcon(service) {
    // Return SVG paths for each service
    switch(service) {
      case 'gdrive':
        return `<path d="M12 10L6 18h12l-6-8zM6 6l6 8 6-8H6z" fill="currentColor"/>`;
      case 'dropbox':
        return `<path d="M12 1L3 7l9 6 9-6-9-6zM3 13l9 6 9-6-9-6-9 6z" fill="currentColor"/>`;
      case 'onedrive':
        return `<path d="M20.5 9.5c-.8-3.3-3.8-5.8-7.5-5.8-3.1 0-5.7 1.8-7 4.4C3.1 8.4 1 10.7 1 13.5 1 16.5 3.5 19 6.5 19h13c2.5 0 4.5-2 4.5-4.5 0-2.3-1.7-4.2-3.9-4.5z" fill="currentColor"/>`;
      default:
        return '';
    }
  }

  function handleDownload() {
    if (downloadBtn.classList.contains('downloading')) return;
    
    downloadBtn.classList.add('downloading');
    const originalText = downloadBtn.innerHTML;
    downloadBtn.innerHTML = `
      <span class="quantum-spinner"></span>
      <span>Initializing Nexi Download...</span>
    `;
    
    // Simulate download progress
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = CONFIG.downloadUrl;
      link.download = CONFIG.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      downloadBtn.innerHTML = `
        <svg class="download-icon" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
        </svg>
        Download Complete
      `;
      
      setTimeout(() => {
        downloadBtn.classList.remove('downloading');
        downloadBtn.innerHTML = originalText;
      }, 3000);
    }, 2000);
  }

  // Load existing drives from web storage
  function loadExistingDrives() {
    const drives = Object.keys(localStorage)
      .filter(key => key.startsWith('quantum-drive-'))
      .map(key => JSON.parse(localStorage.getItem(key)));
    
    connectedDrives = drives;
    updateDrivesList();
  }

  // Initialize the application with error handling
  function init() {
    try {
      const browserSupported = checkBrowserSupport();
      const featuresAvailable = initializeBrowserFeatures();
      
      if (!browserSupported || !featuresAvailable) {
        document.querySelector('.app')?.classList.add('limited-mode');
      }
      
      loadExistingDrives();
      
      // Add event listeners with null checks
      connectButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const service = e.target.closest('.service-card')?.dataset.service;
          if (service) connectDrive(service);
        });
      });

      downloadBtn?.addEventListener('click', handleDownload);
    } catch (error) {
      console.error('Initialization error:', error);
      document.querySelector('.app')?.classList.add('error-mode');
    }
  }

  init();
});