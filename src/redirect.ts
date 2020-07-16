window.addEventListener('load', () => {
    const hash = location.hash;
    const accessCode = hash.split('&')[0].split('=')[1];
    window.opener.postMessage({ type: 'spotify', accessCode });
    window.close();
})