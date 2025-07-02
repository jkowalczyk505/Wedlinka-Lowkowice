import { useEffect, useState } from "react";
import { MdOutlineCookie } from "react-icons/md";
import Button from "../common/Button";

function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "true");
    setVisible(false);
  };

  return (
    visible && (
      <div className="cookie-banner">
        <div className="cookie-icon">
          <MdOutlineCookie size={40} />
        </div>
        <div className="cookie-text">
          <h4>Ta strona używa ciasteczek</h4>
          <p>
            Używamy plików cookies niezbędnych do działania strony, logowania
            oraz koszyka. Kontynuując, wyrażasz na to zgodę. Szczegóły
            znajdziesz w naszej{" "}
            <a href="/files/Polityka_Prywatnosci.pdf" download>
              polityce prywatności
            </a>
            .
          </p>
        </div>
        <Button onClick={handleAccept} variant="red">
          Akceptuję
        </Button>
      </div>
    )
  );
}

export default CookieConsentBanner;
