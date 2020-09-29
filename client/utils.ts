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
  console.log('write state call', updatedState);
  const merged = {...getState(), ...updatedState};
  console.log('merged', merged);
  const stateStr = encodeJsonBase64(merged);
  document.cookie = `state=${stateStr};samesite=strict;path=/;max-age=${60 * 60 * 1000}`
}

export const getState = () => {
  return window.__state;
}
export const getBaseApi = () => {
  return window.__baseApi;
}

export const setSpinner = (element: HTMLElement, extraCss: string = '') => {
  element.innerHTML = `<div class="mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active ${extraCss}"></div>`;
  componentHandler.upgradeElement(element.querySelector('.mdl-spinner'));
}

export const splitToChunks = <T>(array: T[], chunkSize: number) => {
  const result: T[][] = [];
  let current = 0;
  while (current < array.length) {
    const chunk = array.slice(current, current + chunkSize);
    result.push(chunk);
    current += chunkSize;
  }
  return result;
}
export const isUndefined = <T>(obj: T | undefined): obj is undefined => obj === undefined;

export const getParentItem = (parentSelector: string, limitSelector = 'body') => (childElement: HTMLElement) => {
  let current = childElement;

  while (current) {
    if (current.matches(limitSelector)) {
      return undefined;
    }
    if (current.matches(parentSelector)) {
      return current;
    }
    current = current.parentElement;
  }
};
