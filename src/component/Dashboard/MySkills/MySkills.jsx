import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { dashboardApi, mentorApplicationApi, projectApi, sessionApi, userApi, xpApi } from "../../../api/client.js";
import LevelCard from "../../XP/LevelCard.jsx";
import Gamification from "../Gamification/Gamification.jsx";
import { MentoringRequestForm } from "../Validation/Validation.jsx";
import { clearAuthSession, useAuthSession } from "../../../authSession.js";
import ThemedSelect from "../../shared/ThemedSelect/ThemedSelect.jsx";
import "./MySkills.css";
import { buildProfileViewModel } from "./profileViewModel.js";

const PROJECT_STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const EMPTY_PROJECT_FORM = {
  title: "",
  requiredSkill: "",
  status: "OPEN",
  description: "",
};


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

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.75v4.7l3.2 1.8" strokeLinecap="round" strokeLinejoin="round" />
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

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4.75 7.25h5.2l1.5 1.8h8.8v8.7a2 2 0 0 1-2 2H6.75a2 2 0 0 1-2-2Z" />
      <path d="M4.75 7.25v-.5a2 2 0 0 1 2-2h2.9l1.5 1.8" strokeLinecap="round" />
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
  if (Array.isArray(profile.validatedSkills) && profile.validatedSkills.length > 0) {
    return profile.validatedSkills.map((s) => ({
      id: s.skillId || `${profile.userId}-${s.skillName}`,
      name: s.skillName,
      proficiency: `Score ${s.validationScore}/100`,
      validationState: "validated",
      showAction: false,
    }));
  }

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
    mentorSkills: Array.isArray(profile.mentorSkills) ? profile.mentorSkills : [],
    validatedSkills: Array.isArray(profile.validatedSkills) ? profile.validatedSkills : [],
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
              <span className={`my-profile-page__skill-status-pill my-profile-page__skill-status-pill--${skill.statusPill}`}>
                {skill.statusLabel}
              </span>
            </div>
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

function XpTab({ profile, isOwnProfile }) {
  if (!profile.xp) {
    return (
      <article className="my-profile-page__content-card my-profile-page__empty-state-card">
        <h3>XP</h3>
        <p>No XP data yet. Complete teaching sessions to start earning XP.</p>
      </article>
    );
  }

  return (
    <article className="my-profile-page__content-card">
      <LevelCard xpProfile={profile.xp} showHistory={isOwnProfile} />
    </article>
  );
}

