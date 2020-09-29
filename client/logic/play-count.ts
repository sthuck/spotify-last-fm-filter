
import {LastFmApi} from '../apis/lastfm-api';
import {getArtist} from './get-artist';
import {isUndefined} from '../utils';
/**
 * wraps the logic in a "session",
 * where we keep cache of artist, and able to return all data collected so far
 */
export interface ArtistsInfo {
  userPlayCount: number | undefined;
}

export interface SongInfo {
  userPlayCount: number | undefined;
  albumImage: string | undefined;
}

export const parseSongArtistInfo = (songInfo: SongInfo, artistInfo: ArtistsInfo): string => {
  if (isUndefined(songInfo.userPlayCount) && isUndefined(artistInfo.userPlayCount)) {
    return `Can't find any data about this track.`
  };
  if (!isUndefined(songInfo.userPlayCount) && isUndefined(artistInfo.userPlayCount)) {
    return `You listened to this track ${songInfo.userPlayCount}`;
  };
  if (isUndefined(songInfo.userPlayCount) && !isUndefined(artistInfo.userPlayCount)) {
    return `You listened to this artist ${artistInfo.userPlayCount}`;
  };
  return `You listened to this track ${songInfo.userPlayCount} times, and to this artist ${artistInfo.userPlayCount} times`;
}

export class PlayCounter {
  private ArtistCache = new Map<string, ArtistsInfo>();
  private SongInfoCache = new Map<string, SongInfo>();
  private lastFmApi = new LastFmApi();

  async getSongInfo(item: SpotifyApi.PlaylistTrackObject, sk: string, lastFmUserName: string) {
    const track = item.track.name;
    const artist = getArtist(item.track);
    const r = await this.lastFmApi.getTrackInfo(sk, track, artist, lastFmUserName).catch(e => {
      console.error(e);
    });
    if (!r) {
      return {userPlayCount: undefined, albumImage: undefined}
    }

    const userPlayCount = parseInt(r.track.userplaycount, 10);
    const albumImage = r.track?.album?.image?.[r.track.album.image.length - 1]["#text"];

    this.SongInfoCache.set(item.track.id, {userPlayCount, albumImage});
    return {userPlayCount, albumImage};
  }

  async getArtistInfo(item: SpotifyApi.PlaylistTrackObject, sk: string, lastFmUserName: string) {
    const artist = getArtist(item.track);

    if (this.ArtistCache.get(artist)) {
      return this.ArtistCache.get(artist);
    }

    const r = await this.lastFmApi.getArtistInfo(sk, artist, lastFmUserName).catch(e => {
      console.error(e);
    })

    if (!r) {
      return {userPlayCount: undefined};
    }

    const userPlayCount = parseInt(r.artist.stats.userplaycount, 10);
    this.ArtistCache.set(artist, {userPlayCount});
    return {userPlayCount};
  }

  returnCollectedData() {
    return {artistCache: this.ArtistCache, songInfoCache: this.SongInfoCache};
  }

}