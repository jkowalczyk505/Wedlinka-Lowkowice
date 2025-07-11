import React, { createContext, useContext, useState } from "react";
import Alert from "./Alert";

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = "info") => {
    setAlert({ message, type });
  };

  const closeAlert = () => setAlert(null);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert && (
        <Alert message={alert.message} type={alert.type} onClose={closeAlert} />
      )}
    </AlertContext.Provider>
  );
};
