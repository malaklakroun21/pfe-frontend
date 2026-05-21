import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { projectApi } from "../../../api/client.js";
import { refreshNotifications } from "../Notifications/notificationsStore.js";
import { useAuthSession } from "../../../authSession.js";
import ThemedSelect from "../../shared/ThemedSelect/ThemedSelect.jsx";
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
  categoryId: "",
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

const STATUS_THEMES = {
  OPEN:        { from: "#2d9a6b", to: "#4db88a", soft: "#e5f7ee", ink: "#137a48" },
  IN_PROGRESS: { from: "#c47a00", to: "#e89200", soft: "#fff2d8", ink: "#ad6800" },
  COMPLETED:   { from: "#2c64c7", to: "#4a80e0", soft: "#e6f0ff", ink: "#2c64c7" },
  CANCELLED:   { from: "#c94f2e", to: "#e06a4a", soft: "#ffe5df", ink: "#c94f2e" },
};

const CATEGORY_THEMES = [
  { from: "#2d9a6b", to: "#4db88a", soft: "#e5f7ee", ink: "#137a48" },
  { from: "#c47a00", to: "#e89200", soft: "#fff2d8", ink: "#ad6800" },
  { from: "#2c64c7", to: "#4a80e0", soft: "#e6f0ff", ink: "#2c64c7" },
  { from: "#7c3aed", to: "#9461f0", soft: "#f0ebff", ink: "#6028cc" },
  { from: "#db651f", to: "#e8842f", soft: "#fff0e3", ink: "#b84d14" },
  { from: "#0f7a80", to: "#1a9ba3", soft: "#e0f7f8", ink: "#0d626a" },
];

function getCategoryTheme(index) {
  return CATEGORY_THEMES[index % CATEGORY_THEMES.length];
}

function getCategoryCode(name) {
  const words = String(name || "GEN").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "GEN";
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.map((w) => w[0]).join("").slice(0, 3).toUpperCase();
}

function getProjectTheme(status) {
  return STATUS_THEMES[String(status || "OPEN").toUpperCase()] || STATUS_THEMES.OPEN;
}

