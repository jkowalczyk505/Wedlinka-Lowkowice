import { useEffect, useState } from "react";

const STATUS_OPTIONS = {
  active: [
    { key: "waiting_payment", label: "Oczekuje na płatność" },
    { key: "paid", label: "Opłacone" },
    { key: "packed", label: "Gotowe do wysyłki" },
    { key: "shipped", label: "Wysłane" },
    { key: "ready_for_pickup", label: "Gotowe do odbioru" },
  ],
  failed: [
    { key: "cancelled", label: "Anulowane" },
    { key: "failed", label: "Nieudane płatności" },
  ],
  archived: [{ key: "delivered", label: "Dostarczone" }],
};

export default function OrdersControls({
  type,
  sortOrder,
  onSortChange,
  selectedStatuses,
  onStatusChange,
}) {
  const [localStatuses, setLocalStatuses] = useState(selectedStatuses);

  useEffect(() => {
    setLocalStatuses(selectedStatuses);
  }, [selectedStatuses]);

  const toggleStatus = (status) => {
    const newStatuses = localStatuses.includes(status)
      ? localStatuses.filter((s) => s !== status)
      : [...localStatuses, status];
    setLocalStatuses(newStatuses);
    onStatusChange(newStatuses);
  };

  return (
    <div className="orders-controls">
      <div className="sort-control">
        <label>Sortuj:</label>
        <select
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="default">Domyślnie</option>
          <option value="desc">Od najnowszych</option>
          <option value="asc">Od najstarszych</option>
        </select>
      </div>

      {type === "active" && (
        <div className="filter-control">
          <label>Filtruj statusy zamówień:</label>
          <div className="status-filters">
            {STATUS_OPTIONS[type].map(({ key, label }) => (
              <label key={key} className="status-checkbox">
                <input
                  type="checkbox"
                  checked={localStatuses.includes(key)}
                  onChange={() => toggleStatus(key)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
