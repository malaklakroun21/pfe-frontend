import "./Footer.css";
import FooterFenneky from "../../../assets/Landing/Footer/FooterFenneky.png";


function Footer() {
    return (
        <footer className="footer">
            <div className="footer-fenneky">
                <img src={FooterFenneky} alt="Footer Fenneky" />
            </div>

            <div className="footer-lists">
                <ul>
                    <li className="titlefooter">Product</li>
                    <li className="listfooter">features</li>
                    <li className="listfooter">pricing</li>
                    <li className="listfooter">how it works</li>
                </ul>
                <ul>
                    <li className="titlefooter">Company</li>
                    <li className="listfooter">About Us</li>
                    <li className="listfooter">blog</li>
                    <li className="listfooter">Careers</li>
                </ul>
                <ul>
                    <li className="titlefooter">Support</li>
                    <li className="listfooter">Help Center</li>
                    <li className="listfooter">community</li>
                    <li className="listfooter">Contact Us</li>
                    
                </ul>
            </div>
        </footer>
    );
}

export default Footer;
