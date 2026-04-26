import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotificationsState } from "../Notifications/notificationsStore.js";
import ViewFrame from "../Layout/ViewFrame/ViewFrame.jsx";
import "./Explore.css";

const categories = [
  "All",
  "Technology",
  "Design",
  "Languages",
  "Music",
  "Business",
  "Art",
  "Fitness",
  "Cooking",
];

const mentorDirectory = [
  {
    id: "sarah-chen",
    initials: "SC",
    name: "Sarah Chen",
    category: "Languages",
    rating: "5",
    reviews: 24,
    skills: ["Spanish", "Mandarin", "French"],
    price: "1 credit/hr",
  },
  {
    id: "marcus-johnson",
    initials: "MJ",
    name: "Marcus Johnson",
    category: "Music",
    rating: "4.9",
    reviews: 18,
    skills: ["Guitar", "Piano", "Music Theory"],
    price: "1 credit/hr",
  },
  {
    id: "elena-rodriguez",
    initials: "ER",
    name: "Elena Rodriguez",
    category: "Design",
    rating: "5",
    reviews: 31,
    skills: ["UI/UX Design", "Figma", "Design Systems"],
    price: "1 credit/hr",
  },
  {
    id: "noah-patel",
    initials: "NP",
    name: "Noah Patel",
    category: "Technology",
    rating: "4.8",
    reviews: 16,
    skills: ["React", "JavaScript", "Product Thinking"],
    price: "1 credit/hr",
  },
  {
    id: "amina-haddad",
    initials: "AH",
    name: "Amina Haddad",
    category: "Business",
    rating: "4.9",
    reviews: 22,
    skills: ["Branding", "Negotiation", "Public Speaking"],
    price: "1 credit/hr",
  },
  {
    id: "leo-martin",
    initials: "LM",
    name: "Leo Martin",
    category: "Art",
    rating: "4.8",
    reviews: 15,
    skills: ["Illustration", "Color Theory", "Sketching"],
    price: "1 credit/hr",
  },
];

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
            <p className="explore-page__results-count">
              {filteredMentors.length} mentor{filteredMentors.length === 1 ? "" : "s"} found
            </p>

            {filteredMentors.length > 0 ? (
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

                      <button type="button" className="explore-page__profile-button">
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
