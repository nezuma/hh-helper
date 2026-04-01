import { contextBridge, ipcRenderer } from "electron";

// ЭТОТ API БУДЕТ ДОСТУПЕН В VUE ЧЕРЕЗ window.electronAPI
contextBridge.exposeInMainWorld("electronAPI", {
  // СЮДА ДОБАВИШЬ СВОИ МЕТОДЫ
  ping: () => ipcRenderer.invoke("electron:ping"),
});

// ТИПИЗАЦИЯ ДЛЯ VUE (ОПИСАНА В src/types/electron.d.ts)
