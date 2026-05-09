import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../../api/client.js";
import DashboardPage from "../../Dashboard/Layout/DashboardPage/DashboardPage.jsx";
import ViewFrame from "../../Dashboard/Layout/ViewFrame/ViewFrame.jsx";
import AdminPageHeader from "../AdminPageHeader.jsx";

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

  const { stats, cards } = useMemo(() => {
    const users = data?.users;
    const moderation = data?.moderation;
    const system = data?.system;

    const nextStats = [
      { label: "Total users", value: users ? String(users.total) : "—", accent: "warm" },
      { label: "Active users", value: users ? String(users.active) : "—", accent: "soft" },
      { label: "Pending reports", value: moderation ? String(moderation.pendingReports) : "—", accent: "dark" },
    ];

    const nextCards = [
      {
        title: "User distribution",
        text: users
          ? `Admins: ${users.admins} • Mentors: ${users.mentors} • Learners: ${users.learners}`
          : "No data yet.",
      },
      {
        title: "Moderation",
        text: moderation
          ? `Under review: ${moderation.reportsUnderReview} • Pending: ${moderation.pendingReports}`
          : "No data yet.",
      },
      {
        title: "System",
        text: system
          ? `Settings: ${system.settingsCount} • Audit entries: ${system.auditEntries}`
          : "No data yet.",
      },
    ];

    return { stats: nextStats, cards: nextCards };
  }, [data]);

  return (
    <ViewFrame header={<AdminPageHeader title="Admin dashboard" />}>
      {errorMessage ? <p>{errorMessage}</p> : null}
      {isLoading ? (
        <p>Loading admin dashboard...</p>
      ) : (
        <DashboardPage
          title="Platform overview"
          subtitle="Monitor users, moderation workload, and system health."
          stats={stats}
          cards={cards}
        />
      )}
    </ViewFrame>
  );
}

export default AdminDashboard;

