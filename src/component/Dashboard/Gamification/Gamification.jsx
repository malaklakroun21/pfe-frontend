import { useEffect, useState } from "react";
import { challengeApi, dashboardApi, leaderboardApi } from "../../../api/client.js";
import ViewFrame from "../Layout/ViewFrame/ViewFrame.jsx";
import "./Gamification.css";

const BADGE_CATALOG = [
  { key: "FIRST_SESSION", label: "First Session", description: "Teach your first session.", category: "Teaching" },
  { key: "CONSISTENT_MENTOR", label: "Consistent Mentor", description: "Teach 5 sessions.", category: "Teaching" },
  { key: "TRUSTED_TEACHER", label: "Trusted Teacher", description: "Earn a 4.5+ average rating.", category: "Teaching" },
  { key: "COMMUNITY_PILLAR", label: "Community Pillar", description: "Teach 20 sessions.", category: "Teaching" },
  { key: "OASIS_MAKER", label: "Oasis Maker", description: "Reach the Oasis level.", category: "Teaching" },
  { key: "FIRST_BUILD", label: "First Build", description: "Complete your first project.", category: "Projects" },
  { key: "TEAM_PLAYER", label: "Team Player", description: "Join 3 projects.", category: "Projects" },
  { key: "PROJECT_LEADER", label: "Project Leader", description: "Lead a project to completion.", category: "Projects" },
  { key: "CROSS_DISCIPLINARY", label: "Cross-Disciplinary", description: "Work in 3 different skill areas.", category: "Projects" },
  { key: "SERIAL_BUILDER", label: "Serial Builder", description: "Complete 5 projects.", category: "Projects" },
  { key: "FIRST_VALIDATION", label: "First Validation", description: "Get your first skill validated.", category: "Validation" },
  { key: "BRONZE_EARNER", label: "Bronze Earner", description: "Score 60+ on a validation.", category: "Validation" },
  { key: "SILVER_EARNER", label: "Silver Earner", description: "Score 75+ on a validation.", category: "Validation" },
  { key: "GOLD_EARNER", label: "Gold Earner", description: "Score 90+ on a validation.", category: "Validation" },
  { key: "FULLY_VERIFIED", label: "Fully Verified", description: "Have all skills validated.", category: "Validation" },
  { key: "FLAME_BADGE", label: "On Fire", description: "Maintain a 7-day activity streak.", category: "Streaks" },
  { key: "SPECIAL_BADGE", label: "Legendary Streak", description: "Maintain a 30-day activity streak.", category: "Streaks" },
];

const BADGE_CATEGORY_COLOR = {
  Teaching: "#d65218",
  Projects: "#2e7d6b",
  Validation: "#1a6fb5",
  Streaks: "#b5620a",
};

const STREAK_MILESTONES = [
  { days: 7, reward: "+5 XP + Flame badge" },
  { days: 14, reward: "+15 XP" },
  { days: 30, reward: "+40 XP + Legendary badge" },
];

const TABS = [
  { key: "streak", label: "Streak" },
  { key: "badges", label: "Badges" },
  { key: "challenges", label: "Challenges" },
  { key: "leaderboard", label: "Leaderboard" },
];

function StreakTab({ profile }) {
  const current = profile?.currentStreak ?? 0;
  const longest = profile?.longestStreak ?? 0;

  return (
    <div className="gamif-tab-content">
      <div className="gamif-streak-grid">
        <div className="gamif-streak-card">
          <strong className="gamif-streak-card__value">{current}</strong>
          <span className="gamif-streak-card__label">Current streak</span>
          <span className="gamif-streak-card__sub">consecutive days</span>
        </div>
        <div className="gamif-streak-card">
          <strong className="gamif-streak-card__value">{longest}</strong>
          <span className="gamif-streak-card__label">Longest streak</span>
          <span className="gamif-streak-card__sub">personal record</span>
        </div>
      </div>

      <h3 className="gamif-section-title">Milestones</h3>
      <div className="gamif-milestones">
        {STREAK_MILESTONES.map((m) => (
          <div key={m.days} className={`gamif-milestone ${current >= m.days ? "is-reached" : ""}`}>
            <strong>{m.days} days</strong>
            <span>{m.reward}</span>
          </div>
        ))}
      </div>

      <p className="gamif-muted">
        Complete sessions, join projects, or give endorsements every day to build your streak.
        You have one streak shield per month — it protects against one missed day.
      </p>
    </div>
  );
}

