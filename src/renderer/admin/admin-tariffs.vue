<!-- src/renderer/views/admin/AdminTariffsView.vue -->
<script setup lang="ts">
import { ref, computed } from "vue";
import ProfileHeaderWithHouse from "../components/profile-header-with-house.vue";
import { useNotification } from "../composables/eventBus";
import AdminSidebar from "../components/admin-sidebar.vue";

const { showSuccess, showError } = useNotification();
const searchQuery = ref("");
const showCreateModal = ref(false);
const showEditModal = ref(false);
const selectedTariff = ref<any>(null);
const editingTariff = ref<any>(null);

// Хардкодные данные тарифов
const tariffs = ref([
  {
    _id: "1",
    name: "Базовый",
    key: "base",
    price: 0,
    duration: null,
    popular: false,
    features: {
      choose_response: true,
      main_page: true,
      activate_bot: true,
      autoresponse: false,
      autoboost_vacancy: false,
      priority_help: false,
    },
  },
  {
    _id: "2",
    name: "Расширенный",
    key: "advanced",
    price: 499,
    duration: "30 дней",
    popular: true,
    features: {
      choose_response: true,
      main_page: true,
      activate_bot: true,
      autoresponse: true,
      autoboost_vacancy: false,
      priority_help: false,
    },
  },
  {
    _id: "3",
    name: "Премиум",
    key: "premium",
    price: 999,
    duration: "30 дней",
    popular: false,
    features: {
      choose_response: true,
      main_page: true,
      activate_bot: true,
      autoresponse: true,
      autoboost_vacancy: true,
      priority_help: true,
    },
  },
]);

const newTariff = ref({
  name: "",
  key: "base",
  price: 0,
  duration: null,
  popular: false,
  features: {
    choose_response: false,
    main_page: false,
    activate_bot: false,
    autoresponse: false,
    autoboost_vacancy: false,
    priority_help: false,
  },
});

