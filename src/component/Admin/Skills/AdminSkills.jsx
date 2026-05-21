import { useEffect, useState } from "react";
import ViewFrame from "../../Dashboard/Layout/ViewFrame/ViewFrame.jsx";
import AdminPageHeader from "../AdminPageHeader.jsx";
import { adminSkillsApi } from "../../../api/client.js";
import "../adminUi.css";
import "./AdminSkills.css";

const EMPTY_CAT_FORM = { categoryName: "", description: "" };
const EMPTY_DEF_FORM = { skillName: "", description: "" };

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AdminSkills() {
  const [categories, setCategories] = useState([]);
  const [isLoadingCats, setIsLoadingCats] = useState(true);
  const [catError, setCatError] = useState("");
  const [catForm, setCatForm] = useState(EMPTY_CAT_FORM);
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [busyCatId, setBusyCatId] = useState("");

  const [selectedCatId, setSelectedCatId] = useState("");

  const [skillDefs, setSkillDefs] = useState([]);
  const [isLoadingDefs, setIsLoadingDefs] = useState(false);
  const [defError, setDefError] = useState("");
  const [defForm, setDefForm] = useState(EMPTY_DEF_FORM);
  const [isCreatingDef, setIsCreatingDef] = useState(false);
  const [busyDefId, setBusyDefId] = useState("");

  const selectedCategory = categories.find((c) => c.categoryId === selectedCatId) || null;

  // ── Load categories ───────────────────────────────────────────────────────

  async function loadCategories() {
    setIsLoadingCats(true);
    setCatError("");
    try {
      const data = await adminSkillsApi.listCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setCatError(err.message);
    } finally {
      setIsLoadingCats(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  // ── Load skill definitions for selected category ──────────────────────────

  async function loadSkillDefs(categoryId) {
    setIsLoadingDefs(true);
    setDefError("");
    setSkillDefs([]);
    try {
      const data = await adminSkillsApi.listSkillDefinitions({ categoryId });
      setSkillDefs(Array.isArray(data) ? data : []);
    } catch (err) {
      setDefError(err.message);
    } finally {
      setIsLoadingDefs(false);
    }
  }

  useEffect(() => {
    if (selectedCatId) {
      loadSkillDefs(selectedCatId);
      setDefForm(EMPTY_DEF_FORM);
    } else {
      setSkillDefs([]);
    }
  }, [selectedCatId]);

  // ── Category handlers ─────────────────────────────────────────────────────

  async function handleCreateCategory(e) {
    e.preventDefault();
    if (isCreatingCat || !catForm.categoryName.trim()) return;
    setIsCreatingCat(true);
    setCatError("");
    try {
      const created = await adminSkillsApi.createCategory({
        categoryName: catForm.categoryName.trim(),
        description: catForm.description.trim(),
      });
      setCategories((prev) => [...prev, created].sort((a, b) => a.categoryName.localeCompare(b.categoryName)));
      setCatForm(EMPTY_CAT_FORM);
      setSelectedCatId(created.categoryId);
    } catch (err) {
      setCatError(err.message);
    } finally {
      setIsCreatingCat(false);
    }
  }

  async function handleDeleteCategory(categoryId) {
    if (busyCatId) return;
    setBusyCatId(categoryId);
    setCatError("");
    try {
      await adminSkillsApi.deleteCategory(categoryId);
      setCategories((prev) => prev.filter((c) => c.categoryId !== categoryId));
      if (selectedCatId === categoryId) setSelectedCatId("");
    } catch (err) {
      setCatError(err.message);
    } finally {
      setBusyCatId("");
    }
  }

  // ── Skill definition handlers ─────────────────────────────────────────────

  async function handleCreateSkillDef(e) {
    e.preventDefault();
    if (isCreatingDef || !selectedCatId || !defForm.skillName.trim()) return;
    setIsCreatingDef(true);
    setDefError("");
    try {
      const created = await adminSkillsApi.createSkillDefinition({
        skillName: defForm.skillName.trim(),
        categoryId: selectedCatId,
        description: defForm.description.trim(),
      });
      setSkillDefs((prev) => [...prev, created].sort((a, b) => a.skillName.localeCompare(b.skillName)));
      setDefForm(EMPTY_DEF_FORM);
    } catch (err) {
      setDefError(err.message);
    } finally {
      setIsCreatingDef(false);
    }
  }

  async function handleDeleteSkillDef(skillDefinitionId) {
    if (busyDefId) return;
    setBusyDefId(skillDefinitionId);
    setDefError("");
    try {
      await adminSkillsApi.deleteSkillDefinition(skillDefinitionId);
      setSkillDefs((prev) => prev.filter((d) => d.skillDefinitionId !== skillDefinitionId));
    } catch (err) {
      setDefError(err.message);
    } finally {
      setBusyDefId("");
    }
  }

  const activeCategories = categories.filter((c) => c.isActive !== false);
  const activeSkillDefs = skillDefs.filter((d) => d.isActive !== false);

  return (
    <ViewFrame header={<AdminPageHeader title="Manage Skills" />}>
      <section className="admin-surface">
        <div className="admin-skills__layout">

          {/* ── Left: Categories ─────────────────────────────────────────── */}
          <div className="admin-skills__panel">
            <div className="admin-skills__panel-header">
              <h2 className="admin-skills__panel-title">
                Categories
                <span className="admin-skills__count">{activeCategories.length}</span>
              </h2>
            </div>

            <form className="admin-skills__create-form" onSubmit={handleCreateCategory}>
              <div className="admin-field">
                <label htmlFor="cat-name">Name</label>
                <input
                  id="cat-name"
                  className="admin-input"
                  placeholder="e.g. Design, IT, Marketing…"
                  value={catForm.categoryName}
                  onChange={(e) => setCatForm((p) => ({ ...p, categoryName: e.target.value }))}
                  required
                />
              </div>
              <div className="admin-field">
                <label htmlFor="cat-desc">Description</label>
                <input
                  id="cat-desc"
                  className="admin-input"
                  placeholder="Optional description"
                  value={catForm.description}
                  onChange={(e) => setCatForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <button
                type="submit"
                className="admin-button admin-skills__add-button"
                disabled={isCreatingCat}
              >
                <PlusIcon />
                {isCreatingCat ? "Adding…" : "Add category"}
              </button>
            </form>

            {catError ? <p className="admin-skills__error">{catError}</p> : null}

            <div className="admin-skills__list">
              {isLoadingCats ? (
                <p className="admin-muted" style={{ padding: "12px 0" }}>Loading…</p>
              ) : activeCategories.length === 0 ? (
                <p className="admin-muted" style={{ padding: "12px 0" }}>No categories yet.</p>
              ) : (
                activeCategories.map((cat) => (
                  <button
                    key={cat.categoryId}
                    type="button"
                    className={`admin-skills__cat-row${selectedCatId === cat.categoryId ? " admin-skills__cat-row--active" : ""}`}
                    onClick={() => setSelectedCatId(cat.categoryId)}
                  >
                    <span className="admin-skills__cat-name">{cat.categoryName}</span>
                    <span className="admin-skills__cat-desc">{cat.description || "—"}</span>
                    <button
                      type="button"
                      className="admin-skills__icon-button admin-skills__icon-button--danger"
                      title="Deactivate category"
                      disabled={busyCatId === cat.categoryId}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(cat.categoryId);
                      }}
                    >
                      <TrashIcon />
                    </button>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── Right: Skills in selected category ───────────────────────── */}
          <div className="admin-skills__panel">
            <div className="admin-skills__panel-header">
              <h2 className="admin-skills__panel-title">
                {selectedCategory ? (
                  <>
                    Skills — <span style={{ color: "#bd482d" }}>{selectedCategory.categoryName}</span>
                  </>
                ) : (
                  "Skills"
                )}
                {selectedCategory ? (
                  <span className="admin-skills__count">{activeSkillDefs.length}</span>
                ) : null}
              </h2>
            </div>

            {!selectedCatId ? (
              <p className="admin-muted admin-skills__placeholder">
                Select a category on the left to manage its skills.
              </p>
            ) : (
              <>
                <form className="admin-skills__create-form" onSubmit={handleCreateSkillDef}>
                  <div className="admin-field">
                    <label htmlFor="def-name">Skill name</label>
                    <input
                      id="def-name"
                      className="admin-input"
                      placeholder="e.g. JavaScript, Figma, Python…"
                      value={defForm.skillName}
                      onChange={(e) => setDefForm((p) => ({ ...p, skillName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="def-desc">Description</label>
                    <input
                      id="def-desc"
                      className="admin-input"
                      placeholder="Optional description"
                      value={defForm.description}
                      onChange={(e) => setDefForm((p) => ({ ...p, description: e.target.value }))}
                    />
                  </div>
                  <button
                    type="submit"
                    className="admin-button admin-skills__add-button"
                    disabled={isCreatingDef}
                  >
                    <PlusIcon />
                    {isCreatingDef ? "Adding…" : "Add skill"}
                  </button>
                </form>

                {defError ? <p className="admin-skills__error">{defError}</p> : null}

                <div className="admin-skills__list">
                  {isLoadingDefs ? (
                    <p className="admin-muted" style={{ padding: "12px 0" }}>Loading…</p>
                  ) : activeSkillDefs.length === 0 ? (
                    <p className="admin-muted" style={{ padding: "12px 0" }}>
                      No skills in this category yet.
                    </p>
                  ) : (
                    activeSkillDefs.map((def) => (
                      <div key={def.skillDefinitionId} className="admin-skills__def-row">
                        <div className="admin-skills__def-info">
                          <span className="admin-skills__def-name">{def.skillName}</span>
                          {def.description ? (
                            <span className="admin-skills__cat-desc">{def.description}</span>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="admin-skills__icon-button admin-skills__icon-button--danger"
                          title="Deactivate skill"
                          disabled={busyDefId === def.skillDefinitionId}
                          onClick={() => handleDeleteSkillDef(def.skillDefinitionId)}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

        </div>
      </section>
    </ViewFrame>
  );
}

export default AdminSkills;
