import { useEffect, useState } from "react";
import { AuthFetch } from "../../components/auth/AuthFetch";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import LoadError from "../../components/common/LoadError";
import { useAlert } from "../../components/common/alert/AlertContext";

const API_URL = process.env.REACT_APP_API_URL;

export default function AdminShipping() {
  const { showAlert } = useAlert();
  const [methods, setMethods] = useState([]);
  const [threshold, setThreshold] = useState("0");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchShipping = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await AuthFetch(`${API_URL}/api/shipping`);
      if (!res.ok) throw new Error("Błąd autoryzacji");
      const data = await res.json();

      const withStrings = (data.methods || []).map((m) => ({
        ...m,
        price: m.price?.toString() ?? "0",
        codFee: m.codFee?.toString() ?? "0",
        cod: Boolean(m.cod),
      }));

      setMethods(withStrings);
      setThreshold((data.freeShippingThreshold ?? 0).toString());
    } catch (err) {
      console.error("Błąd ładowania konfiguracji wysyłek:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipping();
  }, []);

  const updateMethod = (index, field, value) => {
    setMethods((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const handleDecimalChange = (raw, callback) => {
    let value = raw.replace(",", "."); // zamień przecinek na kropkę

    if (/^\d*\.?\d{0,2}$/.test(value)) {
      callback(value);
    }
  };

  const handleSave = async () => {
    try {
      const sanitized = methods.map((m) => ({
        ...m,
        price: Math.max(0, parseFloat(m.price) || 0),
        codFee: Math.max(0, parseFloat(m.codFee) || 0),
        cod: m.id === "courier" ? m.cod : false, // zabezpieczone
      }));

      const thresholdVal = Math.max(0, parseFloat(threshold) || 0);

      const res = await AuthFetch(`${API_URL}/api/shipping`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          methods: sanitized,
          freeShippingThreshold: thresholdVal,
        }),
      });

      if (!res.ok) throw new Error("Błąd zapisu");
      showAlert("Zapisano zmiany", "success");
    } catch (err) {
      console.error("Błąd zapisu konfiguracji:", err);
      showAlert("Błąd podczas zapisu konfiguracji", "error");
    }
  };

  if (loading) return <Spinner fullscreen={false} />;
  if (error) return <LoadError onRetry={fetchShipping} />;

  return (
    <div className="admin-shipping">
      <h1 className="admin-page-title">Zarządzanie kosztami wysyłek</h1>

      <div>
        <table className="table admin-table">
          <thead>
            <tr>
              <th>Nazwa</th>
              <th>Cena</th>
              <th>Pobranie</th>
              <th>Opłata za pobranie</th>
            </tr>
          </thead>
          <tbody>
            {methods.map((m, idx) => (
              <tr key={m.id}>
                <td>
                  <input type="text" value={m.label} disabled readOnly />
                </td>
                <td>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={m.price}
                    onChange={(e) =>
                      handleDecimalChange(e.target.value, (val) =>
                        updateMethod(idx, "price", val)
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={m.cod}
                    onChange={(e) => updateMethod(idx, "cod", e.target.checked)}
                    disabled={m.id !== "courier"}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={m.codFee}
                    onChange={(e) =>
                      handleDecimalChange(e.target.value, (val) =>
                        updateMethod(idx, "codFee", val)
                      )
                    }
                    disabled={!m.cod}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <label>
          Darmowa wysyłka od:
          <input
            type="text"
            inputMode="decimal"
            value={threshold}
            onChange={(e) => handleDecimalChange(e.target.value, setThreshold)}
          />
        </label>

        <div className="submit-button">
          <Button onClick={handleSave}>Zapisz zmiany</Button>
        </div>
      </div>
    </div>
  );
}
