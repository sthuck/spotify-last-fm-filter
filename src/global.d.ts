import { AxiosStatic } from "axios";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import SpotifyWebApi from 'spotify-web-api-js';

declare global {
    var axios: AxiosStatic;
    var SpotifyWebApi: SpotifyWebApi.SpotifyWebApiJsStatic;
}