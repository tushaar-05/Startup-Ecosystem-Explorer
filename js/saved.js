const savedList = document.getElementById('saved-list');
const savedCountEl = document.getElementById('saved-count');
const noSavedEl = document.getElementById('no-saved');
const themeToggle = document.getElementById('theme-toggle');

function init() {
  renderSaved();
  initTheme();
}

function renderSaved() {
  const saved = JSON.parse(localStorage.getItem('savedStartups') || '[]');
  
  if (savedCountEl) savedCountEl.textContent = saved.length;
  
  if (saved.length === 0) {
    noSavedEl?.classList.remove('hidden');
    savedList.innerHTML = '';
    return;
  }

  noSavedEl?.classList.add('hidden');
  savedList.innerHTML = saved.map((post, index) => `
    <div class="card bg-white rounded-xl border border-gray-200 px-6 py-5 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
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
          <span class="bg-violet-50 text-violet-600 border border-violet-200 rounded-full px-2.5 py-0.5 font-medium">${post.topics.edges[0]?.node.name || 'Other'}</span>
          <span class="flex items-center gap-1 text-orange-500 font-semibold"><i class="fa-solid fa-angles-up text-[10px]"></i> ${post.votesCount}</span>
          <span class="text-gray-300">·</span>
          <span class="text-gray-400">Added on ${new Date().toLocaleDateString()}</span>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button onclick="removeSaved('${post.id}')" class="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-xs font-semibold px-3.5 py-2 rounded-lg border border-red-100 hover:border-red-200 bg-red-50 hover:bg-red-100 transition-all cursor-pointer">
          <i class="fa-solid fa-trash-can"></i><span>Remove</span>
        </button>
        <a href="${post.url}" target="_blank" class="flex items-center gap-1.5 text-white text-xs font-semibold px-3.5 py-2 rounded-lg bg-gray-900 hover:bg-gray-700 transition-all cursor-pointer">View Site <i class="fa-solid fa-arrow-up-right-from-square text-[10px] ml-1"></i></a>
      </div>
    </div>
  `).join('');
}

window.removeSaved = function(postId) {
  const saved = JSON.parse(localStorage.getItem('savedStartups') || '[]');
  const filtered = saved.filter(s => s.id !== postId);
  localStorage.setItem('savedStartups', JSON.stringify(filtered));
  renderSaved();
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

init();
