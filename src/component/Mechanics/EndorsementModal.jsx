import { useState } from "react";
import "./Mechanics.css";

export default function EndorsementModal({
  isOpen,
  targetUserId,
  sessionId,
  onClose,
  onSubmit,
  isSubmitting = false,
}) {
  const [message, setMessage] = useState("");

  if (!isOpen) {
    return null;
  }

  return (
    <div className="mechanics-endorsement-modal" role="dialog" aria-modal="true">
      <h4>Endorse collaborator</h4>
      <p className="mechanics-skill-card__meta">
        Endorsements are only allowed after a completed session or project together.
      </p>
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Optional message"
        maxLength={500}
      />
      <div className="mechanics-session-confirm__actions">
        <button type="button" className="mechanics-session-confirm__button" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="mechanics-session-confirm__button"
          disabled={isSubmitting}
          onClick={() =>
            onSubmit?.({
              toUserId: targetUserId,
              sessionId,
              message,
            })
          }
        >
          {isSubmitting ? "Sending..." : "Submit endorsement"}
        </button>
      </div>
    </div>
  );
}
