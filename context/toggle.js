// Dark/Light Theme Toggle
const toggleButton = document.getElementById('toggle-theme-btn');
const themeIcon = document.getElementById('theme-icon');

// Load saved theme preference
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
  themeIcon.classList.replace('fa-moon', 'fa-sun');
}

// Toggle on button click
toggleButton.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  
  themeIcon.classList.toggle('fa-moon', !isDark);
  themeIcon.classList.toggle('fa-sun', isDark);

  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});
