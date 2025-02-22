// Base URL for the Jikan API
const BASE_URL = 'https://api.jikan.moe/v4';

// Elements
const searchInput = document.getElementById('search-input');
const typeSelect = document.getElementById('type-select');
const searchBtn = document.getElementById('search-btn');
const resultsContainer = document.getElementById('results');
const topRatedBtn = document.getElementById('top-rated-btn');
const topRatedContainer = document.getElementById('top-rated');

// Function to create a card for each result
function createCard(item, type) {
  const card = document.createElement('div');
  card.className = 'card';

  const image = document.createElement('img');
  image.src = item.images.jpg.image_url;
  image.alt = item.title;

  const content = document.createElement('div');
  content.className = 'card-content';

  const title = document.createElement('h3');
  title.textContent = item.title;

  content.appendChild(title);
  card.appendChild(image);
  card.appendChild(content);

  if (type === 'anime' && item.trailer && item.trailer.youtube_id) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => openModalWithTrailer(item.trailer.youtube_id));
  } else if (type === 'anime') {
    const noTrailerText = document.createElement('p');
    noTrailerText.textContent = 'No trailer available';
    noTrailerText.style.color = 'red';
    noTrailerText.style.fontSize = '0.9rem';
    noTrailerText.style.textAlign = 'center';
    content.appendChild(noTrailerText);
  }

  if (type === 'manga') {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => openMangaModal(item));
  }
  
  return card;
}

// Search function to query anime or manga based on input
async function performSearch() {
  const query = searchInput.value.trim();
  const type = typeSelect.value;

  if (!query) {
    alert('Please enter a search term.');
    return;
  }

  resultsContainer.innerHTML = 'Loading...';

  try {
    const response = await fetch(`${BASE_URL}/${type}?q=${encodeURIComponent(query)}&limit=12`);
    const data = await response.json();

    resultsContainer.innerHTML = '';
    if (data.data && data.data.length > 0) {
      data.data.forEach(item => {
        resultsContainer.appendChild(createCard(item, type));
      });
    } else {
      resultsContainer.textContent = 'No results found.';
    }
  } catch (error) {
    resultsContainer.textContent = 'An error occurred while fetching data.';
    console.error(error);
  }
}

// Load top-rated anime using the API's top endpoint
async function loadTopRated() {
  topRatedContainer.innerHTML = 'Loading...';

  try {
    const response = await fetch(`${BASE_URL}/top/anime?limit=12`);
    const data = await response.json();

    topRatedContainer.innerHTML = '';
    if (data.data && data.data.length > 0) {
      data.data.forEach(item => {
        topRatedContainer.appendChild(createCard(item, 'anime'));
      });
    } else {
      topRatedContainer.textContent = 'No top rated anime found.';
    }
  } catch (error) {
    topRatedContainer.textContent = 'An error occurred while fetching data.';
    console.error(error);
  }
}

// Function to update the trailer in the modal responsively
function updateTrailer(trailerId) {
  const videoContainer = document.getElementById('video-container');
  videoContainer.innerHTML = `
    <div class="video-wrapper">
      <iframe src="https://www.youtube.com/embed/${trailerId}" 
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen>
      </iframe>
    </div>
  `;
}

// Modified modal function to open and display a YouTube trailer
function openModalWithTrailer(trailerId) {
  const modal = document.getElementById('modal');
  if (modal.style.display === 'flex') {
    updateTrailer(trailerId);
  } else {
    updateTrailer(trailerId);
    modal.style.display = 'flex';
  }
}

// Modal function to open and display manga details centered
function openMangaModal(manga) {
  const mangaModal = document.getElementById('manga-modal');
  document.getElementById('manga-title').textContent = manga.title;
  document.getElementById('manga-image').src = manga.images.jpg.image_url;
  document.getElementById('manga-synopsis').textContent = manga.synopsis || 'No synopsis available.';
  document.getElementById('manga-author').textContent = manga.authors?.map(a => a.name).join(', ') || 'Unknown';
  document.getElementById('manga-status').textContent = manga.status || 'Unknown';
  document.getElementById('manga-genres').textContent = manga.genres?.map(g => g.name).join(', ') || 'None';
  document.getElementById('manga-link').href = manga.url;

  mangaModal.style.display = 'flex';
  const modalContent = mangaModal.querySelector('.modal-content');
  modalContent.style.left = '';
  modalContent.style.top = '';
  modalContent.style.position = 'relative';
}

// Close modal events
document.getElementById('close-modal').addEventListener('click', () => {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
  document.getElementById('video-container').innerHTML = '';
});

document.getElementById('close-manga-modal').addEventListener('click', () => {
  document.getElementById('manga-modal').style.display = 'none';
});

// Event Listeners for search and top rated buttons
searchBtn.addEventListener('click', performSearch);
topRatedBtn.addEventListener('click', loadTopRated);
