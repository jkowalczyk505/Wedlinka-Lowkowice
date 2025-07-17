import React from "react";
import PropTypes from "prop-types";

function Button({
  children,
  onClick,
  variant = "red",
  type = "button",
  disabled = false,
  className = ""    // <-- dodajemy props className
}) {
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`custom-button ${variant} ${className}`.trim()}  // <-- łączymy klasy
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(["red", "beige", "dark"]),
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  disabled: PropTypes.bool,
  className: PropTypes.string,  // <-- deklarujemy prop
};

export default Button;
