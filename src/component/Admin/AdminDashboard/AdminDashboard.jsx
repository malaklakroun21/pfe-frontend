import { useEffect, useState } from "react";
import { adminApi } from "../../../api/client.js";
import ViewFrame from "../../Dashboard/Layout/ViewFrame/ViewFrame.jsx";
import AdminPageHeader from "../AdminPageHeader.jsx";
import "../adminUi.css";
import "./AdminDashboard.css";

function StatCard({ label, value, accent }) {
  return (
    <div className={`admin-stat-card${accent ? ` admin-stat-card--${accent}` : ""}`}>
      <span className="admin-muted">{label}</span>
      <strong>{value ?? "--"}</strong>
    </div>
  );
}

function SectionTitle({ children }) {
  return <p className="admin-section-title">{children}</p>;
}

function DashboardSection({ title, children, fullWidth = false }) {
  return (
    <section className={`admin-dashboard__section${fullWidth ? " admin-dashboard__section--full" : ""}`}>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </section>
  );
}

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadDashboard() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = await adminApi.getDashboard();
        if (!isActive) return;
        setData(response);
      } catch (error) {
        if (!isActive) return;
        setErrorMessage(error.message);
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadDashboard();
    return () => {
      isActive = false;
    };
  }, []);

  const { users, moderation, credits, sessions, system } = data ?? {};

  return (
    <ViewFrame header={<AdminPageHeader title="Admin dashboard" />}>
      <section className="admin-surface admin-dashboard">
        <div className="admin-dashboard__hero">
          <div className="admin-dashboard__hero-copy">
            <p className="admin-dashboard__eyebrow">Fenneky admin</p>
            <h2>Platform overview</h2>
            <p>
              Track users, moderation, credits, sessions, and recent platform activity from one
              warm, readable control center.
            </p>
          </div>

          <div className="admin-dashboard__hero-metrics">
            <div className="admin-dashboard__hero-metric">
              <span>Total users</span>
              <strong>{users?.total ?? "--"}</strong>
            </div>
            <div className="admin-dashboard__hero-metric">
              <span>Pending reports</span>
              <strong>{moderation?.pendingReports ?? "--"}</strong>
            </div>
            <div className="admin-dashboard__hero-metric">
              <span>Sessions</span>
              <strong>{sessions?.total ?? "--"}</strong>
            </div>
            <div className="admin-dashboard__hero-metric">
              <span>Credits in circulation</span>
              <strong>{credits?.totalInCirculation ?? "--"}</strong>
            </div>
          </div>
        </div>

        {errorMessage ? (
          <p className="admin-dashboard__notice admin-dashboard__notice--error">{errorMessage}</p>
        ) : null}
        {isLoading ? <p className="admin-dashboard__notice">Loading dashboard...</p> : null}

        {data && (
          <div className="admin-dashboard__layout">
            <DashboardSection title="Users">
              <div className="admin-stats-grid">
                <StatCard label="Total users" value={users?.total} accent="dark" />
                <StatCard label="Active" value={users?.active} accent="active" />
                <StatCard label="Suspended" value={users?.suspended} accent="suspended" />
                <StatCard label="Banned" value={users?.banned} accent="banned" />
                <StatCard label="Admins" value={users?.admins} />
                <StatCard label="Mentors" value={users?.mentors} />
                <StatCard label="Learners" value={users?.learners} />
              </div>
            </DashboardSection>

            <DashboardSection title="Moderation">
              <div className="admin-stats-grid">
                <StatCard label="Pending reports" value={moderation?.pendingReports} accent="suspended" />
                <StatCard label="Under review" value={moderation?.reportsUnderReview} />
                <StatCard label="Reported users (actifs)" value={moderation?.reportedUsers} accent="banned" />
                <StatCard
                  label="Candidatures mentors en attente"
                  value={moderation?.pendingMentorApplications}
                  accent="dark"
                />
              </div>
            </DashboardSection>


            <DashboardSection title="Sessions">
              <div className="admin-stats-grid">
                <StatCard label="Total" value={sessions?.total} accent="dark" />
                <StatCard label="En attente" value={sessions?.pending} />
                <StatCard label="Acceptees" value={sessions?.accepted} accent="active" />
                <StatCard label="Completees" value={sessions?.completed} accent="active" />
                <StatCard label="Rejetees" value={sessions?.rejected} accent="banned" />
              </div>
            </DashboardSection>

            <DashboardSection title="Systeme">
              <div className="admin-stats-grid">
                <StatCard label="Parametres" value={system?.settingsCount} />
                <StatCard label="Entrees d'audit" value={system?.auditEntries} />
              </div>
            </DashboardSection>

            {system?.recentActivity?.length > 0 && (
              <DashboardSection title="Activite recente de la plateforme" fullWidth>
                <div className="admin-card admin-dashboard__activity-card">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Quand</th>
                        <th>Action</th>
                        <th>Admin</th>
                        <th>Cible</th>
                      </tr>
                    </thead>
                    <tbody>
                      {system.recentActivity.map((entry) => (
                        <tr key={entry.auditId || entry._id}>
                          <td className="admin-muted">
                            {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "--"}
                          </td>
                          <td>
                            <strong>{entry.actionType || "--"}</strong>
                          </td>
                          <td className="admin-muted">{entry.adminUserId || "--"}</td>
                          <td className="admin-muted">
                            {entry.targetEntityType || "--"}
                            {entry.targetEntityId ? ` (${entry.targetEntityId})` : ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DashboardSection>
            )}
          </div>
        )}
      </section>
    </ViewFrame>
  );
}

export default AdminDashboard;
