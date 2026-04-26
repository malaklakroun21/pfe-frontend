import { Link } from "react-router-dom";
import image from "../../../assets/Landing/Header/image.png";
import "./Header.css";

function Header() {
  return (
    <div className="header">
      <div className="header-left">
        <img src={image} alt="Header Image"  className="imageHeader"/>
        <h1 className="FENNEKYH1">FENNEKY</h1>
       
      </div>
      <div className="header-right">
        <ul>
            <li><a href="#hero" className="listHeader">Home</a></li>
            <li><a href="#how-it-works" className="listHeader">How it works</a></li>
            <li><a href="#explore-skills" className="listHeader">Explore Skills</a></li>
            <li><a href="#leaders" className="listHeader">Leaders</a></li>
            <li><a href="#community" className="listHeader">Burrow</a></li>
            <li><Link to="/login" className="listHeader login">LOGIN</Link></li>
        </ul>
      </div>
    </div>
    
  );
}

export default Header;
