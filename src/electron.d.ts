// src/types/electron.d.ts
export interface ElectronAPI {
  fetchNegotiations: () => Promise<{ success: boolean; html: string }>;
  openHhAuth: () => Promise<{ success: boolean; message?: string }>;
  checkAuth: () => Promise<{ isAuthorized: boolean }>;
  onHhAuthSuccess: (callback: () => void) => void;
  removeHhAuthListener: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
