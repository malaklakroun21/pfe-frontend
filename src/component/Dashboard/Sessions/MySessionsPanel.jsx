import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sessionApi } from "../../../api/client.js";
import SessionConfirmationCard from "../../Mechanics/SessionConfirmationCard.jsx";
import { useAuthSession } from "../../../authSession.js";
import { mapOwnedSession, mySessionTabs } from "./sessionViewModel.js";
import "./Sessions.css";

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

function MySessionsPanel({ embedded = false }) {
  const navigate = useNavigate();
  const { user } = useAuthSession();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [sessionItems, setSessionItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isCancellingSessionId, setIsCancellingSessionId] = useState("");
  const [confirmingSessionId, setConfirmingSessionId] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadSessions() {
      if (!user?.userId) {
        if (isActive) {
          setSessionItems([]);
          setIsLoading(false);
        }

        return;
      }

      setIsLoading(true);
      setErrorMessage("");
      setStatusMessage("");

      try {
        const sessions = await sessionApi.list();

        if (!isActive) {
          return;
        }

        setSessionItems((Array.isArray(sessions) ? sessions : []).map((session) => mapOwnedSession(session, user.userId)));
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
      mySessionTabs.reduce((counts, tab) => {
        counts[tab.key] = sessionItems.filter((item) => item.status === tab.key).length;
        return counts;
      }, {}),
    [sessionItems]
  );

  const filteredSessions = sessionItems.filter((item) => item.status === activeTab);

  async function handleConfirmSession(session) {
    if (!session?.id || confirmingSessionId) {
      return;
    }

    setErrorMessage("");
    setStatusMessage("");
    setConfirmingSessionId(session.id);

    try {
      await sessionApi.confirm(session.id);
      const sessions = await sessionApi.list();

      setSessionItems(
        (Array.isArray(sessions) ? sessions : []).map((item) =>
          mapOwnedSession(item, user.userId),
        ),
      );
      setStatusMessage("Session confirmation recorded.");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setConfirmingSessionId("");
    }
  }

  async function handleCancelSession(sessionId) {
    if (!sessionId || isCancellingSessionId) {
      return;
    }

    setErrorMessage("");
    setStatusMessage("");
    setIsCancellingSessionId(sessionId);

    try {
      await sessionApi.cancel(sessionId);

      setSessionItems((currentSessions) =>
        currentSessions.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                status: "cancelled",
                badge: "Cancelled",
                canCancel: false,
              }
            : session,
        ),
      );
      setStatusMessage("Session request cancelled.");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsCancellingSessionId("");
    }
  }

  return (
    <section className={`sessions-page ${embedded ? "sessions-page--embedded" : ""}`}>
      <div className="sessions-page__tabs">
        <div className="sessions-page__tabs-inner">
          {mySessionTabs.map((tab) => {
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
          {statusMessage ? <p className="sessions-page__status-message">{statusMessage}</p> : null}

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
                        <span className={`sessions-page__badge sessions-page__badge--${session.status}`}>
                          {session.badge}
                        </span>
                      </div>

                      <div className="sessions-page__actions">
                        <button
                          type="button"
                          className="sessions-page__action sessions-page__action--ghost"
                          disabled={!session.canCancel || isCancellingSessionId === session.id}
                          onClick={() => {
                            if (session.canCancel) {
                              handleCancelSession(session.id);
                            }
                          }}
                        >
                          {session.status === "completed"
                            ? "Review"
                            : isCancellingSessionId === session.id
                              ? "Cancelling..."
                              : "Cancel"}
                        </button>

                        <button
                          type="button"
                          className="sessions-page__action sessions-page__action--primary"
                          onClick={() => {
                            if (!session.participantUserId) {
                              return;
                            }

                            if (session.status === "completed") {
                              navigate(`/app/profile/${encodeURIComponent(session.participantUserId)}`);
                              return;
                            }

                            navigate(`/app/messages?user=${encodeURIComponent(session.participantUserId)}`);
                          }}
                        >
                          {session.status === "completed" ? "Book Again" : "Message"}
                        </button>
                      </div>
                    </div>

                    <p>with {session.participantName}</p>

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

                    {session.rawStatus === "ACCEPTED" || session.rawStatus === "COMPLETED" ? (
                      <SessionConfirmationCard
                        session={session}
                        currentUserId={user.userId}
                        onConfirm={handleConfirmSession}
                        isSubmitting={confirmingSessionId === session.id}
                      />
                    ) : null}
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
  );
}

export default MySessionsPanel;
