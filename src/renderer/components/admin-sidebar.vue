<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const activeTab = ref(window.location.pathname);

const navigateTo = (path: string) => {
  activeTab.value = path;
  router.push(path);
};
</script>

<template>
  <aside class="admin-sidebar">
    <button
      class="sidebar-btn"
      :class="{ active: activeTab === '/admin/main' }"
      @click="navigateTo('/admin/main')"
    >
      <svg
        class="sidebar-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-5v-8H9v8H5a2 2 0 0 1-2-2z" />
      </svg>
      Главная
    </button>

    <button
      class="sidebar-btn"
      :class="{ active: activeTab === '/admin/analytics' }"
      @click="navigateTo('/admin/analytics')"
    >
      <svg
        class="sidebar-icon"
        viewBox="0 0 72 72"
        fill="#fff"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          d="M58.818,13.181C52.725,7.087,44.621,3.73,36.002,3.73C18.208,3.73,3.731,18.207,3.73,36
	c0.001,17.793,14.478,32.27,32.272,32.27c8.619,0,16.723-3.357,22.816-9.453C64.915,52.723,68.271,44.619,68.27,36
	C68.271,27.381,64.914,19.277,58.818,13.181z M53.851,47.952c0.817-3.186,1.319-6.634,1.439-10.245h8.924
	c-0.309,5.214-2.029,10.155-4.976,14.389C58.105,50.524,56.254,49.117,53.851,47.952z M41.529,63.731
	c-1.414,0.279-2.859,0.448-4.324,0.509V46.491c5.469,0.126,10.487,1.1,14.28,2.598C49.451,55.936,45.874,61.251,41.529,63.731z
	 M20.517,49.088c3.887-1.535,9.062-2.518,14.688-2.603v17.764c-1.621-0.045-3.21-0.222-4.752-0.529
	C26.117,61.233,22.548,55.924,20.517,49.088z M12.771,52.083c-2.869-4.13-4.665-9.056-4.984-14.376h8.925
	c0.121,3.61,0.623,7.059,1.44,10.244C15.754,49.113,13.905,50.516,12.771,52.083z M7.737,35.707
	c0.058-5.603,1.753-10.818,4.631-15.194c1.033,1.756,2.944,3.33,5.519,4.618c-0.758,3.3-1.18,6.862-1.201,10.576H7.737z
	 M18.713,37.707h2.607c0.553,0,1-0.447,1-1c0-0.553-0.447-1-1-1h-2.634c0.02-3.42,0.386-6.703,1.046-9.749
	c4.116,1.66,9.492,2.683,15.474,2.767v6.982H26.32c-0.553,0-1,0.447-1,1c0,0.553,0.447,1,1,1h8.885v6.778
	c-5.857,0.082-11.133,1.063-15.215,2.664C19.271,44.21,18.827,41.033,18.713,37.707z M30.452,8.28
	c1.543-0.309,3.132-0.485,4.753-0.53v18.975c-5.774-0.087-11.076-1.119-14.996-2.724C22.175,16.643,25.888,10.897,30.452,8.28z
	 M51.792,24.001c-3.826,1.567-8.972,2.589-14.587,2.718V7.759c1.465,0.061,2.91,0.229,4.325,0.509
	C46.103,10.879,49.823,16.631,51.792,24.001z M37.205,28.72c5.818-0.124,11.043-1.139,15.065-2.762
	c0.66,3.046,1.025,6.329,1.046,9.749H37.205V28.72z M37.205,44.49v-6.783h16.084c-0.114,3.326-0.559,6.504-1.277,9.443
	C48.024,45.587,42.899,44.611,37.205,44.49z M55.315,35.707c-0.021-3.714-0.442-7.276-1.2-10.576
	c2.583-1.293,4.498-2.873,5.529-4.637c2.955,4.486,4.563,9.725,4.618,15.212H55.315z M58.313,18.647
	c-0.542,1.676-2.222,3.228-4.702,4.514c-1.541-5.514-4.04-10.177-7.153-13.435c3.527,1.403,6.768,3.519,9.533,6.284
	C56.826,16.846,57.596,17.73,58.313,18.647z M25.52,9.753c-3.102,3.256-5.591,7.909-7.128,13.408
	c-2.472-1.282-4.149-2.827-4.697-4.497C16.755,14.735,20.828,11.634,25.52,9.753z M14.034,53.768
	c0.792-1.439,2.421-2.765,4.665-3.879c1.552,5.042,3.919,9.311,6.821,12.357C21,60.436,17.054,57.493,14.034,53.768z M46.457,62.273
	c2.914-3.049,5.29-7.327,6.846-12.383c2.25,1.117,3.883,2.448,4.672,3.893c-0.621,0.763-1.281,1.5-1.986,2.205
	C53.224,58.754,49.984,60.87,46.457,62.273z"
        />
      </svg>

      Аналитика
    </button>

    <button
      class="sidebar-btn"
      :class="{ active: activeTab === '/admin/users' }"
      @click="navigateTo('/admin/users')"
    >
      <svg
        class="sidebar-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
        <path d="M17 11a4 4 0 1 0 0-8" />
        <path d="M7 11a4 4 0 1 1 0-8" />
      </svg>
      Пользователи
    </button>

    <button
      class="sidebar-btn"
      :class="{ active: activeTab === '/admin/tariffs' }"
      @click="navigateTo('/admin/tariffs')"
    >
      <svg
        class="sidebar-icon"
        fill="#fff"
        width="800px"
        height="800px"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2ZM8.5,6.5a2,2,0,1,1-2,2A2,2,0,0,1,8.5,6.5Zm.207,10.207a1,1,0,1,1-1.414-1.414l8-8a1,1,0,1,1,1.414,1.414ZM15.5,17.5a2,2,0,1,1,2-2A2,2,0,0,1,15.5,17.5Z"
        />
      </svg>
      Тарифы
    </button>

    <button
      class="sidebar-btn"
      :class="{ active: activeTab === '/admin/tickets' }"
      @click="navigateTo('/admin/tickets')"
    >
      <svg
        class="sidebar-icon"
        width="800px"
        height="800px"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M7 9H17"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
        <path
          d="M7 13H14"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
      Обращения
    </button>

    <button
      class="sidebar-btn"
      :class="{ active: activeTab === '/admin/service' }"
      @click="navigateTo('/admin/service')"
    >
      <svg
        class="sidebar-icon"
        width="800px"
        height="800px"
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <circle cx="8" cy="8" r="1.75" />
        <path
          d="m6.75 1.75-.5 1.5-1.5 1-2-.5-1 2 1.5 1.5v1.5l-1.5 1.5 1 2 2-.5 1.5 1 .5 1.5h2.5l.5-1.5 1.5-1 2 .5 1-2-1.5-1.5v-1.5l1.5-1.5-1-2-2 .5-1.5-1-.5-1.5z"
        />
      </svg>
      Сервисные настройки
    </button>
  </aside>
</template>

<style scoped>
.admin-sidebar {
  width: 260px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  text-align: left;
}

.sidebar-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.sidebar-btn.active {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.sidebar-icon {
  width: 20px;
  height: 20px;
}

@media (max-width: 768px) {
  .admin-sidebar {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .sidebar-btn {
    width: auto;
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }
}
</style>
