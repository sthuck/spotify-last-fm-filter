import {fetchUserPlaylists} from './apis/spotify-api';
import {debounce, escapeRegExp, getParentItem, writeState} from './utils';

let playlists: SpotifyApi.PlaylistObjectSimplified[] = [];
let allPlaylists: SpotifyApi.PlaylistObjectSimplified[] = [];

const setupSearch = () => {
  const el: HTMLInputElement = document.querySelector('#playlist-search-input');

  const fn = debounce(e => {
    if (el.value) {
      playlists = allPlaylists.filter(p => p.name.search(new RegExp(escapeRegExp(el.value), 'i')) !== -1);
    } else {
      playlists = allPlaylists;
    }
    renderPlaylists();
  }, 250);

  el.addEventListener('keydown', fn);
}

const renderPlaylists = () => {
  const container = document.querySelector('.playlist-picker-grid');
  const html = playlists.map(playlist => {
    return /*html*/`
  <div class="playlist-card mdl-card mdl-shadow--6dp" 
    style="--playlist-img: url(${playlist.images[0]?.url || '/assets/empty-playlist.jpg'})"
    data-playlist-id="${playlist.id}"
  >
    <div class="mdl-card__title mdl-card--expand">
    </div>

    <div class="mdl-card__actions">
      <div class="playlist-card-name">
        ${playlist.name}
      </div>
    </div>
  </div>
`
  }).join('\n')
  container.innerHTML = html;
  componentHandler.upgradeDom();
}

const getPlaylistCard = getParentItem('.playlist-card', '.playlist-picker-grid');

const fadeOutOtherCards = (selectedCard: HTMLElement) => {
  const cards = document.querySelectorAll('.playlist-card');
  cards.forEach(card => {
    if (selectedCard !== card) {
      card.classList.add('fade-out')
    }
  })
}

const handlePlaylistClick = () => {
  const container: HTMLDivElement = document.querySelector('.playlist-picker-grid');
  container.addEventListener('click', (e => {
    const card = getPlaylistCard(e.target as HTMLElement);
    if (card) {
      const playlistId = card.getAttribute('data-playlist-id');
      const playlist = allPlaylists.find(p => p.id === playlistId);
      const {id, images, name} = playlist;
      const statePlaylist = {id, image: images[0]?.url, name};

      writeState({statePlaylist});
      fadeOutOtherCards(card);
      setTimeout(() => location.assign('/set-filter'), 500);
    }
  }));
}
function discoverWeeklyFirst(playlists: SpotifyApi.PlaylistObjectSimplified[]) {
  const index = playlists.findIndex(p => p.name === 'Discover Weekly');
  if (index !== -1) {
    const [item] = playlists.splice(index, 1);
    return [item, ...playlists];
  }
  return playlists;
}

window.addEventListener('load', async () => {
  allPlaylists = playlists = await fetchUserPlaylists().catch((e: XMLHttpRequest) => {
    if (e.status === 401) {
      console.log('not logged in');
      location.assign('/')
    }
    throw e;
  }).then(discoverWeeklyFirst);

  setupSearch();
  renderPlaylists();
  handlePlaylistClick();
});