function BadgesTab({ profile }) {
  const earnedKeys = new Set((profile?.badges ?? []).map((b) => b.key));
  const categories = [...new Set(BADGE_CATALOG.map((b) => b.category))];
  const earnedCount = BADGE_CATALOG.filter((b) => earnedKeys.has(b.key)).length;

  return (
    <div className="gamif-tab-content">
      <p className="gamif-badge-count">
        <strong>{earnedCount}</strong> / {BADGE_CATALOG.length} badges earned
      </p>

      {categories.map((cat) => (
        <div key={cat} className="gamif-badge-group">
          <h3
            className="gamif-badge-group__title"
            style={{ "--cat-color": BADGE_CATEGORY_COLOR[cat] }}
          >
            {cat}
          </h3>
          <div className="gamif-badge-grid">
            {BADGE_CATALOG.filter((b) => b.category === cat).map((badge) => {
              const earned = earnedKeys.has(badge.key);
              return (
                <div
                  key={badge.key}
                  className={`gamif-badge-card ${earned ? "is-earned" : "is-locked"}`}
                >
                  <div
                    className="gamif-badge-card__icon"
                    style={{ "--cat-color": BADGE_CATEGORY_COLOR[cat] }}
                  >
                    {badge.label.slice(0, 2).toUpperCase()}
                  </div>
                  <strong className="gamif-badge-card__name">{badge.label}</strong>
                  <p className="gamif-badge-card__desc">{badge.description}</p>
                  <span className={`gamif-badge-card__pill ${earned ? "" : "is-locked"}`}>
                    {earned ? "Earned" : "Locked"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ChallengesTab({ challenges }) {
  const [selected, setSelected] = useState(null);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selected) return;
    setIsBusy(true);
    setSubmitError("");
    setSuccessMsg("");
    try {
      await challengeApi.submit(selected.challengeId, { submissionUrl, notes });
      setSuccessMsg(`Entry submitted for "${selected.title}". You earned +${selected.participationXp} XP!`);
      setSelected(null);
      setSubmissionUrl("");
      setNotes("");
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsBusy(false);
    }
  }

  if (challenges.length === 0) {
    return (
      <div className="gamif-tab-content">
        <p className="gamif-muted">No active challenges right now. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="gamif-tab-content">
      {successMsg ? <p className="gamif-success">{successMsg}</p> : null}

      <div className="gamif-challenge-list">
        {challenges.map((ch) => (
          <div key={ch.challengeId} className="gamif-challenge-card">
            <div className="gamif-challenge-card__head">
              <div>
                <strong className="gamif-challenge-card__title">{ch.title}</strong>
                <span className="gamif-challenge-card__type">
                  {String(ch.type ?? "").replace(/_/g, " ")}
                </span>
              </div>
              <div className="gamif-challenge-card__xp">
                <span>+{ch.participationXp ?? 20} XP participation</span>
                {(ch.winnerXp ?? 0) > 0 ? (
                  <span className="gamif-challenge-card__winner-xp">
                    +{ch.winnerXp} XP winner
                  </span>
                ) : null}
              </div>
            </div>

            <p className="gamif-challenge-card__desc">{ch.description}</p>

            <div className="gamif-challenge-card__footer">
              {ch.endDate ? (
                <span className="gamif-muted">
                  Ends {new Date(ch.endDate).toLocaleDateString()}
                </span>
              ) : (
                <span />
              )}
              <button
                type="button"
                className="gamif-btn"
                onClick={() => {
                  setSelected(ch);
                  setSubmitError("");
                  setSuccessMsg("");
                }}
              >
                Submit entry
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected ? (
        <div className="gamif-submit-panel">
          <h3>Submit entry — {selected.title}</h3>
          {submitError ? <p className="gamif-error">{submitError}</p> : null}
          <form onSubmit={handleSubmit} className="gamif-submit-form">
            <label className="gamif-field">
              <span>Submission URL</span>
              <input
                type="url"
                className="gamif-input"
                placeholder="https://..."
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
                required
              />
            </label>
            <label className="gamif-field">
              <span>Notes (optional)</span>
              <textarea
                className="gamif-input"
                rows={3}
                placeholder="Describe your submission..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
            <div className="gamif-submit-form__actions">
              <button
                type="button"
                className="gamif-btn gamif-btn--ghost"
                onClick={() => setSelected(null)}
                disabled={isBusy}
              >
                Cancel
              </button>
              <button type="submit" className="gamif-btn" disabled={isBusy}>
                {isBusy ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function LeaderboardTab({ entries }) {
  if (entries.length === 0) {
    return (
      <div className="gamif-tab-content">
        <p className="gamif-muted">
          No leaderboard data yet. Earn XP this week to appear here!
        </p>
      </div>
    );
  }

  return (
    <div className="gamif-tab-content">
      <p className="gamif-muted">
        Weekly XP ranking — resets every Monday. Scoped to your level tier.
      </p>
      <div className="gamif-leaderboard">
        {entries.map((entry) => (
          <div
            key={entry.userId}
            className={`gamif-leaderboard-row ${entry.isCurrentUser ? "is-me" : ""}`}
          >
            <span className="gamif-leaderboard-row__rank">#{entry.rank}</span>
            <div className="gamif-leaderboard-row__user">
              <strong>{entry.displayName ?? "Member"}</strong>
              <span>Level {entry.level} — {entry.levelTitle}</span>
            </div>
            <span className="gamif-leaderboard-row__xp">
              {entry.weeklyXp} XP
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Gamification() {
  const [activeTab, setActiveTab] = useState("streak");
  const [profile, setProfile] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const [profileRes, challengesRes, leaderboardRes] = await Promise.allSettled([
          dashboardApi.getProfile(),
          challengeApi.list({ status: "ACTIVE" }),
          leaderboardApi.getWeeklyXp(),
        ]);

        if (!isActive) return;

        if (profileRes.status === "fulfilled") setProfile(profileRes.value);
        if (challengesRes.status === "fulfilled")
          setChallenges(Array.isArray(challengesRes.value) ? challengesRes.value : []);
        if (leaderboardRes.status === "fulfilled")
          setLeaderboard(Array.isArray(leaderboardRes.value) ? leaderboardRes.value : []);
      } catch (err) {
        if (!isActive) return;
        setError(err.message);
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    load();
    return () => { isActive = false; };
  }, []);

  return (
    <ViewFrame>
      <section className="gamif">
        <div className="gamif-hero">
          <h1>Gamification</h1>
          <p>Track your streaks, collect badges, compete in challenges, and climb the leaderboard.</p>
        </div>

        {error ? <p className="gamif-error">{error}</p> : null}

        {isLoading ? (
          <p className="gamif-muted">Loading...</p>
        ) : (
          <>
            <nav className="gamif-tabs" aria-label="Gamification sections">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`gamif-tab ${activeTab === tab.key ? "is-active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {activeTab === "streak" && <StreakTab profile={profile} />}
            {activeTab === "badges" && <BadgesTab profile={profile} />}
            {activeTab === "challenges" && <ChallengesTab challenges={challenges} />}
            {activeTab === "leaderboard" && <LeaderboardTab entries={leaderboard} />}
          </>
        )}
      </section>
    </ViewFrame>
  );
}

export default Gamification;
