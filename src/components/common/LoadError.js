// src/components/common/LoadError.jsx
import React from "react";
import Button from "./Button";

function LoadError({ message = "Nie udało się załadować treści.", onRetry }) {
  return (
    <div className="load-error">
      <p className="load-error-message">{message}</p>
      {onRetry && (
        <Button variant="red" onClick={onRetry}>
          Spróbuj ponownie
        </Button>
      )}
    </div>
  );
}

export default LoadError;
