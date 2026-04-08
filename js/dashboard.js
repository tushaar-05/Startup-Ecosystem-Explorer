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
  const sector = post.topics?.edges[0]?.node.name || 'Other';
  const savedItems = JSON.parse(localStorage.getItem('savedStartups') || '[]');
  const isSaved = savedItems.some(s => s.id === post.id);
  const isTrending = post.commentsCount >= 20;

  spotlight.innerHTML = `
    <div class="flex-shrink-0 w-[84px] h-[84px] rounded-[18px] border border-white/10 bg-[#242424] overflow-hidden">
      <img src="${post.thumbnail.url}" alt="${post.name}" class="w-full h-full object-cover"/>
    </div>
    <div class="flex flex-col gap-3.5 flex-1">
      <div class="flex flex-col gap-1.5">
        <div class="flex items-center gap-3.5 text-white flex-wrap">
          <span class="text-xl font-bold">${post.name}</span>
          <span class="bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full px-3 py-0.5 text-[11px] font-semibold tracking-wide uppercase">${sector}</span>
          ${isTrending ? `
            <span class="flex items-center gap-1.5 text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full px-2.5 py-0.5 font-bold tracking-widest uppercase">
              <i class="fa-solid fa-fire text-[9px]"></i> TRENDING
            </span>
          ` : ''}
        </div>
        <p class="text-white/35 text-[11px] font-medium tracking-wide">Founded by <span class="text-white/55 font-semibold">${post.user.name}</span></p>
      </div>
      <p class="text-white/55 text-sm leading-relaxed max-w-[850px]">${post.tagline || post.description}</p>
      
      <div class="flex items-center gap-3 text-xs">
        <div class="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg px-2.5 py-1">
          <span class="text-orange-400 font-bold flex items-center gap-1"><i class="fa-solid fa-angles-up text-[10px]"></i> ${post.votesCount}</span>
        </div>
        <div class="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1">
          <span class="text-white/40 font-medium flex items-center gap-1"><i class="fa-regular fa-comment text-[10px]"></i> ${post.commentsCount}</span>
        </div>
      </div>
    </div>
    <div class="flex gap-4 items-center">
      <button onclick="toggleSave('${post.id}')" class="save-btn-${post.id} flex items-center gap-2 bg-transparent text-white/65 hover:text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/25 transition-all cursor-pointer">
        <i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i> <span>${isSaved ? 'Saved' : 'Save'}</span>
      </button>
      <a href="${post.url}" target="_blank" class="bg-[#FF3800] hover:bg-[#ff5520] text-white text-[13px] font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-900/20">View Site</a>
    </div>
  `;
}

function appendStartups(posts, rankStart = 0) {
  if (!listBottom) return;
  const savedItems = JSON.parse(localStorage.getItem('savedStartups') || '[]');
  
  listBottom.insertAdjacentHTML('beforeend', posts.map((post, index) => {
    const isNowSaved = savedItems.some(s => s.id === post.id);
    const sector = post.topics?.edges[0]?.node.name || 'Other';
    const isTrending = post.commentsCount >= 20;

    return `
      <div class="card bg-white rounded-xl border border-gray-200 px-6 py-5 flex items-center gap-5 hover:shadow-md transition-shadow">
        <div class="text-gray-400 font-bold w-6 text-center text-sm">#${rankStart + index + 2}</div>
        
        <div class="w-12 h-12 rounded-xl border border-gray-100 overflow-hidden shrink-0">
          <img src="${post.thumbnail.url}" alt="${post.name}" class="w-full h-full object-cover">
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap mb-0.5">
            <span class="font-bold text-gray-900 text-base">${post.name}</span>
            ${isTrending ? `
              <span class="flex items-center gap-1.5 text-[10px] bg-orange-50 text-orange-500 border border-orange-200 rounded-full px-2.5 py-0.5 font-bold tracking-wider uppercase">
                <i class="fa-solid fa-fire text-[9px]"></i> TRENDING
              </span>
            ` : ''}
          </div>
          
          <p class="text-[11px] text-gray-400 font-medium mb-1.5">
            Founded by <span class="text-gray-600 font-semibold">${post.user.name}</span>
          </p>
          
          <p class="text-gray-500 text-sm leading-snug mb-2.5 truncate-2-lines">${post.tagline || post.description || ''}</p>
          
          <div class="flex items-center gap-3 text-[11px] text-gray-400 flex-wrap">
            <span class="bg-violet-50 text-violet-600 border border-violet-200 rounded-full px-2.5 py-0.5 font-semibold">${sector}</span>
            <span class="flex items-center gap-1 text-orange-500 font-bold">
              <i class="fa-solid fa-angles-up text-[10px]"></i> ${post.votesCount}
            </span>
            <span class="flex items-center gap-1 font-medium">
              <i class="fa-regular fa-comment text-[10px]"></i> ${post.commentsCount}
            </span>
            <span class="text-gray-300 mx-0.5">·</span>
            <span class="font-medium">${new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button onclick="toggleSave('${post.id}')" class="save-btn-${post.id} flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-xs font-semibold px-3.5 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all cursor-pointer">
            <i class="${isNowSaved ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i>
            <span>${isNowSaved ? 'Saved' : 'Save'}</span>
          </button>
          <a href="${post.url}" target="_blank" class="flex items-center gap-1 text-white text-xs font-semibold px-3.5 py-2 rounded-lg bg-gray-900 hover:bg-gray-700 transition-all cursor-pointer">
            Details <i class="fa-solid fa-arrow-right text-[10px] ml-0.5"></i>
          </a>
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
