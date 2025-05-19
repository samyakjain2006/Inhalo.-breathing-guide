// Parse URL parameters
const urlParams = new URLSearchParams(window.location.search);
const exercise = urlParams.get('exercise') || '4-7-8';

// Exercise configurations
const exercises = {
  '4-7-8': {
    name: '4-7-8 Breathing',
    description: 'A calming technique to reduce anxiety and promote sleep. Inhale for 4 seconds, hold for 7, exhale for 8.',
    phases: [
      { name: 'Inhale', duration: 4, animation: 'inhale' },
      { name: 'Hold', duration: 7, animation: 'hold' },
      { name: 'Exhale', duration: 8, animation: 'exhale' }
    ]
  },
  'box': {
    name: 'Box Breathing',
    description: 'Equal breathing technique to enhance focus and concentration. Inhale, hold, exhale, and hold all for 4 seconds each.',
    phases: [
      { name: 'Inhale', duration: 4, animation: 'inhale' },
      { name: 'Hold', duration: 4, animation: 'hold' },
      { name: 'Exhale', duration: 4, animation: 'exhale' },
      { name: 'Hold', duration: 4, animation: 'hold-small' }
    ]
  },
  'hrv': {
    name: 'HRV Breathing',
    description: 'Heart Rate Variability breathing to balance the nervous system. 5 seconds inhale, 5 seconds exhale.',
    phases: [
      { name: 'Inhale', duration: 5, animation: 'inhale' },
      { name: 'Exhale', duration: 5, animation: 'exhale' }
    ]
  },
  'nadi-sodhana': {
    name: 'Nadi Sodhana',
    description: 'Alternate Nostril Breathing to balance mind, body and soul.',
    phases: [
      { name: 'Exhale', duration: 4, animation: 'exhale' },
      { name: 'Close right nostril', duration: 2, animation: 'hold-small', instruction: true },
      { name: 'Inhale left', duration: 4, animation: 'inhale' },
      { name: 'Close both nostrils', duration: 2, animation: 'hold', instruction: true },
      { name: 'Exhale right', duration: 4, animation: 'exhale' },
      { name: 'Inhale right', duration: 4, animation: 'inhale' },
      { name: 'Close both nostrils', duration: 2, animation: 'hold', instruction: true },
      { name: 'Exhale left', duration: 4, animation: 'exhale' }
    ]
  },
  '4-2-4': {
    name: '4-2-4 Breathing',
    description: 'A gentle rhythm to focus the mind. Inhale for 4 seconds, hold for 2, exhale for 4.',
    phases: [
      { name: 'Inhale', duration: 4 },
      { name: 'Hold', duration: 2 },
      { name: 'Exhale', duration: 4 }
    ]
  },
  '4-8': {
    name: '4-8 Breathing',
    description: 'Extended exhale technique activates the parasympathetic nervous system. Inhale for 4 seconds, exhale for 8.',
    phases: [
      { name: 'Inhale', duration: 4 },
      { name: 'Exhale', duration: 8 }
    ]
  }
};

// Initialize exercise
const currentExercise = exercises[exercise] || exercises['4-7-8'];
document.getElementById('current-exercise').textContent = currentExercise.name;

// Timer variables
let currentPhase = 0;
let timeLeft = 0;
let timerInterval;
let isRunning = false;
let animationTimeout;
let instructionShown = false;
let cycleCount = 0;
let totalCycles = 3; // Default number of cycles
let cyclePopupShown = false;

// Make isRunning variable globally available for the beforeunload event
window.isRunning = isRunning;

// DOM elements
const phaseIndicator = document.getElementById('phase-indicator');
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const orb = document.getElementById('breathing-orb');
const orbContainer = document.querySelector('.orb-container');
const phaseText = document.getElementById('phase-text');
const nostrilInstruction = document.getElementById('nostril-instruction');
const instructionPopup = document.getElementById('instruction-popup');
const startExerciseBtn = document.getElementById('start-exercise-btn');
const cycleCounter = document.getElementById('cycle-counter');
const currentCycleDisplay = document.getElementById('current-cycle');
const totalCyclesDisplay = document.getElementById('total-cycles');
const cyclePopup = document.getElementById('cycle-popup');
const cycleSlider = document.getElementById('cycle-slider');
const cycleValueDisplay = document.getElementById('cycle-value-display');
const cycleStartBtn = document.getElementById('cycle-start-btn');
const completionPopup = document.getElementById('completion-popup');
const restartBtn = document.getElementById('restart-btn');
const homeBtn = document.getElementById('home-btn');

