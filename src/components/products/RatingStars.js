// src/components/products/RatingStars.jsx
import React from "react";
import PropTypes from "prop-types";
import { FaStar, FaRegStar } from "react-icons/fa";

export default function RatingStars({ rating, className = "" }) {
  // rating w [0..5], może być 4.87, 3.3 itd.
  const stars = [0,1,2,3,4].map(i => {
    // fill od 0 do 1
    const fill = Math.min(Math.max(rating - i, 0), 1);
    return (
      <div key={i} className="star-wrapper">
        <FaRegStar className="star-empty" />
        <div
          className="star-filled-clip"
          style={{ width: `${fill * 100}%` }}
        >
          <FaStar className="star-filled" />
        </div>
      </div>
    );
  });

  return <div className={`rating-stars ${className}`}>{stars}</div>;
}

RatingStars.propTypes = {
  rating: PropTypes.number.isRequired,
  className: PropTypes.string,
};
