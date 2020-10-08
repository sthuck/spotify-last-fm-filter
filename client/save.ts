import {createPlaylist, getPlaylistContent} from './apis/spotify-api';
import {getAccessKey, getParentItem, getState, setSpinner, splitToChunks} from './utils';
import {parseSongArtistInfo, PlayCounter} from './logic/play-count';
import {getArtist, getSmallestImage} from './logic/get-artist';
import {shouldKeepSong as shouldKeepSongFactory} from './logic/should-keep-song';

const playCounter = new PlayCounter();
let shouldKeepSong: ReturnType<typeof shouldKeepSongFactory>;

const pageState = new Map<string, boolean>();
let validTracksCount = 0;

const validSongHtml = `<a class="mdl-list__item-secondary-action"><i class="material-icons valid-icon">check_circle_outline</i></a>`
const filterSongHtml = `<a class="mdl-list__item-secondary-action"><i class="material-icons">remove_circle_outline</i></a>`

const renderTrack = (index: number, id: string, songName: string, artist: string, albumImage: string) => {
  // return /* html */`
  // <li class="mdl-list__item mdl-list__item--three-line playlist-track" data-song-id="${id}">
  //   <span class="mdl-list__item-primary-content">
  //       <div class="mdl-list__item-avatar">
  //         ${albumImage ? `<img class="album-image" src="${albumImage}">` : ''} 
  //       </div>
  //       <span>${artist} - ${songName}</span>
  //     <span class="mdl-list__item-text-body listen-count">...</span>
  //   </span>
  //   <span class="mdl-list__item-secondary-content filter-btn" data-song-id="${id}">
  //   </span>
  // </li>
  // `
  return /* html */`
  <li class="playlist-track row" data-song-id="${id}">
    <img class="playlist-track--album-image" src="${albumImage || ''}">
    <div class="column grow"> 
      <div class="playlist-track--name">${artist} - ${songName}</div>
      <div datahook-id="listen-count" class="playlist-track--listen-count">...</div>
    </div>
    <div datahook-id="filter-btn" class="filter-btn" data-song-id="${id}"></div>
  </li>
  `
}
const renderTracks = (songs: SpotifyApi.PlaylistTrackObject[]) => {
  const songListEl = document.querySelector('.song-list-card');
  const html = songs.map((item, index) =>
    renderTrack(index, item.track.id, item.track.name, getArtist(item.track), getSmallestImage(item.track)));
  songListEl.innerHTML = `
  <ul class="song-list mdl-list">
    ${html.join('\n')}
  </ul>
  `
  componentHandler.upgradeDom();
}

const switchSongStatus = (filterBtnElement: HTMLElement) => {
  const songId = filterBtnElement.getAttribute('data-song-id');
  const current = pageState.get(songId);
  const next = !current;
  pageState.set(songId, next);
  validTracksCount = validTracksCount + (next ? 1 : -1);
  filterBtnElement.innerHTML = next ? validSongHtml : filterSongHtml;
  fillStats();
}

const processTrackListenCount = async (item: SpotifyApi.PlaylistTrackObject, sk: string, lastfmUser: string) => {
  const [artistInfo, songInfo] = await Promise.all([
    playCounter.getArtistInfo(item, sk, lastfmUser),
    playCounter.getSongInfo(item, sk, lastfmUser)
  ]);

  const id = item.track.id;
  const domItem = document.querySelector(`[data-song-id="${id}"]`);
  const domListenCount = domItem.querySelector('[datahook-id="listen-count"]');
  domListenCount.innerHTML = parseSongArtistInfo(songInfo, artistInfo);

  const filterBtnDom = domItem.querySelector('[datahook-id="filter-btn"]');
  const keepSong = shouldKeepSong(artistInfo, songInfo);
  pageState.set(item.track.id, keepSong);
  validTracksCount = validTracksCount + (keepSong ? 1 : 0);
  filterBtnDom.innerHTML = keepSong ? validSongHtml : filterSongHtml;
}

const setupFilterButton = () => {
  const getFilterBtn = getParentItem('[datahook-id="filter-btn"]', '.song-list-card');
  const songListEl: HTMLDivElement = document.querySelector('.song-list-card');
  songListEl.addEventListener('click', e => {
    const filterBtnEl = getFilterBtn(e.target as HTMLElement);
    if (filterBtnEl) {
      e.preventDefault();
      switchSongStatus(filterBtnEl);
    }
  });
}

const createNewPlaylistName = (original: string) => {
  return original + ' (new)'
}
const setPostSaveDialog = (dialog: HTMLDialogElement) => {
  dialog.innerHTML =
    `<h4 class="mdl-dialog__title">Playlist saved!</h4>
  <div class="mdl-dialog__content">
    <p>
      Your new playlist was saved, you should see it in spotify. Hoped you had fun using this tool.
      Please report any bugs to <a
        href="https://github.com/sthuck/spotify-last-fm-filter/issues">https://github.com/sthuck/spotify-last-fm-filter/issues</a>
    </p>
  </div>
  <div class="mdl-dialog__actions">
    <button
      type="button"
      class="mdl-button close"
    >Close</button>
  </div>
  `
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
}

const makeSaveActive = (songs: SpotifyApi.PlaylistTrackObject[]) => {
  const saveBtn: HTMLElement = document.querySelector('.save-action');
  saveBtn.classList.add('active');
  const dialog: HTMLDialogElement = document.querySelector('.save-dialog');
  saveBtn.addEventListener('click', async e => {
    const state = getState();
    const {spotifyId} = state;
    const playlistName = createNewPlaylistName(state.statePlaylist.name);
    const uris = songs.filter(item => pageState.get(item.track.id)).map(item => item.track.uri);

    dialog.showModal();
    await createPlaylist(spotifyId, playlistName, uris);
    setPostSaveDialog(dialog)
  });
}

const fillStats = () => {
  const statsEl: HTMLDivElement = document.querySelector('.stats');
  const state = getState();
  const playlistName = createNewPlaylistName(state.statePlaylist.name)
  const totalTracks = pageState.size;
  const valid = validTracksCount;
  statsEl.innerHTML = /*html*/`
  <div class="stats-name">${playlistName}</div>
  <div class="stats-count">${valid}/${totalTracks}</div>`
}

async function main() {
  const state = getState();
  setupFilterButton();
  shouldKeepSong = shouldKeepSongFactory(state.songThreshold, state.artistThreshold);

  const songListEl: HTMLDivElement = document.querySelector('.song-list-card');
  const statsEl: HTMLDivElement = document.querySelector('.stats');

  setSpinner(songListEl);
  setSpinner(statsEl);
  const songs = await getPlaylistContent(state.statePlaylist.id).catch((e: XMLHttpRequest) => {
    if (e.status === 401) {
      console.log('not logged in');
      location.assign('/')
    }
    throw e;
  });

  renderTracks(songs);
  console.log(songs);
  const sk = getAccessKey('lastfm');

  const songsChunks = splitToChunks(songs, 3);
  for (const items of songsChunks) {
    await Promise.all(items.map(item => processTrackListenCount(item, sk, state.lastFmUserName)));
    fillStats();
  }
  makeSaveActive(songs);
}

window.addEventListener('load', main);