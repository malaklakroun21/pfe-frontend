import { useEffect, useMemo, useState } from "react";
import ViewFrame from "../../Dashboard/Layout/ViewFrame/ViewFrame.jsx";
import AdminPageHeader from "../AdminPageHeader.jsx";
import { adminApi } from "../../../api/client.js";
import "../adminUi.css";

const ROLE_OPTIONS = [
  { value: "", label: "All" },
  { value: "LEARNER", label: "LEARNER" },
  { value: "MENTOR", label: "MENTOR" },
  { value: "ADMIN", label: "ADMIN" },
  { value: "user", label: "USER" },
];
const STATUS_OPTIONS = ["", "ACTIVE", "SUSPENDED", "BANNED"];

function statusPillClass(status) {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "ACTIVE") return "admin-pill admin-pill--active";
  if (normalized === "SUSPENDED") return "admin-pill admin-pill--suspended";
  if (normalized === "BANNED") return "admin-pill admin-pill--banned";
  return "admin-pill";
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

  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const items = data?.items ?? [];

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
      const response = await adminApi.listUsers({
        page,
        limit: 20,
        q: query.trim() || undefined,
        role: role || undefined,
        accountStatus: accountStatus || undefined,
      });
      setData(response);
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
      const response = await adminApi.listUsers({
        page,
        limit: 20,
        q: query.trim() || undefined,
        role: role || undefined,
        accountStatus: accountStatus || undefined,
      });
      setData(response);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyUserId("");
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm("Delete this user? This cannot be undone.");
    if (!confirmed) return;

    setBusyUserId(userId);
    setErrorMessage("");
    try {
      await adminApi.deleteUser(userId);
      const response = await adminApi.listUsers({
        page: 1,
        limit: 20,
        q: query.trim() || undefined,
        role: role || undefined,
        accountStatus: accountStatus || undefined,
      });
      setPage(1);
      setData(response);
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
              <label htmlFor="admin-users-q">Search</label>
              <input
                id="admin-users-q"
                name="q"
                className="admin-input"
                placeholder="name, email, userId..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="admin-users-role">Role</label>
              <select
                id="admin-users-role"
                className="admin-select"
                value={role}
                onChange={(e) => {
                  setPage(1);
                  setRole(e.target.value);
                }}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-field">
              <label htmlFor="admin-users-status">Status</label>
              <select
                id="admin-users-status"
                className="admin-select"
                value={accountStatus}
                onChange={(e) => {
                  setPage(1);
                  setAccountStatus(e.target.value);
                }}
              >
                {STATUS_OPTIONS.map((value) => (
                  <option key={value || "all"} value={value}>
                    {value ? value : "All"}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="admin-button" disabled={isLoading}>
              Apply
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
              Reset
            </button>
          </div>
        </form>

        {errorMessage ? <p className="admin-muted">{errorMessage}</p> : null}
        {isLoading ? <p className="admin-muted">Loading users...</p> : null}

        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ width: 360 }}>Quick actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-muted">
                    No users found.
                  </td>
                </tr>
              ) : (
                items.map((user) => {
                  const userId = user.userId || user._id || "";
                  const isBusy = busyUserId === userId;

                  return (
                    <tr key={userId}>
                      <td>
                        <strong>{[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}</strong>
                        <div className="admin-muted">{user.userId}</div>
                      </td>
                      <td>{user.email || "—"}</td>
                      <td>{user.role || "—"}</td>
                      <td>
                        <span className={statusPillClass(user.accountStatus)}>{user.accountStatus || "—"}</span>
                      </td>
                      <td>
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
                            <option value="">Change role…</option>
                            {ROLE_OPTIONS.filter((option) => option.value).map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
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
                            <option value="">Change status…</option>
                            {STATUS_OPTIONS.filter(Boolean).map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            className="admin-button admin-button--ghost"
                            disabled={isBusy}
                            onClick={() => handleDeleteUser(userId)}
                          >
                            Delete
                          </button>
                        </div>
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
              Prev
            </button>
            <button
              type="button"
              className="admin-button admin-button--ghost"
              disabled={isLoading || page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </ViewFrame>
  );
}

export default AdminUsers;

