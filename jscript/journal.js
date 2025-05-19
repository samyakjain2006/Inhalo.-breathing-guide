// Mock data for journal
const journalData = [
  {
    date: '2023-10-20',
    exercise: '4-7-8 Breathing',
    duration: '2 min',
    moodBefore: 'Stressed',
    moodAfter: 'Calm'
  },
  {
    date: '2023-10-19',
    exercise: 'Box Breathing',
    duration: '5 min',
    moodBefore: 'Anxious',
    moodAfter: 'Focused'
  },
  {
    date: '2023-10-18',
    exercise: 'HRV Breathing',
    duration: '3 min',
    moodBefore: 'Tired',
    moodAfter: 'Energized'
  }
];

// Calculate stats
function calculateStats() {
  const totalSessions = journalData.length;
  const totalMinutes = journalData.reduce((sum, session) => {
    return sum + parseInt(session.duration);
  }, 0);
  
  // Count exercise frequency
  const exerciseCount = {};
  journalData.forEach(session => {
    exerciseCount[session.exercise] = (exerciseCount[session.exercise] || 0) + 1;
  });
  
  // Find most used exercise
  const favExercise = Object.entries(exerciseCount).reduce((a, b) => {
    return a[1] > b[1] ? a : b;
  }, ['', 0])[0];
  
  return {
    totalSessions,
    totalMinutes,
    favExercise
  };
}

// Render journal
function renderJournal() {
  const stats = calculateStats();
  
  // Update stats
  document.getElementById('total-sessions').textContent = stats.totalSessions;
  document.getElementById('total-minutes').textContent = stats.totalMinutes;
  document.getElementById('fav-exercise').textContent = stats.favExercise.split(' ')[0];
  
  // Render session list
  const sessionList = document.getElementById('session-list');
  sessionList.innerHTML = '';
  
  journalData.forEach(session => {
    const sessionEl = document.createElement('div');
    sessionEl.className = 'session-item';
    sessionEl.innerHTML = `
      <div class="session-header">
        <span class="session-date">${session.date}</span>
        <span class="session-exercise">${session.exercise}</span>
      </div>
      <div class="session-details">
        <span>${session.duration}</span>
        <span>${session.moodBefore} → ${session.moodAfter}</span>
      </div>
    `;
    sessionList.appendChild(sessionEl);
  });
}

// Initialize journal
if (document.getElementById('session-list')) {
  renderJournal();
}