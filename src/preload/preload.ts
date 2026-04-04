// preload.ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("habrAPI", {
  checkAuth: () => ipcRenderer.invoke("habr-check-auth"),
  authenticate: () => ipcRenderer.invoke("habr-authenticate"),
  fetchVacancies: (page: number) =>
    ipcRenderer.invoke("habr-fetch-vacancies", page),
  clearAuth: () => ipcRenderer.invoke("habr-clear-auth"),
  getProfile: () => ipcRenderer.invoke("habr-get-profile"),
});

contextBridge.exposeInMainWorld("electronAPI", {
  checkAuth: () => ipcRenderer.invoke("check-auth"),
});
