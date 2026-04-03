import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  checkAuth: () => ipcRenderer.invoke("check-auth"),
});
