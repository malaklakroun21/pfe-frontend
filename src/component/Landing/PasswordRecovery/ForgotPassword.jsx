import { Link } from "react-router-dom";
import "./PasswordRecovery.css";

function ForgotPassword({
  isSubmitting = false,
  errorMessage = "",
  successMessage = "",
  debugCode = "",
}) {
  return (
    <section className="Recovery">
      <div className="Recovery-container">
        <div className="Recovery-copy">
          <p className="Recovery-eyebrow">Password Help</p>
          <h1>Forgot your password?</h1>
          <p>
            Enter the email linked to your account and we&apos;ll send you a 6-digit
            verification code that expires in 10 minutes.
          </p>
        </div>

        <form className="Recovery-form">
          <div className="Recovery-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>

          {errorMessage ? (
            <p className="Recovery-feedback Recovery-feedback--error" aria-live="polite">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="Recovery-feedback Recovery-feedback--success" aria-live="polite">
              {successMessage}
            </p>
          ) : null}

          {debugCode ? (
            <p className="Recovery-feedback Recovery-feedback--debug" aria-live="polite">
              [Dev] Verification code: <strong>{debugCode}</strong>
            </p>
          ) : null}

          <button type="submit" className="Recovery-submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send verification code"}
          </button>

          <p className="Recovery-footer">
            Remembered your password? <Link to="/login">Back to login</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default ForgotPassword;
