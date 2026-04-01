// ЭТОТ ФАЙЛ - ЕДИНСТВЕННОЕ МЕСТО, ГДЕ ТЫ РАБОТАЕШЬ С ELECTRON API
// ВСЯ ЛОГИКА ВЗАИМОДЕЙСТВИЯ С ELECTRON ТОЛЬКО ТУТ

export function useElectron() {
  const testConnection = async (): Promise<string> => {
    try {
      // ПРОВЕРЯЕМ, ЧТО API ДОСТУПЕН
      if (!window.electronAPI) {
        throw new Error("Electron API не доступен");
      }

      const response = await window.electronAPI.ping();
      return `Electron работает: ${response}`;
    } catch (error) {
      console.error("Ошибка при тестировании:", error);
      return `Ошибка: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`;
    }
  };

  // СЮДА ДОБАВИШЬ ВСЕ СВОИ МЕТОДЫ ДЛЯ РАБОТЫ С СЕРВЕРОМ
  // startServer, stopServer, getStatus и т.д.

  return {
    testConnection,
  };
}