function getProjectInitials(title) {
  const words = String(title || "PR").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "PR";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
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
    categoryId: project?.categoryId || "",
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
  const { projectId: param = "" } = useParams();
  const isProjectDetail = param.startsWith("PRJ-") || param.startsWith("prj-");
  const projectId = isProjectDetail ? param : "";
  const categoryId = isProjectDetail ? "" : param;
  const { user } = useAuthSession();
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const statusFilter = "ALL";
  const [apiCategories, setApiCategories] = useState([]);
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
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  const categoryCards = useMemo(() => {
    return apiCategories.map((cat) => {
      const projectsInCategory = projectsResult.items.filter(
        (p) => p.categoryId === cat.categoryId,
      );
      const totalMembers = projectsInCategory.reduce(
        (sum, p) => sum + (Array.isArray(p.members) ? p.members.length : 0),
        0,
      );
      return { ...cat, totalProjects: projectsInCategory.length, totalMembers };
    });
  }, [apiCategories, projectsResult.items]);

  const selectedCategory = useMemo(
    () => categoryCards.find((cat) => cat.categoryId === categoryId) || null,
    [categoryCards, categoryId],
  );

  const filteredProjects = useMemo(() => {
    if (!categoryId) return [];
    return projectsResult.items.filter((p) => p.categoryId === categoryId);
  }, [projectsResult.items, categoryId]);

  useEffect(() => {
    let isActive = true;
    projectApi.listCategories().then((data) => {
      if (isActive) setApiCategories(Array.isArray(data) ? data : []);
    }).catch(() => {});
    return () => { isActive = false; };
  }, []);

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
          ? { ...item, ...project }
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

        if (!isActive) return;

        setProjectsResult({
          items: Array.isArray(data?.items) ? data.items : [],
          pagination: data?.pagination ?? null,
        });
      } catch (error) {
        if (!isActive) return;
        setProjectsErrorMessage(error.message);
      } finally {
        if (isActive) setIsLoadingProjects(false);
      }
    }

    run();

    return () => { isActive = false; };
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

        if (!isActive) return;

        setSelectedProject(project);
        setEditForm(buildProjectForm(project));
      } catch (error) {
        if (!isActive) return;
        setDetailErrorMessage(error.message);
        setSelectedProject(null);
        setEditForm(EMPTY_PROJECT_FORM);
      } finally {
        if (isActive) setIsLoadingDetail(false);
      }
    }

    run();

    return () => { isActive = false; };
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

    if (isCreatingProject) return;

    setProjectsErrorMessage("");
    setStatusMessage("");
    setIsCreatingProject(true);

    try {
      const project = await projectApi.create({
        title: createForm.title.trim(),
        requiredSkill: createForm.requiredSkill.trim(),
        categoryId: createForm.categoryId,
        status: createForm.status,
        description: createForm.description.trim(),
      });

      setCreateForm(EMPTY_PROJECT_FORM);
      setIsCreateFormOpen(false);
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
    if (!selectedProject || !isSelectedProjectOwner || isSavingProject) return;

    setDetailErrorMessage("");
    setStatusMessage("");
    setIsSavingProject(true);

    try {
      const updatedProject = await projectApi.update(selectedProject.projectId, {
        title: editForm.title.trim(),
        requiredSkill: editForm.requiredSkill.trim(),
        categoryId: editForm.categoryId,
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
    if (!selectedProject || !isSelectedProjectOwner || isDeletingProject) return;

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
    if (!project?.projectId || !user?.userId || isTogglingMembership) return;

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

      if (!isMember) refreshNotifications();

      setProjectsResult((currentResult) => ({
        ...currentResult,
        items: currentResult.items.map((item) =>
          item.projectId === updatedProject.projectId
            ? { ...item, ...updatedProject }
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
    if (!selectedProject?.projectId || !memberUserId || removingMemberUserId) return;

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
    if (!selectedProject?.projectId || !requestUserId || processingRequestUserId) return;

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
    if (!selectedProject?.projectId || !requestUserId || processingRequestUserId) return;

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

  const pageTitle = isProjectDetail
    ? (selectedProject?.title || "Project")
    : categoryId
    ? (selectedCategory?.categoryName || "Projects")
    : "Explore Projects";

  return (
    <ViewFrame
      header={
        <header className="projects-page__header">
          <h1>{pageTitle}</h1>
        </header>
      }
    >
      <section className="projects-page">
        {/* Toolbar */}
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

              <p className="projects-page__summary-text">
                {categoryId
                  ? `${filteredProjects.length} project${filteredProjects.length === 1 ? "" : "s"}`
                  : `${categoryCards.length} categor${categoryCards.length === 1 ? "y" : "ies"}`}
              </p>

              <button
                type="button"
                className="projects-page__create-button"
                onClick={() => {
                  setCreateForm({ ...EMPTY_PROJECT_FORM, categoryId: categoryId || "" });
                  setIsCreateFormOpen(true);
                }}
              >
                Create Project
              </button>
            </div>

          </div>
        </div>

        {/* Content */}
        <div className="projects-page__content">
          <div className="projects-page__content-inner">
            {projectsErrorMessage ? <p style={{ color: "#c94f2e" }}>{projectsErrorMessage}</p> : null}
            {statusMessage ? <p className="projects-page__status-message">{statusMessage}</p> : null}

            {isCreateFormOpen ? (
              <article className="projects-page__create-card">
                <div className="projects-page__create-head">
                  <p className="projects-page__eyebrow">New project</p>
                  <h2>Create a project workspace</h2>
                </div>
                <form className="projects-page__create-form" onSubmit={handleCreateProject}>
                  <div className="projects-page__form-grid">
                    <label className="projects-page__field">
                      <span>Title</span>
                      <input
                        type="text"
                        minLength={3}
                        value={createForm.title}
                        onChange={(e) => setCreateForm((c) => ({ ...c, title: e.target.value }))}
                        placeholder="e.g. Build a Fenneky mobile dashboard"
                        required
                      />
                    </label>
                    <label className="projects-page__field">
                      <span>Category</span>
                      <select
                        value={createForm.categoryId}
                        onChange={(e) => setCreateForm((c) => ({ ...c, categoryId: e.target.value }))}
                      >
                        <option value="">— No category —</option>
                        {apiCategories.map((cat) => (
                          <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                        ))}
                      </select>
                    </label>
                    <label className="projects-page__field">
                      <span>Required skill</span>
                      <input
                        type="text"
                        value={createForm.requiredSkill}
                        onChange={(e) => setCreateForm((c) => ({ ...c, requiredSkill: e.target.value }))}
                        placeholder="e.g. React Native"
                      />
                    </label>
                    <label className="projects-page__field">
                      <span>Status</span>
                      <ThemedSelect
                        value={createForm.status}
                        options={EDITABLE_PROJECT_STATUS_OPTIONS}
                        onChange={(v) => setCreateForm((c) => ({ ...c, status: v }))}
                      />
                    </label>
                    <label className="projects-page__field projects-page__field--full">
                      <span>Description</span>
                      <textarea
                        rows="4"
                        value={createForm.description}
                        onChange={(e) => setCreateForm((c) => ({ ...c, description: e.target.value }))}
                        placeholder="Describe the project and what kind of help you need."
                      />
                    </label>
                  </div>
                  <div className="projects-page__create-actions">
                    <button
                      type="button"
                      className="projects-page__button projects-page__button--ghost"
                      onClick={() => { setCreateForm(EMPTY_PROJECT_FORM); setIsCreateFormOpen(false); }}
                      disabled={isCreatingProject}
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
              </article>
            ) : null}

            {isLoadingProjects ? (
              <div className="projects-page__empty">Loading projects...</div>
            ) : !param ? (
              /* ── View 1: Categories grid ── */
              <section className="projects-page__section">
                {categoryCards.length > 0 ? (
                  <div className="projects-page__category-grid">
                    {categoryCards.map((cat, index) => {
                      const theme = getCategoryTheme(index);
                      return (
                        <Link
                          key={cat.categoryId}
                          to={`/app/projects/${encodeURIComponent(cat.categoryId)}`}
                          className="projects-page__category-card projects-page__category-card--link"
                          style={{
                            "--projects-from": theme.from,
                            "--projects-to": theme.to,
                            "--projects-soft": theme.soft,
                            "--projects-ink": theme.ink,
                          }}
                        >
                          <span className="projects-page__category-badge">
                            {getCategoryCode(cat.categoryName)}
                          </span>
                          <strong>{cat.categoryName}</strong>
                          <span className="projects-page__category-stat">
                            {cat.totalProjects} project{cat.totalProjects !== 1 ? "s" : ""}
                          </span>
                          <span className="projects-page__category-meta">
                            {cat.totalMembers} member{cat.totalMembers !== 1 ? "s" : ""}
                          </span>
                          <span className="projects-page__category-date">Browse projects →</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="projects-page__empty">No categories available yet.</div>
                )}
              </section>
            ) : !isProjectDetail ? (
              /* ── View 2: Project cards for a category ── */
              <section className="projects-page__section projects-page__section--sessions">
                <div className="projects-page__section-header projects-page__section-header--split">
                  <div>
                    <p className="projects-page__eyebrow">Projects</p>
                    <h2>{selectedCategory?.categoryName || categoryId}</h2>
                    <p className="projects-page__section-copy">
                      Browse and join projects in this category.
                    </p>
                  </div>
                </div>

                <Link className="projects-page__back-link" to="/app/projects">
                  ← Return to categories
                </Link>

                {filteredProjects.length > 0 ? (
                  <div className="projects-page__category-grid">
                    {filteredProjects.map((project) => {
                      const theme = getProjectTheme(project.status);
                      const memberCount = getProjectMembers(project).length;
                      const isPending = hasPendingJoinRequest(project, user?.userId);
                      const isMember = isProjectMember(project, user?.userId);
                      const isOwner = project.ownerId === user?.userId;
                      const canJoin = canJoinProject(project, user?.userId);
                      return (
                        <article
                          key={project.projectId}
                          className="projects-page__category-card"
                          style={{
                            "--projects-from": theme.from,
                            "--projects-to": theme.to,
                            "--projects-soft": theme.soft,
                            "--projects-ink": theme.ink,
                          }}
                        >
                          <span className="projects-page__category-badge">
                            {getProjectInitials(project.title)}
                          </span>
                          <strong title={project.title}>{project.title}</strong>
                          <span className="projects-page__category-meta">
                            {isPending ? "Request pending" : isMember ? "Member" : formatProjectStatus(project.status)}
                          </span>

                          <div className="projects-page__card-meta">
                            <span className="projects-page__meta-item">
                              <span className="projects-page__meta-icon"><PeopleIcon /></span>
                              {memberCount} member{memberCount !== 1 ? "s" : ""}
                            </span>
                          </div>

                          <span className="projects-page__category-date">
                            {project.description
                              ? project.description.length > 52
                                ? project.description.slice(0, 52) + "…"
                                : project.description
                              : "No description yet."}
                          </span>

                          {isOwner ? (
                            <Link
                              to={`/app/projects/${encodeURIComponent(project.projectId)}`}
                              className="projects-page__join-button projects-page__join-button--link"
                            >
                              Manage
                            </Link>
                          ) : isMember ? (
                            <button
                              type="button"
                              className="projects-page__join-button projects-page__join-button--ghost"
                              disabled={isTogglingMembership === project.projectId}
                              onClick={() => handleToggleMembership(project)}
                            >
                              {isTogglingMembership === project.projectId ? "Leaving…" : "Leave"}
                            </button>
                          ) : isPending ? (
                            <button type="button" className="projects-page__join-button" disabled>
                              Request pending
                            </button>
                          ) : canJoin ? (
                            <button
                              type="button"
                              className="projects-page__join-button"
                              disabled={isTogglingMembership === project.projectId}
                              onClick={() => handleToggleMembership(project)}
                            >
                              {isTogglingMembership === project.projectId ? "Requesting…" : "Join"}
                            </button>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="projects-page__empty">No projects in this category yet.</div>
                )}
              </section>
            ) : (
              /* ── View 3: Project detail (owner management) ── */
              <section className="projects-page__section projects-page__section--detail">
                <div className="projects-page__section-header projects-page__section-header--split">
                  <div>
                    <p className="projects-page__eyebrow">Project</p>
                    <h2>{selectedProject?.title || "Loading..."}</h2>
                    {selectedProject ? (
                      <p className="projects-page__section-copy">
                        {selectedProject.description || "No description yet."}
                      </p>
                    ) : null}
                  </div>
                </div>

                <Link
                  className="projects-page__back-link"
                  to={selectedProject?.categoryId
                    ? `/app/projects/${encodeURIComponent(selectedProject.categoryId)}`
                    : "/app/projects"}
                >
                  ← Return to projects
                </Link>

                {isLoadingDetail ? (
                  <div className="projects-page__empty">Loading project details...</div>
                ) : detailErrorMessage ? (
                  <div className="projects-page__empty">{detailErrorMessage}</div>
                ) : selectedProject ? (
                  <>
                    <div className="projects-page__detail-meta">
                      <span className={`projects-page__badge projects-page__badge--${String(selectedProject.status).toLowerCase()}`}>
                        {formatProjectStatus(selectedProject.status)}
                      </span>
                      <span>Skill: {selectedProject.requiredSkill || "Not specified"}</span>
                      <span>Members: {selectedProjectMembers.length}</span>
                      <span>Created: {formatDateTimeLabel(selectedProject.createdAt)}</span>
                    </div>

                    {isSelectedProjectOwner ? (
                      <div className="projects-page__catalog-grid">
                        <article className="projects-page__catalog-card">
                          <p className="projects-page__eyebrow">Owner tools</p>
                          <h3>Edit project</h3>
                          <div className="projects-page__form-grid">
                            <label className="projects-page__field">
                              <span>Title</span>
                              <input type="text" value={editForm.title} onChange={(e) => setEditForm((c) => ({ ...c, title: e.target.value }))} />
                            </label>
                            <label className="projects-page__field">
                              <span>Category</span>
                              <select
                                value={editForm.categoryId}
                                onChange={(e) => setEditForm((c) => ({ ...c, categoryId: e.target.value }))}
                              >
                                <option value="">No category</option>
                                {apiCategories.map((cat) => (
                                  <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                                ))}
                              </select>
                            </label>
                            <label className="projects-page__field">
                              <span>Required skill</span>
                              <input type="text" value={editForm.requiredSkill} onChange={(e) => setEditForm((c) => ({ ...c, requiredSkill: e.target.value }))} />
                            </label>
                            <label className="projects-page__field">
                              <span>Status</span>
                              <ThemedSelect value={editForm.status} options={EDITABLE_PROJECT_STATUS_OPTIONS} onChange={(v) => setEditForm((c) => ({ ...c, status: v }))} />
                            </label>
                            <label className="projects-page__field">
                              <span>Description</span>
                              <textarea rows="4" value={editForm.description} onChange={(e) => setEditForm((c) => ({ ...c, description: e.target.value }))} />
                            </label>
                          </div>
                          <div className="projects-page__panel-actions">
                            <button type="button" className="projects-page__button projects-page__button--danger" onClick={handleDeleteProject} disabled={isDeletingProject}>
                              {isDeletingProject ? "Deleting..." : "Delete"}
                            </button>
                            <button type="button" className="projects-page__button projects-page__button--primary" onClick={handleSaveProject} disabled={isSavingProject}>
                              {isSavingProject ? "Saving..." : "Save changes"}
                            </button>
                          </div>
                        </article>

                        <article className="projects-page__catalog-card">
                          <p className="projects-page__eyebrow">Join requests</p>
                          <h3>Pending approvals</h3>
                          {selectedProjectJoinRequests.length > 0 ? (
                            <div className="projects-page__member-list">
                              {selectedProjectJoinRequests.map((request) => (
                                <div key={request.userId} className="projects-page__member-card">
                                  <div className="projects-page__member-main">
                                    <span className="projects-page__member-avatar"><PeopleIcon /></span>
                                    <div>
                                      <strong>{request.userId}</strong>
                                      <span>Requested {formatDateTimeLabel(request.requestedAt)}</span>
                                    </div>
                                  </div>
                                  <div className="projects-page__member-actions">
                                    <button type="button" className="projects-page__button projects-page__button--ghost" disabled={processingRequestUserId === request.userId} onClick={() => handleRejectRequest(request.userId)}>
                                      {processingRequestUserId === request.userId ? "..." : "Reject"}
                                    </button>
                                    <button type="button" className="projects-page__button projects-page__button--primary" disabled={processingRequestUserId === request.userId} onClick={() => handleApproveRequest(request.userId)}>
                                      {processingRequestUserId === request.userId ? "..." : "Approve"}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="projects-page__empty" style={{ minHeight: 80 }}>No pending requests.</div>
                          )}
                        </article>

                        <article className="projects-page__catalog-card">
                          <p className="projects-page__eyebrow">Members</p>
                          <h3>Project members</h3>
                          {selectedProjectMembers.length > 0 ? (
                            <div className="projects-page__member-list">
                              {selectedProjectMembers.map((member) => (
                                <div key={member.userId} className="projects-page__member-card">
                                  <div className="projects-page__member-main">
                                    <span className="projects-page__member-avatar"><PeopleIcon /></span>
                                    <div>
                                      <strong>{member.userId}</strong>
                                      <span>Joined {formatDateTimeLabel(member.joinedAt)}</span>
                                    </div>
                                  </div>
                                  <button type="button" className="projects-page__button projects-page__button--ghost" disabled={removingMemberUserId === member.userId} onClick={() => handleRemoveMember(member.userId)}>
                                    {removingMemberUserId === member.userId ? "Removing..." : "Remove"}
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="projects-page__empty" style={{ minHeight: 80 }}>No members yet.</div>
                          )}
                        </article>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </section>
            )}
          </div>
        </div>
      </section>
    </ViewFrame>
  );
}

export default Projects;