// Initially hide cycle counter
cycleCounter.style.display = 'none';

// Completion popup handlers
restartBtn.addEventListener('click', () => {
  completionPopup.classList.remove('active');
  resetExercise();
  // Show cycle selection popup again
  cyclePopupShown = false;
  cyclePopup.classList.add('active');
});

homeBtn.addEventListener('click', () => {
  window.location.href = 'index.html';
});

// Cycle slider functionality
cycleSlider.addEventListener('input', () => {
  cycleValueDisplay.textContent = cycleSlider.value;
  totalCycles = parseInt(cycleSlider.value);
});

// Cycle start button
cycleStartBtn.addEventListener('click', () => {
  cyclePopup.classList.remove('active');
  cyclePopupShown = true;
  
  // Update the total cycles display
  totalCycles = parseInt(cycleSlider.value);
  totalCyclesDisplay.textContent = totalCycles;
  
  // Show the cycle counter
  cycleCounter.style.display = 'block';
  
  // If Nadi Sodhana and instruction not shown yet
  if (exercise === 'nadi-sodhana' && !instructionShown) {
    instructionPopup.classList.add('active');
  } else {
    startExercise();
  }
});

// Settings menu toggle
const settingsToggle = document.getElementById('settings-toggle');
const settingsMenu = document.getElementById('settings-menu');

settingsToggle.addEventListener('click', () => {
  settingsMenu.classList.toggle('hidden');
  
  // Add active class to hamburger menu for animation
  settingsToggle.classList.toggle('active');
});

// Close settings menu when clicking outside
document.addEventListener('click', (e) => {
  if (!settingsMenu.contains(e.target) && !settingsToggle.contains(e.target) && !settingsMenu.classList.contains('hidden')) {
    settingsMenu.classList.add('hidden');
    settingsToggle.classList.remove('active');
  }
});

// Start/stop breathing exercise
startBtn.addEventListener('click', () => {
  if (isRunning) {
    pauseExercise();
  } else {
    // Show cycle selection popup if not shown
    if (!cyclePopupShown) {
      cyclePopup.classList.add('active');
    }
    // Otherwise, show Nadi Sodhana instruction or start
    else if (exercise === 'nadi-sodhana' && !instructionShown) {
      instructionPopup.classList.add('active');
    } else {
      startExercise();
    }
  }
});

// Handle the start exercise button in the instruction popup
startExerciseBtn.addEventListener('click', () => {
  instructionPopup.classList.remove('active');
  instructionShown = true;
  startExercise();
});

// Reset exercise
resetBtn.addEventListener('click', resetExercise);

function startExercise() {
  if (!isRunning) {
    isRunning = true;
    window.isRunning = true; // Update global variable
    startBtn.textContent = 'Pause';
    cycleCount = 1;
    currentCycleDisplay.textContent = cycleCount;
    nextPhase();
  }
}

function pauseExercise() {
  isRunning = false;
  window.isRunning = false; // Update global variable
  startBtn.textContent = 'Resume';
  clearInterval(timerInterval);
  if (animationTimeout) {
    clearTimeout(animationTimeout);
  }
  // Don't remove animation classes to preserve the current state
}

function resetExercise() {
  isRunning = false;
  window.isRunning = false; // Update global variable
  startBtn.textContent = 'Start';
  clearInterval(timerInterval);
  if (animationTimeout) {
    clearTimeout(animationTimeout);
  }
  currentPhase = 0;
  timeLeft = 0;
  cycleCount = 1;
  cyclePopupShown = false; // Reset cycle popup state
  updateDisplay();
  
  // Reset the orb to neutral state
  orb.classList.remove('breathing-in', 'breathing-hold', 'breathing-out', 'breathing-hold-small');
  phaseIndicator.textContent = 'Ready to begin';
  phaseText.textContent = '';
  nostrilInstruction.textContent = '';
  nostrilInstruction.classList.remove('active');
  
  // Hide cycle counter
  cycleCounter.style.display = 'none';
}

