import "./Sidebar.css";
import Fenec from "../../../../assets/Dashboard/Layout/Fenec.png";
import { Link } from "react-router-dom";
import { dashboardSectionKeys, dashboardSections } from "../../dashboardPages.js";

function SidebarIcon({ name }) {
  const iconProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  switch (name) {
    case "dashboard":
      return (
        <svg className="dashboard-sidebar__icon" {...iconProps}>
          <path d="M4.5 9.5 12 3.75 19.5 9.5V19a1 1 0 0 1-1 1h-3.75v-6h-5.5v6H5.5a1 1 0 0 1-1-1Z" />
        </svg>
      );
    case "profile":
      return (
        <svg className="dashboard-sidebar__icon" {...iconProps}>
          <circle cx="12" cy="8.25" r="3.75" />
          <path d="M5 19.5a7 7 0 0 1 14 0" />
        </svg>
      );
    case "explore":
      return (
        <svg className="dashboard-sidebar__icon" {...iconProps}>
          <circle cx="11" cy="11" r="6.75" />
          <path d="m16 16 4 4" />
        </svg>
      );
    case "sessions":
      return (
        <svg className="dashboard-sidebar__icon" {...iconProps}>
          <rect x="4" y="5.75" width="16" height="14.5" rx="2.5" />
          <path d="M8 3.75v4M16 3.75v4M4 10.25h16" />
        </svg>
      );
    case "messages":
      return (
        <svg className="dashboard-sidebar__icon" {...iconProps}>
          <path d="M6.25 5.25h11.5A2.25 2.25 0 0 1 20 7.5v7a2.25 2.25 0 0 1-2.25 2.25H10l-4.75 3v-3H6.25A2.25 2.25 0 0 1 4 14.5v-7a2.25 2.25 0 0 1 2.25-2.25Z" />
        </svg>
      );
    case "credits":
      return (
        <svg className="dashboard-sidebar__icon" {...iconProps}>
          <circle cx="8.25" cy="10" r="4.25" />
          <path d="M8.25 8v4M6.25 10h4" />
          <path d="M14.5 9.5a5.75 5.75 0 1 1 0 11.5" />
          <path d="M18 12.25 20.5 14.5 18 16.75" />
        </svg>
      );
    case "validation":
      return (
        <svg className="dashboard-sidebar__icon" {...iconProps}>
          <circle cx="12" cy="8.5" r="4.5" />
          <path d="M9.25 13.25 8 20l4-2.25L16 20l-1.25-6.75" />
        </svg>
      );
    case "notifications":
      return (
        <svg className="dashboard-sidebar__icon" {...iconProps}>
          <path d="M7.25 17.25h9.5l-1.5-2V10a4.75 4.75 0 1 0-9.5 0v5.25l-1.5 2Z" />
          <path d="M10 19.5a2 2 0 0 0 4 0" />
        </svg>
      );
    case "settings":
      return (
        <svg className="dashboard-sidebar__icon" {...iconProps}>
          <circle cx="12" cy="12" r="3.25" />
          <path d="M19 12a7.34 7.34 0 0 0-.1-1.16l2.01-1.57-2-3.46-2.44 1a7.89 7.89 0 0 0-2-.97L14 3h-4l-.47 2.84a7.89 7.89 0 0 0-2 .97l-2.44-1-2 3.46 2.01 1.57A7.34 7.34 0 0 0 5 12c0 .39.03.78.1 1.16l-2.01 1.57 2 3.46 2.44-1c.61.42 1.28.75 2 .97L10 21h4l.47-2.84c.72-.22 1.39-.55 2-.97l2.44 1 2-3.46-2.01-1.57c.07-.38.1-.77.1-1.16Z" />
        </svg>
      );
    default:
      return null;
  }
}

function Sidebar({ activeItem = "validation", onItemSelect }) {
  return (
    <aside className="dashboard-sidebar">
      <Link to="/" className="dashboard-sidebar__brand" aria-label="Go to Fenneky home page">
        <div className="dashboard-sidebar__brand-mark">
          <img src={Fenec} alt="Fenneky logo" className="dashboard-sidebar__logo" />
        </div>
        <h2 className="dashboard-sidebar__brand-name">FENNEKY</h2>
      </Link>

      <nav className="dashboard-sidebar__nav" aria-label="Dashboard navigation">
        <ul className="dashboard-sidebar__list">
          {dashboardSectionKeys.map((itemKey) => {
            const item = dashboardSections[itemKey];
            const isActive = item.key === activeItem;

            return (
              <li key={item.key} className="dashboard-sidebar__list-item">
                <button
                  type="button"
                  className={`dashboard-sidebar__item ${isActive ? "is-active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => onItemSelect?.(item.key)}
                >
                  <SidebarIcon name={item.icon} />
                  <span className="dashboard-sidebar__label">{item.navLabel}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
