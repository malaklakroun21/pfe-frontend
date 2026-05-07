import { Link } from "react-router-dom";
import "./Sign.css";

const roleOptions = [
  {
    value: "LEARNER",
    label: "Learn",
    icon: "\u{1F4DA}",
  },
  {
    value: "MENTOR",
    label: "Mentor",
    icon: "\u{1F9D1}\u200D\u{1F3EB}",
  },
];

function Sign({
  isSubmitting = false,
  errorMessage = "",
  selectedRole = "LEARNER",
  onRoleChange = () => {},
}) {
  return (
    <section className="Sign">
      <div className="Sign-container">
        <div className="Sign-copy">
          <h1>Create Account</h1>
          <p>Join the FENNEKY Community</p>
        </div>

        <form className="Sign-form">
          <div className="Sign-field">
            <label htmlFor="full-name">Name</label>
            <input
              id="full-name"
              name="full-name"
              type="text"
              placeholder="Your Name"
            />
          </div>

          <div className="Sign-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Your Email"
            />
          </div>

          <div className="Sign-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Your Password"
            />
          </div>

          <div className="Sign-field">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              placeholder="Confirm Your Password"
            />
          </div>

          <fieldset className="Sign-role-picker">
            <legend>I want to...</legend>

            <div className="Sign-role-grid">
              {roleOptions.map((option) => (
                <label
                  key={option.value}
                  className={`Sign-role-card ${selectedRole === option.value ? "is-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={selectedRole === option.value}
                    onChange={() => onRoleChange(option.value)}
                  />
                  <span className="Sign-role-icon" aria-hidden="true">
                    {option.icon}
                  </span>
                  <span className="Sign-role-label">{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {errorMessage ? <p>{errorMessage}</p> : null}

          <button type="submit" className="Sign-submit" disabled={isSubmitting}>
            {isSubmitting ? "Création..." : "Sign Up"}
          </button>

          <div className="Sign-divider">
            <span className="Sign-divider-line" />
            <span className="Sign-divider-text">Or continue with</span>
            <span className="Sign-divider-line" />
          </div>

          <div className="Sign-social">
            <button type="button" className="Sign-social-button">
              <span className="Sign-google-icon" aria-hidden="true">
                G
              </span>
              <span>Continue with Google</span>
            </button>
          </div>

          <p className="Sign-login">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default Sign;
