import "./Feedback.css";
import feedback from "./feedback.png";

function Feedback() {
  return (
    <section className="feedback">
        <h2>Trusted By People</h2>
        <div className="feedback-img">
            <img src={feedback} alt="Feedback Image" className="feedbackImage"/>
        </div>
    </section>
  );
}

export default Feedback;