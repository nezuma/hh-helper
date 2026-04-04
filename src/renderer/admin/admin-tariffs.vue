<!-- src/renderer/views/admin/AdminTariffsView.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import ProfileHeaderWithHouse from "../components/profile-header-with-house.vue";
import { useNotification } from "../composables/eventBus";
import AdminSidebar from "../components/admin-sidebar.vue";
import { fetcher } from "../helpers";

const { showSuccess, showError } = useNotification();
const searchQuery = ref("");
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const selectedTariff = ref<any>(null);
const editingTariff = ref<any>(null);
const deletingTariff = ref<any>(null);
const loading = ref(false);
const isDeleting = ref(false);
const isKeyDropdownOpen = ref(false);
const isEditKeyDropdownOpen = ref(false);

// Тарифы
const tariffs = ref<any[]>([]);

// Опции для ключа
const keyOptions = [
  { value: "base", label: "Базовый (base)" },
  { value: "advanced", label: "Расширенный (advanced)" },
  { value: "premium", label: "Премиум (premium)" },
];

// Форма создания тарифа
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

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const filteredTariffs = computed(() => tariffs.value);

// Загрузка тарифов
const loadTariffs = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (searchQuery.value.trim()) {
      params.append("tariffName", searchQuery.value.trim());
    }

    const data = await fetcher({
      url: `/admin/tariffs${params.toString() ? `?${params.toString()}` : ""}`,
      method: "GET",
    });
    tariffs.value = data || [];
  } catch (error) {
    console.error("Error loading tariffs:", error);
    showError("Ошибка загрузки тарифов");
  } finally {
    loading.value = false;
  }
};

const handleSearchInput = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    loadTariffs();
  }, 500);
};

const createTariff = async () => {
  if (!newTariff.value.name) {
    showError("Введите название тарифа");
    return;
  }

  try {
    const data = await fetcher({
      url: "/admin/tariffs",
      method: "POST",
      body: newTariff.value,
    });

    tariffs.value.push(data);
    showSuccess(`Тариф "${newTariff.value.name}" создан`);
    showCreateModal.value = false;
    resetNewTariff();
  } catch (error) {
    console.error("Error creating tariff:", error);
    showError("Ошибка создания тарифа");
  }
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
  isEditKeyDropdownOpen.value = false;
};

const saveTariffChanges = async () => {
  try {
    const params = new URLSearchParams();
    params.append("tariffId", selectedTariff.value._id);

    const updated = await fetcher({
      url: `/admin/tariffs?${params.toString()}`,
      method: "PATCH",
      body: {
        name: editingTariff.value.name,
        duration: editingTariff.value.duration,
        key: editingTariff.value.key,
        price: editingTariff.value.price,
        popular: editingTariff.value.popular,
        features: editingTariff.value.features,
      },
    });

    const index = tariffs.value.findIndex(
      (t) => t._id === selectedTariff.value._id,
    );
    if (index !== -1) {
      tariffs.value[index] = updated;
    }
    showSuccess(`Тариф "${editingTariff.value.name}" обновлен`);
    closeEditModal();
  } catch (error) {
    console.error("Error updating tariff:", error);
    showError("Ошибка обновления тарифа");
  }
};

const openDeleteModal = (tariff: any) => {
  deletingTariff.value = tariff;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deletingTariff.value = null;
  isDeleting.value = false;
};

const confirmDelete = async () => {
  if (!deletingTariff.value) return;

  isDeleting.value = true;

  try {
    const params = new URLSearchParams();
    params.append("tariffId", deletingTariff.value._id);

    await fetcher({
      url: `/admin/tariffs?${params.toString()}`,
      method: "DELETE",
    });

    const index = tariffs.value.findIndex(
      (t) => t._id === deletingTariff.value._id,
    );
    if (index !== -1) {
      tariffs.value.splice(index, 1);
    }
    showSuccess(`Тариф "${deletingTariff.value.name}" удален`);
    closeDeleteModal();
  } catch (error) {
    console.error("Error deleting tariff:", error);
    showError("Ошибка удаления тарифа");
    isDeleting.value = false;
  }
};

const getPriceDisplay = (price: number) => {
  if (price === 0) return "Бесплатно";
  return `${price} ₽`;
};

const getDurationDisplay = (duration: number | null) => {
  if (!duration) return "Бессрочно";
  return `${duration} дней`;
};

