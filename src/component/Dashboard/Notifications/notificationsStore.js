import { useSyncExternalStore } from "react";

const STORAGE_KEY = "fenneky-preview-notifications";

const initialNotifications = [
  {
    id: "session-confirmed",
    type: "session",
    title: "Session Confirmed",
    message: "Your session with Sarah Chen for Spanish Language has been confirmed.",
    time: "5 minutes ago",
    read: false,
  },
  {
    id: "credits-received",
    type: "credits",
    title: "Credits Received",
    message: "You earned 1.5 credits from teaching React Development to Alex Kim.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "skill-validated",
    type: "validated",
    title: "Skill Validated",
    message: "Your UI/UX Design skill has been validated by Elena Rodriguez.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "new-message",
    type: "message",
    title: "New Message",
    message: "Marcus Johnson sent you a message about rescheduling your session.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "session-request",
    type: "request",
    title: "Session Request",
    message: "Emma Wilson requested a session with you for Web Development.",
    time: "2 days ago",
    read: true,
  },
];

const listeners = new Set();

function cloneNotifications(items) {
  return JSON.parse(JSON.stringify(items));
}

function readStoredNotifications() {
  if (typeof window === "undefined") {
    return cloneNotifications(initialNotifications);
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return cloneNotifications(initialNotifications);
    }

    const parsedValue = JSON.parse(storedValue);

    return Array.isArray(parsedValue) ? parsedValue : cloneNotifications(initialNotifications);
  } catch {
    return cloneNotifications(initialNotifications);
  }
}

let notificationsSnapshot = readStoredNotifications();

function persistNotifications() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notificationsSnapshot));
}

function emitChange() {
  persistNotifications();
  listeners.forEach((listener) => listener());
}

function updateNotifications(updater) {
  notificationsSnapshot = updater(notificationsSnapshot);
  emitChange();
}

export function subscribeNotifications(listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getNotificationsSnapshot() {
  return notificationsSnapshot;
}

export function useNotificationsState() {
  const notifications = useSyncExternalStore(
    subscribeNotifications,
    getNotificationsSnapshot,
    getNotificationsSnapshot,
  );

  return {
    notifications,
    unreadCount: notifications.filter((notification) => !notification.read).length,
  };
}

export function markAllNotificationsAsRead() {
  updateNotifications((current) =>
    current.map((notification) => ({ ...notification, read: true })),
  );
}

export function markNotificationAsRead(notificationId) {
  updateNotifications((current) =>
    current.map((notification) =>
      notification.id === notificationId ? { ...notification, read: true } : notification,
    ),
  );
}

export function deleteNotification(notificationId) {
  updateNotifications((current) =>
    current.filter((notification) => notification.id !== notificationId),
  );
}
