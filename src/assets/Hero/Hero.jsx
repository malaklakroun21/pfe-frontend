import "./Hero.css";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>
          Your <span>Time</span> is the Currency of <span className="growth">Growth</span>
        </h1>
        <p>
          Join a resilient community where <span className="highlight">skills are shared, not sold</span><br />
          offer what you love, earn time credits, and unlock a world of new possibilities.
        </p>
        <div className="hero-buttons">
          <button className="btn-outline buttonHero">join the burrow</button>
          <button className="btn-primary buttonHero">see how it works</button>
        </div>
      </div>
    </section>
  );
}

export default Hero;