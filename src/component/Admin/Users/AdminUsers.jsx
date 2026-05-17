import { useEffect, useMemo, useState } from "react";
import ViewFrame from "../../Dashboard/Layout/ViewFrame/ViewFrame.jsx";
import AdminPageHeader from "../AdminPageHeader.jsx";
import { adminApi } from "../../../api/client.js";
import { useAuthSession } from "../../../authSession.js";
import "../adminUi.css";

const ROLE_OPTIONS = [
  { value: "", label: "All" },
  { value: "LEARNER", label: "LEARNER" },
  { value: "MENTOR", label: "MENTOR" },
  { value: "ADMIN", label: "ADMIN" },
  { value: "user", label: "USER" },
];
const STATUS_OPTIONS = ["", "ACTIVE", "SUSPENDED", "BANNED"];
const ALL_PERMISSIONS = [
  "manage_users",
  "manage_admins",
  "moderate_users",
  "review_reports",
  "verify_mentors",
  "manage_categories",
  "manage_settings",
  "view_dashboard",
  "view_audit_logs",
];

function statusPillClass(status) {
  const s = String(status || "").toUpperCase();
  if (s === "ACTIVE") return "admin-pill admin-pill--active";
  if (s === "SUSPENDED") return "admin-pill admin-pill--suspended";
  if (s === "BANNED") return "admin-pill admin-pill--banned";
  return "admin-pill";
}

function isAdminRole(role) {
  const r = String(role || "").toUpperCase();
  return r === "ADMIN";
}

