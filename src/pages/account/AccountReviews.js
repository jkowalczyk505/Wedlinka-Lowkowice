import { useEffect, useState } from "react";
import Spinner                   from "../../components/common/Spinner";
import LoadError                 from "../../components/common/LoadError";
import AccountReviewItem         from "../../components/account/AccountReviewItem";
import ReviewModal               from "../../components/reviews/ReviewModal";
import ConfirmAlert              from "../../components/common/alert/ConfirmAlert";
import { AuthFetch }             from "../../components/auth/AuthFetch";
import { useAlert }              from "../../components/common/alert/AlertContext";
import Button from "../../components/common/Button";

const STEP = 10;                     // paginacja „pokaż więcej”

export default function AccountReviews() {
  const { showAlert }      = useAlert();
  const [all, setAll]      = useState([]);
  const [visible, setVis]  = useState(STEP);
  const [loading, setLd]   = useState(true);
  const [error, setErr]    = useState(false);

  /* modal + id aktualnie edytowanej recenzji */
  const [editReview, setEdit] = useState(null);
  const [toDelete,   setDel]  = useState(null);

  const fetchData = () => {
    setLd(true); setErr(false);
    AuthFetch(`${process.env.REACT_APP_API_URL}/api/reviews/my`)
      .then(r => r.json()).then(setAll)
      .catch(()=> setErr(true))
      .finally(()=> setLd(false));
  };
  useEffect(fetchData, []);

  /* -------- usuwanie ---------- */
  const doDelete = async () => {
    if(!toDelete) return;
    try{
      const res = await AuthFetch(
        `${process.env.REACT_APP_API_URL}/api/reviews/${toDelete.id}`,
        { method:"DELETE" }
      );
      if(!res.ok) throw await res.json();
      showAlert("Opinia usunięta","info");
      fetchData();
    }catch(e){
      showAlert(e?.error || "Nie udało się usunąć opinii","error");
    }finally{ setDel(null); }
  };

  /* -------- render ---------- */
  if(loading) return <Spinner fullscreen={false}/>;
  if(error)   return <LoadError onRetry={fetchData}/> ;

  const shown = all.slice(0, visible);

  return (
    <div className="account-reviews">
      <h2>Moje opinie</h2>

      {all.length === 0 && <p>Nie masz jeszcze żadnych opinii.</p>}

      {shown.map(r => (
        <AccountReviewItem
          key={r.id}
          {...r}
          productQuantity={r.productQuantity}
          productUnit={r.productUnit}
          onEdit={()=> setEdit(r)}
          onDelete={()=> setDel(r)}
        />
      ))}

      {visible < all.length && (
        <div className="reviews-loadmore">
          <Button variant="red"
                  onClick={()=> setVis(v=>v+STEP)}>
            Pokaż kolejne
          </Button>
        </div>
      )}

      {/* modal edycji */}
      {editReview && (
        <ReviewModal
          open={true}
          productId={editReview.productId}
          onClose={()=> setEdit(null)}
          onSaved={fetchData}
          /* ↓ inicjujemy danymi opinii – patrz pkt 2.3 */
          initial={{ id:editReview.id,
                     rating:editReview.rating,
                     comment:editReview.comment }}
        />
      )}
      {/* confirm delete */}
      {toDelete && (
        <ConfirmAlert
          message="Czy na pewno chcesz usunąć tę opinię?"
          onConfirm={doDelete}
          onClose={()=>setDel(null)}
          confirmButtonText="Usuń"
          cancelButtonText="Anuluj"
        />
      )}
    </div>
  );
}
