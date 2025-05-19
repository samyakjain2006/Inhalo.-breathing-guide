// Simple music player for Inhalo app
class MusicPlayer {
  constructor() {
    // Track and position management
    this.currentTrack = parseInt(localStorage.getItem('lastTrack') || '0');
    this.tracks = [
      'assets/music/ambient1.mp4.mp4',
      'assets/music/meditation1.mp3.mp3',
      'assets/music/nature1.mp3.mp3'
    ];
    
    // Audio setup
    this.audio = new Audio(this.tracks[this.currentTrack]);
    this.audio.loop = true;
    this.audio.volume = 0.4;
    
    // Basic state
    this.musicEnabled = localStorage.getItem('musicEnabled') === 'true';
    
    // Initialize
    this.initialize();
  }

  initialize() {
    // Set up track ended event
    this.audio.addEventListener('ended', () => {
      this.playNextTrack();
    });
    
    // Save position before page unload
    window.addEventListener('beforeunload', () => {
      if (!this.audio.paused) {
        localStorage.setItem('musicPosition', this.audio.currentTime);
      }
    });
    
    // Set up toggle button
    this.setupToggle();
    
    // Check if we need to start playing
    if (this.musicEnabled && !this.isTimerPage()) {
      this.restorePlayback();
    }
  }
  
  isTimerPage() {
    return window.location.pathname.includes('timer.html');
  }

  setupToggle() {
    const toggle = document.getElementById('music-toggle');
    if (!toggle) return;
    
    // Set initial visual state
    this.updateToggleVisual();
    
    // Add click handler
    toggle.addEventListener('click', () => {
      this.toggleMusic();
    });
  }
  
  updateToggleVisual() {
    const toggle = document.getElementById('music-toggle');
    if (!toggle) return;
    
    if (this.musicEnabled) {
      toggle.classList.remove('off');
      toggle.setAttribute('title', 'Music: On');
    } else {
      toggle.classList.add('off');
      toggle.setAttribute('title', 'Music: Off');
    }
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    localStorage.setItem('musicEnabled', this.musicEnabled);
    
    if (this.musicEnabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    
    this.updateToggleVisual();
  }

  startMusic() {
    const playPromise = this.audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log('Auto-play prevented. User interaction needed.');
        
        // Create one-time click handler
        const startOnInteraction = () => {
          this.audio.play().catch(() => {});
          document.removeEventListener('click', startOnInteraction);
        };
        
        document.addEventListener('click', startOnInteraction);
      });
    }
  }

  stopMusic() {
    this.audio.pause();
  }

  restorePlayback() {
    // Get last position
    const lastPosition = parseFloat(localStorage.getItem('musicPosition'));
    
    // Set position if valid
    if (!isNaN(lastPosition) && lastPosition > 0) {
      try {
        this.audio.currentTime = lastPosition;
      } catch (e) {
        console.warn("Couldn't set audio position", e);
      }
    }
    
    // Start playing
    this.startMusic();
  }

  playNextTrack() {
    // Save current state
    this.audio.pause();
    
    // Move to next track
    this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
    localStorage.setItem('lastTrack', this.currentTrack);
    
    // Set new source and play
    this.audio.src = this.tracks[this.currentTrack];
    
    if (this.musicEnabled) {
      this.startMusic();
    }
  }
}

// Initialize music player on all pages except timer
document.addEventListener('DOMContentLoaded', () => {
  if (!window.location.pathname.includes('timer.html')) {
    window.musicPlayer = new MusicPlayer();
  }
}); 