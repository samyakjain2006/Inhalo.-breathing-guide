// Sound effects for breathing exercises
class SoundManager {
  constructor() {
    this.soundsEnabled = false;
    this.currentSound = 'none';
    this.audioContext = null;
    this.sounds = {
      bell: null,
      chime: null,
      beep: null,
      glide: null
    };

    this.initAudio();
  }

  initAudio() {
    try {
      // Initialize Web Audio API only when user interacts with the page
      const initAudioContext = () => {
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          this.loadSounds();
        }
        // Remove event listeners once audio is initialized
        document.removeEventListener('click', initAudioContext);
        document.removeEventListener('keydown', initAudioContext);
      };

      document.addEventListener('click', initAudioContext);
      document.addEventListener('keydown', initAudioContext);

    } catch (e) {
      console.warn('Web Audio API not supported in this browser');
    }
  }

  async loadSounds() {
    try {
      const loadSound = async (url) => {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return await this.audioContext.decodeAudioData(arrayBuffer);
      };

      this.sounds.bell = await loadSound('assets/sounds/bell.mp3');
      this.sounds.chime = await loadSound('assets/sounds/chime.mp3');
      this.sounds.beep = await loadSound('assets/sounds/beep.mp3');
      this.sounds.glide = await loadSound('assets/sounds/glide.mp3');
      
      console.log('Sounds loaded successfully');
    } catch (error) {
      console.error('Error loading sounds:', error);
    }
  }

  playSound(type) {
    if (!this.soundsEnabled || this.currentSound === 'none' || !this.audioContext) {
      return;
    }

    try {
      const sound = this.sounds[this.currentSound];
      if (!sound) return;

      const source = this.audioContext.createBufferSource();
      source.buffer = sound;
      source.connect(this.audioContext.destination);
      
      // Different sounds for different breath phases
      if (this.currentSound === 'glide') {
        // For glide sound, we adjust playback rate based on phase
        if (type === 'inhale') {
          source.playbackRate.value = 1.2;
        } else if (type === 'exhale') {
          source.playbackRate.value = 0.8;
        }
      }
      
      source.start(0);
    } catch (e) {
      console.error('Error playing sound', e);
    }
  }

  setSound(soundName) {
    this.currentSound = soundName;
    this.soundsEnabled = soundName !== 'none';
    
    // Save user preference
    localStorage.setItem('sound', soundName);
  }

  loadSoundPreference() {
    const savedSound = localStorage.getItem('sound') || 'none';
    this.setSound(savedSound);
    
    // Update the UI select element if it exists
    const soundSelect = document.getElementById('sound-style');
    if (soundSelect) {
      soundSelect.value = savedSound;
    }
  }
}

// Create a global sound manager instance
const soundManager = new SoundManager();

// Initialize from previously saved preferences
document.addEventListener('DOMContentLoaded', () => {
  soundManager.loadSoundPreference();
});

// Set up sound selector event listeners
document.addEventListener('DOMContentLoaded', () => {
  const soundSelect = document.getElementById('sound-style');
  if (soundSelect) {
    soundSelect.addEventListener('change', (e) => {
      soundManager.setSound(e.target.value);
    });
  }
}); 