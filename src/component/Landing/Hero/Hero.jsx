import { useNavigate } from "react-router-dom";
import "./Hero.css";

function Hero() {
  const navigate = useNavigate();

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="hero" id="hero">
      <div className="hero-content">
        <h1>
          Your <span>Time</span> is <br />the Currency of <span className="growth">Growth</span>
        </h1>
        <p>
          Join a resilient community where <span className="highlight">skills are shared, not sold</span><br />
          offer what you love, earn time credits, and unlock a world of new possibilities.
        </p>
        <div className="hero-buttons">
          <button
            type="button"
            className="btn-outline buttonHero"
            onClick={() => navigate("/signup")}
          >
            join the burrow
          </button>
          <button
            type="button"
            className="btn-primary buttonHero"
            onClick={scrollToHowItWorks}
          >
            see how it works
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;
