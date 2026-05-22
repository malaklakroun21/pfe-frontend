import { useEffect, useState } from "react";
import ViewFrame from "../../Dashboard/Layout/ViewFrame/ViewFrame.jsx";
import AdminPageHeader from "../AdminPageHeader.jsx";
import { mentoringRequestApi } from "../../../api/client.js";
import ThemedSelect from "../../shared/ThemedSelect/ThemedSelect.jsx";
import "../../Dashboard/Validation/Validation.css";
import "../adminUi.css";

export default function AdminMentoringRequests() {
  const [inbox, setInbox] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [actionError, setActionError] = useState("");
  const [activeRequestId, setActiveRequestId] = useState("");
  const [approvalScore, setApprovalScore] = useState("75");
  const [approvalFeedback, setApprovalFeedback] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const loadInbox = async (nextStatusFilter = statusFilter) => {
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await mentoringRequestApi.listRequests(
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
        const data = await mentoringRequestApi.listRequests(
          statusFilter === "ALL" ? {} : { status: statusFilter },
        );
        if (!isActive) return;
        setInbox(data);
        setHasError(false);
      } catch {
        if (!isActive) return;
        setHasError(true);
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    fetchInbox();
    return () => { isActive = false; };
  }, [statusFilter]);

  const handleApprove = async (requestId) => {
    setActionError("");
    setIsSubmitting(true);
    try {
      await mentoringRequestApi.approveRequest(requestId, {
        approvalScore: Number(approvalScore),
        approvalFeedback,
      });
      setActiveRequestId("");
      setApprovalFeedback("");
      setIsRejecting(false);
      await loadInbox();
    } catch (error) {
      setActionError(error.message || "Unable to approve this request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (requestId) => {
    setActionError("");
    setIsSubmitting(true);
    try {
      await mentoringRequestApi.rejectRequest(requestId, { rejectionReason });
      setActiveRequestId("");
      setRejectionReason("");
      setIsRejecting(false);
      await loadInbox();
    } catch (error) {
      setActionError(error.message || "Unable to reject this request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <ViewFrame header={<AdminPageHeader title="Mentoring Requests" />}>
        <article className="validation-page__card validation-page__mentor-inbox validation-page__mentor-inbox--loading">
          <p>Loading mentoring requests...</p>
        </article>
      </ViewFrame>
    );
  }

  if (hasError) {
    return (
      <ViewFrame header={<AdminPageHeader title="Mentoring Requests" />}>
        <article className="validation-page__card validation-page__feedback">
          <h3>Unable to load mentoring requests</h3>
          <p>Check your connection and try again.</p>
        </article>
      </ViewFrame>
    );
  }

  const visibleRequests = inbox?.requests ?? [];

  return (
    <ViewFrame header={<AdminPageHeader title="Mentoring Requests" />}>
      <article className="validation-page__card validation-page__mentor-inbox">
        <h3 className="validation-page__mentor-title">Mentoring request inbox</h3>
        <p className="validation-page__mentor-description">
          Review learner requests to become mentors. Assign a score on approval — the learner's
          role will be promoted to Mentor automatically.
        </p>

        <div className="validation-page__mentor-toolbar">
          <div className="validation-page__mentor-summary">
            <span>{inbox?.summary?.pending ?? 0} pending</span>
            <span>{inbox?.summary?.approved ?? 0} approved</span>
            <span>{inbox?.summary?.rejected ?? 0} rejected</span>
          </div>

          <label className="validation-page__mentor-filter">
            <span>Filter</span>
            <ThemedSelect
              value={statusFilter}
              options={[
                { value: "ALL", label: "All" },
                { value: "PENDING", label: "Pending" },
                { value: "APPROVED", label: "Approved" },
                { value: "REJECTED", label: "Rejected" },
              ]}
              onChange={(nextValue) => {
                setIsLoading(true);
                setHasError(false);
                setStatusFilter(nextValue);
              }}
            />
          </label>
        </div>

        {actionError ? (
          <p className="validation-page__mentor-error">{actionError}</p>
        ) : null}

        {visibleRequests.length === 0 ? (
          <div className="validation-page__wizard-empty-state">
            <strong>No requests found.</strong>
            <p>Learners who have a validated skill will appear here when they apply for mentoring status.</p>
          </div>
        ) : null}

        <div className="validation-page__mentor-list">
          {visibleRequests.map((request) => {
            const isPending = request.status === "PENDING";
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
                  {request.learner?.email ? ` · ${request.learner.email}` : ""}
                </p>

                {request.portfolioLink ? (
                  <p className="validation-page__mentor-note">
                    <strong>Portfolio:</strong>{" "}
                    <a href={request.portfolioLink} target="_blank" rel="noopener noreferrer">
                      {request.portfolioLink}
                    </a>
                  </p>
                ) : null}

                {request.proofStoredName ? (
                  <p className="validation-page__mentor-note">
                    <strong>Proof file:</strong>{" "}
                    <a
                      href={`/uploads/validation-proofs/${request.proofStoredName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={request.proofFileName}
                    >
                      {request.proofFileName}
                    </a>
                  </p>
                ) : null}

                {request.requestNote ? (
                  <p className="validation-page__mentor-note">
                    <strong>Learner note:</strong> {request.requestNote}
                  </p>
                ) : null}

                {request.status === "APPROVED" ? (
                  <p className="validation-page__mentor-result validation-page__mentor-result--accepted">
                    Score: {request.approvalScore}/100
                    {request.approvalFeedback ? ` · ${request.approvalFeedback}` : ""}
                  </p>
                ) : null}

                {request.status === "REJECTED" ? (
                  <p className="validation-page__mentor-result validation-page__mentor-result--rejected">
                    {request.rejectionReason}
                  </p>
                ) : null}

                {isPending ? (
                  <div className="validation-page__mentor-actions">
                    {isActive ? (
                      <div className="validation-page__mentor-form">
                        <label className="validation-page__wizard-field">
                          <span>Approval score (0–100)</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={approvalScore}
                            onChange={(e) => setApprovalScore(e.target.value)}
                          />
                        </label>

                        <label className="validation-page__wizard-field">
                          <span>Feedback (optional)</span>
                          <textarea
                            rows="3"
                            value={approvalFeedback}
                            onChange={(e) => setApprovalFeedback(e.target.value)}
                            placeholder="Explain why you approved this mentoring request..."
                          />
                        </label>

                        {isRejecting ? (
                          <label className="validation-page__wizard-field">
                            <span>Rejection reason</span>
                            <textarea
                              rows="2"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Optional reason if you reject this request"
                            />
                          </label>
                        ) : null}

                        <div className="validation-page__mentor-form-actions">
                          {isRejecting ? (
                            <>
                              <button
                                type="button"
                                className="validation-page__wizard-secondary"
                                onClick={() => { setIsRejecting(false); setRejectionReason(""); }}
                                disabled={isSubmitting}
                              >
                                Cancel reject
                              </button>
                              <button
                                type="button"
                                className="validation-page__wizard-secondary"
                                onClick={() => handleReject(request.requestId)}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? "Saving..." : "Confirm reject"}
                              </button>
                              <button
                                type="button"
                                className="validation-page__wizard-primary"
                                onClick={() => { setIsRejecting(false); setRejectionReason(""); handleApprove(request.requestId); }}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? "Saving..." : "Approve & promote"}
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="validation-page__wizard-secondary"
                                onClick={() => { setActiveRequestId(""); setRejectionReason(""); }}
                                disabled={isSubmitting}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="validation-page__wizard-secondary"
                                onClick={() => setIsRejecting(true)}
                                disabled={isSubmitting}
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                className="validation-page__wizard-primary"
                                onClick={() => handleApprove(request.requestId)}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? "Saving..." : "Approve & promote"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="validation-page__wizard-primary"
                        onClick={() => {
                          setActiveRequestId(request.requestId);
                          setApprovalScore("75");
                          setApprovalFeedback("");
                          setRejectionReason("");
                          setIsRejecting(false);
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
    </ViewFrame>
  );
}