onMounted(() => {
  loadTariffs();
});
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
                @input="handleSearchInput"
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
          <div v-if="loading && tariffs.length === 0" class="loading-state">
            <div class="spinner"></div>
            <p>Загрузка тарифов...</p>
          </div>
          <div v-else-if="filteredTariffs.length === 0" class="empty-state">
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
                <button class="delete-btn" @click="openDeleteModal(tariff)">
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
        <div class="modal-content modal-large">
          <div class="modal-header">
            <h2>Создание тарифа</h2>
            <button class="close-btn" @click="showCreateModal = false">
              ×
            </button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="edit-field">
                <label>Название тарифа <span class="required">*</span></label>
                <input
                  type="text"
                  v-model="newTariff.name"
                  placeholder="Например: Базовый"
                />
              </div>

              <div class="edit-field">
                <label>Ключ (slug) <span class="required">*</span></label>
                <div
                  class="custom-select-dropdown"
                  @click.stop="isKeyDropdownOpen = !isKeyDropdownOpen"
                >
                  <div class="select-trigger">
                    <span class="select-value">{{
                      newTariff.key || "Выберите ключ"
                    }}</span>
                    <svg
                      class="select-arrow"
                      :class="{ rotated: isKeyDropdownOpen }"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  <Transition name="dropdown">
                    <div v-if="isKeyDropdownOpen" class="dropdown-options">
                      <div
                        v-for="option in keyOptions"
                        :key="option.value"
                        class="dropdown-option"
                        :class="{ active: newTariff.key === option.value }"
                        @click="
                          newTariff.key = option.value;
                          isKeyDropdownOpen = false;
                        "
                      >
                        {{ option.label }}
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="edit-field">
                <label>Цена (₽)</label>
                <input
                  type="text"
                  v-model="newTariff.price"
                  @input="
                    newTariff.price = Number(
                      newTariff.price.toString().replace(/[^0-9]/g, ''),
                    )
                  "
                  placeholder="0"
                />
              </div>

              <div class="edit-field">
                <label>Длительность (дней)</label>
                <input
                  type="number"
                  v-model="newTariff.duration"
                  placeholder="Оставьте пустым для бессрочного"
                />
              </div>
            </div>

            <div class="edit-field">
              <label class="checkbox-label">
                <input type="checkbox" v-model="newTariff.popular" />
                <span class="checkbox-custom"></span>
                <span>Популярный тариф</span>
              </label>
            </div>

            <div class="features-title">Возможности тарифа</div>

            <div class="features-grid">
              <div class="edit-field">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="newTariff.features.choose_response"
                  />
                  <span class="checkbox-custom"></span>
                  <span>Просмотр откликов</span>
                </label>
              </div>

              <div class="edit-field">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="newTariff.features.main_page"
                  />
                  <span class="checkbox-custom"></span>
                  <span>Главная страница</span>
                </label>
              </div>

              <div class="edit-field">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="newTariff.features.activate_bot"
                  />
                  <span class="checkbox-custom"></span>
                  <span>Включение бота</span>
                </label>
              </div>

              <div class="edit-field">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="newTariff.features.autoresponse"
                  />
                  <span class="checkbox-custom"></span>
                  <span>Автоотклик</span>
                </label>
              </div>

              <div class="edit-field">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="newTariff.features.autoboost_vacancy"
                  />
                  <span class="checkbox-custom"></span>
                  <span>Автоподъем резюме</span>
                </label>
              </div>

              <div class="edit-field">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="newTariff.features.priority_help"
                  />
                  <span class="checkbox-custom"></span>
                  <span>Приоритетная поддержка</span>
                </label>
              </div>
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
        <div class="modal-content modal-large">
          <div class="modal-header">
            <h2>Редактирование тарифа</h2>
            <button class="close-btn" @click="closeEditModal">×</button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="edit-field">
                <label>Название тарифа</label>
                <input type="text" v-model="editingTariff.name" />
              </div>

              <div class="edit-field">
                <label>Ключ (slug)</label>
                <div
                  class="custom-select-dropdown"
                  @click.stop="isEditKeyDropdownOpen = !isEditKeyDropdownOpen"
                >
                  <div class="select-trigger">
                    <span class="select-value">{{
                      editingTariff?.key || "Выберите ключ"
                    }}</span>
                    <svg
                      class="select-arrow"
                      :class="{ rotated: isEditKeyDropdownOpen }"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  <Transition name="dropdown">
                    <div v-if="isEditKeyDropdownOpen" class="dropdown-options">
                      <div
                        v-for="option in keyOptions"
                        :key="option.value"
                        class="dropdown-option"
                        :class="{ active: editingTariff?.key === option.value }"
                        @click="
                          editingTariff.key = option.value;
                          isEditKeyDropdownOpen = false;
                        "
                      >
                        {{ option.label }}
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="edit-field">
                <label>Цена (₽)</label>
                <input
                  type="text"
                  v-model="editingTariff.price"
                  @input="
                    editingTariff.price = editingTariff.price
                      .toString()
                      .replace(/[^0-9]/g, '')
                  "
                />
              </div>

              <div class="edit-field">
                <label>Длительность (дней)</label>
                <input type="number" v-model="editingTariff.duration" />
              </div>
            </div>

            <div class="edit-field">
              <label class="checkbox-label">
                <input type="checkbox" v-model="editingTariff.popular" />
                <span class="checkbox-custom"></span>
                <span>Популярный тариф</span>
              </label>
            </div>

            <div class="features-title">Возможности тарифа</div>

            <div class="features-grid">
              <div class="edit-field">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="editingTariff.features.choose_response"
                  />
                  <span class="checkbox-custom"></span>
                  <span>Просмотр откликов</span>
                </label>
              </div>

              <div class="edit-field">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="editingTariff.features.main_page"
                  />
                  <span class="checkbox-custom"></span>
                  <span>Главная страница</span>
                </label>
              </div>

              <div class="edit-field">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="editingTariff.features.activate_bot"
                  />
                  <span class="checkbox-custom"></span>
                  <span>Включение бота</span>
                </label>
              </div>

              <div class="edit-field">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="editingTariff.features.autoresponse"
                  />
                  <span class="checkbox-custom"></span>
                  <span>Автоотклик</span>
                </label>
              </div>

              <div class="edit-field">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="editingTariff.features.autoboost_vacancy"
                  />
                  <span class="checkbox-custom"></span>
                  <span>Автоподъем резюме</span>
                </label>
              </div>

              <div class="edit-field">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="editingTariff.features.priority_help"
                  />
                  <span class="checkbox-custom"></span>
                  <span>Приоритетная поддержка</span>
                </label>
              </div>
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

    <!-- Модальное окно подтверждения удаления -->
    <Transition name="modal">
      <div
        v-if="showDeleteModal"
        class="modal-overlay"
        @click.self="closeDeleteModal"
      >
        <div class="modal-content modal-confirm">
          <div class="modal-header">
            <div class="confirm-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="#f87171"
                  stroke-width="2"
                />
                <line
                  x1="12"
                  y1="8"
                  x2="12"
                  y2="12"
                  stroke="#f87171"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <circle cx="12" cy="16" r="1.5" fill="#f87171" />
              </svg>
            </div>
            <button class="close-btn" @click="closeDeleteModal">×</button>
          </div>
          <div class="modal-body confirm-body">
            <h3>Удаление тарифа</h3>
            <p>
              Вы уверены, что хотите удалить тариф
              <strong>"{{ deletingTariff?.name }}"</strong>?
            </p>
            <p class="warning-text">
              Это действие нельзя отменить. Все данные, связанные с этим
              тарифом, будут удалены.
            </p>
          </div>
          <div class="modal-footer confirm-footer">
            <button class="cancel-btn" @click="closeDeleteModal">Отмена</button>
            <button
              class="delete-confirm-btn"
              @click="confirmDelete"
              :disabled="isDeleting"
            >
              <span v-if="isDeleting" class="spinner-small"></span>
              <span v-else>Да, удалить</span>
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
  justify-content: space-between;
}

