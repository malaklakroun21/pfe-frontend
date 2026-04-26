import { getDashboardSection } from "./dashboardPages.js";

const previewDashboardDatabase = {
  validationByUserId: {
    "john-doe": {
      intro: {
        title: "Why validate your skills?",
        description:
          "Skill validation helps build trust in the FENNEKY community. Validated skills show that your expertise has been verified by other experienced members.",
        benefits: [
          "Increase your credibility as a mentor",
          "Get more session requests",
          "Build trust with potential learners",
        ],
      },
      queue: {
        title: "Skills ready for validation",
        description:
          "These entries are loaded through the same async data flow you can later connect to your real database or API.",
      },
      requestFlow: {
        title: "Request Skill Validation",
        steps: [
          { key: "select-skill", label: "Select Skill" },
          { key: "choose-mentor", label: "Choose Mentor" },
          { key: "evidence", label: "Evidence" },
          { key: "submit", label: "Submit" },
        ],
        skillOptions: [
          {
            id: "spanish-language",
            label: "Spanish Language",
            description: "Conversation, grammar, and pronunciation coaching",
          },
          {
            id: "photography",
            label: "Photography",
            description: "Composition, light, and mobile photography basics",
          },
          {
            id: "ux-design",
            label: "UX Design",
            description: "Research, flows, and interface clarity",
          },
        ],
        mentorOptions: [
          {
            id: "mentor-elena",
            initials: "ER",
            name: "Elena Rodriguez",
            specialty: "UI/UX Design",
            rating: "5",
            skillIds: ["ux-design"],
          },
          {
            id: "mentor-marcus",
            initials: "MJ",
            name: "Marcus Johnson",
            specialty: "Photography",
            rating: "4.9",
            skillIds: ["photography"],
          },
          {
            id: "mentor-sarah",
            initials: "SC",
            name: "Sarah Chen",
            specialty: "Spanish",
            rating: "5",
            skillIds: ["spanish-language"],
          },
        ],
        evidenceTips: [
          "Share portfolio links or project examples.",
          "Explain how long you have practiced or taught this skill.",
          "Add outcomes, reviews, or any relevant proof of experience.",
        ],
      },
      skills: [
        {
          id: "ux-design",
          name: "UX Design",
          category: "Design",
          level: "Advanced",
          status: "ready",
          endorsements: 8,
          evidenceCount: 3,
        },
        {
          id: "react-fundamentals",
          name: "React Fundamentals",
          category: "Development",
          level: "Intermediate",
          status: "in_review",
          endorsements: 5,
          evidenceCount: 2,
        },
        {
          id: "product-discovery",
          name: "Product Discovery",
          category: "Product",
          level: "Advanced",
          status: "missing_evidence",
          endorsements: 3,
          evidenceCount: 1,
        },
      ],
      checklist: {
        title: "Validation checklist",
        description: "Complete each step to send a stronger validation request.",
        steps: [
          {
            id: "proof-of-work",
            title: "Attach proof of work",
            description: "Add portfolio links, documents, or project outcomes for each skill.",
            complete: true,
          },
          {
            id: "session-history",
            title: "Show recent teaching activity",
            description: "Share your recent mentoring sessions or real project practice.",
            complete: true,
          },
          {
            id: "peer-request",
            title: "Request peer review",
            description: "Invite experienced members to validate the skill from your profile.",
            complete: false,
          },
        ],
      },
      reviewPanel: {
        title: "How community review works",
        description:
          "Two validated mentors review your evidence, endorsements, and profile consistency before approving the badge.",
        points: [
          "Reviewers compare your proof with the skill level you selected.",
          "Incomplete files stay in draft until the missing evidence is added.",
          "Approved skills immediately appear as validated on your public profile.",
        ],
      },
    },
  },
};

const validationStatusMap = {
  ready: {
    label: "Ready to submit",
    tone: "ready",
    actionLabel: "Request validation",
  },
  in_review: {
    label: "In review",
    tone: "review",
    actionLabel: "Review in progress",
  },
  missing_evidence: {
    label: "Missing evidence",
    tone: "missing",
    actionLabel: "Complete profile",
  },
};

function clonePreviewData(value) {
  return JSON.parse(JSON.stringify(value));
}

function simulateDatabaseRead(payload, delayMs = 180) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(clonePreviewData(payload));
    }, delayMs);
  });
}

function getPreviewRecordByUserId(records, userId) {
  if (!records || typeof records !== "object") {
    return null;
  }

  return records[userId] ?? records["john-doe"] ?? Object.values(records)[0] ?? null;
}

function buildValidationSkillViewModel(skill) {
  const status = validationStatusMap[skill.status] ?? validationStatusMap.ready;

  return {
    id: skill.id ?? skill.name,
    name: skill.name ?? "Untitled skill",
    category: skill.category ?? "General",
    level: skill.level ?? "Beginner",
    statusLabel: status.label,
    statusTone: status.tone,
    actionLabel: status.actionLabel,
    canRequestValidation: skill.status === "ready",
    meta: [
      `${skill.endorsements ?? 0} endorsements`,
      `${skill.evidenceCount ?? 0} proof item${skill.evidenceCount === 1 ? "" : "s"}`,
    ],
  };
}

function buildValidationPageViewModel(record) {
  return {
    intro: {
      title: record.intro?.title ?? "Why validate your skills?",
      description: record.intro?.description ?? "",
      benefits: Array.isArray(record.intro?.benefits) ? record.intro.benefits : [],
    },
    queue: {
      title: record.queue?.title ?? "Skills ready for validation",
      description: record.queue?.description ?? "",
    },
    requestFlow: {
      title: record.requestFlow?.title ?? "Request Skill Validation",
      steps: Array.isArray(record.requestFlow?.steps) ? record.requestFlow.steps : [],
      skillOptions: Array.isArray(record.requestFlow?.skillOptions)
        ? record.requestFlow.skillOptions
        : [],
      mentorOptions: Array.isArray(record.requestFlow?.mentorOptions)
        ? record.requestFlow.mentorOptions
        : [],
      evidenceTips: Array.isArray(record.requestFlow?.evidenceTips)
        ? record.requestFlow.evidenceTips
        : [],
    },
    skills: Array.isArray(record.skills) ? record.skills.map(buildValidationSkillViewModel) : [],
    checklist: {
      title: record.checklist?.title ?? "Validation checklist",
      description: record.checklist?.description ?? "",
      steps: Array.isArray(record.checklist?.steps) ? record.checklist.steps : [],
    },
    reviewPanel: {
      title: record.reviewPanel?.title ?? "How community review works",
      description: record.reviewPanel?.description ?? "",
      points: Array.isArray(record.reviewPanel?.points) ? record.reviewPanel.points : [],
    },
  };
}

export async function fetchDashboardSectionPreview(sectionKey) {
  return simulateDatabaseRead(getDashboardSection(sectionKey));
}

export async function fetchValidationPageData(userId = "john-doe") {
  const previewRecord = getPreviewRecordByUserId(
    previewDashboardDatabase.validationByUserId,
    userId,
  );

  if (!previewRecord) {
    throw new Error("Validation preview data is unavailable.");
  }

  return simulateDatabaseRead(buildValidationPageViewModel(previewRecord));
}
