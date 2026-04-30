const AUTH_STORAGE_KEY = "fenneky-preview-auth";
const USER_STORAGE_KEY = "fenneky-preview-user";

const DEFAULT_PREVIEW_USER = {
  fullName: "John Doe",
  isNewUser: false,
};

function sanitizeFullName(fullName) {
  if (typeof fullName !== "string") {
    return DEFAULT_PREVIEW_USER.fullName;
  }

  const normalizedFullName = fullName.trim().replace(/\s+/g, " ");

  return normalizedFullName || DEFAULT_PREVIEW_USER.fullName;
}

export function setPreviewSession(user = {}) {
  const previewUser = {
    fullName: sanitizeFullName(user.fullName),
    isNewUser: Boolean(user.isNewUser),
  };

  window.sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
  window.sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(previewUser));
}

export function hasPreviewSession() {
  return window.sessionStorage.getItem(AUTH_STORAGE_KEY) === "true";
}

export function getPreviewUser() {
  const storedUser = window.sessionStorage.getItem(USER_STORAGE_KEY);

  if (!storedUser) {
    return DEFAULT_PREVIEW_USER;
  }

  try {
    const parsedUser = JSON.parse(storedUser);

    return {
      fullName: sanitizeFullName(parsedUser.fullName),
      isNewUser: Boolean(parsedUser.isNewUser),
    };
  } catch {
    return DEFAULT_PREVIEW_USER;
  }
}
