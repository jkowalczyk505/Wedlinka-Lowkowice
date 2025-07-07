import { useState, useEffect } from "react";
import { useAuth } from "../../components/auth/AuthContext";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import { AuthFetch } from "../../components/auth/AuthFetch";
import { MapPin } from "lucide-react";

function AddressForm() {
  const [addressData, setAddressData] = useState({
    street: "",
    apartmentNumber: "",
    postalCode: "",
    city: "",
  });

  const [initialAddressData, setInitialAddressData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [postalDigits, setPostalDigits] = useState(["", "", "", "", ""]);

  const API_URL = process.env.REACT_APP_API_URL;
  const { user, setUser } = useAuth();

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const res = await AuthFetch(`${API_URL}/api/users/me`);
        const data = await res.json();

        if (res.ok) {
          const {
            street = "",
            apartmentNumber = "",
            postalCode = "",
            city = "",
          } = data;

          const address = { street, apartmentNumber, city };

          if (/^\d{2}-\d{3}$/.test(postalCode)) {
            const digits = postalCode.replace("-", "").split("");
            setPostalDigits(digits);
          }

          setAddressData(address);
          setInitialAddressData({ ...address, postalCode });
        } else {
          setError("Nie udało się pobrać danych adresowych.");
        }
      } catch (err) {
        setError("Błąd połączenia z serwerem.");
      } finally {
        setLoading(false);
      }
    };

    fetchAddress();
  }, []);

  const isChanged = () => {
    if (!initialAddressData) return false;
    return (
      addressData.street !== initialAddressData.street ||
      addressData.apartmentNumber !== initialAddressData.apartmentNumber ||
      addressData.postalCode !== initialAddressData.postalCode ||
      addressData.city !== initialAddressData.city
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "apartmentNumber") {
      // tylko cyfry lub pusty
      if (/^\d*$/.test(value)) {
        setAddressData((prev) => ({ ...prev, [name]: value }));
      }
    } else if (name === "postalCode") {
      // tylko cyfry i myślnik, max 6 znaków, automatyczny format
      let sanitized = value.replace(/[^\d]/g, "");
      if (sanitized.length > 5) sanitized = sanitized.slice(0, 5);
      if (sanitized.length > 2) {
        sanitized = `${sanitized.slice(0, 2)}-${sanitized.slice(2)}`;
      }
      setAddressData((prev) => ({ ...prev, postalCode: sanitized }));
    } else {
      setAddressData((prev) => ({ ...prev, [name]: value }));
    }

    setEditing(true);
    setError("");
    setSuccess("");
  };

  const getPostalCode = () => {
    return `${postalDigits[0]}${postalDigits[1]}-${postalDigits[2]}${postalDigits[3]}${postalDigits[4]}`;
  };

  const validatePostalCodeFormat = (code) => /^\d{2}-\d{3}$/.test(code);

  const handlePostalDigitChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length > 1) return;

    const newDigits = [...postalDigits];
    newDigits[index] = val;
    setPostalDigits(newDigits);
    setEditing(true);
    setError("");
    setSuccess("");

    // Auto-focus next
    if (val && index < 4) {
      const next = document.getElementById(`postal-${index + 1}`);
      if (next) next.focus();
    }
  };

  const handlePostalDigitKeyDown = (e, index) => {
    const key = e.key;

    if (key === "Backspace") {
      if (postalDigits[index]) {
        // Usuwa wartość
        const newDigits = [...postalDigits];
        newDigits[index] = "";
        setPostalDigits(newDigits);
      } else if (index > 0) {
        // Przesuwa focus wstecz
        const prev = document.getElementById(`postal-${index - 1}`);
        if (prev) prev.focus();
      }
    }

    if (key === "ArrowRight" && index < 4) {
      const next = document.getElementById(`postal-${index + 1}`);
      if (next) next.focus();
    }

    if (key === "ArrowLeft" && index > 0) {
      const prev = document.getElementById(`postal-${index - 1}`);
      if (prev) prev.focus();
    }
  };

  const handleCancel = () => {
    if (initialAddressData) {
      setAddressData(initialAddressData);
      setEditing(false);
      setError("");
      setSuccess("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const fullPostalCode = getPostalCode();

    if (!validatePostalCodeFormat(fullPostalCode)) {
      setError("Kod pocztowy musi być w formacie 12-345.");
      setSaving(false);
      return;
    }

    try {
      const res = await AuthFetch(`${API_URL}/api/users/me/address`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...addressData,
          postalCode: fullPostalCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Błąd podczas zapisu");
        return;
      }

      setInitialAddressData({ ...addressData, postalCode: fullPostalCode });
      setUser((prev) => ({
        ...prev,
        ...addressData,
        postalCode: fullPostalCode,
      }));
      setSuccess("Adres został zaktualizowany");
      setEditing(false);
    } catch (err) {
      setError("Błąd serwera");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return <Spinner fullscreen />;

  return (
    <div className="account-address">
      <div className="account-columns">
        <div className="personal-data">
          <h2>Dane adresowe</h2>

          <form onSubmit={handleSubmit} className="form-wrapper">
            <label>Ulica i numer</label>
            <input
              type="text"
              name="street"
              value={addressData.street}
              onChange={handleChange}
              required
            />

            <label>Nr mieszkania (opcjonalnie)</label>
            <input
              type="text"
              name="apartmentNumber"
              value={addressData.apartmentNumber}
              onChange={handleChange}
            />

            <label>Kod pocztowy</label>
            <div className="postal-code-group">
              {postalDigits.map((digit, i) => (
                <>
                  <input
                    key={i}
                    id={`postal-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    className="postal-digit"
                    value={digit}
                    onChange={(e) => handlePostalDigitChange(e, i)}
                    onKeyDown={(e) => handlePostalDigitKeyDown(e, i)}
                    required
                  />
                  {i === 1 && (
                    <span className="dash" key="dash">
                      -
                    </span>
                  )}
                </>
              ))}
            </div>

            <label>Miejscowość</label>
            <input
              type="text"
              name="city"
              value={addressData.city}
              onChange={handleChange}
              required
            />

            {error && <div className="form-error">{error}</div>}
            {success && <div className="form-success">{success}</div>}

            {editing && isChanged() && (
              <div
                className="submit-button"
                style={{ display: "flex", gap: "1rem" }}
              >
                <Button type="submit" variant="red" disabled={saving}>
                  {saving ? (
                    <>
                      <Spinner size="small" /> &nbsp;Zapisywanie...
                    </>
                  ) : (
                    "Zapisz zmiany"
                  )}
                </Button>
                <Button type="button" variant="beige" onClick={handleCancel}>
                  Anuluj
                </Button>
              </div>
            )}
          </form>
        </div>
        <div className="form-icon">
          <MapPin className="big-map-icon" />
        </div>
      </div>
    </div>
  );
}

export default AddressForm;
