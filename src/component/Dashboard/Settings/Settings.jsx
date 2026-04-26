import { useEffect, useState } from "react";
import "./Settings.css";

const initialFormValues = {
  fullName: "John Doe",
  email: "john.doe@example.com",
  photo: null,
  bio: "Passionate about technology and education. I love teaching web development and learning new languages.",
  location: "San Francisco, CA",
  languages: "English, Spanish",
};

const initialPasswordValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const initialPreferences = {
  publicProfile: true,
  emailNotifications: false,
  sessionReminders: true,
  messageNotifications: true,
};

const initialLinkedAccounts = [
  {
    id: "google",
    provider: "Google",
    email: "john.doe@gmail.com",
    connected: true,
  },
];

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.1" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function Settings() {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [passwordValues, setPasswordValues] = useState(initialPasswordValues);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [linkedAccounts, setLinkedAccounts] = useState(initialLinkedAccounts);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");

  useEffect(() => {
    if (!formValues.photo) {
      setPhotoPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(formValues.photo);
    setPhotoPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [formValues.photo]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0] || null;

    setFormValues((current) => ({
      ...current,
      photo: file,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();
  };

  const togglePreference = (key) => {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const handleLinkedAccountToggle = (accountId) => {
    setLinkedAccounts((current) =>
      current.map((account) =>
        account.id === accountId
          ? { ...account, connected: !account.connected }
          : account
      )
    );
  };

  return (
    <section className="settings-page">
      <form className="settings-page__card" onSubmit={handleSubmit}>
        <h2 className="settings-page__title">Account Information</h2>

        <label className="settings-page__field">
          <span>Full Name</span>
          <input
            type="text"
            name="fullName"
            value={formValues.fullName}
            onChange={handleChange}
          />
        </label>

        <label className="settings-page__field">
          <span>Email</span>
          <input
            type="email"
            name="email"
            value={formValues.email}
            onChange={handleChange}
          />
        </label>

        <div className="settings-page__field">
          <span id="settings-photo-label">Photo</span>
          <div className="settings-page__upload">
            <div className="settings-page__upload-preview" aria-hidden="true">
              {photoPreviewUrl ? (
                <img src={photoPreviewUrl} alt="" className="settings-page__upload-image" />
              ) : (
                <span className="settings-page__upload-initials">
                  {getInitials(formValues.fullName)}
                </span>
              )}
            </div>

            <div className="settings-page__upload-content">
              <div className="settings-page__upload-copy">
                <strong>Upload profile photo</strong>
                <p>PNG, JPG or WebP for a cleaner profile card.</p>
              </div>

              <div className="settings-page__upload-actions">
                <input
                  id="settings-photo-input"
                  className="settings-page__upload-input"
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  aria-labelledby="settings-photo-label"
                />

                <label htmlFor="settings-photo-input" className="settings-page__upload-button">
                  <span>{formValues.photo ? "Change photo" : "Choose photo"}</span>
                </label>

                <span className="settings-page__upload-file-name">
                  {formValues.photo ? formValues.photo.name : "No file selected"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <label className="settings-page__field">
          <span>Bio</span>
          <textarea name="bio" value={formValues.bio} onChange={handleChange} rows="4" />
        </label>

        <div className="settings-page__field-grid">
          <label className="settings-page__field">
            <span>Location</span>
            <input
              type="text"
              name="location"
              value={formValues.location}
              onChange={handleChange}
            />
          </label>

          <label className="settings-page__field">
            <span>Languages</span>
            <input
              type="text"
              name="languages"
              value={formValues.languages}
              onChange={handleChange}
            />
          </label>
        </div>

        <button type="submit" className="settings-page__submit">
          Save Changes
        </button>
      </form>

      <form className="settings-page__card" onSubmit={handlePasswordSubmit}>
        <h2 className="settings-page__title">Change Password</h2>

        <label className="settings-page__field">
          <span>Current Password</span>
          <div className="settings-page__password-wrap">
            <input
              type={showCurrentPassword ? "text" : "password"}
              name="currentPassword"
              value={passwordValues.currentPassword}
              onChange={handlePasswordChange}
            />
            <button
              type="button"
              className="settings-page__password-toggle"
              aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
              aria-pressed={showCurrentPassword}
              onClick={() => setShowCurrentPassword((current) => !current)}
            >
              <EyeIcon />
            </button>
          </div>
        </label>

        <label className="settings-page__field">
          <span>New Password</span>
          <input
            type="password"
            name="newPassword"
            value={passwordValues.newPassword}
            onChange={handlePasswordChange}
          />
        </label>

        <label className="settings-page__field">
          <span>Confirm New Password</span>
          <input
            type="password"
            name="confirmPassword"
            value={passwordValues.confirmPassword}
            onChange={handlePasswordChange}
          />
        </label>

        <button type="submit" className="settings-page__submit">
          Update Password
        </button>
      </form>

      <section className="settings-page__card">
        <h2 className="settings-page__title">Profile Visibility</h2>

        <div className="settings-page__toggle-row">
          <div className="settings-page__toggle-copy">
            <h3>Public Profile</h3>
            <p>Allow others to find and view your profile</p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={preferences.publicProfile}
            className={`settings-page__switch ${
              preferences.publicProfile ? "is-active" : ""
            }`}
            onClick={() => togglePreference("publicProfile")}
          >
            <span className="settings-page__switch-thumb" />
          </button>
        </div>
      </section>

      <section className="settings-page__card">
        <h2 className="settings-page__title">Notification Preferences</h2>

        <div className="settings-page__preferences-list">
          <div className="settings-page__toggle-row">
            <div className="settings-page__toggle-copy">
              <h3>Email Notifications</h3>
              <p>Receive updates via email</p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={preferences.emailNotifications}
              className={`settings-page__switch ${
                preferences.emailNotifications ? "is-active" : ""
              }`}
              onClick={() => togglePreference("emailNotifications")}
            >
              <span className="settings-page__switch-thumb" />
            </button>
          </div>

          <div className="settings-page__toggle-row">
            <div className="settings-page__toggle-copy">
              <h3>Session Reminders</h3>
              <p>Get reminded about upcoming sessions</p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={preferences.sessionReminders}
              className={`settings-page__switch ${
                preferences.sessionReminders ? "is-active" : ""
              }`}
              onClick={() => togglePreference("sessionReminders")}
            >
              <span className="settings-page__switch-thumb" />
            </button>
          </div>

          <div className="settings-page__toggle-row">
            <div className="settings-page__toggle-copy">
              <h3>Message Notifications</h3>
              <p>Get notified when you receive messages</p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={preferences.messageNotifications}
              className={`settings-page__switch ${
                preferences.messageNotifications ? "is-active" : ""
              }`}
              onClick={() => togglePreference("messageNotifications")}
            >
              <span className="settings-page__switch-thumb" />
            </button>
          </div>
        </div>
      </section>

      <section className="settings-page__card">
        <h2 className="settings-page__title">Linked Accounts</h2>

        <div className="settings-page__linked-list">
          {linkedAccounts.map((account) => (
            <article key={account.id} className="settings-page__linked-card">
              <div className="settings-page__linked-main">
                <span className="settings-page__linked-icon" aria-hidden="true">
                  <span className="settings-page__linked-icon-letter">G</span>
                </span>

                <div className="settings-page__linked-copy">
                  <h3>{account.provider}</h3>
                  <p>{account.email}</p>
                </div>
              </div>

              <button
                type="button"
                className={`settings-page__linked-action ${
                  account.connected ? "is-disconnect" : "is-connect"
                }`}
                onClick={() => handleLinkedAccountToggle(account.id)}
              >
                {account.connected ? "Disconnect" : "Connect"}
              </button>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

export default Settings;
