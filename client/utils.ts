export const setAccessKey = (which: SupportedServices, key: string) =>
  window.localStorage.setItem(`${which}Key`, key);

export const getAccessKey = (which: SupportedServices) =>
  window.localStorage.getItem(`${which}Key`);

export function debounce(func: Function, wait: number) {
  let timeout: number
  return function () {
    var context = this, args = arguments;
    var later = function () {
      timeout = null;
      func.apply(context, args);
    };
    window.clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
  };
};

export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const encodeJsonBase64 = (obj: any) => {
  return btoa(JSON.stringify(obj));
}

// export const decodeJsonBase64 = (s: string) => {
//   return JSON.parse(atob(s));
// }

export const writeState = (updatedState: Partial<State>) => {
  const merged = {...getState(), ...updatedState};
  const stateStr = encodeJsonBase64(merged);
  document.cookie = `state=${stateStr};samesite=strict;path=/;max-age=${60 * 60 * 1000}`
}

export const getState = () => {
  return window.__state;
}