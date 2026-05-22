import { useEffect, useSyncExternalStore } from "react";
import { notificationApi } from "../../../api/client.js";
import {
  clearAuthSession,
  hasAuthSession,
  subscribeAuthSession,
} from "../../../authSession.js";

const listeners = new Set();
const POLLING_INTERVAL_MS = 10000;

let notificationsSnapshot = {
  notifications: [],
  isLoading: false,
  hasLoaded: false,
  errorMessage: "",
};

let loadPromise = null;
let pollingIntervalId = null;
let pollingSubscriberCount = 0;

function handleNotificationsVisibilityRefresh() {
  if (typeof document !== "undefined" && document.visibilityState !== "visible") {
    return;
  }

  if (hasAuthSession()) {
    refreshNotifications();
  }
}

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

function startNotificationsPolling() {
  if (typeof window === "undefined" || pollingIntervalId || !hasAuthSession()) {
    return;
  }

  pollingIntervalId = window.setInterval(() => {
    handleNotificationsVisibilityRefresh();
  }, POLLING_INTERVAL_MS);

  window.addEventListener("focus", handleNotificationsVisibilityRefresh);
  document.addEventListener("visibilitychange", handleNotificationsVisibilityRefresh);
}

function stopNotificationsPolling() {
  if (typeof window === "undefined") {
    return;
  }

  if (pollingIntervalId) {
    window.clearInterval(pollingIntervalId);
    pollingIntervalId = null;
  }

  window.removeEventListener("focus", handleNotificationsVisibilityRefresh);
  document.removeEventListener("visibilitychange", handleNotificationsVisibilityRefresh);
}

function retainNotificationsPolling() {
  pollingSubscriberCount += 1;
  startNotificationsPolling();
}

function releaseNotificationsPolling() {
  pollingSubscriberCount = Math.max(0, pollingSubscriberCount - 1);

  if (pollingSubscriberCount === 0) {
    stopNotificationsPolling();
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
    stopNotificationsPolling();
    updateSnapshot(() => ({
      notifications: [],
      isLoading: false,
      hasLoaded: false,
      errorMessage: "",
    }));
    return;
  }

  refreshNotifications();
  if (pollingSubscriberCount > 0) {
    startNotificationsPolling();
  }
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

  useEffect(() => {
    if (!hasAuthSession()) {
      return undefined;
    }

    retainNotificationsPolling();

    return () => {
      releaseNotificationsPolling();
    };
  }, []);

  return {
    ...snapshot,
    unreadCount: snapshot.notifications.filter((notification) => !notification.read).length,
  };
}
