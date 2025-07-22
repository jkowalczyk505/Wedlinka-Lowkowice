import React from "react";
import { NavLink } from "react-router-dom";
import { FaFacebookF } from "react-icons/fa";
import logo from "../../assets/logo.png";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner">

        {/* ——— LEWY BLOK: logo + dane + social ——— */}
        <div className="footer__col footer__info">
          <NavLink to="/">
            <img src={logo} alt="Wędlinka Łowkowice" className="footer__logo" />
          </NavLink>

          <address className="footer__address">
            Wędlinka Łowkowice<br/>
            ul. Przykładowa 12, 08-500 Łowkowice<br/>
            NIP 123-456-78-90<br/>
            e-mail: biuro@wedlinka.pl<br/>
            tel. +48 123 456 789
          </address>

          <div className="footer__social">
            <a href="#" aria-label="Facebook"><FaFacebookF/></a>
          </div>
        </div>

        {/* ——— ŚRODEK: linki informacyjne ——— */}
        <div className="footer__col">
          <h4 className="footer__heading">Informacje</h4>
          <ul>
            <li><NavLink to="/informacje-o-dostawie">Dostawa</NavLink></li>
            <li><NavLink to="/reklamacje">Reklamacje i zwroty</NavLink></li>
            <li><NavLink to="/kontakt">Kontakt</NavLink></li>
            <li><NavLink to="/regulamin">Regulamin</NavLink></li>
            <li><NavLink to="/polityka-prywatnosci">Polityka prywatności</NavLink></li>
          </ul>
        </div>

        {/* ——— PRAWO: kategorie produktów ——— */}
        <div className="footer__col">
          <h4 className="footer__heading">Nasze produkty</h4>
          <ul>
            <li><NavLink to="/sklep">Wszystkie produkty</NavLink></li>
            <li><NavLink to="/sklep/kielbasy">Kiełbasy</NavLink></li>
            <li><NavLink to="/sklep/wedliny">Wędliny</NavLink></li>
            <li><NavLink to="/sklep/wyroby-podrobowe">Wyroby podrobowe</NavLink></li>
            <li><NavLink to="/sklep/nasze-paczki">Paczki</NavLink></li>
          </ul>
        </div>
      </div>

      {/* ——— Linia dolna ——— */}
      <div className="footer__bottom">
        © {year} Wędlinka Łowkowice. Wszelkie prawa zastrzeżone.
      </div>
    </footer>
  );
}

export default Footer;
