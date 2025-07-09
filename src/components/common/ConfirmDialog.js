import React from "react";
import Button from "./Button";

const ConfirmDialog = ({ text, onConfirm, onCancel }) => {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <p>{text}</p>
        <div className="confirm-actions">
          <Button variant="red" onClick={onConfirm}>
            Potwierdź
          </Button>
          <Button variant="beige" onClick={onCancel}>
            Anuluj
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
