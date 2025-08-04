// src/components/account/OrderTile.js
import PropTypes from "prop-types";
import { formatGrossPrice } from "../../utils/product";
import { statusToPL } from "../../utils/orderStatus";

export default function OrderTile({ isOpen, onToggle, ...props }) {
  const {
    id,
    order_number,
    created_at,
    total_brut,
    totalWithShip,
    status,
    itemsCount,
    images,
    distinctCount,
  } = props;

  const date = new Date(created_at).toLocaleDateString("pl-PL");
  const price = formatGrossPrice(totalWithShip ?? total_brut) + " zł";

  const thumbs = images; // max 3 miniaturki
  const more = distinctCount - thumbs.length;

  return (
    <>
      <div className={`order-tile ${isOpen ? "open" : ""}`} onClick={onToggle}>
        <header className="tile-head">
          <span className="nr">#{order_number}</span>
          <span className="date">{date}</span>
        </header>

        <div className="thumbs">
          {thumbs.map((img, i) => (
            <img
              key={i}
              src={`${process.env.REACT_APP_API_URL}/api/uploads/products/${img}`}
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
      </div>
    </>
  );
}

OrderTile.propTypes = {
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func,
  order_number: PropTypes.string.isRequired,
  created_at: PropTypes.string.isRequired,
  totalWithShip: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  status: PropTypes.string.isRequired,
  itemsCount: PropTypes.number.isRequired,
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
};
