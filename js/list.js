const KAKAO_REST_KEY = '4079ea5334667b8daee30234c31e98cd';

let activeRegion = 'all';
let activeCategory = 'all';
let activeRating = 'all';
let activeSort = 'default';
let kakaoResults = null; // null = 로컬 데이터, 배열 = API 검색 결과

/* ===== Render ===== */
function createCard(r) {
  const article = document.createElement('article');
  article.className = 'card';
  article.setAttribute('tabindex', '0');
  article.setAttribute('aria-label', `${r.name} 상세 보기`);

  const isKakao = String(r.id).startsWith('kakao_');

  const ratingHTML = r.rating != null
    ? `<span class="card-rating"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> ${Number(r.rating).toFixed(1)}</span>`
    : '';

  article.innerHTML = `
    <div class="card-img">
      <img src="${r.image}" alt="${r.name}" loading="lazy"
           onerror="this.src='https://picsum.photos/seed/default/600/400'">
      ${!isKakao ? `
      <button class="bookmark-btn ${window.isBookmarked && window.isBookmarked(r.id) ? 'active' : ''}" data-id="${r.id}" onclick="window.toggleBookmark && window.toggleBookmark(${r.id}, event)" aria-label="찜하기">
        <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
      </button>` : ''}
    </div>
    <div class="card-body">
      <div class="card-tags">
        <span class="tag region">${r.region}</span>
        <span class="tag category">${r.category}</span>
        ${ratingHTML}
      </div>
      <h3 class="card-title">${r.name}</h3>
      <p class="card-desc">${r.description}</p>
    </div>
  `;

  if (!isKakao) {
    article.addEventListener('click', () => { location.href = `detail.html?id=${r.id}`; });
    article.addEventListener('keydown', e => { if (e.key === 'Enter') location.href = `detail.html?id=${r.id}`; });
  } else {
    article.style.cursor = 'default';
    article.title = r.address;
  }

  article.classList.add('reveal');
  if (window.observeReveal) window.observeReveal(article);

  return article;
}

function renderGrid(data) {
  const grid = document.getElementById('restaurant-grid');
  grid.innerHTML = '';

  const countEl = document.getElementById('resultCount');

  if (data.length === 0) {
    grid.innerHTML = '<p class="no-result">조건에 맞는 맛집이 없습니다.</p>';
    if (countEl) countEl.innerHTML = '검색 결과 <strong>0</strong>개';
    return;
  }

  if (countEl) countEl.innerHTML = `검색 결과 <strong>${data.length}</strong>개`;
  data.forEach(r => grid.appendChild(createCard(r)));
}

