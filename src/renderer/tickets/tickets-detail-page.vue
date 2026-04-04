<!-- src/renderer/pages/ticket-detail-page.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import ProfileHeaderWithHouse from "../components/profile-header-with-house.vue";
import { fetcher } from "../helpers";

const route = useRoute();
const router = useRouter();
const ticketId = route.params.id as string;

// Типы сообщений
interface Message {
  _id?: string;
  text: string;
  createdAt: string;
  isAdmin: boolean;
  userName: string;
  userAvatar?: string;
}

interface TicketDetail {
  _id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  category: "help" | "propose" | "other";
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

const ticket = ref<TicketDetail | null>(null);
const newMessage = ref("");
const isSending = ref(false);
const isLoading = ref(true);
const error = ref<string | null>(null);
const isClosing = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

const scrollToBottom = () => {
  setTimeout(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: "smooth",
      });
    }
  }, 100);
};

const getStatusText = (status: string) => {
  const statuses = {
    open: "Открыто",
    in_progress: "В работе",
    resolved: "Решено",
    closed: "Закрыто",
  };
  return statuses[status as keyof typeof statuses] || status;
};

const getStatusClass = (status: string) => {
  const classes = {
    open: "status-open",
    in_progress: "status-progress",
    resolved: "status-resolved",
    closed: "status-closed",
  };
  return classes[status as keyof typeof classes] || "";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return `Сегодня в ${date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
  } else if (days === 1) {
    return `Вчера в ${date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
  } else {
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};

const goBack = () => {
  router.back();
};

const loadTicket = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const data = await fetcher({
      url: `/tickets?id=${ticketId}`,
      method: "GET",
    });
    ticket.value = data;
    console.log("Loaded ticket:", ticket.value);
  } catch (err) {
    console.error("Error loading ticket:", err);
    error.value = "Не удалось загрузить обращение";
  } finally {
    isLoading.value = false;
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !ticket.value) return;

  isSending.value = true;

  try {
    const updatedTicket = await fetcher({
      url: `/tickets?ticketId=${ticketId}`,
      method: "PATCH",
      body: {
        message: newMessage.value,
      },
    });

    ticket.value = updatedTicket;
    newMessage.value = "";
    scrollToBottom();
  } catch (err) {
    console.error("Error sending message:", err);
    error.value = "Не удалось отправить сообщение";
  } finally {
    isSending.value = false;
  }
};
const showConfirmModal = ref(false);

const openConfirmModal = () => {
  showConfirmModal.value = true;
};

const closeConfirmModal = () => {
  showConfirmModal.value = false;
};

const confirmCloseTicket = async () => {
  if (!ticket.value || ticket.value.status === "closed") return;

  closeConfirmModal();
  isClosing.value = true;

  try {
    const updatedTicket = await fetcher({
      url: `/tickets?ticketId=${ticketId}&close=true`,
      method: "PATCH",
      body: {},
    });

    ticket.value = updatedTicket;
  } catch (err) {
    console.error("Error closing ticket:", err);
    error.value = "Не удалось закрыть обращение";
  } finally {
    isClosing.value = false;
  }
};

onMounted(() => {
  loadTicket();
  scrollToBottom();
});
</script>

