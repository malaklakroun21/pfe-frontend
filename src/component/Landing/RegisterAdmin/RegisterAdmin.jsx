import { Link } from "react-router-dom";
import "../Sign/Sign.css";

function RegisterAdmin({ isSubmitting = false, errorMessage = "" }) {
  return (
    <section className="Sign">
      <div className="Sign-container">
        <div className="Sign-copy">
          <h1>Créer un compte Admin</h1>
          <p>Accès réservé aux administrateurs autorisés</p>
        </div>

        <form className="Sign-form">
          <div className="Sign-field">
            <label htmlFor="full-name">Nom complet</label>
            <input
              id="full-name"
              name="full-name"
              type="text"
              placeholder="Votre nom"
              required
            />
          </div>

          <div className="Sign-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div className="Sign-field">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Mot de passe"
              required
            />
          </div>

          <div className="Sign-field">
            <label htmlFor="confirm-password">Confirmer le mot de passe</label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              placeholder="Confirmer le mot de passe"
              required
            />
          </div>

          <div className="Sign-field">
            <label htmlFor="bootstrap-secret">Clé secrète d&apos;administration</label>
            <input
              id="bootstrap-secret"
              name="bootstrap-secret"
              type="password"
              placeholder="Clé secrète"
              required
            />
          </div>

          {errorMessage ? <p className="Sign-error">{errorMessage}</p> : null}

          <button type="submit" className="Sign-submit" disabled={isSubmitting}>
            {isSubmitting ? "Création..." : "Créer le compte admin"}
          </button>

          <p className="Sign-login">
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default RegisterAdmin;
