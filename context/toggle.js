document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggle-theme-btn');
  const themeIcon = document.getElementById('theme-icon');

  // Apply saved theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeIcon.classList.replace('fa-moon', 'fa-sun');
    themeIcon.classList.add('sun-color');
  }

  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');

    themeIcon.classList.toggle('fa-sun', isDark);
    themeIcon.classList.toggle('fa-moon', !isDark);

    // Change icon color depending on mode
    if (isDark) {
      themeIcon.classList.add('sun-color');
    } else {
      themeIcon.classList.remove('sun-color');
    }

    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
});
