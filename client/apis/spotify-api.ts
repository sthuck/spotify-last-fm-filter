import {getAccessKey, setAccessKey, splitToChunks} from '../utils';

const baseAuthUrl = 'https://accounts.spotify.com/authorize';
const spotifyClientId = '825308357c424101971a0797091a8d27';
const response_type = 'token';
const scope = 'playlist-read-private playlist-modify-private playlist-modify-public';
const redirect_uri = 'http://localhost:8080/redirect';
const PLAYLIST_PAGE_LIMIT = 50;

export const doSpotifyLogin = () => {
  const params = {client_id: spotifyClientId, scope, redirect_uri, response_type};
  const authUrl = baseAuthUrl + '?' + Object.entries(params).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&')
  window.open(authUrl, 'login', "height=600,width=400")
}

export const pagination = <R>(fn: (offset: number) => Promise<SpotifyApi.PagingObject<R>>, limit: number) =>
  async () => {
    let total: R[] = [];

    let hasMore = true;
    let offset = 0;

    while (hasMore) {
      const response = await fn(offset);
      total = total.concat(response.items);
      offset += limit;

      if (response.total <= offset) {
        hasMore = false;
      }
    }

    return total;
  }

export const getUser = async () => {
  const spotApi = new SpotifyWebApi();
  spotApi.setAccessToken(getAccessKey('spotify'));
  const user: SpotifyApi.UserProfileResponse | undefined = await spotApi.getMe().catch(e => undefined);
  return user;
}

export const fetchUserPlaylists = async () => {
  const spotApi = new SpotifyWebApi();
  spotApi.setAccessToken(getAccessKey('spotify'));

  const getUserPlaylists = pagination(offset =>
    spotApi.getUserPlaylists({limit: PLAYLIST_PAGE_LIMIT, offset} as any), PLAYLIST_PAGE_LIMIT);
  const playlists = await getUserPlaylists();
  return playlists;
}
export const getPlaylistContent = async (id: string) => {
  const spotApi = new SpotifyWebApi();
  spotApi.setAccessToken(getAccessKey('spotify'));

  const getPlaylistTracks = pagination(offset =>
    spotApi.getPlaylistTracks(id, {fields: 'total,limit,items(track(uri, name,id,show(name),type,artists(name),album(name, images)))', offset, limit: 100}), 100);
  const tracks = await getPlaylistTracks()
  return tracks;
}

export const createPlaylist = async (userId: string, playlistName: string, trackUris: string[]) => {
  const spotApi = new SpotifyWebApi();
  spotApi.setAccessToken(getAccessKey('spotify'));

  const createPlaylistResponse = await spotApi.createPlaylist(userId, {name: playlistName, public: false});
  const playlistId = createPlaylistResponse.id;
  const urisChunks = splitToChunks(trackUris, 100);
  for (const chunk of urisChunks) {
    await spotApi.addTracksToPlaylist(playlistId, undefined, {uris: chunk});
  }
}
