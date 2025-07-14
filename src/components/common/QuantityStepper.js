// src/components/common/QuantityStepper.js
import React from "react";
import PropTypes from "prop-types";

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = Infinity,
  disabled = false,
}) {
  const dec = () => !disabled && onChange(Math.max(min, value - 1));
  const inc = () => !disabled && onChange(Math.min(max, value + 1));

  const onInput = (e) => {
    if (disabled) return;
    let v = parseInt(e.target.value, 10);
    if (isNaN(v) || v < min) v = min;
    if (v > max) v = max;
    onChange(v);
  };

  return (
    <div className={`qty-stepper ${disabled ? "is-disabled" : ""}`}>
      <button
        type="button"
        className="qty-btn"
        onClick={dec}
        disabled={disabled || value <= min}
      >
        −
      </button>
      <input
        type="number"
        className="qty-input"
        value={value}
        min={min}
        max={max}
        onChange={onInput}
        disabled={disabled}
      />
      <button
        type="button"
        className="qty-btn"
        onClick={inc}
        disabled={disabled || value >= max}
      >
        +
      </button>
    </div>
  );
}

QuantityStepper.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  disabled: PropTypes.bool,
};
