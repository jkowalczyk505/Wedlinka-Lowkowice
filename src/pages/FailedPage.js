import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";

const FailedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="page page-failed">
      <h1>Ups, coś poszło nie tak...</h1>
      <h2>
        Niestety płatność nie została zakończona poprawnie. Twoje zamówienie
        zostało zapisane w naszym systemie, ale nie jest jeszcze opłacone.
      </h2>
      <p>Co możesz zrobić?</p>
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
