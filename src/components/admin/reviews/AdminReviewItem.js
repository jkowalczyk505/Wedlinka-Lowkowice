import Button from "../../common/Button";
import RatingStars from "../../reviews/RatingStars";

export default function AdminReviewItem({ review, onDelete }) {
  const text = review.comment;
  const date = review.created_at;

  return (
    <div className="admin-review-item">
      <div className="review-header">
        <strong className="review-author">{review.userName}</strong>
        <time dateTime={date} className="review-date">
          {new Date(date).toLocaleDateString("pl-PL")}
        </time>
        <RatingStars rating={Number(review.rating)} className="review-rating" />
      </div>

      <p className="review-text">{text}</p>

      <Button variant="dark" size="small" onClick={onDelete}>
        Usuń
      </Button>
    </div>
  );
}
