// services/vacancies.service.ts
import { habrAuth } from "./auth-habr.service";

interface Vacancy {
  id: number;
  title: string;
  href: string;
  company: {
    title: string;
    logo?: { src: string };
  };
  salary?: {
    from: number | null;
    to: number | null;
    currency: string | null;
    formatted: string;
  };
  predictedSalary?: {
    from: number;
    to: number;
    currency: string;
    formatted: string;
  };
  locations: { title: string }[] | null;
  skills: { title: string }[];
  remoteWork: boolean;
  publishedDate: { title: string };
  qualification?: string;
  isMarked?: boolean;
}

interface VacanciesResponse {
  list: Vacancy[];
  meta: {
    totalResults: number;
    perPage: number;
    currentPage: number;
    totalPages: number;
  };
}

export class HabrVacanciesService {
  private readonly BASE_URL = "https://career.habr.com/api/frontend/vacancies";

  async fetchVacancies(
    page: number = 1,
    filters?: any,
  ): Promise<VacanciesResponse> {
    const params = new URLSearchParams({
      sort: "relevance",
      type: "all",
      currency: "RUR",
      page: page.toString(),
      ...filters,
    });

    const url = `${this.BASE_URL}?${params.toString()}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Добавляем cookies если есть авторизация
    const cookies = habrAuth.getAuthCookies();
    if (cookies) {
      headers["Cookie"] = cookies;
    }

    const response = await fetch(url, {
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Если не авторизован, очищаем данные и кидаем ошибку
        habrAuth.clearAuth();
        throw new Error("AUTH_REQUIRED");
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Логируем заголовки ответа для отладки
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries()),
    );

    return data;
  }

  async getVacancyDetails(id: number): Promise<any> {
    const url = `https://career.habr.com/api/frontend/vacancies/${id}`;

    const cookies = habrAuth.getAuthCookies();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (cookies) {
      headers["Cookie"] = cookies;
    }

    const response = await fetch(url, {
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}

export const habrVacancies = new HabrVacanciesService();
