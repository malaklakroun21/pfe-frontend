import TrustBadge from "./TrustBadge.jsx";
import "./Mechanics.css";

export default function SkillCard({ skill }) {
  if (!skill) {
    return null;
  }

  return (
    <article className="mechanics-skill-card">
      <div className="mechanics-skill-card__head">
        <h4 className="mechanics-skill-card__name">{skill.skillName || skill.name}</h4>
        <TrustBadge badge={skill.trustBadge} score={skill.trustScore} />
      </div>
      <p className="mechanics-skill-card__meta">
        Tier: {skill.skillTier || "STARTER"} · Modifier ×{skill.trustModifier ?? 1}
      </p>
      <p className="mechanics-skill-card__meta">
        Portfolio {skill.portfolioScore ?? 0} · Endorsements {skill.endorsementsCount ?? 0} (E=
        {skill.endorsementScore ?? 0})
      </p>
    </article>
  );
}
