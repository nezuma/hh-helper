// src/types/electron.d.ts
import "./src/types/habr-api";

export interface ElectronAPI {
  // Авторизация
  checkAuth: () => Promise<{ isAuthorized: boolean }>;
  onHhAuthSuccess: (callback: () => void) => void;
  removeHhAuthListener: () => void;

  // Резюме и автоподъем
  getResumes: () => Promise<{ id: string; title: string; status: string }[]>;
  boostResume: (resumeId: string) => Promise<{ success: boolean }>;
  startAutoBoost: () => Promise<{ success: boolean }>;
  stopAutoBoost: () => Promise<{ success: boolean }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
