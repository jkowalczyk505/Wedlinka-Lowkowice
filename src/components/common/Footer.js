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
            Wędlinka Łowkowice
            <br />
            ul. Księdza Rigola 42, 46-211 Łowkowice
            <br />
            NIP 751-155-63-05
            <br />
            e-mail: kontakt@wedlinkalowkowice.pl
            <br />
            tel. +48 500 877 347
          </address>

          <div className="footer__social">
            <a
              href="https://www.facebook.com/profile.php?id=100082854926240&locale=pl_PL"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
          </div>
        </div>

        {/* ——— ŚRODEK: linki informacyjne ——— */}
        <div className="footer__col">
          <h4 className="footer__heading">Informacje</h4>
          <ul>
            <li>
              <NavLink to="/informacje-o-dostawie">Dostawa</NavLink>
            </li>
            <li>
              <NavLink to="/reklamacje">Reklamacje i zwroty</NavLink>
            </li>
            <li>
              <NavLink to="/kontakt">Kontakt</NavLink>
            </li>
            <li>
              <NavLink to="/nasze-sklepy">Nasze sklepy</NavLink>
            </li>
            <li>
              <a
                href="/files/Regulamin_sklepu.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                Regulamin
              </a>
            </li>
            <li>
              <a
                href="/files/Polityka_Prywatnosci.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                Polityka prywatności
              </a>
            </li>
          </ul>
        </div>

        {/* ——— PRAWO: kategorie produktów ——— */}
        <div className="footer__col">
          <h4 className="footer__heading">Nasze produkty</h4>
          <ul>
            <li>
              <NavLink to="/sklep">Wszystkie produkty</NavLink>
            </li>
            <li>
              <NavLink to="/sklep/kielbasy">Kiełbasy</NavLink>
            </li>
            <li>
              <NavLink to="/sklep/wedliny">Wędliny</NavLink>
            </li>
            <li>
              <NavLink to="/sklep/wyroby-podrobowe">Wyroby podrobowe</NavLink>
            </li>
            <li>
              <NavLink to="/sklep/nasze-paczki">Paczki</NavLink>
            </li>
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
