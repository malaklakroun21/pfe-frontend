export const dashboardSectionKeys = [
  "dashboard",
  "skills",
  "explore",
  "sessions",
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
    subtitle:
      "This is a frontend-only preview of your internal app. Later, the real data can come from your backend and database.",
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
      "Manage your booked sessions, upcoming meetings, and future availability windows.",
    stats: [
      { label: "Planned sessions", value: "07", accent: "warm" },
      { label: "Completed", value: "21", accent: "soft" },
      { label: "Hours scheduled", value: "11h", accent: "dark" },
    ],
    cards: [
      {
        title: "Upcoming",
        text: "Your next 1:1 mentorship starts tomorrow morning.",
      },
      {
        title: "Reminder",
        text: "Open more Friday slots if you want to earn extra credits.",
      },
    ],
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
      "Finish the steps required to become an approved mentor inside the platform.",
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
