import { useEffect, useState } from "react";
import { fetchValidationPageData } from "../dashboardPreviewApi.js";
import "./Validation.css";

function ValidationBadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3.75 17.5 6v6.1c0 3.12-2.08 5.98-5.5 8.15-3.42-2.17-5.5-5.03-5.5-8.15V6L12 3.75Z" />
      <path d="m9.5 11.75 1.6 1.65 3-3.4" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 16.5V4.75" strokeLinecap="round" />
      <path d="m7.75 9 4.25-4.25L16.25 9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 14.75v2.1A2.15 2.15 0 0 0 7.15 19h9.7A2.15 2.15 0 0 0 19 16.85v-2.1" strokeLinecap="round" />
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

function RequestValidationWizard({ requestFlow }) {
  const steps = Array.isArray(requestFlow?.steps) ? requestFlow.steps : [];
  const skillOptions = Array.isArray(requestFlow?.skillOptions) ? requestFlow.skillOptions : [];
  const mentorOptions = Array.isArray(requestFlow?.mentorOptions) ? requestFlow.mentorOptions : [];
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [selectedSkillId, setSelectedSkillId] = useState(skillOptions[0]?.id ?? "");
  const [selectedMentorId, setSelectedMentorId] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [supportingFiles, setSupportingFiles] = useState([]);
  const [validatorNote, setValidatorNote] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!selectedSkillId && skillOptions.length > 0) {
      setSelectedSkillId(skillOptions[0].id);
    }
  }, [selectedSkillId, skillOptions]);

  useEffect(() => {
    if (mentorOptions.length === 0) {
      return;
    }

    setSelectedMentorId((current) => {
      const recommendedMentorId = getRecommendedMentorId(mentorOptions, selectedSkillId);

      if (!current) {
        return recommendedMentorId;
      }

      const stillExists = mentorOptions.some((mentor) => mentor.id === current);

      if (!stillExists) {
        return recommendedMentorId;
      }

      return current;
    });
  }, [mentorOptions, selectedSkillId]);

  const currentStep = steps[activeStepIndex] ?? steps[0] ?? null;
  const selectedSkill = skillOptions.find((skill) => skill.id === selectedSkillId) ?? null;
  const selectedMentor = mentorOptions.find((mentor) => mentor.id === selectedMentorId) ?? null;

  const canContinueByStep = {
    "select-skill": Boolean(selectedSkillId),
    "choose-mentor": Boolean(selectedMentorId),
    evidence: portfolioLink.trim().length > 0 || supportingFiles.length > 0,
    submit: Boolean(selectedSkill && selectedMentor),
  };

  const canContinue = currentStep ? canContinueByStep[currentStep.key] ?? true : false;
  const isLastStep = activeStepIndex === steps.length - 1;
  const primaryLabel = isLastStep ? (isSubmitted ? "Request sent" : "Submit Request") : "Continue";

  const handleContinue = () => {
    if (!currentStep || !canContinue) {
      return;
    }

    if (isLastStep) {
      setIsSubmitted(true);
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

  const handleSupportingFilesChange = (event) => {
    const uploadedFiles = Array.from(event.target.files ?? []);

    setSupportingFiles(uploadedFiles);
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
              <h4>Select a skill to validate</h4>
            </div>

            <div className="validation-page__wizard-option-list">
              {skillOptions.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  className={`validation-page__wizard-option ${
                    selectedSkillId === skill.id ? "is-selected" : ""
                  }`}
                  onClick={() => setSelectedSkillId(skill.id)}
                >
                  <strong>{skill.label}</strong>
                  {skill.description ? <span>{skill.description}</span> : null}
                </button>
              ))}
            </div>
          </div>
        );
      case "choose-mentor":
        return (
          <div className="validation-page__wizard-body validation-page__wizard-body--mentor">
            <div className="validation-page__wizard-copy">
              <h4>Choose a mentor to validate your skill</h4>
            </div>

            <div className="validation-page__wizard-option-list validation-page__wizard-option-list--mentor">
              {mentorOptions.map((mentor) => (
                <button
                  key={mentor.id}
                  type="button"
                  className={`validation-page__wizard-option validation-page__wizard-option--mentor ${
                    selectedMentorId === mentor.id ? "is-selected" : ""
                  }`}
                  onClick={() => setSelectedMentorId(mentor.id)}
                >
                  <div className="validation-page__mentor-main">
                    <span className="validation-page__mentor-avatar">{mentor.initials}</span>

                    <div className="validation-page__mentor-copy">
                      <strong>{mentor.name}</strong>
                      <span>{mentor.specialty}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case "evidence":
        return (
          <div className="validation-page__wizard-body">
            <div className="validation-page__upload-section">
              <strong className="validation-page__upload-title">Upload supporting evidence</strong>

              <label className="validation-page__upload-dropzone">
                <input
                  type="file"
                  multiple
                  className="validation-page__upload-input"
                  onChange={handleSupportingFilesChange}
                />

                <span className="validation-page__upload-icon">
                  <UploadIcon />
                </span>

                <span className="validation-page__upload-copy">
                  Click to upload certificates, portfolio work, or other credentials
                </span>

                <span className="validation-page__upload-note">PDF, images, or documents</span>
              </label>

              {supportingFiles.length > 0 ? (
                <div className="validation-page__upload-files">
                  {supportingFiles.map((file) => (
                    <span key={`${file.name}-${file.lastModified}`}>{file.name}</span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="validation-page__portfolio-section">
              <label className="validation-page__wizard-field">
                <span>Portfolio Links (optional)</span>
                <input
                  type="url"
                  placeholder="https://example.com/portfolio"
                  value={portfolioLink}
                  onChange={(event) => setPortfolioLink(event.target.value)}
                />
              </label>
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
                {supportingFiles.length > 0 ? (
                  <p>
                    <strong>Files:</strong> {supportingFiles.length} uploaded
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
        <button
          type="button"
          className="validation-page__wizard-secondary"
          onClick={handleBack}
          disabled={activeStepIndex === 0}
        >
          Back
        </button>

        <button
          type="button"
          className="validation-page__wizard-primary"
          onClick={handleContinue}
          disabled={!canContinue || isSubmitted}
        >
          {primaryLabel}
        </button>
      </div>
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
        const data = await fetchValidationPageData("john-doe");

        if (!isActive) {
          return;
        }

        setPageData(data);
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

    loadValidationPage();

    return () => {
      isActive = false;
    };
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

      <RequestValidationWizard requestFlow={pageData.requestFlow} />
    </section>
  );
}

export default Validation;
