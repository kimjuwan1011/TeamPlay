/* ===== Get Restaurant from URL ===== */
function getRestaurantId() {
  return parseInt(new URLSearchParams(location.search).get('id'), 10);
}

function getRestaurant(id) {
  return restaurants.find(r => r.id === id) || null;
}

/* ===== Render Detail ===== */
function renderDetail(r) {
  document.title = `${r.name} - 맛집 탐험대`;

  const heroImg = document.getElementById('detailHeroImg');
  if (heroImg) {
    heroImg.src = r.image;
    heroImg.alt = r.name;
  }

  document.getElementById('detailRegionTag').textContent = r.region;
  document.getElementById('detailCategoryTag').textContent = r.category;
  document.getElementById('detailName').textContent = r.name;
  document.getElementById('detailAddress').textContent = r.address;

  document.getElementById('sidebarRegion').textContent = r.region;
  document.getElementById('sidebarCategory').textContent = r.category;
  document.getElementById('sidebarAddress').textContent = r.address;

  const mapAddr = document.getElementById('mapAddress');
  if (mapAddr) mapAddr.textContent = r.address;

  const sidebarPhone = document.getElementById('sidebarPhone');
  if (sidebarPhone) sidebarPhone.textContent = r.phone || '정보 없음';

  renderMenuTab(r.menu);

  window._currentRestaurant = r;
}

/* ===== Menu Tab ===== */
function renderMenuTab(menuStr) {
  const list = document.getElementById('menuList');
  if (!list) return;

  const items = menuStr.split('/').map(s => s.trim()).filter(Boolean);

  list.innerHTML = items.map(item => {
    const parts = item.split(/\s+(?=\d)/);
    const name = parts[0] || item;
    const price = parts.slice(1).join(' ') || '';
    return `
      <div class="menu-item">
        <span class="menu-name">${name}</span>
        ${price ? `<span class="menu-price">${price}</span>` : ''}
      </div>
    `;
  }).join('');
}

/* ===== Tab UI ===== */
function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', function () {
      const target = this.dataset.tab;

      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => p.classList.remove('active'));

      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');

      const panel = document.getElementById(`tab-${target}`);
      if (panel) panel.classList.add('active');

      if (target === 'location') setTimeout(initKakaoMap, 50);
    });
  });
}

/* ===== Kakao Map ===== */
let mapInitialized = false;
let kakaoSDKLoaded = false;
let locationTabPending = false;

function onKakaoSDKLoad() {
  kakaoSDKLoaded = true;
  if (locationTabPending) drawMap();
}

function initKakaoMap() {
  if (mapInitialized) return;
  if (!kakaoSDKLoaded) {
    locationTabPending = true;
    showMapFallback();
    return;
  }
  drawMap();
}

function drawMap() {
  if (mapInitialized) return;

  const r = window._currentRestaurant;
  if (!r) return;

  const container = document.getElementById('map');
  if (!container) return;

  try {
    const coords = new kakao.maps.LatLng(r.lat, r.lng);
    const map = new kakao.maps.Map(container, { center: coords, level: 4 });
    map.relayout();
    new kakao.maps.Marker({ position: coords }).setMap(map);
    new kakao.maps.InfoWindow({
      content: `<div style="padding:6px 10px;font-size:13px;font-weight:700;">${r.name}</div>`,
    }).open(map, new kakao.maps.Marker({ position: coords }));
    mapInitialized = true;
  } catch (e) {
    showMapFallback();
  }
}

function showMapFallback() {
  if (mapInitialized) return;
  const r = window._currentRestaurant;
  if (!r) return;

  document.getElementById('map').style.display = 'none';
  const fallback = document.getElementById('mapFallback');
  if (!fallback) return;
  fallback.style.display = 'block';

  const addrEl = document.getElementById('mapFallbackAddr');
  if (addrEl) addrEl.textContent = r.address;

  const link = document.getElementById('kakaoMapLink');
  if (link) {
    link.href = r.placeUrl || `https://map.kakao.com/link/map/${encodeURIComponent(r.name)},${r.lat},${r.lng}`;
  }
}

/* ===== 리뷰 기능 ===== */
function getReviewKey(id) {
  return `reviews_${id}`;
}

function getReviews(id) {
  return JSON.parse(localStorage.getItem(getReviewKey(id)) || '[]');
}

function saveReview(id, review) {
  const reviews = getReviews(id);
  reviews.unshift(review);
  localStorage.setItem(getReviewKey(id), JSON.stringify(reviews));
}

function renderReviews(id) {
  const list = document.getElementById('reviewList');
  if (!list) return;

  const reviews = getReviews(id);

  if (reviews.length === 0) {
    list.innerHTML = `<p class="review-empty">아직 작성된 리뷰가 없어요. 첫 번째 리뷰를 남겨보세요!</p>`;
    return;
  }

  list.innerHTML = reviews.map(r => `
    <div class="review-item">
      <div class="review-header">
        <span class="review-nickname">${r.nickname}</span>
        <span class="review-date">${r.date}</span>
      </div>
      <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
      <p class="review-content">${r.content}</p>
    </div>
  `).join('');
}

function initReview(id) {
  const form = document.getElementById('reviewForm');
  if (!form) return;

  renderReviews(id);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nickname = document.getElementById('reviewNickname').value.trim();
    const rating = parseInt(document.querySelector('input[name="rating"]:checked')?.value || '0');
    const content = document.getElementById('reviewContent').value.trim();

    if (!nickname || !rating || !content) {
      alert('별점, 닉네임, 내용을 모두 입력해주세요.');
      return;
    }

    const review = {
      nickname,
      rating,
      content,
      date: new Date().toLocaleDateString('ko-KR')
    };

    saveReview(id, review);
    renderReviews(id);
    form.reset();
  });
}

/* ===== Not Found ===== */
function renderNotFound() {
  const main = document.getElementById('detailMain');
  if (!main) return;
  main.innerHTML = `
    <div class="not-found container">
      <h2>맛집을 찾을 수 없습니다</h2>
      <p>잘못된 접근이거나 삭제된 맛집입니다.</p>
      <a href="list.html" class="btn btn-primary" style="margin-top:24px;display:inline-flex;">목록으로 돌아가기</a>
    </div>
  `;
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
  initNav();

  const id = getRestaurantId();
  const restaurant = getRestaurant(id);

  if (!restaurant) {
    renderNotFound();
    return;
  }

  renderDetail(restaurant);
  initTabs();
  initReview(id);

  const navLinks = document.querySelectorAll('.nav a');
  navLinks.forEach(a => {
    if (a.getAttribute('href') === 'list.html') a.classList.add('active');
  });
});
