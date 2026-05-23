import { useEffect, useState } from "react";
import { dashboardApi, mentorApplicationApi } from "../../../api/client.js";
import ThemedSelect from "../../shared/ThemedSelect/ThemedSelect.jsx";
import "./Validation.css";

function ValidationBadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3.75 17.5 6v6.1c0 3.12-2.08 5.98-5.5 8.15-3.42-2.17-5.5-5.03-5.5-8.15V6L12 3.75Z" />
      <path d="m9.5 11.75 1.6 1.65 3-3.4" />
    </svg>
  );
}

function getRecommendedMentorId(mentors, selectedSkillId) {
  if (!Array.isArray(mentors) || mentors.length === 0) {
    return "";
  }

  const matchingMentor = mentors.find((mentor) => mentor.skillIds?.includes(selectedSkillId));

  return matchingMentor?.id ?? mentors[0].id;
}

function RequestValidationWizard({ requestFlow, onSubmitRequest }) {
  const steps = Array.isArray(requestFlow?.steps) ? requestFlow.steps : [];
  const skillOptions = Array.isArray(requestFlow?.skillOptions) ? requestFlow.skillOptions : [];
  const mentorOptions = Array.isArray(requestFlow?.mentorOptions) ? requestFlow.mentorOptions : [];
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [selectedMentorId, setSelectedMentorId] = useState("");
  const [customSkillName, setCustomSkillName] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [validatorNote, setValidatorNote] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const normalizedCustomSkillName = customSkillName.trim();
  const selectedSkillFromOption =
    skillOptions.find((skill) => skill.id === selectedSkillId) ?? null;
  const selectedSkillFromTypedName =
    skillOptions.find(
      (skill) => skill.label.trim().toLowerCase() === normalizedCustomSkillName.toLowerCase(),
    ) ?? null;
  const selectedSkill =
    selectedSkillFromOption ??
    (normalizedCustomSkillName
      ? (selectedSkillFromTypedName ?? {
          id: "custom-skill",
          skillId: "",
          label: normalizedCustomSkillName,
          description: "Manual validation request",
          evidenceCount: 0,
        })
      : null);
  const hasExistingSkillMatch = Boolean(selectedSkillFromTypedName || selectedSkillFromOption);
  const recommendedMentorId = getRecommendedMentorId(
    mentorOptions,
    selectedSkill?.id || ""
  );
  const recommendedMentor = mentorOptions.find((mentor) => mentor.id === recommendedMentorId) ?? null;

  const currentStep = steps[activeStepIndex] ?? steps[0] ?? null;
  const selectedMentor = mentorOptions.find((mentor) => mentor.id === selectedMentorId) ?? null;
  const selectedSkillEvidenceCount = selectedSkill?.evidenceCount ?? 0;
  const hasExistingEvidence = selectedSkillEvidenceCount > 0;
  const hasPortfolioLink = portfolioLink.trim().length > 0;

  const canContinueByStep = {
    "select-skill": Boolean(selectedSkill),
    "choose-mentor": Boolean(selectedMentorId),
    evidence: hasExistingEvidence || hasPortfolioLink || Boolean(uploadedFile),
    submit: Boolean(selectedSkill && selectedMentor),
  };

  const canContinue = currentStep ? canContinueByStep[currentStep.key] ?? true : false;
  const isLastStep = activeStepIndex === steps.length - 1;
  const primaryLabel = isLastStep
    ? isSubmitted
      ? "Request sent"
      : isSubmitting
        ? "Sending..."
        : "Submit Request"
    : "Continue";

  const handleContinue = async () => {
    if (!currentStep || !canContinue) {
      return;
    }

    if (isLastStep) {
      setSubmitError("");
      setIsSubmitting(true);

      try {
        await onSubmitRequest?.({
          selectedSkill,
          selectedMentor,
          portfolioLink,
          validatorNote,
          uploadedFile,
        });

        setIsSubmitted(true);
      } catch (error) {
        setSubmitError(error.message || "Unable to submit validation request.");
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    setActiveStepIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  const handleBack = () => {
    if (isSubmitted) {
      setIsSubmitted(false);
    }

    setActiveStepIndex((current) => Math.max(current - 1, 0));
  };

  const renderStepContent = () => {
    if (!currentStep) {
      return null;
    }

    switch (currentStep.key) {
      case "select-skill":
        return (
          <div className="validation-page__wizard-body">
            <div className="validation-page__wizard-copy">
              <h4>Select or type the skill you want to validate</h4>
            </div>

            {skillOptions.length > 0 ? (
              <label className="validation-page__wizard-field">
                <span>Skill list</span>
                <ThemedSelect
                  value={selectedSkillId}
                  options={[
                    { value: "", label: "Choose one skill" },
                    ...skillOptions.map((skill) => ({
                      value: skill.id,
                      label: skill.label,
                    })),
                  ]}
                  onChange={(nextValue) => {
                    setSelectedSkillId(nextValue);
                    setCustomSkillName("");
                    setSelectedMentorId("");
                  }}
                />
              </label>
            ) : null}


            {selectedSkill ? (
              <div
                className={`validation-page__skill-selection-feedback ${
                  hasExistingSkillMatch
                    ? "validation-page__skill-selection-feedback--matched"
                    : "validation-page__skill-selection-feedback--custom"
                }`}
              >
                <strong>{selectedSkill.label}</strong>
                {!hasExistingSkillMatch && (
                  <p>This skill is not in the current app list yet. It will be created on your profile and sent manually for validation.</p>
                )}
              </div>
            ) : null}
          </div>
        );
      case "choose-mentor": {
        const skillId = selectedSkill?.id;
        const isCustomSkill = !skillId || skillId === "custom-skill";
        const generalMentors = mentorOptions.filter(
          (m) => !Array.isArray(m.skillIds) || m.skillIds.length === 0
        );
        const exactMentors = !isCustomSkill
          ? mentorOptions.filter((m) => Array.isArray(m.skillIds) && m.skillIds.includes(skillId))
          : [];
        const combined = [...new Map([...exactMentors, ...generalMentors].map((m) => [m.id, m])).values()];
        const displayMentors = combined.length > 0 ? combined : mentorOptions;
        const isFiltered = combined.length > 0 && combined.length < mentorOptions.length;

        return (
          <div className="validation-page__wizard-body validation-page__wizard-body--mentor">
            <div className="validation-page__wizard-copy">
              <h4>Choose a mentor to validate your skill</h4>
            </div>

            {displayMentors.length > 0 ? (
              <>
                {isFiltered && (
                  <p className="validation-page__wizard-helper">
                    Showing mentors specialized in <strong>{selectedSkill.label}</strong>
                  </p>
                )}

                <label className="validation-page__wizard-field">
                  <span>Mentor list</span>
                  <ThemedSelect
                    value={selectedMentorId}
                    options={[
                      { value: "", label: "Choose one mentor" },
                      ...displayMentors.map((mentor) => ({
                        value: mentor.id,
                        label: mentor.name,
                        description: mentor.specialty,
                      })),
                    ]}
                    onChange={(nextValue) => setSelectedMentorId(nextValue)}
                  />
                </label>

                {recommendedMentor && !selectedMentor ? (
                  <p className="validation-page__wizard-helper">
                    Recommended mentor: <strong>{recommendedMentor.name}</strong>
                  </p>
                ) : null}

                {selectedMentor ? (
                  <div className="validation-page__skill-selection-feedback validation-page__skill-selection-feedback--matched">
                    <strong>{selectedMentor.name}</strong>
                    <p>{selectedMentor.specialty}</p>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="validation-page__wizard-empty-state">
                <strong>No mentor is available right now.</strong>
                <p>Add at least one active mentor account before sending a validation request.</p>
              </div>
            )}
          </div>
        );
      }
      case "evidence":
        return (
          <div className="validation-page__wizard-body">
            <div className="validation-page__upload-section">
              <strong className="validation-page__upload-title">Add proof of work</strong>

            </div>

            <div className="validation-page__portfolio-section">
              <label className="validation-page__wizard-field">
                <span>{hasExistingEvidence ? "Portfolio link (optional)" : "Portfolio link"}</span>
                <input
                  type="url"
                  placeholder="https://example.com/portfolio"
                  value={portfolioLink}
                  onChange={(event) => setPortfolioLink(event.target.value)}
                />
              </label>

              <p className="validation-page__evidence-note">
                Only saved links are sent with the request for now.
              </p>

              <div className="validation-page__wizard-field">
                <span>Upload a file (optional)</span>
                <label className="validation-page__file-upload">
                  <span className="validation-page__file-text">
                    {uploadedFile ? uploadedFile.name : "No file chosen"}
                  </span>
                  <span className="validation-page__file-btn">Choose file</span>
                  <input
                    type="file"
                    style={{ display: "none" }}
                    onChange={(event) => setUploadedFile(event.target.files[0] || null)}
                  />
                </label>
              </div>
            </div>

          </div>
        );
      case "submit":
        return (
          <div className="validation-page__wizard-body validation-page__wizard-body--submit">
            <label className="validation-page__wizard-field validation-page__wizard-field--submit">
              <span>Note to the validator</span>
              <textarea
                rows="6"
                placeholder="Tell the validator about your experience and why you're requesting validation for this skill..."
                value={validatorNote}
                onChange={(event) => setValidatorNote(event.target.value)}
              />
            </label>

            <div className="validation-page__submit-summary">
              <h4>Summary</h4>

              <div className="validation-page__submit-summary-copy">
                <p>
                  <strong>Skill:</strong> {selectedSkill?.label ?? "Not selected"}
                </p>
                <p>
                  <strong>Validator:</strong> {selectedMentor?.name ?? "To be selected"}
                </p>
                {portfolioLink ? (
                  <p>
                    <strong>Portfolio:</strong> {portfolioLink}
                  </p>
                ) : null}
                {hasExistingEvidence ? (
                  <p>
                    <strong>Saved evidence:</strong> {selectedSkillEvidenceCount} linked item
                    {selectedSkillEvidenceCount === 1 ? "" : "s"}
                  </p>
                ) : null}
                {validatorNote.trim() && !isSubmitted ? (
                  <p>
                    <strong>Note:</strong> {validatorNote}
                  </p>
                ) : null}
              </div>

              {isSubmitted ? (
                <div className="validation-page__submit-success">
                  Request submitted successfully.
                </div>
              ) : null}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <article className="validation-page__card validation-page__wizard">
      <h3 className="validation-page__wizard-title">{requestFlow.title}</h3>

      <div className="validation-page__wizard-steps" aria-label="Validation request steps">
        {steps.map((step, index) => {
          const isActive = index === activeStepIndex;
          const isComplete = index < activeStepIndex || (isSubmitted && index === steps.length - 1);

          return (
            <div
              key={step.key}
              className={`validation-page__wizard-step ${
                isActive ? "is-active" : isComplete ? "is-complete" : ""
              }`}
            >
              <div className="validation-page__wizard-step-topline">
                <span className="validation-page__wizard-step-badge">{index + 1}</span>
                {index < steps.length - 1 ? (
                  <span
                    className={`validation-page__wizard-step-line ${
                      index < activeStepIndex ? "is-filled" : ""
                    }`}
                    aria-hidden="true"
                  />
                ) : null}
              </div>
              <span className="validation-page__wizard-step-label">{step.label}</span>
            </div>
          );
        })}
      </div>

      {renderStepContent()}

      <div className="validation-page__wizard-footer">
        {submitError ? <p>{submitError}</p> : null}

        <button
          type="button"
          className="validation-page__wizard-secondary"
          onClick={handleBack}
          disabled={activeStepIndex === 0 || isSubmitting}
        >
          Back
        </button>

        <button
          type="button"
          className="validation-page__wizard-primary"
          onClick={handleContinue}
          disabled={!canContinue || isSubmitted || isSubmitting}
        >
          {primaryLabel}
        </button>
      </div>
    </article>
  );
}

function LearnerSkillStatuses({ skills = [] }) {
  if (!skills.length) {
    return null;
  }

  return (
    <article className="validation-page__card validation-page__learner-statuses">
      <h3>Your skill validation status</h3>
      <ul className="validation-page__learner-status-list">
        {skills.map((skill) => (
          <li key={skill.id} className={`validation-page__learner-status-item is-${skill.status}`}>
            <div>
              <strong>{skill.name}</strong>
              <span>{skill.level}</span>
            </div>
            <div className="validation-page__learner-status-meta">
              {skill.status === "validated" ? (
                <span className="validation-page__learner-status-pill validation-page__learner-status-pill--validated">
                  Validated · can teach · score {skill.validationScore ?? 0}/100
                </span>
              ) : null}
              {skill.status === "rejected" ? (
                <span className="validation-page__learner-status-pill validation-page__learner-status-pill--rejected">
                  Rejected · cannot teach yet
                </span>
              ) : null}
              {skill.status === "in_review" ? (
                <span className="validation-page__learner-status-pill validation-page__learner-status-pill--pending">
                  Waiting for mentor review
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function MentoringRequestForm({ validatedSkills }) {
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const hasEligibleSkills = Array.isArray(validatedSkills) && validatedSkills.length > 0;
  const canSubmit = hasEligibleSkills && Boolean(selectedSkillId) && !isSubmitting && !isSubmitted;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitError("");
    setIsSubmitting(true);
    try {
      await mentorApplicationApi.submit({ skillId: selectedSkillId });
      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(error.message || "Unable to submit application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="validation-page__card validation-page__wizard">
      <h3 className="validation-page__wizard-title">Request Mentoring Status</h3>

      <div className="validation-page__wizard-body">
        <div className="validation-page__wizard-copy">
          <h4>Apply to become a mentor for one of your validated skills</h4>
          <p style={{ fontSize: "0.875rem", opacity: 0.75 }}>
            Only validated skills are eligible. An admin will review your request.
          </p>
        </div>

        {validatedSkills.length === 0 ? (
          <div className="validation-page__wizard-empty-state">
            <strong>No validated skills yet.</strong>
            <p>Complete a skill validation request above first, then come back here to apply for mentoring status.</p>
          </div>
        ) : (
          <label className="validation-page__wizard-field">
            <span>Validated skill</span>
            <ThemedSelect
              value={selectedSkillId}
              options={[
                { value: "", label: "Choose a validated skill" },
                ...validatedSkills.map((skill) => ({
                  value: skill.skillId,
                  label: skill.label,
                })),
              ]}
              onChange={(val) => setSelectedSkillId(val)}
            />
          </label>
        )}
      </div>

      {hasEligibleSkills ? (
        <div className="validation-page__wizard-footer">
          {submitError ? <p style={{ color: "var(--color-error, #e05)" }}>{submitError}</p> : null}
          {isSubmitted ? (
            <p style={{ color: "var(--color-success, #0a0)" }}>
              Application submitted. An admin will review it shortly.
            </p>
          ) : null}

          <button
            type="button"
            className="validation-page__wizard-primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {isSubmitting ? "Sending..." : isSubmitted ? "Application sent" : "Apply for Mentor Status"}
          </button>
        </div>
      ) : null}
    </article>
  );
}

function Validation() {
  const [pageData, setPageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadValidationPage() {
      setIsLoading(true);
      setHasError(false);
      try {
        const data = await dashboardApi.getValidationData();
        if (!isActive) return;
        setPageData(data);
      } catch {
        if (!isActive) return;
        setHasError(true);
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadValidationPage();
    return () => { isActive = false; };
  }, []);

  if (isLoading) {
    return (
      <section className="validation-page validation-page--loading" aria-busy="true">
        <article className="validation-page__card validation-page__card--intro">
          <div className="validation-page__loading-block validation-page__loading-block--icon" />
          <div className="validation-page__loading-copy">
            <span className="validation-page__loading-line validation-page__loading-line--title" />
            <span className="validation-page__loading-line validation-page__loading-line--body" />
            <span className="validation-page__loading-line validation-page__loading-line--body" />
            <span className="validation-page__loading-line validation-page__loading-line--short" />
          </div>
        </article>
      </section>
    );
  }

  if (hasError || !pageData) {
    return (
      <section className="validation-page">
        <article className="validation-page__card validation-page__feedback">
          <h2>Unable to load validation data</h2>
          <p>Check the data source connection, then try again.</p>
        </article>
      </section>
    );
  }

  const validatedSkills = (pageData.requestFlow.skillOptions || []).filter(
    (skill) => skill.validationStatus === "VALIDATED" && skill.skillId
  );

  return (
    <section className="validation-page">
      <article className="validation-page__card validation-page__card--intro">
        <div className="validation-page__intro-icon">
          <ValidationBadgeIcon />
        </div>
        <div className="validation-page__intro-copy">
          <h2>{pageData.intro.title}</h2>
          <p>{pageData.intro.description}</p>
          <ul className="validation-page__benefits">
            {pageData.intro.benefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
        </div>
      </article>

      <RequestValidationWizard
        requestFlow={pageData.requestFlow}
        onSubmitRequest={async ({ selectedSkill, selectedMentor, portfolioLink, validatorNote, uploadedFile }) => {
          const formData = new FormData();
          formData.append("skillName", selectedSkill?.label || "");
          formData.append("mentorUserId", selectedMentor?.id || "");
          formData.append("portfolioLink", portfolioLink || "");
          formData.append("note", validatorNote || "");
          if (selectedSkill?.skillId) formData.append("skillId", selectedSkill.skillId);
          if (uploadedFile) formData.append("proofFile", uploadedFile);
          await dashboardApi.createValidationRequest(formData);
        }}
      />

      <MentoringRequestForm validatedSkills={validatedSkills} />
    </section>
  );
}

export default Validation;
