export function delCookie(name: string): void {
  document.cookie = `${name}=; expires=Tue, 01 Jan 1970 00:00:00 GMT; path=/;`;
}
