import {ArtistsInfo, SongInfo} from "./play-count";
import {isUndefined} from '../utils';


export const shouldKeepSong = (songThreshold: number, artistThreshold: number) => (artistInfo: ArtistsInfo, songInfo: SongInfo) => {
  if (isUndefined(songInfo.userPlayCount) && isUndefined(artistInfo.userPlayCount)) {
    return true;
  };
  if (!isUndefined(songInfo.userPlayCount) && isUndefined(artistInfo.userPlayCount)) {
    return songInfo.userPlayCount < (songThreshold || Infinity);
  };
  if (isUndefined(songInfo.userPlayCount) && !isUndefined(artistInfo.userPlayCount)) {
    return artistInfo.userPlayCount < (artistThreshold || Infinity);
  };
  return artistInfo.userPlayCount < (artistThreshold || Infinity) && songInfo.userPlayCount < (songThreshold || Infinity);
}