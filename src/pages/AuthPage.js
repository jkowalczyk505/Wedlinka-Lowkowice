import LoginForm from "../components/forms/LoginForm";
import bgImage from "../assets/auth.jpg";

function AuthPage() {
  return (
    <div className="auth-page">
      <div className="auth-form-side">
        <LoginForm />
      </div>
      <div
        className="auth-image-side"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="overlay">
          <h2>Smak, który wraca do domu</h2>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
