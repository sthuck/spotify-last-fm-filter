const key = '120221d36602499e90f2f57785d89310';
const redirect = 'http://localhost:8080/redirect';
import {getBaseApi} from '../utils';
export type NotError<T> = T extends (LastFmApi.Error | infer R) ? R : never;

export class LastFmApi {

  authRequest() {
    const authUrl = `http://www.last.fm/api/auth/?api_key=${key}&cb=${redirect}`;
    window.open(authUrl, 'lastfmLogin', "height=600,width=400");
  }


  async getSession(token: string): Promise<LastFmApi.SessionResponse> {
    const baseApi = getBaseApi();
    const response = await axios.get(`${baseApi}api/last-fm/session`, {params: {token}});
    return response.data;
  }

  async getTrackInfo(sk: string, track: string, artist: string, username: string) {
    const baseApi = getBaseApi();
    const response = await axios.get(`${baseApi}api/last-fm/track-info`, {params: {sk, track, artist, username}});
    const data: LastFmApi.TrackInfo.Response = response.data;
    if (LastFmApi.isError(data)) {
      throw data;
    }
    return data;
  }

  async getArtistInfo(sk: string, artist: string, username: string) {
    const baseApi = getBaseApi();
    const response = await axios.get(`${baseApi}api/last-fm/artist-info`, {params: {sk, artist, username}});
    const data: LastFmApi.ArtistInfo.Response = response.data;
    if (LastFmApi.isError(data)) {
      throw data;
    }
    return data;
  }
}


export module LastFmApi {
  export interface SessionResponse {session: {subscriber: number, name: string, key: string}}
  export type Error = {error: number, message: string};
  export const isError = (obj: OrError<any>): obj is Error => {
    return (obj as Error).error !== undefined;
  }
  export type OrError<T> = Error | T;

  export namespace TrackInfo {
    export interface Streamable {
      '#text': string;
      fulltrack: string;
    }

    export interface Artist {
      name: string;
      mbid: string;
      url: string;
    }

    export interface Image {
      '#text': string;
      size: string;
    }

    export interface Attr {
      position: string;
    }

    export interface Album {
      artist: string;
      title: string;
      mbid: string;
      url: string;
      image: Image[];
      '@attr': Attr;
    }

    export interface Tag {
      name: string;
      url: string;
    }

    export interface Toptags {
      tag: Tag[];
    }

    export interface Wiki {
      published: string;
      summary: string;
      content: string;
    }

    export interface Track {
      name: string;
      mbid: string;
      url: string;
      duration: string;
      streamable: Streamable;
      listeners: string;
      playcount: string;
      artist: Artist;
      album: Album;
      userplaycount: string;
      userloved: string;
      toptags: Toptags;
      wiki: Wiki;
    }

    export type Response = OrError<{
      track: Track;
    }>
  }
  export namespace ArtistInfo {
    export interface Stats {
      listeners: string;
      playcount: string;
      userplaycount: string;
    }

    export interface Image {
      '#text': string;
      size: string;
    }

    export interface Artist {
      name: string;
      url: string;
      image: Image[];
    }

    export interface Similar {
      artist: Artist[];
    }

    export interface Tag {
      name: string;
      url: string;
    }

    export interface Tags {
      tag: Tag[];
    }

    export interface Link {
      '#text': string;
      rel: string;
      href: string;
    }

    export interface Links {
      link: Link;
    }

    export interface Bio {
      links: Links;
      published: string;
      summary: string;
      content: string;
    }

    export interface ArtistInfo {
      name: string;
      mbid: string;
      url: string;
      image: Image[];
      streamable: string;
      ontour: string;
      stats: Stats;
      similar: Similar;
      tags: Tags;
      bio: Bio;
    }

    export type Response = OrError<{
      artist: ArtistInfo;
    }>
  }
}
