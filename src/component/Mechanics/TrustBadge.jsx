import "./Mechanics.css";

const BADGE_CLASS = {
  unverified: "mechanics-trust-badge--unverified",
  bronze: "mechanics-trust-badge--bronze",
  silver: "mechanics-trust-badge--silver",
  gold: "mechanics-trust-badge--gold",
  verified: "mechanics-trust-badge--verified",
};

export default function TrustBadge({ badge = "Unverified", score = null }) {
  const key = String(badge || "Unverified").toLowerCase();
  const className = BADGE_CLASS[key] || BADGE_CLASS.unverified;

  return (
    <span className={`mechanics-trust-badge ${className}`}>
      {badge}
      {typeof score === "number" ? ` · ${score}` : null}
    </span>
  );
}
