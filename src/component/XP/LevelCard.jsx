import XPBadge from "./XPBadge.jsx";
import XPProgressBar from "./XPProgressBar.jsx";
import XPHistoryList from "./XPHistoryList.jsx";
import "./XP.css";

export default function LevelCard({ xpProfile, showHistory = false }) {
  if (!xpProfile) {
    return null;
  }

  const {
    xpTotal = 0,
    level = 1,
    levelTitle = "Seed",
    currentLevelMinXP = 0,
    nextLevelXP = null,
    progressPercent = 0,
    isMaxLevel = false,
    recentHistory = [],
  } = xpProfile;

  return (
    <section className="xp-panel" aria-label="Experience points">
      <div className="xp-panel__header">
        <div className="xp-level-card">
          <p className="xp-level-card__eyebrow">Reputation</p>
          <h3 className="xp-level-card__title">
            Level {level} — {levelTitle}
          </h3>
          <p className="xp-level-card__meta">
            {isMaxLevel
              ? "You reached the highest FENNEKY level."
              : `Earn ${Math.max(0, (nextLevelXP ?? 0) - xpTotal).toLocaleString()} XP to reach the next level.`}
          </p>
        </div>
        <XPBadge level={level} levelTitle={levelTitle} xpTotal={xpTotal} />
      </div>

      <XPProgressBar
        xpTotal={xpTotal}
        currentLevelMinXP={currentLevelMinXP}
        nextLevelXP={nextLevelXP}
        progressPercent={progressPercent}
        isMaxLevel={isMaxLevel}
      />

      {showHistory ? <XPHistoryList items={recentHistory} /> : null}
    </section>
  );
}
