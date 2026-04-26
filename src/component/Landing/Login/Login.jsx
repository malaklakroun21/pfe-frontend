import { Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
  return (
    <section className="Login">
      <div className="Login-container">
        <div className="Login-copy">
          <h1>Welcome Back</h1>
          <p>Log in to continue learning and teaching</p>
        </div>

        <form className="Login-form">
          <div className="Login-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
            />
          </div>

          <div className="Login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
            />
          </div>
          <a href="/forgot-password" className="Login-forgot-password">
            Forgot Password?
          </a>

          <button type="submit" className="Login-submit">
            Log In
          </button>

          <div className="Login-divider">
            <span className="Login-divider-line" />
            <span className="Login-divider-text">Or continue with</span>
            <span className="Login-divider-line" />
          </div>

          <div className="Login-social">
            <button type="button" className="Login-social-button">
              <span className="Login-google-icon" aria-hidden="true">
                G
              </span>
              <span>Continue with Google</span>
            </button>
          </div>

          <p className="Login-signup">
            Don&apos;t have an account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Login;
