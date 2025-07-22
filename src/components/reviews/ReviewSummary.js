import React, { useState } from "react";
import RatingStars from "./RatingStars";
import Button from "../common/Button";
import InfoTip from "../common/InfoTip";
import PropTypes from "prop-types";
import { FaInfoCircle } from "react-icons/fa";

export default function ReviewSummary({ avg, total, canReview = false }) {
  const [showTip, setShowTip] = useState(false);
  return (
    <div className="review-summary">
      <div className="box avg-box">
        <RatingStars rating={avg} />
        <div className="avg-value">
          {avg.toFixed(1)}
          <span className="slash">/5</span>
        </div>

        <div className="info-tip-wrapper">
          <Button disabled={!canReview}>Oceń</Button>

          <button
            type="button"
            className="info-btn"
            onClick={() => setShowTip((v) => !v)}
            aria-label="Informacje o ocenach"
          >
            <FaInfoCircle size={18} />
          </button>
          {showTip && (
            <div className="floating-tip">
              <InfoTip>
                Oceny mogą wystawiać wyłącznie zalogowani klienci, którzy kupili produkt.
              </InfoTip>
            </div>
          )}
        </div>
      </div>

      <div className="divider" />

      <div className="box count-box">
        <span className="count-circle">{total}</span>
        <p className="count-label">Opinie&nbsp;Klientów</p>
      </div>
    </div>
  );
}

ReviewSummary.propTypes = {
  avg:   PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};
