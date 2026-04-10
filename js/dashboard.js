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
const heroTotalEl = document.getElementById('hero-total-count');
const heroSavedEl = document.getElementById('hero-saved-count');
const heroSubtitleEl = document.getElementById('hero-subtitle-count');
const heroScoreEl = document.getElementById('hero-top-score');

function isSaved(postId) {
  const saved = JSON.parse(localStorage.getItem('savedStartups') || '[]');
  return saved.some(s => s.id === postId);
}



let allStartups = [];
let displayedStartups = [];
let currentSpotlight = null;
let searchQuery = "";
let selectedSector = "";
let selectedSort = "score-desc";
let minScore = 0;
let cursor = null;
let hasNextPage = true;
const PAGE_SIZE = 9;

async function initDashboard() {
  loading.classList.remove('hidden');
  startupList.classList.add('hidden');

  const data = await fetchData();

  if (!data) {
    console.error("No data received");
    return;
  }

  loading.classList.add('hidden');
  startupList.classList.remove('hidden');

  const initialPosts = data.posts.edges.map(e => e.node);
  currentSpotlight = initialPosts.shift();
  allStartups = [...initialPosts];
  cursor = data.posts.pageInfo.endCursor;
  hasNextPage = data.posts.pageInfo.hasNextPage;

  displayedStartups = allStartups.splice(0, PAGE_SIZE);
  
  populateSectors([currentSpotlight, ...displayedStartups, ...allStartups]);

  renderSpotlight(currentSpotlight);
  updateView();

  btn.addEventListener('click', loadMore);
  searchInput.addEventListener('input', handleSearch);
  
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
    sectorFilter.value = '';
    selectedSector = '';
    sortSelect.value = 'score-desc';
    selectedSort = 'score-desc';
    scoreSlider.value = 0;
    minScore = 0;
    if (minScoreValue) minScoreValue.textContent = '0';
    updateView();
  });

  initTheme();
}

function initTheme() {
  const theme = localStorage.getItem('theme');
  if (theme === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }

  themeToggle?.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    themeToggle.innerHTML = `<i class="fas fa-${isLight ? 'sun' : 'moon'}"></i>`;
  });
}

async function loadMore() {
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-[11px]"></i> Loading…';

  if (allStartups.length < PAGE_SIZE && hasNextPage) {
    const more = await fetchData(cursor);
    if (more) {
      allStartups = allStartups.concat(more.posts.edges.map(e => e.node));
      cursor = more.posts.pageInfo.endCursor;
      hasNextPage = more.posts.pageInfo.hasNextPage;
    }
  }

  const nextBatch = allStartups.splice(0, PAGE_SIZE);
  displayedStartups = displayedStartups.concat(nextBatch);
  
  populateSectors([currentSpotlight, ...displayedStartups, ...allStartups]);
  updateView();

  if (allStartups.length === 0 && !hasNextPage) {
    btn.style.display = 'none';
    statusEl.textContent = `All ${displayedStartups.length + 1} startups loaded`;
  } else {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-chevron-down text-[11px]"></i> Load More Startups';
  }
}

let debounceTimer;

function handleSearch(e) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        searchQuery = e.target.value.toLowerCase().trim();
        updateView();
    }, 350);
}