<template>
  <div class="ticket-detail-page">
    <ProfileHeaderWithHouse />

    <div class="ticket-detail-content">
      <!-- Кнопка назад -->
      <button class="back-btn" @click="goBack">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Назад к обращениям
      </button>

      <!-- Состояние загрузки -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Загрузка обращения...</p>
      </div>

      <!-- Состояние ошибки -->
      <div v-else-if="error" class="not-found">
        <div class="not-found-icon">⚠️</div>
        <h2>Ошибка загрузки</h2>
        <p>{{ error }}</p>
        <button class="back-to-tickets" @click="loadTicket">
          Попробовать снова
        </button>
      </div>

      <!-- Обращение не найдено -->
      <div v-else-if="!ticket" class="not-found">
        <div class="not-found-icon">🔍</div>
        <h2>Обращение не найдено</h2>
        <p>Проверьте правильность ID обращения</p>
        <button class="back-to-tickets" @click="router.push('/tickets')">
          Вернуться к списку
        </button>
      </div>

      <!-- Детали обращения -->
      <div v-else class="ticket-container">
        <!-- Информация об обращении -->
        <div class="ticket-info-card">
          <div class="ticket-header">
            <div class="ticket-title-section">
              <span class="ticket-id">ID: {{ ticket._id.slice(-6) }}</span>
              <h1 class="ticket-title">{{ ticket.title }}</h1>
            </div>
            <div class="ticket-badges">
              <span :class="['status-badge', getStatusClass(ticket.status)]">
                {{ getStatusText(ticket.status) }}
              </span>
              <span class="category-badge">
                {{
                  ticket.category === "help" ? "🆘 Помощь" : "💡 Предложение"
                }}
              </span>
            </div>
          </div>
          <p class="ticket-description">{{ ticket.description }}</p>
          <div class="ticket-meta">
            <span class="ticket-date"
              >📅 Создано: {{ formatDate(ticket.createdAt) }}</span
            >
            <span class="ticket-updated"
              >🔄 Обновлено: {{ formatDate(ticket.updatedAt) }}</span
            >
          </div>
        </div>

        <!-- Сообщения -->
        <div class="messages-container">
          <h3 class="messages-title">История переписки</h3>

          <div v-if="ticket.messages.length === 0" class="empty-messages">
            <p>Сообщений пока нет</p>
          </div>

          <div v-else ref="messagesContainer" class="messages-list">
            <div
              v-for="message in ticket.messages"
              :key="message._id || message.createdAt"
              class="message-item"
              :class="{
                'admin-message': message.isAdmin,
                'user-message': !message.isAdmin,
              }"
            >
              <div class="message-avatar">
                <img
                  v-if="message.userAvatar && !message.isAdmin"
                  :src="message.userAvatar"
                  :alt="message.userName"
                  class="avatar-img"
                />
                <div
                  v-else
                  class="avatar-placeholder"
                  :class="{ 'admin-avatar': message.isAdmin }"
                >
                  <svg
                    v-if="message.isAdmin"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span v-else class="avatar-letter">{{
                    message.userName?.charAt(0) || "П"
                  }}</span>
                </div>
              </div>
              <div class="message-content">
                <div class="message-header">
                  <span class="message-author">{{ message.userName }}</span>
                  <span class="message-date">{{
                    formatDate(message.createdAt)
                  }}</span>
                </div>
                <div class="message-text">{{ message.text }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Форма отправки сообщения -->
        <div class="reply-section">
          <h3 class="reply-title">Ваш ответ</h3>
          <div class="reply-form">
            <textarea
              v-model="newMessage"
              class="reply-input"
              rows="4"
              placeholder="Напишите ваш ответ здесь..."
              :disabled="
                ticket.status === 'resolved' || ticket.status === 'closed'
              "
            ></textarea>
            <div class="reply-actions">
              <button
                @click="sendMessage"
                class="send-btn"
                :disabled="
                  !newMessage.trim() ||
                  isSending ||
                  ticket.status === 'resolved' ||
                  ticket.status === 'closed'
                "
              >
                <span v-if="isSending" class="spinner"></span>
                <span v-else>Отправить</span>
              </button>
              <button
                v-if="
                  ticket.status !== 'closed' && ticket.status !== 'resolved'
                "
                @click="openConfirmModal"
                class="close-ticket-btn"
                :disabled="isClosing"
              >
                <span v-if="isClosing" class="spinner"></span>
                <span v-else>🔒 Закрыть тикет</span>
              </button>
            </div>
            <div
              v-if="ticket.status === 'resolved' || ticket.status === 'closed'"
              class="closed-note"
            >
              ⚠️ Обращение закрыто. Вы не можете отправлять новые сообщения.
            </div>
          </div>
        </div>
        <Transition name="modal">
          <div
            v-if="showConfirmModal"
            class="confirm-modal-overlay"
            @click.self="closeConfirmModal"
          >
            <div class="confirm-modal-content">
              <div class="confirm-modal-icon">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <line
                    x1="12"
                    y1="8"
                    x2="12"
                    y2="12"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                  <circle
                    cx="12"
                    cy="16"
                    r="0.5"
                    fill="currentColor"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                </svg>
              </div>
              <h3 class="confirm-modal-title">Закрыть обращение?</h3>
              <p class="confirm-modal-description">
                Вы уверены, что хотите закрыть это обращение?<br />
                После закрытия вы не сможете отправлять новые сообщения.
              </p>
              <div class="confirm-modal-actions">
                <button class="confirm-modal-cancel" @click="closeConfirmModal">
                  Отмена
                </button>
                <button
                  class="confirm-modal-confirm"
                  @click="confirmCloseTicket"
                >
                  Да, закрыть
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticket-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
}

