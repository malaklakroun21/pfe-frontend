export const adminSectionKeys = ["dashboard", "users", "reports", "audit", "settings"];

export const adminSections = {
  dashboard: {
    key: "dashboard",
    route: "/admin",
    navLabel: "Dashboard",
    icon: "dashboard",
  },
  users: {
    key: "users",
    route: "/admin/users",
    navLabel: "Users",
    icon: "profile",
  },
  reports: {
    key: "reports",
    route: "/admin/reports",
    navLabel: "Reports",
    icon: "validation",
  },
  audit: {
    key: "audit",
    route: "/admin/audit",
    navLabel: "Audit logs",
    icon: "messages",
  },
  settings: {
    key: "settings",
    route: "/admin/settings",
    navLabel: "Settings",
    icon: "settings",
  },
};

export function getAdminSection(sectionKey) {
  return adminSections[sectionKey] ?? adminSections.dashboard;
}

export function getAdminSectionKeyFromPathname(pathname) {
  const segment = pathname.replace(/^\/admin\/?/, "").split("/")[0];
  return adminSections[segment] ? segment : "dashboard";
}

