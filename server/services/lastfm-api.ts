const key = '120221d36602499e90f2f57785d89310';
const baseApi = 'http://ws.audioscrobbler.com/2.0/'
const secret = process.env.LASTFMKEY;

import axios from 'axios';
import CryptoJS from 'crypto-js';

interface SessionResponse {session: {subscriber: number, name: string, key: string}}

export class LastFmApi {
  private sk: string | undefined;

  async getSession(token: string) {
    const method = 'auth.getSession';
    const params = {method, api_key: key, token};
    const api_sig = this.signMethod(params);
    const response = await axios.get<SessionResponse>(baseApi, {params: {...params, api_sig, format: 'json'}, })
    return response.data;
  }

  private signMethod(parmas: Record<string, string>) {
    const keys = Object.keys(parmas).sort();
    const text = keys.reduce((total, key) => total += (key + parmas[key]), '');
    const signature = CryptoJS.MD5(text + secret).toString();
    return signature;
  }
}

