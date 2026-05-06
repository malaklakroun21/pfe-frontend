import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sessionApi } from "../../../api/client.js";
import { useAuthSession } from "../../../authSession.js";
import { useNotificationsState } from "../Notifications/notificationsStore.js";
import ViewFrame from "../Layout/ViewFrame/ViewFrame.jsx";
import "./Sessions.css";

const sessionTabs = [
  { key: "upcoming", label: "Upcoming" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
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
  COMPLETED: {
    tabKey: "completed",
    badge: "Completed",
  },
  REJECTED: {
    tabKey: "cancelled",
    badge: "Cancelled",
  },
};

function buildFullName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || user?.userId || "Unknown";
}

function buildInitials(user) {
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

function formatDateLabel(dateValue) {
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

function formatTimeLabel(dateValue) {
  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Time not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
}

function formatDurationLabel(duration) {
  if (!duration) {
    return "Not specified";
  }

  return duration === 1 ? "1 hour" : `${duration} hours`;
}

function formatCreditLabel(credits) {
  if (!credits) {
    return "0 credits";
  }

  return `${credits} credits`;
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 17H5.5l1.6-2.13V10a4.9 4.9 0 1 1 9.8 0v4.87L18.5 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 19a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4.25" y="5.75" width="15.5" height="14" rx="2.25" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M8 3.75v4M16 3.75v4M4.25 10h15.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 7.75v4.7l3.2 1.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.1" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M6.75 18.25a5.45 5.45 0 0 1 10.5 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Sessions() {
  const navigate = useNavigate();
  const { user } = useAuthSession();
  const { unreadCount } = useNotificationsState();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [sessionItems, setSessionItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadSessions() {
      if (!user?.userId) {
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const sessions = await sessionApi.list();

        if (!isActive) {
          return;
        }

        const mappedSessions = (Array.isArray(sessions) ? sessions : []).map((session) => {
          const statusConfig = sessionStatusMap[session.status] || sessionStatusMap.PENDING;
          const isTeacher = session.teacherId === user?.userId;
          const otherParticipant = isTeacher ? session.learner : session.teacher;

          return {
            id: session.sessionId,
            participantUserId: otherParticipant?.userId || "",
            initials: buildInitials(otherParticipant),
            title: session.skill,
            mentor: buildFullName(otherParticipant),
            date: formatDateLabel(session.date),
            time: formatTimeLabel(session.date),
            duration: formatDurationLabel(session.actualDuration || session.duration),
            credits: formatCreditLabel(session.chargedCredits || session.duration),
            status: statusConfig.tabKey,
            badge: statusConfig.badge,
          };
        });

        setSessionItems(mappedSessions);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage(error.message);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadSessions();

    return () => {
      isActive = false;
    };
  }, [user?.userId]);

  const tabCounts = useMemo(
    () =>
      sessionTabs.reduce((counts, tab) => {
        counts[tab.key] = sessionItems.filter((item) => item.status === tab.key).length;
        return counts;
      }, {}),
    [sessionItems]
  );

  const filteredSessions = sessionItems.filter((item) => item.status === activeTab);

  return (
    <ViewFrame
      header={
        <header className="sessions-page__header">
          <h1>My Sessions</h1>

          <button
            type="button"
            className="sessions-page__notification-button"
            aria-label="Notifications"
            onClick={() => navigate("/app/notifications")}
          >
            <BellIcon />
            {unreadCount > 0 ? (
              <span className="sessions-page__notification-dot" aria-hidden="true" />
            ) : null}
          </button>
        </header>
      }
    >
      <section className="sessions-page">
        <div className="sessions-page__tabs">
          <div className="sessions-page__tabs-inner">
            {sessionTabs.map((tab) => {
              const isActive = tab.key === activeTab;

              return (
                <button
                  key={tab.key}
                  type="button"
                  className={`sessions-page__tab ${isActive ? "is-active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                  aria-pressed={isActive}
                >
                  {tab.label} ({tabCounts[tab.key] ?? 0})
                </button>
              );
            })}
          </div>
        </div>

        <div className="sessions-page__content">
            <div className="sessions-page__content-inner">
              {errorMessage ? <p>{errorMessage}</p> : null}
              <div className="sessions-page__list">
                {isLoading ? (
                  <p>Loading sessions...</p>
                ) : filteredSessions.length > 0 ? (
                  filteredSessions.map((session) => (
                    <article key={session.id} className="sessions-page__card">
                      <div className="sessions-page__avatar">{session.initials}</div>

                      <div className="sessions-page__body">
                        <div className="sessions-page__topline">
                          <div className="sessions-page__title-group">
                            <h2>{session.title}</h2>
                            <span
                              className={`sessions-page__badge sessions-page__badge--${session.status}`}
                            >
                              {session.badge}
                            </span>
                          </div>

                          <div className="sessions-page__actions">
                            <button
                              type="button"
                              className="sessions-page__action sessions-page__action--ghost"
                            >
                              {session.status === "completed" ? "Review" : "Cancel"}
                            </button>

                            <button
                              type="button"
                              className="sessions-page__action sessions-page__action--primary"
                              onClick={() => {
                                if (session.participantUserId) {
                                  navigate("/app/messages");
                                }
                              }}
                            >
                              {session.status === "completed" ? "Book Again" : "Message"}
                            </button>
                          </div>
                        </div>

                        <p>with {session.mentor}</p>

                        <div className="sessions-page__meta">
                          <span className="sessions-page__meta-item">
                            <span className="sessions-page__meta-icon">
                              <CalendarIcon />
                            </span>
                            <span>{session.date}</span>
                          </span>

                          <span className="sessions-page__meta-item">
                            <span className="sessions-page__meta-icon">
                              <ClockIcon />
                            </span>
                            <span>{session.time}</span>
                          </span>

                          <span className="sessions-page__meta-item">
                            <span className="sessions-page__meta-icon">
                              <PersonIcon />
                            </span>
                            <span>{session.duration}</span>
                          </span>

                          <span className="sessions-page__credits">{session.credits}</span>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <p>No sessions found in this tab.</p>
                )}
              </div>
            </div>
          </div>
      </section>
    </ViewFrame>
  );
}

export default Sessions;
