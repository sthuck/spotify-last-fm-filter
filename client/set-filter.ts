import {writeState} from './utils';

window.addEventListener('load', () => {
  setupFilterButton();
});

const setupFilterButton = () => {
  const songInput: HTMLInputElement = document.querySelector('#song-input');
  const artistInput: HTMLInputElement = document.querySelector('#artist-input');
  const filterButton: HTMLButtonElement = document.querySelector('#filter-btn');

  filterButton.addEventListener('click', () => {
    const inputs = [songInput, artistInput];
    if (inputs.every(i => i.validity.valid)) {
      let artistThreshold = artistInput.value ? parseInt(artistInput.value, 10) : undefined;
      let songThreshold = songInput.value ? parseInt(songInput.value, 10) : undefined;
      artistThreshold = Number.isFinite(artistThreshold) ? artistThreshold : undefined;
      songThreshold = Number.isFinite(songThreshold) ? songThreshold : undefined;

      if (artistThreshold || songThreshold) {
        writeState({artistThreshold, songThreshold});
        location.assign('/save')
      }
    }
  });
}