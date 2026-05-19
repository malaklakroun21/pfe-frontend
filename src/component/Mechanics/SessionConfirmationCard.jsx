import "./Mechanics.css";

export default function SessionConfirmationCard({
  session,
  currentUserId,
  onConfirm,
  isSubmitting = false,
}) {
  if (!session) {
    return null;
  }

  const isTeacher = session.teacherId === currentUserId;
  const isLearner = session.learnerId === currentUserId;
  const alreadyConfirmed = isTeacher ? session.teacherConfirmed : session.learnerConfirmed;
  const otherConfirmed = isTeacher ? session.learnerConfirmed : session.teacherConfirmed;
  const sessionStatus = String(session.rawStatus || session.status || "")
    .trim()
    .toUpperCase();
  const canConfirm = sessionStatus === "ACCEPTED" && !alreadyConfirmed;

  return (
    <article className="mechanics-session-confirm">
      <h4>Session completion</h4>
      <p className="mechanics-skill-card__meta">
        Credits transfer when <strong>both</strong> participants confirm (max 4h, formula: T ×
        tier × trust).
      </p>
      <p className="mechanics-skill-card__meta">
        You: {alreadyConfirmed ? "Confirmed" : "Pending"} · Partner:{" "}
        {otherConfirmed ? "Confirmed" : "Waiting"}
      </p>
      {session.creditBreakdown ? (
        <p className="mechanics-skill-card__meta">
          Last settlement: {session.creditBreakdown.calculatedCredits} credits (
          {session.creditBreakdown.hours}h × tier {session.creditBreakdown.skillTier} × M
          {session.creditBreakdown.trustModifier})
        </p>
      ) : null}
      {canConfirm ? (
        <div className="mechanics-session-confirm__actions">
          <button
            type="button"
            className="mechanics-session-confirm__button"
            disabled={isSubmitting}
            onClick={() => onConfirm?.(session)}
          >
            {isSubmitting ? "Confirming..." : "Confirm session completed"}
          </button>
        </div>
      ) : null}
      {session.endorsementsUnlocked ? (
        <p className="mechanics-skill-card__meta">Endorsements unlocked for this session.</p>
      ) : null}
    </article>
  );
}
