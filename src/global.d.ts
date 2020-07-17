import { AxiosStatic } from "axios";
// import * as React from 'react';
// import * as ReactDOM from 'react-dom';
import MD5 from 'crypto-js/md5';

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
}