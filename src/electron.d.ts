export interface ElectronAPI {
  ping: () => Promise<string>;
  // СЮДА ДОБАВИШЬ ВСЕ СВОИ МЕТОДЫ
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
