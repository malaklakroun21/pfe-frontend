import "./Header.css";
import { useNavigate } from "react-router-dom";
import { useNotificationsState } from "../../Notifications/notificationsStore.js";

function Header() {
  const navigate = useNavigate();
  const { unreadCount } = useNotificationsState();

  return (
    <header className="dashboard-header">
      <label className="dashboard-header__search" aria-label="Search skills and mentors">
        <svg
          className="dashboard-header__search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          placeholder="Search skills, mentors..."
          aria-label="Search skills, mentors"
        />
      </label>

      <div className="dashboard-header__actions">
        <button
          type="button"
          className="dashboard-header__notification"
          aria-label="Notifications"
          onClick={() => navigate("/app/notifications")}
        >
          <svg
            className="dashboard-header__notification-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 17H5.5l1.6-2.13V10a4.9 4.9 0 1 1 9.8 0v4.87L18.5 17" />
            <path d="M10 19a2 2 0 0 0 4 0" />
          </svg>
          {unreadCount > 0 ? (
            <span className="dashboard-header__notification-dot" aria-hidden="true" />
          ) : null}
        </button>

        <button
          type="button"
          className="dashboard-header__avatar"
          aria-label="Open my profile"
          onClick={() => navigate("/app/skills")}
        >
          JD
        </button>
      </div>
    </header>
  );
}

export default Header;
