// src/components/account/OrderTile.js
import PropTypes from "prop-types";
import { Link }  from "react-router-dom";
import { formatGrossPrice } from "../../utils/product";
import { statusToPL }        from "../../utils/orderStatus";

export default function OrderTile({
  order_number, created_at, total_brut, status,
  itemsCount, images, distinctCount
}) {
  const date = new Date(created_at).toLocaleDateString("pl-PL");
  const price = formatGrossPrice(total_brut) + " zł";

  const thumbs = images;             // max 3 miniaturki
  const more   = distinctCount - thumbs.length;

  return (
    <Link
        to={`/konto/zamowienia/${order_number}`}
        className="order-tile"
        >
        <header className="tile-head">
            <span className="nr">#{order_number}</span>
            <span className="date">{date}</span>
        </header>

      <div className="thumbs">
        {thumbs.map((img, i) => (
          <img
            key={i}
            src={`${process.env.REACT_APP_API_URL}/uploads/products/${img}`}
            alt=""
          />
        ))}
        {more > 0 && <span className="more">+{more}</span>}
      </div>

      <footer className="tile-foot">
            <span className="count">{itemsCount} szt.</span>
            <span className="price">{price}</span>
            <span className={`status ${status}`}>{statusToPL(status)}</span>
        </footer>
    </Link>
  );
}

OrderTile.propTypes = {
  order_number: PropTypes.string.isRequired,
  created_at:  PropTypes.string.isRequired,
  total_brut:  PropTypes.oneOfType([PropTypes.string,PropTypes.number]).isRequired,
  status:      PropTypes.string.isRequired,
  itemsCount:  PropTypes.number.isRequired,
  images:      PropTypes.arrayOf(PropTypes.string).isRequired,
};
