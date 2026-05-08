import { useDeferredValue, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { projectApi } from "../../../api/client.js";
import { refreshNotifications } from "../Notifications/notificationsStore.js";
import { useAuthSession } from "../../../authSession.js";
import ViewFrame from "../Layout/ViewFrame/ViewFrame.jsx";
import "./Projects.css";

const PROJECT_STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const EDITABLE_PROJECT_STATUS_OPTIONS = PROJECT_STATUS_OPTIONS.filter(
  (option) => option.value !== "ALL",
);

const EMPTY_PROJECT_FORM = {
  title: "",
  requiredSkill: "",
  status: "OPEN",
  description: "",
};

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.75 7.25h5.2l1.5 1.8h8.8v8.7a2 2 0 0 1-2 2H6.75a2 2 0 0 1-2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M4.75 7.25v-.5a2 2 0 0 1 2-2h2.9l1.5 1.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8.25" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.75 18a5 5 0 0 1 8.5 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="16.75" cy="9.25" r="2.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15 18a4.3 4.3 0 0 1 4.25-3.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function formatProjectStatus(status = "OPEN") {
  switch (String(status).trim().toUpperCase()) {
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    case "OPEN":
    default:
      return "Open";
  }
}

function formatDateTimeLabel(dateValue) {
  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
}

function buildProjectForm(project) {
  return {
    title: project?.title || "",
    requiredSkill: project?.requiredSkill || "",
    status: project?.status || "OPEN",
    description: project?.description || "",
  };
}

function getProjectMembers(project) {
  return Array.isArray(project?.members) ? project.members : [];
}

function isProjectMember(project, userId) {
  return getProjectMembers(project).some((member) => member.userId === userId);
}

function hasPendingJoinRequest(project, userId) {
  if (!project || !userId || !Array.isArray(project.joinRequests)) {
    return false;
  }

  return project.joinRequests.some((request) => request.userId === userId);
}

function canJoinProject(project, userId) {
  if (!project || !userId) {
    return false;
  }

  if (project.ownerId === userId || isProjectMember(project, userId) || hasPendingJoinRequest(project, userId)) {
    return false;
  }

  return ["OPEN", "IN_PROGRESS"].includes(String(project.status).trim().toUpperCase());
}

function Projects() {
  const navigate = useNavigate();
  const { projectId = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthSession();
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const statusFilter = "ALL";
  const [projectsResult, setProjectsResult] = useState({ items: [], pagination: null });
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectsErrorMessage, setProjectsErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [createForm, setCreateForm] = useState(EMPTY_PROJECT_FORM);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [detailErrorMessage, setDetailErrorMessage] = useState("");
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [editForm, setEditForm] = useState(EMPTY_PROJECT_FORM);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [isTogglingMembership, setIsTogglingMembership] = useState("");
  const [removingMemberUserId, setRemovingMemberUserId] = useState("");
  const [processingRequestUserId, setProcessingRequestUserId] = useState("");
  const isCreatePanelOpen = searchParams.get("create") === "1" && !projectId;

  async function loadProjects(nextSearchTerm = deferredSearchTerm, nextStatusFilter = statusFilter) {
    setIsLoadingProjects(true);
    setProjectsErrorMessage("");

    try {
      const data = await projectApi.list({
        q: nextSearchTerm.trim(),
        status: nextStatusFilter === "ALL" ? "" : nextStatusFilter,
        limit: 100,
      });

      setProjectsResult({
        items: Array.isArray(data?.items) ? data.items : [],
        pagination: data?.pagination ?? null,
      });
    } catch (error) {
      setProjectsErrorMessage(error.message);
    } finally {
      setIsLoadingProjects(false);
    }
  }

  function syncProjectAcrossState(project) {
    setProjectsResult((currentResult) => ({
      ...currentResult,
      items: currentResult.items.map((item) =>
        item.projectId === project.projectId
          ? {
              ...item,
              ...project,
            }
          : item,
      ),
    }));
    setSelectedProject(project);
    setEditForm(buildProjectForm(project));
  }

  useEffect(() => {
    let isActive = true;

    async function run() {
      setIsLoadingProjects(true);
      setProjectsErrorMessage("");

      try {
        const data = await projectApi.list({
          q: deferredSearchTerm.trim(),
          status: statusFilter === "ALL" ? "" : statusFilter,
          limit: 100,
        });

        if (!isActive) {
          return;
        }

        setProjectsResult({
          items: Array.isArray(data?.items) ? data.items : [],
          pagination: data?.pagination ?? null,
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setProjectsErrorMessage(error.message);
      } finally {
        if (isActive) {
          setIsLoadingProjects(false);
        }
      }
    }

    run();

    return () => {
      isActive = false;
    };
  }, [deferredSearchTerm, statusFilter]);

  useEffect(() => {
    let isActive = true;

    async function run() {
      if (!projectId) {
        setSelectedProject(null);
        setDetailErrorMessage("");
        setEditForm(EMPTY_PROJECT_FORM);
        return;
      }

      setIsLoadingDetail(true);
      setDetailErrorMessage("");

      try {
        const project = await projectApi.get(projectId);

        if (!isActive) {
          return;
        }

        setSelectedProject(project);
        setEditForm(buildProjectForm(project));
      } catch (error) {
        if (!isActive) {
          return;
        }

        setDetailErrorMessage(error.message);
        setSelectedProject(null);
        setEditForm(EMPTY_PROJECT_FORM);
      } finally {
        if (isActive) {
          setIsLoadingDetail(false);
        }
      }
    }

    run();

    return () => {
      isActive = false;
    };
  }, [projectId]);

  const selectedProjectMembers = getProjectMembers(selectedProject);
  const selectedProjectJoinRequests = Array.isArray(selectedProject?.joinRequests)
    ? selectedProject.joinRequests
    : [];
  const isSelectedProjectOwner = selectedProject?.ownerId === user?.userId;
  const isSelectedProjectMember = isProjectMember(selectedProject, user?.userId);
  const isSelectedProjectJoinPending = hasPendingJoinRequest(selectedProject, user?.userId);

  async function handleCreateProject(event) {
    event.preventDefault();

    if (isCreatingProject) {
      return;
    }

    setProjectsErrorMessage("");
    setStatusMessage("");
    setIsCreatingProject(true);

    try {
      const project = await projectApi.create({
        title: createForm.title.trim(),
        requiredSkill: createForm.requiredSkill.trim(),
        status: createForm.status,
        description: createForm.description.trim(),
      });

      setCreateForm(EMPTY_PROJECT_FORM);
      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.delete("create");
      setSearchParams(nextSearchParams, { replace: true });
      setStatusMessage("Project created successfully.");
      await loadProjects(searchTerm, statusFilter);
      navigate(`/app/projects/${encodeURIComponent(project.projectId)}`);
    } catch (error) {
      setProjectsErrorMessage(error.message);
    } finally {
      setIsCreatingProject(false);
    }
  }

  async function handleSaveProject() {
    if (!selectedProject || !isSelectedProjectOwner || isSavingProject) {
      return;
    }

    setDetailErrorMessage("");
    setStatusMessage("");
    setIsSavingProject(true);

    try {
      const updatedProject = await projectApi.update(selectedProject.projectId, {
        title: editForm.title.trim(),
        requiredSkill: editForm.requiredSkill.trim(),
        status: editForm.status,
        description: editForm.description.trim(),
      });

      syncProjectAcrossState(updatedProject);
      setStatusMessage("Project updated successfully.");
    } catch (error) {
      setDetailErrorMessage(error.message);
    } finally {
      setIsSavingProject(false);
    }
  }

  async function handleDeleteProject() {
    if (!selectedProject || !isSelectedProjectOwner || isDeletingProject) {
      return;
    }

    setDetailErrorMessage("");
    setStatusMessage("");
    setIsDeletingProject(true);

    try {
      await projectApi.delete(selectedProject.projectId);
      setProjectsResult((currentResult) => ({
        ...currentResult,
        items: currentResult.items.filter((item) => item.projectId !== selectedProject.projectId),
      }));
      setStatusMessage("Project deleted successfully.");
      navigate("/app/projects");
    } catch (error) {
      setDetailErrorMessage(error.message);
    } finally {
      setIsDeletingProject(false);
    }
  }

  async function handleToggleMembership(project) {
    if (!project?.projectId || !user?.userId || isTogglingMembership) {
      return;
    }

    const isMember = isProjectMember(project, user.userId);
    const projectActionId = project.projectId;

    setProjectsErrorMessage("");
    setDetailErrorMessage("");
    setStatusMessage("");
    setIsTogglingMembership(projectActionId);

    try {
      const updatedProject = isMember
        ? await projectApi.leave(project.projectId)
        : await projectApi.join(project.projectId);

      if (!isMember) {
        refreshNotifications();
      }

      setProjectsResult((currentResult) => ({
        ...currentResult,
        items: currentResult.items.map((item) =>
          item.projectId === updatedProject.projectId
            ? {
                ...item,
                ...updatedProject,
              }
            : item,
        ),
      }));

      if (selectedProject?.projectId === updatedProject.projectId) {
        setSelectedProject(updatedProject);
      }

      setStatusMessage(
        isMember ? "You left the project." : "Join request submitted successfully."
      );
    } catch (error) {
      if (selectedProject?.projectId === project.projectId) {
        setDetailErrorMessage(error.message);
      } else {
        setProjectsErrorMessage(error.message);
      }
    } finally {
      setIsTogglingMembership("");
    }
  }

  async function handleRemoveMember(memberUserId) {
    if (!selectedProject?.projectId || !memberUserId || removingMemberUserId) {
      return;
    }

    setDetailErrorMessage("");
    setStatusMessage("");
    setRemovingMemberUserId(memberUserId);

    try {
      const updatedProject = await projectApi.removeMember(selectedProject.projectId, memberUserId);
      syncProjectAcrossState(updatedProject);
      setStatusMessage("Project member removed successfully.");
    } catch (error) {
      setDetailErrorMessage(error.message);
    } finally {
      setRemovingMemberUserId("");
    }
  }

  async function handleApproveRequest(requestUserId) {
    if (!selectedProject?.projectId || !requestUserId || processingRequestUserId) {
      return;
    }

    setDetailErrorMessage("");
    setStatusMessage("");
    setProcessingRequestUserId(requestUserId);

    try {
      const updatedProject = await projectApi.approveJoinRequest(selectedProject.projectId, requestUserId);
      syncProjectAcrossState(updatedProject);
      setStatusMessage("Join request approved successfully.");
    } catch (error) {
      setDetailErrorMessage(error.message);
    } finally {
      setProcessingRequestUserId("");
    }
  }

  async function handleRejectRequest(requestUserId) {
    if (!selectedProject?.projectId || !requestUserId || processingRequestUserId) {
      return;
    }

    setDetailErrorMessage("");
    setStatusMessage("");
    setProcessingRequestUserId(requestUserId);

    try {
      const updatedProject = await projectApi.rejectJoinRequest(selectedProject.projectId, requestUserId);
      syncProjectAcrossState(updatedProject);
      setStatusMessage("Join request rejected successfully.");
    } catch (error) {
      setDetailErrorMessage(error.message);
    } finally {
      setProcessingRequestUserId("");
    }
  }

  return (
    <ViewFrame
      header={
        <header className="projects-page__header">
          <h1>{selectedProject?.title || "Explore Projects"}</h1>
        </header>
      }
    >
      <section className="projects-page">
        <div className="projects-page__controls">
          <div className="projects-page__content-inner">
            <div className="projects-page__toolbar">
              <label className="projects-page__search" aria-label="Search projects">
                <span className="projects-page__search-icon">
                  <SearchIcon />
                </span>

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by title, skill, or description..."
                  aria-label="Search by title, skill, or description"
                />
              </label>
            </div>

            {isCreatePanelOpen ? (
              <form className="projects-page__create-panel" onSubmit={handleCreateProject}>
                <div className="projects-page__panel-head">
                  <div>
                    <p className="projects-page__eyebrow">New project</p>
                    <h2>Create a project workspace</h2>
                  </div>
                </div>

                <div className="projects-page__form-grid">
                  <label className="projects-page__field">
                    <span>Title</span>
                    <input
                      type="text"
                      minLength={3}
                      value={createForm.title}
                      onChange={(event) =>
                        setCreateForm((current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                      placeholder="e.g. Build a Fenneky mobile dashboard"
                      required
                    />
                  </label>

                  <label className="projects-page__field">
                    <span>Required skill</span>
                    <input
                      type="text"
                      value={createForm.requiredSkill}
                      onChange={(event) =>
                        setCreateForm((current) => ({
                          ...current,
                          requiredSkill: event.target.value,
                        }))
                      }
                      placeholder="e.g. React Native"
                    />
                  </label>

                  <label className="projects-page__field">
                    <span>Status</span>
                    <select
                      value={createForm.status}
                      onChange={(event) =>
                        setCreateForm((current) => ({
                          ...current,
                          status: event.target.value,
                        }))
                      }
                    >
                      {EDITABLE_PROJECT_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="projects-page__field projects-page__field--full">
                    <span>Description</span>
                    <textarea
                      rows="5"
                      value={createForm.description}
                      onChange={(event) =>
                        setCreateForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      placeholder="Describe the project, the goal, and what kind of member help you need."
                    />
                  </label>
                </div>

                <div className="projects-page__panel-actions">
                  <button
                    type="button"
                    className="projects-page__button projects-page__button--ghost"
                    onClick={() => {
                      setCreateForm(EMPTY_PROJECT_FORM);
                      const nextSearchParams = new URLSearchParams(searchParams);
                      nextSearchParams.delete("create");
                      setSearchParams(nextSearchParams, { replace: true });
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="projects-page__button projects-page__button--primary"
                    disabled={isCreatingProject}
                  >
                    {isCreatingProject ? "Creating..." : "Create project"}
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>

        <div className="projects-page__content">
          <div className="projects-page__list-column">
            {projectsErrorMessage ? <p>{projectsErrorMessage}</p> : null}
            {statusMessage ? <p className="projects-page__status-message">{statusMessage}</p> : null}

            <div className="projects-page__section-head">
              <div>
                <p className="projects-page__eyebrow">Workspace list</p>
                <h2>Browse project opportunities</h2>
              </div>

              <span className="projects-page__count">
                {projectsResult.pagination?.total ?? projectsResult.items.length} project
                {(projectsResult.pagination?.total ?? projectsResult.items.length) === 1 ? "" : "s"}
              </span>
            </div>

            {isLoadingProjects ? (
              <div className="projects-page__empty">Loading projects...</div>
            ) : projectsResult.items.length > 0 ? (
              <div className="projects-page__grid">
                {projectsResult.items.map((project) => {
                  const memberCount = getProjectMembers(project).length;
                  const isOwner = project.ownerId === user?.userId;
                  const isMember = isProjectMember(project, user?.userId);
                  const canJoin = canJoinProject(project, user?.userId);
                  const isActive = project.projectId === projectId;

                  return (
                    <article
                      key={project.projectId}
                      className={`projects-page__card ${isActive ? "is-active" : ""}`}
                    >
                      <div className="projects-page__card-topline">
                        <span className={`projects-page__badge projects-page__badge--${String(project.status).toLowerCase()}`}>
                          {formatProjectStatus(project.status)}
                        </span>

                        {isOwner ? (
                          <span className="projects-page__owner-pill">Owner</span>
                        ) : null}
                      </div>

                      <div className="projects-page__card-icon">
                        <FolderIcon />
                      </div>

                      <div className="projects-page__card-copy">
                        <h3>{project.title}</h3>
                        <p>{project.description || "No description yet."}</p>
                      </div>

                      <div className="projects-page__meta-list">
                        <span>Skill: {project.requiredSkill || "Not specified"}</span>
                        <span>Owner: {isOwner ? "You" : project.ownerId}</span>
                        <span>Created: {formatDateTimeLabel(project.createdAt)}</span>
                        <span>Members: {memberCount}</span>
                      </div>

                      <div className="projects-page__card-actions">
                        <button
                          type="button"
                          className="projects-page__button projects-page__button--soft"
                          onClick={() => navigate(`/app/projects/${encodeURIComponent(project.projectId)}`)}
                        >
                          {isOwner ? "Manage" : "Open"}
                        </button>

                        {isOwner ? null : isMember ? (
                          <button
                            type="button"
                            className="projects-page__button projects-page__button--ghost"
                            disabled={isTogglingMembership === project.projectId}
                            onClick={() => handleToggleMembership(project)}
                          >
                            {isTogglingMembership === project.projectId ? "Leaving..." : "Leave"}
                          </button>
                        ) : hasPendingJoinRequest(project, user?.userId) ? (
                          <button
                            type="button"
                            className="projects-page__button projects-page__button--ghost"
                            disabled
                          >
                            Pending request
                          </button>
                        ) : canJoin ? (
                          <button
                            type="button"
                            className="projects-page__button projects-page__button--primary"
                            disabled={isTogglingMembership === project.projectId}
                            onClick={() => handleToggleMembership(project)}
                          >
                            {isTogglingMembership === project.projectId ? "Requesting..." : "Join"}
                          </button>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="projects-page__empty">No projects match this search yet.</div>
            )}
          </div>

          <aside className="projects-page__detail-column">
            {projectId ? (
              isLoadingDetail ? (
                <div className="projects-page__detail-card projects-page__empty">
                  Loading project details...
                </div>
              ) : detailErrorMessage ? (
                <div className="projects-page__detail-card">
                  <h2>Unable to load this project</h2>
                  <p>{detailErrorMessage}</p>
                  <button
                    type="button"
                    className="projects-page__button projects-page__button--soft"
                    onClick={() => navigate("/app/projects")}
                  >
                    Back to projects
                  </button>
                </div>
              ) : selectedProject ? (
                <div className="projects-page__detail-card">
                  <div className="projects-page__detail-head">
                    <div>
                      <p className="projects-page__eyebrow">Project detail</p>
                      <h2>{selectedProject.title}</h2>
                    </div>

                    <button
                      type="button"
                      className="projects-page__button projects-page__button--soft"
                      onClick={() => navigate("/app/projects")}
                    >
                      Close
                    </button>
                  </div>

                  <div className="projects-page__detail-meta">
                    <span className={`projects-page__badge projects-page__badge--${String(selectedProject.status).toLowerCase()}`}>
                      {formatProjectStatus(selectedProject.status)}
                    </span>
                    <span>Project ID: {selectedProject.projectId}</span>
                    <span>Owner: {isSelectedProjectOwner ? "You" : selectedProject.ownerId}</span>
                    <span>Created: {formatDateTimeLabel(selectedProject.createdAt)}</span>
                    <span>Updated: {formatDateTimeLabel(selectedProject.updatedAt)}</span>
                  </div>

                  {isSelectedProjectOwner ? (
                    <div className="projects-page__detail-note">
                      Join requests are pending approval. Review the list below and accept or reject requests manually.
                    </div>
                  ) : null}

                  {isSelectedProjectOwner ? (
                    <>
                      <div className="projects-page__panel-head">
                        <div>
                          <p className="projects-page__eyebrow">Owner tools</p>
                          <h3>Edit project</h3>
                        </div>
                      </div>

                      <div className="projects-page__form-grid">
                        <label className="projects-page__field">
                          <span>Title</span>
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(event) =>
                              setEditForm((current) => ({
                                ...current,
                                title: event.target.value,
                              }))
                            }
                          />
                        </label>

                        <label className="projects-page__field">
                          <span>Required skill</span>
                          <input
                            type="text"
                            value={editForm.requiredSkill}
                            onChange={(event) =>
                              setEditForm((current) => ({
                                ...current,
                                requiredSkill: event.target.value,
                              }))
                            }
                          />
                        </label>

                        <label className="projects-page__field">
                          <span>Status</span>
                          <select
                            value={editForm.status}
                            onChange={(event) =>
                              setEditForm((current) => ({
                                ...current,
                                status: event.target.value,
                              }))
                            }
                          >
                            {EDITABLE_PROJECT_STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="projects-page__field projects-page__field--full">
                          <span>Description</span>
                          <textarea
                            rows="5"
                            value={editForm.description}
                            onChange={(event) =>
                              setEditForm((current) => ({
                                ...current,
                                description: event.target.value,
                              }))
                            }
                          />
                        </label>
                      </div>

                      <div className="projects-page__panel-actions">
                        <button
                          type="button"
                          className="projects-page__button projects-page__button--ghost"
                          onClick={handleDeleteProject}
                          disabled={isDeletingProject}
                        >
                          {isDeletingProject ? "Deleting..." : "Delete project"}
                        </button>

                        <button
                          type="button"
                          className="projects-page__button projects-page__button--primary"
                          onClick={handleSaveProject}
                          disabled={isSavingProject}
                        >
                          {isSavingProject ? "Saving..." : "Save changes"}
                        </button>
                      </div>

                      <div className="projects-page__members-block">
                        <div className="projects-page__panel-head">
                          <div>
                            <p className="projects-page__eyebrow">Join requests</p>
                            <h3>Pending approvals</h3>
                          </div>
                        </div>

                        {selectedProjectJoinRequests.length > 0 ? (
                          <div className="projects-page__member-list">
                            {selectedProjectJoinRequests.map((request) => (
                              <article key={request.userId} className="projects-page__member-card">
                                <div className="projects-page__member-main">
                                  <span className="projects-page__member-avatar">
                                    <PeopleIcon />
                                  </span>

                                  <div>
                                    <strong>{request.userId}</strong>
                                    <span>Requested {formatDateTimeLabel(request.requestedAt)}</span>
                                  </div>
                                </div>

                                <div className="projects-page__member-actions">
                                  <button
                                    type="button"
                                    className="projects-page__button projects-page__button--ghost"
                                    disabled={processingRequestUserId === request.userId}
                                    onClick={() => handleRejectRequest(request.userId)}
                                  >
                                    {processingRequestUserId === request.userId ? "Rejecting..." : "Reject"}
                                  </button>

                                  <button
                                    type="button"
                                    className="projects-page__button projects-page__button--primary"
                                    disabled={processingRequestUserId === request.userId}
                                    onClick={() => handleApproveRequest(request.userId)}
                                  >
                                    {processingRequestUserId === request.userId ? "Approving..." : "Approve"}
                                  </button>
                                </div>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <div className="projects-page__empty">
                            No pending join requests at the moment.
                          </div>
                        )}
                      </div>

                      <div className="projects-page__members-block">
                        <div className="projects-page__panel-head">
                          <div>
                            <p className="projects-page__eyebrow">Members</p>
                            <h3>Manage project members</h3>
                          </div>
                        </div>

                        {selectedProjectMembers.length > 0 ? (
                          <div className="projects-page__member-list">
                            {selectedProjectMembers.map((member) => (
                              <article key={member.userId} className="projects-page__member-card">
                                <div className="projects-page__member-main">
                                  <span className="projects-page__member-avatar">
                                    <PeopleIcon />
                                  </span>

                                  <div>
                                    <strong>{member.userId}</strong>
                                    <span>Joined {formatDateTimeLabel(member.joinedAt)}</span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  className="projects-page__button projects-page__button--ghost"
                                  disabled={removingMemberUserId === member.userId}
                                  onClick={() => handleRemoveMember(member.userId)}
                                >
                                  {removingMemberUserId === member.userId ? "Removing..." : "Delete member"}
                                </button>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <div className="projects-page__empty">
                            No members have joined this project yet.
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="projects-page__guest-actions">
                      <p>{selectedProject.description || "No description yet."}</p>

                      <div className="projects-page__meta-list">
                        <span>Required skill: {selectedProject.requiredSkill || "Not specified"}</span>
                        <span>Members: {selectedProjectMembers.length}</span>
                      </div>

                      {isSelectedProjectMember ? (
                        <button
                          type="button"
                          className="projects-page__button projects-page__button--ghost"
                          disabled={isTogglingMembership === selectedProject.projectId}
                          onClick={() => handleToggleMembership(selectedProject)}
                        >
                          {isTogglingMembership === selectedProject.projectId ? "Leaving..." : "Leave project"}
                        </button>
                      ) : isSelectedProjectJoinPending ? (
                        <button
                          type="button"
                          className="projects-page__button projects-page__button--ghost"
                          disabled
                        >
                          Request pending
                        </button>
                      ) : canJoinProject(selectedProject, user?.userId) ? (
                        <button
                          type="button"
                          className="projects-page__button projects-page__button--primary"
                          disabled={isTogglingMembership === selectedProject.projectId}
                          onClick={() => handleToggleMembership(selectedProject)}
                        >
                          {isTogglingMembership === selectedProject.projectId ? "Requesting..." : "Join project"}
                        </button>
                      ) : (
                        <div className="projects-page__empty">
                          This project is not open for new joins right now.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : null
            ) : (
              <div className="projects-page__detail-card projects-page__detail-card--empty">
                <div className="projects-page__empty-illustration">
                  <FolderIcon />
                </div>
                <h2>Select a project</h2>
                <p>
                  Open one project from the list to view details, join it, or manage members if you are the owner.
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </ViewFrame>
  );
}

export default Projects;
