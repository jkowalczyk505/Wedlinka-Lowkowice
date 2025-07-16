// src/components/admin/products/AdminProductModal.jsx
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Modal from "../../common/Modal";
import Button from "../../common/Button";
import Spinner from "../../common/Spinner";
import axios from "axios";
import Select from "react-select";
import { useAlert } from "../../common/alert/AlertContext";  // <-- importujemy context
import { generateProductSlug } from "../../../utils/product";


// skopiuj customStyles z SortDropdown
// poprawione customStyles
const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    display: "flex",           // <-- dodajemy
    alignContent: "center",      // <-- i wyrównanie pionowe
    background: "transparent",
    cursor: "pointer",
    borderColor: state.isFocused ? "#98181b" : "#ccc",
    boxShadow: state.isFocused
      ? `0 0 0 1px #ffffff`
      : `0 0 0 1px #ffffff`,
    "&:hover": { borderColor: "#98181b" },
    // tutaj ustalamy wysokość i marginesy
    minHeight: "2rem",
    height: "2rem",
    marginTop: "0.5rem",
    marginBottom: "1.5rem",
    color: "#1a1613",
  }),

  valueContainer: (provided) => ({
   ...provided,
   padding:   "0 8px",     // 8 px z lewej/prawej, bez góry-dołu
   height:    "2rem",
   lineHeight:"2rem",    // wyrównanie tekstu w pionie
   display:   "flex",
   alignItems:"center",
 }),

 input: (provided) => ({
   ...provided,
   margin: 0,
   padding: 0,
   lineHeight: "2rem",
   color:     "#1a1613",
   width: 1,          // tyle wystarcza, by złapać focus
    opacity: 0,        // i nie zasłaniać SingleValue
 }),

  placeholder: (provided) => ({
    ...provided,
    color: "#ccc",          // placeholder w ciemniejszym kolorze
  }),
  singleValue: (p) => ({
    ...p,
    position: "relative",
    zIndex: 1,         // na wszelki wypadek wyżej
    color: "#1a1613",
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
   color: state.isFocused ? "#98181b" : "#98181b",   // ► zawsze widoczna
    "&:hover": { color: "#98181b" },
  }),
  indicatorSeparator: () => ({ display: "none" }),
  menu: (provided) => ({
    ...provided,
    background: "#ffffff",
    borderRadius: 4,
    overflow: "hidden",
    zIndex: 4,
  }),
    menuList: (provided) => ({
    ...provided,
    paddingTop: 0,
    paddingBottom: 0,
        margin: 0,
    }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#f5f1e0" : "transparent",
    color: state.isFocused ? "#98181b" : "#333",
    cursor: "pointer",
    "&:active": { backgroundColor: "#98181b33" },
  }),
};

export default function AdminProductModal({ open, initial, onClose, onSaved }) {
  const { showAlert } = useAlert();                            // <-- hook

  const categories = [
    { value: "kielbasy", label: "Kiełbasy" },
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
    category: "kielbasy",
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

  const [form, setForm]       = useState(empty);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(initial ? { ...empty, ...initial } : empty);
  }, [initial, open]);

    useEffect(() => {
        setForm(f => ({
            ...f,
            slug: generateProductSlug(f)
        }));
    }, [form.name, form.quantity, form.unit]);


  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setForm(f => ({
      ...f,
      [name]:
        type === "checkbox" ? (checked ? 1 : 0) :
        type === "file"     ? files[0] :
        value
    }));
  };

  const handleNumber = (e) => {
    const { name, value } = e.target;
    if (/^\d*([.,]\d{0,2})?$/.test(value)) {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const api = `${process.env.REACT_APP_API_URL}/api/products`;
    const fd  = new FormData();

    // only allowed fields + comma→dot for numerics
    Object.entries(form).forEach(([k, v]) => {
      if (v == null || v === "") return;
      const val = ["quantity", "price_brut", "vat_rate"].includes(k)
        ? String(v).replace(",", ".")
        : v;
      fd.append(k, val);
    });
    if (form.image instanceof File) fd.append("image", form.image);

    try {
      if (initial) {
        await axios.put(`${api}/${initial.id}`, fd);
        showAlert("Produkt zaktualizowany pomyślnie", "info");
      } else {
        await axios.post(api, fd);
        showAlert("Nowy produkt dodany pomyślnie", "info");
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error(err.response?.data || err);
      showAlert(
        err.response?.data?.error || "Nie udało się zapisać produktu",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edytuj produkt" : "Nowy produkt"}>
      <form className="admin-product-form" onSubmit={handleSubmit}>
        <label>Nazwa <span className="required">*</span></label>
        <input name="name" value={form.name} onChange={handleChange} required/>

        <label>Kategoria <span className="required">*</span></label>
        <Select
          styles={selectStyles}
          options={categories}
          value={categories.find((o) => o.value === form.category)}
          onChange={(opt) => setForm((f) => ({ ...f, category: opt.value }))}
          isSearchable={false}
          placeholder={"Wybierz kategorię"}
          components={{ Input: () => null }}
        />

        <label>Slug <span className="required">*</span></label>
        <input name="slug" value={form.slug} onChange={handleChange} required/>

        <label>Ilość + jednostka <span className="required">*</span></label>
        <div className="two">
          <input
            name="quantity"
            type="text"
            value={form.quantity}
            onChange={handleNumber}
            pattern="^\d+([.,]\d{0,2})?$"
            required
          />
          <select name="unit" value={form.unit} onChange={handleChange}>
            <option value="kg">kg</option>
            <option value="szt">szt</option>
          </select>
        </div>

        <label>Cena brutto (zł) <span className="required">*</span></label>
        <input
          name="price_brut"
          type="text"
          value={form.price_brut}
          onChange={handleNumber}
          pattern="^\d+([.,]\d{0,2})?$"
          required
        />

        <label>Stawka VAT <span className="required">*</span></label>
        <Select
          styles={selectStyles}
          options={vatOptions}
          value={vatOptions.find((o) => o.value === form.vat_rate)}
          onChange={(opt) => setForm((f) => ({ ...f, vat_rate: opt.value }))}
          isSearchable={false}
        />

        <label>Opis <span className="required">*</span></label>
        <textarea
          name="description"
          required
          value={form.description}
          onChange={handleChange}
        />

        <label>Składniki</label>
        <textarea
          name="ingredients"
          value={form.ingredients}
          onChange={handleChange}
        />

        <label>Alergeny</label>
        <textarea
          name="allergens"
          value={form.allergens}
          onChange={handleChange}
        />

        <label>
          <input
            type="checkbox"
            name="is_available"
            checked={!!form.is_available}
            onChange={handleChange}
          />
          &nbsp;Dostępny
        </label>

        <label>Zdjęcie {initial && "(pozostaw puste bez zmian)"}</label>
        <input type="file" name="image" accept="image/*" onChange={handleChange}/>

        <div className="modal-actions">
          <Button variant="dark" onClick={onClose} type="button">Anuluj</Button>
          <Button variant="red" type="submit" disabled={submitting}>
            {submitting ? <Spinner size="small"/> : "Zapisz"}
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
