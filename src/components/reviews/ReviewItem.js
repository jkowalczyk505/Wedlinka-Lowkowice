// src/components/reviews/ReviewItem.jsx
import PropTypes from "prop-types";
import RatingStars from "./RatingStars";

export default function ReviewItem({ userName, rating, comment, created_at }) {
  return (
    <article className="review-item">
      <header className="review-header">
        <span className="review-user">{userName}</span>
        <RatingStars rating={rating} className="review-stars" />
        <time dateTime={created_at} className="review-date">
          {new Date(created_at).toLocaleDateString("pl-PL")}
        </time>
      </header>
      <p className="review-comment">{comment}</p>
    </article>
  );
}

ReviewItem.propTypes = {
  userName:   PropTypes.string.isRequired,
  rating:     PropTypes.number.isRequired,
  comment:    PropTypes.string.isRequired,
  created_at: PropTypes.string.isRequired,
};
