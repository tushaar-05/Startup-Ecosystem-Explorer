import { fetchData } from './api.js';

const startupList = document.getElementById('startup-list');
const loading = document.getElementById('loading');

async function initDashboard() {
  loading.classList.remove('hidden');
  startupList.classList.add('hidden');

  const data = await fetchData();

  if (!data) {
    console.log("No data received");
    return;
  }

  loading.classList.add('hidden');
  startupList.classList.remove('hidden');

  const posts = data.posts.edges.map(edge => edge.node);
  // console.log(posts);

  const totalCountEl = document.getElementById('total-count');
  if (totalCountEl) {
    totalCountEl.textContent = data.posts.totalCount || posts.length;
  }
  
  const showingCountEl = document.getElementById('showing-count');
  if (showingCountEl) {
    const defaultShowing = Math.min(10, posts.length);
    showingCountEl.textContent = `1-${defaultShowing}`;
  }

  renderSpotlight(posts[0]);
  renderStartups(posts.slice(1, 10));
}


function renderSpotlight(post) {
  const spotlight = document.getElementById('spotlight');

  const sector = post.topics.edges[0].node.name;

  const shortDescription =
    post.description?.length > 250
      ? post.description.substring(0, 250) + "..."
      : post.description ?? '';

  spotlight.innerHTML = `
    <div class="flex-shrink-0 w-[72px] h-[72px] rounded-[14px] border border-white/10 bg-[#242424] overflow-hidden">
      <img 
        src="${post.thumbnail.url}" 
        alt="${post.name} Thumbnail" 
        class="w-full h-full object-cover"
      />
    </div>

    <div class="flex flex-col gap-3 flex-1">

      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-3 text-white flex-wrap">
          ${post.name ? `<span class="text-lg font-bold tracking-wide">${post.name}</span>` : ''}

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

      <p class="text-white/55 text-sm leading-relaxed max-w-[900px]">
        ${shortDescription}
      </p>

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

      <!-- Save -->
      <button class="save-btn flex items-center gap-1.5 bg-transparent text-white/65 hover:text-white text-sm font-medium px-5 py-2.5 rounded-xl border border-white/[0.12] hover:border-white/30 cursor-pointer transition-colors" style="font-family:'Geist Mono',monospace;">
        <i class="fa-regular fa-bookmark"></i> Save
      </button>

      <!-- Compare -->
      <button 
        class="flex items-center gap-1.5 text-orange-500 hover:text-white text-xs font-semibold px-3.5 py-2 rounded-lg border border-orange-300 hover:border-orange-500 bg-orange-50 hover:bg-[#ff4d00] transition-all cursor-pointer"
        title="Compare"
      >
        <i class="fa-solid fa-code-compare text-[11px]"></i>
        <span>Compare</span>
      </button>

      <!-- View -->
      <button class="bg-[#FF3800] hover:bg-[#ff5520] text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer transition-colors" style="font-family:'TASA Orbiter',sans-serif;">
        View Details →
      </button>

    </div>

  `;
}

function renderStartups(posts) {
  console.log(posts);
  const list = document.getElementById('listBottom');
  list.innerHTML = posts.map((post, index) => `
    <div class="card bg-white rounded-xl border border-gray-200 px-6 py-5 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
      
      <div class="text-gray-400 font-bold w-6 shrink-0 text-base text-center">#${index + 2}</div>

      <div class="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shrink-0">
        <img src="${post.thumbnail.url}" alt="${post.name}" class="w-full h-full object-cover">
      </div>

      <div class="flex-1 min-w-0">
        <!-- Name + Trending badge -->
        <div class="flex items-center gap-2 flex-wrap mb-0.5">
          <span class="font-bold text-gray-900 text-base">${post.name}</span>
          ${post.commentsCount >= 20 ? `
            <span class="text-[10px] bg-orange-50 text-orange-500 border border-orange-200 rounded-full px-2 py-0.5 font-semibold tracking-wide uppercase">
              <i class="fa-solid fa-fire"></i> Trending
            </span>` : ''}
        </div>

        <p class="text-[11px] text-gray-400 font-medium mb-1.5">
          Founded by <span class="text-gray-600 font-semibold">${post.user.name}</span>
        </p>

        <p class="text-gray-500 text-sm mb-2 line-clamp-1">${post.description ?? post.tagline ?? ''}</p>

        <div class="flex items-center gap-2.5 text-xs text-gray-400 flex-wrap">
          <span class="bg-violet-50 text-violet-600 border border-violet-200 rounded-full px-2.5 py-0.5 font-medium">
            ${post.topics.edges[0].node.name}
          </span>
          <span class="flex items-center gap-1 text-orange-500 font-semibold">
            <i class="fa-solid fa-angles-up text-[10px]"></i> ${post.votesCount}
          </span>
          <span class="flex items-center gap-1 text-gray-500 font-semibold">
            <i class="fa-regular fa-comment text-[10px]"></i> ${post.commentsCount}
          </span>
          <span class="text-gray-300">·</span>
          <span class="text-gray-400">${post.createdAt}</span>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <button 
          class="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-xs font-semibold px-3.5 py-2 rounded-lg border border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50 transition-all cursor-pointer"
          title="Save"
        >
          <i class="fa-regular fa-bookmark"></i>
          <span>Save</span>
        </button>

        <button 
          class="flex items-center gap-1.5 text-orange-500 hover:text-white text-xs font-semibold px-3.5 py-2 rounded-lg border border-orange-300 hover:border-orange-500 bg-orange-50 hover:bg-[#ff4d00] transition-all cursor-pointer"
          title="Compare"
        >
          <i class="fa-solid fa-code-compare text-[11px]"></i>
          <span>Compare</span>
        </button>

        <a 
          href="${post.url}" 
          class="flex items-center gap-1.5 text-white text-xs font-semibold px-3.5 py-2 rounded-lg bg-gray-900 hover:bg-gray-700 transition-all cursor-pointer"
          title="View Details"
        >
          View Details
          <i class="fa-solid fa-arrow-right text-[10px]"></i>
        </a>
      </div>

    </div>
  `).join('');
}


initDashboard();