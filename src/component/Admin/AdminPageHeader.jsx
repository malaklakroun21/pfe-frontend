import "./AdminPageHeader.css";
import { useNavigate } from "react-router-dom";
import { clearAuthSession } from "../../authSession.js";

function AdminPageHeader({ title }) {
  const navigate = useNavigate();

  const handleSignOut = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  return (
    <header className="admin-page-header">
      <h1 className="admin-page-header__title">{title}</h1>
      <div className="admin-page-header__actions">
        <button type="button" className="admin-page-header__signout" onClick={handleSignOut}>
          Sign out
        </button>
        <span className="admin-page-header__badge">Admin</span>
      </div>
    </header>
  );
}

export default AdminPageHeader;