// Function to show completion popup
function showCompletionPopup() {
  // Small delay to ensure animations complete smoothly
  setTimeout(() => {
    completionPopup.classList.add('active');
  }, 800);
}

function nextPhase() {
  // If we reached the end of all phases, cycle is complete
  if (currentPhase >= currentExercise.phases.length) {
    currentPhase = 0;
    cycleCount++;
    
    // Update cycle counter
    currentCycleDisplay.textContent = cycleCount;
    
    // Add a visual feedback for cycle completion
    const completionFlash = document.createElement('div');
    completionFlash.className = 'cycle-completion-flash';
    orbContainer.appendChild(completionFlash);
    
    // Remove the flash effect after animation completes
    setTimeout(() => {
      completionFlash.remove();
    }, 1000);
    
    // Check if all cycles are complete
    if (cycleCount > totalCycles) {
      // Exercise complete
      isRunning = false;
      window.isRunning = false;
      startBtn.textContent = 'Start';
      clearInterval(timerInterval);
      if (animationTimeout) {
        clearTimeout(animationTimeout);
      }
      orb.classList.remove('breathing-in', 'breathing-hold', 'breathing-out', 'breathing-hold-small');
      phaseIndicator.textContent = 'Completed';
      phaseText.textContent = '';
      
      // Show completion popup
      showCompletionPopup();
      return;
    }
    
    // IMPROVEMENT: For smooth cycle transitions, treat this as a special transition
    // Get the last phase of the previous cycle and the first phase of the new cycle
    const lastPhase = currentExercise.phases[currentExercise.phases.length - 1];
    const firstPhase = currentExercise.phases[0];
    
    // For Ice animation (default orb), ensure a smooth transition between cycles
    if (orb.classList.contains('default')) {
      // Don't remove animation classes yet
      const isExhaleToInhale = lastPhase.animation === 'exhale' && firstPhase.animation === 'inhale';
      
      if (isExhaleToInhale) {
        // Set longer transition for smoother effect
        orb.style.transitionDuration = `${firstPhase.duration * 0.8}s`;
        
        // Force a reflow
        void orb.offsetWidth;
        
        // Add the new class before removing the old one
        orb.classList.add('breathing-in');
        orbContainer.classList.add('phase-inhale');
        orbContainer.classList.remove('phase-exhale', 'phase-hold', 'phase-hold-small');
        
        // Remove the old class after a delay
        setTimeout(() => {
          orb.classList.remove('breathing-out', 'breathing-hold', 'breathing-hold-small');
        }, 50);
      }
    }
  }
  
  // Continue with next phase
  timeLeft = currentExercise.phases[currentPhase].duration;
  
  // Get animation type from current phase
  const phase = currentExercise.phases[currentPhase];
  const animation = phase.animation || phase.name.toLowerCase();
  
  // Update phase text
  updatePhaseText(animation);
  
  // Update phase indicator
  phaseIndicator.textContent = phase.name;
  
  // Show instruction if needed
  if (phase.instruction) {
    let instruction;
    
    // Specific instructions for nadi sodhana
    if (currentExercise.name === "Nadi Sodhana") {
      if (phase.name === "Close right nostril") {
        instruction = "Close right nostril with your thumb";
      } else if (phase.name === "Close both nostrils") {
        instruction = "Close both nostrils with thumb and ring finger";
      }
    } else {
      instruction = phase.name;
    }
    
    showNostrilInstruction(instruction);
  }
  
  // Get the previous phase for smooth animation transitions
  const previousPhase = currentPhase === 0 
    ? currentExercise.phases[currentExercise.phases.length - 1] 
    : currentExercise.phases[currentPhase - 1];
  
  // Apply animation with perfect timing, but only if we're not already handling the cycle transition
  if (!(currentPhase === 0 && orb.classList.contains('breathing-in') && orb.classList.contains('default'))) {
    applyAnimation(phase, previousPhase);
  }
  
  updateDisplay();
  
  timerInterval = setInterval(() => {
    timeLeft--;
    updateDisplay();
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      currentPhase++;
      if (isRunning) {
        // Use setTimeout with a minimal delay for a smoother transition
        animationTimeout = setTimeout(nextPhase, 300);
      }
    }
  }, 1000);
}

