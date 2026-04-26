import { useNavigate } from "react-router-dom";
import Header from "../Layout/Header/Header.jsx";
import ViewFrame from "../Layout/ViewFrame/ViewFrame.jsx";
import "./DashboardHome.css";

const stats = [
  {
    id: "credits",
    label: "Credits Balance",
    value: "12",
    note: "+3 this week",
    icon: "credits",
  },
  {
    id: "sessions",
    label: "Sessions Completed",
    value: "24",
    note: "All time",
    icon: "sessions",
  },
  {
    id: "skills",
    label: "Skills Listed",
    value: "5",
    note: "3 validated",
    icon: "skills",
  },
  {
    id: "validation",
    label: "Validation Score",
    value: "4.9",
    note: "Excellent",
    icon: "validation",
  },
];

const upcomingSessions = [
  {
    id: "spanish-conversation",
    initials: "SC",
    title: "Spanish Conversation",
    mentor: "Sarah Chen",
    time: "Today, 3:00 PM",
    duration: "1 hour",
  },
  {
    id: "ui-review",
    initials: "ER",
    title: "UI Feedback Session",
    mentor: "Elena Rodriguez",
    time: "Tomorrow, 11:30 AM",
    duration: "45 min",
  },
];

const recommendedSkills = [
  {
    id: "react-development",
    initials: "AK",
    title: "React Development",
    mentor: "Alex Kim",
    rating: "4.9",
    price: "1 credit/hr",
  },
  {
    id: "photography-basics",
    initials: "LM",
    title: "Photography Basics",
    mentor: "Leo Martin",
    rating: "5",
    price: "1 credit/hr",
  },
];

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

function StatIcon({ icon }) {
  switch (icon) {
    case "credits":
      return <CreditsIcon />;
    case "sessions":
      return <CalendarIcon />;
    case "skills":
      return <TrendIcon />;
    case "validation":
      return <ChatIcon />;
    default:
      return null;
  }
}

function DashboardHome() {
  const navigate = useNavigate();

  return (
    <ViewFrame header={<Header />}>
      <section className="dashboard-home">
        <div className="dashboard-home__hero">
          <h1>Welcome back, John!</h1>
          <p>You have 12 credits available</p>
        </div>

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
          <section className="dashboard-home__panel">
            <div className="dashboard-home__panel-header">
              <h2>Upcoming Sessions</h2>
              <button type="button" onClick={() => navigate("/app/sessions")}>
                View all
              </button>
            </div>

            <div className="dashboard-home__session-list">
              {upcomingSessions.map((session) => (
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
              ))}
            </div>
          </section>

          <section className="dashboard-home__panel">
            <div className="dashboard-home__panel-header">
              <h2>Recommended Skills to Learn</h2>
              <button type="button" onClick={() => navigate("/app/explore")}>
                Explore more
              </button>
            </div>

            <div className="dashboard-home__recommendation-list">
              {recommendedSkills.map((skill) => (
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
              ))}
            </div>
          </section>
        </div>
      </section>
    </ViewFrame>
  );
}

export default DashboardHome;
