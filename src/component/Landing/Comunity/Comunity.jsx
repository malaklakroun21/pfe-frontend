import { useNavigate } from "react-router-dom";
import "./Comunity.css";
import Heart from "../../../assets/Landing/Comunity/Heart.png";

function Comunity() {
  const navigate = useNavigate();

  return (
    <section className="comunity-section" id="community">
      <div className="comunity">
        <img src={Heart} alt="Heart Icon" className="comunity-heart" />
        <h2>Your First Skill Could Change Everything</h2>
        <h3>Start Growing With What You Already Have</h3>
        <p>Join thousands of learners and teachers building a better future together.</p>
        <div className="comunity-content">
          <div className="comunity-text">
            <button
              type="button"
              className="comunity-button"
              onClick={() => navigate("/signup")}
            >
              join the burrow -&gt;
            </button>
            <p>free forever no credit card required join in 2 mins</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Comunity;
