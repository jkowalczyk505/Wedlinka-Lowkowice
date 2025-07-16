import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Modal from "../../common/Modal";          // ✱ prosty wrapper z portalem
import Button from "../../common/Button";
import Spinner from "../../common/Spinner";
import axios   from "axios";

export default function AdminProductModal({ open, initial, onClose, onSaved }) {
  // ---- lokalny stan formularza ----
  const empty = {      // wszystkie pola z tabeli (bez id, created_at …)
    name:"", category:"kielbasy", slug:"",
    description:"", ingredients:"", allergens:"",
    unit:"kg", quantity:"", price_brut:"", vat_rate:"0.05",
    is_available:1, image:null
  };
  const [form,setForm] = useState(empty);
  const [submitting,setSubmitting] = useState(false);

  useEffect(()=>{
    setForm(initial ? {...empty, ...initial} : empty);
  }, [initial, open]);

  // ---- obsługa zmiany pól ----
  const handleChange = e=>{
    const {name,value,type,checked,files} = e.target;
    setForm(f=>({
      ...f,
      [name]:
        type==="checkbox" ? (checked?1:0) :
        type==="file"     ? files[0]      :
        value
    }));
  };

  // ---- wysyłka ----
  const handleSubmit = async e=>{
    e.preventDefault();
    setSubmitting(true);
    const api = `${process.env.REACT_APP_API_URL}/api/products`;
    const fd  = new FormData();
    Object.entries(form).forEach(([k,v])=>fd.append(k,v));

    try{
      if(initial){
        // PUT /:id
        await axios.put(`${api}/${initial.id}`, fd);
      }else{
        // POST
        await axios.post(api, fd);
      }
      onSaved();        // odśwież listę
      onClose();
    }catch(err){
      console.error("Błąd zapisu produktu:",err);
      alert("Nie udało się zapisać produktu");
    }finally{
      setSubmitting(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <Modal open={open} onClose={onClose} title={initial?"Edytuj produkt":"Nowy produkt"}>
      <form className="admin-product-form" onSubmit={handleSubmit}>
        <label>Nazwa*</label>
        <input name="name" value={form.name} onChange={handleChange} required/>

        <label>Kategoria*</label>
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="kielbasy">Kiełbasy</option>
          <option value="wędliny">Wędliny</option>
          <option value="wyroby podrobowe">Wyroby podrobowe</option>
          <option value="paczki">Nasze paczki</option>
        </select>

        <label>Slug*</label>
        <input name="slug" value={form.slug} onChange={handleChange} required/>

        <label>Ilość + jednostka*</label>
        <div className="two">
          <input name="quantity" value={form.quantity}
                 onChange={handleChange} required/>
          <select name="unit" value={form.unit} onChange={handleChange}>
            <option value="kg">kg</option>
            <option value="szt">szt</option>
          </select>
        </div>

        <label>Cena brutto (zł)*</label>
        <input name="price_brut" value={form.price_brut}
               onChange={handleChange} required/>

        <label>Opis</label>
        <textarea name="description"
                  value={form.description} onChange={handleChange}/>

        {/* …Ingredients, Allergens… */}

        <label>
          <input type="checkbox"
                 name="is_available"
                 checked={!!form.is_available}
                 onChange={handleChange}/>
          &nbsp;Dostępny
        </label>

        <label>Zdjęcie {initial && "(pozostaw puste bez zmian)"}</label>
        <input type="file" name="image" accept="image/*" onChange={handleChange}/>

        <div className="modal-actions">
          <Button variant="beige" onClick={onClose} type="button">Anuluj</Button>
          <Button variant="red"   type="submit" disabled={submitting}>
            {submitting ? <Spinner size="small"/> : "Zapisz"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

AdminProductModal.propTypes = {
  open:     PropTypes.bool.isRequired,
  initial:  PropTypes.object,      // null = nowy
  onClose:  PropTypes.func.isRequired,
  onSaved:  PropTypes.func.isRequired,
};
