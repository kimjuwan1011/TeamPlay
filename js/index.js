/* ===== Slider ===== */
const sliderData = [
  {
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&h=600&fit=crop',
    title: '전국 맛집을 한눈에',
    subtitle: '지역별, 종류별로 원하는 맛집을 찾아보세요',
  },
  {
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&h=600&fit=crop',
    title: '오늘 뭐 먹지?',
    subtitle: '한식, 중식, 일식, 양식 다양한 카테고리로 탐색',
  },
  {
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&h=600&fit=crop',
    title: '여행 중 맛집 고민?',
    subtitle: '서울 · 부산 · 제주 지역 맛집 추천',
  },
  {
    image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1400&h=600&fit=crop',
    title: '특별한 한 끼',
    subtitle: '분위기 좋은 맛집부터 가성비 맛집까지',
  },
];

function initSlider() {
  const wrapper = document.getElementById('slidesWrapper');
  const dotsContainer = document.getElementById('sliderDots');

  sliderData.forEach((item, i) => {
    const slide = document.createElement('div');
    slide.className = 'slide';
    slide.innerHTML = `
      <img src="${item.image}" alt="슬라이드 ${i + 1}" loading="${i === 0 ? 'eager' : 'lazy'}">
      <div class="slide-caption">
        <h2>${item.title}</h2>
        <p>${item.subtitle}</p>
      </div>
    `;
    wrapper.appendChild(slide);

    const dot = document.createElement('span');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  let current = 0;
  let autoTimer = setInterval(nextSlide, 4500);

  function goToSlide(n) {
    current = (n + sliderData.length) % sliderData.length;
    wrapper.style.transform = `translateX(-${current * 100}%)`;
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function nextSlide() { goToSlide(current + 1); }

  document.getElementById('sliderPrev').addEventListener('click', () => {
    clearInterval(autoTimer);
    goToSlide(current - 1);
    autoTimer = setInterval(nextSlide, 4500);
  });

  document.getElementById('sliderNext').addEventListener('click', () => {
    clearInterval(autoTimer);
    goToSlide(current + 1);
    autoTimer = setInterval(nextSlide, 4500);
  });
}

/* ===== Region Cards ===== */
function initRegionCards() {
  const regions = [
    { name: '서울', icon: '<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v6" stroke="#ff4b4b" stroke-width="2"/><path d="M9 8h6v3H9z" fill="#4a90e2"/><path d="M10 11l-2 11h8l-2-11" fill="currentColor"/></svg>' },
    { name: '부산', icon: '<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8v12M18 8v12" stroke="currentColor" stroke-width="2"/><path d="M2 12c6-4 14-4 20 0" stroke="#ff4b4b" stroke-width="2"/><path d="M2 18.5c2-1 4-1 6 0s4 2 6 0 4-1 6 0" stroke="#4a90e2" stroke-width="2"/></svg>' },
    { name: '대구', icon: '<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5C8 1 2 4 2 10c0 6 5 11 10 12 5-1 10-6 10-12 0-6-6-9-10-5z" fill="#ff4b4b"/><path d="M12 5c1-3 3-4 5-4" stroke="#7ed321" stroke-width="2"/><path d="M12 5v2" stroke="currentColor" stroke-width="2"/></svg>' },
    { name: '광주', icon: '<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12A10 10 0 0 1 2 12h20z" fill="#ff4b4b"/><path d="M2 12A10 10 0 0 0 22 12" stroke="#7ed321" stroke-width="3"/><circle cx="8" cy="16" r="1.5" fill="#fff"/><circle cx="12" cy="18" r="1.5" fill="#fff"/><circle cx="16" cy="16" r="1.5" fill="#fff"/></svg>' },
    { name: '대전', icon: '<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3" fill="#f5a623"/><ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#4a90e2" stroke-width="2" transform="rotate(30 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#ff4b4b" stroke-width="2" transform="rotate(150 12 12)"/></svg>' },
    { name: '인천', icon: '<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="#4a90e2"/></svg>' },
    { name: '제주', icon: '<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14" r="7" fill="#f5a623"/><path d="M12 7V4c2 0 4 1 5 3" stroke="#7ed321" stroke-width="2"/><path d="M12 7c-1 0-2 1-2 2" stroke="currentColor" stroke-width="2"/></svg>' },
  ];

  const grid = document.getElementById('regionGrid');
  regions.forEach(r => {
    const card = document.createElement('div');
    card.className = 'region-card';
    card.innerHTML = `<span class="region-icon">${r.icon}</span><span>${r.name}</span>`;
    card.addEventListener('click', () => {
      location.href = `list.html?region=${encodeURIComponent(r.name)}`;
    });
    grid.appendChild(card);
  });
}

/* ===== Recommended Cards ===== */
function initRecommendCards() {
  const grid = document.getElementById('recommendGrid');

  // 지역별 대표 맛집 각 1개씩 6개 선택
  const picks = ["서울", "부산", "대구", "광주", "대전", "제주"]
    .map(region => restaurants.find(r => r.region === region))
    .filter(Boolean);

  picks.forEach(r => {
    const card = createCard(r);
    grid.appendChild(card);
  });
}

function createCard(r) {
  const article = document.createElement('article');
  article.className = 'card';
  article.setAttribute('role', 'button');
  article.setAttribute('tabindex', '0');
  article.setAttribute('aria-label', `${r.name} 상세 보기`);
  article.innerHTML = `
    <div class="card-img">
      <img src="${r.image}" alt="${r.name}" loading="lazy">
      <button class="bookmark-btn ${window.isBookmarked && window.isBookmarked(r.id) ? 'active' : ''}" data-id="${r.id}" onclick="window.toggleBookmark && window.toggleBookmark(${r.id}, event)" aria-label="찜하기">
        <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
      </button>
    </div>
    <div class="card-body">
      <div class="card-tags">
        <span class="tag region">${r.region}</span>
        <span class="tag category">${r.category}</span>
      </div>
      <h3 class="card-title">${r.name}</h3>
      <p class="card-desc">${r.description}</p>
    </div>
  `;
  article.addEventListener('click', () => { location.href = `detail.html?id=${r.id}`; });
  article.addEventListener('keydown', e => { if (e.key === 'Enter') location.href = `detail.html?id=${r.id}`; });
  
  article.classList.add('reveal');
  if (window.observeReveal) window.observeReveal(article);

  return article;
}

/* ===== Nav Mobile Toggle ===== */
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
}

/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', () => {
  initSlider();
  initRegionCards();
  initRecommendCards();
  initNav();
});
