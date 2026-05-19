import "./XP.css";

export default function XPBadge({ level = 1, levelTitle = "Seed", xpTotal = 0 }) {
  return (
    <span className="xp-badge" aria-label={`Level ${level}, ${levelTitle}, ${xpTotal} XP`}>
      <span className="xp-badge__level">Lv{level}</span>
      <span className="xp-badge__title">{levelTitle}</span>
      <span className="xp-badge__xp">{Number(xpTotal).toLocaleString()} XP</span>
    </span>
  );
}
