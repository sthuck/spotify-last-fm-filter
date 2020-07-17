window.addEventListener('load', () => {
  if (location.search.includes('token')) {
    //lastfm
    const accessCode = location.search.replace('?', '').split('=')[1];
    window.opener.postMessage({ type: 'lastfm', accessCode });
  } else {
    //spotify
    const hash = location.hash;
    const accessCode = hash.split('&')[0].split('=')[1];
    window.opener.postMessage({ type: 'spotify', accessCode });
  }
  window.close();
});