import { useState } from "react";
import { useAuth } from "../../components/auth/AuthContext";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import { AuthFetch } from "../../components/auth/AuthFetch";
import { Lock, Eye, EyeOff } from "lucide-react";
import InfoTip from "../../components/common/InfoTip";
import { useAlert } from "../../components/common/alert/AlertContext";

function ChangePassword() {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [saving, setSaving] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const calculateStrength = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regex.test(password)) return "słabe";
    if (/[^A-Za-z0-9]/.test(password)) return "mocne";
    return "średnie";
  };

  const isFormValid = () => {
    const { newPassword, confirmPassword } = formData;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(newPassword) && newPassword === confirmPassword;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "newPassword") {
      setPasswordStrength(calculateStrength(value));
    }

    if (name === "confirmPassword") {
      const newPassword = formData.newPassword;
      if (newPassword) {
        setPasswordStrength(calculateStrength(newPassword));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const { oldPassword, newPassword } = formData;

    if (!isFormValid()) {
      showAlert(
        "Nowe hasło musi mieć min. 8 znaków, dużą literę, cyfrę i być powtórzone poprawnie.",
        "error"
      );
      setSaving(false);
      return;
    }

    try {
      const res = await AuthFetch(`${API_URL}/api/users/me/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        showAlert(data.error || "Błąd podczas zmiany hasła.", "error");
        return;
      }

      showAlert("Hasło zostało zmienione!", "success");
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordStrength("");
    } catch (err) {
      showAlert("Błąd serwera.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <Spinner fullscreen />;

  return (
    <div className="account-password">
      <div className="account-columns">
        <div className="personal-data">
          <h2>Zmiana hasła</h2>
          <InfoTip>
            Hasło musi mieć minimum 8 znaków, w tym jedną wielką literę i jedną
            cyfrę.
          </InfoTip>
          <form onSubmit={handleSubmit} className="form-wrapper">
            <label>Stare hasło</label>
            <input
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              required
            />

            <label>Nowe hasło</label>
            <div className="password-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="eye-button"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <label>Powtórz nowe hasło</label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="eye-button"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {formData.newPassword && (
              <div className={`password-strength ${passwordStrength}`}>
                Siła hasła: <strong>{passwordStrength}</strong>
                <div className="strength-bar">
                  <div className={`bar-fill ${passwordStrength}`}></div>
                </div>
              </div>
            )}

            <div className="submit-button">
              <Button type="submit" variant="red" disabled={saving}>
                {saving ? (
                  <>
                    <Spinner size="small" /> &nbsp;Zapisywanie...
                  </>
                ) : (
                  "Zmień hasło"
                )}
              </Button>
            </div>
          </form>
        </div>
        <div className="form-icon">
          <Lock className="big-lock-icon" />
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
