export const getArtist = (track: SpotifyApi.TrackObjectFull | SpotifyApi.EpisodeObjectFull) => {
  if (track.type === 'track') {
    return track.artists[0].name;
  }
  return track.show.name;
}
export const getSmallestImage = (track: SpotifyApi.TrackObjectFull | SpotifyApi.EpisodeObjectFull) => {
  if (track.type === 'track') {
    const images = track.album.images;
    return images.length ? images[images.length - 1]?.url : undefined;
  }
  const images = track.show.images;
  return images.length ? images[images.length - 1]?.url : undefined;
}
