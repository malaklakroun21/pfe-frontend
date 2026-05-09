import { useEffect, useMemo, useState } from "react";
import ViewFrame from "../../Dashboard/Layout/ViewFrame/ViewFrame.jsx";
import AdminPageHeader from "../AdminPageHeader.jsx";
import { adminApi } from "../../../api/client.js";
import "../adminUi.css";

function AdminAudit() {
  const [actionType, setActionType] = useState("");
  const [adminUserId, setAdminUserId] = useState("");
  const [userId, setUserId] = useState("");
  const [targetEntityType, setTargetEntityType] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  useEffect(() => {
    let isActive = true;

    async function loadAuditLogs() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await adminApi.listAuditLogs({
          page,
          limit: 20,
          actionType: actionType.trim() || undefined,
          adminUserId: adminUserId.trim() || undefined,
          userId: userId.trim() || undefined,
          targetEntityType: targetEntityType.trim() || undefined,
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

    loadAuditLogs();
    return () => {
      isActive = false;
    };
  }, [page, actionType, adminUserId, userId, targetEntityType]);

  const title = useMemo(() => {
    const total = pagination?.total ?? 0;
    return `Audit logs (${total})`;
  }, [pagination?.total]);

  return (
    <ViewFrame header={<AdminPageHeader title={title} />}>
      <section className="admin-surface">
        <div className="admin-toolbar">
          <div className="admin-toolbar__group">
            <div className="admin-field">
              <label htmlFor="admin-audit-action">Action type</label>
              <input
                id="admin-audit-action"
                className="admin-input"
                placeholder="e.g. ADMIN_USER_UPDATED"
                value={actionType}
                onChange={(e) => {
                  setPage(1);
                  setActionType(e.target.value);
                }}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="admin-audit-admin">Admin userId</label>
              <input
                id="admin-audit-admin"
                className="admin-input"
                placeholder="ADMIN-USER-ID"
                value={adminUserId}
                onChange={(e) => {
                  setPage(1);
                  setAdminUserId(e.target.value);
                }}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="admin-audit-user">User userId</label>
              <input
                id="admin-audit-user"
                className="admin-input"
                placeholder="USER-ID"
                value={userId}
                onChange={(e) => {
                  setPage(1);
                  setUserId(e.target.value);
                }}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="admin-audit-entity">Entity type</label>
              <input
                id="admin-audit-entity"
                className="admin-input"
                placeholder="User / Report / SystemSetting ..."
                value={targetEntityType}
                onChange={(e) => {
                  setPage(1);
                  setTargetEntityType(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="admin-toolbar__group">
            <button
              type="button"
              className="admin-button admin-button--ghost"
              onClick={() => {
                setActionType("");
                setAdminUserId("");
                setUserId("");
                setTargetEntityType("");
                setPage(1);
              }}
              disabled={isLoading}
            >
              Reset
            </button>
          </div>
        </div>

        {errorMessage ? <p className="admin-muted">{errorMessage}</p> : null}
        {isLoading ? <p className="admin-muted">Loading audit logs...</p> : null}

        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Action</th>
                <th>Admin</th>
                <th>User</th>
                <th>Target</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-muted">
                    No audit entries found.
                  </td>
                </tr>
              ) : (
                items.map((entry) => {
                  const id = entry.auditId || entry._id || `${entry.actionType}-${entry.timestamp}`;
                  return (
                    <tr key={id}>
                      <td>{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "—"}</td>
                      <td>
                        <strong>{entry.actionType || "—"}</strong>
                      </td>
                      <td>{entry.adminUserId || "—"}</td>
                      <td>{entry.userId || "—"}</td>
                      <td>
                        {entry.targetEntityType || "—"}{" "}
                        <span className="admin-muted">{entry.targetEntityId ? `(${entry.targetEntityId})` : ""}</span>
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

export default AdminAudit;

