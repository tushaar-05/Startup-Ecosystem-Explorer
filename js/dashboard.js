async function fetchNewStoryIds(){
  try{
    const response = await fetch('https://hacker-news.firebaseio.com/v0/newstories.json');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching new story IDs:', error);
    return [];
  }
}
