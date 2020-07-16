
const baseAuthUrl = 'https://accounts.spotify.com/authorize';
const client_id = '825308357c424101971a0797091a8d27';
const response_type = 'token';
const scope = 'playlist-read-private';
const redirect_uri = 'http://192.168.0.99:8080/redirect';
const PLAYLIST_PAGE_LIMIT = 50;

const doSpotifyLogin = () => {
  const params = { client_id, scope, redirect_uri, response_type };
  const authUrl = baseAuthUrl + '?' + Object.entries(params).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&')
  window.open(authUrl, 'login', "height=600,width=400")
}

window.addEventListener('load', () => {
  const btn: HTMLButtonElement = document.querySelector('.login-btn');
  btn.addEventListener('click', doSpotifyLogin)
})

window.addEventListener('message', async (e) => {
  console.log('got messege', e.data)
  const spotApi = new SpotifyWebApi();
  spotApi.setAccessToken(e.data.accessCode);
  let total: SpotifyApi.PlaylistObjectSimplified[] = [];
  let hasMore = true;
  let offset = 0;
  while (hasMore) {
    debugger;
    const response = await spotApi.getUserPlaylists({ limit: PLAYLIST_PAGE_LIMIT, offset } as any);
    total = total.concat(response.items);
    offset += PLAYLIST_PAGE_LIMIT;
    if (response.total <= offset) {
      hasMore = false;
    }
  }
  console.log(total.map(p => p.name));
})