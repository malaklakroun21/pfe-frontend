import "./Mechanics.css";

export default function CreditsCard({ balance = 0, weeklyEarned = 0, weeklyCap = 5 }) {
  return (
    <article className="mechanics-credits-card">
      <span>Credit balance</span>
      <strong>{Number(balance).toLocaleString()} credits</strong>
      <p className="mechanics-skill-card__meta">
        Weekly earned: {weeklyEarned} / {weeklyCap} cap (Unverified mentors)
      </p>
    </article>
  );
}
