import { useSyncExternalStore } from "react";

const TOKEN_STORAGE_KEY = "fenneky-auth-token";
const USER_STORAGE_KEY = "fenneky-auth-user";

const listeners = new Set();

function readStoredSession() {
  if (typeof window === "undefined") {
    return {
      accessToken: "",
      user: null,
    };
  }

  const accessToken = window.localStorage.getItem(TOKEN_STORAGE_KEY) || "";
  const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);

  if (!storedUser) {
    return {
      accessToken,
      user: null,
    };
  }

  try {
    return {
      accessToken,
      user: JSON.parse(storedUser),
    };
  } catch {
    return {
      accessToken,
      user: null,
    };
  }
}

let sessionSnapshot = readStoredSession();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function persistSnapshot() {
  if (typeof window === "undefined") {
    return;
  }

  if (sessionSnapshot.accessToken) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, sessionSnapshot.accessToken);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  if (sessionSnapshot.user) {
    const { profilePicture: _photo, ...userWithoutPhoto } = sessionSnapshot.user;
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithoutPhoto));
  } else {
    window.localStorage.removeItem(USER_STORAGE_KEY);
  }
}

function updateSnapshot(nextSnapshot) {
  sessionSnapshot = nextSnapshot;
  persistSnapshot();
  emitChange();
}

export function setAuthSession({ accessToken = "", user = null } = {}) {
  updateSnapshot({
    accessToken,
    user,
  });
}

export function updateAuthUser(user) {
  updateSnapshot({
    ...sessionSnapshot,
    user,
  });
}

export function clearAuthSession() {
  updateSnapshot({
    accessToken: "",
    user: null,
  });
}

export function getAccessToken() {
  return sessionSnapshot.accessToken;
}

export function getAuthUser() {
  return sessionSnapshot.user;
}

export function hasAuthSession() {
  return Boolean(sessionSnapshot.accessToken);
}

export function subscribeAuthSession(listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function useAuthSession() {
  return useSyncExternalStore(
    subscribeAuthSession,
    () => sessionSnapshot,
    () => sessionSnapshot,
  );
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== TOKEN_STORAGE_KEY && event.key !== USER_STORAGE_KEY) {
      return;
    }

    sessionSnapshot = readStoredSession();
    emitChange();
  });
}
