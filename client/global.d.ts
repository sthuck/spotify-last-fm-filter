import {AxiosStatic} from "axios";
// import * as React from 'react';
// import * as ReactDOM from 'react-dom';

import SpotifyWebApi from 'spotify-web-api-js';

declare module 'spotify-web-api-js' {
  interface SpotifyWebApiJs {
    getUserPlaylists(
      options?: Object,
    ): Promise<SpotifyApi.ListOfUsersPlaylistsResponse>;
  }
}


declare global {
  var axios: AxiosStatic;
  var SpotifyWebApi: SpotifyWebApi.SpotifyWebApiJsStatic;
  type SupportedServices = 'lastfm' | 'spotify';
  interface State {
    profileImg: string;
    displayName: string;
    statePlaylist: {id: string, name: string, image: string | undefined};
    artistThreshold: number;
    songThreshold: number;
    lastFmUserName: string;
    spotifyId: string;
  }
  interface Window {
    __state: State;
    __baseApi: string;
  }
}