function SessionsTab({
  profile,
  sessionActionError,
  onOpenSession,
  selectedSession,
  onCloseSession,
  onDeleteSession,
  isDeletingSessionId,
}) {
  return (
    <>
      {sessionActionError ? (
        <article className="my-profile-page__content-card my-profile-page__status-card">
          <p className="my-profile-page__error-message">{sessionActionError}</p>
        </article>
      ) : null}

      {selectedSession ? (
        <article className="my-profile-page__content-card my-profile-page__session-detail-card">
          <div className="my-profile-page__activity-head">
            <div className="my-profile-page__activity-copy">
              <h3>{selectedSession.title}</h3>
              <p>with {selectedSession.participantName}</p>
            </div>

            <button
              type="button"
              className="my-profile-page__activity-button my-profile-page__activity-button--ghost"
              onClick={onCloseSession}
              disabled={isDeletingSessionId === selectedSession.id}
            >
              Close
            </button>
          </div>

          <div className="my-profile-page__activity-meta">
            <span>Status: {selectedSession.badge}</span>
            <span>Date: {selectedSession.date}</span>
            <span>Time: {selectedSession.time}</span>
            <span>Duration: {selectedSession.duration}</span>
            <span>Credits: {selectedSession.credits}</span>
          </div>

          <p className="my-profile-page__session-detail-copy">{selectedSession.description}</p>
        </article>
      ) : null}

      {profile.sessions.length === 0 ? (
        <article className="my-profile-page__content-card my-profile-page__empty-state-card">
          <h3>Sessions</h3>
          <p>No sessions created yet.</p>
        </article>
      ) : null}

      {profile.sessions.map((session) => (
        <article key={session.id} className="my-profile-page__activity-card">
          <div className="my-profile-page__activity-head">
            <div className="my-profile-page__activity-copy">
              <h3>{session.title}</h3>
              <p>with {session.participantName}</p>
            </div>

            <span className={`my-profile-page__status-pill my-profile-page__status-pill--${session.status}`}>
              {session.badge}
            </span>
          </div>

          <div className="my-profile-page__activity-meta">
            <span>
              <CalendarIcon />
              {session.date}
            </span>

            <span>
              <ClockIcon />
              {session.time}
            </span>

            <span>{session.duration}</span>
            <strong>{session.credits}</strong>
          </div>

          <div className="my-profile-page__activity-actions">
            {session.canDelete ? (
              <button
                type="button"
                className="my-profile-page__activity-button my-profile-page__activity-button--ghost"
                onClick={() => onDeleteSession(session.id)}
                disabled={isDeletingSessionId === session.id}
              >
                {isDeletingSessionId === session.id ? "Deleting..." : "Delete Session"}
              </button>
            ) : null}

            <button
              type="button"
              className="my-profile-page__activity-button"
              onClick={() => onOpenSession(session.id)}
              disabled={isDeletingSessionId === session.id}
            >
              Open Session
            </button>
          </div>
        </article>
      ))}
    </>
  );
}

