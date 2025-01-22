export class InternetRadioManager {
  constructor() {
    this.audioContext = null;
    this.audioSource = null;
    this.analyser = null;
    this.audioInitialized = false;
    
    // Radio stations list - extensive collection of diverse stations
    this.stations = [
      // Public Radio / NPR Stations
      {
        name: 'KEXP Seattle (Alternative/Eclectic)',
        streamUrl: 'https://kexp.streamguys1.com/kexp160.aac',
        fallbackUrl: 'https://kexp.streamguys1.com/kexp320.aac',
        genre: 'Alternative/Eclectic',
        location: 'Seattle, USA',
        corsMode: 'cors'
      },
      {
        name: 'Radio Paradise (Eclectic Mix)',
        streamUrl: 'https://stream.radioparadise.com/aac-128',
        fallbackUrl: 'https://stream.radioparadise.com/mp3-128',
        genre: 'Eclectic',
        location: 'California, USA',
        corsMode: 'cors'
      },
      {
        name: 'WFMU (Freeform)',
        streamUrl: 'https://stream0.wfmu.org/freeform-128k',
        fallbackUrl: 'https://stream0.wfmu.org/freeform-64k',
        genre: 'Freeform/Eclectic',
        location: 'New Jersey, USA',
        corsMode: 'cors'
      },
      {
        name: 'WWOZ New Orleans (Jazz/Blues)',
        streamUrl: 'https://wwoz-sc.streamguys1.com/wwoz-hi.mp3',
        fallbackUrl: 'https://wwoz-sc.streamguys1.com/wwoz-lo.mp3',
        genre: 'Jazz/Blues',
        location: 'New Orleans, USA',
        corsMode: 'cors'
      },

      // SomaFM Channels (Known for reliable CORS support)
      {
        name: 'SomaFM - Groove Salad (Ambient)',
        streamUrl: 'https://ice4.somafm.com/groovesalad-128-mp3',
        fallbackUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
        genre: 'Ambient/Electronic',
        location: 'San Francisco, USA',
        corsMode: 'cors'
      },
      {
        name: 'SomaFM - Drone Zone',
        streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3',
        fallbackUrl: 'https://ice2.somafm.com/dronezone-128-mp3',
        genre: 'Ambient/Atmospheric',
        location: 'San Francisco, USA',
        corsMode: 'cors'
      },
      {
        name: 'SomaFM - DEF CON Radio',
        streamUrl: 'https://ice1.somafm.com/defcon-128-mp3',
        fallbackUrl: 'https://ice2.somafm.com/defcon-128-mp3',
        genre: 'Hacker/Electronic',
        location: 'San Francisco, USA',
        corsMode: 'cors'
      },
      {
        name: 'SomaFM - Space Station',
        streamUrl: 'https://ice1.somafm.com/spacestation-128-mp3',
        fallbackUrl: 'https://ice2.somafm.com/spacestation-128-mp3',
        genre: 'Space/Ambient',
        location: 'San Francisco, USA',
        corsMode: 'cors'
      },

      // College Radio
      {
        name: 'KALX Berkeley',
        streamUrl: 'https://stream.kalx.berkeley.edu:8443/kalx-128.mp3',
        fallbackUrl: 'https://stream.kalx.berkeley.edu:8443/kalx-256.mp3',
        genre: 'College Radio/Eclectic',
        location: 'Berkeley, USA',
        corsMode: 'cors'
      },

      // UK/International Stations
      {
        name: 'BBC Radio 6 Music',
        streamUrl: 'https://stream.live.vc.bbcmedia.co.uk/bbc_6music',
        genre: 'Alternative/Eclectic',
        location: 'London, UK',
        corsMode: 'cors'
      },
      {
        name: 'FIP Radio (Radio France)',
        streamUrl: 'https://icecast.radiofrance.fr/fip-hifi.aac',
        fallbackUrl: 'https://icecast.radiofrance.fr/fip-midfi.mp3',
        genre: 'Eclectic/World',
        location: 'Paris, France',
        corsMode: 'cors'
      },
      {
        name: 'Triple J (Australia)',
        streamUrl: 'https://live-radio01.mediahubaustralia.com/2TJW/aac/',
        genre: 'Alternative/Youth',
        location: 'Sydney, Australia',
        corsMode: 'cors'
      },

      // Classical/Jazz
      {
        name: 'WQXR Classical',
        streamUrl: 'https://stream.wqxr.org/wqxr-web',
        fallbackUrl: 'https://stream.wqxr.org/wqxr-low',
        genre: 'Classical',
        location: 'New York, USA',
        corsMode: 'cors'
      },
      {
        name: 'Jazz24',
        streamUrl: 'https://live.amperwave.net/direct/ppm-jazz24aac-ibc1',
        fallbackUrl: 'https://live.amperwave.net/direct/ppm-jazz24mp3-ibc1',
        genre: 'Jazz',
        location: 'Seattle, USA',
        corsMode: 'cors'
      },

      // Community/Independent
      {
        name: 'dublab',
        streamUrl: 'https://dublab.out.airtime.pro/dublab_a',
        genre: 'Electronic/Experimental',
        location: 'Los Angeles, USA',
        corsMode: 'cors'
      },
      {
        name: 'NTS Radio 1',
        streamUrl: 'https://stream-relay-geo.ntslive.net/stream',
        genre: 'Eclectic/Underground',
        location: 'London, UK',
        corsMode: 'cors'
      },
      {
        name: 'The Current (Minnesota Public Radio)',
        streamUrl: 'https://current.stream.publicradio.org/current.mp3',
        fallbackUrl: 'https://current.stream.publicradio.org/current.aac',
        genre: 'Alternative/Indie',
        location: 'Minnesota, USA',
        corsMode: 'cors'
      }
    ];
  }

  async init() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.85;
      this.audioInitialized = true;
      return true;
    } catch (error) {
      console.error('Audio initialization failed:', error);
      return false;
    }
  }

  setupAudioElement(audioElement) {
    if (!audioElement || !this.audioContext) return;

    try {
      // Create media element source if not already created
      if (!this.audioSource) {
        this.audioSource = this.audioContext.createMediaElementSource(audioElement);
        this.audioSource.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
      }

      audioElement.crossOrigin = 'anonymous';
    } catch (error) {
      console.error('Error setting up audio element:', error);
    }
  }

  async tryStream(station, audioElement, useFallback = false) {
    try {
      const url = useFallback ? station.fallbackUrl : station.streamUrl;
      if (!url) throw new Error('No stream URL available');

      // Instead of checking with fetch first (which can trigger CORS), 
      // try playing directly
      audioElement.src = url;
      
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Stream loading timeout'));
        }, 10000);

        const handleSuccess = () => {
          clearTimeout(timeoutId);
          audioElement.play()
            .then(() => resolve(true))
            .catch(handleError);
        };

        const handleError = (error) => {
          clearTimeout(timeoutId);
          reject(error);
        };

        audioElement.addEventListener('canplay', handleSuccess, { once: true });
        audioElement.addEventListener('error', handleError, { once: true });
      });

    } catch (error) {
      console.error('Stream Error:', error);
      if (!useFallback && station.fallbackUrl) {
        return this.tryStream(station, audioElement, true);
      }
      throw error;
    }
  }

  getAnalyser() {
    return this.analyser;
  }

  getAudioContext() {
    return this.audioContext;
  }

  getStations() {
    return this.stations;
  }

  dispose() {
    if (this.audioSource) {
      this.audioSource.disconnect();
    }
    if (this.analyser) {
      this.analyser.disconnect();
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Create and export singleton instance
export const radioManager = new InternetRadioManager();