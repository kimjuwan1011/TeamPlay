document.addEventListener('DOMContentLoaded', () => {
  renderBookmarks();
  
  // Mobile menu toggle
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
    });
  }
});

function renderBookmarks() {
  const grid = document.getElementById('bookmarkGrid');
  const emptyState = document.getElementById('emptyState');
  
  const marks = JSON.parse(localStorage.getItem('teamplay_bookmarks') || '[]');
  
  if (marks.length === 0) {
    grid.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }
  
  grid.classList.remove('hidden');
  emptyState.classList.add('hidden');
  grid.innerHTML = '';
  
  // get data
  const items = typeof restaurants !== 'undefined' ? restaurants.filter(r => marks.includes(r.id) || marks.includes(String(r.id))) : [];
  
  items.forEach(r => {
    const card = document.createElement('article');
    card.className = 'card reveal';
    card.role = 'listitem';
    
    // Using simple format like list.js
    const ratingHTML = r.rating != null
      ? `<span class="card-rating"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> ${Number(r.rating).toFixed(1)}</span>`
      : '';
      
    card.innerHTML = `
      <div class="card-img">
        <img src="${r.image}" alt="${r.name}" loading="lazy" onerror="this.src='https://picsum.photos/seed/default/600/400'">
        <button class="bookmark-btn active" data-id="${r.id}" onclick="handleBookmarkClick(${r.id}, event)" aria-label="찜하기 해제">
          <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </button>
      </div>
      <div class="card-body">
        <div class="card-tags">
          <span class="tag region">${r.region}</span>
          <span class="tag category">${r.category}</span>
          ${ratingHTML}
        </div>
        <h3 class="card-title">${r.name}</h3>
        <p class="card-desc">${r.description || r.address}</p>
      </div>
    `;
    
    card.addEventListener('click', () => { location.href = `detail.html?id=${r.id}`; });
    grid.appendChild(card);
    
    if (window.observeReveal) window.observeReveal(card);
  });
}

function handleBookmarkClick(id, event) {
  // Use common.js toggle
  window.toggleBookmark(id, event);
  // Re-render
  renderBookmarks();
}
