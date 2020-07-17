export const setAccessKey = (which: 'spotify' | 'lastfm', key: string) =>
    window.localStorage.setItem(`${which}Key`, key);
export const getAccessKey = (which: 'spotify' | 'lastfm') =>
    window.localStorage.getItem(`${which}Key`);
