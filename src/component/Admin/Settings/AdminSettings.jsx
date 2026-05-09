import { useEffect, useMemo, useState } from "react";
import ViewFrame from "../../Dashboard/Layout/ViewFrame/ViewFrame.jsx";
import AdminPageHeader from "../AdminPageHeader.jsx";
import { adminApi } from "../../../api/client.js";
import "../adminUi.css";

const SETTINGS_PRESETS = [
  {
    key: "max_daily_sessions",
    value: "5",
    description: "Maximum number of sessions a user can book per day.",
  },
  {
    key: "max_project_members",
    value: "12",
    description: "Maximum number of members allowed in a project.",
  },
  {
    key: "maintenance_mode_enabled",
    value: "false",
    description: "Enable maintenance mode for the platform.",
  },
  {
    key: "mentor_validation_auto_approve",
    value: "false",
    description: "Automatically approve mentor validation requests.",
  },
  {
    key: "platform_support_email",
    value: "support@fenneky.com",
    description: "Support contact email shown to users.",
  },
];

function AdminSettings() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [busyKey, setBusyKey] = useState("");
  const [createForm, setCreateForm] = useState({
    key: "",
    value: "",
    description: "",
  });

  const items = data ?? [];

  useEffect(() => {
    let isActive = true;

    async function loadSettings() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await adminApi.listSettings();
        if (!isActive) return;
        setData(response);
      } catch (error) {
        if (!isActive) return;
        setErrorMessage(error.message);
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadSettings();
    return () => {
      isActive = false;
    };
  }, []);

  const title = useMemo(() => {
    return `Settings (${items.length})`;
  }, [items.length]);

  const handleUpdate = async (settingKey, event) => {
    event.preventDefault();
    const valueInput = event.target.elements.namedItem("value")?.value ?? "";
    const description = event.target.elements.namedItem("description")?.value ?? "";

    setBusyKey(settingKey);
    setErrorMessage("");

    let value = valueInput;
    const trimmed = String(valueInput).trim();
    if (trimmed === "true") value = true;
    if (trimmed === "false") value = false;
    if (trimmed !== "" && !Number.isNaN(Number(trimmed)) && String(Number(trimmed)) === trimmed) {
      value = Number(trimmed);
    }

    try {
      await adminApi.updateSetting(settingKey, { value, description });
      const response = await adminApi.listSettings();
      setData(response);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyKey("");
    }
  };

  const handleCreateOrUpdate = async (event) => {
    event.preventDefault();
    const settingKey = createForm.key.trim();

    if (!settingKey) {
      setErrorMessage("Setting key is required.");
      return;
    }

    setBusyKey(settingKey);
    setErrorMessage("");

    let value = createForm.value;
    const trimmed = String(createForm.value).trim();
    if (trimmed === "true") value = true;
    if (trimmed === "false") value = false;
    if (trimmed !== "" && !Number.isNaN(Number(trimmed)) && String(Number(trimmed)) === trimmed) {
      value = Number(trimmed);
    }

    try {
      await adminApi.updateSetting(settingKey, {
        value,
        description: createForm.description,
      });
      const response = await adminApi.listSettings();
      setData(response);
      setCreateForm({ key: "", value: "", description: "" });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyKey("");
    }
  };

  const applyPreset = (preset) => {
    setCreateForm({
      key: preset.key,
      value: preset.value,
      description: preset.description,
    });
    setErrorMessage("");
  };

  return (
    <ViewFrame header={<AdminPageHeader title={title} />}>
      <section className="admin-surface">
        <div className="admin-card" style={{ marginBottom: 14, padding: 14 }}>
          <p className="admin-muted" style={{ margin: "0 0 10px 0" }}>
            Quick presets
          </p>
          <div className="admin-toolbar__group">
            {SETTINGS_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                className="admin-button admin-button--ghost"
                onClick={() => applyPreset(preset)}
              >
                {preset.key}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-card" style={{ marginBottom: 14 }}>
          <form onSubmit={handleCreateOrUpdate} className="admin-toolbar" style={{ padding: 14 }}>
            <div className="admin-toolbar__group">
              <div className="admin-field">
                <label htmlFor="admin-setting-key">Setting key</label>
                <input
                  id="admin-setting-key"
                  className="admin-input"
                  placeholder="e.g. max_daily_sessions"
                  value={createForm.key}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, key: e.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label htmlFor="admin-setting-value">Value</label>
                <input
                  id="admin-setting-value"
                  className="admin-input"
                  placeholder="e.g. 5 / true / some text"
                  value={createForm.value}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, value: e.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label htmlFor="admin-setting-description">Description</label>
                <input
                  id="admin-setting-description"
                  className="admin-input"
                  placeholder="optional description"
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  style={{ minWidth: 260 }}
                />
              </div>
            </div>
            <div className="admin-toolbar__group">
              <button
                type="submit"
                className="admin-button"
                disabled={isLoading || busyKey === createForm.key.trim()}
              >
                Save setting
              </button>
            </div>
          </form>
        </div>

        {errorMessage ? <p className="admin-muted">{errorMessage}</p> : null}
        {isLoading ? <p className="admin-muted">Loading settings...</p> : null}

        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
                <th>Description</th>
                <th style={{ width: 160 }}>Save</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="admin-muted">
                    No settings yet.
                  </td>
                </tr>
              ) : (
                items.map((setting) => {
                  const key = setting.settingKey || setting.key || "";
                  const isBusy = busyKey === key;
                  return (
                    <tr key={key}>
                      <td>
                        <strong>{key || "—"}</strong>
                        <div className="admin-muted">{setting.settingId || ""}</div>
                      </td>
                      <td colSpan={3}>
                        <form onSubmit={(e) => handleUpdate(key, e)}>
                          <div className="admin-toolbar__group">
                            <input
                              className="admin-input"
                              name="value"
                              defaultValue={setting.settingValue ?? ""}
                              placeholder="Value (string/number/true/false)"
                              style={{ minWidth: 220 }}
                            />
                            <input
                              className="admin-input"
                              name="description"
                              defaultValue={setting.description ?? ""}
                              placeholder="Description (optional)"
                              style={{ minWidth: 260 }}
                            />
                            <button type="submit" className="admin-button" disabled={isBusy}>
                              Save
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </ViewFrame>
  );
}

export default AdminSettings;

