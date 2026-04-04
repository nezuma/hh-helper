// src/types/habr-api.ts
export interface HabrAPI {
  checkAuth: () => Promise<{ isAuthorized: boolean }>;
  authenticate: () => Promise<{ success: boolean; message?: string }>;
  fetchVacancies: (page: number, filters?: any) => Promise<any>;
  clearAuth: () => Promise<{ success: boolean }>;
  getCookies: () => Promise<any[]>;
  getProfile: () => Promise<any>;
}

declare global {
  interface Window {
    habrAPI: HabrAPI;
  }
}

export {};
