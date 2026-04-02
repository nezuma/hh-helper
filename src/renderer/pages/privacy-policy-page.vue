<!-- src/renderer/views/PrivacyPolicyView.vue -->
<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();
const currentDate = new Date().toLocaleDateString("ru-RU");

const goToHome = () => {
  router.push("/");
};
</script>

<template>
  <div class="privacy-policy-view">
    <header class="header">
      <div class="header-left">
        <button class="back-btn" @click="goToHome">
          <svg
            class="home-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-5v-8H9v8H5a2 2 0 0 1-2-2z"
            />
          </svg>
        </button>
        <h1 class="logo">HH Helper</h1>
      </div>
    </header>

    <div class="policy-container">
      <div class="policy-card">
        <h1 class="policy-title">Политика обработки персональных данных</h1>
        <p class="policy-date">Дата последнего обновления: {{ currentDate }}</p>

        <div class="policy-content">
          <section>
            <h2>1. Общие положения</h2>
            <p>
              Настоящая политика обработки персональных данных составлена в
              соответствии с требованиями Федерального закона от 27.07.2006 №
              152-ФЗ «О персональных данных» и определяет порядок обработки
              персональных данных и меры по обеспечению безопасности
              персональных данных, предпринимаемые HH Helper (далее — Оператор).
            </p>
            <p>
              Оператор ставит своей важнейшей целью и условием осуществления
              своей деятельности соблюдение прав и свобод человека и гражданина
              при обработке его персональных данных, в том числе защиты прав на
              неприкосновенность частной жизни, личную и семейную тайну.
            </p>
          </section>

          <section>
            <h2>2. Основные понятия</h2>
            <ul>
              <li>
                <strong>Персональные данные</strong> — любая информация,
                относящаяся прямо или косвенно к определенному или определяемому
                Пользователю сайта;
              </li>
              <li>
                <strong>Обработка персональных данных</strong> — любое действие
                (операция) или совокупность действий (операций), совершаемых с
                использованием средств автоматизации или без использования таких
                средств с персональными данными;
              </li>
              <li>
                <strong
                  >Автоматизированная обработка персональных данных</strong
                >
                — обработка персональных данных с помощью средств вычислительной
                техники;
              </li>
              <li>
                <strong>Пользователь</strong> — посетитель сайта, который
                принимает настоящую Политику;
              </li>
              <li>
                <strong>Cookie</strong> — небольшой фрагмент данных,
                отправленный веб-сервером и хранимый на компьютере Пользователя.
              </li>
            </ul>
          </section>

          <section>
            <h2>3. Какие данные мы собираем</h2>
            <p>
              Оператор может собирать следующие персональные данные
              Пользователя:
            </p>
            <ul>
              <li>Адрес электронной почты (email);</li>
              <li>Логин и пароль (в зашифрованном виде);</li>
              <li>Имя и фамилия (по желанию);</li>
              <li>Данные аккаунта hh.ru (при авторизации через API);</li>
              <li>
                Техническая информация: IP-адрес, тип браузера, данные о
                посещениях.
              </li>
            </ul>
          </section>

          <section>
            <h2>4. Цели обработки персональных данных</h2>
            <ul>
              <li>
                Предоставление доступа Пользователю к функционалу сервиса;
              </li>
              <li>Автоматизация поиска работы и откликов на вакансии;</li>
              <li>Обработка входящих запросов и поддержка Пользователей;</li>
              <li>Улучшение качества работы сервиса и аналитика;</li>
              <li>Выполнение требований законодательства РФ.</li>
            </ul>
          </section>

          <section>
            <h2>5. Правовые основания обработки</h2>
            <p>
              Оператор обрабатывает персональные данные Пользователя только в
              случае их заполнения и/или отправки Пользователем самостоятельно
              через специальные формы. Заполняя соответствующие формы и/или
              отправляя свои персональные данные Оператору, Пользователь
              выражает свое согласие с данной Политикой.
            </p>
            <p>
              Оператор обрабатывает обезличенные данные о Пользователе в случае,
              если это разрешено в настройках браузера Пользователя (включено
              сохранение файлов «cookie» и использование технологии JavaScript).
            </p>
          </section>

          <section>
            <h2>6. Хранение и защита данных</h2>
            <p>
              Оператор обеспечивает хранение персональных данных в соответствии
              с внутренними регламентами и законодательством РФ. Срок хранения
              персональных данных соответствует сроку действия аккаунта
              Пользователя либо до момента отзыва согласия на обработку данных.
            </p>
            <p>Оператор принимает следующие меры для защиты данных:</p>
            <ul>
              <li>Шифрование паролей и чувствительной информации;</li>
              <li>Регулярное обновление программного обеспечения;</li>
              <li>Ограничение доступа к персональным данным сотрудников;</li>
              <li>
                Использование защищенных протоколов передачи данных (HTTPS).
              </li>
            </ul>
          </section>

          <section>
            <h2>7. Передача данных третьим лицам</h2>
            <p>
              Оператор не передает персональные данные третьим лицам, за
              исключением случаев, предусмотренных законодательством РФ:
            </p>
            <ul>
              <li>
                По требованию правоохранительных органов в установленном законом
                порядке;
              </li>
              <li>
                Для выполнения обязательств перед Пользователем (например,
                отправка email-уведомлений через почтовые сервисы);
              </li>
              <li>
                При передаче данных hh.ru в рамках работы API (с согласия
                Пользователя).
              </li>
            </ul>
          </section>

          <section>
            <h2>8. Права Пользователя</h2>
            <p>Пользователь имеет право:</p>
            <ul>
              <li>Получить информацию о том, какие его данные хранятся;</li>
              <li>
                Требовать удаления или исправления своих персональных данных;
              </li>
              <li>Отозвать согласие на обработку персональных данных;</li>
              <li>Подать жалобу в уполномоченный орган (Роскомнадзор).</li>
            </ul>
            <p>
              Для реализации своих прав Пользователь может направить запрос на
              адрес электронной почты: <strong>privacy@hh-helper.ru</strong>
            </p>
          </section>

          <section>
            <h2>9. Изменение политики</h2>
            <p>
              Оператор имеет право вносить изменения в настоящую Политику без
              предварительного уведомления Пользователя. Новая версия Политики
              вступает в силу с момента ее размещения на сайте, если иное не
              предусмотрено новой версией Политики. Актуальная версия Политики
              всегда доступна по адресу /privacy-policy.
            </p>
          </section>

          <section>
            <h2>10. Контактная информация</h2>
            <p>
              По всем вопросам, связанным с обработкой персональных данных,
              Пользователь может обратиться к Оператору:
            </p>
            <ul>
              <li>Email: <strong>support@hh-helper.ru</strong></li>
              <li>Telegram: <strong>@hh_helper_support</strong></li>
            </ul>
          </section>
        </div>

        <div class="policy-footer">
          <p>© 2024 HH Helper. Все права защищены.</p>
          <button class="accept-btn" @click="goToHome">
            Вернуться на главную
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.privacy-policy-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
}

