import { useState, useEffect } from "react";
import { useAuth } from "../../components/auth/AuthContext";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import { AuthFetch } from "../../components/auth/AuthFetch";
import { MapPin } from "lucide-react";
import InfoTip from "../../components/common/InfoTip";
import { useAlert } from "../../components/common/alert/AlertContext";
import PostalCodeInput from "../../components/common/PostalCodeInput";
import {
  isPostalCodeValid,
  parsePostalCodeToDigits,
  joinPostalCodeDigits,
} from "../../utils/postalCode";

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
  const [postalDigits, setPostalDigits] = useState(["", "", "", "", ""]);

  const { showAlert } = useAlert();
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

          setPostalDigits(parsePostalCodeToDigits(postalCode));

          setAddressData(address);
          setInitialAddressData({ ...address, postalCode });
        } else {
          showAlert("Nie udało się pobrać danych adresowych.", "error");
        }
      } catch (err) {
        showAlert("Błąd połączenia z serwerem.", "error");
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
      if (/^\d*$/.test(value)) {
        setAddressData((prev) => ({ ...prev, [name]: value }));
      }
    } else if (name === "postalCode") {
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
  };

  const handlePostalDigitChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length > 1) return;

    const newDigits = [...postalDigits];
    newDigits[index] = val;
    setPostalDigits(newDigits);
    setEditing(true);

    if (val && index < 4) {
      const next = document.getElementById(`postal-${index + 1}`);
      if (next) next.focus();
    }
  };

  const handlePostalDigitKeyDown = (e, index) => {
    const key = e.key;

    if (key === "Backspace") {
      if (postalDigits[index]) {
        const newDigits = [...postalDigits];
        newDigits[index] = "";
        setPostalDigits(newDigits);
      } else if (index > 0) {
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const fullPostalCode = joinPostalCodeDigits(postalDigits);

    if (!isPostalCodeValid(fullPostalCode)) {
      showAlert("Kod pocztowy musi być w formacie 12-345.", "error");
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
        showAlert(data.error || "Błąd podczas zapisu", "error");
        return;
      }

      setInitialAddressData({ ...addressData, postalCode: fullPostalCode });
      setUser((prev) => ({
        ...prev,
        ...addressData,
        postalCode: fullPostalCode,
      }));

      showAlert("Adres został zaktualizowany", "success");
      setEditing(false);
    } catch (err) {
      showAlert("Błąd serwera", "error");
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
          <InfoTip>
            Te dane adresowe zostaną automatycznie wstawione podczas składania
            zamówienia, ale możesz je wtedy zmienić.
          </InfoTip>
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
            <PostalCodeInput
              digits={postalDigits}
              onDigitChange={handlePostalDigitChange}
              onDigitKeyDown={handlePostalDigitKeyDown}
            />

            <label>Miejscowość</label>
            <input
              type="text"
              name="city"
              value={addressData.city}
              onChange={handleChange}
              required
            />

            {editing && isChanged() && (
              <div
                className="submit-button"
                style={{ display: "flex", gap: "1rem" }}
              >
                <Button type="submit" variant="beige" disabled={saving}>
                  {saving ? (
                    <>
                      <Spinner size="small" /> &nbsp;Zapisywanie...
                    </>
                  ) : (
                    "Zapisz zmiany"
                  )}
                </Button>
                <Button type="button" variant="red" onClick={handleCancel}>
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
