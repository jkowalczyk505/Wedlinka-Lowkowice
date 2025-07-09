import React from "react";
import { FaBasketShopping } from "react-icons/fa6";
import PropTypes from "prop-types";

export default function AddToCartButton({ onClick, disabled }) {
  return (
    <button
      className="add-to-cart-button"
      onClick={onClick}
      disabled={disabled}
    >
      <FaBasketShopping className="icon" />
      <span>Dodaj do koszyka</span>
    </button>
  );
}

AddToCartButton.propTypes = {
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
};

AddToCartButton.defaultProps = {
  onClick: () => {},
  disabled: false,
};