function applyAnimation(phase, previousPhase) {
  // Get the animation style being used
  const isDefaultOrb = orb.classList.contains('default');
  const isGradientCircle = orb.classList.contains('gradient-circle');
  
  // Clear previous container phase classes
  orbContainer.classList.remove('phase-inhale', 'phase-hold', 'phase-exhale', 'phase-hold-small');
  
  // For default orb, we need to handle the hold→exhale transition specially
  if ((isDefaultOrb || isGradientCircle) && previousPhase.animation === 'hold' && phase.animation === 'exhale') {
    // Don't immediately remove the hold class to allow box-shadow transition to complete
    // Only remove the breathing-in class if it exists
    orb.classList.remove('breathing-in');
    
    // Set the transition duration exactly equal to the phase duration
    const seconds = phase.duration;
    orb.style.transitionDuration = `${seconds}s`;
    
    // Force a reflow to ensure the transition takes effect immediately
    void orb.offsetWidth;
    
    // First add the exhale class
    orb.classList.add('breathing-out');
    orbContainer.classList.add('phase-exhale');
    
    // Then remove the hold class after a tiny delay to ensure the transition is picked up
    setTimeout(() => {
      orb.classList.remove('breathing-hold');
    }, 50);
  } 
  // Also handle the hold-small→inhale transition specially
  else if ((isDefaultOrb || isGradientCircle) && previousPhase.animation === 'hold-small' && phase.animation === 'inhale') {
    // Don't immediately remove the hold-small class
    
    // Set the transition duration exactly equal to the phase duration
    const seconds = phase.duration;
    orb.style.transitionDuration = `${seconds}s`;
    
    // Force a reflow to ensure the transition takes effect immediately
    void orb.offsetWidth;
    
    // First add the inhale class
    orb.classList.add('breathing-in');
    orbContainer.classList.add('phase-inhale');
    
    // Then remove the hold-small class after a tiny delay
    setTimeout(() => {
      orb.classList.remove('breathing-hold-small');
    }, 50);
  }
  else {
    // For all other transitions, use the standard approach
    // Clear previous animation state
    orb.classList.remove('breathing-in', 'breathing-hold', 'breathing-out', 'breathing-hold-small');
    
    // Set the transition duration exactly equal to the phase duration
    const seconds = phase.duration;
    orb.style.transitionDuration = `${seconds}s`;
    
    // Force a reflow to ensure the transition takes effect immediately
    void orb.offsetWidth;
    
    // Apply the right animation class based on the phase
    switch (phase.animation) {
      case 'inhale':
        orb.classList.add('breathing-in');
        orbContainer.classList.add('phase-inhale');
        break;
      case 'hold':
        orb.classList.add('breathing-hold');
        orbContainer.classList.add('phase-hold');
        break;
      case 'exhale':
        orb.classList.add('breathing-out');
        orbContainer.classList.add('phase-exhale');
        break;
      case 'hold-small':
        orb.classList.add('breathing-hold-small');
        orbContainer.classList.add('phase-hold-small');
        break;
    }
  }
}

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Function to update the phase text in the center of the orb
function updatePhaseText(animation) {
  switch (animation) {
    case 'inhale':
      phaseText.textContent = 'INHALE';
      break;
    case 'hold':
    case 'hold-small':
      phaseText.textContent = 'HOLD';
      break;
    case 'exhale':
      phaseText.textContent = 'EXHALE';
      break;
    default:
      phaseText.textContent = '';
  }
}

// Function to show nostril instructions
function showNostrilInstruction(instruction) {
  nostrilInstruction.textContent = instruction;
  nostrilInstruction.classList.remove('active');
  
  // Force browser reflow
  void nostrilInstruction.offsetWidth;
  
  // Show the instruction
  nostrilInstruction.classList.add('active');
  
  // Set timeout to fade out the instruction
  setTimeout(() => {
    nostrilInstruction.classList.remove('active');
  }, 2000);
}

