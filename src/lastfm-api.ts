const key = '4949100205e6e11ef3286487b2d9ede0';
const redirect = 'http://localhost:8080/redirect';
const baseApi = 'http://ws.audioscrobbler.com/2.0/'

export class LastFmApi {
  private token: string | undefined;
  private sk: string | undefined;

  authRequest() {
    const authUrl = `http://www.last.fm/api/auth/?api_key=${key}&cb=${redirect}`;
    window.open(authUrl, 'lastfmLogin', "height=600,width=400");
  }

  setToken(token: string) {
    this.token = token;
    return this;
  }

  setSession(session: string) {
    this.sk = session;
  }

  async getSession() {
    const method = 'auth.getSession';
    const params = { method, api_key: key, token: this.token };
    const api_sig = this.signMethod(params);
    const response = axios.get(baseApi, { params: { ...params, api_sig, format: 'json' }, })
    console.log((await response).data);
  }

  private signMethod(parmas: Record<string, string>) {
    const keys = Object.keys(parmas).sort();
    const text = keys.reduce((total, key) => total += key + parmas[key], '');
    const signature = CryptoJS.MD5(text).toString();
    return signature;
  }
}

