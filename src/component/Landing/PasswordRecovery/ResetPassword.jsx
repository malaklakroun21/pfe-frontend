import { Link } from "react-router-dom";
import "./PasswordRecovery.css";

function ResetPassword({ isSubmitting = false, errorMessage = "" }) {
  return (
    <section className="Recovery">
      <div className="Recovery-container">
        <div className="Recovery-copy">
          <p className="Recovery-eyebrow">New Password</p>
          <h1>Reset your password</h1>
          <p>
            Enter the 6-digit code we sent to your email, then choose a new password
            with at least 8 characters, one uppercase letter, and one number.
          </p>
        </div>

        <form className="Recovery-form">
          <div className="Recovery-field">
            <label htmlFor="code">Verification code</label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              placeholder="123456"
              maxLength={6}
              autoComplete="one-time-code"
            />
          </div>

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

          <button type="submit" className="Recovery-submit" disabled={isSubmitting}>
            {isSubmitting ? "Resetting..." : "Reset password"}
          </button>

          <p className="Recovery-footer">
            Didn&apos;t receive a code? <Link to="/forgot-password">Send a new code</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default ResetPassword;
