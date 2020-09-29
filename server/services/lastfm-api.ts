const key = '120221d36602499e90f2f57785d89310';
const baseApi = 'http://ws.audioscrobbler.com/2.0/';
const secret = process.env.LASTFMKEY;

import axios from 'axios';
import CryptoJS from 'crypto-js';
import {axiosHandler} from '../utils';

interface SessionResponse {session: {subscriber: number, name: string, key: string;};}

export class LastFmApi {
  private sk: string | undefined;

  async getSession(token: string) {
    const method = 'auth.getSession';
    const params = {method, api_key: key, token};
    const api_sig = this.signMethod(params);
    const response = await axios.get<SessionResponse>(baseApi, {params: {...params, api_sig, format: 'json'}, })
      .catch(axiosHandler);
    return response.data;
  }

  async trackInfo(sk: string, track: string, artist: string, username: string,) {
    const method = 'track.getInfo';
    const params = {method, api_key: key, sk, track, artist, username, autocorrect: 1};
    const api_sig = this.signMethod(params);
    const response = await axios.get(baseApi, {params: {...params, api_sig, format: 'json'}, })
      .catch(axiosHandler);
    return response.data;
  }

  async artistInfo(sk: string, artist: string, username: string,) {
    const method = 'artist.getInfo';
    const params = {method, api_key: key, sk, artist, username, autocorrect: 1};
    const api_sig = this.signMethod(params);
    const response = await axios.get(baseApi, {params: {...params, api_sig, format: 'json'}, })
      .catch(axiosHandler);
    return response.data;
  }

  private signMethod(parmas: Record<string, string | number>) {
    const keys = Object.keys(parmas).sort();
    const text = keys.reduce((total, key) => total += (key + parmas[key]), '');
    const signature = CryptoJS.MD5(text + secret).toString();
    return signature;
  }
}

