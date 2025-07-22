import PropTypes   from "prop-types";
import { Link }    from "react-router-dom";
import RatingStars from "../reviews/RatingStars";
import { Pencil, Trash2 } from "lucide-react";
import { formatQuantity } from "../../utils/product";

export default function AccountReviewItem({
  id, productId, productName, productSlug, category, productQuantity,
  productUnit,
  rating, comment, created_at,
  onEdit, onDelete
}) {
  const productUrl = `/sklep/${category}/${productSlug}`;

  return (
    <article className="account-review-item">
      <header>
        <Link to={productUrl} className="product-link">
          {productName}
          {" – "}
          <span className="review-product-qty">
            {formatQuantity(productQuantity)} {productUnit}
          </span>
         </Link>
        <RatingStars rating={rating}/>
        <time>{new Date(created_at).toLocaleDateString("pl-PL")}</time>

        <button className="icon-btn" onClick={onEdit} aria-label="Edytuj">
          <Pencil size={20}/>
        </button>
        <button className="icon-btn" onClick={onDelete} aria-label="Usuń">
          <Trash2 size={20}/>
        </button>
      </header>
      {comment && <p className="review-comment">{comment}</p>}
    </article>
  );
}

AccountReviewItem.propTypes = {
  id:PropTypes.number.isRequired,
  productId:PropTypes.number.isRequired,
  productName:PropTypes.string.isRequired,
  productSlug:PropTypes.string.isRequired,
  category:PropTypes.string.isRequired,
  productQuantity:PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  productUnit:    PropTypes.string.isRequired,
  rating:PropTypes.number.isRequired,
  comment:PropTypes.string,
  created_at:PropTypes.string.isRequired,
  onEdit:PropTypes.func.isRequired,
  onDelete:PropTypes.func.isRequired,
};