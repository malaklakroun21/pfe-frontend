import { useEffect, useMemo, useState } from "react";
import { userApi } from "../../../api/client.js";
import { updateAuthUser } from "../../../authSession.js";
import "./Settings.css";

const initialFormValues = {
  fullName: "",
  email: "",
  photo: null,
  bio: "",
  portfolioUrl: "",
  cityId: "",
  resumeFile: null,
  resumeFileName: "",
  resumeDownloadUrl: "",
  resumeUploadedAt: "",
  removeResume: false,
  languages: "",
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

const initialLinkedAccounts = [];
const MAX_RESUME_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_RESUME_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function ResumeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 3.75h6.55L18 8.2V20.25a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.75a1 1 0 0 1 1-1Z" />
      <path d="M13.5 3.75V8.5H18" fill="#ffffff" opacity="0.92" />
      <path d="M9 12.25h6M9 15.25h6M9 18.25h4.5" stroke="#ffffff" strokeWidth="1.2" />
    </svg>
  );
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });
}

function formatUploadDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
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
  const [locationOptions, setLocationOptions] = useState([]);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const hasResume = Boolean(formValues.resumeFileName);
  const uploadedResumeLabel = formatUploadDate(formValues.resumeUploadedAt);

  const photoPreviewUrl = useMemo(() => {
    if (!formValues.photo) {
      return "";
    }

    return URL.createObjectURL(formValues.photo);
  }, [formValues.photo]);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  useEffect(() => {
    let isActive = true;

    async function loadSettingsData() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [currentUser, locationData] = await Promise.all([
          userApi.getCurrentUser(),
          userApi.getAlgerianCities(),
        ]);

        if (!isActive) {
          return;
        }

        const fullName = [currentUser?.firstName, currentUser?.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();

        setFormValues({
          fullName,
          email: currentUser?.email || "",
          photo: null,
          bio: currentUser?.bio || "",
          portfolioUrl: currentUser?.portfolioUrl || "",
          cityId: currentUser?.cityId || "",
          resumeFile: null,
          resumeFileName: currentUser?.resumeFileName || "",
          resumeDownloadUrl: currentUser?.resumeDownloadUrl || "",
          resumeUploadedAt: currentUser?.resumeUploadedAt || "",
          removeResume: false,
          languages: Array.isArray(currentUser?.languages)
            ? currentUser.languages.join(", ")
            : "",
        });
        setLocationOptions(Array.isArray(locationData?.cities) ? locationData.cities : []);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage(error.message);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadSettingsData();

    return () => {
      isActive = false;
    };
  }, []);

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

  const handleResumeChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      return;
    }

    if (!ACCEPTED_RESUME_MIME_TYPES.has(file.type)) {
      setErrorMessage("Le CV doit etre au format PDF, DOC ou DOCX.");
      return;
    }

    if (file.size > MAX_RESUME_FILE_SIZE_BYTES) {
      setErrorMessage("Le CV doit faire moins de 5 MB.");
      return;
    }

    setErrorMessage("");
    setStatusMessage("");
    setFormValues((current) => ({
      ...current,
      resumeFile: file,
      resumeFileName: file.name,
      resumeDownloadUrl: "",
      resumeUploadedAt: "",
      removeResume: false,
    }));
  };

  const handleRemoveResume = () => {
    setStatusMessage("");
    setFormValues((current) => ({
      ...current,
      resumeFile: null,
      resumeFileName: "",
      resumeDownloadUrl: "",
      resumeUploadedAt: "",
      removeResume: true,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSaving(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const payload = {
        name: formValues.fullName,
        email: formValues.email,
        bio: formValues.bio,
        portfolioUrl: formValues.portfolioUrl,
        cityId: formValues.cityId,
        languages: formValues.languages
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      };

      if (formValues.resumeFile) {
        payload.resumeFileName = formValues.resumeFile.name;
        payload.resumeFileDataUrl = await readFileAsDataUrl(formValues.resumeFile);
      } else if (formValues.removeResume) {
        payload.removeResume = true;
      }

      const updatedUser = await userApi.updateCurrentUser(payload);

      updateAuthUser(updatedUser);
      setFormValues((current) => ({
        ...current,
        resumeFile: null,
        resumeFileName: updatedUser?.resumeFileName || "",
        resumeDownloadUrl: updatedUser?.resumeDownloadUrl || "",
        resumeUploadedAt: updatedUser?.resumeUploadedAt || "",
        removeResume: false,
      }));

      setStatusMessage(
        formValues.resumeFile
          ? "Profile saved successfully. CV uploaded."
          : formValues.removeResume
            ? "Profile saved successfully. CV removed."
            : formValues.photo
              ? "Profile saved. The photo preview remains local until an upload endpoint is added."
              : "Profile saved successfully.",
      );
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
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
      {errorMessage ? <p>{errorMessage}</p> : null}
      {statusMessage ? <p>{statusMessage}</p> : null}

      <form className="settings-page__card" onSubmit={handleSubmit}>
        <h2 className="settings-page__title">Account Information</h2>

        <label className="settings-page__field">
          <span>Full Name</span>
          <input
            type="text"
            name="fullName"
            value={formValues.fullName}
            onChange={handleChange}
            disabled={isLoading || isSaving}
          />
        </label>

        <label className="settings-page__field">
          <span>Email</span>
          <input
            type="email"
            name="email"
            value={formValues.email}
            onChange={handleChange}
            disabled={isLoading || isSaving}
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
                  disabled={isLoading || isSaving}
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
          <textarea
            name="bio"
            value={formValues.bio}
            onChange={handleChange}
            rows="4"
            disabled={isLoading || isSaving}
          />
        </label>

        <label className="settings-page__field">
          <span>Portfolio Link</span>
          <input
            type="url"
            name="portfolioUrl"
            placeholder="https://example.com/portfolio"
            value={formValues.portfolioUrl}
            onChange={handleChange}
            disabled={isLoading || isSaving}
          />
        </label>

        <div className="settings-page__field">
          <span id="settings-resume-label">Resume / CV</span>

          <div className="settings-page__upload settings-page__upload--document">
            <div
              className="settings-page__upload-preview settings-page__upload-preview--document"
              aria-hidden="true"
            >
              <ResumeIcon />
            </div>

            <div className="settings-page__upload-content">
              <div className="settings-page__upload-copy">
                <strong>Upload your CV</strong>
                <p>PDF, DOC or DOCX up to 5 MB. It will appear in your Portfolio section.</p>
              </div>

              <div className="settings-page__upload-actions">
                <input
                  id="settings-resume-input"
                  className="settings-page__upload-input"
                  type="file"
                  name="resume"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleResumeChange}
                  aria-labelledby="settings-resume-label"
                  disabled={isLoading || isSaving}
                />

                <label htmlFor="settings-resume-input" className="settings-page__upload-button">
                  <span>{hasResume ? "Change CV" : "Choose CV"}</span>
                </label>

                <span className="settings-page__upload-file-name">
                  {hasResume ? formValues.resumeFileName : "No file selected"}
                </span>
              </div>

              {hasResume ? (
                <div className="settings-page__upload-meta">
                  {formValues.resumeDownloadUrl && !formValues.resumeFile ? (
                    <a
                      href={formValues.resumeDownloadUrl}
                      download={formValues.resumeFileName}
                      className="settings-page__upload-link"
                    >
                      Download current CV
                    </a>
                  ) : null}

                  {uploadedResumeLabel ? (
                    <span className="settings-page__upload-hint">
                      Uploaded {uploadedResumeLabel}
                    </span>
                  ) : null}

                  <button
                    type="button"
                    className="settings-page__upload-link settings-page__upload-link--danger"
                    onClick={handleRemoveResume}
                    disabled={isLoading || isSaving}
                  >
                    Remove CV
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="settings-page__field-grid">
          <label className="settings-page__field">
            <span>Location</span>
            <select
              name="cityId"
              value={formValues.cityId}
              onChange={handleChange}
              disabled={isLoading || isSaving}
            >
              <option value="">Select an Algerian city</option>
              {locationOptions.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.label}
                </option>
              ))}
            </select>
          </label>

          <label className="settings-page__field">
            <span>Languages</span>
            <input
              type="text"
              name="languages"
              value={formValues.languages}
              onChange={handleChange}
              disabled={isLoading || isSaving}
            />
          </label>
        </div>

        <button type="submit" className="settings-page__submit" disabled={isLoading || isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
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
          {linkedAccounts.length > 0 ? (
            linkedAccounts.map((account) => (
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
            ))
          ) : (
            <p>No linked accounts available from the backend yet.</p>
          )}
        </div>
      </section>
    </section>
  );
}

export default Settings;
