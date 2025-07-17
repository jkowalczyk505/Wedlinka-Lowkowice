import { useState, useEffect, useCallback } from "react";
import { formatQuantity } from "../../utils/product";
import { AuthFetch } from "../../components/auth/AuthFetch";
import ConfirmAlert from "../../components/common/alert/ConfirmAlert";
import Spinner from "../../components/common/Spinner";
import LoadError from "../../components/common/LoadError";
import { useAlert } from "../../components/common/alert/AlertContext";
import AdminReviewItem from "../../components/admin/reviews/AdminReviewItem";
import ExpandableSection from "../../components/admin/reviews/ExpandableSection";

export default function AdminReviews() {
  const { showAlert } = useAlert();
  const [groupedReviews, setGroupedReviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
       // AuthFetch zwraca fetch‐owy Response, nie JSON bezpośrednio
      const res = await AuthFetch(
        `${process.env.REACT_APP_API_URL}/api/reviews`,
        { method: "GET" }
      );
      if (!res.ok) throw new Error("Brak autoryzacji");
      const data = await res.json();
      // data = [{ id, user, rating, comment, createdAt, product: { id, name } }, …]

      const grouped = data.reduce((acc, r) => {
        const prod = {
          id:       r.product_id,
          name:     r.productName,
          quantity: r.productQuantity,  // <— dorzucone
          unit:     r.productUnit       // <— dorzucone
        };
        if (!acc[prod.id]) acc[prod.id] = { product: prod, reviews: [] };
        acc[prod.id].reviews.push(r);
        return acc;
      }, {});


      setGroupedReviews(grouped);
    } catch (err) {
      console.error("Błąd pobierania opinii:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const confirmDelete = (rev) => setToDelete(rev);
  const cancelDelete  = () => setToDelete(null);
  const doDelete      = async () => {
    try {
      // używamy AuthFetch, żeby przesłać nagłówek z tokenem
      const res = await AuthFetch(
        `${process.env.REACT_APP_API_URL}/api/reviews/${toDelete.id}`,
        { method: "DELETE" }
      );
     if (!res.ok) throw new Error("Brak autoryzacji");
      showAlert("Opinia usunięta", "info");
      fetchReviews();
    } catch (err) {
      console.error("Błąd usuwania opinii:", err);
      showAlert("Błąd przy usuwaniu opinii", "error");
    } finally {
      cancelDelete();
    }
  };

  if (loading) return <Spinner fullscreen={false} />;
  if (error)   return <LoadError onRetry={fetchReviews} />;

  return (
    <div className="admin-reviews">
      <h1 className="admin-page-title">Zarządzanie opiniami</h1>

      {Object.values(groupedReviews).map(({ product, reviews }) => {
        // sformatowany opis ilości
        const qty = formatQuantity(product.quantity);
        const title = `${product.name} ${qty}${product.unit} (${reviews.length})`;

        return (
          <ExpandableSection key={product.id} title={title}>
            {reviews.map(r => (
              <AdminReviewItem
                key={r.id}
                review={r}
                onDelete={() => confirmDelete(r)}
              />
            ))}
          </ExpandableSection>
        );
      })}

      {toDelete && (
        <ConfirmAlert
          message={`Czy na pewno usunąć opinię od ${toDelete.userName}?`}
          onConfirm={doDelete}
          onClose={cancelDelete}
          confirmButtonText="Usuń"
          cancelButtonText="Anuluj"
        />
      )}
    </div>
  );
}
