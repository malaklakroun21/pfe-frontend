import "./Blooms.css";
import idea from "./idea.png";
import Donate from "./Donate.png";
import Clock from "./Clock.png";

function Blooms() {
  return (
    <section className="blooms">
        <h2>HOW FENNEKY BLOOMS</h2>
        <p>three simple steps to transitions <br/> from seeker to mentor in our flourishing landscape</p>
        <div className="blooms-grid">
            <div className="bloom-item bloom-item-first">
                <div className="colorimg1"><img src={idea} alt="Idea Icon" className="bloom-icon"/></div>
                <h3>Share Your <br/> Knowledge</h3>
            </div>
            <div className="bloom-item bloom-item-second">
                <div className="colorimg2"><img src={Clock} alt="Clock Icon" className="bloom-icon"/></div>
                <h3>for every hour <br/>you spent <br/> you earn credit</h3>
            </div>
            
            <div className="bloom-item bloom-item-last">
                <div className="colorimg3"><img src={Donate} alt="Donate Icon" className="bloom-icon"/></div>
                <h3>Invest Your Earned Credits <br/>To Hire A Mentor <br/>Learn A New Skill</h3>   
            </div>
        </div>
    </section>
  );
}

export default Blooms;