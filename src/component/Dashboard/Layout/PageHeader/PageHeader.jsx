import "./PageHeader.css";
import { useNavigate } from "react-router-dom";
import { useNotificationsState } from "../../Notifications/notificationsStore.js";

function PageHeader({ title }) {
  const navigate = useNavigate();
  const { unreadCount } = useNotificationsState();

  return (
    <header className="dashboard-page-header">
      <h1 className="dashboard-page-header__title">{title}</h1>

      <button
        type="button"
        className="dashboard-page-header__notification"
        aria-label="Notifications"
        onClick={() => navigate("/app/notifications")}
      >
        <svg
          className="dashboard-page-header__notification-icon"
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
          <span className="dashboard-page-header__notification-dot" aria-hidden="true" />
        ) : null}
      </button>
    </header>
  );
}

export default PageHeader;
