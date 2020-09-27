import {LastFmApi} from './lastfm-api';
import {getAccessKey, setAccessKey, writeState} from './utils';
import {doSpotifyLogin, getUser as getSpotifyUser} from './spotify-api';

interface ServiceConfiguration {
  element: () => HTMLElement,
  isLoggedIn: boolean;
  name: string
  getUserFn: () => Promise<any>
}

interface State {
  spotifyProfile: SpotifyApi.UserProfileResponse | null
}

const state: State = {
  spotifyProfile: null
}

const dom = {
  spotifyLoginBtn: () => document.querySelector('.login-spotify-btn') as HTMLButtonElement,
  lastFmLoginBtn: () => document.querySelector('.login-lastfm-btn') as HTMLButtonElement,
}

const serviceConfigurations: Record<SupportedServices, ServiceConfiguration> = {
  lastfm: {element: dom.lastFmLoginBtn, isLoggedIn: false, name: 'Last.FM', getUserFn: () => Promise.resolve({})},
  spotify: {element: dom.spotifyLoginBtn, isLoggedIn: false, name: 'Spotify', getUserFn: getSpotifyUser},
}

const isLoggedInToAll = () => Object.keys(serviceConfigurations)
  .every((serviceName: SupportedServices) => serviceConfigurations[serviceName].isLoggedIn);


const setSpinner = (element: HTMLElement, extraCss: string = '') => {
  element.innerHTML = `<div class="mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active ${extraCss}"></div>`;
  componentHandler.upgradeElement(element.querySelector('.mdl-spinner'));
}

const checkLoginStatus = (what: SupportedServices[] = ['lastfm', 'spotify']) => {
  const promises = what.map(async serviceName => {
    const conf = serviceConfigurations[serviceName];
    const hasKey = !!getAccessKey(serviceName);

    if (hasKey) {
      const user = await conf.getUserFn();
      let isLoggedIn = conf.isLoggedIn = !!user;

      if (isLoggedIn) {

        if (serviceName === 'spotify') {
          state.spotifyProfile = user;
        }

        const [el, name] = [conf.element(), conf.name];
        el.innerHTML = `Logged in to ${name}`
      }
    }
  });
  return Promise.all(promises);
}

const redirectToAppIfLoggedIn = () => {
  if (isLoggedInToAll()) {
    const {display_name, images} = state.spotifyProfile;
    const profileImg = images[0]?.url;
    writeState({profileImg, displayName: display_name});
    location.assign(`/pick-playlist`);
  }
}

window.addEventListener('load', () => {

  checkLoginStatus().then(redirectToAppIfLoggedIn);

  const spotifyLoginBtn = dom.spotifyLoginBtn();
  spotifyLoginBtn.addEventListener('click', () => {
    setSpinner(spotifyLoginBtn);
    doSpotifyLogin();
  });



  const lastFmLoginBtn = dom.lastFmLoginBtn();
  lastFmLoginBtn.addEventListener('click', () => {
    const lastFmApi = new LastFmApi();
    setSpinner(lastFmLoginBtn);
    lastFmApi.authRequest();
  });
});

window.addEventListener('message', (e) => {
  console.log('got messege', e.data);
  setAccessKey(e.data.type, e.data.accessCode);
  checkLoginStatus([e.data.type]).then(redirectToAppIfLoggedIn);
});

