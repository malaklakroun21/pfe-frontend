import "./XP.css";

export default function XPProgressBar({
  xpTotal = 0,
  currentLevelMinXP = 0,
  nextLevelXP = null,
  progressPercent = 0,
  isMaxLevel = false,
}) {
  const safeProgress = Math.min(100, Math.max(0, Number(progressPercent) || 0));
  const targetLabel =
    isMaxLevel || nextLevelXP === null
      ? "Max level"
      : `${Number(nextLevelXP).toLocaleString()} XP`;

  return (
    <div className="xp-progress">
      <div className="xp-progress__labels">
        <span>{Number(xpTotal).toLocaleString()} XP</span>
        <span>{isMaxLevel ? "Oasis reached" : `Next: ${targetLabel}`}</span>
      </div>
      <div
        className="xp-progress__track"
        role="progressbar"
        aria-valuemin={currentLevelMinXP}
        aria-valuemax={isMaxLevel ? xpTotal : nextLevelXP}
        aria-valuenow={xpTotal}
        aria-label="XP progress to next level"
      >
        <div className="xp-progress__fill" style={{ width: `${safeProgress}%` }} />
      </div>
    </div>
  );
}
