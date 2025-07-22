import { useState, useEffect } from "react";
import PropTypes            from "prop-types";
import Modal                from "../common/Modal";
import Button               from "../common/Button";
import { useAlert }         from "../common/alert/AlertContext";
import { AuthFetch }        from "../auth/AuthFetch";
import { FaStar }           from "react-icons/fa";
import Spinner              from "../common/Spinner";

const API = `${process.env.REACT_APP_API_URL}/api/reviews`;

export default function ReviewModal({ open, productId, onClose, onSaved }) {
  const { showAlert } = useAlert();

  const [rating,   setRating]   = useState(0);     // 1‑5
  const [hover,    setHover]    = useState(0);
  const [comment,  setComment]  = useState("");
  const [saving,   setSaving]   = useState(false);

  /* wyczyść formularz po każdym otwarciu */
  useEffect(()=>{ if(open){ setRating(0); setHover(0); setComment(""); } },[open]);

  const submit = async e => {
    e.preventDefault();
    if(!rating) return showAlert("Wybierz liczbę gwiazdek","error");

    setSaving(true);
    try{
      const res = await AuthFetch(API,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ productId, rating, comment })
      });
      if(!res.ok) throw await res.json();

      showAlert("Dziękujemy za opinię!","info");
      onSaved();            // odśwież listę opinii / produkt
      onClose();
    }catch(err){
      const msg = err?.error || "Nie udało się dodać opinii";
      showAlert(msg,"error");
    }finally{ setSaving(false); }
  };

  /* --- render --- */
  return (
    <Modal open={open} onClose={onClose} title="Twoja ocena">
      <form onSubmit={submit} className="review-form">

        {/* Gwiazdki */}
        <div className="stars">
          {[1,2,3,4,5].map(val=>(
            <FaStar key={val}
              size={32}
              onMouseEnter={()=>setHover(val)}
              onMouseLeave={()=>setHover(0)}
              onClick={()=>setRating(val)}
              style={{ cursor:"pointer",
                       fill: (hover||rating)>=val ? "#e4d78d" : "#ccc" }}
            />
          ))}
        </div>

        {/* Komentarz */}
        <label className="mt-2">Komentarz <span style={{fontWeight:400}}>(opcjonalnie)</span></label>
        <textarea
          value={comment}
          maxLength={500}
          onChange={e=>setComment(e.target.value)}
          placeholder="Co sądzisz o produkcie?"
        />

        <div className="modal-actions">
          <Button variant="dark"  type="button" onClick={onClose}>Anuluj</Button>
          <Button variant="red"   type="submit" disabled={saving}>
            {saving ? <Spinner size="small"/> : "Wyślij"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

ReviewModal.propTypes = {
  open:      PropTypes.bool.isRequired,
  productId: PropTypes.number.isRequired,
  onClose:   PropTypes.func.isRequired,
  onSaved:   PropTypes.func.isRequired,
};
