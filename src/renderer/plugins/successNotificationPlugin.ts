import { type App, createApp } from 'vue';
import SuccessNotify from '@/components/success-notify.vue';

export default {
  install(app: App) {
    const notifyInstance = createApp(SuccessNotify);
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
