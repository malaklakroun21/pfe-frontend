const PROFILE_TABS = [
  { key: "about", label: "About" },
  { key: "skills", label: "Skills" },
  { key: "portfolio", label: "Portfolio" },
  { key: "reviews", label: "Reviews" },
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

export function buildProfileViewModel(profileRecord) {
  if (!profileRecord) {
    return null;
  }

  const skills = Array.isArray(profileRecord.skills)
    ? profileRecord.skills.map(buildSkillViewModel)
    : [];
  const portfolio = buildPortfolioViewModel(profileRecord.portfolio);
  const reviews = Array.isArray(profileRecord.reviews)
    ? profileRecord.reviews.map(buildReviewViewModel)
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
    tabs: PROFILE_TABS.filter((tab) =>
      hasSectionContent(tab.key, {
        aboutText: profileRecord.about,
        skills,
        portfolio,
        reviews,
      }),
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
    name: skill.name ?? "Untitled skill",
    proficiency,
    validationState,
    isValidated: validationState === "validated",
    validationLabel: validationState === "validated" ? "Validated" : "Request Validation",
  };
}

function buildPortfolioViewModel(portfolio) {
  const documents = Array.isArray(portfolio?.documents)
    ? portfolio.documents.map((document) => ({
        id: document.id ?? document.fileName,
        fileName: document.fileName ?? "Document.pdf",
        uploadedLabel: formatFullDate(document.uploadedAt),
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

function hasSectionContent(sectionKey, { skills, portfolio, reviews }) {
  switch (sectionKey) {
    case "about":
      return true;
    case "skills":
      return skills.length > 0;
    case "portfolio":
      return portfolio.documents.length > 0 || portfolio.links.length > 0;
    case "reviews":
      return reviews.length > 0;
    default:
      return false;
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
