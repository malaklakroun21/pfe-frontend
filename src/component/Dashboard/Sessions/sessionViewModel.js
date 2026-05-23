export const mySessionTabs = [
  { key: "upcoming", label: "Upcoming" },
  { key: "pending", label: "Pending" },
  { key: "awaiting", label: "To Confirm" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export const sessionDirectoryTabs = [{ key: "all", label: "All" }, ...mySessionTabs];

const categoryThemes = [
  { from: "#ff8a3d", to: "#d9481e", soft: "#fff0e3", ink: "#7b2f10" },
  { from: "#2f80ed", to: "#1c4dd9", soft: "#eaf2ff", ink: "#16357f" },
  { from: "#00a67d", to: "#0b7a69", soft: "#e8fbf5", ink: "#12584f" },
  { from: "#7b61ff", to: "#5a35e6", soft: "#f1ecff", ink: "#4a2fb8" },
  { from: "#ef476f", to: "#c4305b", soft: "#ffe8ef", ink: "#912042" },
  { from: "#f2c94c", to: "#d8901a", soft: "#fff6dc", ink: "#8b5b08" },
];

const sessionStatusMap = {
  ACCEPTED: {
    tabKey: "upcoming",
    badge: "Confirmed",
  },
  PENDING: {
    tabKey: "pending",
    badge: "Pending",
  },
  // Teacher marked done; learner must confirm before credits transfer.
  AWAITING_CONFIRMATION: {
    tabKey: "awaiting",
    badge: "Awaiting Your Confirmation",
  },
  COMPLETED: {
    tabKey: "completed",
    badge: "Completed",
  },
  REJECTED: {
    tabKey: "cancelled",
    badge: "Cancelled",
  },
};

export function getNormalizedSessionStatus(session = {}) {
  return String(session.status || session.sessionStatus || session.requestStatus || "PENDING")
    .trim()
    .toUpperCase();
}

export function getNormalizedSessionSkillLabel(session = {}) {
  return session.skill?.trim() || session.skillName?.trim() || session.skillId?.trim() || "General";
}

function getNormalizedSessionDateValue(session = {}) {
  return session.date || session.startTime || session.scheduledDate || "";
}

function normalizeDurationHours(value) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  // Some legacy session records store duration in minutes instead of hours.
  if (parsed > 12) {
    return parsed / 60;
  }

  return parsed;
}

function getNormalizedSessionDurationHours(session = {}) {
  return normalizeDurationHours(
    session.actualDuration ?? session.duration ?? session.preferredDuration,
  );
}

function getNormalizedSessionCredits(session = {}) {
  // After completion, use the actual calculated value (T × S × M).
  const explicitCredits = Number(session.chargedCredits ?? session.creditsExchanged);
  if (Number.isFinite(explicitCredits) && explicitCredits > 0) return explicitCredits;

  // Before completion: credits are not yet known (calculated at end).
  return null;
}

export function buildFullName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || user?.userId || "Unknown";
}

