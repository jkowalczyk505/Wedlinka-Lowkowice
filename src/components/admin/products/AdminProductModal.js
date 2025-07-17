// src/components/admin/products/AdminProductModal.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import Spinner from "../../common/Spinner";
import { AuthFetch } from "../../auth/AuthFetch";
import { useAlert } from "../../common/alert/AlertContext";
import { generateProductSlug } from "../../../utils/product";

export default function AdminProductModal({ open, initial, onClose, onSaved }) {
    
  const { showAlert } = useAlert();

  const categories = [
    { value: "kiełbasy", label: "Kiełbasy" },
    { value: "wędliny", label: "Wędliny" },
    { value: "wyroby podrobowe", label: "Wyroby podrobowe" },
    { value: "paczki", label: "Nasze paczki" },
  ];
  const vatOptions = [
    { value: "0.03", label: "3 %" },
    { value: "0.05", label: "5 %" },
    { value: "0.08", label: "8 %" },
  ];

  const empty = {
    name: "",
    category: "",
    slug: "",
    description: "",
    ingredients: "",
    allergens: "",
    unit: "kg",
    quantity: "",
    price_brut: "",
    vat_rate: "0.05",
    is_available: 1,
    image: null,
  };

  const [form, setForm] = useState(() =>
    initial ? { ...empty, ...initial } : empty
  );
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [removeCurrent, setRemoveCurrent] = useState(false);

  /** bezpieczne ustawienie URL (używamy w dwóch miejscach) */
    const setSafePreview = useCallback(src => {
    // pusta wartość lub nie-prawidłowy URL = brak podglądu
    setPreviewUrl(src && src.length ? src : null);
    }, []);

    const fileInputRef = useRef(null);

  const onChooseFile = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };


  useEffect(() => {
  const data = initial ? { ...empty, ...initial } : empty;
  setForm(data);
  setRemoveCurrent(false);

  setSafePreview(
    initial?.image
      ? `${process.env.REACT_APP_API_URL}/uploads/products/${initial.image}`
      : null
  );
}, [initial, setSafePreview]);

  useEffect(() => {
    setForm(f => ({ ...f, slug: generateProductSlug(f) }));
  }, [form.name, form.quantity, form.unit]);

  const handleChange = e => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      const file = files[0];
      setForm(f => ({ ...f, image: file }));
      setRemoveCurrent(false);
      setPreviewUrl(URL.createObjectURL(file));
    } else if (type === "checkbox") {
      setForm(f => ({ ...f, [name]: checked ? 1 : 0 }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleRemoveImage = () => {
    setForm(f => ({ ...f, image: null }));
    setRemoveCurrent(true);
    setPreviewUrl(null);
  };

  const handleNumber = e => {
    const { name, value } = e.target;
    if (/^[0-9]+([.,][0-9]{0,2})?$/.test(value)) {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);

    const apiUrl = `${process.env.REACT_APP_API_URL}/api/products`;
    const fd = new FormData();
    const ALLOWED = [
      "name","category","slug","description","ingredients","allergens",
      "unit","quantity","price_brut","vat_rate","is_available"
    ];
    ALLOWED.forEach(k => {
      const v = form[k];
      if (v == null || v === "") return;
      const val = ["quantity","price_brut","vat_rate"].includes(k)
        ? String(v).replace(",", ".")
        : v;
      fd.append(k, val);
    });
    // if user uploaded new file
    if (form.image instanceof File) {
      fd.append("image", form.image);
    }
    // if user removed existing image
    if (removeCurrent && !form.image) {
      fd.append("removeImage", "1");
    }

    try {
      const url    = initial ? `${apiUrl}/${initial.id}` : apiUrl;
      const method = initial ? "PUT"               : "POST";

      const res = await AuthFetch(url, {
        method,
        body: fd
      });
      if (!res.ok) throw res;
      showAlert(initial ? "Produkt zaktualizowany pomyślnie" : "Nowy produkt dodany pomyślnie", "info");
      onSaved();
      onClose();
    } catch (err) {
      let msg = "Nie udało się zapisać produktu";
      if (err.json) {
        const body = await err.json();
        if (body.error) msg = body.error;
      }
      console.error(err);
      showAlert(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edytuj produkt" : "Nowy produkt"}>
      <form className="admin-product-form form-wrapper" onSubmit={handleSubmit}>
        {/* Nazwa */}
        <label>Nazwa <span className="required">*</span></label>
        <input name="name" value={form.name} onChange={handleChange} required />

        {/* Kategoria */}
        <label className="mt-2">Kategoria <span className="required">*</span></label>
        <div className="radio-group">
          {categories.map(opt => (
            <label key={opt.value} className="radio-option">
              <input
                type="radio"
                name="category"
                value={opt.value}
                checked={form.category === opt.value}
                onChange={handleChange}
                required
              />
              {opt.label}
            </label>
          ))}
        </div>

        {/* Slug */}
        <label className="mt-2">Slug <span className="required">*</span></label>
        <input name="slug" value={form.slug} onChange={handleChange} required />

        {/* Ilość */}
        <label className="mt-2">Ilość <span className="required">*</span></label>
        <input
          name="quantity"
          type="text"
          inputMode="decimal"
          value={form.quantity}
          onChange={handleNumber}
          pattern="^[0-9]+([.,][0-9]{0,2})?$"
          required
        />

        {/* Jednostka */}
        <label className="mt-2">Jednostka <span className="required">*</span></label>
        <div className="radio-group">
          {["kg", "szt"].map(u => (
            <label key={u} className="radio-option">
              <input
                type="radio"
                name="unit"
                value={u}
                checked={form.unit === u}
                onChange={handleChange}
              />
              {u}
            </label>
          ))}
        </div>

        {/* Cena */}
        <label className="mt-2">Cena brutto (zł) <span className="required">*</span></label>
        <input
          name="price_brut"
          type="text"
          inputMode="decimal"
          value={form.price_brut}
          onChange={handleNumber}
          pattern="^[0-9]+([.,][0-9]{0,2})?$"
          required
        />

        {/* VAT */}
        <label className="mt-2">Stawka VAT <span className="required">*</span></label>
        <div className="radio-group">
          {vatOptions.map(opt => (
            <label key={opt.value} className="radio-option">
              <input
                type="radio"
                name="vat_rate"
                value={opt.value}
                checked={form.vat_rate === opt.value}
                onChange={handleChange}
              />
              {opt.label}
            </label>
          ))}
        </div>

        {/* Opis */}
        <label className="mt-2">Opis <span className="required">*</span></label>
        <textarea name="description" required value={form.description} onChange={handleChange} />

        {/* Składniki */}
        <label className="mt-2">Składniki <span className="required">*</span></label>
        <textarea name="ingredients" required value={form.ingredients} onChange={handleChange} />

        {/* Alergeny */}
        <label className="mt-2">Alergeny <span className="required">*</span></label>
        <textarea name="allergens" required value={form.allergens} onChange={handleChange} />

        {/* Dostępność */}
        <label className="mt-2">Dostępność</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="is_available"
              value="1"
              checked={String(form.is_available) === "1"}
              onChange={handleChange}
            />
            Dostępny
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="is_available"
              value="0"
              checked={String(form.is_available) === "0"}
              onChange={handleChange}
            />
            Niedostępny
          </label>
        </div>

        {/* Zdjęcie */}
        <label className="mt-2">Zdjęcie</label>
        {/* miniaturka */}
        {previewUrl && (
            <div className="image-preview">
                <img
                src={previewUrl}
                alt="Podgląd"
                className="thumbnail"
                onError={() => setSafePreview(null)}   // ← ukrywa gdy 404/500
                />
                <button
                type="button"
                className="remove-btn"
                onClick={handleRemoveImage}
                aria-label="Usuń zdjęcie"
                >
                ×
                </button>
            </div>
        )}
        {/* ukryty native input */}
        <input
          ref={fileInputRef}
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          style={{ display: "none" }}
        />
        <Button
            variant="beige"
            className="file-btn"
            onClick={onChooseFile}
            type="button"
            >
            Wybierz plik
        </Button>

        {/* Akcje */}
        <div className="modal-actions">
          <Button variant="dark" onClick={onClose} type="button">Anuluj</Button>
          <Button variant="red" type="submit" disabled={submitting}>
            {submitting ? <Spinner size="small" /> : "Zapisz"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

AdminProductModal.propTypes = {
  open:    PropTypes.bool.isRequired,
  initial: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};
