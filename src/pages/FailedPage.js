import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";

const FailedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="page page-failed">
      <h1>Ups, coś poszło nie tak...</h1>
      <h2>
        Niestety płatność prawdopodobnie nie została zakończona poprawnie. Twoje
        zamówienie zostało jednak zapisane w naszym systemie.
      </h2>
      <p>Co możesz zrobić?</p>
      <span>- Zweryfikować status płatności i zamówienia w zakładce Konto</span>
      <span>- Skontaktować się z nami</span>
      <span>- Ponownie złożyć nowe zamówienie</span>
      <div className="button-wrapper">
        <Button variant="red" onClick={() => navigate("/sklep")}>
          Wróć do sklepu
        </Button>
      </div>
    </div>
  );
};

export default FailedPage;