// Load saved preferences on page load
document.addEventListener('DOMContentLoaded', () => {
  // Load animation style
  const savedAnimation = localStorage.getItem('animation');
  if (savedAnimation && document.getElementById('animation-style')) {
    document.getElementById('animation-style').value = savedAnimation;
    
    // Manually set up gradient circle if that's the saved animation
    if (savedAnimation === 'gradient-circle' && orb) {
      orb.className = 'orb gradient-circle';
      
      // Create inner circle
      const circle = document.createElement('div');
      circle.className = 'circle';
      orb.appendChild(circle);
      
      // Create gradient background
      const gradientBg = document.createElement('div');
      gradientBg.className = 'gradient-bg';
      orb.appendChild(gradientBg);
      
      // Create pointer container
      const pointerContainer = document.createElement('div');
      pointerContainer.className = 'pointer-container';
      
      // Create pointer
      const pointer = document.createElement('span');
      pointer.className = 'pointer';
      pointerContainer.appendChild(pointer);
      
      // Add pointer container to orb
      orb.appendChild(pointerContainer);
      
      // Calculate rotation speed based on breathing cycle
      let totalDuration = 0;
      currentExercise.phases.forEach(phase => {
        totalDuration += phase.duration;
      });
      
      // Set the pointer rotation to match the full cycle
      pointerContainer.style.animationDuration = `${totalDuration}s`;
    } else if (savedAnimation === 'default' && orb) {
      orb.className = 'orb default';
    }
  }
  
  // Load theme - use timer-specific theme
  const savedTheme = localStorage.getItem('timer-theme') || localStorage.getItem('theme');
  if (savedTheme && document.getElementById('theme-style')) {
    document.getElementById('theme-style').value = savedTheme;
    document.documentElement.classList.remove('light-theme', 'dark-theme', 'theme-kyoto', 'theme-night-sky');
    document.documentElement.classList.add(savedTheme);
    
    // Create stars for night sky theme
    if (savedTheme === 'theme-night-sky') {
      createStars();
    }
  }
});

// Handle animation style change
document.getElementById('animation-style')?.addEventListener('change', (e) => {
  // First, remove any existing animation classes
  orb.className = 'orb';
  
  const animationStyle = e.target.value;
  orb.classList.add(animationStyle);
  
  // Clear any existing child elements
  while (orb.firstChild) {
    orb.removeChild(orb.firstChild);
  }
  
  // Add child elements for specific animations
  if (animationStyle === 'gradient-circle') {
    // Create inner circle
    const circle = document.createElement('div');
    circle.className = 'circle';
    orb.appendChild(circle);
    
    // Create gradient background
    const gradientBg = document.createElement('div');
    gradientBg.className = 'gradient-bg';
    orb.appendChild(gradientBg);
    
    // Create pointer container
    const pointerContainer = document.createElement('div');
    pointerContainer.className = 'pointer-container';
    
    // Create pointer
    const pointer = document.createElement('span');
    pointer.className = 'pointer';
    pointerContainer.appendChild(pointer);
    
    // Add pointer container to orb
    orb.appendChild(pointerContainer);
    
    // Calculate rotation speed based on breathing cycle
    let totalDuration = 0;
    currentExercise.phases.forEach(phase => {
      totalDuration += phase.duration;
    });
    
    // Set the pointer rotation to match the full cycle
    pointerContainer.style.animationDuration = `${totalDuration}s`;
  }
  
  else if (animationStyle === 'default' && orb) {
    orb.className = 'orb default';
  }
  
  // Save preference to localStorage
  localStorage.setItem('animation', animationStyle);
});

// Theme change handler
document.getElementById('theme-style')?.addEventListener('change', (e) => {
  const theme = e.target.value;
  
  // Remove all theme classes from HTML element
  document.documentElement.classList.remove('light-theme', 'dark-theme', 'theme-kyoto', 'theme-night-sky');
  
  // Add selected theme
  document.documentElement.classList.add(theme);
  
  // Save preference to localStorage with page-specific key
  localStorage.setItem('timer-theme', theme);
  
  // Create or remove stars for night sky theme
  if (theme === 'theme-night-sky') {
    createStars();
  } else {
    removeStars();
  }
});

// Function to create stars for night sky theme
function createStars() {
  // Remove existing stars if any
  removeStars();
  
  // Create stars container
  const starsContainer = document.createElement('div');
  starsContainer.className = 'stars';
  
  // Create 20 stars
  for (let i = 0; i < 20; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    starsContainer.appendChild(star);
  }
  
  // Add stars to body
  document.body.appendChild(starsContainer);
}

// Function to remove stars
function removeStars() {
  const existingStars = document.querySelector('.stars');
  if (existingStars) {
    existingStars.remove();
  }
}