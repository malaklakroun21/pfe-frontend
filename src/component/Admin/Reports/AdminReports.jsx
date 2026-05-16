import { useEffect, useMemo, useState } from "react";
import ViewFrame from "../../Dashboard/Layout/ViewFrame/ViewFrame.jsx";
import AdminPageHeader from "../AdminPageHeader.jsx";
import { adminApi } from "../../../api/client.js";
import "../adminUi.css";

const STATUS_OPTIONS = ["", "PENDING", "UNDER_REVIEW", "RESOLVED", "DISMISSED"];

function AdminReports() {
  const [reportStatus, setReportStatus] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [busyReportId, setBusyReportId] = useState("");

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  useEffect(() => {
    let isActive = true;

    async function loadReports() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await adminApi.listReports({
          page,
          limit: 20,
          reportStatus: reportStatus || undefined,
          assignedTo: assignedTo.trim() || undefined,
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

    loadReports();
    return () => {
      isActive = false;
    };
  }, [page, reportStatus, assignedTo]);

  const title = useMemo(() => {
    const total = pagination?.total ?? 0;
    return `Reports (${total})`;
  }, [pagination?.total]);

  const handleUpdateStatus = async (reportId, nextStatus) => {
    setBusyReportId(reportId);
    setErrorMessage("");
    try {
      await adminApi.updateReport(reportId, { reportStatus: nextStatus, resolution: "" });
      const response = await adminApi.listReports({
        page,
        limit: 20,
        reportStatus: reportStatus || undefined,
        assignedTo: assignedTo.trim() || undefined,
      });
      setData(response);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyReportId("");
    }
  };

  const handleResolutionSubmit = async (reportId, event) => {
    event.preventDefault();
    const resolution = event.target.elements.namedItem("resolution")?.value || "";
    const status = event.target.elements.namedItem("status")?.value || "UNDER_REVIEW";

    setBusyReportId(reportId);
    setErrorMessage("");
    try {
      await adminApi.updateReport(reportId, { reportStatus: status, resolution });
      const response = await adminApi.listReports({
        page,
        limit: 20,
        reportStatus: reportStatus || undefined,
        assignedTo: assignedTo.trim() || undefined,
      });
      setData(response);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyReportId("");
    }
  };

  return (
    <ViewFrame header={<AdminPageHeader title={title} />}>
      <section className="admin-surface">
        <div className="admin-toolbar">
          <div className="admin-toolbar__group">
            <div className="admin-field">
              <label htmlFor="admin-reports-status">Status</label>
              <select
                id="admin-reports-status"
                className="admin-select"
                value={reportStatus}
                onChange={(e) => {
                  setPage(1);
                  setReportStatus(e.target.value);
                }}
              >
                {STATUS_OPTIONS.map((value) => (
                  <option key={value || "all"} value={value}>
                    {value ? value : "All"}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-field">
              <label htmlFor="admin-reports-assigned">Assigned to (admin userId)</label>
              <input
                id="admin-reports-assigned"
                className="admin-input"
                placeholder="ADMIN-USER-ID"
                value={assignedTo}
                onChange={(e) => {
                  setPage(1);
                  setAssignedTo(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="admin-toolbar__group">
            <button
              type="button"
              className="admin-button admin-button--ghost"
              onClick={() => {
                setReportStatus("");
                setAssignedTo("");
                setPage(1);
              }}
              disabled={isLoading}
            >
              Reset
            </button>
          </div>
        </div>

        {errorMessage ? <p className="admin-muted">{errorMessage}</p> : null}
        {isLoading ? <p className="admin-muted">Loading reports...</p> : null}

        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Report</th>
                <th>Status</th>
                <th>Assigned</th>
                <th style={{ width: 420 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="admin-muted">
                    No reports found.
                  </td>
                </tr>
              ) : (
                items.map((report) => {
                  const reportId = report.reportId || report.id || report._id || "";
                  const isBusy = busyReportId === reportId;

                  return (
                    <tr key={reportId}>
                      <td>
                        <strong>{report.reportId || "—"}</strong>
                        <div className="admin-muted">
                          Target: {report.reportedUserId || "—"} • Created:{" "}
                          {report.createdAt ? new Date(report.createdAt).toLocaleString() : "—"}
                        </div>
                      </td>
                      <td>{report.reportStatus || "—"}</td>
                      <td>{report.assignedTo || "—"}</td>
                      <td>
                        <div className="admin-toolbar__group">
                          <select
                            className="admin-select"
                            defaultValue=""
                            disabled={isBusy}
                            onChange={(e) => {
                              const nextStatus = e.target.value;
                              e.target.value = "";
                              if (!nextStatus) return;
                              handleUpdateStatus(reportId, nextStatus);
                            }}
                          >
                            <option value="">Update status…</option>
                            {STATUS_OPTIONS.filter(Boolean).map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>

                          <details>
                            <summary className="admin-muted" style={{ cursor: "pointer" }}>
                              Add resolution
                            </summary>
                            <form onSubmit={(e) => handleResolutionSubmit(reportId, e)}>
                              <div className="admin-toolbar__group" style={{ marginTop: 8 }}>
                                <select name="status" className="admin-select" defaultValue="UNDER_REVIEW">
                                  {STATUS_OPTIONS.filter(Boolean).map((value) => (
                                    <option key={value} value={value}>
                                      {value}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  name="resolution"
                                  className="admin-input"
                                  placeholder="Resolution note…"
                                  style={{ minWidth: 220 }}
                                />
                                <button type="submit" className="admin-button" disabled={isBusy}>
                                  Save
                                </button>
                              </div>
                            </form>
                          </details>
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

export default AdminReports;