.ticket-detail-content {
  padding: 40px;
  max-width: 900px;
  margin: 0 auto;
}

/* Кнопка назад */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 8px 16px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 24px;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(-2px);
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 80px 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Not Found */
.not-found {
  text-align: center;
  padding: 80px 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.not-found-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.not-found h2 {
  font-size: 24px;
  color: white;
  margin-bottom: 12px;
}

.not-found p {
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 24px;
}

.back-to-tickets {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.back-to-tickets:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Ticket Info Card */
.ticket-info-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
  margin-bottom: 32px;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.ticket-title-section {
  flex: 1;
}

.ticket-id {
  font-size: 12px;
  color: #60a5fa;
  font-family: monospace;
  display: block;
  margin-bottom: 8px;
}

.ticket-title {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0;
}

.ticket-badges {
  display: flex;
  gap: 8px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-open {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.status-progress {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.status-resolved {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.status-closed {
  background: rgba(107, 114, 128, 0.2);
  color: #9ca3af;
}

.category-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.ticket-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  margin: 16px 0;
  word-break: break-word;
}

.ticket-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  flex-wrap: wrap;
}

/* Messages Container */
.messages-container {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 32px;
}

.messages-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.empty-messages {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.5);
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
}

.message-item {
  display: flex;
  gap: 12px;
}

.message-avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.admin-avatar {
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
}

.avatar-letter {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.avatar-placeholder svg {
  width: 20px;
  height: 20px;
  color: white;
}

.message-content {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px 16px;
}

.admin-message .message-content {
  background: rgba(59, 130, 246, 0.1);
  border-left: 3px solid #3b82f6;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.message-author {
  font-size: 14px;
  font-weight: 600;
  color: #60a5fa;
}

.admin-message .message-author {
  color: #a78bfa;
}

.message-date {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.message-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  word-break: break-word;
}

/* Reply Section */
.reply-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
}

.reply-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0 0 16px 0;
}

.reply-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reply-input {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 12px 16px;
  color: white;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;
}

.reply-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.12);
}

.reply-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reply-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.reply-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.send-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
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
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.close-ticket-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  color: #f87171;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.close-ticket-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.3);
  transform: translateY(-2px);
}

.close-ticket-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.closed-note {
  text-align: center;
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 10px;
  color: #f87171;
  font-size: 13px;
}

/* Scrollbar */
.messages-list::-webkit-scrollbar {
  width: 6px;
}

.messages-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.messages-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.messages-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
/* Confirm Modal */
.confirm-modal-overlay {
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
  z-index: 1100;
}

.confirm-modal-content {
  background: #2a2a2e;
  border-radius: 24px;
  padding: 32px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  animation: confirmModalFadeIn 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.confirm-modal-icon {
  width: 64px;
  height: 64px;
  background: rgba(239, 68, 68, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.confirm-modal-icon svg {
  color: #f87171;
}

.confirm-modal-title {
  font-size: 22px;
  font-weight: 600;
  color: white;
  margin-bottom: 12px;
}

.confirm-modal-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
  margin-bottom: 28px;
}

.confirm-modal-actions {
  display: flex;
  gap: 12px;
}

.confirm-modal-cancel,
.confirm-modal-confirm {
  flex: 1;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-modal-cancel {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.8);
}

.confirm-modal-cancel:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.confirm-modal-confirm {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.confirm-modal-confirm:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}

@keyframes confirmModalFadeIn {
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
/* Responsive */
@media (max-width: 768px) {
  .ticket-detail-content {
    padding: 20px;
  }

  .ticket-header {
    flex-direction: column;
  }

  .ticket-title {
    font-size: 20px;
  }

  .messages-container {
    padding: 16px;
  }

  .message-item {
    gap: 8px;
  }

  .message-avatar {
    width: 32px;
    height: 32px;
  }

  .message-content {
    padding: 10px 12px;
  }

  .message-author {
    font-size: 13px;
  }

  .message-text {
    font-size: 13px;
  }

  .reply-section {
    padding: 16px;
  }

  .reply-actions {
    flex-direction: column;
  }
}
</style>
