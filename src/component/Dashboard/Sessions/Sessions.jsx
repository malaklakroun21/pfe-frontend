import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { projectApi, sessionApi } from "../../../api/client.js";
import { useAuthSession } from "../../../authSession.js";
import PageHeader from "../Layout/PageHeader/PageHeader.jsx";
import ViewFrame from "../Layout/ViewFrame/ViewFrame.jsx";
import {
  buildCategoryCode,
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

const CATEGORY_THEMES = [
  { from: "#ff8a3d", to: "#d9481e", soft: "#fff0e3", ink: "#7b2f10" },
  { from: "#2f80ed", to: "#1c4dd9", soft: "#eaf2ff", ink: "#16357f" },
  { from: "#00a67d", to: "#0b7a69", soft: "#e8fbf5", ink: "#12584f" },
  { from: "#7b61ff", to: "#5a35e6", soft: "#f1ecff", ink: "#4a2fb8" },
  { from: "#ef476f", to: "#c4305b", soft: "#ffe8ef", ink: "#912042" },
  { from: "#f2c94c", to: "#d8901a", soft: "#fff6dc", ink: "#8b5b08" },
];

function getCategoryTheme(index) {
  return CATEGORY_THEMES[index % CATEGORY_THEMES.length];
}

function buildPendingRequestKey(mentorUserId, skillLabel) {
  return `${mentorUserId || ""}::${String(skillLabel).trim().toLowerCase()}`;
}


const EMPTY_CREATE_FORM = {
  title: "",
  description: "",
  categoryId: "",
  date: "",
  sessionCredits: "1",
  googleMeetLink: "",
};

function Sessions() {
  const { categoryKey: categoryId = "" } = useParams();
  const { user } = useAuthSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [apiCategories, setApiCategories] = useState([]);
  const [sessionItems, setSessionItems] = useState([]);
  const [ownSessions, setOwnSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isJoiningSessionId, setIsJoiningSessionId] = useState("");
  const [isCancellingSessionId, setIsCancellingSessionId] = useState("");

  // Create form state
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [createFormError, setCreateFormError] = useState("");
  const [canCreateSession, setCanCreateSession] = useState(false);

  // Check if current user is allowed to host sessions
  useEffect(() => {
    let isActive = true;
    sessionApi.canHost().then((result) => {
      if (isActive) setCanCreateSession(Boolean(result?.canHost));
    }).catch(() => {});
    return () => { isActive = false; };
  }, [user?.userId]);

  // Load API categories on mount
  useEffect(() => {
    let isActive = true;
    projectApi.listCategories().then((data) => {
      if (isActive) setApiCategories(Array.isArray(data) ? data : []);
    }).catch(() => {});
    return () => { isActive = false; };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadSessionsDirectory() {
      setIsLoading(true);
      setErrorMessage("");
      setStatusMessage("");

      try {
        const [sessions, userSessions] = await Promise.all([
          sessionApi.listDirectory(),
          sessionApi.list(),
        ]);

        if (!isActive) return;

        setSessionItems(
          (Array.isArray(sessions) ? sessions : []).map((session) =>
            mapDirectorySession(session, user?.userId),
          ),
        );
        setOwnSessions(Array.isArray(userSessions) ? userSessions : []);
      } catch (error) {
        if (!isActive) return;
        setErrorMessage(error.message);
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadSessionsDirectory();

    return () => { isActive = false; };
  }, [user?.userId]);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const categoryCards = useMemo(() => {
    return apiCategories.map((cat) => {
      const sessionsInCategory = sessionItems.filter(
        (s) => s.categoryId === cat.categoryId,
      );
      const mentorIds = new Set(
        sessionsInCategory.map((s) => s.mentorUserId).filter(Boolean),
      );
      const now = Date.now();
      const upcoming = sessionsInCategory
        .filter((s) => s.scheduledAt > now)
        .sort((a, b) => a.scheduledAt - b.scheduledAt)[0];
      return {
        ...cat,
        totalSessions: sessionsInCategory.length,
        mentorCount: mentorIds.size,
        nextDateLabel: upcoming?.date || "—",
      };
    });
  }, [apiCategories, sessionItems]);

  const selectedCategory = useMemo(
    () => categoryCards.find((cat) => cat.categoryId === categoryId) || null,
    [categoryCards, categoryId],
  );

  const isCategoryRoute = categoryId.length > 0;
  const isUnknownCategory = isCategoryRoute && !isLoading && !selectedCategory;

  const visibleCategoryCards = useMemo(() => {
    return categoryCards.filter((cat) => {
      if (!normalizedSearch) return true;
      return [cat.categoryName, buildCategoryCode(cat.categoryName)]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [categoryCards, normalizedSearch]);

  const filteredSessions = useMemo(() => {
    return sessionItems.filter((session) => {
      const matchesCategory = categoryId ? session.categoryId === categoryId : false;
      const matchesSearch = !normalizedSearch || session.searchText.includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });
  }, [categoryId, normalizedSearch, sessionItems]);

  const activeSearchPlaceholder = selectedCategory
    ? `Search mentors or sessions in ${selectedCategory.categoryName}...`
    : "Search a formation category...";

  // Direct maps keyed by catalog session id — updated immediately on join/cancel/accept.
  // catalogSessionId → requestSessionId
  const [pendingJoinMap, setPendingJoinMap] = useState(() => new Map());
  const [acceptedJoinMap, setAcceptedJoinMap] = useState(() => new Map());

  // Seed maps from ownSessions once they load (pre-existing requests from the server).
  const seededRef = useMemo(() => ({ done: false }), []);
  useEffect(() => {
    if (!ownSessions.length || seededRef.done) return;
    seededRef.done = true;

    const pending = new Map();
    const accepted = new Map();

    ownSessions.forEach((owned) => {
      if (owned.learnerId !== user?.userId) return;
      const status = getNormalizedSessionStatus(owned);
      if (status !== "PENDING" && status !== "ACCEPTED") return;

      // Match owned session to catalog session by teacher + skill key.
      const key = buildPendingRequestKey(
        owned.teacherId,
        getNormalizedSessionSkillLabel(owned),
      );

      sessionItems.forEach((catalog) => {
        const catalogKey = buildPendingRequestKey(catalog.mentorUserId, catalog.categoryLabel);
        if (catalogKey !== key) return;
        if (status === "PENDING") pending.set(catalog.id, owned.sessionId);
        else accepted.set(catalog.id, owned.sessionId);
      });
    });

    if (pending.size) setPendingJoinMap(pending);
    if (accepted.size) setAcceptedJoinMap(accepted);
  }, [ownSessions, sessionItems, user?.userId, seededRef]);

  function getPendingRequestSessionId(catalogSessionId) {
    return pendingJoinMap.get(catalogSessionId) || "";
  }

  function getAcceptedRequestSessionId(catalogSessionId) {
    return acceptedJoinMap.get(catalogSessionId) || "";
  }

  function handleOpenCreateForm() {
    setCreateFormError("");
    setCreateForm({ ...EMPTY_CREATE_FORM, categoryId: categoryId || "" });
    setIsCreateFormOpen(true);
  }

  function handleCloseCreateForm() {
    setIsCreateFormOpen(false);
    setCreateForm(EMPTY_CREATE_FORM);
    setCreateFormError("");
  }

  function handleChangeCreateField(field, value) {
    setCreateFormError("");
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmitCreateForm(event) {
    event.preventDefault();
    if (isCreatingSession) return;

    const parsedDate = new Date(createForm.date);
    if (Number.isNaN(parsedDate.getTime())) {
      setCreateFormError("Please choose a valid date and time.");
      return;
    }

    setCreateFormError("");
    setIsCreatingSession(true);

    try {
      const createdSession = await sessionApi.publish({
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        categoryId: createForm.categoryId || "",
        date: parsedDate.toISOString(),
        sessionCredits: Number(createForm.sessionCredits) || 0,
        googleMeetLink: createForm.googleMeetLink.trim(),
      });

      setSessionItems((prev) => [mapDirectorySession(createdSession, user?.userId), ...prev]);
      setStatusMessage("Session published successfully.");
      handleCloseCreateForm();
    } catch (error) {
      setCreateFormError(error.message);
    } finally {
      setIsCreatingSession(false);
    }
  }

  async function handleJoinSession(session) {
    if (session.isOwnMentor || isJoiningSessionId) return;

    setErrorMessage("");
    setStatusMessage("");
    setIsJoiningSessionId(session.id);

    try {
      const createdSession = await sessionApi.join(session.id);

      setOwnSessions((currentSessions) => [createdSession, ...currentSessions]);
      setPendingJoinMap((prev) => new Map(prev).set(session.id, createdSession.sessionId));
      setStatusMessage(`Join request sent to ${session.mentorName}.`);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsJoiningSessionId("");
    }
  }

  async function handleCancelRequest(session, pendingRequestSessionId) {
    if (!pendingRequestSessionId || isCancellingSessionId) return;

    setErrorMessage("");
    setStatusMessage("");
    setIsCancellingSessionId(session.id);

    try {
      await sessionApi.cancel(pendingRequestSessionId);
      setOwnSessions((currentSessions) =>
        currentSessions.map((currentSession) =>
          currentSession.sessionId === pendingRequestSessionId
            ? { ...currentSession, status: "REJECTED" }
            : currentSession,
        ),
      );
      setPendingJoinMap((prev) => {
        const next = new Map(prev);
        next.delete(session.id);
        return next;
      });
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
        <PageHeader title="Explore Sessions" />
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

              {canCreateSession ? (
                <button
                  type="button"
                  className="sessions-page__create-button"
                  onClick={handleOpenCreateForm}
                >
                  Create Session
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="sessions-page__content">
          <div className="sessions-page__content-inner">
            {errorMessage ? <p>{errorMessage}</p> : null}
            {statusMessage ? (
              <p className="sessions-page__status-message">{statusMessage}</p>
            ) : null}

            {isCreateFormOpen ? (
              <article className="sessions-page__create-card">
                <div className="sessions-page__create-head">
                  <div>
                    <p className="sessions-page__eyebrow">New session</p>
                    <h2>Create a session request</h2>
                  </div>
                </div>

                {createFormError ? (
                  <p className="sessions-page__create-error">{createFormError}</p>
                ) : null}

                <form className="sessions-page__create-form" onSubmit={handleSubmitCreateForm}>
                  <div className="sessions-page__create-grid">

                    {/* Title */}
                    <label className="sessions-page__create-field sessions-page__create-field--full">
                      <span>Title</span>
                      <input
                        type="text"
                        minLength={3}
                        maxLength={160}
                        value={createForm.title}
                        onChange={(e) => handleChangeCreateField("title", e.target.value)}
                        placeholder="e.g. Introduction to React Hooks"
                        required
                      />
                    </label>

                    {/* Category */}
                    <label className="sessions-page__create-field">
                      <span>Category</span>
                      <select
                        value={createForm.categoryId}
                        onChange={(e) => handleChangeCreateField("categoryId", e.target.value)}
                      >
                        <option value="">— No category —</option>
                        {apiCategories.map((cat) => (
                          <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                        ))}
                      </select>
                    </label>

                    {/* Hour */}
                    <label className="sessions-page__create-field">
                      <span>Hour</span>
                      <input
                        type="datetime-local"
                        value={createForm.date}
                        onChange={(e) => handleChangeCreateField("date", e.target.value)}
                        required
                      />
                    </label>

                    {/* Credits */}
                    <label className="sessions-page__create-field">
                      <span>Credits</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={createForm.sessionCredits}
                        onChange={(e) => handleChangeCreateField("sessionCredits", e.target.value)}
                        required
                      />
                    </label>

                    {/* Google Meet link */}
                    <label className="sessions-page__create-field">
                      <span>Google Meet</span>
                      <input
                        type="url"
                        value={createForm.googleMeetLink}
                        onChange={(e) => handleChangeCreateField("googleMeetLink", e.target.value)}
                        placeholder="give the googlemeet link"
                      />
                    </label>

                    {/* Description */}
                    <label className="sessions-page__create-field sessions-page__create-field--full">
                      <span>Description</span>
                      <textarea
                        rows="4"
                        value={createForm.description}
                        onChange={(e) => handleChangeCreateField("description", e.target.value)}
                        placeholder="Describe what learners will gain from this session."
                      />
                    </label>
                  </div>

                  <div className="sessions-page__create-actions">
                    <button
                      type="button"
                      className="sessions-page__action sessions-page__action--ghost"
                      onClick={handleCloseCreateForm}
                      disabled={isCreatingSession}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="sessions-page__action sessions-page__action--primary"
                      disabled={isCreatingSession}
                    >
                      {isCreatingSession ? "Creating..." : "Create Session"}
                    </button>
                  </div>
                </form>
              </article>
            ) : null}

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
                {/* ── View 1: Category grid ── */}
                {!isCategoryRoute ? (
                  <section className="sessions-page__section">
                    {visibleCategoryCards.length > 0 ? (
                      <div className="sessions-page__category-grid">
                        {visibleCategoryCards.map((category, index) => {
                          const theme = getCategoryTheme(index);
                          return (
                            <Link
                              key={category.categoryId}
                              to={`/app/sessions/${encodeURIComponent(category.categoryId)}`}
                              className="sessions-page__category-card"
                              style={{
                                "--sessions-category-from": theme.from,
                                "--sessions-category-to": theme.to,
                                "--sessions-category-soft": theme.soft,
                                "--sessions-category-ink": theme.ink,
                              }}
                            >
                              <span className="sessions-page__category-badge">
                                {buildCategoryCode(category.categoryName)}
                              </span>
                              <strong>{category.categoryName}</strong>
                              <span className="sessions-page__category-stat">
                                {category.totalSessions} session{category.totalSessions === 1 ? "" : "s"}
                              </span>
                              <span className="sessions-page__category-meta">
                                {category.mentorCount} mentor{category.mentorCount === 1 ? "" : "s"}
                              </span>
                              <span className="sessions-page__category-date">
                                Next: {category.nextDateLabel}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="sessions-page__empty">
                        No categories available yet.
                      </div>
                    )}
                  </section>
                ) : null}

                {/* ── View 2: Sessions in selected category ── */}
                {selectedCategory && isCategoryRoute ? (
                  <section className="sessions-page__section sessions-page__section--sessions">
                    <div className="sessions-page__section-header sessions-page__section-header--split">
                      <div>
                        <p className="sessions-page__eyebrow">Sessions</p>
                        <h2>{selectedCategory.categoryName}</h2>
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
                        {filteredSessions.map((session) => {
                          const pendingRequestSessionId = getPendingRequestSessionId(session.id);
                          const hasPendingRequest = Boolean(pendingRequestSessionId);
                          const hasAcceptedRequest = Boolean(getAcceptedRequestSessionId(session.id));
                          const isOwner = session.isOwnMentor;
                          const isCompleted = session.status === "completed";

                          let badgeLabel = session.badge;
                          if (!isOwner && hasPendingRequest) badgeLabel = "Pending Request";
                          if (!isOwner && hasAcceptedRequest) badgeLabel = "Accepted";

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
                              <span className="sessions-page__catalog-badge">
                                {session.mentorInitials}
                              </span>
                              <strong title={session.title}>{session.title}</strong>
                              <span className="sessions-page__catalog-host">
                                by {session.mentorName}
                              </span>
                              <span className="sessions-page__catalog-subtitle">
                                {badgeLabel}
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

                              {/* Meet link only visible once the owner accepted the request */}
                              {!isOwner && hasAcceptedRequest && session.googleMeetLink ? (
                                <a
                                  href={session.googleMeetLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="sessions-page__meet-link"
                                >
                                  Click to join
                                </a>
                              ) : null}

                              {/* Owner sees the meet link directly (it's their session) */}
                              {isOwner && session.googleMeetLink ? (
                                <a
                                  href={session.googleMeetLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="sessions-page__meet-link"
                                >
                                  Open Meet
                                </a>
                              ) : null}

                              {!isOwner && !isCompleted && !hasAcceptedRequest ? (
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
                                    ? "Sending..."
                                    : isCancellingSessionId === session.id
                                      ? "Cancelling..."
                                      : hasPendingRequest
                                        ? "Cancel request"
                                        : "Request to join"}
                                </button>
                              ) : null}
                            </article>
                          );
                        })}
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
