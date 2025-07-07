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
  const [initialFormData, setInitialFormData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // email change state
  const [emailData, setEmailData] = useState({
    newEmail: "",
    password: "",
  });
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeSuccess, setEmailChangeSuccess] = useState("");
  const [emailChangeError, setEmailChangeError] = useState("");

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (user) {
      const data = {
        name: user.name || "",
        surname: user.surname || "",
        phone: user.phone || "",
      };
      setFormData(data);
      setInitialFormData(data);
      setLoading(false);
    }
  }, [user]);

  const isChanged = () => {
    if (!initialFormData) return false;
    return (
      formData.name !== initialFormData.name ||
      formData.surname !== initialFormData.surname ||
      formData.phone !== initialFormData.phone
    );
  };

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

  const handleCancel = () => {
    if (initialFormData) {
      setFormData(initialFormData);
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
      setInitialFormData(formData);
      setUser((prev) => ({ ...prev, ...formData }));
      setEditing(false);
    } catch (err) {
      setError("Błąd serwera");
    } finally {
      setSaving(false);
    }
  };

  const handleEmailFieldChange = (e) => {
    const { name, value } = e.target;
    setEmailData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailChangeSubmit = async (e) => {
    e.preventDefault();
    setEmailChangeLoading(true);
    setEmailChangeError("");
    setEmailChangeSuccess("");

    try {
      const res = await AuthFetch(`${API_URL}/api/users/me/email`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
      });

      const data = await res.json();

      if (!res.ok) {
        setEmailChangeError(data.error || "Błąd podczas zmiany e-maila");
        setEmailChangeLoading(false);
        return;
      }

      setEmailChangeSuccess("E-mail został zmieniony");
      setUser((prev) => ({ ...prev, email: emailData.newEmail }));
      setEmailData({ newEmail: "", password: "" });
    } catch (err) {
      setEmailChangeError("Błąd serwera");
    } finally {
      setEmailChangeLoading(false);
    }
  };

  if (loading) return <Spinner fullscreen />;

  return (
    <div className="account-details">
      <div className="account-columns">
        {/* Lewa kolumna – Dane osobowe */}
        <div className="personal-data">
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

        {/* Prawa kolumna – Zmiana e-maila */}
        <div className="email-change">
          <h2>Zmień adres e-mail</h2>
          <form onSubmit={handleEmailChangeSubmit} className="form-wrapper">
            <label>Aktualny e-mail</label>
            <input type="email" value={user.email} disabled />

            <label>Nowy e-mail</label>
            <input
              type="email"
              name="newEmail"
              value={emailData.newEmail}
              onChange={handleEmailFieldChange}
              required
            />

            <label>Hasło</label>
            <input
              type="password"
              name="password"
              value={emailData.password}
              onChange={handleEmailFieldChange}
              required
            />

            {emailChangeError && (
              <div className="form-error">{emailChangeError}</div>
            )}
            {emailChangeSuccess && (
              <div className="form-success">{emailChangeSuccess}</div>
            )}

            <div className="submit-button">
              <Button type="submit" variant="red" disabled={emailChangeLoading}>
                {emailChangeLoading ? (
                  <>
                    <Spinner size="small" /> &nbsp;Zapisywanie...
                  </>
                ) : (
                  "Zmień e-mail"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AccountDetails;
