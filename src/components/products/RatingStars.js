import React from 'react';
import PropTypes from 'prop-types';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

/**
 * Wyświetla gwiazdki na podstawie oceny averageRating (np. 4.5).
 */
export default function RatingStars({ rating, className = '' }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className={`rating-stars ${className}`}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <FaStar key={`full-${i}`} className="star filled" />
      ))}
      {hasHalf && <FaStarHalfAlt key="half" className="star half" />}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <FaRegStar key={`empty-${i}`} className="star" />
      ))}
    </div>
  );
}

RatingStars.propTypes = {
  rating: PropTypes.number.isRequired,
  className: PropTypes.string,
};