function PermissionsPanel({ userId, onClose, onSaved }) {
  const [detail, setDetail] = useState(null);
  const [selected, setSelected] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError("");
    adminApi.getUser(userId).then((user) => {
      if (!isActive) return;
      setDetail(user);
      setSelected(user?.adminProfile?.permissions ?? ALL_PERMISSIONS);
    }).catch((err) => {
      if (!isActive) return;
      setError(err.message);
    }).finally(() => {
      if (isActive) setIsLoading(false);
    });
    return () => { isActive = false; };
  }, [userId]);

  const toggle = (perm) => {
    setSelected((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    try {
      await adminApi.updateUserPermissions(userId, selected);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-permissions-panel">
      <div className="admin-permissions-panel__header">
        <strong>Permissions admin — {userId}</strong>
        <button type="button" className="admin-button admin-button--ghost" onClick={onClose}>
          Fermer
        </button>
      </div>
      {isLoading ? (
        <p className="admin-muted">Chargement...</p>
      ) : (
        <>
          {error ? <p className="admin-muted">{error}</p> : null}
          <div className="admin-permissions-grid">
            {ALL_PERMISSIONS.map((perm) => (
              <label key={perm} className="admin-perm-label">
                <input
                  type="checkbox"
                  checked={selected.includes(perm)}
                  onChange={() => toggle(perm)}
                  disabled={isSaving}
                />
                {perm}
              </label>
            ))}
          </div>
          <div className="admin-toolbar__group" style={{ marginTop: 12 }}>
            <button
              type="button"
              className="admin-button"
              disabled={isSaving}
              onClick={handleSave}
            >
              {isSaving ? "Enregistrement..." : "Enregistrer les permissions"}
            </button>
            <button
              type="button"
              className="admin-button admin-button--ghost"
              disabled={isSaving}
              onClick={() => setSelected(ALL_PERMISSIONS)}
            >
              Tout sélectionner
            </button>
            <button
              type="button"
              className="admin-button admin-button--ghost"
              disabled={isSaving}
              onClick={() => setSelected([])}
            >
              Tout désélectionner
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function EditUserPanel({ user, onClose, onSaved }) {
  const [name, setName] = useState(
    [user.firstName, user.lastName].filter(Boolean).join(" ")
  );
  const [email, setEmail] = useState(user.email || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      await adminApi.updateUser(user.userId, { name, email });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-permissions-panel">
      <div className="admin-permissions-panel__header">
        <strong>Modifier — {user.userId}</strong>
        <button type="button" className="admin-button admin-button--ghost" onClick={onClose}>
          Fermer
        </button>
      </div>
      {error ? <p className="admin-muted">{error}</p> : null}
      <form onSubmit={handleSave}>
        <div className="admin-toolbar__group" style={{ flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
          <div className="admin-field">
            <label>Nom complet</label>
            <input
              className="admin-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Prénom Nom"
              disabled={isSaving}
            />
          </div>
          <div className="admin-field">
            <label>Email</label>
            <input
              className="admin-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              disabled={isSaving}
            />
          </div>
          <button type="submit" className="admin-button" disabled={isSaving}>
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}

function AdminUsers() {
  const { user: currentUser } = useAuthSession();
  const currentUserId = currentUser?.userId || "";
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [role, setRole] = useState("");
  const [accountStatus, setAccountStatus] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [busyUserId, setBusyUserId] = useState("");
  const [permsPanelUserId, setPermsPanelUserId] = useState(null);
  const [editPanelUser, setEditPanelUser] = useState(null);

  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const items = data?.items ?? [];

  const fetchUsers = async (overridePage) => {
    const p = overridePage ?? page;
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await adminApi.listUsers({
        page: p,
        limit: 20,
        q: query.trim() || undefined,
        role: role || undefined,
        accountStatus: accountStatus || undefined,
      });
      setData(response);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    async function loadUsers() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = await adminApi.listUsers({
          page,
          limit: 20,
          q: query.trim() || undefined,
          role: role || undefined,
          accountStatus: accountStatus || undefined,
        });
        if (!isActive) return;
        setData(response);
      } catch (error) {
        if (!isActive) return;
        setErrorMessage(error.message);
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadUsers();
    return () => { isActive = false; };
  }, [page, query, role, accountStatus]);

  const title = useMemo(() => {
    const total = pagination?.total ?? 0;
    return `Users (${total})`;
  }, [pagination?.total]);

  const handleApplySearch = (event) => {
    event.preventDefault();
    setPage(1);
    setQuery(searchInput);
  };

  const handleQuickRoleChange = async (userId, nextRole) => {
    setBusyUserId(userId);
    setErrorMessage("");
    try {
      await adminApi.updateUserRole(userId, nextRole);
      await fetchUsers();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyUserId("");
    }
  };

  const handleQuickStatusChange = async (userId, nextStatus) => {
    setBusyUserId(userId);
    setErrorMessage("");
    try {
      await adminApi.updateUserStatus(userId, { accountStatus: nextStatus, reason: "" });
      await fetchUsers();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyUserId("");
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm("Supprimer cet utilisateur ? Cette action est irréversible.");
    if (!confirmed) return;
    setBusyUserId(userId);
    setErrorMessage("");
    try {
      await adminApi.deleteUser(userId);
      setPage(1);
      await fetchUsers(1);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyUserId("");
    }
  };

  return (
    <ViewFrame header={<AdminPageHeader title={title} />}>
      <section className="admin-surface">
        <form className="admin-toolbar" onSubmit={handleApplySearch}>
          <div className="admin-toolbar__group">
            <div className="admin-field">
              <label htmlFor="admin-users-q">Recherche</label>
              <input
                id="admin-users-q"
                name="q"
                className="admin-input"
                placeholder="nom, email, userId..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="admin-users-role">Rôle</label>
              <select
                id="admin-users-role"
                className="admin-select"
                value={role}
                onChange={(e) => { setPage(1); setRole(e.target.value); }}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-field">
              <label htmlFor="admin-users-status">Statut</label>
              <select
                id="admin-users-status"
                className="admin-select"
                value={accountStatus}
                onChange={(e) => { setPage(1); setAccountStatus(e.target.value); }}
              >
                {STATUS_OPTIONS.map((value) => (
                  <option key={value || "all"} value={value}>
                    {value ? value : "All"}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="admin-button" disabled={isLoading}>
              Appliquer
            </button>
          </div>

          <div className="admin-toolbar__group">
            <button
              type="button"
              className="admin-button admin-button--ghost"
              onClick={() => {
                setQuery("");
                setSearchInput("");
                setRole("");
                setAccountStatus("");
                setPage(1);
              }}
              disabled={isLoading}
            >
              Réinitialiser
            </button>
          </div>
        </form>

        {errorMessage ? <p className="admin-muted">{errorMessage}</p> : null}
        {isLoading ? <p className="admin-muted">Chargement des utilisateurs...</p> : null}

        {permsPanelUserId && (
          <PermissionsPanel
            userId={permsPanelUserId}
            onClose={() => setPermsPanelUserId(null)}
            onSaved={() => { setPermsPanelUserId(null); fetchUsers(); }}
          />
        )}

        {editPanelUser && (
          <EditUserPanel
            user={editPanelUser}
            onClose={() => setEditPanelUser(null)}
            onSaved={() => { setEditPanelUser(null); fetchUsers(); }}
          />
        )}

        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th style={{ width: 440 }}>Actions rapides</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-muted">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                items.map((user) => {
                  const userId = user.userId || user._id || "";
                  const isBusy = busyUserId === userId;
                  const isSelf = userId === currentUserId;

                  return (
                    <tr key={userId}>
                      <td>
                        <strong>
                          {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
                        </strong>
                        <div className="admin-muted">{user.userId}</div>
                      </td>
                      <td>{user.email || "—"}</td>
                      <td>{user.role || "—"}</td>
                      <td>
                        <span className={statusPillClass(user.accountStatus)}>
                          {user.accountStatus || "—"}
                        </span>
                      </td>
                      <td>
                        {isAdminRole(user.role) ? (
                          <span className="admin-muted">—</span>
                        ) : (
                          <div className="admin-toolbar__group">
                            <select
                              className="admin-select"
                              defaultValue=""
                              disabled={isBusy}
                              onChange={(e) => {
                                const nextRole = e.target.value;
                                e.target.value = "";
                                if (!nextRole) return;
                                handleQuickRoleChange(userId, nextRole);
                              }}
                            >
                              <option value="">Changer rôle…</option>
                              {ROLE_OPTIONS.filter((o) => o.value).map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                              ))}
                            </select>

                            <select
                              className="admin-select"
                              defaultValue=""
                              disabled={isBusy}
                              onChange={(e) => {
                                const nextStatus = e.target.value;
                                e.target.value = "";
                                if (!nextStatus) return;
                                handleQuickStatusChange(userId, nextStatus);
                              }}
                            >
                              <option value="">Changer statut…</option>
                              {STATUS_OPTIONS.filter(Boolean).map((value) => (
                                <option key={value} value={value}>{value}</option>
                              ))}
                            </select>

                            <button
                              type="button"
                              className="admin-button admin-button--ghost"
                              disabled={isBusy}
                              onClick={() => setEditPanelUser(user)}
                            >
                              Modifier
                            </button>

                            {isAdminRole(user.role) && (
                              <button
                                type="button"
                                className="admin-button admin-button--ghost"
                                disabled={isBusy}
                                onClick={() => setPermsPanelUserId(userId)}
                              >
                                Permissions
                              </button>
                            )}

                            <button
                              type="button"
                              className="admin-button admin-button--danger"
                              disabled={isBusy}
                              onClick={() => handleDeleteUser(userId)}
                            >
                              Supprimer
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <div className="admin-pagination">
            <span className="admin-muted">
              Page {pagination?.page ?? page} of {totalPages}
            </span>
            <button
              type="button"
              className="admin-button admin-button--ghost"
              disabled={isLoading || page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Précédent
            </button>
            <button
              type="button"
              className="admin-button admin-button--ghost"
              disabled={isLoading || page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Suivant
            </button>
          </div>
        </div>
      </section>
    </ViewFrame>
  );
}

export default AdminUsers;
