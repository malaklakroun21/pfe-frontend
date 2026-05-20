import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { sessionApi } from "../../../api/client.js";
import { useAuthSession } from "../../../authSession.js";
import ViewFrame from "../Layout/ViewFrame/ViewFrame.jsx";
import {
  getNormalizedSessionSkillLabel,
  getNormalizedSessionStatus,
  mapDirectorySession,
} from "./sessionViewModel.js";
import "./Sessions.css";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4.25" y="5.75" width="15.5" height="14" rx="2.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 3.75v4M16 3.75v4M4.25 10h15.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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

function buildCategoryCards(sessionItems) {
  const categoryMap = new Map();

  sessionItems.forEach((session) => {
    const existingCategory = categoryMap.get(session.categoryKey);

    if (!existingCategory) {
      categoryMap.set(session.categoryKey, {
        key: session.categoryKey,
        label: session.categoryLabel,
        code: session.categoryCode,
        theme: session.categoryTheme,
        totalSessions: 1,
        mentorIds: new Set(session.mentorUserId ? [session.mentorUserId] : []),
        nextScheduledAt: session.scheduledAt || Number.POSITIVE_INFINITY,
        nextDateLabel: session.date,
      });

      return;
    }

    existingCategory.totalSessions += 1;

    if (session.mentorUserId) {
      existingCategory.mentorIds.add(session.mentorUserId);
    }

    if ((session.scheduledAt || Number.POSITIVE_INFINITY) < existingCategory.nextScheduledAt) {
      existingCategory.nextScheduledAt = session.scheduledAt || Number.POSITIVE_INFINITY;
      existingCategory.nextDateLabel = session.date;
    }
  });

  return [...categoryMap.values()]
    .map((category) => ({
      ...category,
      mentorCount: category.mentorIds.size,
    }))
    .sort((left, right) => {
      if (right.totalSessions !== left.totalSessions) {
        return right.totalSessions - left.totalSessions;
      }

      return left.label.localeCompare(right.label);
    });
}

function buildPendingRequestKey(mentorUserId, skillLabel) {
  return `${mentorUserId || ""}::${String(skillLabel).trim().toLowerCase()}`;
}

function buildJoinRequestDate(session, nowTimestamp) {
  if (session.isoDate && session.scheduledAt > nowTimestamp) {
    return session.isoDate;
  }

  return new Date(nowTimestamp + 24 * 60 * 60 * 1000).toISOString();
}

function getCurrentTimestamp() {
  return Date.now();
}

