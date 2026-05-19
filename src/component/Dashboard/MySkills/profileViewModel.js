import { mapOwnedSession } from "../Sessions/sessionViewModel.js";

const PROFILE_TABS = [
  { key: "about", label: "About" },
  { key: "skills", label: "Skills" },
  { key: "portfolio", label: "Portfolio" },
  { key: "reviews", label: "Reviews" },
  { key: "sessions", label: "Sessions", ownOnly: true },
  { key: "projects", label: "Projects", ownOnly: true },
];

export function getProfileRecordById(records, profileId) {
  if (!Array.isArray(records) || records.length === 0) {
    return null;
  }

  return records.find((record) => record.id === profileId) ?? records[0];
}

export function getProfilePreviewOptions(records) {
  if (!Array.isArray(records)) {
    return [];
  }

  return records.map((record) => ({
    id: record.id,
    label: record.fullName ?? "Unknown User",
    meta: record.roleLabel ?? "Community member",
  }));
}

export function mergeProfileSkillsWithTrust(skills = [], trustProfile = null) {
  const trustSkills = Array.isArray(trustProfile?.skills) ? trustProfile.skills : [];

  if (trustSkills.length === 0) {
    return skills;
  }

  const byName = new Map(
    trustSkills.map((skill) => [String(skill.skillName || "").trim().toLowerCase(), skill]),
  );
  const byId = new Map(trustSkills.map((skill) => [skill.skillId, skill]));

  const merged = skills.map((skill) => {
    const lookupKey = String(skill.name || skill.skillName || "")
      .trim()
      .toLowerCase();
    const trust = byId.get(skill.id) || byName.get(lookupKey);

    if (!trust) {
      return skill;
    }

    return {
      ...skill,
      id: trust.skillId || skill.id,
      name: trust.skillName || skill.name,
      skillName: trust.skillName || skill.name,
      trustScore: trust.trustScore ?? skill.trustScore,
      trustBadge: trust.trustBadge ?? skill.trustBadge,
      trustModifier: trust.trustModifier ?? skill.trustModifier,
      skillTier: trust.skillTier ?? skill.skillTier,
      portfolioScore: trust.portfolioScore ?? skill.portfolioScore,
      endorsementScore: trust.endorsementScore ?? skill.endorsementScore,
      endorsementsCount: trust.endorsementsCount ?? skill.endorsementsCount,
    };
  });

  const existingNames = new Set(
    merged.map((skill) => String(skill.name || skill.skillName || "").trim().toLowerCase()),
  );

  for (const trust of trustSkills) {
    const name = trust.skillName;

    if (!name || existingNames.has(String(name).trim().toLowerCase())) {
      continue;
    }

    merged.push({
      id: trust.skillId,
      name,
      skillName: name,
      proficiency: "Listed skill",
      validationState: trust.validationStatus === "VALIDATED" ? "validated" : "pending",
      showAction: false,
      trustScore: trust.trustScore ?? 0,
      trustBadge: trust.trustBadge ?? "Unverified",
      trustModifier: trust.trustModifier ?? 1,
      skillTier: trust.skillTier ?? "STARTER",
      portfolioScore: trust.portfolioScore ?? 0,
      endorsementScore: trust.endorsementScore ?? 0,
      endorsementsCount: trust.endorsementsCount ?? 0,
    });
    existingNames.add(String(name).trim().toLowerCase());
  }

  return merged;
}

export function buildProfileViewModel(profileRecord, options = {}) {
  if (!profileRecord) {
    return null;
  }

  const isOwnProfile = options.isOwnProfile ?? false;
  const skills = Array.isArray(profileRecord.skills)
    ? profileRecord.skills.map(buildSkillViewModel)
    : [];
  const portfolio = buildPortfolioViewModel(profileRecord.portfolio);
  const reviews = Array.isArray(profileRecord.reviews)
    ? profileRecord.reviews.map(buildReviewViewModel)
    : [];
  const sessions = Array.isArray(profileRecord.sessions)
    ? profileRecord.sessions.map((session) => buildSessionViewModel(session, profileRecord.id))
    : [];
  const projects = Array.isArray(profileRecord.projects)
    ? profileRecord.projects.map(buildProjectViewModel)
    : [];
  const location = profileRecord.location ?? "Location not set";
  const memberSinceShortLabel = formatMonthYear(profileRecord.memberSince, "short");
  const memberSinceLabel = formatMonthYear(profileRecord.memberSince, "long");
  const languagesLabel =
    Array.isArray(profileRecord.languages) && profileRecord.languages.length > 0
      ? profileRecord.languages.join(", ")
      : "Not specified";
  const responseTime = profileRecord.responseTime ?? "Not specified";

  return {
    id: profileRecord.id ?? "preview-user",
    fullName: profileRecord.fullName ?? "Unknown User",
    initials: getProfileInitials(profileRecord.fullName),
    roleLabel: profileRecord.roleLabel ?? "Community member",
    ratingLabel: formatRating(profileRecord.rating),
    location,
    memberSinceShortLabel,
    memberSinceLabel,
    creditsLabel: String(profileRecord.credits ?? 0),
    showCredits: profileRecord.showCredits ?? true,
    xp: profileRecord.xp ?? null,
    aboutHeading: "About Me",
    detailsHeading: "Details",
    aboutText: profileRecord.about ?? "No bio added yet.",
    details: [
      { label: "Location", value: location },
      { label: "Languages", value: languagesLabel },
      { label: "Member Since", value: memberSinceLabel },
      { label: "Response Time", value: responseTime },
    ],
    skills,
    portfolio,
    reviews,
    sessions,
    projects,
    tabs: PROFILE_TABS.filter((tab) => !tab.ownOnly || isOwnProfile).filter((tab) =>
      hasSectionContent(
        tab.key,
        {
          aboutText: profileRecord.about,
          skills,
          portfolio,
          reviews,
          sessions,
          projects,
        },
        { isOwnProfile },
      ),
    ),
    avatarTheme: {
      from: profileRecord.avatarTheme?.from ?? "#d85317",
      to: profileRecord.avatarTheme?.to ?? "#ef7f27",
    },
  };
}

