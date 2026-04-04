// composables/useHabrVacancies.ts
import { ref } from "vue";

// Типизируем основные поля вакансии на основе полученных данных
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
}

export function useHabrVacancies() {
  const vacancies = ref<Vacancy[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchVacancies = async (page: number = 1) => {
    loading.value = true;
    error.value = null;
    try {
      // Используем ваш API URL, но добавляем параметр page
      const response = await fetch(
        `https://career.habr.com/api/frontend/vacancies?sort=relevance&type=all&currency=RUR&page=${page}`,
      );
      if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);
      const data = await response.json();
      // API возвращает объект с полем list
      vacancies.value = data.list || [];
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Неизвестная ошибка";
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  return { vacancies, loading, error, fetchVacancies };
}
