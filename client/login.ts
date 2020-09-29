import {LastFmApi} from './apis/lastfm-api';
import {getAccessKey, setAccessKey, writeState, setSpinner} from './utils';
import {doSpotifyLogin, getUser as getSpotifyUser} from './apis/spotify-api';

interface ServiceConfiguration {
  element: () => HTMLElement,
  isLoggedIn: boolean;
  name: string
  getUserFn: () => Promise<any>
}
let spotifyProfile: SpotifyApi.UserProfileResponse | null;
let lastFmUserName: string;
const lastFmApi = new LastFmApi();

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


const checkLoginStatus = (what: SupportedServices[] = ['lastfm', 'spotify']) => {
  const promises = what.map(async serviceName => {
    const conf = serviceConfigurations[serviceName];
    const hasKey = !!getAccessKey(serviceName);

    if (hasKey) {
      const user = await conf.getUserFn();
      let isLoggedIn = conf.isLoggedIn = !!user;

      if (isLoggedIn) {

        if (serviceName === 'spotify') {
          spotifyProfile = user;
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
    const {display_name: displayName, images, id: spotifyId} = spotifyProfile;
    const profileImg = images[0]?.url;
    writeState({profileImg, spotifyId, displayName, ...(lastFmUserName ? {lastFmUserName} : {})});
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
    setSpinner(lastFmLoginBtn);
    lastFmApi.authRequest();
  });
});

window.addEventListener('message', async (e) => {
  if (e.data.type === 'lastfm') {
    const {session} = await lastFmApi.getSession(e.data.accessCode);
    const {key, name} = session;
    setAccessKey(e.data.type, key);
    lastFmUserName = name;
  } else {
    setAccessKey(e.data.type, e.data.accessCode);
  }
  checkLoginStatus([e.data.type]).then(redirectToAppIfLoggedIn);
});

