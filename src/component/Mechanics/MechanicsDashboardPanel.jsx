import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sessionApi } from "../../api/client.js";
import CreditsCard from "./CreditsCard.jsx";
import SkillCard from "./SkillCard.jsx";
import SessionConfirmationCard from "./SessionConfirmationCard.jsx";
import "./Mechanics.css";
import "./MechanicsDashboardPanel.css";

export default function MechanicsDashboardPanel({
  mechanics,
  currentUserId,
  onRefresh,
}) {
  const navigate = useNavigate();
  const [confirmingSessionId, setConfirmingSessionId] = useState("");
  const [confirmError, setConfirmError] = useState("");

  if (!mechanics) {
    return null;
  }

  const { credits, trustSkills, sessionsPendingConfirmation } = mechanics;
  const pendingCount = sessionsPendingConfirmation?.length ?? 0;

  async function handleConfirmSession(session) {
    if (!session?.id || confirmingSessionId) {
      return;
    }

    setConfirmError("");
    setConfirmingSessionId(session.id);

    try {
      await sessionApi.confirm(session.id);
      await onRefresh?.();
    } catch (error) {
      setConfirmError(error.message);
    } finally {
      setConfirmingSessionId("");
    }
  }

  return (
    <section className="mechanics-dashboard" aria-label="Credits, trust, and sessions">
      <div className="mechanics-dashboard__top">
        <CreditsCard
          balance={credits?.balance ?? 0}
          weeklyEarned={credits?.weeklyEarned ?? 0}
          weeklyCap={credits?.weeklyCap ?? 5}
        />

        <article className="mechanics-dashboard__trust-panel">
          <div className="mechanics-dashboard__panel-head">
            <h2>Your skill trust</h2>
            <button type="button" onClick={() => navigate("/app/skills?tab=skills")}>
              View profile
            </button>
          </div>

          {trustSkills?.length > 0 ? (
            <div className="mechanics-dashboard__skills">
              {trustSkills.map((skill) => (
                <SkillCard key={skill.id || skill.skillName} skill={skill} />
              ))}
            </div>
          ) : (
            <p className="mechanics-dashboard__empty">
              Add teaching skills on your profile to build trust scores and earn more per session.
            </p>
          )}
        </article>
      </div>

      {pendingCount > 0 ? (
        <article className="mechanics-dashboard__confirm-panel">
          <div className="mechanics-dashboard__panel-head">
            <h2>
              Confirm sessions
              <span className="mechanics-dashboard__pill">{pendingCount}</span>
            </h2>
            <button type="button" onClick={() => navigate("/app/my-sessions")}>
              All sessions
            </button>
          </div>

          {confirmError ? <p className="mechanics-dashboard__error">{confirmError}</p> : null}

          <div className="mechanics-dashboard__confirm-list">
            {sessionsPendingConfirmation.map((session) => (
              <div key={session.id} className="mechanics-dashboard__confirm-item">
                <div className="mechanics-dashboard__confirm-meta">
                  <strong>{session.title}</strong>
                  <span>
                    with {session.participantName} · {session.time} · {session.duration}
                  </span>
                </div>
                <SessionConfirmationCard
                  session={session}
                  currentUserId={currentUserId}
                  onConfirm={handleConfirmSession}
                  isSubmitting={confirmingSessionId === session.id}
                />
              </div>
            ))}
          </div>
        </article>
      ) : null}
    </section>
  );
}
