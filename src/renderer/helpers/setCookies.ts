export const setCookie = (name: string, value: string, time?: number): void => {
  let expires = "";
  if (time) {
    const date = new Date();
    date.setTime(date.getTime() + time);
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value}${expires}; path=/`;
};
