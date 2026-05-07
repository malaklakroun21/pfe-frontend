import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "../../../api/client.js";
import { useNotificationsState } from "../Notifications/notificationsStore.js";
import ViewFrame from "../Layout/ViewFrame/ViewFrame.jsx";
import "./Explore.css";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="m20 20-3.5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
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

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3.75 6h16.5l-6.5 7.1v5.2l-3.5-1.95V13.1L3.75 6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
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

function Explore() {
  const navigate = useNavigate();
  const { unreadCount } = useNotificationsState();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const [mentorDirectory, setMentorDirectory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadExploreDirectory() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const directory = await dashboardApi.getExploreDirectory();

        if (!isActive) {
          return;
        }

        setCategories(Array.isArray(directory?.categories) ? directory.categories : ["All"]);
        setMentorDirectory(Array.isArray(directory?.mentors) ? directory.mentors : []);
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

    loadExploreDirectory();

    return () => {
      isActive = false;
    };
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredMentors = mentorDirectory.filter((mentor) => {
    const matchesCategory =
      activeCategory === "All" || mentor.category === activeCategory;

    if (!matchesCategory) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const searchableText = [
      mentor.name,
      mentor.category,
      mentor.skills.join(" "),
      mentor.price,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedSearch);
  });

  return (
    <ViewFrame
      header={
        <header className="explore-page__header">
          <h1>Explore Skills</h1>

          <button
            type="button"
            className="explore-page__notification-button"
            aria-label="Notifications"
            onClick={() => navigate("/app/notifications")}
          >
            <BellIcon />
            {unreadCount > 0 ? (
              <span className="explore-page__notification-dot" aria-hidden="true" />
            ) : null}
          </button>
        </header>
      }
    >
      <section className="explore-page">
        <div className="explore-page__controls">
          <div className="explore-page__inner">
            <div className="explore-page__toolbar">
              <label className="explore-page__search" aria-label="Search mentors">
                <span className="explore-page__search-icon">
                  <SearchIcon />
                </span>

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by skill or mentor name..."
                  aria-label="Search by skill or mentor name"
                />
              </label>

              <button
                type="button"
                className="explore-page__filter-button"
                aria-label="Open filters"
              >
                <span className="explore-page__filter-icon">
                  <FilterIcon />
                </span>
                <span>Filters</span>
              </button>
            </div>

            <div className="explore-page__categories" aria-label="Skill categories">
              {categories.map((category) => {
                const isActive = activeCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    className={`explore-page__category ${isActive ? "is-active" : ""}`}
                    onClick={() => setActiveCategory(category)}
                    aria-pressed={isActive}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="explore-page__results">
          <div className="explore-page__inner">
            {errorMessage ? <p>{errorMessage}</p> : null}
            <p className="explore-page__results-count">
              {filteredMentors.length} mentor{filteredMentors.length === 1 ? "" : "s"} found
            </p>

            {isLoading ? (
              <div className="explore-page__empty">Loading mentors...</div>
            ) : filteredMentors.length > 0 ? (
              <div className="explore-page__grid">
                {filteredMentors.map((mentor) => (
                  <article key={mentor.id} className="explore-page__card">
                    <div className="explore-page__card-avatar">{mentor.initials}</div>

                    <div className="explore-page__card-copy">
                      <h2>{mentor.name}</h2>

                      <div className="explore-page__rating">
                        <span className="explore-page__rating-icon">
                          <StarIcon />
                        </span>
                        <strong>{mentor.rating}</strong>
                        <span>({mentor.reviews} reviews)</span>
                      </div>
                    </div>

                    <div className="explore-page__skills-block">
                      <p>Top Skills:</p>

                      <div className="explore-page__skill-tags">
                        {mentor.skills.map((skill) => (
                          <span key={skill} className="explore-page__skill-tag">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="explore-page__card-footer">
                      <span className="explore-page__price">{mentor.price}</span>

                      <button
                        type="button"
                        className="explore-page__profile-button"
                        onClick={() => navigate(`/app/profile/${encodeURIComponent(mentor.id)}`)}
                      >
                        View Profile
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="explore-page__empty">
                No mentors match this search yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </ViewFrame>
  );
}

export default Explore;
