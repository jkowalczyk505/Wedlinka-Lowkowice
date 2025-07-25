// OrdersSearch.js
export default function OrdersSearch({ value, onChange }) {
  return (
    <div className="order-search-bar">
      <label>Wyszukiwarka</label>
      <input
        type="text"
        placeholder="Szukaj po numerze zamówienia..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="order-search-input"
      />
    </div>
  );
}
