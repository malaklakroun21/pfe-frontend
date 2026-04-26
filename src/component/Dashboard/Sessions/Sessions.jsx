import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotificationsState } from "../Notifications/notificationsStore.js";
import ViewFrame from "../Layout/ViewFrame/ViewFrame.jsx";
import "./Sessions.css";

const sessionTabs = [
  { key: "upcoming", label: "Upcoming" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const sessionItems = [
  {
    id: "spanish-conversation",
    initials: "SC",
    title: "Spanish Conversation",
    mentor: "Sarah Chen",
    date: "Apr 11, 2026",
    time: "3:00 PM",
    duration: "1 hour",
    credits: "1 credits",
    status: "upcoming",
    badge: "Confirmed",
  },
  {
    id: "guitar-basics",
    initials: "MJ",
    title: "Guitar Basics",
    mentor: "Marcus Johnson",
    date: "Apr 12, 2026",
    time: "10:00 AM",
    duration: "1.5 hours",
    credits: "1.5 credits",
    status: "upcoming",
    badge: "Confirmed",
  },
  {
    id: "react-mentoring",
    initials: "AK",
    title: "React Mentoring",
    mentor: "Alex Kim",
    date: "Apr 14, 2026",
    time: "1:30 PM",
    duration: "1 hour",
    credits: "1 credits",
    status: "pending",
    badge: "Pending",
  },
  {
    id: "ui-review",
    initials: "ER",
    title: "UI Review Session",
    mentor: "Elena Rodriguez",
    date: "Apr 08, 2026",
    time: "4:00 PM",
    duration: "1 hour",
    credits: "1 credits",
    status: "completed",
    badge: "Completed",
  },
  {
    id: "brand-strategy",
    initials: "AH",
    title: "Brand Strategy",
    mentor: "Amina Haddad",
    date: "Apr 05, 2026",
    time: "2:00 PM",
    duration: "1.5 hours",
    credits: "1.5 credits",
    status: "completed",
    badge: "Completed",
  },
  {
    id: "illustration-intro",
    initials: "LM",
    title: "Illustration Intro",
    mentor: "Leo Martin",
    date: "Apr 03, 2026",
    time: "11:00 AM",
    duration: "45 min",
    credits: "0.5 credits",
    status: "cancelled",
    badge: "Cancelled",
  },
];

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
  const { unreadCount } = useNotificationsState();
  const [activeTab, setActiveTab] = useState("upcoming");

  const tabCounts = useMemo(
    () =>
      sessionTabs.reduce((counts, tab) => {
        counts[tab.key] = sessionItems.filter((item) => item.status === tab.key).length;
        return counts;
      }, {}),
    []
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
            <div className="sessions-page__list">
              {filteredSessions.map((session) => (
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
                            if (session.status !== "completed") {
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
              ))}
            </div>
          </div>
        </div>
      </section>
    </ViewFrame>
  );
}

export default Sessions;
