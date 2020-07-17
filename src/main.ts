import { LastFmApi } from './lastfm-api';
import { getAccessKey, setAccessKey } from './utils';
import { doSpotifyLogin } from './spotify-api';

(window as any).LastFmApi = LastFmApi;

window.addEventListener('load', () => {
  const spotifyLoginBtn: HTMLButtonElement = document.querySelector('.login-spotify-btn');
  spotifyLoginBtn.addEventListener('click', doSpotifyLogin);
  const lastFmLoginBtn: HTMLButtonElement = document.querySelector('.login-lastfm-btn');
  lastFmLoginBtn.addEventListener('click', () => {
    const lastFmApi = new LastFmApi();
    lastFmApi.authRequest();
  });
});

window.addEventListener('message', (e) => {
  console.log('got messege', e.data);
  setAccessKey(e.data.type, e.data.accessCode);
  if (e.data.type === 'lastfm') {
    const lastFmApi = new LastFmApi();
    lastFmApi.setToken(e.data.accessCode);
    lastFmApi.getSession();
  }
});