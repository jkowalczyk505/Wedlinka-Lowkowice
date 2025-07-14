import React from "react";
import PropTypes from "prop-types";

function Button({ children, onClick, variant = "red", type = "button", disabled = false, }) {
  return (
    <button
      onClick={onClick}
      className={`custom-button ${variant}`}
      type={type}
      disabled={disabled}
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
};

export default Button;
