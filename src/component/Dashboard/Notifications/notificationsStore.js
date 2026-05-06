import { useEffect, useSyncExternalStore } from "react";
import { notificationApi } from "../../../api/client.js";
import {
  clearAuthSession,
  hasAuthSession,
  subscribeAuthSession,
} from "../../../authSession.js";

const listeners = new Set();

let notificationsSnapshot = {
  notifications: [],
  isLoading: false,
  hasLoaded: false,
  errorMessage: "",
};

let loadPromise = null;

function emitChange() {
  listeners.forEach((listener) => listener());
}

function updateSnapshot(updater) {
  notificationsSnapshot = updater(notificationsSnapshot);
  emitChange();
}

async function runNotificationRequest(requestFn, fallbackValue) {
  try {
    const result = await requestFn();

    if (Array.isArray(result)) {
      updateSnapshot((current) => ({
        ...current,
        notifications: result,
        hasLoaded: true,
        errorMessage: "",
      }));
    }

    return result;
  } catch (error) {
    if (error.message?.toLowerCase().includes("authentication")) {
      clearAuthSession();
    }

    updateSnapshot((current) => ({
      ...current,
      errorMessage: error.message || "Impossible de charger les notifications.",
    }));

    return fallbackValue;
  }
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

export async function refreshNotifications() {
  if (!hasAuthSession()) {
    updateSnapshot(() => ({
      notifications: [],
      isLoading: false,
      hasLoaded: false,
      errorMessage: "",
    }));
    return [];
  }

  if (loadPromise) {
    return loadPromise;
  }

  updateSnapshot((current) => ({
    ...current,
    isLoading: true,
    errorMessage: "",
  }));

  loadPromise = runNotificationRequest(() => notificationApi.list(), []).finally(() => {
    updateSnapshot((current) => ({
      ...current,
      isLoading: false,
      hasLoaded: true,
    }));
    loadPromise = null;
  });

  return loadPromise;
}

export async function markAllNotificationsAsRead() {
  return runNotificationRequest(() => notificationApi.markAllAsRead(), notificationsSnapshot.notifications);
}

export async function markNotificationAsRead(notificationId) {
  const updatedNotification = await runNotificationRequest(
    () => notificationApi.markAsRead(notificationId),
    null,
  );

  if (!updatedNotification) {
    return null;
  }

  updateSnapshot((current) => ({
    ...current,
    notifications: current.notifications.map((notification) =>
      notification.id === notificationId
        ? { ...notification, ...updatedNotification }
        : notification,
    ),
  }));

  return updatedNotification;
}

export async function deleteNotification(notificationId) {
  const result = await runNotificationRequest(() => notificationApi.delete(notificationId), null);

  if (!result?.deleted) {
    return null;
  }

  updateSnapshot((current) => ({
    ...current,
    notifications: current.notifications.filter((notification) => notification.id !== notificationId),
  }));

  return result;
}

subscribeAuthSession(() => {
  if (!hasAuthSession()) {
    updateSnapshot(() => ({
      notifications: [],
      isLoading: false,
      hasLoaded: false,
      errorMessage: "",
    }));
    return;
  }

  refreshNotifications();
});

export function useNotificationsState() {
  const snapshot = useSyncExternalStore(
    subscribeNotifications,
    getNotificationsSnapshot,
    getNotificationsSnapshot,
  );

  useEffect(() => {
    if (!snapshot.hasLoaded && !snapshot.isLoading && hasAuthSession()) {
      refreshNotifications();
    }
  }, [snapshot.hasLoaded, snapshot.isLoading]);

  return {
    ...snapshot,
    unreadCount: snapshot.notifications.filter((notification) => !notification.read).length,
  };
}
