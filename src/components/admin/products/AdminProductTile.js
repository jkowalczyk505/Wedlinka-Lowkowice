// src/components/admin/AdminProductTile.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";   
import { ReactComponent as DefaultIcon } from "../../../assets/szynka-ikona.svg";
import { formatGrossPrice, formatQuantity, categoryToSlug } from "../../../utils/product";
import Button from "../../common/Button";

export default function AdminProductTile({ product, onEdit, onDelete }) {
  const {
    name,
    price_brut,
    image,
    quantity,
    unit,
    is_available,
    category,
    slug: productSlug,
  } = product;

  const categorySlug = categoryToSlug(category);
  const imgUrl       = `${process.env.REACT_APP_API_URL}/uploads/products/${image}`;
  const [imgError, setImgError] = useState(false);

  return (
    <div className="admin-product-tile">
      <Link
        to={`/sklep/${categorySlug}/${productSlug}`}
        className={`image-wrapper ${!is_available ? "unavailable" : ""}`}
      >
        {!imgError && image ? (
          <img src={imgUrl} alt={name} onError={() => setImgError(true)} />
        ) : (
          <DefaultIcon className="default-icon" />
        )}
        {!is_available && (
          <span className="unavailable-badge">Niedostępny</span>
        )}
      </Link>

      <div className="content">
        <h3>
          <Link
            to={`/sklep/${categorySlug}/${productSlug}`}
            className="product-link"
          >
            {name}
          </Link>
        </h3>
        <p className="qty">
          Ilość: {formatQuantity(quantity)} {unit}
        </p>
        <p className="price">{formatGrossPrice(price_brut)} zł</p>

        <div className="actions">
          <Button variant="beige" onClick={() => onEdit(product)}>Edytuj</Button>
          <Button variant="dark"  onClick={() => onDelete(product)}>Usuń</Button>
        </div>
      </div>
    </div>
  );
}

AdminProductTile.propTypes = {
  product:  PropTypes.object.isRequired,
  onEdit:   PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