function getFilteredLocal() {
  let result = restaurants.filter(r => {
    const regionOk = activeRegion === 'all' || r.region === activeRegion;
    const catOk = activeCategory === 'all' || r.category === activeCategory;
    const ratingOk = activeRating === 'all' || (r.rating != null && r.rating >= parseFloat(activeRating));
    return regionOk && catOk && ratingOk;
  });

  if (activeSort === 'rating') {
    result = [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  } else if (activeSort === 'name') {
    result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }

  return result;
}

function updateView() {
  if (kakaoResults !== null) {
    renderGrid(kakaoResults);
  } else {
    renderGrid(getFilteredLocal());
  }
}

/* ===== Kakao Local API Search ===== */
function extractRegion(address) {
  if (address.includes('서울')) return '서울';
  if (address.includes('부산')) return '부산';
  if (address.includes('제주')) return '제주';
  return '기타';
}

function extractCategory(categoryName) {
  if (!categoryName) return '기타';
  if (categoryName.includes('한식')) return '한식';
  if (categoryName.includes('일식')) return '일식';
  if (categoryName.includes('중식')) return '중식';
  if (categoryName.includes('양식') || categoryName.includes('이탈리아') || categoryName.includes('패밀리레스토랑')) return '양식';
  return '기타';
}

async function searchKakao(query) {
  const grid = document.getElementById('restaurant-grid');
  grid.innerHTML = Array.from({length: 6}).map(() => `
    <div class="skeleton-card">
      <div class="skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton-line" style="width: 40%;"></div>
        <div class="skeleton-line" style="width: 80%; height: 24px; margin-top: 12px;"></div>
        <div class="skeleton-line" style="width: 100%; margin-top: 16px;"></div>
        <div class="skeleton-line" style="width: 60%;"></div>
      </div>
    </div>
  `).join('');

  const badge = document.getElementById('searchModeBadge');
  if (badge) badge.style.display = 'inline';

  try {
    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query + ' 맛집')}&category_group_code=FD6&size=15`;
    const res = await fetch(url, {
      headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();

    kakaoResults = json.documents.map((place, idx) => ({
      id: `kakao_${idx}_${place.id}`,
      name: place.place_name,
      region: extractRegion(place.road_address_name || place.address_name),
      category: extractCategory(place.category_name),
      address: place.road_address_name || place.address_name,
      menu: '메뉴 정보 없음',
      description: `${place.category_name} | ${place.road_address_name || place.address_name}`,
      image: `https://picsum.photos/seed/${encodeURIComponent(place.place_name)}/600/400`,
      lat: parseFloat(place.y),
      lng: parseFloat(place.x),
      placeUrl: place.place_url,
    }));

    renderGrid(kakaoResults);
  } catch (err) {
    console.error('카카오 API 오류:', err);
    grid.innerHTML = `
      <div class="no-result">
        검색 중 오류가 발생했습니다.<br>
        <small style="color:#aaa">CORS 제한이 있을 수 있습니다. 로컬 데이터에서 검색합니다.</small>
      </div>
    `;
    // Fallback: 로컬 데이터 이름 검색
    const q = query.toLowerCase();
    kakaoResults = restaurants.filter(r =>
      r.name.includes(query) || r.description.includes(query) || r.region.includes(query)
    );
    renderGrid(kakaoResults);
  }
}

/* ===== Filter Buttons Init ===== */
function initFilters() {
  const regionBtns = document.querySelectorAll('[data-region]');
  const catBtns = document.querySelectorAll('[data-category]');
  const ratingBtns = document.querySelectorAll('[data-rating]');
  const sortBtns = document.querySelectorAll('[data-sort]');

  regionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      kakaoResults = null;
      const badge = document.getElementById('searchModeBadge');
      if (badge) badge.style.display = 'none';
      document.getElementById('searchInput').value = '';

      activeRegion = btn.dataset.region;
      regionBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateView();
    });
  });

  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      kakaoResults = null;
      const badge = document.getElementById('searchModeBadge');
      if (badge) badge.style.display = 'none';
      document.getElementById('searchInput').value = '';

      activeCategory = btn.dataset.category;
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateView();
    });
  });

  ratingBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeRating = btn.dataset.rating;
      ratingBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateView();
    });
  });

  sortBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeSort = btn.dataset.sort;
      sortBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateView();
    });
  });
}

/* ===== Search Bar ===== */
function initSearch() {
  const input = document.getElementById('searchInput');
  const btn = document.getElementById('searchBtn');
  const clearBtn = document.getElementById('clearSearchBtn');

  function doSearch() {
    const q = input.value.trim();
    if (!q) {
      kakaoResults = null;
      const badge = document.getElementById('searchModeBadge');
      if (badge) badge.style.display = 'none';
      updateView();
      return;
    }
    searchKakao(q);
  }

  btn.addEventListener('click', doSearch);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      kakaoResults = null;
      const badge = document.getElementById('searchModeBadge');
      if (badge) badge.style.display = 'none';
      updateView();
    });
  }
}

/* ===== URL Params (지역 사전 선택) ===== */
function applyURLParams() {
  const params = new URLSearchParams(location.search);
  const region = params.get('region');
  if (region) {
    activeRegion = region;
    const btn = document.querySelector(`[data-region="${region}"]`);
    if (btn) {
      document.querySelectorAll('[data-region]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
  }
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
  applyURLParams();
  initFilters();
  initSearch();
  initNav();
  updateView();
});
