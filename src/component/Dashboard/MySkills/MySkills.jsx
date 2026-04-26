import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MySkills.css";
import profilePreviewData from "./profilePreviewData.json";
import { buildProfileViewModel, getProfileRecordById } from "./profileViewModel.js";

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

            {!skill.isValidated ? (
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
            {profile.portfolio.documents.map((document) => (
              <div key={document.id} className="my-profile-page__document-row">
                <div className="my-profile-page__document-icon">
                  <DocumentIcon />
                </div>

                <div className="my-profile-page__document-copy">
                  <strong>{document.fileName}</strong>
                  <span>Uploaded {document.uploadedLabel}</span>
                </div>
              </div>
            ))}
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

function MyProfile({ profiles = profilePreviewData, currentUserId = "john-doe" }) {
  const navigate = useNavigate();
  const profileRecords = Array.isArray(profiles) && profiles.length > 0 ? profiles : profilePreviewData;
  const [activeTabKey, setActiveTabKey] = useState("about");
  const activeProfile = buildProfileViewModel(
    getProfileRecordById(profileRecords, currentUserId),
  );

  if (!activeProfile) {
    return null;
  }

  const visibleTabs = activeProfile.tabs;
  const currentTabKey = visibleTabs.some((tab) => tab.key === activeTabKey)
    ? activeTabKey
    : visibleTabs[0]?.key ?? "about";

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

          <button
            type="button"
            className="my-profile-page__edit-button"
            onClick={() => navigate("/app/settings")}
          >
            <EditIcon />
            Edit Profile
          </button>
        </div>

        <div className="my-profile-page__credits">
          Credits: <strong>{activeProfile.creditsLabel}</strong>
        </div>
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