const filteredTariffs = computed(() => {
  if (!searchQuery.value) return tariffs.value;
  return tariffs.value.filter((tariff: any) =>
    tariff.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

const createTariff = () => {
  if (!newTariff.value.name) {
    showError("Введите название тарифа");
    return;
  }

  const newId = String(Date.now());
  tariffs.value.push({
    ...newTariff.value,
    _id: newId,
    key: newTariff.value.key,
  });

  showSuccess(`Тариф "${newTariff.value.name}" создан`);
  showCreateModal.value = false;
  resetNewTariff();
};

const resetNewTariff = () => {
  newTariff.value = {
    name: "",
    key: "base",
    price: 0,
    duration: null,
    popular: false,
    features: {
      choose_response: false,
      main_page: false,
      activate_bot: false,
      autoresponse: false,
      autoboost_vacancy: false,
      priority_help: false,
    },
  };
};

const openEditModal = (tariff: any) => {
  selectedTariff.value = tariff;
  editingTariff.value = JSON.parse(JSON.stringify(tariff));
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  selectedTariff.value = null;
  editingTariff.value = null;
};

const saveTariffChanges = () => {
  const index = tariffs.value.findIndex(
    (t) => t._id === selectedTariff.value._id,
  );
  if (index !== -1) {
    tariffs.value[index] = { ...editingTariff.value };
    showSuccess(`Тариф "${editingTariff.value.name}" обновлен`);
    closeEditModal();
  }
};

const deleteTariff = (tariffId: string, tariffName: string) => {
  if (confirm(`Вы уверены, что хотите удалить тариф "${tariffName}"?`)) {
    const index = tariffs.value.findIndex((t) => t._id === tariffId);
    if (index !== -1) {
      tariffs.value.splice(index, 1);
      showSuccess(`Тариф "${tariffName}" удален`);
    }
  }
};

const getPriceDisplay = (price: number) => {
  if (price === 0) return "Бесплатно";
  return `${price} ₽`;
};

const getDurationDisplay = (duration: string | null) => {
  if (!duration) return "Бессрочно";
  return duration;
};
</script>

<template>
  <div class="admin-tariffs">
    <ProfileHeaderWithHouse />

    <div class="admin-container">
      <AdminSidebar />

      <main class="tariffs-content">
        <div class="tariffs-header">
          <h1 class="tariffs-title">Управление тарифами</h1>
          <div class="actions-section">
            <div class="search-wrapper">
              <svg
                class="search-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Поиск по названию..."
                class="search-input"
              />
            </div>
            <button class="create-btn" @click="showCreateModal = true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Создать тариф
            </button>
          </div>
        </div>

        <div class="tariffs-list">
          <div v-if="filteredTariffs.length === 0" class="empty-state">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
              />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <p>Тарифы не найдены</p>
          </div>
          <div v-else class="tariffs-grid">
            <div
              v-for="tariff in filteredTariffs"
              :key="tariff._id"
              class="tariff-card"
              :class="{ popular: tariff.popular }"
            >
              <div v-if="tariff.popular" class="popular-badge">Популярный</div>
              <div class="tariff-card-header">
                <h3 class="tariff-name">{{ tariff.name }}</h3>
                <div class="tariff-price">
                  {{ getPriceDisplay(tariff.price) }}
                </div>
                <div class="tariff-duration">
                  {{ getDurationDisplay(tariff.duration) }}
                </div>
              </div>
              <div class="tariff-features">
                <div class="feature-item">
                  <svg
                    v-if="tariff.features.choose_response"
                    class="check-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <svg
                    v-else
                    class="minus-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>Просмотр откликов</span>
                </div>
                <div class="feature-item">
                  <svg
                    v-if="tariff.features.main_page"
                    class="check-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <svg
                    v-else
                    class="minus-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>Главная страница</span>
                </div>
                <div class="feature-item">
                  <svg
                    v-if="tariff.features.activate_bot"
                    class="check-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <svg
                    v-else
                    class="minus-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>Включение бота</span>
                </div>
                <div class="feature-item">
                  <svg
                    v-if="tariff.features.autoresponse"
                    class="check-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <svg
                    v-else
                    class="minus-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>Автоотклик</span>
                </div>
                <div class="feature-item">
                  <svg
                    v-if="tariff.features.autoboost_vacancy"
                    class="check-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <svg
                    v-else
                    class="minus-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>Автоподъем резюме</span>
                </div>
                <div class="feature-item">
                  <svg
                    v-if="tariff.features.priority_help"
                    class="check-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <svg
                    v-else
                    class="minus-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>Приоритетная поддержка</span>
                </div>
              </div>
              <div class="tariff-actions">
                <button class="edit-btn" @click="openEditModal(tariff)">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M17 3l4 4-7 7H10v-4l7-7z" />
                    <path d="M4 20h16" />
                  </svg>
                  Редактировать
                </button>
                <button
                  class="delete-btn"
                  @click="deleteTariff(tariff._id, tariff.name)"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path
                      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Модальное окно создания тарифа -->
    <Transition name="modal">
      <div
        v-if="showCreateModal"
        class="modal-overlay"
        @click.self="showCreateModal = false"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h2>Создание тарифа</h2>
            <button class="close-btn" @click="showCreateModal = false">
              ×
            </button>
          </div>
          <div class="modal-body">
            <div class="edit-field">
              <label>Название тарифа</label>
              <input
                type="text"
                v-model="newTariff.name"
                placeholder="Например: Базовый"
              />
            </div>

            <div class="edit-field">
              <label>Ключ (slug)</label>
              <input
                type="text"
                v-model="newTariff.key"
                placeholder="base, advanced, premium"
              />
            </div>

            <div class="edit-field">
              <label>Цена (₽)</label>
              <input type="number" v-model="newTariff.price" />
            </div>

            <div class="edit-field">
              <label>Длительность</label>
              <input
                type="text"
                v-model="newTariff.duration"
                placeholder="30 дней / оставить пустым для бессрочного"
              />
            </div>

            <div class="edit-field">
              <label class="checkbox-label">
                <input type="checkbox" v-model="newTariff.popular" />
                <span>Популярный тариф</span>
              </label>
            </div>

            <div class="features-title">Возможности тарифа</div>

            <div class="edit-field">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="newTariff.features.choose_response"
                />
                <span>Просмотр откликов</span>
              </label>
            </div>

            <div class="edit-field">
              <label class="checkbox-label">
                <input type="checkbox" v-model="newTariff.features.main_page" />
                <span>Главная страница</span>
              </label>
            </div>

            <div class="edit-field">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="newTariff.features.activate_bot"
                />
                <span>Включение бота</span>
              </label>
            </div>

            <div class="edit-field">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="newTariff.features.autoresponse"
                />
                <span>Автоотклик</span>
              </label>
            </div>

            <div class="edit-field">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="newTariff.features.autoboost_vacancy"
                />
                <span>Автоподъем резюме</span>
              </label>
            </div>

            <div class="edit-field">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="newTariff.features.priority_help"
                />
                <span>Приоритетная поддержка</span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="cancel-btn" @click="showCreateModal = false">
              Отмена
            </button>
            <button class="save-btn" @click="createTariff">Создать</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Модальное окно редактирования тарифа -->
    <Transition name="modal">
      <div
        v-if="showEditModal"
        class="modal-overlay"
        @click.self="closeEditModal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h2>Редактирование тарифа</h2>
            <button class="close-btn" @click="closeEditModal">×</button>
          </div>
          <div class="modal-body">
            <div class="edit-field">
              <label>Название тарифа</label>
              <input type="text" v-model="editingTariff.name" />
            </div>

            <div class="edit-field">
              <label>Ключ (slug)</label>
              <input type="text" v-model="editingTariff.key" />
            </div>

            <div class="edit-field">
              <label>Цена (₽)</label>
              <input type="number" v-model="editingTariff.price" />
            </div>

            <div class="edit-field">
              <label>Длительность</label>
              <input
                type="text"
                v-model="editingTariff.duration"
                placeholder="30 дней / оставить пустым для бессрочного"
              />
            </div>

            <div class="edit-field">
              <label class="checkbox-label">
                <input type="checkbox" v-model="editingTariff.popular" />
                <span>Популярный тариф</span>
              </label>
            </div>

            <div class="features-title">Возможности тарифа</div>

            <div class="edit-field">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="editingTariff.features.choose_response"
                />
                <span>Просмотр откликов</span>
              </label>
            </div>

            <div class="edit-field">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="editingTariff.features.main_page"
                />
                <span>Главная страница</span>
              </label>
            </div>

            <div class="edit-field">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="editingTariff.features.activate_bot"
                />
                <span>Включение бота</span>
              </label>
            </div>

            <div class="edit-field">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="editingTariff.features.autoresponse"
                />
                <span>Автоотклик</span>
              </label>
            </div>

            <div class="edit-field">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="editingTariff.features.autoboost_vacancy"
                />
                <span>Автоподъем резюме</span>
              </label>
            </div>

            <div class="edit-field">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="editingTariff.features.priority_help"
                />
                <span>Приоритетная поддержка</span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="cancel-btn" @click="closeEditModal">Отмена</button>
            <button class="save-btn" @click="saveTariffChanges">
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.admin-tariffs {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
}

.admin-container {
  display: flex;
  padding: 40px;
  gap: 32px;
  min-height: calc(100vh - 80px);
  width: 90%;
}

.tariffs-content {
  flex: 1;
  min-width: 0;
  animation: fadeIn 0.3s ease;
}

.tariffs-header {
  margin-bottom: 32px;
}

.tariffs-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #fff, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.actions-section {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-wrapper {
  flex: 1;
  min-width: 250px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: rgba(255, 255, 255, 0.4);
}

.search-input {
  width: 95%;
  padding: 12px 16px 12px 42px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 14px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.08);
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.create-btn svg {
  width: 18px;
  height: 18px;
}

.create-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.tariffs-list {
  margin-top: 24px;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: rgba(255, 255, 255, 0.5);
}

.empty-state svg {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.tariffs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}

.tariff-card {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
  transition: all 0.2s;
}

.tariff-card:hover {
  transform: translateY(-4px);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.2);
}

.tariff-card.popular {
  border-color: #fbbf24;
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #1a1a2e;
}

.tariff-card-header {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tariff-name {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
}

.tariff-price {
  font-size: 28px;
  font-weight: 700;
  color: #60a5fa;
  margin-bottom: 4px;
}

.tariff-duration {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.tariff-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.check-icon {
  width: 16px;
  height: 16px;
  color: #10b981;
  flex-shrink: 0;
}

.minus-icon {
  width: 16px;
  height: 16px;
  color: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.tariff-actions {
  display: flex;
  gap: 12px;
}

.edit-btn,
.delete-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

.edit-btn:hover {
  background: rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}

.edit-btn svg,
.delete-btn svg {
  width: 16px;
  height: 16px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #2a2a2e;
  border-radius: 20px;
  width: 90%;
  max-width: 550px;
  max-height: 85vh;
  overflow-y: auto;
  animation: modalFadeIn 0.2s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 28px;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: white;
}

.modal-body {
  padding: 24px;
}

.features-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin: 20px 0 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.edit-field {
  margin-bottom: 20px;
}

.edit-field label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.edit-field input,
.edit-field select {
  width: 100%;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: white;
  font-size: 14px;
}

.edit-field input:focus,
.edit-field select:focus {
  outline: none;
  border-color: #3b82f6;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.checkbox-label input {
  width: auto;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cancel-btn,
.save-btn {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.save-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  color: white;
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
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

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

@media (max-width: 768px) {
  .admin-container {
    flex-direction: column;
    padding: 20px;
  }

  .actions-section {
    flex-direction: column;
  }

  .create-btn {
    width: 90%;
    justify-content: center;
  }

  .search-input {
    width: 90%;
  }

  .tariffs-grid {
    grid-template-columns: 1fr;
  }
}
</style>
