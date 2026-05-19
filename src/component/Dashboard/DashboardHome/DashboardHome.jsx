import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "../../../api/client.js";
import LevelCard from "../../XP/LevelCard.jsx";
import Header from "../Layout/Header/Header.jsx";
import ViewFrame from "../Layout/ViewFrame/ViewFrame.jsx";
import "./DashboardHome.css";

function CreditsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="5.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M10 7.2v5.6M7.2 10H12.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M15.4 13.6a4.85 4.85 0 1 1 0 6.85"
        stroke="currentColor"
        strokeWidth="1.8"
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

function XpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.75 15.75 8.25l5.25.75-3.8 3.7.9 5.2L12 15.5l-5.4 2.9.9-5.2-3.8-3.7 5.25-.75L12 3.75Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m5 15 4.2-4.2 3.2 3.2L19 7.5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.75 7.5H19v5.25"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.25 5.25h11.5A2.25 2.25 0 0 1 20 7.5v7a2.25 2.25 0 0 1-2.25 2.25H10l-4.75 3v-3H6.25A2.25 2.25 0 0 1 4 14.5v-7a2.25 2.25 0 0 1 2.25-2.25Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="m12 3.55 2.58 5.22 5.77.84-4.18 4.08.99 5.75L12 16.73l-5.16 2.71.99-5.75-4.18-4.08 5.77-.84L12 3.55Z" />
    </svg>
  );
}

function ValidationPendingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.5v5l3 2.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ValidationApprovedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.75 17.5 6v6.1c0 3.12-2.08 5.98-5.5 8.15-3.42-2.17-5.5-5.03-5.5-8.15V6L12 3.75Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m9.5 11.75 1.6 1.65 3-3.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ValidationRejectedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="m9 9 6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function StatIcon({ icon }) {
  switch (icon) {
    case "xp":
      return <XpIcon />;
    case "credits":
      return <CreditsIcon />;
    case "sessions":
      return <CalendarIcon />;
    case "skills":
      return <TrendIcon />;
    case "validation":
      return <ChatIcon />;
    case "validation-pending":
      return <ValidationPendingIcon />;
    case "validation-approved":
      return <ValidationApprovedIcon />;
    case "validation-rejected":
      return <ValidationRejectedIcon />;
    default:
      return null;
  }
}

function formatSubmittedAt(value) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Recently";
  }

  return parsedDate.toLocaleString();
}

