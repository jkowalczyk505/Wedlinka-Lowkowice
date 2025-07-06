import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="page page-404">
      <h1>404</h1>
      <h2>Strona nie znaleziona</h2>
      <p>Podana strona nie została znaleziona. Wróć do strony głównej.</p>
      <div className="button-wrapper">
        <Button variant="red" onClick={() => navigate("/")}>
          STRONA GŁÓWNA
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
