import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Spinner from "../common/Spinner";
import LoadError from "../common/LoadError";
import ReviewItem from "./ReviewItem";
import Button from "../common/Button";

const STEP = 5;                       // ile opinii dokładamy na klik

export default function ReviewsList({ productId }) {
  const [allReviews, setAll]   = useState([]);
  const [visible,    setVis]   = useState(STEP);
  const [loading,    setLoad]  = useState(true);
  const [error,      setErr]   = useState(false);

  const fetchReviews = () => {
    setLoad(true);
    setErr(false);

    axios
      .get(`${process.env.REACT_APP_API_URL}/api/reviews/product/${productId}`)
      .then(res => {
        setAll(res.data);
        setVis(STEP);               // reset widocznych przy każdym pobraniu
      })
      .catch(err => {
        console.error("Błąd pobierania opinii:", err);
        setErr(true);
      })
      .finally(() => setLoad(false));
  };

  useEffect(fetchReviews, [productId]);

  if (loading) return <Spinner fullscreen={false} />;
  if (error)   return <LoadError onRetry={fetchReviews} />;

  if (allReviews.length === 0)
    return <p className="no-reviews">Produkt nie ma jeszcze żadnych opinii.</p>;

  const shown = allReviews.slice(0, visible);
  const canLoadMore = visible < allReviews.length;

  return (
    <div className="reviews-wrapper">
      <div className="reviews-list">
        {shown.map(rv => (
          <ReviewItem key={rv.id} {...rv} />
        ))}
      </div>

      {canLoadMore && (
        <div className="reviews-loadmore">
          <Button variant="red" onClick={() => setVis(v => v + STEP)}>
            Pokaż kolejne
          </Button>
        </div>
      )}
    </div>
  );
}

ReviewsList.propTypes = {
  productId: PropTypes.number.isRequired,
};