function ProjectsTab({
  profile,
  isCreateFormOpen,
  createProjectForm,
  onChangeCreateProjectField,
  onSubmitCreateProject,
  onCancelCreateProject,
  isCreatingProject,
  createProjectError,
  projectActionError,
  onOpenProject,
  onCancelProject,
  isCancellingProjectId,
  selectedProject,
  isLoadingProjectDetail,
  projectDetailError,
  onCloseProject,
}) {
  return (
    <>
      {projectActionError ? (
        <article className="my-profile-page__content-card my-profile-page__status-card">
          <p className="my-profile-page__error-message">{projectActionError}</p>
        </article>
      ) : null}

      {isCreateFormOpen ? (
        <article className="my-profile-page__content-card my-profile-page__project-create-card">
          <div className="my-profile-page__project-create-head">
            <div>
              <p className="my-profile-page__content-eyebrow">New project</p>
              <h3>Create a project workspace</h3>
            </div>
          </div>

          {createProjectError ? (
            <p className="my-profile-page__error-message">{createProjectError}</p>
          ) : null}

          <form className="my-profile-page__project-form" onSubmit={onSubmitCreateProject}>
            <div className="my-profile-page__project-form-grid">
              <label className="my-profile-page__project-field">
                <span>Title</span>
                <input
                  type="text"
                  minLength={3}
                  value={createProjectForm.title}
                  onChange={(event) => onChangeCreateProjectField("title", event.target.value)}
                  placeholder="e.g. Build a Fenneky mobile dashboard"
                  required
                />
              </label>

              <label className="my-profile-page__project-field">
                <span>Required skill</span>
                <input
                  type="text"
                  value={createProjectForm.requiredSkill}
                  onChange={(event) =>
                    onChangeCreateProjectField("requiredSkill", event.target.value)
                  }
                  placeholder="e.g. React Native"
                />
              </label>

              <label className="my-profile-page__project-field">
                <span>Status</span>
                <ThemedSelect
                  value={createProjectForm.status}
                  options={PROJECT_STATUS_OPTIONS}
                  onChange={(nextValue) => onChangeCreateProjectField("status", nextValue)}
                />
              </label>

              <label className="my-profile-page__project-field my-profile-page__project-field--full">
                <span>Description</span>
                <textarea
                  rows="5"
                  value={createProjectForm.description}
                  onChange={(event) => onChangeCreateProjectField("description", event.target.value)}
                  placeholder="Describe the project, the goal, and what kind of member help you need."
                />
              </label>
            </div>

            <div className="my-profile-page__project-form-actions">
              <button
                type="button"
                className="my-profile-page__activity-button my-profile-page__activity-button--ghost"
                onClick={onCancelCreateProject}
                disabled={isCreatingProject}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="my-profile-page__activity-button my-profile-page__activity-button--primary"
                disabled={isCreatingProject}
              >
                {isCreatingProject ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        </article>
      ) : null}

      {selectedProject ? (
        <article className="my-profile-page__content-card my-profile-page__project-detail-card">
          <div className="my-profile-page__activity-head">
            <div className="my-profile-page__activity-copy">
              <h3>{selectedProject.title}</h3>
              <p>{selectedProject.description || "No description yet."}</p>
            </div>

            <button
              type="button"
              className="my-profile-page__activity-button my-profile-page__activity-button--ghost"
              onClick={onCloseProject}
              disabled={isLoadingProjectDetail}
            >
              Close
            </button>
          </div>

          <div className="my-profile-page__activity-meta">
            <span>Status: {selectedProject.status}</span>
            <span>Skill: {selectedProject.requiredSkill || "Not specified"}</span>
            <span>Created: {selectedProject.createdAt ? new Date(selectedProject.createdAt).toLocaleDateString() : "N/A"}</span>
            <span>Updated: {selectedProject.updatedAt ? new Date(selectedProject.updatedAt).toLocaleDateString() : "N/A"}</span>
          </div>

          {Array.isArray(selectedProject.joinRequests) && selectedProject.joinRequests.length > 0 ? (
            <div className="my-profile-page__project-members">
              <strong className="my-profile-page__project-members-title">Join requests</strong>
              <div className="my-profile-page__project-member-list">
                {selectedProject.joinRequests.map((request) => (
                  <div key={request.userId} className="my-profile-page__project-member-item">
                    <strong>{request.displayName || request.userId}</strong>
                    <span>Requested {request.requestedAt ? new Date(request.requestedAt).toLocaleDateString() : "Unknown"}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {projectDetailError ? (
            <div className="my-profile-page__error-message">{projectDetailError}</div>
          ) : null}
        </article>
      ) : null}

      {profile.projects.length === 0 && !isCreateFormOpen ? (
        <article className="my-profile-page__content-card my-profile-page__empty-state-card">
          <h3>Projects</h3>
          <p>No projects created yet.</p>
        </article>
      ) : null}

      {profile.projects.map((project) => (
        <article key={project.id} className="my-profile-page__activity-card">
          <div className="my-profile-page__activity-head">
            <div className="my-profile-page__activity-copy">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
            </div>

            <span className={`my-profile-page__status-pill my-profile-page__status-pill--${project.status}`}>
              {project.statusLabel}
            </span>
          </div>

          <div className="my-profile-page__activity-meta">
            <span>
              <FolderIcon />
              {project.requiredSkill}
            </span>

            <span>
              <CalendarIcon />
              {project.createdLabel}
            </span>

            <span>
              <ClockIcon />
              Updated {project.updatedLabel}
            </span>

            <span>{project.memberCount} member{project.memberCount === 1 ? "" : "s"}</span>
          </div>

          <div className="my-profile-page__project-members">
            <strong className="my-profile-page__project-members-title">Members</strong>

            {project.members.length > 0 ? (
              <div className="my-profile-page__project-member-list">
                {project.members.map((member) => (
                  <div key={member.id} className="my-profile-page__project-member-item">
                    <strong>{member.displayName || member.userId}</strong>
                    <span>Joined {member.joinedLabel}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="my-profile-page__project-members-empty">
                No members have joined this project yet.
              </p>
            )}
          </div>

          <div className="my-profile-page__activity-actions">
            <button
              type="button"
              className="my-profile-page__activity-button my-profile-page__activity-button--ghost"
              onClick={() => onCancelProject(project.projectId)}
              disabled={isCancellingProjectId === project.projectId}
            >
              {isCancellingProjectId === project.projectId ? "Deleting..." : "Delete Project"}
            </button>

            <button
              type="button"
              className="my-profile-page__activity-button"
              onClick={() => onOpenProject(project.projectId)}
              disabled={isCancellingProjectId === project.projectId}
            >
              Open Project
            </button>
          </div>
        </article>
      ))}
    </>
  );
}

function ProfileContent({
  profile,
  activeTabKey,
  isOwnProfile,
  sessionActionError,
  onOpenSession,
  selectedSession,
  onCloseSession,
  onDeleteSession,
  isDeletingSessionId,
  isCreateFormOpen,
  createProjectForm,
  onChangeCreateProjectField,
  onSubmitCreateProject,
  onCancelCreateProject,
  isCreatingProject,
  createProjectError,
  projectActionError,
  onOpenProject,
  onCancelProject,
  isCancellingProjectId,
  selectedProject,
  isLoadingProjectDetail,
  projectDetailError,
  onCloseProject,
}) {
  switch (activeTabKey) {
    case "skills":
      return <SkillsTab profile={profile} />;
    case "portfolio":
      return <PortfolioTab profile={profile} />;
    case "reviews":
      return <ReviewsTab profile={profile} />;
    case "sessions":
      return isOwnProfile ? (
        <SessionsTab
          profile={profile}
          sessionActionError={sessionActionError}
          onOpenSession={onOpenSession}
          selectedSession={selectedSession}
          onCloseSession={onCloseSession}
          onDeleteSession={onDeleteSession}
          isDeletingSessionId={isDeletingSessionId}
        />
      ) : null;
    case "projects":
      return isOwnProfile ? (
        <ProjectsTab
          profile={profile}
          isCreateFormOpen={isCreateFormOpen}
          createProjectForm={createProjectForm}
          onChangeCreateProjectField={onChangeCreateProjectField}
          onSubmitCreateProject={onSubmitCreateProject}
          onCancelCreateProject={onCancelCreateProject}
          isCreatingProject={isCreatingProject}
          createProjectError={createProjectError}
          projectActionError={projectActionError}
          onOpenProject={onOpenProject}
          onCancelProject={onCancelProject}
          isCancellingProjectId={isCancellingProjectId}
          selectedProject={selectedProject}
          isLoadingProjectDetail={isLoadingProjectDetail}
          projectDetailError={projectDetailError}
          onCloseProject={onCloseProject}
        />
      ) : null;
    case "gamification":
      return <Gamification />;
    case "xp":
      return <XpTab profile={profile} isOwnProfile={isOwnProfile} />;
    case "about":
    default:
      return <AboutTab profile={profile} />;
  }
}

function MyProfile() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user } = useAuthSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profileRecord, setProfileRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [sessionActionError, setSessionActionError] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);
  const [isDeletingSessionId, setIsDeletingSessionId] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoadingProjectDetail, setIsLoadingProjectDetail] = useState(false);
  const [projectDetailError, setProjectDetailError] = useState("");
  const [createProjectForm, setCreateProjectForm] = useState(EMPTY_PROJECT_FORM);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [createProjectError, setCreateProjectError] = useState("");
  const [projectActionError, setProjectActionError] = useState("");
  const [isCancellingProjectId, setIsCancellingProjectId] = useState("");
  const [mentorApplication, setMentorApplication] = useState(undefined);
  const [isSubmittingMentorApp, setIsSubmittingMentorApp] = useState(false);
  const [mentorAppError, setMentorAppError] = useState("");

  useEffect(() => {
    if (!isOwnProfile || user?.role !== "LEARNER") return;
    let isActive = true;
    mentorApplicationApi.getMyApplication().then((app) => {
      if (isActive) setMentorApplication(app);
    }).catch(() => {});
    return () => { isActive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const profile = userId
          ? await Promise.all([
              userApi.getUserById(userId),
              userApi.getUserRatings(userId),
              xpApi.getByUserId(userId).catch(() => null),
            ]).then(([publicProfile, ratingSummary, xpProfile]) => ({
              ...buildPublicProfileRecord(publicProfile, ratingSummary),
              xp: xpProfile,
            }))
          : await Promise.all([
              dashboardApi.getProfile(),
              xpApi.getMe().catch(() => null),
              sessionApi.list({ role: 'LEARNER' }).catch(() => null),
              projectApi.list({ memberId: user?.userId, limit: 100 }).catch(() => null),
              user?.userId ? userApi.getUserById(user.userId).catch(() => null) : null,
            ]).then(([ownProfile, xpProfile, sessionsData, projectsData, publicProfile]) => ({
              ...ownProfile,
              xp: xpProfile,
              sessions: Array.isArray(sessionsData) ? sessionsData : [],
              projects: Array.isArray(projectsData?.items) ? projectsData.items : [],
              validatedSkills: publicProfile?.validatedSkills || [],
              mentorSkills: publicProfile?.mentorSkills || [],
            }));

        if (!isActive) {
          return;
        }

        setProfileRecord(profile);
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
  }, [userId, user?.userId]);

  const isOwnProfile = !userId;
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";
  const activeProfile = buildProfileViewModel(profileRecord, { isOwnProfile, isAdmin: isAdmin && !isOwnProfile });

  if (isLoading) {
    return <p>Loading profile...</p>;
  }

  if (errorMessage) {
    return <p>{errorMessage}</p>;
  }

  if (!activeProfile) {
    return null;
  }

  const ADMIN_HIDDEN_TABS = new Set(["skills", "portfolio", "reviews", "sessions", "projects", "gamification", "xp"]);
  const visibleTabs = isAdmin && isOwnProfile
    ? activeProfile.tabs.filter((tab) => !ADMIN_HIDDEN_TABS.has(tab.key))
    : activeProfile.tabs;
  const requestedTabKey = searchParams.get("tab") || "about";
  const currentTabKey = visibleTabs.some((tab) => tab.key === requestedTabKey)
    ? requestedTabKey
    : visibleTabs[0]?.key ?? "about";
  const isProjectCreateFormOpen =
    isOwnProfile && currentTabKey === "projects" && searchParams.get("create") === "1";

  function handleLogout() {
    clearAuthSession();
    navigate("/login", { replace: true });
  }

  function handleMessageProfileOwner() {
    navigate(`/app/messages?user=${encodeURIComponent(activeProfile.id)}`);
  }

  function handleCreateProject() {
    setSelectedProject(null);
    setProjectDetailError("");
    setCreateProjectError("");
    setProjectActionError("");

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("tab", "projects");
    nextSearchParams.set("create", "1");
    setSearchParams(nextSearchParams, { replace: true });
  }

  function handleChangeCreateProjectField(field, value) {
    setCreateProjectError("");
    setProjectActionError("");
    setCreateProjectForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function handleCancelCreateProject() {
    setCreateProjectForm(EMPTY_PROJECT_FORM);
    setCreateProjectError("");
    setProjectActionError("");

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("tab", "projects");
    nextSearchParams.delete("create");
    setSearchParams(nextSearchParams, { replace: true });
  }

  async function handleSubmitCreateProject(event) {
    event.preventDefault();

    if (isCreatingProject) {
      return;
    }

    setCreateProjectError("");
    setProjectActionError("");
    setIsCreatingProject(true);

    try {
      const createdProject = await projectApi.create({
        title: createProjectForm.title.trim(),
        requiredSkill: createProjectForm.requiredSkill.trim(),
        status: createProjectForm.status,
        description: createProjectForm.description.trim(),
      });

      setProfileRecord((currentProfile) => {
        if (!currentProfile) {
          return currentProfile;
        }

        const currentProjects = Array.isArray(currentProfile.projects) ? currentProfile.projects : [];

        return {
          ...currentProfile,
          projects: [createdProject, ...currentProjects],
        };
      });
      setCreateProjectForm(EMPTY_PROJECT_FORM);

      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.set("tab", "projects");
      nextSearchParams.delete("create");
      setSearchParams(nextSearchParams, { replace: true });
    } catch (error) {
      setCreateProjectError(error.message);
    } finally {
      setIsCreatingProject(false);
    }
  }

  function handleOpenSession(sessionId) {
    const session = activeProfile.sessions.find((currentSession) => currentSession.id === sessionId) || null;
    setSelectedSession(session);
    setSessionActionError("");
  }

  function handleCloseSession() {
    setSelectedSession(null);
    setSessionActionError("");
  }

  async function reloadOwnSessions() {
    const sessions = await sessionApi.list({ role: 'LEARNER' });
    setProfileRecord((currentProfile) => {
      if (!currentProfile) return currentProfile;
      return { ...currentProfile, sessions: Array.isArray(sessions) ? sessions : [] };
    });
  }

  async function handleDeleteSession(sessionId) {
    if (!sessionId || isDeletingSessionId) {
      return;
    }

    setSessionActionError("");
    setIsDeletingSessionId(sessionId);

    try {
      await sessionApi.delete(sessionId);
      await reloadOwnSessions();
      setSelectedSession((currentSession) => (currentSession?.id === sessionId ? null : currentSession));
    } catch (error) {
      setSessionActionError(error.message);
    } finally {
      setIsDeletingSessionId("");
    }
  }

  function removeProjectFromProfile(projectId) {
    setProfileRecord((currentProfile) => {
      if (!currentProfile) {
        return currentProfile;
      }

      const currentProjects = Array.isArray(currentProfile.projects) ? currentProfile.projects : [];

      return {
        ...currentProfile,
        projects: currentProjects.filter((project) => project.projectId !== projectId),
      };
    });

    setSelectedProject((currentProject) =>
      currentProject?.projectId === projectId ? null : currentProject,
    );
  }

  async function handleOpenProject(projectId) {
    if (!projectId || isLoadingProjectDetail) {
      return;
    }

    setProjectDetailError("");
    setIsLoadingProjectDetail(true);

    try {
      const project = await projectApi.get(projectId);
      setSelectedProject(project);
    } catch (error) {
      setProjectDetailError(error.message);
    } finally {
      setIsLoadingProjectDetail(false);
    }
  }

  async function handleCancelProject(projectId) {
    if (!projectId || isCancellingProjectId) {
      return;
    }

    setProjectActionError("");
    setProjectDetailError("");
    setIsCancellingProjectId(projectId);

    try {
      await projectApi.delete(projectId);
      removeProjectFromProfile(projectId);
    } catch (error) {
      setProjectActionError(error.message);
    } finally {
      setIsCancellingProjectId("");
    }
  }

  function handleCloseProject() {
    setSelectedProject(null);
    setProjectDetailError("");
  }

  async function handleRequestMentorship() {
    if (isSubmittingMentorApp) return;
    setMentorAppError("");
    setIsSubmittingMentorApp(true);
    try {
      const app = await mentorApplicationApi.submit();
      setMentorApplication(app);
    } catch (error) {
      setMentorAppError(error.message);
    } finally {
      setIsSubmittingMentorApp(false);
    }
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
              {activeProfile.photo ? (
                <img
                  src={activeProfile.photo}
                  alt={activeProfile.fullName}
                  className="my-profile-page__avatar-img"
                />
              ) : (
                activeProfile.initials
              )}
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

        {!(isAdmin && isOwnProfile) && activeProfile.showCredits ? (
          <div className="my-profile-page__credits">
            Credits: <strong>{activeProfile.creditsLabel}</strong>
          </div>
        ) : null}

        {!(isAdmin && isOwnProfile) && activeProfile.xp ? (
          <div className="my-profile-page__credits">
            XP: <strong>
              {activeProfile.xp.xpTotal ?? 0}
              {!activeProfile.xp.isMaxLevel && activeProfile.xp.nextLevelXP
                ? `/${activeProfile.xp.nextLevelXP}`
                : ""}
            </strong>
            {" · "}Level {activeProfile.xp.level ?? 1} — {activeProfile.xp.levelTitle ?? "Seed"}
          </div>
        ) : null}
      </section>

      <div className="my-profile-page__tabs-shell">
        <nav className="my-profile-page__tabs" aria-label="Profile sections">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`my-profile-page__tab ${currentTabKey === tab.key ? "is-active" : ""}`}
              aria-pressed={currentTabKey === tab.key}
              onClick={() => {
                const nextSearchParams = new URLSearchParams(searchParams);

                if (tab.key === "about") {
                  nextSearchParams.delete("tab");
                } else {
                  nextSearchParams.set("tab", tab.key);
                }

                setSearchParams(nextSearchParams, { replace: true });
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {isOwnProfile && user?.role === "LEARNER" && mentorApplication?.applicationStatus !== "APPROVED" ? (
          <div className="my-profile-page__tab-actions">
            {mentorAppError ? (
              <p className="my-profile-page__mentor-app-error">{mentorAppError}</p>
            ) : null}
            <button
              type="button"
              className="my-profile-page__tab-action-button my-profile-page__tab-action-button--mentor"
              onClick={handleRequestMentorship}
              disabled={isSubmittingMentorApp || mentorApplication?.applicationStatus === "PENDING"}
            >
              <ValidationIcon />
              {isSubmittingMentorApp
                ? "Submitting..."
                : mentorApplication?.applicationStatus === "PENDING"
                ? "Application Pending"
                : mentorApplication?.applicationStatus === "REJECTED"
                ? "Reapply for Mentorship"
                : "Request Mentorship"}
            </button>
          </div>
        ) : null}
      </div>

      <section className="my-profile-page__body">
        <ProfileContent
          profile={activeProfile}
          activeTabKey={currentTabKey}
          isOwnProfile={isOwnProfile}
          sessionActionError={sessionActionError}
          onOpenSession={handleOpenSession}
          selectedSession={selectedSession}
          onCloseSession={handleCloseSession}
          onDeleteSession={handleDeleteSession}
          isDeletingSessionId={isDeletingSessionId}
          isCreateFormOpen={isProjectCreateFormOpen}
          createProjectForm={createProjectForm}
          onChangeCreateProjectField={handleChangeCreateProjectField}
          onSubmitCreateProject={handleSubmitCreateProject}
          onCancelCreateProject={handleCancelCreateProject}
          isCreatingProject={isCreatingProject}
          createProjectError={createProjectError}
          projectActionError={projectActionError}
          onOpenProject={handleOpenProject}
          onCancelProject={handleCancelProject}
          isCancellingProjectId={isCancellingProjectId}
          selectedProject={selectedProject}
          isLoadingProjectDetail={isLoadingProjectDetail}
          projectDetailError={projectDetailError}
          onCloseProject={handleCloseProject}
        />

        {isOwnProfile && (() => {
          const validatedSkills = Array.isArray(profileRecord?.validatedSkills)
            ? profileRecord.validatedSkills
            : [];
          const mentorSkillNames = new Set(
            (profileRecord?.mentorSkills || []).map((m) => m.skillName.toLowerCase())
          );
          const eligibleSkills = validatedSkills.filter(
            (s) => !mentorSkillNames.has(s.skillName.toLowerCase())
          ).map((s) => ({ skillId: s.skillId, label: s.skillName }));

          return eligibleSkills.length > 0 ? (
            <MentoringRequestForm validatedSkills={eligibleSkills} />
          ) : null;
        })()}
      </section>
    </div>
  );
}

export default MyProfile;
