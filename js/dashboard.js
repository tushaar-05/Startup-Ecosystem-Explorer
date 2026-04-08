import { fetchData } from './api.js';

const startupList = document.getElementById('startup-list');
const loading = document.getElementById('loading');
const listBottom = document.getElementById('listBottom');
const spotlight = document.getElementById('spotlight');
const searchInput = document.getElementById('search-input');
const btn = document.getElementById('load-more-btn');
const statusEl = document.getElementById('load-more-status');
const showingEl = document.getElementById('showing-count');
const totalEl = document.getElementById('total-count');
const sectorFilter = document.getElementById('sector-filter');
const sortSelect = document.getElementById('sort-select');
const scoreSlider = document.getElementById('score-slider');
const minScoreValue = document.getElementById('min-score-value');
const themeToggle = document.getElementById('theme-toggle');

window.allStartups = [];
window.displayedStartups = [];
window.currentSpotlight = null;

let searchQuery = "";
let selectedSector = "";
let selectedSort = "score-desc";
let minScore = 0;
let cursor = null;
let hasNextPage = true;
const PAGE_SIZE = 9;

async function initDashboard() {
  loading?.classList.remove('hidden');
  startupList?.classList.add('hidden');

  const data = await fetchData();
  if (!data) return;

  loading?.classList.add('hidden');
  startupList?.classList.remove('hidden');

  const initialPosts = data.posts.edges.map(e => e.node);
  window.currentSpotlight = initialPosts.shift();
  window.allStartups = [...initialPosts];
  cursor = data.posts.pageInfo.endCursor;
  hasNextPage = data.posts.pageInfo.hasNextPage;

  window.displayedStartups = window.allStartups.splice(0, PAGE_SIZE);
  
  populateSectors([window.currentSpotlight, ...window.displayedStartups, ...window.allStartups]);
  renderSpotlight(window.currentSpotlight);
  updateView();

  btn?.addEventListener('click', loadMore);
  searchInput?.addEventListener('input', handleSearch);
  
  sectorFilter?.addEventListener('change', (e) => {
    selectedSector = e.target.value;
    updateView();
  });

  sortSelect?.addEventListener('change', (e) => {
    selectedSort = e.target.value;
    updateView();
  });

  scoreSlider?.addEventListener('input', (e) => {
    minScore = parseInt(e.target.value);
    if (minScoreValue) minScoreValue.textContent = minScore;
    updateView();
  });
  
  document.getElementById('reset-filters')?.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    if (sectorFilter) { sectorFilter.value = ''; selectedSector = ''; }
    if (sortSelect) { sortSelect.value = 'score-desc'; selectedSort = 'score-desc'; }
    if (scoreSlider) { scoreSlider.value = 0; minScore = 0; }
    if (minScoreValue) minScoreValue.textContent = '0';
    updateView();
  });

  initTheme();
}

function initTheme() {
  const theme = localStorage.getItem('theme');
  if (theme === 'light') {
    document.body.classList.add('light-mode');
    if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }

  themeToggle?.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    themeToggle.innerHTML = `<i class="fas fa-${isLight ? 'sun' : 'moon'}"></i>`;
  });
}

async function loadMore() {
  if (!btn) return;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-[11px]"></i> Loading…';

  if (window.allStartups.length < PAGE_SIZE && hasNextPage) {
    const more = await fetchData(cursor);
    if (more) {
      window.allStartups = window.allStartups.concat(more.posts.edges.map(e => e.node));
      cursor = more.posts.pageInfo.endCursor;
      hasNextPage = more.posts.pageInfo.hasNextPage;
    }
  }

  const nextBatch = window.allStartups.splice(0, PAGE_SIZE);
  window.displayedStartups = window.displayedStartups.concat(nextBatch);
  
  populateSectors([window.currentSpotlight, ...window.displayedStartups, ...window.allStartups]);
  updateView();

  if (window.allStartups.length === 0 && !hasNextPage) {
    btn.style.display = 'none';
    if (statusEl) statusEl.textContent = `All ${window.displayedStartups.length + 1} startups loaded`;
  } else {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-chevron-down text-[11px]"></i> Load More Startups';
  }
}

function handleSearch(e) {
  const val = e.target.value.toLowerCase().trim();
  const debounceTimer = window.setTimeout(() => {}, 0); // clear handle in real code
  clearTimeout(window.searchTimeout);
  window.searchTimeout = setTimeout(() => {
    searchQuery = val;
    updateView();
  }, 350);
}

function updateView() {
  let combined = [window.currentSpotlight, ...window.displayedStartups, ...window.allStartups].filter(Boolean);
  
  if (searchQuery) {
    combined = combined.filter(post => 
      post.name?.toLowerCase().includes(searchQuery) ||
      post.tagline?.toLowerCase().includes(searchQuery) ||
      post.description?.toLowerCase().includes(searchQuery)
    );
  }

  if (selectedSector) {
    combined = combined.filter(post => post.topics.edges.some(e => e.node.name === selectedSector));
  }

  if (minScore > 0) {
    combined = combined.filter(post => post.votesCount >= minScore);
  }

  combined.sort((a, b) => {
    switch (selectedSort) {
      case 'score-desc': return b.votesCount - a.votesCount;
      case 'score-asc': return a.votesCount - b.votesCount;
      case 'az': return a.name.localeCompare(b.name);
      case 'za': return b.name.localeCompare(a.name);
      default: return 0;
    }
  });

  const isFiltered = searchQuery || selectedSector || minScore > 0;

  if (isFiltered) {
    if (listBottom) listBottom.innerHTML = '';
    if (spotlight) spotlight.style.display = 'none';
    if (combined.length === 0) {
      document.getElementById('no-results')?.classList.remove('hidden');
    } else {
      document.getElementById('no-results')?.classList.add('hidden');
      appendStartups(combined, -1);
    }
    if (btn) btn.style.display = 'none';
  } else {
    document.getElementById('no-results')?.classList.add('hidden');
    if (spotlight) spotlight.style.display = 'flex';
    renderSpotlight(window.currentSpotlight);
    if (listBottom) listBottom.innerHTML = '';
    appendStartups(window.displayedStartups, 0);
    if (btn) btn.style.display = (window.allStartups.length > 0 || hasNextPage) ? 'flex' : 'none';
  }
}

