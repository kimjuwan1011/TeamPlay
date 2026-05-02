// ===== Dark Mode =====
function initTheme() {
  const savedTheme = localStorage.getItem('teamplay_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('teamplay_theme', next);
      updateThemeIcon(next);
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon');
  if (!icon) return;
  if (theme === 'dark') {
    // Moon
    icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
  } else {
    // Sun
    icon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
  }
}

// ===== Scroll Reveal =====
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // One-time animation
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  window._revealObserver = observer;
}

// Export a function to manually trigger reveal for dynamically added elements
window.observeReveal = (el) => {
  if (window._revealObserver) {
    window._revealObserver.observe(el);
  } else {
    setTimeout(() => el.classList.add('active'), 50);
  }
};

// ===== Bookmark =====
window.toggleBookmark = function(id, event) {
  event.stopPropagation();
  let marks = JSON.parse(localStorage.getItem('teamplay_bookmarks') || '[]');
  if (marks.includes(id)) {
    marks = marks.filter(m => m !== id);
  } else {
    marks.push(id);
  }
  localStorage.setItem('teamplay_bookmarks', JSON.stringify(marks));
  
  // Update all buttons for this id
  document.querySelectorAll(`.bookmark-btn[data-id="${id}"]`).forEach(btn => {
    btn.classList.toggle('active', marks.includes(id));
  });
};

window.isBookmarked = function(id) {
  const marks = JSON.parse(localStorage.getItem('teamplay_bookmarks') || '[]');
  return marks.includes(id);
};

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initReveal();
});
