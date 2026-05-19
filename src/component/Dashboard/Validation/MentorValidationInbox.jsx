import { useEffect, useState } from "react";
import { validationApi } from "../../../api/client.js";
import ThemedSelect from "../../shared/ThemedSelect/ThemedSelect.jsx";

export default function MentorValidationInbox() {
  const [inbox, setInbox] = useState(null);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [actionError, setActionError] = useState("");
  const [activeRequestId, setActiveRequestId] = useState("");
  const [validationScore, setValidationScore] = useState("75");
  const [validationFeedback, setValidationFeedback] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadInbox = async (nextStatusFilter = statusFilter) => {
    setIsLoading(true);
    setHasError(false);

    try {
      const data = await validationApi.listMentorRequests(
        nextStatusFilter === "ALL" ? {} : { status: nextStatusFilter },
      );
      setInbox(data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    async function fetchInbox() {
      try {
        const data = await validationApi.listMentorRequests(
          statusFilter === "ALL" ? {} : { status: statusFilter },
        );

        if (!isActive) {
          return;
        }

        setInbox(data);
        setHasError(false);
      } catch {
        if (!isActive) {
          return;
        }

        setHasError(true);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    fetchInbox();

    return () => {
      isActive = false;
    };
  }, [statusFilter]);

  const handleAccept = async (requestId) => {
    setActionError("");
    setIsSubmitting(true);

    try {
      await validationApi.acceptRequest(requestId, {
        validationScore: Number(validationScore),
        validationFeedback,
      });
      setActiveRequestId("");
      setValidationFeedback("");
      await loadInbox();
    } catch (error) {
      setActionError(error.message || "Unable to accept this request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (requestId) => {
    setActionError("");
    setIsSubmitting(true);

    try {
      await validationApi.rejectRequest(requestId, {
        rejectionReason,
      });
      setActiveRequestId("");
      setRejectionReason("");
      await loadInbox();
    } catch (error) {
      setActionError(error.message || "Unable to reject this request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <article className="validation-page__card validation-page__mentor-inbox validation-page__mentor-inbox--loading">
        <p>Loading validation requests...</p>
      </article>
    );
  }

  if (hasError) {
    return (
      <article className="validation-page__card validation-page__feedback">
        <h3>Unable to load mentor requests</h3>
        <p>Check your connection and try again.</p>
      </article>
    );
  }

  const visibleRequests = inbox?.requests ?? [];
  const showPendingEmptyState =
    statusFilter === "PENDING" &&
    visibleRequests.filter((request) => ["PENDING", "IN_REVIEW"].includes(request.status))
      .length === 0;

  return (
    <article className="validation-page__card validation-page__mentor-inbox">
      <h3 className="validation-page__mentor-title">Mentor validation inbox</h3>
      <p className="validation-page__mentor-description">
        Review learner requests, assign a validation score on accept, and control whether they can
        teach each skill.
      </p>

      <div className="validation-page__mentor-toolbar">
        <div className="validation-page__mentor-summary">
          <span>{inbox?.summary?.pending ?? 0} pending</span>
          <span>{inbox?.summary?.validated ?? 0} validated</span>
          <span>{inbox?.summary?.rejected ?? 0} rejected</span>
        </div>

        <label className="validation-page__mentor-filter">
          <span>Filter</span>
          <ThemedSelect
            value={statusFilter}
            options={[
              { value: "PENDING", label: "Pending" },
              { value: "VALIDATED", label: "Validated" },
              { value: "REJECTED", label: "Rejected" },
              { value: "ALL", label: "All" },
            ]}
            onChange={(nextValue) => {
              setIsLoading(true);
              setHasError(false);
              setStatusFilter(nextValue);
            }}
          />
        </label>
      </div>

      {actionError ? <p className="validation-page__mentor-error">{actionError}</p> : null}

      {showPendingEmptyState ? (
        <div className="validation-page__wizard-empty-state">
          <strong>No pending requests right now.</strong>
          <p>Learners will appear here when they ask you to validate a skill.</p>
        </div>
      ) : null}

      <div className="validation-page__mentor-list">
        {visibleRequests.map((request) => {
          const isOpen = ["PENDING", "IN_REVIEW"].includes(request.status);
          const isActive = activeRequestId === request.requestId;

          return (
            <div key={request.requestId} className="validation-page__mentor-request">
              <div className="validation-page__mentor-request-head">
                <div>
                  <strong>{request.learner?.fullName}</strong>
                  <span>{request.skill?.name}</span>
                </div>
                <span
                  className={`validation-page__mentor-status validation-page__mentor-status--${request.status.toLowerCase()}`}
                >
                  {request.status}
                </span>
              </div>

              <p className="validation-page__mentor-meta">
                Submitted {new Date(request.submittedAt).toLocaleString()}
                {request.evidenceCount
                  ? ` · ${request.evidenceCount} evidence item${request.evidenceCount === 1 ? "" : "s"}`
                  : ""}
              </p>

              {request.requestNote ? (
                <p className="validation-page__mentor-note">
                  <strong>Learner note:</strong> {request.requestNote}
                </p>
              ) : null}

              {request.status === "VALIDATED" ? (
                <p className="validation-page__mentor-result validation-page__mentor-result--accepted">
                  Score: {request.validationScore}/100
                  {request.validationFeedback ? ` · ${request.validationFeedback}` : ""}
                </p>
              ) : null}

              {request.status === "REJECTED" ? (
                <p className="validation-page__mentor-result validation-page__mentor-result--rejected">
                  {request.rejectionReason}
                </p>
              ) : null}

              {isOpen ? (
                <div className="validation-page__mentor-actions">
                  {isActive ? (
                    <div className="validation-page__mentor-form">
                      <label className="validation-page__wizard-field">
                        <span>Validation score (0-100)</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={validationScore}
                          onChange={(event) => setValidationScore(event.target.value)}
                        />
                      </label>

                      <label className="validation-page__wizard-field">
                        <span>Feedback (optional)</span>
                        <textarea
                          rows="3"
                          value={validationFeedback}
                          onChange={(event) => setValidationFeedback(event.target.value)}
                          placeholder="Explain why you validated this skill..."
                        />
                      </label>

                      <label className="validation-page__wizard-field">
                        <span>Rejection reason (only used if you reject)</span>
                        <textarea
                          rows="2"
                          value={rejectionReason}
                          onChange={(event) => setRejectionReason(event.target.value)}
                          placeholder="Optional reason if you reject this request"
                        />
                      </label>

                      <div className="validation-page__mentor-form-actions">
                        <button
                          type="button"
                          className="validation-page__wizard-secondary"
                          onClick={() => setActiveRequestId("")}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="validation-page__wizard-secondary"
                          onClick={() => handleReject(request.requestId)}
                          disabled={isSubmitting}
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          className="validation-page__wizard-primary"
                          onClick={() => handleAccept(request.requestId)}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Saving..." : "Accept & validate"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="validation-page__wizard-primary"
                      onClick={() => {
                        setActiveRequestId(request.requestId);
                        setValidationScore("75");
                        setValidationFeedback("");
                        setRejectionReason("");
                      }}
                    >
                      Review request
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </article>
  );
}
