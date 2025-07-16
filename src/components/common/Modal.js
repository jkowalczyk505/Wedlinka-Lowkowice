import { useEffect } from "react";
import ReactDOM      from "react-dom";
import PropTypes     from "prop-types";
import { X }         from "lucide-react";           // ✱ ikonka zamykania

// ① wrzucamy markup do <div id="modal-root"> w public/index.html
const modalRoot = document.getElementById("modal-root") ||
                  document.body.appendChild(document.createElement("div"));

export default function Modal({ open, onClose, title, children }) {
  /* zamykanie klawiszem Escape */
  useEffect(()=>{
    const esc = e=> e.key==="Escape" && onClose();
    document.addEventListener("keydown", esc);
    return ()=> document.removeEventListener("keydown", esc);
  },[onClose]);

  if(!open) return null;

  return ReactDOM.createPortal(
    <>
      {/* ---- przyciemniony overlay ---- */}
      <div className="modal-overlay" onClick={onClose} />

      {/* ---- okno ---- */}
      <div className="modal-window" role="dialog" aria-modal="true">
        <header className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose} aria-label="Zamknij">
            <X size={22}/>
          </button>
        </header>

        <div className="modal-body">{children}</div>
      </div>
    </>,
    modalRoot
  );
}

Modal.propTypes = {
  open:     PropTypes.bool.isRequired,
  onClose:  PropTypes.func.isRequired,
  title:    PropTypes.node,
  children: PropTypes.node.isRequired,
};
