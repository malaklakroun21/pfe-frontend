import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dashboardApi, userApi } from "../../../api/client.js";
import { clearAuthSession } from "../../../authSession.js";
import "./MySkills.css";
import { buildProfileViewModel } from "./profileViewModel.js";

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 21s6-5.85 6-11a6 6 0 1 0-12 0c0 5.15 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.25" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.75" y="5.75" width="16.5" height="14.5" rx="2.5" />
      <path d="M8 3.75v4M16 3.75v4M3.75 10.25h16.5" />
    </svg>
  );
}

function StarIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="m12 2.75 2.86 5.8 6.4.93-4.63 4.52 1.1 6.37L12 17.37l-5.73 3.01 1.1-6.37L2.74 9.48l6.4-.93L12 2.75Z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="m4.75 19.25 3.9-.78L18 9.12a1.9 1.9 0 0 0 0-2.68l-.45-.44a1.9 1.9 0 0 0-2.68 0l-9.35 9.35-.77 3.9Z" />
      <path d="m13.5 7.5 3 3" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M9 4.75H7.75A2.75 2.75 0 0 0 5 7.5v9a2.75 2.75 0 0 0 2.75 2.75H9" />
      <path d="M13 8.5 18.25 12 13 15.5" />
      <path d="M18 12H9" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M6.25 5.25h11.5A2.25 2.25 0 0 1 20 7.5v7a2.25 2.25 0 0 1-2.25 2.25H10l-4.75 3v-3H6.25A2.25 2.25 0 0 1 4 14.5v-7a2.25 2.25 0 0 1 2.25-2.25Z" />
    </svg>
  );
}

function ValidationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3.75 17.5 6v6.1c0 3.12-2.08 5.98-5.5 8.15-3.42-2.17-5.5-5.03-5.5-8.15V6L12 3.75Z" />
      <path d="m9.5 11.75 1.6 1.65 3-3.4" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 3.75h6.55L18 8.2V20.25a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.75a1 1 0 0 1 1-1Z" />
      <path d="M13.5 3.75V8.5H18" fill="#ffffff" opacity="0.92" />
      <path d="M9 12.25h6M9 15.25h6M9 18.25h4.5" stroke="#ffffff" strokeWidth="1.2" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 12h17" />
      <path d="M12 3c2.6 2.8 4 5.9 4 9s-1.4 6.2-4 9c-2.6-2.8-4-5.9-4-9s1.4-6.2 4-9Z" />
    </svg>
  );
}

