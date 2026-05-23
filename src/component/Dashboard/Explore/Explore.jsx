import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardApi, projectApi, sessionApi } from "../../../api/client.js";
import { useNotificationsState } from "../Notifications/notificationsStore.js";
import ViewFrame from "../Layout/ViewFrame/ViewFrame.jsx";
import "./Explore.css";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 17H5.5l1.6-2.13V10a4.9 4.9 0 1 1 9.8 0v4.87L18.5 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" width="16" height="16">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatShortDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(d);
}

function buildFullName(user) {
  if (!user) return "Unknown";
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unknown";
}

function SectionHeader({ title, onSeeAll }) {
  return (
    <div className="explore-section__head">
      <h2 className="explore-section__title">{title}</h2>
      <button type="button" className="explore-section__see-all" onClick={onSeeAll}>
        See all <ArrowIcon />
      </button>
    </div>
  );
}

function MentorCard({ mentor, onView }) {
  return (
    <article className="explore-page__card">
      <div className="explore-page__card-avatar">{mentor.initials}</div>
      <div className="explore-page__card-copy">
        <h3>{mentor.name}</h3>
        <div className="explore-page__rating">
          <span className="explore-page__rating-icon"><StarIcon /></span>
          <strong>{mentor.rating}</strong>
          <span>({mentor.reviews} reviews)</span>
        </div>
      </div>
      <div className="explore-page__skills-block">
        <p>Top Skills:</p>
        <div className="explore-page__skill-tags">
          {mentor.skills.map((skill) => (
            <span key={skill} className="explore-page__skill-tag">{skill}</span>
          ))}
        </div>
      </div>
      <div className="explore-page__card-footer">
        <span className="explore-page__price">{mentor.price}</span>
        <button type="button" className="explore-page__profile-button" onClick={() => onView(mentor.id)}>
          View Profile
        </button>
      </div>
    </article>
  );
}

function SessionCard({ session, onView }) {
  const teacherName = buildFullName(session.teacher);
  const dateLabel = formatShortDate(session.date);
  const duration = session.durationHours ?? session.duration;
  const durationLabel = duration ? `${duration}h` : "";

  return (
    <article className="explore-card explore-card--session">
      <div className="explore-card__top">
        <span className="explore-card__tag">{session.skillName || "Session"}</span>
        {durationLabel ? <span className="explore-card__duration">{durationLabel}</span> : null}
      </div>
      <p className="explore-card__teacher">by {teacherName}</p>
      {dateLabel ? <p className="explore-card__date">{dateLabel}</p> : null}
      <button type="button" className="explore-card__btn" onClick={() => onView(session.sessionId)}>
        View Session
      </button>
    </article>
  );
}

function ProjectCard({ project, onView }) {
  const memberCount = Array.isArray(project.members) ? project.members.length : 0;

  return (
    <article className="explore-card explore-card--project">
      <div className="explore-card__top">
        <span className="explore-card__tag explore-card__tag--project">{project.requiredSkill || "Open Project"}</span>
        <span className="explore-card__members">{memberCount} member{memberCount !== 1 ? "s" : ""}</span>
      </div>
      <h3 className="explore-card__title">{project.title}</h3>
      {project.description ? (
        <p className="explore-card__desc">{project.description}</p>
      ) : null}
      <button type="button" className="explore-card__btn explore-card__btn--project" onClick={() => onView(project.projectId)}>
        View Project
      </button>
    </article>
  );
}

function Explore() {
  const navigate = useNavigate();
  const { unreadCount } = useNotificationsState();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const [mentors, setMentors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function load() {
      setIsLoading(true);
      const [directoryResult, sessionsResult, projectsResult] = await Promise.allSettled([
        dashboardApi.getExploreDirectory(),
        sessionApi.listDirectory(),
        projectApi.list({ status: "OPEN", limit: "4" }),
      ]);

      if (!isActive) return;

      if (directoryResult.status === "fulfilled") {
        const dir = directoryResult.value;
        setCategories(Array.isArray(dir?.categories) ? dir.categories : ["All"]);
        setMentors(Array.isArray(dir?.mentors) ? dir.mentors : []);
      }

      if (sessionsResult.status === "fulfilled") {
        const raw = sessionsResult.value;
        const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.sessions) ? raw.sessions : []);
        setSessions(list.slice(0, 4));
      }

      if (projectsResult.status === "fulfilled") {
        const raw = projectsResult.value;
        const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.items) ? raw.items : []);
        setProjects(list.slice(0, 4));
      }

      setIsLoading(false);
    }

    load();
    return () => { isActive = false; };
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredMentors = mentors.filter((mentor) => {
    if (activeCategory !== "All" && mentor.category !== activeCategory) return false;
    if (!normalizedSearch) return true;
    return [mentor.name, mentor.category, ...(mentor.skills || [])].join(" ").toLowerCase().includes(normalizedSearch);
  }).slice(0, 6);

  return (
    <ViewFrame
      header={
        <header className="explore-page__header">
          <h1>Explore</h1>
          <button type="button" className="explore-page__notification-button" aria-label="Notifications" onClick={() => navigate("/app/notifications")}>
            <BellIcon />
            {unreadCount > 0 ? <span className="explore-page__notification-dot" aria-hidden="true" /> : null}
          </button>
        </header>
      }
    >
      <section className="explore-page">
        <div className="explore-page__controls">
          <div className="explore-page__inner">
            <label className="explore-page__search" aria-label="Search mentors">
              <span className="explore-page__search-icon"><SearchIcon /></span>
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search mentors by skill or name..."
                aria-label="Search mentors"
              />
            </label>
            <div className="explore-page__categories" aria-label="Skill categories">
              {categories.map((cat) => (
                <button key={cat} type="button" className={`explore-page__category ${activeCategory === cat ? "is-active" : ""}`} onClick={() => setActiveCategory(cat)} aria-pressed={activeCategory === cat}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="explore-page__results">
          <div className="explore-page__inner">
            {isLoading ? (
              <div className="explore-page__empty">Loading...</div>
            ) : (
              <>
                <div className="explore-section">
                  <SectionHeader title="Mentors" onSeeAll={() => navigate("/app/explore")} />
                  {filteredMentors.length > 0 ? (
                    <div className="explore-page__grid">
                      {filteredMentors.map((mentor) => (
                        <MentorCard key={mentor.id} mentor={mentor} onView={(id) => navigate(`/app/profile/${encodeURIComponent(id)}`)} />
                      ))}
                    </div>
                  ) : (
                    <div className="explore-page__empty">No mentors match this search yet.</div>
                  )}
                </div>

                <div className="explore-section">
                  <SectionHeader title="Sessions" onSeeAll={() => navigate("/app/sessions")} />
                  {sessions.length > 0 ? (
                    <div className="explore-cards-row">
                      {sessions.map((session) => (
                        <SessionCard key={session.sessionId} session={session} onView={() => navigate("/app/sessions")} />
                      ))}
                    </div>
                  ) : (
                    <div className="explore-page__empty">No open sessions right now.</div>
                  )}
                </div>

                <div className="explore-section">
                  <SectionHeader title="Projects" onSeeAll={() => navigate("/app/projects")} />
                  {projects.length > 0 ? (
                    <div className="explore-cards-row">
                      {projects.map((project) => (
                        <ProjectCard key={project.projectId} project={project} onView={(id) => navigate(`/app/projects/${encodeURIComponent(id)}`)} />
                      ))}
                    </div>
                  ) : (
                    <div className="explore-page__empty">No open projects right now.</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </ViewFrame>
  );
}

export default Explore;
