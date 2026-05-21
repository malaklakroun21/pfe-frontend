export const dashboardSectionKeys = [
  "dashboard",
  "skills",
  "explore",
  "sessions",
  "projects",
  "leaderboards",
  "messages",
  "credits",
  "validation",
  "notifications",
  "settings",
];

export const dashboardSections = {
  dashboard: {
    key: "dashboard",
    route: "/app",
    navLabel: "Dashboard",
    icon: "dashboard",
    title: "Dashboard overview",
    subtitle: "Follow your activity, your learning progress, and the latest platform updates.",
    stats: [
      { label: "Credits available", value: "24h", accent: "warm" },
      { label: "Sessions this week", value: "03", accent: "soft" },
      { label: "Unread messages", value: "12", accent: "dark" },
    ],
    cards: [
      {
        title: "Today focus",
        text: "Complete your mentor validation and answer your latest messages.",
      },
      {
        title: "Next session",
        text: "Spanish practice with Lydia at 18:30.",
      },
    ],
  },
  skills: {
    key: "skills",
    route: "/app/skills",
    navLabel: "My Profile",
    icon: "profile",
    title: "My Profile",
    subtitle:
      "Track the skills you teach, the ones you are learning, and the credits they generate.",
    stats: [
      { label: "Skills you teach", value: "05", accent: "warm" },
      { label: "Skills in progress", value: "04", accent: "soft" },
      { label: "Hours shared", value: "18h", accent: "dark" },
    ],
    cards: [
      {
        title: "Top skill",
        text: "UI design is currently your most requested teaching skill.",
      },
      {
        title: "Suggestion",
        text: "Add React basics to attract more beginner learners.",
      },
    ],
  },
  profile: {
    key: "profile",
    route: "/app/profile",
    navLabel: "Profile",
    icon: "profile",
    title: "Profile",
    headerTitle: "Profile",
    subtitle: "Discover the public profile of a community member.",
    stats: [],
    cards: [],
  },
  explore: {
    key: "explore",
    route: "/app/explore",
    navLabel: "Explore",
    icon: "explore",
    title: "Explore",
    subtitle:
      "Discover new mentors, fresh skill categories, and available community opportunities.",
    stats: [
      { label: "Mentors online", value: "37", accent: "warm" },
      { label: "New skills today", value: "09", accent: "soft" },
      { label: "Burrows nearby", value: "04", accent: "dark" },
    ],
    cards: [
      {
        title: "Trending now",
        text: "English conversation, Canva, and public speaking are rising fast.",
      },
      {
        title: "Recommended",
        text: "Try exploring beginner photography mentors in your area.",
      },
    ],
  },
  sessions: {
    key: "sessions",
    route: "/app/sessions",
    navLabel: "Sessions",
    icon: "sessions",
    title: "Sessions",
    subtitle:
      "Browse the sessions happening across the app and discover who is learning what.",
    stats: [
      { label: "Planned sessions", value: "07", accent: "warm" },
      { label: "Completed", value: "21", accent: "soft" },
      { label: "Hours scheduled", value: "11h", accent: "dark" },
    ],
    cards: [
      {
        title: "Community feed",
        text: "See the latest sessions booked across mentors and learners.",
      },
      {
        title: "Discovery",
        text: "Open profiles directly from a session to start a new conversation.",
      },
    ],
  },
  projects: {
    key: "projects",
    route: "/app/projects",
    navLabel: "Projects",
    icon: "projects",
    title: "Projects",
    subtitle:
      "Create collaborative projects, join open workspaces, and manage members from one place.",
    stats: [
      { label: "Open calls", value: "06", accent: "warm" },
      { label: "In progress", value: "03", accent: "soft" },
      { label: "Completed", value: "11", accent: "dark" },
    ],
    cards: [
      {
        title: "Collaboration",
        text: "Share a project idea and let the right members join quickly.",
      },
      {
        title: "Ownership",
        text: "Keep track of members, status changes, and project delivery.",
      },
    ],
  },
  leaderboards: {
    key: "leaderboards",
    route: "/app/leaderboards",
    navLabel: "Leaderboards",
    icon: "leaderboards",
    title: "Leaderboards",
    subtitle: "See the top weekly XP earners in your own level tier.",
    stats: [],
    cards: [],
  },
  messages: {
    key: "messages",
    route: "/app/messages",
    navLabel: "Messages",
    icon: "messages",
    title: "Messages",
    subtitle:
      "Read conversations, follow up with learners, and keep your mentoring relationships active.",
    stats: [
      { label: "Unread", value: "12", accent: "warm" },
      { label: "Archived", value: "28", accent: "soft" },
      { label: "New today", value: "04", accent: "dark" },
    ],
    cards: [
      {
        title: "Latest ping",
        text: "A new learner wants to book an intro session with you.",
      },
      {
        title: "Quick win",
        text: "Replying to your top 3 conversations would clear most of your inbox.",
      },
    ],
  },
  credits: {
    key: "credits",
    route: "/app/credits",
    navLabel: "Credits",
    icon: "credits",
    title: "Credits",
    subtitle:
      "See how many time credits you earned, spent, and still have available to invest in learning.",
    stats: [
      { label: "Current balance", value: "24h", accent: "warm" },
      { label: "Earned this month", value: "11h", accent: "soft" },
      { label: "Spent this month", value: "06h", accent: "dark" },
    ],
    cards: [
      {
        title: "Insight",
        text: "You are earning credits faster than you spend them this month.",
      },
      {
        title: "Idea",
        text: "Use 2h of credits to book a new mentor and unlock another skill.",
      },
    ],
  },
  validation: {
    key: "validation",
    route: "/app/validation",
    navLabel: "Validation",
    headerTitle: "Skill Validation",
    icon: "validation",
    title: "Validation",
    subtitle:
      "Request mentor validation for your skills, or review incoming requests if you are a mentor.",
    stats: [
      { label: "Profile completed", value: "78%", accent: "warm" },
      { label: "Documents uploaded", value: "02", accent: "soft" },
      { label: "Steps remaining", value: "03", accent: "dark" },
    ],
    cards: [
      {
        title: "Next step",
        text: "Upload a short intro video to complete your mentor profile.",
      },
      {
        title: "Status",
        text: "Your identity verification is in review and looks on track.",
      },
    ],
  },
  notifications: {
    key: "notifications",
    route: "/app/notifications",
    navLabel: "Notifications",
    icon: "notifications",
    title: "Notifications",
    subtitle:
      "Keep an eye on the important platform updates, new bookings, and profile alerts.",
    stats: [
      { label: "Unread alerts", value: "08", accent: "warm" },
      { label: "Bookings updates", value: "03", accent: "soft" },
      { label: "System notes", value: "02", accent: "dark" },
    ],
    cards: [
      {
        title: "Priority",
        text: "A learner accepted your proposed mentoring time slot.",
      },
      {
        title: "Heads up",
        text: "Validation reminders will stay here until the process is done.",
      },
    ],
  },
  settings: {
    key: "settings",
    route: "/app/settings",
    navLabel: "Settings",
    icon: "settings",
    title: "Settings",
    subtitle:
      "Control your account, notifications, privacy preferences, and mentoring visibility.",
    stats: [
      { label: "Profile visibility", value: "Public", accent: "warm" },
      { label: "Email alerts", value: "On", accent: "soft" },
      { label: "Language", value: "EN/FR", accent: "dark" },
    ],
    cards: [
      {
        title: "Recommendation",
        text: "Add a French bio version to help more local learners find you.",
      },
      {
        title: "Security",
        text: "Enable stronger account protection once the backend auth is ready.",
      },
    ],
  },
};

export function getDashboardSection(sectionKey) {
  return dashboardSections[sectionKey] ?? dashboardSections.dashboard;
}

export function getDashboardSectionKeyFromPathname(pathname) {
  const segment = pathname.replace(/^\/app\/?/, "").split("/")[0];

  return dashboardSections[segment] ? segment : "dashboard";
}
