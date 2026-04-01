import { type App, createApp } from 'vue';
import ErrorNotify from '@/components/error-notify.vue';

export default {
  install(app: App) {
    const notifyInstance = createApp(ErrorNotify);
    const mountPoint = document.createElement('div');
    document.body.appendChild(mountPoint);
    const instance = notifyInstance.mount(mountPoint);

    app.config.globalProperties.$notifyError = (message: string) => {
      instance.show = true;
      instance.message = message;
      setTimeout(() => {
        instance.show = false;
      }, 3000);
    };
  },
};
