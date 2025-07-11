import React, { useEffect } from "react";

const Alert = ({ message, type = "info", onClose }) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timeout);
  }, [onClose]);

  return (
    <div className={`alert alert-${type}`}>
      <span>{message}</span>
      <button className="close" onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export default Alert;
