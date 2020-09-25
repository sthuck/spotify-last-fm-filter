const key = '120221d36602499e90f2f57785d89310';
const redirect = 'http://localhost:8080/redirect';

export class LastFmApi {

  authRequest() {
    const authUrl = `http://www.last.fm/api/auth/?api_key=${key}&cb=${redirect}`;
    window.open(authUrl, 'lastfmLogin', "height=600,width=400");
  }
}

