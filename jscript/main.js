// Dark mode toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  document.body.classList.toggle('dark-theme');
  
  // Save preference to localStorage
  const isDark = document.body.classList.contains('dark-theme');
  localStorage.setItem('darkMode', isDark);
});

// Initialize theme from localStorage
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-theme');
  document.body.classList.remove('light-theme');
}

// Settings menu toggle (for timer page)
if (document.getElementById('settings-toggle')) {
  document.getElementById('settings-toggle').addEventListener('click', () => {
    document.getElementById('settings-menu').classList.toggle('hidden');
  });
}