function DashboardHome() {
  const navigate = useNavigate();
  const [pageData, setPageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadOverview() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const overview = await dashboardApi.getOverview();

        if (!isActive) {
          return;
        }

        setPageData(overview);
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

    loadOverview();

    return () => {
      isActive = false;
    };
  }, []);

  const stats = pageData?.stats || [];
  const upcomingSessions = pageData?.upcomingSessions || [];
  const recommendedSkills = pageData?.recommendedSkills || [];
  const pendingValidationRequests = pageData?.pendingValidationRequests || [];
  const recentValidationActivity = pageData?.recentValidationActivity || [];
  const validationOverview = pageData?.validationOverview || null;
  const xpProfile = pageData?.xp || null;
  const isMentorDashboard = pageData?.role === "mentor";
  const welcomeName = pageData?.welcome?.firstName || "Member";
  const isFirstVisit = Boolean(pageData?.welcome?.isFirstVisit);
  const creditsAvailable = pageData?.creditsAvailable ?? 0;
  const xpLevelLabel = xpProfile
    ? `Level ${xpProfile.level} · ${xpProfile.levelTitle}`
    : null;
  const welcomeHeading = isFirstVisit
    ? `Welcome, ${welcomeName}!`
    : `Welcome back, ${welcomeName}!`;
  const heroDescription = isMentorDashboard
    ? [
        xpLevelLabel,
        validationOverview?.pending
          ? `${validationOverview.pending} validation request${validationOverview.pending === 1 ? "" : "s"} waiting`
          : "No pending validation requests",
      ]
        .filter(Boolean)
        .join(" · ")
    : [xpLevelLabel, `${creditsAvailable} credits available`].filter(Boolean).join(" · ");

  return (
    <ViewFrame header={<Header />}>
      <section className="dashboard-home">
        <div className="dashboard-home__hero">
          <h1>{welcomeHeading}</h1>
          <p>{heroDescription}</p>
        </div>

        {errorMessage ? <p>{errorMessage}</p> : null}

        {isLoading ? (
          <p>Loading dashboard...</p>
        ) : (
          <>
            {xpProfile ? (
              <div className="dashboard-home__xp">
                <LevelCard xpProfile={xpProfile} showHistory />
              </div>
            ) : null}

            <div className="dashboard-home__stats">
              {stats.map((stat) => (
                <article key={stat.id} className="dashboard-home__stat-card">
                  <div className="dashboard-home__stat-topline">
                    <span>{stat.label}</span>
                    <span className="dashboard-home__stat-icon">
                      <StatIcon icon={stat.icon} />
                    </span>
                  </div>

                  <strong>{stat.value}</strong>
                  <p>{stat.note}</p>
                </article>
              ))}
            </div>

            <div className="dashboard-home__content-grid">
              {isMentorDashboard ? (
                <section className="dashboard-home__panel">
                  <div className="dashboard-home__panel-header">
                    <h2>Pending validation requests</h2>
                    <button type="button" onClick={() => navigate("/app/validation")}>
                      Review all
                    </button>
                  </div>

                  <div className="dashboard-home__session-list">
                    {pendingValidationRequests.length > 0 ? (
                      pendingValidationRequests.map((request) => (
                        <article key={request.id} className="dashboard-home__session-card">
                          <div className="dashboard-home__avatar">{request.initials}</div>
                          <div className="dashboard-home__session-copy">
                            <h3>{request.skillName}</h3>
                            <p>from {request.learnerName}</p>
                            <span>{formatSubmittedAt(request.submittedAt)}</span>
                          </div>
                        </article>
                      ))
                    ) : (
                      <p>No pending validation requests.</p>
                    )}
                  </div>
                </section>
              ) : null}

              <section className="dashboard-home__panel">
                <div className="dashboard-home__panel-header">
                  <h2>Upcoming Sessions</h2>
                  <button type="button" onClick={() => navigate("/app/skills?tab=sessions")}>
                    View all
                  </button>
                </div>

                <div className="dashboard-home__session-list">
                  {upcomingSessions.length > 0 ? (
                    upcomingSessions.map((session) => (
                      <article key={session.id} className="dashboard-home__session-card">
                        <div className="dashboard-home__avatar">{session.initials}</div>

                        <div className="dashboard-home__session-copy">
                          <h3>{session.title}</h3>
                          <p>with {session.mentor}</p>
                          <span>
                            {session.time}
                            <i aria-hidden="true" />
                            {session.duration}
                          </span>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p>No upcoming sessions yet.</p>
                  )}
                </div>
              </section>

              <section className="dashboard-home__panel">
                <div className="dashboard-home__panel-header">
                  <h2>
                    {isMentorDashboard ? "Recent validation activity" : "Recommended Skills to Learn"}
                  </h2>
                  <button
                    type="button"
                    onClick={() => navigate(isMentorDashboard ? "/app/validation" : "/app/explore")}
                  >
                    {isMentorDashboard ? "Open inbox" : "Explore more"}
                  </button>
                </div>

                <div className="dashboard-home__recommendation-list">
                  {isMentorDashboard ? (
                    recentValidationActivity.length > 0 ? (
                      recentValidationActivity.map((activity) => (
                        <article
                          key={activity.id}
                          className="dashboard-home__recommendation-card dashboard-home__activity-card"
                        >
                          <div className="dashboard-home__recommendation-copy">
                            <h3>{activity.skillName}</h3>
                            <p>{activity.learnerName}</p>
                          </div>

                          <div className="dashboard-home__recommendation-meta">
                            <span
                              className={`dashboard-home__activity-pill dashboard-home__activity-pill--${String(activity.status || "").toLowerCase()}`}
                            >
                              {activity.status === "VALIDATED"
                                ? `Validated · ${activity.validationScore}/100`
                                : activity.status === "REJECTED"
                                  ? "Rejected"
                                  : activity.status}
                            </span>
                          </div>
                        </article>
                      ))
                    ) : (
                      <p>No validation activity yet.</p>
                    )
                  ) : recommendedSkills.length > 0 ? (
                    recommendedSkills.map((skill) => (
                      <article key={skill.id} className="dashboard-home__recommendation-card">
                        <div className="dashboard-home__avatar">{skill.initials}</div>

                        <div className="dashboard-home__recommendation-copy">
                          <h3>{skill.title}</h3>
                          <p>{skill.mentor}</p>
                        </div>

                        <div className="dashboard-home__recommendation-meta">
                          <div className="dashboard-home__rating">
                            <span className="dashboard-home__rating-icon">
                              <StarIcon />
                            </span>
                            <strong>{skill.rating}</strong>
                          </div>

                          <span>{skill.price}</span>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p>No recommendations available yet.</p>
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </section>
    </ViewFrame>
  );
}

export default DashboardHome;
