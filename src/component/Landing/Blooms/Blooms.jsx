import "./Blooms.css";
import idea from "../../../assets/Landing/Blooms/Idea.png";
import Donate from "../../../assets/Landing/Blooms/Donate.png";
import Clock from "../../../assets/Landing/Blooms/Clock.png";

function Blooms() {
  return (
    <section className="blooms" id="how-it-works">
      <div className="blooms__heading">
        <h2>HOW FENNEKY BLOOMS</h2>
        <p>
          Three Simple Steps To Transitions
          <br />
          From Seeker To Mentor In Our Flourishing Landscape
        </p>
      </div>

      <div className="blooms__scene">
        <svg
          className="blooms__connector blooms__connector--left"
          viewBox="0 0 260 130"
          aria-hidden="true"
        >
          <circle cx="6" cy="28" r="6" />
          <polyline points="12,28 118,12 258,126" />
        </svg>

        <svg
          className="blooms__connector blooms__connector--right"
          viewBox="0 0 220 180"
          aria-hidden="true"
        >
          <polyline points="10,166 150,68 178,16" />
          <circle cx="178" cy="16" r="6" />
        </svg>

        <article className="bloom-card bloom-card--left">
          <div className="bloom-card__icon bloom-card__icon--idea">
            <img src={idea} alt="Idea icon" className="bloom-card__image" />
          </div>

          <h3>
            Share Your
            <br />
            Knowledge
          </h3>
        </article>

        <article className="bloom-card bloom-card--center">
          <div className="bloom-card__icon bloom-card__icon--clock">
            <img src={Clock} alt="Clock icon" className="bloom-card__image" />
          </div>

          <h3>
            For Every Hour
            <br />
            You Spent
            <br />
            You Earn Credits
          </h3>
        </article>

        <article className="bloom-card bloom-card--right">
          <div className="bloom-card__icon bloom-card__icon--donate">
            <img src={Donate} alt="Credits icon" className="bloom-card__image" />
          </div>

          <h3>
            Invest Your Earned Credits
            <br />
            To Hire A Mentor
            <br />
            Learn A New Skill
          </h3>
        </article>
      </div>
    </section>
  );
}

export default Blooms;
