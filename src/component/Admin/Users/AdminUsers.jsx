import { useEffect, useMemo, useState } from "react";
import ViewFrame from "../../Dashboard/Layout/ViewFrame/ViewFrame.jsx";
import AdminPageHeader from "../AdminPageHeader.jsx";
import { adminApi } from "../../../api/client.js";
import ThemedSelect from "../../shared/ThemedSelect/ThemedSelect.jsx";
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
  const normalizedStatus = String(status || "").toUpperCase();

  if (normalizedStatus === "ACTIVE") {
    return "admin-pill admin-pill--active";
  }

  if (normalizedStatus === "SUSPENDED") {
    return "admin-pill admin-pill--suspended";
  }

  if (normalizedStatus === "BANNED") {
    return "admin-pill admin-pill--banned";
  }

  return "admin-pill";
}

function isAdminRole(role) {
  return String(role || "").toUpperCase() === "ADMIN";
}

function PermissionsPanel({ userId, onClose, onSaved }) {
  const [selected, setSelected] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    adminApi
      .getUser(userId)
      .then((user) => {
        if (!isActive) {
          return;
        }

        setSelected(user?.adminProfile?.permissions ?? ALL_PERMISSIONS);
      })
      .catch((nextError) => {
        if (!isActive) {
          return;
        }

        setError(nextError.message);
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [userId]);

  const toggle = (permission) => {
    setSelected((currentPermissions) =>
      currentPermissions.includes(permission)
        ? currentPermissions.filter((currentPermission) => currentPermission !== permission)
        : [...currentPermissions, permission],
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    try {
      await adminApi.updateUserPermissions(userId, selected);
      onSaved();
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-permissions-panel">
      <div className="admin-permissions-panel__header">
        <strong>Permissions admin - {userId}</strong>
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
            {ALL_PERMISSIONS.map((permission) => (
              <label key={permission} className="admin-perm-label">
                <input
                  type="checkbox"
                  checked={selected.includes(permission)}
                  onChange={() => toggle(permission)}
                  disabled={isSaving}
                />
                {permission}
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
              Tout selectionner
            </button>
            <button
              type="button"
              className="admin-button admin-button--ghost"
              disabled={isSaving}
              onClick={() => setSelected([])}
            >
              Tout deselectionner
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function EditUserPanel({ user, onClose, onSaved }) {
  const [name, setName] = useState([user.firstName, user.lastName].filter(Boolean).join(" "));
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
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-permissions-panel">
      <div className="admin-permissions-panel__header">
        <strong>Modifier - {user.userId}</strong>
        <button type="button" className="admin-button admin-button--ghost" onClick={onClose}>
          Fermer
        </button>
      </div>

      {error ? <p className="admin-muted">{error}</p> : null}

      <form onSubmit={handleSave}>
        <div
          className="admin-toolbar__group"
          style={{ flexDirection: "column", alignItems: "flex-start", gap: 10 }}
        >
          <div className="admin-field">
            <label>Nom complet</label>
            <input
              className="admin-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Prenom Nom"
              disabled={isSaving}
            />
          </div>

          <div className="admin-field">
            <label>Email</label>
            <input
              className="admin-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
    const nextPage = overridePage ?? page;
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await adminApi.listUsers({
        page: nextPage,
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

        if (!isActive) {
          return;
        }

        setData(response);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage(error.message);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      isActive = false;
    };
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
    const confirmed = window.confirm("Supprimer cet utilisateur ? Cette action est irreversible.");

    if (!confirmed) {
      return;
    }

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
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="admin-users-role">Role</label>
              <ThemedSelect
                id="admin-users-role"
                className="admin-select"
                value={role}
                options={ROLE_OPTIONS}
                onChange={(nextValue) => {
                  setPage(1);
                  setRole(nextValue);
                }}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="admin-users-status">Statut</label>
              <ThemedSelect
                id="admin-users-status"
                className="admin-select"
                value={accountStatus}
                options={STATUS_OPTIONS.map((value) => ({
                  value,
                  label: value || "All",
                }))}
                onChange={(nextValue) => {
                  setPage(1);
                  setAccountStatus(nextValue);
                }}
              />
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
              Reinitialiser
            </button>
          </div>
        </form>

        {errorMessage ? <p className="admin-muted">{errorMessage}</p> : null}
        {isLoading ? <p className="admin-muted">Chargement des utilisateurs...</p> : null}

        {permsPanelUserId ? (
          <PermissionsPanel
            key={`permissions-${permsPanelUserId}`}
            userId={permsPanelUserId}
            onClose={() => setPermsPanelUserId(null)}
            onSaved={() => {
              setPermsPanelUserId(null);
              fetchUsers();
            }}
          />
        ) : null}

        {editPanelUser ? (
          <EditUserPanel
            key={`edit-${editPanelUser.userId}`}
            user={editPanelUser}
            onClose={() => setEditPanelUser(null)}
            onSaved={() => {
              setEditPanelUser(null);
              fetchUsers();
            }}
          />
        ) : null}

        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Role</th>
                <th>Statut</th>
                <th style={{ width: 440 }}>Actions rapides</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-muted">
                    Aucun utilisateur trouve.
                  </td>
                </tr>
              ) : (
                items.map((user) => {
                  const userId = user.userId || user._id || "";
                  const isBusy = busyUserId === userId;

                  return (
                    <tr key={userId}>
                      <td>
                        <strong>
                          {[user.firstName, user.lastName].filter(Boolean).join(" ") || "-"}
                        </strong>
                        <div className="admin-muted">{user.userId}</div>
                      </td>
                      <td>{user.email || "-"}</td>
                      <td>{user.role || "-"}</td>
                      <td>
                        <span className={statusPillClass(user.accountStatus)}>
                          {user.accountStatus || "-"}
                        </span>
                      </td>
                      <td>
                        {isAdminRole(user.role) ? (
                          <span className="admin-muted">-</span>
                        ) : (
                          <div className="admin-toolbar__group">
                            <ThemedSelect
                              className="admin-select"
                              placeholder="Changer role..."
                              defaultValue=""
                              resetAfterSelect
                              options={ROLE_OPTIONS.filter((option) => option.value)}
                              disabled={isBusy}
                              onChange={(nextValue) => {
                                if (!nextValue) {
                                  return;
                                }

                                handleQuickRoleChange(userId, nextValue);
                              }}
                            />

                            <ThemedSelect
                              className="admin-select"
                              placeholder="Changer statut..."
                              defaultValue=""
                              resetAfterSelect
                              options={STATUS_OPTIONS.filter(Boolean).map((value) => ({
                                value,
                                label: value,
                              }))}
                              disabled={isBusy}
                              onChange={(nextValue) => {
                                if (!nextValue) {
                                  return;
                                }

                                handleQuickStatusChange(userId, nextValue);
                              }}
                            />

                            <button
                              type="button"
                              className="admin-button admin-button--ghost"
                              disabled={isBusy}
                              onClick={() => setEditPanelUser(user)}
                            >
                              Modifier
                            </button>

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
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            >
              Precedent
            </button>
            <button
              type="button"
              className="admin-button admin-button--ghost"
              disabled={isLoading || page >= totalPages}
              onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
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