export function buildInitials(user) {
  const fullName = buildFullName(user);
  const parts = fullName.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "??";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function formatDateLabel(dateValue) {
  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

export function formatTimeLabel(dateValue) {
  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Time not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
}

export function formatDurationLabel(duration) {
  if (!duration) {
    return "Not specified";
  }

  return duration === 1 ? "1 hour" : `${duration} hours`;
}

export function formatCreditLabel(credits) {
  if (credits === null || credits === undefined) {
    return "Credits calculated at end";
  }

  if (!credits) {
    return "0 credits";
  }

  return `${credits} credit${credits === 1 ? "" : "s"}`;
}

export function buildCategoryKey(label = "") {
  return String(label)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildCategoryCode(label = "") {
  const parts = String(label)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "NA";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function buildCategoryTheme(label = "") {
  const normalized = String(label).trim().toLowerCase();
  const hash = normalized.split("").reduce((total, character) => total + character.charCodeAt(0), 0);

  return categoryThemes[hash % categoryThemes.length];
}

function buildSessionDescription(session, mentorName) {
  const message = session.message?.trim();

  if (message) {
    return message;
  }

  return `Meet ${mentorName} for a guided ${session.skill?.trim() || "learning"} session.`;
}

function getSessionStatusConfig(status) {
  return sessionStatusMap[status] || sessionStatusMap.PENDING;
}

export function mapOwnedSession(session, viewerUserId) {
  const normalizedStatus = getNormalizedSessionStatus(session);
  const statusConfig = getSessionStatusConfig(normalizedStatus);
  const sessionDate = getNormalizedSessionDateValue(session);
  const durationHours = getNormalizedSessionDurationHours(session);
  const credits = getNormalizedSessionCredits(session);
  const isTeacher = session.teacherId === viewerUserId;
  const otherParticipant = isTeacher ? session.learner : session.teacher;
  const isLearner = session.learnerId === viewerUserId;
  const description = session.message?.trim() || "No message added for this session.";

  // Only allow completion actions after the session date/time has passed.
  const sessionTimestamp = sessionDate ? new Date(sessionDate).getTime() : 0;
  const hasSessionPassed = sessionTimestamp > 0 && Date.now() >= sessionTimestamp;

  return {
    id: session.sessionId,
    participantUserId: otherParticipant?.userId || "",
    initials: buildInitials(otherParticipant),
    title: getNormalizedSessionSkillLabel(session),
    participantName: buildFullName(otherParticipant),
    date: formatDateLabel(sessionDate),
    time: formatTimeLabel(sessionDate),
    durationHours,
    duration: formatDurationLabel(durationHours),
    credits: formatCreditLabel(credits),
    status: statusConfig.tabKey,
    badge: statusConfig.badge,
    description,
    canCancel: isLearner && normalizedStatus === "PENDING",
    canDelete: normalizedStatus !== "COMPLETED",
    // Teacher accepts/rejects join requests from learners.
    canAccept: isTeacher && normalizedStatus === "PENDING",
    canReject: isTeacher && normalizedStatus === "PENDING",
    // Either participant can mark the session done — only after the scheduled time has passed.
    canComplete: (isTeacher || isLearner) && normalizedStatus === "ACCEPTED" && !session.teacherCompleted && hasSessionPassed,
    // The OTHER participant (not who marked complete) confirms — triggers credit transfer.
    // No date check here: if status is AWAITING_CONFIRMATION the backend already verified the date.
    canConfirm: normalizedStatus === "AWAITING_CONFIRMATION" && !session.learnerConfirmed &&
      (session.completedByUserId
        ? viewerUserId !== session.completedByUserId && (isTeacher || isLearner)
        : isLearner),
    creditFormula: session.creditFormula || "",
    skillTierMultiplier: session.skillTierMultiplier ?? 1.0,
    trustModifier: session.trustModifier ?? 1.0,
  };
}

export function mapDirectorySession(session, viewerUserId) {
  const normalizedStatus = getNormalizedSessionStatus(session);
  const statusConfig = getSessionStatusConfig(normalizedStatus);
  const teacher = session.teacher || { userId: session.teacherId };
  const learner = session.learner || { userId: session.learnerId };
  const categoryLabel = getNormalizedSessionSkillLabel(session);
  const mentorName = buildFullName(teacher);
  const sessionDate = getNormalizedSessionDateValue(session);
  const scheduledAt = sessionDate ? new Date(sessionDate).getTime() : 0;
  const durationHours = getNormalizedSessionDurationHours(session) || 1;
  const isoDate = sessionDate ? new Date(sessionDate).toISOString() : "";
  const credits = getNormalizedSessionCredits(session);

  // In the catalog, ACCEPTED + no learner = open slot, not a "confirmed" booking.
  const isOpenSlot = normalizedStatus === "ACCEPTED" && !session.learnerId;
  const catalogBadge = isOpenSlot ? "Open" : statusConfig.badge;

  return {
    id: session.sessionId,
    title: session.title?.trim() || categoryLabel,
    categoryId: session.categoryId || '',
    categoryKey: buildCategoryKey(categoryLabel),
    categoryLabel,
    categoryCode: buildCategoryCode(categoryLabel),
    categoryTheme: buildCategoryTheme(categoryLabel),
    mentorName,
    mentorUserId: teacher.userId || "",
    mentorInitials: buildInitials(teacher),
    learnerName: buildFullName(learner),
    learnerUserId: learner.userId || "",
    description: buildSessionDescription(session, mentorName),
    scheduledAt,
    durationHours,
    isoDate,
    date: formatDateLabel(sessionDate),
    time: formatTimeLabel(sessionDate),
    duration: formatDurationLabel(durationHours),
    credits: formatCreditLabel(credits),
    status: statusConfig.tabKey,
    badge: catalogBadge,
    googleMeetLink: session.googleMeetLink || "",
    sessionDescription: session.message || "",
    searchText: [
      session.title || "",
      categoryLabel,
      mentorName,
      buildFullName(learner),
      statusConfig.badge,
      session.message || "",
    ]
      .join(" ")
      .toLowerCase(),
    isOwnMentor: teacher.userId === viewerUserId,
  };
}
