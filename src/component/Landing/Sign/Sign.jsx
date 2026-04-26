import { Link } from "react-router-dom";
import "./Sign.css";

function Sign() {
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

          <button type="submit" className="Sign-submit">
            Sign Up
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
