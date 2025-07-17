import React from "react";
import PropTypes from "prop-types";

export default function PostalCodeInput({
  digits,
  onDigitChange,
  onDigitKeyDown,
}) {
  return (
    <div className="postal-code-group">
      {digits.map((digit, i) => (
        <span key={i}>
          <input
            id={`postal-${i}`}
            type="text"
            inputMode="numeric"
            maxLength="1"
            className="postal-digit"
            value={digit}
            onChange={(e) => onDigitChange(e, i)}
            onKeyDown={(e) => onDigitKeyDown(e, i)}
            required
          />
          {i === 1 && <span className="dash">-</span>}
        </span>
      ))}
    </div>
  );
}

PostalCodeInput.propTypes = {
  digits: PropTypes.arrayOf(PropTypes.string).isRequired,
  onDigitChange: PropTypes.func.isRequired,
  onDigitKeyDown: PropTypes.func.isRequired,
};