function toTitleCase(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function uniqueStrings(values = []) {
  return [...new Set((Array.isArray(values) ? values : []).map((value) => String(value).trim()))]
    .filter(Boolean);
}

function decodeLocationId(value = "") {
  const normalizedValue = String(value).trim();

  if (!normalizedValue) {
    return "";
  }

  if (normalizedValue === "COUNTRY-DZ") {
    return "Algeria";
  }

  return normalizedValue
    .replace(/^CITY-[A-Z]{2}-/i, "")
    .replace(/^COUNTRY-/i, "")
    .toLowerCase()
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildPublicLocationLabel(profile = {}) {
  const city = decodeLocationId(profile.cityId);
  const country = decodeLocationId(profile.countryId);

  if (city && country) {
    return `${city}, ${country}`;
  }

  return city || country || "Location not set";
}

function buildPublicSkills(profile = {}) {
  const publicSkills = uniqueStrings(
    Array.isArray(profile.offeredSkills) && profile.offeredSkills.length > 0
      ? profile.offeredSkills
      : profile.wantedSkills,
  );
  const proficiency = profile.role === "MENTOR" ? "Mentor skill" : "Learning focus";

  return publicSkills.map((skillName) => ({
    id: `${profile.userId}-${skillName.toLowerCase().replace(/\s+/g, "-")}`,
    name: skillName,
    proficiency,
    validationState: "pending",
    showAction: false,
  }));
}

function buildPublicPortfolio(profile = {}) {
  const documents = [];
  const links = [];

  if (profile.resumeDownloadUrl || profile.resumeFileName) {
    documents.push({
      id: `${profile.userId}-resume`,
      fileName: profile.resumeFileName || "Resume.pdf",
      uploadedAt: profile.resumeUploadedAt,
      href: profile.resumeDownloadUrl || "",
    });
  }

  if (profile.portfolioUrl) {
    links.push({
      id: `${profile.userId}-portfolio`,
      label: "Portfolio",
      href: profile.portfolioUrl,
    });
  }

  return {
    documents,
    links,
  };
}

function buildPublicReviews(ratingSummary = {}) {
  return (Array.isArray(ratingSummary.reviews) ? ratingSummary.reviews : []).map((review) => ({
    id: review._id || `${review.sessionId}-${review.fromUser}`,
    author: review.fromUser || "Community member",
    reviewedAt: review.createdAt,
    text: review.comment || "No written review yet.",
    rating: typeof review.score === "number" ? review.score : 0,
  }));
}

function buildPublicProfileRecord(profile = {}, ratingSummary = {}) {
  const fullName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() ||
    profile.userId ||
    "Unknown User";

  return {
    id: profile.userId,
    fullName,
    roleLabel: toTitleCase(profile.role || "community member"),
    rating: ratingSummary.averageRating ?? 0,
    location: buildPublicLocationLabel(profile),
    memberSince: profile.createdAt,
    showCredits: false,
    about: profile.bio || "",
    languages: profile.languages || [],
    responseTime: "Not specified",
    skills: buildPublicSkills(profile),
    portfolio: buildPublicPortfolio(profile),
    reviews: buildPublicReviews(ratingSummary),
  };
}

function AboutTab({ profile }) {
  return (
    <>
      <article className="my-profile-page__about-card">
        <h3>{profile.aboutHeading}</h3>
        <p>{profile.aboutText}</p>
      </article>

      <article className="my-profile-page__details-card">
        <h3>{profile.detailsHeading}</h3>

        <div className="my-profile-page__details-grid">
          {profile.details.map((item) => (
            <div key={item.label} className="my-profile-page__detail-item">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </article>
    </>
  );
}

function SkillsTab({ profile }) {
  return (
    <>
      {profile.skills.map((skill) => (
        <article key={skill.id} className="my-profile-page__skill-card">
          <div className="my-profile-page__skill-head">
            <div className="my-profile-page__skill-title-row">
              <h3>{skill.name}</h3>

              {skill.isValidated ? (
                <span className="my-profile-page__skill-badge">
                  <ValidationIcon />
                  {skill.validationLabel}
                </span>
              ) : null}
            </div>

            {skill.showAction ? (
              <button type="button" className="my-profile-page__skill-action">
                {skill.validationLabel}
              </button>
            ) : null}
          </div>

          <p className="my-profile-page__skill-proficiency">
            Proficiency: <strong>{skill.proficiency}</strong>
          </p>
        </article>
      ))}
    </>
  );
}

function PortfolioTab({ profile }) {
  return (
    <>
      {profile.portfolio.documents.length > 0 ? (
        <article className="my-profile-page__content-card">
          <h3>Documents</h3>

          <div className="my-profile-page__document-list">
            {profile.portfolio.documents.map((document) =>
              document.href ? (
                <a
                  key={document.id}
                  href={document.href}
                  download={document.downloadName}
                  className="my-profile-page__document-row"
                >
                  <div className="my-profile-page__document-icon">
                    <DocumentIcon />
                  </div>

                  <div className="my-profile-page__document-copy">
                    <strong>{document.fileName}</strong>
                    <span>Uploaded {document.uploadedLabel}</span>
                  </div>
                </a>
              ) : (
                <div key={document.id} className="my-profile-page__document-row">
                  <div className="my-profile-page__document-icon">
                    <DocumentIcon />
                  </div>

                  <div className="my-profile-page__document-copy">
                    <strong>{document.fileName}</strong>
                    <span>Uploaded {document.uploadedLabel}</span>
                  </div>
                </div>
              ),
            )}
          </div>
        </article>
      ) : null}

      {profile.portfolio.links.length > 0 ? (
        <article className="my-profile-page__content-card">
          <h3>Links</h3>

          <div className="my-profile-page__link-list">
            {profile.portfolio.links.map((link) => (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="my-profile-page__link-item"
              >
                <GlobeIcon />
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </article>
      ) : null}
    </>
  );
}

function ReviewsTab({ profile }) {
  if (profile.reviews.length === 0) {
    return (
      <article className="my-profile-page__content-card my-profile-page__empty-state-card">
        <h3>Reviews</h3>
        <p>Aucun review jusqu'a maintenant.</p>
      </article>
    );
  }

  return (
    <>
      {profile.reviews.map((review) => (
        <article key={review.id} className="my-profile-page__review-card">
          <div className="my-profile-page__review-head">
            <div className="my-profile-page__review-author">
              <div className="my-profile-page__review-avatar">{review.initials}</div>

              <div className="my-profile-page__review-meta">
                <strong>{review.authorName}</strong>
                <span>{review.reviewedAtLabel}</span>
              </div>
            </div>

            <div
              className="my-profile-page__review-stars"
              aria-label={`${review.filledStars} out of 5 stars`}
            >
              {Array.from({ length: 5 }).map((_, index) => (
                <StarIcon
                  key={`${review.id}-star-${index}`}
                  className={index < review.filledStars ? "is-filled" : "is-muted"}
                />
              ))}
            </div>
          </div>

          <p className="my-profile-page__review-text">{review.text}</p>
        </article>
      ))}
    </>
  );
}

function ProfileContent({ profile, activeTabKey }) {
  switch (activeTabKey) {
    case "skills":
      return <SkillsTab profile={profile} />;
    case "portfolio":
      return <PortfolioTab profile={profile} />;
    case "reviews":
      return <ReviewsTab profile={profile} />;
    case "about":
    default:
      return <AboutTab profile={profile} />;
  }
}

function MyProfile() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [activeTabKey, setActiveTabKey] = useState("about");
  const [profileRecord, setProfileRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const profile = userId
          ? await Promise.all([userApi.getUserById(userId), userApi.getUserRatings(userId)]).then(
              ([publicProfile, ratingSummary]) => {
                return buildPublicProfileRecord(publicProfile, ratingSummary);
              },
            )
          : await dashboardApi.getProfile();

        if (!isActive) {
          return;
        }

        setProfileRecord(profile);
        setActiveTabKey("about");
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

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [userId]);

  const activeProfile = buildProfileViewModel(profileRecord);
  const isOwnProfile = !userId;

  if (isLoading) {
    return <p>Loading profile...</p>;
  }

  if (errorMessage) {
    return <p>{errorMessage}</p>;
  }

  if (!activeProfile) {
    return null;
  }

  const visibleTabs = activeProfile.tabs;
  const currentTabKey = visibleTabs.some((tab) => tab.key === activeTabKey)
    ? activeTabKey
    : visibleTabs[0]?.key ?? "about";

  function handleLogout() {
    clearAuthSession();
    navigate("/login", { replace: true });
  }

  function handleMessageProfileOwner() {
    navigate(`/app/messages?user=${encodeURIComponent(activeProfile.id)}`);
  }

  return (
    <div className="my-profile-page">
      <section className="my-profile-page__hero">
        <div className="my-profile-page__identity-row">
          <div className="my-profile-page__identity">
            <div
              className="my-profile-page__avatar"
              style={{
                "--profile-avatar-from": activeProfile.avatarTheme.from,
                "--profile-avatar-to": activeProfile.avatarTheme.to,
              }}
            >
              {activeProfile.initials}
            </div>

            <div className="my-profile-page__details">
              <h2 className="my-profile-page__name">{activeProfile.fullName}</h2>

              <div className="my-profile-page__headline">
                <span className="my-profile-page__role">{activeProfile.roleLabel}</span>

                <span className="my-profile-page__rating">
                  <StarIcon />
                  {activeProfile.ratingLabel}
                </span>
              </div>

              <div className="my-profile-page__meta">
                <span>
                  <LocationIcon />
                  {activeProfile.location}
                </span>

                <span>
                  <CalendarIcon />
                  Member since {activeProfile.memberSinceShortLabel}
                </span>
              </div>
            </div>
          </div>

          {isOwnProfile ? (
            <div className="my-profile-page__actions">
              <button
                type="button"
                className="my-profile-page__action-button"
                onClick={() => navigate("/app/settings")}
              >
                <EditIcon />
                Edit Profile
              </button>

              <button
                type="button"
                className="my-profile-page__action-button my-profile-page__action-button--logout"
                onClick={handleLogout}
              >
                <LogoutIcon />
                Logout
              </button>
            </div>
          ) : (
            <div className="my-profile-page__actions">
              <button
                type="button"
                className="my-profile-page__action-button my-profile-page__action-button--primary"
                onClick={handleMessageProfileOwner}
              >
                <MessageIcon />
                Message
              </button>
            </div>
          )}
        </div>

        {activeProfile.showCredits ? (
          <div className="my-profile-page__credits">
            Credits: <strong>{activeProfile.creditsLabel}</strong>
          </div>
        ) : null}
      </section>

      <nav className="my-profile-page__tabs" aria-label="Profile sections">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`my-profile-page__tab ${currentTabKey === tab.key ? "is-active" : ""}`}
            aria-pressed={currentTabKey === tab.key}
            onClick={() => setActiveTabKey(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="my-profile-page__body">
        <ProfileContent profile={activeProfile} activeTabKey={currentTabKey} />
      </section>
    </div>
  );
}

export default MyProfile;