function Sessions() {
  const { categoryKey = "" } = useParams();
  const { user } = useAuthSession();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionItems, setSessionItems] = useState([]);
  const [ownSessions, setOwnSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isJoiningSessionId, setIsJoiningSessionId] = useState("");
  const [isCancellingSessionId, setIsCancellingSessionId] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadSessionsDirectory() {
      setIsLoading(true);
      setErrorMessage("");
      setStatusMessage("");

      try {
        const [sessions, userSessions] = await Promise.all([sessionApi.listDirectory(), sessionApi.list()]);

        if (!isActive) {
          return;
        }

        setSessionItems(
          (Array.isArray(sessions) ? sessions : []).map((session) =>
            mapDirectorySession(session, user?.userId),
          ),
        );
        setOwnSessions(Array.isArray(userSessions) ? userSessions : []);
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

    loadSessionsDirectory();

    return () => {
      isActive = false;
    };
  }, [user?.userId]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const categoryCards = useMemo(() => buildCategoryCards(sessionItems), [sessionItems]);
  const selectedCategory = categoryCards.find((category) => category.key === categoryKey) || null;
  const isCategoryRoute = categoryKey.length > 0;
  const isUnknownCategory = isCategoryRoute && !isLoading && !selectedCategory;

  const visibleCategoryCards = useMemo(() => {
    return categoryCards.filter((category) => {
      if (!normalizedSearch) {
        return true;
      }

      return [category.label, category.code].join(" ").toLowerCase().includes(normalizedSearch);
    });
  }, [categoryCards, normalizedSearch]);

  const filteredSessions = useMemo(() => {
    return sessionItems.filter((session) => {
      const matchesCategory = categoryKey ? session.categoryKey === categoryKey : false;
      const matchesSearch = !normalizedSearch || session.searchText.includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [categoryKey, normalizedSearch, sessionItems]);

  const activeSearchPlaceholder = selectedCategory
    ? `Search mentors or sessions in ${selectedCategory.label}...`
    : "Search a formation category...";

  const pendingRequestMap = useMemo(() => {
    const requestMap = new Map();

    ownSessions.forEach((session) => {
      if (getNormalizedSessionStatus(session) !== "PENDING" || session.learnerId !== user?.userId) {
        return;
      }

      const requestKey = buildPendingRequestKey(session.teacherId, getNormalizedSessionSkillLabel(session));

      if (!requestMap.has(requestKey)) {
        requestMap.set(requestKey, session.sessionId);
      }
    });

    return requestMap;
  }, [ownSessions, user?.userId]);

  function getPendingRequestSessionId(session) {
    if (session.status === "pending" && session.learnerUserId === user?.userId) {
      return session.id;
    }

    const requestKey = buildPendingRequestKey(session.mentorUserId, session.categoryLabel);
    return pendingRequestMap.get(requestKey) || "";
  }

  async function handleJoinSession(session) {
    if (!session.mentorUserId || session.isOwnMentor || isJoiningSessionId) {
      return;
    }

    setErrorMessage("");
    setStatusMessage("");
    setIsJoiningSessionId(session.id);

    try {
      const nowTimestamp = getCurrentTimestamp();
      const createdSession = await sessionApi.request({
        teacherId: session.mentorUserId,
        skill: session.categoryLabel,
        duration: session.durationHours,
        date: buildJoinRequestDate(session, nowTimestamp),
        message: `I'd like to join a ${session.categoryLabel} session with ${session.mentorName}.`,
      });

      setOwnSessions((currentSessions) => [createdSession, ...currentSessions]);
      setStatusMessage(`Join request sent to ${session.mentorName}.`);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsJoiningSessionId("");
    }
  }

  async function handleCancelRequest(session, pendingRequestSessionId) {
    if (!pendingRequestSessionId || isCancellingSessionId) {
      return;
    }

    setErrorMessage("");
    setStatusMessage("");
    setIsCancellingSessionId(session.id);

    try {
      await sessionApi.cancel(pendingRequestSessionId);
      setOwnSessions((currentSessions) =>
        currentSessions.map((currentSession) =>
          currentSession.sessionId === pendingRequestSessionId
            ? {
                ...currentSession,
                status: "REJECTED",
              }
            : currentSession,
        ),
      );
      setSessionItems((currentSessions) =>
        currentSessions.map((currentSession) =>
          currentSession.id === pendingRequestSessionId
            ? {
                ...currentSession,
                status: "cancelled",
                badge: "Cancelled",
              }
            : currentSession,
        ),
      );
      setStatusMessage(`Pending request cancelled for ${session.mentorName}.`);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsCancellingSessionId("");
    }
  }

  return (
    <ViewFrame
      header={
        <header className="sessions-page__header">
          <h1>{selectedCategory ? selectedCategory.label : "Explore Formations"}</h1>
        </header>
      }
    >
      <section className="sessions-page">
        <div className="sessions-page__controls">
          <div className="sessions-page__content-inner">
            <div className="sessions-page__toolbar">
              <label className="sessions-page__search" aria-label="Search sessions">
                <span className="sessions-page__search-icon">
                  <SearchIcon />
                </span>

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={activeSearchPlaceholder}
                  aria-label={activeSearchPlaceholder}
                />
              </label>

              <p className="sessions-page__summary-text">
                {selectedCategory
                  ? `${filteredSessions.length} session${filteredSessions.length === 1 ? "" : "s"}`
                  : `${visibleCategoryCards.length} categor${visibleCategoryCards.length === 1 ? "y" : "ies"}`}
              </p>

              <button
                type="button"
                className="sessions-page__create-button"
                onClick={() => navigate("/app/profile?tab=sessions&createSession=1")}
              >
                Create Session
              </button>
            </div>
          </div>
        </div>

        <div className="sessions-page__content">
          <div className="sessions-page__content-inner">
            {errorMessage ? <p>{errorMessage}</p> : null}
            {statusMessage ? <p className="sessions-page__status-message">{statusMessage}</p> : null}

            {isLoading ? (
              <div className="sessions-page__empty">Loading formations...</div>
            ) : isUnknownCategory ? (
              <section className="sessions-page__section sessions-page__section--sessions">
                <div className="sessions-page__section-header sessions-page__section-header--split">
                  <div>
                    <p className="sessions-page__eyebrow">Formation</p>
                    <h2>Category not found</h2>
                    <p className="sessions-page__section-copy">
                      This formation category does not exist anymore or has no sessions yet.
                    </p>
                  </div>
                </div>

                <Link className="sessions-page__back-link" to="/app/sessions">
                  Return to categories
                </Link>
              </section>
            ) : (
              <>
                {!isCategoryRoute ? (
                  <section className="sessions-page__section">
                    {visibleCategoryCards.length > 0 ? (
                      <div className="sessions-page__category-grid">
                        {visibleCategoryCards.map((category) => (
                          <Link
                            key={category.key}
                            to={`/app/sessions/${encodeURIComponent(category.key)}`}
                            className="sessions-page__category-card"
                            style={{
                              "--sessions-category-from": category.theme.from,
                              "--sessions-category-to": category.theme.to,
                              "--sessions-category-soft": category.theme.soft,
                              "--sessions-category-ink": category.theme.ink,
                            }}
                          >
                            <span className="sessions-page__category-badge">{category.code}</span>
                            <strong>{category.label}</strong>
                            <span className="sessions-page__category-stat">
                              {category.totalSessions} session{category.totalSessions === 1 ? "" : "s"}
                            </span>
                            <span className="sessions-page__category-meta">
                              {category.mentorCount} mentor{category.mentorCount === 1 ? "" : "s"}
                            </span>
                            <span className="sessions-page__category-date">Next: {category.nextDateLabel}</span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="sessions-page__empty">No categories match this search yet.</div>
                    )}
                  </section>
                ) : null}

                {selectedCategory && isCategoryRoute ? (
                  <section className="sessions-page__section sessions-page__section--sessions">
                    <div className="sessions-page__section-header sessions-page__section-header--split">
                      <div>
                        <p className="sessions-page__eyebrow">Sessions</p>
                        <h2>{selectedCategory.label}</h2>
                        <p className="sessions-page__section-copy">
                          Browse the available sessions and mentors for this formation.
                        </p>
                      </div>
                    </div>

                    <Link className="sessions-page__back-link" to="/app/sessions">
                      Return to categories
                    </Link>

                    {filteredSessions.length > 0 ? (
                      <div className="sessions-page__catalog-grid">
                        {filteredSessions.map((session) => (
                          (() => {
                            const pendingRequestSessionId = getPendingRequestSessionId(session);
                            const hasPendingRequest = Boolean(pendingRequestSessionId);
                            const hideActionButton =
                              session.isOwnMentor ||
                              session.status === "completed" ||
                              session.status === "upcoming";

                            return (
                              <article
                                key={session.id}
                                className="sessions-page__catalog-card"
                                style={{
                                  "--sessions-category-from": session.categoryTheme.from,
                                  "--sessions-category-to": session.categoryTheme.to,
                                  "--sessions-category-soft": session.categoryTheme.soft,
                                  "--sessions-category-ink": session.categoryTheme.ink,
                                }}
                              >
                                <span className="sessions-page__catalog-badge">{session.mentorInitials}</span>
                                <strong title={session.mentorName}>{session.mentorName}</strong>
                                <span className="sessions-page__catalog-subtitle">
                                  {hasPendingRequest ? "Pending Request" : session.badge}
                                </span>

                                <div className="sessions-page__catalog-meta">
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
                                    <span>{session.duration}</span>
                                  </span>
                                </div>

                                <span className="sessions-page__catalog-date">{session.time}</span>
                                <span className="sessions-page__catalog-foot">{session.credits}</span>
                                {!hideActionButton ? (
                                  <button
                                    type="button"
                                    className="sessions-page__join-button"
                                    disabled={
                                      isJoiningSessionId === session.id ||
                                      isCancellingSessionId === session.id
                                    }
                                    onClick={() =>
                                      hasPendingRequest
                                        ? handleCancelRequest(session, pendingRequestSessionId)
                                        : handleJoinSession(session)
                                    }
                                  >
                                    {isJoiningSessionId === session.id
                                      ? "Joining..."
                                      : isCancellingSessionId === session.id
                                        ? "Cancelling..."
                                        : hasPendingRequest
                                          ? "Cancel"
                                          : "Join"}
                                  </button>
                                ) : null}
                              </article>
                            );
                          })()
                        ))}
                      </div>
                    ) : (
                      <div className="sessions-page__empty">
                        No sessions match this category yet.
                      </div>
                    )}
                  </section>
                ) : null}
              </>
            )}
          </div>
        </div>
      </section>
    </ViewFrame>
  );
}

export default Sessions;
