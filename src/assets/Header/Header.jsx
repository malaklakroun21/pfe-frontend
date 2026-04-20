import image from "./image.png";
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
            <li><a href="#Burrow" className="listHeader">Burrow</a></li>
            <li><a href="#Explore Skills" className="listHeader">Explore Skills</a></li>
            <li><a href="#How it works" className="listHeader">How it works</a></li>
            <li><a href="#LOGIN" className="listHeader login" >LOGIN</a></li>
        </ul>
      </div>
    </div>
    
  );
}

export default Header;