function updateView() {
  let combined = [currentSpotlight, ...displayedStartups, ...allStartups].filter(Boolean);
  
  if (searchQuery) {
    combined = combined.filter(post => 
      post.name?.toLowerCase().includes(searchQuery) ||
      post.tagline?.toLowerCase().includes(searchQuery) ||
      post.description?.toLowerCase().includes(searchQuery) ||
      post.user.name?.toLowerCase().includes(searchQuery)
    );
  }

  if (selectedSector) {
    combined = combined.filter(post => 
      post.topics?.edges.some(e => e.node.name === selectedSector)
    );
  }

  if (minScore > 0) {
    combined = combined.filter(post => post.votesCount >= minScore);
  }

  combined.sort((a, b) => {
    switch (selectedSort) {
      case 'score-desc': return b.votesCount - a.votesCount;
      case 'score-asc': return a.votesCount - b.votesCount;
      case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
      case 'az': return a.name.localeCompare(b.name);
      case 'za': return b.name.localeCompare(a.name);
      default: return 0;
    }
  });

  const isFiltered = searchQuery || selectedSector || minScore > 0;

  if (isFiltered) {
    listBottom.innerHTML = '';
    spotlight.style.display = 'none';
    
    if (combined.length === 0) {
      document.getElementById('no-results').classList.remove('hidden');
    } else {
      document.getElementById('no-results').classList.add('hidden');
      appendStartups(combined, -1);
    }

    btn.style.display = 'none';
    statusEl.style.display = 'none';
    if (showingEl) showingEl.parentElement.style.display = 'none';
  } else {
    document.getElementById('no-results').classList.add('hidden');
    spotlight.style.display = 'flex';
    renderSpotlight(currentSpotlight);
    listBottom.innerHTML = '';
    
    let standardList = [...displayedStartups];
    standardList.sort((a, b) => {
      switch (selectedSort) {
        case 'score-desc': return b.votesCount - a.votesCount;
        case 'score-asc': return a.votesCount - b.votesCount;
        case 'az': return a.name.localeCompare(b.name);
        case 'za': return b.name.localeCompare(a.name);
        default: return 0;
      }
    });

    appendStartups(standardList, 0);
    
    btn.style.display = (allStartups.length > 0 || hasNextPage) ? 'flex' : 'none';
    statusEl.style.display = 'block';
    if (showingEl) {
      showingEl.parentElement.style.display = 'block';
      showingEl.textContent = `1-${displayedStartups.length + 1}`;
    }
    if (totalEl) {
      totalEl.textContent = hasNextPage ? '50+' : (displayedStartups.length + allStartups.length + 1);
    }

    if (heroTotalEl) {
      heroTotalEl.textContent = hasNextPage ? '50+' : (displayedStartups.length + allStartups.length + 1);
    }
    if (heroSubtitleEl) {
      heroSubtitleEl.textContent = hasNextPage ? '50+' : (displayedStartups.length + allStartups.length + 1);
    }
  }

  const savedCount = JSON.parse(localStorage.getItem('savedStartups') || '[]').length;
  if (heroSavedEl) heroSavedEl.textContent = savedCount;

  const allReady = [currentSpotlight, ...displayedStartups, ...allStartups].filter(Boolean);
  if (allReady.length > 0 && heroScoreEl) {
    const topScore = Math.max(...allReady.map(s => s.votesCount || 0));
    heroScoreEl.textContent = topScore;
  }
}

function renderSpotlight(post) {
  if (!post) return;
  const sector = post.topics?.edges[0]?.node.name || 'Other';
  const shortDescription = post.description?.length > 250
      ? post.description.substring(0, 250) + "..."
      : post.description ?? post.tagline ?? '';

  spotlight.innerHTML = `
    <div class="flex-shrink-0 w-[72px] h-[72px] rounded-[14px] border border-white/10 bg-[#242424] overflow-hidden">
      <img src="${post.thumbnail.url}" alt="${post.name}" class="w-full h-full object-cover"/>
    </div>
    <div class="flex flex-col gap-3 flex-1">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-3 text-white flex-wrap">
          <span class="text-lg font-bold tracking-wide">${post.name}</span>
          <div class="border border-[#ff4d00]/40 bg-[#ff4d00]/15 rounded-md px-2.5 py-0.5">
            <span class="text-[#ff6a20] text-[10px] font-semibold tracking-widest uppercase">#1 Today</span>
          </div>
          <span class="bg-violet-50 text-violet-600 border border-violet-200 rounded-full px-2.5 py-0.5 font-medium text-[10px]">
            ${sector}
          </span>
        </div>
        <p class="text-white/35 text-[11px] font-medium tracking-wide">
          Founded by <span class="text-white/55">${post.user.name}</span>
        </p>
      </div>
      <p class="text-white/55 text-sm leading-relaxed max-w-[900px]">${shortDescription}</p>
      <div class="flex items-center gap-2 flex-wrap">
        <div class="flex items-center gap-1.5 bg-[#ff4d00]/10 border border-[#ff4d00]/30 rounded-lg px-3 py-1.5">
          <span class="text-white/35 text-[10px] font-medium tracking-widest uppercase">Score:</span>
          <span class="text-[#ff6a20] text-xs font-semibold">${post.votesCount}</span>
        </div>
        <div class="flex items-center gap-1.5 bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5">
          <span class="text-white/35 text-[10px] font-medium tracking-widest uppercase">Comments:</span>
          <span class="text-white/80 text-xs font-semibold">${post.commentsCount}</span>
        </div>
      </div>
    </div>
    <div class="flex gap-3 items-center flex-shrink-0 self-center">
      <button onclick="window.toggleSave('${post.id}')" class="save-btn-${post.id} flex items-center gap-1.5 bg-transparent text-white/65 hover:text-white text-sm font-medium px-5 py-2.5 rounded-xl border border-white/[0.12] hover:border-white/30 cursor-pointer transition-colors">
        <i class="${isSaved(post.id) ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i> ${isSaved(post.id) ? 'Saved' : 'Save'}
      </button>
      <a href="${post.url}" class="bg-[#FF3800] hover:bg-[#ff5520] text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer transition-colors">
        View Details →
      </a>
    </div>
  `;
}

