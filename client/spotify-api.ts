import { getAccessKey, setAccessKey } from './utils';

const baseAuthUrl = 'https://accounts.spotify.com/authorize';
const spotifyClientId = '825308357c424101971a0797091a8d27';
const response_type = 'token';
const scope = 'playlist-read-private';
const redirect_uri = 'http://localhost:8080/redirect';
const PLAYLIST_PAGE_LIMIT = 50;

export const doSpotifyLogin = () => {
    const params = { client_id: spotifyClientId, scope, redirect_uri, response_type };
    const authUrl = baseAuthUrl + '?' + Object.entries(params).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&')
    window.open(authUrl, 'login', "height=600,width=400")
}

const fetchUserPlaylists = async () => {
    const spotApi = new SpotifyWebApi();
    spotApi.setAccessToken(getAccessKey('spotify'));

    let total: SpotifyApi.PlaylistObjectSimplified[] = [];
    let hasMore = true;
    let offset = 0;
    while (hasMore) {
        const response = await spotApi.getUserPlaylists({ limit: PLAYLIST_PAGE_LIMIT, offset } as any);
        total = total.concat(response.items);
        offset += PLAYLIST_PAGE_LIMIT;
        if (response.total <= offset) {
            hasMore = false;
        }
    }
    console.log(total.map(p => p.name));
}
