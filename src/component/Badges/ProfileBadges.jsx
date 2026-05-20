import "./ProfileBadges.css";

const CATEGORY_LABELS = {
  teaching: "Teaching",
  project: "Projects",
  validation: "Validation",
};

function BadgeIcon({ earned }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3.5 14.8 9l6.2.9-4.5 4.4 1.1 6.2L12 17.8 6.4 20.5l1.1-6.2L3 9.9l6.2-.9L12 3.5Z" />
      {!earned ? <path d="M5 5l14 14" strokeLinecap="round" /> : null}
    </svg>
  );
}

export default function ProfileBadges({ badgeProfile, showLocked = true }) {
  if (!badgeProfile) {
    return null;
  }

  const badges = Array.isArray(badgeProfile.badges) ? badgeProfile.badges : [];
  const visibleBadges = showLocked ? badges : badges.filter((badge) => badge.earned);

  if (!visibleBadges.length) {
    return (
      <section className="profile-badges" aria-labelledby="profile-badges-heading">
        <header className="profile-badges__header">
          <h3 id="profile-badges-heading">Badges</h3>
          <p>No badges earned yet.</p>
        </header>
      </section>
    );
  }

  const grouped = visibleBadges.reduce((groups, badge) => {
    const category = badge.category || "other";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(badge);
    return groups;
  }, {});

  return (
    <section className="profile-badges" aria-labelledby="profile-badges-heading">
      <header className="profile-badges__header">
        <h3 id="profile-badges-heading">Badges</h3>
        <p>
          {badgeProfile.earnedCount ?? 0} of {badgeProfile.totalBadges ?? visibleBadges.length} earned
          {typeof badgeProfile.trustScore === "number" ? ` · Trust score ${badgeProfile.trustScore}` : ""}
        </p>
      </header>

      {Object.entries(grouped).map(([category, categoryBadges]) => (
        <div key={category} className="profile-badges__group">
          <h4>{CATEGORY_LABELS[category] ?? category}</h4>
          <ul className="profile-badges__grid">
            {categoryBadges.map((badge) => (
              <li
                key={badge.key}
                className={`profile-badges__card${badge.earned ? " is-earned" : " is-locked"}`}
              >
                <span className="profile-badges__icon" aria-hidden="true">
                  <BadgeIcon earned={badge.earned} />
                </span>
                <div className="profile-badges__body">
                  <strong>{badge.name}</strong>
                  <span className="profile-badges__category">
                    {CATEGORY_LABELS[badge.category] ?? badge.category}
                  </span>
                  <p>{badge.description}</p>
                  {badge.earned && badge.earnedAt ? (
                    <time dateTime={badge.earnedAt}>
                      Earned {new Date(badge.earnedAt).toLocaleDateString()}
                    </time>
                  ) : (
                    <span className="profile-badges__locked-label">Locked</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