function appendStartups(posts, rankStart = 0) {
  listBottom.insertAdjacentHTML('beforeend', posts.map((post, index) => `
    <div class="card bg-white rounded-xl border border-gray-200 px-6 py-5 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
      <div class="text-gray-400 font-bold w-6 shrink-0 text-base text-center">#${rankStart + index + 2}</div>
      <div class="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shrink-0">
        <img src="${post.thumbnail.url}" alt="${post.name}" class="w-full h-full object-cover">
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap mb-0.5">
          <span class="font-bold text-gray-900 text-base">${post.name}</span>
          ${post.commentsCount >= 20 ? `<span class="text-[10px] bg-orange-50 text-orange-500 border border-orange-200 rounded-full px-2 py-0.5 font-semibold tracking-wide uppercase"><i class="fa-solid fa-fire"></i> Trending</span>` : ''}
        </div>
        <p class="text-[11px] text-gray-400 font-medium mb-1.5">Founded by <span class="text-gray-600 font-semibold">${post.user.name}</span></p>
        <p class="text-gray-500 text-sm mb-2">${post.description ?? post.tagline ?? ''}</p>
        <div class="flex items-center gap-2.5 text-xs text-gray-400 flex-wrap">
          <span class="bg-violet-50 text-violet-600 border border-violet-200 rounded-full px-2.5 py-0.5 font-medium">${post.topics?.edges[0]?.node.name || 'Other'}</span>
          <span class="flex items-center gap-1 text-orange-500 font-semibold"><i class="fa-solid fa-angles-up text-[10px]"></i> ${post.votesCount}</span>
          <span class="flex items-center gap-1 text-gray-500 font-semibold"><i class="fa-regular fa-comment text-[10px]"></i> ${post.commentsCount}</span>
          <span class="text-gray-300">·</span>
          <span class="text-gray-400">${new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button onclick="window.toggleSave('${post.id}')" class="save-btn-${post.id} flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-xs font-semibold px-3.5 py-2 rounded-lg border border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50 transition-all cursor-pointer">
          <i class="${isSaved(post.id) ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i><span>${isSaved(post.id) ? 'Saved' : 'Save'}</span>
        </button>
        <a href="${post.url}" target="_blank" class="flex items-center gap-1.5 text-white text-xs font-semibold px-3.5 py-2 rounded-lg bg-gray-900 hover:bg-gray-700 transition-all cursor-pointer">View Details <i class="fa-solid fa-arrow-right text-[10px]"></i></a>
      </div>
    </div>
  `).join(''));
}

initDashboard();

function populateSectors(posts) {  
  const currentSelection = selectedSector;
  const sectors = new Set();
  
  posts.forEach(post => {
    if (post && post.topics) {
      post.topics.edges.forEach(edge => {
        sectors.add(edge.node.name);
      });
    }
  });

  const sortedSectors = Array.from(sectors).sort();
  
  sectorFilter.innerHTML = '<option value="">All Sectors</option>' + 
    sortedSectors.map(s => `<option value="${s}" ${s === currentSelection ? 'selected' : ''}>${s}</option>`).join('');
}
window.toggleSave = function(postId) {
  const saved = JSON.parse(localStorage.getItem('savedStartups') || '[]');
  const idx = saved.findIndex(s => s.id === postId);
  
  if (idx > -1) {
    saved.splice(idx, 1);
  } else {
    const all = [currentSpotlight, ...displayedStartups, ...allStartups].filter(Boolean);
    const startup = all.find(s => s.id === postId);
    if (startup) {
      saved.push(startup);
    }
  }
  
  localStorage.setItem('savedStartups', JSON.stringify(saved));
  updateView();
};