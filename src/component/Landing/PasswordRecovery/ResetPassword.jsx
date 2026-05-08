import { Link } from "react-router-dom";
import "./PasswordRecovery.css";

function ResetPassword({ isSubmitting = false, errorMessage = "", isTokenMissing = false }) {
  return (
    <section className="Recovery">
      <div className="Recovery-container">
        <div className="Recovery-copy">
          <p className="Recovery-eyebrow">New Password</p>
          <h1>Reset your password</h1>
          <p>
            Choose a new password with at least 8 characters, one uppercase letter, and one
            number.
          </p>
        </div>

        <form className="Recovery-form">
          <div className="Recovery-field">
            <label htmlFor="password">New password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your new password"
              autoComplete="new-password"
            />
          </div>

          <div className="Recovery-field">
            <label htmlFor="confirm-password">Confirm password</label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              placeholder="Confirm your new password"
              autoComplete="new-password"
            />
          </div>

          {errorMessage ? (
            <p className="Recovery-feedback Recovery-feedback--error" aria-live="polite">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className="Recovery-submit"
            disabled={isSubmitting || isTokenMissing}
          >
            {isSubmitting ? "Resetting..." : "Reset password"}
          </button>

          <p className="Recovery-footer">
            Need a fresh link? <Link to="/forgot-password">Request another reset email</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default ResetPassword;
