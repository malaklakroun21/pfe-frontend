import "./ProfileStreak.css";

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3.75 18 6v5.85c0 3.3-2.28 6.36-6 8.4-3.72-2.04-6-5.1-6-8.4V6l6-2.25Z" />
      <path d="m9.5 12 1.7 1.7 3.35-3.65" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.4 2.9c.45 2.55-.3 4.42-1.7 6.08-.98 1.15-1.57 2.17-1.35 3.45.18 1.02.9 1.82 1.82 2.08-.35-1.33.16-2.53 1.02-3.42.74-.76 1.1-1.55.95-2.58 2.6 1.72 4.25 4.17 4.25 6.9 0 3.32-2.35 5.84-5.45 5.84-3.25 0-5.8-2.48-5.8-5.82 0-2.28 1.1-4.05 2.4-5.68 1.42-1.78 2.76-3.44 3.86-6.95Z" />
    </svg>
  );
}

export default function ProfileStreak({ streak }) {
  if (!streak) {
    return null;
  }

  const currentStreak = Number(streak.currentStreak) || 0;
  const longestStreak = Number(streak.longestStreak) || 0;
  const progress = streak.milestoneProgress || {};
  const shield = streak.shield || {};
  const nextMilestone = progress.nextMilestone || 7;
  const remaining = Math.max(0, Number(progress.remaining) || 0);
  const progressPercent = Math.max(0, Math.min(100, Number(progress.percent) || 0));
  const shieldAvailable = (Number(shield.available) || 0) > 0;

  return (
    <section className="profile-streak" aria-label="Activity streak">
      <div className="profile-streak__main">
        <div className="profile-streak__icon">
          <FlameIcon />
        </div>

        <div>
          <p className="profile-streak__eyebrow">Activity streak</p>
          <h3 className="profile-streak__title">
            {currentStreak} {currentStreak === 1 ? "day" : "days"}
          </h3>
          <p className="profile-streak__meta">Longest streak: {longestStreak} days</p>
        </div>
      </div>

      <div className="profile-streak__progress">
        <div className="profile-streak__progress-copy">
          <span>Next milestone</span>
          <strong>{remaining === 0 ? `${nextMilestone}-day milestone reached` : `${remaining} days to ${nextMilestone}`}</strong>
        </div>
        <div className="profile-streak__track" aria-hidden="true">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className={`profile-streak__shield${shieldAvailable ? " is-available" : ""}`}>
        <ShieldIcon />
        <span>{shieldAvailable ? "Monthly shield ready" : "Monthly shield used"}</span>
      </div>
    </section>
  );
}
