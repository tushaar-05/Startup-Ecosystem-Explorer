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
}
