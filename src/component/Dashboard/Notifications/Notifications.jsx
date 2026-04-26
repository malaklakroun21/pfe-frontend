import ViewFrame from "../Layout/ViewFrame/ViewFrame.jsx";
import {
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  useNotificationsState,
} from "./notificationsStore.js";
import "./Notifications.css";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m5 12.5 4.2 4.2L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 7h12l-1 12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NotificationBadgeIcon({ type }) {
  switch (type) {
    case "session":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3.5" y="4.5" width="17" height="16" rx="3.5" fill="#89A8FF" />
          <path d="M7 3.75v3M17 3.75v3M3.5 9.5h17" stroke="#ffffff" strokeWidth="1.8" />
          <path d="M7 13h3M12 13h2M7 16.5h2M11 16.5h3" stroke="#ffffff" strokeWidth="1.7" />
        </svg>
      );
    case "credits":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2.75c.35 1.4 1.1 2.45 2.35 3.15.95.54 2.05.83 3.15.85-.13 1.57-.8 2.9-2 4"
            fill="#FFC144"
          />
          <path
            d="M12 4.25c-4.42 0-8 3.46-8 7.72 0 4.27 3.58 7.78 8 7.78s8-3.5 8-7.78c0-4.26-3.58-7.72-8-7.72Z"
            fill="#FFC144"
          />
          <path
            d="M12 8v7M14.4 9.6c-.55-.6-1.4-.95-2.4-.95-1.37 0-2.4.67-2.4 1.7 0 1 1.02 1.42 2.35 1.7 1.7.35 2.75.8 2.75 2.07 0 1.15-1.07 1.88-2.7 1.88-1.22 0-2.26-.42-2.96-1.13"
            stroke="#8D4300"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "validated":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" fill="#74D899" />
          <path
            d="m7.5 12.2 2.9 2.9 6.1-6.2"
            stroke="#ffffff"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "message":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 6.5h14A2.5 2.5 0 0 1 21.5 9v4.8A2.7 2.7 0 0 1 18.8 16.5H11l-4.8 3v-3H5A2.5 2.5 0 0 1 2.5 14V9A2.5 2.5 0 0 1 5 6.5Z"
            fill="#F4EAFE"
          />
          <path
            d="M6.5 10h8M6.5 12.8h5.3"
            stroke="#C2A4F4"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    case "request":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4.5 8.25h15l-1.3 9.25a2 2 0 0 1-2 1.72H7.8a2 2 0 0 1-2-1.72L4.5 8.25Z"
            fill="#E6D5FF"
          />
          <path
            d="M6.5 6.25h4.25l1.35 1.5H19.5"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M3.75 13h4.5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

function Notifications() {
  const { notifications } = useNotificationsState();

  return (
    <ViewFrame
      header={
        <header className="notifications-page__header">
          <h1>Notifications</h1>

          <button
            type="button"
            className="notifications-page__mark-all"
            onClick={markAllNotificationsAsRead}
          >
            <span className="notifications-page__mark-all-icon">
              <CheckIcon />
            </span>
            <span>Mark all as read</span>
          </button>
        </header>
      }
    >
      <section className="notifications-page">
        <div className="notifications-page__list">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <article
                key={notification.id}
                className={`notifications-page__card ${
                  notification.read ? "is-read" : "is-unread"
                }`}
              >
                <div className="notifications-page__card-main">
                  <div className="notifications-page__badge">
                    <NotificationBadgeIcon type={notification.type} />
                  </div>

                  <div className="notifications-page__copy">
                    <div className="notifications-page__copy-topline">
                      <h2>{notification.title}</h2>
                      <span>{notification.time}</span>
                    </div>

                    <p>{notification.message}</p>

                    <div className="notifications-page__actions">
                      {!notification.read ? (
                        <button
                          type="button"
                          className="notifications-page__action notifications-page__action--mark"
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          Mark as read
                        </button>
                      ) : null}

                      <button
                        type="button"
                        className="notifications-page__action notifications-page__action--delete"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <span className="notifications-page__action-icon">
                          <TrashIcon />
                        </span>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="notifications-page__empty">
              You are all caught up. New notifications will appear here.
            </div>
          )}
        </div>
      </section>
    </ViewFrame>
  );
}

export default Notifications;
