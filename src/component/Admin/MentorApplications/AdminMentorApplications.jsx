import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ViewFrame from "../../Dashboard/Layout/ViewFrame/ViewFrame.jsx";
import AdminPageHeader from "../AdminPageHeader.jsx";
import { mentorApplicationApi } from "../../../api/client.js";
import "../adminUi.css";
import "./AdminMentorApplications.css";

function ProofModal({ app, onClose, onViewProfile }) {
  const applicantName =
    [app.applicant?.firstName, app.applicant?.lastName].filter(Boolean).join(" ") ||
    app.userId ||
    "Unknown";

  return (
    <div className="mentor-proof-modal__overlay" onClick={onClose}>
      <div className="mentor-proof-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mentor-proof-modal__header">
          <h3>{applicantName}</h3>
          <button type="button" className="mentor-proof-modal__close" onClick={onClose}>✕</button>
        </div>

        <dl className="mentor-proof-modal__body">
          <div className="mentor-proof-modal__row">
            <dt>Validated Skill</dt>
            <dd>{app.skillName || "—"}</dd>
          </div>

          <div className="mentor-proof-modal__row">
            <dt>Applied on</dt>
            <dd>{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "—"}</dd>
          </div>

          {app.applicant?.portfolioUrl ? (
            <div className="mentor-proof-modal__row">
              <dt>Portfolio</dt>
              <dd>
                <a href={app.applicant.portfolioUrl} target="_blank" rel="noreferrer">
                  {app.applicant.portfolioUrl}
                </a>
              </dd>
            </div>
          ) : null}

          {app.applicant?.resumeFileName ? (
            <div className="mentor-proof-modal__row">
              <dt>Resume</dt>
              <dd>
                {app.applicant.resumeDownloadUrl ? (
                  <a href={app.applicant.resumeDownloadUrl} target="_blank" rel="noreferrer">
                    {app.applicant.resumeFileName}
                  </a>
                ) : (
                  app.applicant.resumeFileName
                )}
              </dd>
            </div>
          ) : null}

          {app.professionalStatement ? (
            <div className="mentor-proof-modal__row mentor-proof-modal__row--full">
              <dt>Statement</dt>
              <dd>{app.professionalStatement}</dd>
            </div>
          ) : null}

          {app.yearsOfExperience > 0 ? (
            <div className="mentor-proof-modal__row">
              <dt>Experience</dt>
              <dd>{app.yearsOfExperience} year{app.yearsOfExperience === 1 ? "" : "s"}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mentor-proof-modal__footer">
          <button
            type="button"
            className="admin-button"
            onClick={onViewProfile}
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminMentorApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [busyId, setBusyId] = useState("");
  const [actionError, setActionError] = useState("");
  const [rejectingId, setRejectingId] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [proofApp, setProofApp] = useState(null);

  async function loadApplications(status) {
    setIsLoading(true);
    setLoadError("");
    try {
      const data = await mentorApplicationApi.listApplications(status ? { status } : {});
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadApplications(statusFilter);
  }, [statusFilter]);

  function getAppId(app) {
    return app._id || app.applicationId;
  }

  async function handleApprove(applicationId) {
    if (busyId) return;
    setActionError("");
    setBusyId(applicationId);
    try {
      await mentorApplicationApi.reviewApplication(applicationId, { decision: "APPROVED" });
      setApplications((prev) => prev.filter((a) => getAppId(a) !== applicationId));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId("");
    }
  }

  async function handleReject(applicationId) {
    if (busyId) return;
    setActionError("");
    setBusyId(applicationId);
    try {
      await mentorApplicationApi.reviewApplication(applicationId, {
        decision: "REJECTED",
        rejectionReason: rejectReason.trim() || undefined,
      });
      setApplications((prev) => prev.filter((a) => getAppId(a) !== applicationId));
      setRejectingId("");
      setRejectReason("");
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId("");
    }
  }

  return (
    <ViewFrame header={<AdminPageHeader title="Mentor Applications" />}>
      <section className="admin-surface">
        <div className="admin-toolbar">
          <div className="admin-toolbar__group">
            <select
              className="admin-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ height: 40, paddingLeft: 12, paddingRight: 12, cursor: "pointer" }}
            >
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="">All</option>
            </select>
          </div>
        </div>

        {actionError ? (
          <p style={{ color: "#b42318", fontSize: 13, marginBottom: 12 }}>{actionError}</p>
        ) : null}

        {isLoading ? (
          <p className="admin-muted">Loading applications...</p>
        ) : loadError ? (
          <p style={{ color: "#b42318", fontSize: 13 }}>{loadError}</p>
        ) : applications.length === 0 ? (
          <p className="admin-muted">No applications found.</p>
        ) : (
          <div className="admin-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Email</th>
                  <th>Skill</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Proof</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const appId = getAppId(app);
                  const isBusy = busyId === appId;
                  const isRejectOpen = rejectingId === appId;
                  const applicantName =
                    [app.applicant?.firstName, app.applicant?.lastName].filter(Boolean).join(" ") ||
                    app.userId ||
                    "Unknown";

                  return (
                    <tr key={appId}>
                      <td>{applicantName}</td>
                      <td>{app.applicant?.email || "—"}</td>
                      <td>{app.skillName || "—"}</td>
                      <td>
                        <span
                          className={`admin-pill${
                            app.applicationStatus === "PENDING"
                              ? " admin-pill--suspended"
                              : app.applicationStatus === "APPROVED"
                              ? " admin-pill--active"
                              : " admin-pill--banned"
                          }`}
                        >
                          {app.applicationStatus}
                        </span>
                      </td>
                      <td>{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "—"}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-button admin-button--ghost"
                          style={{ fontSize: 12, padding: "0 12px", height: 34 }}
                          onClick={() => setProofApp(app)}
                        >
                          View Proof
                        </button>
                      </td>
                      <td>
                        {app.applicationStatus === "PENDING" ? (
                          isRejectOpen ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              <input
                                type="text"
                                className="admin-input"
                                placeholder="Rejection reason (optional)"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                style={{ height: 36, fontSize: 12 }}
                              />
                              <div style={{ display: "flex", gap: 6 }}>
                                <button
                                  type="button"
                                  className="admin-button admin-button--danger"
                                  onClick={() => handleReject(appId)}
                                  disabled={isBusy}
                                >
                                  {isBusy ? "..." : "Confirm"}
                                </button>
                                <button
                                  type="button"
                                  className="admin-button admin-button--ghost"
                                  onClick={() => { setRejectingId(""); setRejectReason(""); }}
                                  disabled={isBusy}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                type="button"
                                className="admin-button"
                                onClick={() => handleApprove(appId)}
                                disabled={isBusy}
                              >
                                {isBusy ? "..." : "Approve"}
                              </button>
                              <button
                                type="button"
                                className="admin-button admin-button--danger"
                                onClick={() => setRejectingId(appId)}
                                disabled={isBusy}
                              >
                                Reject
                              </button>
                            </div>
                          )
                        ) : (
                          <span className="admin-muted">{app.rejectionReason || "—"}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {proofApp ? (
        <ProofModal
          app={proofApp}
          onClose={() => setProofApp(null)}
          onViewProfile={() => {
            setProofApp(null);
            navigate(`/app/profile/${proofApp.userId}`);
          }}
        />
      ) : null}
    </ViewFrame>
  );
}

export default AdminMentorApplications;