.header {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.home-icon {
  width: 20px;
  height: 20px;
  color: white;
}

.logo {
  font-size: 24px;
  font-weight: 600;
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.policy-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 60px 40px;
}

.policy-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 48px;
  animation: fadeIn 0.3s ease;
}

.policy-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin-bottom: 16px;
  text-align: center;
  background: linear-gradient(135deg, #fff, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.policy-date {
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.policy-content {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.policy-content section {
  margin-bottom: 32px;
}

.policy-content h2 {
  font-size: 22px;
  font-weight: 600;
  color: #60a5fa;
  margin-bottom: 16px;
}

.policy-content p {
  margin-bottom: 12px;
  font-size: 15px;
}

.policy-content ul {
  margin: 12px 0;
  padding-left: 24px;
}

.policy-content li {
  margin-bottom: 8px;
  font-size: 15px;
}

.policy-content strong {
  color: #60a5fa;
}

.policy-footer {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.policy-footer p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 20px;
}

.accept-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.accept-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .header {
    padding: 16px 20px;
  }

  .policy-container {
    padding: 40px 20px;
  }

  .policy-card {
    padding: 28px 20px;
  }

  .policy-title {
    font-size: 24px;
  }

  .policy-content h2 {
    font-size: 18px;
  }

  .policy-content p,
  .policy-content li {
    font-size: 14px;
  }
}
</style>