function buildSkillViewModel(skill) {
  const proficiency = skill.proficiency ?? skill.level ?? "Beginner";
  const validationState = skill.validationState ?? "pending";

  return {
    id: skill.id ?? skill.name,
    name: skill.name ?? skill.skillName ?? "Untitled skill",
    skillName: skill.skillName ?? skill.name,
    proficiency,
    validationState,
    isValidated: validationState === "validated",
    showAction: skill.showAction ?? validationState !== "validated",
    validationLabel: validationState === "validated" ? "Validated" : "Request Validation",
    trustScore: skill.trustScore ?? 0,
    trustBadge: skill.trustBadge ?? "Unverified",
    trustModifier: skill.trustModifier ?? 1,
    skillTier: skill.skillTier ?? "STARTER",
    portfolioScore: skill.portfolioScore ?? 0,
    endorsementScore: skill.endorsementScore ?? 0,
    endorsementsCount: skill.endorsementsCount ?? 0,
  };
}

function buildPortfolioViewModel(portfolio) {
  const documents = Array.isArray(portfolio?.documents)
    ? portfolio.documents.map((document) => ({
        id: document.id ?? document.fileName,
        fileName: document.fileName ?? "Document.pdf",
        uploadedLabel: formatFullDate(document.uploadedAt),
        href: document.href ?? "",
        downloadName: document.fileName ?? "Document.pdf",
      }))
    : [];

  const links = Array.isArray(portfolio?.links)
    ? portfolio.links.map((link) => ({
        id: link.id ?? link.label,
        label: link.label ?? link.href ?? "portfolio-link",
        href: link.href ?? "#",
      }))
    : [];

  return {
    documents,
    links,
  };
}

function buildReviewViewModel(review) {
  const ratingValue = typeof review.rating === "number" ? review.rating : 0;

  return {
    id: review.id ?? `${review.author}-${review.reviewedAt}-${review.text}`,
    authorName: review.author ?? "Anonymous",
    initials: getProfileInitials(review.author),
    ratingValue,
    filledStars: Math.max(0, Math.min(5, Math.round(ratingValue))),
    reviewedAtLabel: formatMonthYear(review.reviewedAt, "long"),
    text: review.text ?? "",
  };
}

function buildSessionViewModel(session, viewerUserId) {
  return mapOwnedSession(session, viewerUserId);
}

function buildProjectViewModel(project) {
  const normalizedStatus = String(project.status || "OPEN").trim().toUpperCase();
  const members = Array.isArray(project.members)
    ? project.members.map((member) => ({
        id: member.userId || member.id || "project-member",
        userId: member.userId || "Unknown member",
        joinedLabel: formatFullDate(member.joinedAt),
      }))
    : [];

  return {
    id: project.projectId || project.id,
    projectId: project.projectId || project.id,
    ownerId: project.ownerId || "",
    title: project.title || "Untitled project",
    description: project.description || "No description yet.",
    requiredSkill: project.requiredSkill || "Not specified",
    status: normalizedStatus.toLowerCase(),
    statusLabel: formatProjectStatusLabel(normalizedStatus),
    createdLabel: formatFullDate(project.createdAt),
    updatedLabel: formatFullDate(project.updatedAt),
    memberCount: members.length,
    members,
  };
}

function hasSectionContent(sectionKey, { skills, portfolio }, options = {}) {
  switch (sectionKey) {
    case "about":
      return true;
    case "skills":
      return skills.length > 0;
    case "portfolio":
      return portfolio.documents.length > 0 || portfolio.links.length > 0;
    case "reviews":
      return true;
    case "sessions":
      return options.isOwnProfile;
    case "projects":
      return options.isOwnProfile;
    default:
      return false;
  }
}

function formatProjectStatusLabel(status) {
  switch (status) {
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    case "OPEN":
    default:
      return "Open";
  }
}

function formatMonthYear(dateString, monthStyle) {
  if (!dateString) {
    return "Not specified";
  }

  const parsedDate = new Date(dateString);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: monthStyle,
    year: "numeric",
  }).format(parsedDate);
}

function formatFullDate(dateString) {
  if (!dateString) {
    return "Date not specified";
  }

  const parsedDate = new Date(dateString);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date not specified";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

function formatRating(rating) {
  return typeof rating === "number" ? rating.toFixed(1) : "0.0";
}

function getProfileInitials(fullName) {
  if (typeof fullName !== "string" || fullName.trim().length === 0) {
    return "??";
  }

  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
