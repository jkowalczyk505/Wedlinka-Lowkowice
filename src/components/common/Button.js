import React from "react";
import PropTypes from "prop-types";

function Button({ children, onClick, variant = "red", type = "button" }) {
  return (
    <button
      onClick={onClick}
      className={`custom-button ${variant}`}
      type={type}
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
};

export default Button;
