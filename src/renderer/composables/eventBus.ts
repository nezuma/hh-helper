// src/composables/eventBus.ts
import mitt from 'mitt';

// Определяем все возможные события
export type Events = {
  'show-success': string;
  'show-error': string;
  // добавьте другие события по необходимости
};

// Создаем типизированный эмиттер
export const emitter = mitt<Events>();
