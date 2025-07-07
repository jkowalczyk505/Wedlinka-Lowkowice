import { useState, useEffect } from "react";
import { useAuth } from "../../components/auth/AuthContext";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import { AuthFetch } from "../../components/auth/AuthFetch";

function AccountDetails() {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    phone: "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        surname: user.surname || "",
        phone: user.phone || "",
      });
      setLoading(false);
    }
  }, [user]);

  const handleFieldFocus = () => {
    setEditing(true);
    setSuccess("");
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const digits = value.replace(/\D/g, "");
      if (digits.length <= 9) {
        setFormData((prev) => ({ ...prev, [name]: digits }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await AuthFetch(`${API_URL}/api/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Błąd podczas zapisu");
        setSaving(false);
        return;
      }

      setSuccess("Dane zaktualizowane");
      setUser((prev) => ({ ...prev, ...formData }));
      setEditing(false);
    } catch (err) {
      setError("Błąd serwera");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner fullscreen />;

  return (
    <div className="account-details">
      <h2>Dane osobowe</h2>

      <form onSubmit={handleSubmit} className="form-wrapper">
        <label>Imię</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onFocus={handleFieldFocus}
          onChange={handleChange}
          required
        />

        <label>Nazwisko</label>
        <input
          type="text"
          name="surname"
          value={formData.surname}
          onFocus={handleFieldFocus}
          onChange={handleChange}
          required
        />

        <label>Telefon</label>
        <div className="phone-input-wrapper">
          <span className="prefix">+48</span>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onFocus={handleFieldFocus}
            onChange={handleChange}
            inputMode="numeric"
            pattern="\d{9}"
            required
          />
        </div>

        <label>E-mail</label>
        <input type="email" value={user.email} disabled required />

        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        {editing && (
          <div className="submit-button">
            <Button type="submit" variant="red" disabled={saving}>
              {saving ? (
                <>
                  <Spinner size="small" /> &nbsp;Zapisywanie...
                </>
              ) : (
                "Zapisz zmiany"
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

export default AccountDetails;
