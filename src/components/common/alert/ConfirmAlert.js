import React from "react";
import ReactDOM from "react-dom";
import Button from "../Button";

/**
 * Komponent potwierdzenia jako portal do „modal-root"
 */
export default function ConfirmAlert({
  message,
  onClose,
  onConfirm,
  confirmButtonText = "OK",
  cancelButtonText = null,
}) {
  const backdrop = (
    <div className="confirm-alert-backdrop">
      <div className="confirm-alert-box">
        <p>{message}</p>
        <div className="confirm-alert-buttons">
          {onConfirm && (
            <Button variant="red" onClick={onConfirm}>
              {confirmButtonText}
            </Button>
          )}
          {cancelButtonText && (
            <Button variant="dark" onClick={onClose}>
              {cancelButtonText}
            </Button>
          )}
          {!cancelButtonText && !onConfirm && (
            <Button variant="beige" onClick={onClose}>
              {confirmButtonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  // Renderujemy backdrop nad wszystkimi innymi elementami
  return ReactDOM.createPortal(
    backdrop,
    document.getElementById("modal-root")
  );
}