function renderSpotlight(post) {
  if (!post || !spotlight) return;
  const sector = post.topics.edges[0]?.node.name || 'Other';
  const saved = JSON.parse(localStorage.getItem('savedStartups') || '[]');
  const isSaved = saved.some(s => s.id === post.id);

  spotlight.innerHTML = `
    <div class="flex-shrink-0 w-[72px] h-[72px] rounded-[14px] border border-white/10 bg-[#242424] overflow-hidden">
      <img src="${post.thumbnail.url}" alt="${post.name}" class="w-full h-full object-cover"/>
    </div>
    <div class="flex flex-col gap-3 flex-1">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-3 text-white">
          <span class="text-lg font-bold">${post.name}</span>
          <span class="bg-violet-50 text-violet-600 border border-violet-200 rounded-full px-2 py-0.5 text-[10px]">${sector}</span>
        </div>
        <p class="text-white/35 text-[11px]">Founded by <span class="text-white/55">${post.user.name}</span></p>
      </div>
      <p class="text-white/55 text-sm">${post.tagline || post.description.substring(0, 100) + '...'}</p>
    </div>
    <div class="flex gap-3 items-center">
      <button onclick="toggleSave('${post.id}')" class="save-btn-${post.id} flex items-center gap-1.5 bg-transparent text-white/65 hover:text-white text-sm px-4 py-2 rounded-xl border border-white/10 transition-colors">
        <i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i> ${isSaved ? 'Saved' : 'Save'}
      </button>
      <a href="${post.url}" target="_blank" class="bg-[#FF3800] text-white text-sm px-4 py-2 rounded-xl">View Site</a>
    </div>
  `;
}

function appendStartups(posts, rankStart = 0) {
  if (!listBottom) return;
  const saved = JSON.parse(localStorage.getItem('savedStartups') || '[]');
  
  listBottom.insertAdjacentHTML('beforeend', posts.map((post, index) => {
    const isSaved = saved.some(s => s.id === post.id);
    return `
      <div class="card bg-white rounded-xl border border-gray-200 px-6 py-5 flex items-center gap-5 hover:shadow-md transition-shadow">
        <div class="text-gray-400 font-bold w-6 text-center">#${rankStart + index + 2}</div>
        <img src="${post.thumbnail.url}" alt="${post.name}" class="w-12 h-12 rounded-xl object-cover">
        <div class="flex-1">
          <div class="font-bold text-gray-900">${post.name}</div>
          <p class="text-gray-500 text-sm">${post.tagline || post.description?.substring(0, 60) + '...'}</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="toggleSave('${post.id}')" class="save-btn-${post.id} flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 bg-white">
            <i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i><span>${isSaved ? 'Saved' : 'Save'}</span>
          </button>
          <a href="${post.url}" target="_blank" class="text-white text-xs font-semibold px-3 py-2 rounded-lg bg-gray-900">Details</a>
        </div>
      </div>
    `;
  }).join(''));
}

window.toggleSave = function(postId) {
  const saved = JSON.parse(localStorage.getItem('savedStartups') || '[]');
  const idx = saved.findIndex(s => s.id === postId);
  
  if (idx > -1) {
    saved.splice(idx, 1);
  } else {
    const all = [window.currentSpotlight, ...window.displayedStartups, ...window.allStartups];
    const post = all.find(s => s?.id === postId);
    if (post) saved.push(post);
  }
  
  localStorage.setItem('savedStartups', JSON.stringify(saved));
  
  // Update UI
  document.querySelectorAll(`.save-btn-${postId}`).forEach(btn => {
    const isNowSaved = !isSaved(postId); // logic flip because we just saved it? No, let's just check storage
    const savedNow = JSON.parse(localStorage.getItem('savedStartups') || '[]');
    const isNowSavedState = savedNow.some(s => s.id === postId);

    const icon = btn.querySelector('i');
    if (icon) icon.className = `${isNowSavedState ? 'fa-solid' : 'fa-regular'} fa-bookmark`;
    
    const span = btn.querySelector('span');
    if (span) span.textContent = isNowSavedState ? 'Saved' : 'Save';
    else {
      const textNode = Array.from(btn.childNodes).find(n => n.nodeType === 3);
      if (textNode) textNode.textContent = isNowSavedState ? ' Saved' : ' Save';
    }
  });
};

function isSaved(postId) {
  const saved = JSON.parse(localStorage.getItem('savedStartups') || '[]');
  return saved.some(s => s.id === postId);
}

function populateSectors(posts) {
  if (!sectorFilter) return;
  const currentSelection = selectedSector;
  const sectors = new Set();
  posts.forEach(p => p?.topics?.edges.forEach(e => sectors.add(e.node.name)));
  const sorted = Array.from(sectors).sort();
  sectorFilter.innerHTML = '<option value="">All Sectors</option>' + 
    sorted.map(s => `<option value="${s}" ${s === currentSelection ? 'selected' : ''}>${s}</option>`).join('');
}

initDashboard();