.search-wrapper {
  flex: 1;
  min-width: 250px;
  max-width: 400px;
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
  width: 100%;
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
  flex-shrink: 0;
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

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.5);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Tariffs Grid */
.tariffs-list {
  margin-top: 24px;
}

.empty-state {
  text-align: center;
  padding: 60px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
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

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #2a2a2e;
  border-radius: 24px;
  animation: modalFadeIn 0.2s ease;
}

.modal-large {
  width: 90%;
  max-width: 700px;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-confirm {
  width: 90%;
  max-width: 450px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

.modal-header h2 {
  font-size: 22px;
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
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.close-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 28px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.edit-field {
  margin-bottom: 20px;
}

.edit-field label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.required {
  color: #f87171;
}

.edit-field input,
.edit-field select {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: white;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.edit-field input:focus,
.edit-field select:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.12);
}

/* Custom Select Dropdown */
.custom-select-dropdown {
  position: relative;
  width: 100%;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.select-trigger:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
}

.select-arrow {
  width: 16px;
  height: 16px;
  transition: transform 0.2s;
}

.select-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-options {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #2a2a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  z-index: 100;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.dropdown-option {
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.dropdown-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dropdown-option.active {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}
.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.features-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin: 24px 0 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

/* Стилизованный checkbox */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  position: relative;
}

.checkbox-label input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  display: inline-block;
  position: relative;
  transition: all 0.2s;
  flex-shrink: 0;
}

.checkbox-label input:checked + .checkbox-custom {
  background: #3b82f6;
  border-color: #3b82f6;
}

.checkbox-label input:checked + .checkbox-custom::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.checkbox-label:hover .checkbox-custom {
  border-color: #3b82f6;
}

.checkbox-label span:last-child {
  line-height: 1.4;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 28px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cancel-btn,
.save-btn,
.delete-confirm-btn {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.8);
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

.delete-confirm-btn {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.delete-confirm-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}

.delete-confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Confirm Modal */
.confirm-icon {
  width: 64px;
  height: 64px;
  background: rgba(239, 68, 68, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.confirm-icon svg {
  color: #f87171;
}

.confirm-body {
  text-align: center;
  padding: 28px;
}

.confirm-body h3 {
  font-size: 22px;
  font-weight: 600;
  color: white;
  margin: 16px 0 8px;
}

.confirm-body p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.confirm-body .warning-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 12px;
}

.confirm-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Animations */
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

/* Scrollbar */
.modal-large::-webkit-scrollbar {
  width: 6px;
}

.modal-large::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.modal-large::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-container {
    flex-direction: column;
    padding: 20px;
  }

  .actions-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-wrapper {
    max-width: none;
  }

  .create-btn {
    width: 100%;
    justify-content: center;
  }

  .tariffs-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .modal-large {
    width: 95%;
    max-height: 90vh;
  }

  .modal-confirm {
    width: 95%;
  }
}
</style>
