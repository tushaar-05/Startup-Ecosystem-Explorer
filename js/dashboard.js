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

  renderSpotlight(posts[0]);
}

function renderSpotlight(post) {
  const spotlight = document.getElementById('spotlight');
  if (!spotlight || !post) return;

  const {
    name = "Untitled",
    description = "",
    votesCount = 0,
    commentsCount = 0,
    thumbnail,
    user,
    topics
  } = post;

  const thumbnailUrl = thumbnail?.url || "https://via.placeholder.com/72";
  const founderName = user?.name || "Unknown";
  const sector = topics?.edges?.[0]?.node?.name ?? "General";

  const shortDescription =
    description.length > 200
      ? description.substring(0, 200) + "..."
      : description;

  spotlight.innerHTML = `
    <div class="flex-shrink-0 w-[72px] h-[72px] rounded-[14px] border border-white/10 bg-[#242424] overflow-hidden">
      <img 
        src="${thumbnailUrl}" 
        alt="${name} Thumbnail" 
        class="w-full h-full object-cover"
      />
    </div>

    <div class="flex flex-col gap-3 flex-1">

      <!-- Title + Tags -->
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-3 text-white flex-wrap">
          ${name}

          <!-- Rank Badge -->
          <div class="border border-[#ff4d00]/40 bg-[#ff4d00]/15 rounded-md px-2.5 py-0.5">
            <span class="text-[#ff6a20] text-[10px] font-semibold tracking-widest uppercase">#1 Today</span>
          </div>

          <!-- Sector Tag -->
          <span class="bg-violet-50 text-violet-600 border border-violet-200 rounded-full px-2.5 py-0.5 font-medium text-[10px]">
            ${sector}
          </span>
        </div>

        <p class="text-white/35 text-[11px] font-medium tracking-wide">
          Founded by <span class="text-white/55">${founderName}</span>
        </p>
      </div>

      <!-- Description -->
      <p class="text-white/55 text-sm leading-relaxed max-w-[900px]">
        ${shortDescription}
      </p>

      <!-- Stats -->
      <div class="flex items-center gap-2 flex-wrap">
        <div class="flex items-center gap-1.5 bg-[#ff4d00]/10 border border-[#ff4d00]/30 rounded-lg px-3 py-1.5">
          <span class="text-white/35 text-[10px] font-medium tracking-widest uppercase">Score:</span>
          <span class="text-[#ff6a20] text-xs font-semibold">${votesCount}</span>
        </div>

        <div class="flex items-center gap-1.5 bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5">
          <span class="text-white/35 text-[10px] font-medium tracking-widest uppercase">Comments:</span>
          <span class="text-white/80 text-xs font-semibold">${commentsCount}</span>
        </div>
      </div>
    </div>

    <!-- Actions -->
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

initDashboard();