import "./SkillScape.css";
import Group20 from "../../../assets/Landing/SkillScape/Group20.png";


function SkillScape() {
  return (
    <section className="skillscape" id="explore-skills">
        <h2>Explore <span>The SkillScape</span></h2>
        <p>Discover What Your Community Has To Offer</p>
        <div className="skillscape-grid">   
            <div className="skillscape-item">
                <img src={Group20} alt="SkillScape Icon" className="skillscape-icon"/>
            </div>
        </div>

    </section>
  );
}

export default SkillScape;
