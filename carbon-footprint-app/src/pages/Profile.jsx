/**
 * ============================================================
 *  File: Profile.jsx
 *  Component: Profile
 *
 *  Description:
 *  User account management screen. Lets users view & edit profile
 *  details (name, email, location), set preferred units (kg/lb),
 *  pick a visual theme, toggle public leaderboard visibility,
 *  change their password, and permanently delete the account.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import { useEffect, useState } from "react";
import {
  getProfile,
  patchProfile,
  deleteAccount,
  changePassword,
} from "../services/profile";
import { useUnits } from "../context/UnitsContext";
import ThemeSelect from "../components/ui/ThemeSelect";
import FrostedSelect from "../components/ui/FrostedSelect";
import { applyTheme, getSavedTheme } from "../theme/themes";

// ---- Units & helpers (kg/lb) ----
const KG = "kg";
const LB = "lb";
const LB_PER_KG = 2.2046226218;
// Convert helpers keep empty/null as empty string for controlled input UX
const kgToLb = (kg) => (kg === "" || kg == null ? "" : +(kg * LB_PER_KG).toFixed(2));
const lbToKg = (lb) => (lb === "" || lb == null ? "" : +(lb / LB_PER_KG).toFixed(2));

export default function Profile() {
  // Apply saved theme on mount so the page honors user’s previous selection
  useEffect(() => {
    applyTheme(getSavedTheme());
  }, []);

  // Global units context: reflects + updates app-wide units (kg/lb)
  const { units: globalUnits, changeUnits } = useUnits();

  // ----- Page state -----
  const [loading, setLoading] = useState(true);   // initial profile load
  const [saving, setSaving] = useState(false);    // profile form save state
  const [msg, setMsg] = useState(null);           // inline notice for profile actions

  // Profile form model (controlled inputs)
  const [form, setForm] = useState({
    name: "",
    email: "",
    location: "",
    units: KG,
    annual_target_value: "",
    privacy_public: false,
  });

  // Change-password subform state
  const [pwForm, setPwForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [pwSaving, setPwSaving] = useState(false);  // password submit state
  const [pwMsg, setPwMsg] = useState(null);         // inline notice for password actions

  // Delete account modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const deletePhrase = "delete my account"; // phrase user must type to confirm
  const canDelete = confirmText.trim().toLowerCase() === deletePhrase;

  // ----- Initial profile fetch + hydrate form and global units -----
  useEffect(() => {
    (async () => {
      try {
        const p = await getProfile();
        const fetchedUnits = p.units === LB ? LB : KG;

        // Pre-fill form; convert annual target to requested display units
        setForm({
          name: p.name || "",
          email: p.email || "",
          location: p.location || "",
          units: fetchedUnits,
          annual_target_value:
            fetchedUnits === LB ? kgToLb(p.annual_target_kg) : p.annual_target_kg ?? "",
          privacy_public: !!p.privacy_public,
        });

        // Keep global units in sync with profile
        if (fetchedUnits !== globalUnits) changeUnits(fetchedUnits);
      } catch (e) {
        setMsg(e.message);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Simple setter for form fields
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Handle unit switch in the form: convert the target value and update units field
  function onUnits(u) {
    if (u === form.units) return;
    const v = parseFloat(form.annual_target_value);
    setForm((f) => ({
      ...f,
      units: u,
      annual_target_value: isNaN(v) ? "" : u === LB ? kgToLb(v) : lbToKg(v),
    }));
  }

  // Submit profile changes: validates inputs, converts units back to kg for API
  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      if (!form.name.trim()) throw new Error("Please enter your name.");
      if (!/^\S+@\S+\.\S+$/.test(form.email)) throw new Error("Enter a valid email.");

      const v =
        form.annual_target_value === "" ? null : parseFloat(form.annual_target_value);
      const annual_target_kg = v == null ? null : form.units === LB ? lbToKg(v) : v;

      await patchProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        location: form.location.trim(),
        units: form.units,
        annual_target_kg,
        privacy_public: form.privacy_public ? 1 : 0,
      });

      // Reflect chosen units globally after saving
      changeUnits(form.units);

      setMsg("Profile saved.");
    } catch (err) {
      setMsg(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  // Password form field setter
  function setPwField(k, v) {
    setPwForm((f) => ({ ...f, [k]: v }));
  }

  // Change password: basic client-side validation, then API call
  async function onChangePassword(e) {
    e.preventDefault();
    setPwSaving(true);
    setPwMsg(null);
    try {
      const { current_password, new_password, confirm_password } = pwForm;
      if (!current_password || !new_password || !confirm_password) {
        throw new Error("All password fields are required.");
      }
      if (new_password.length < 8) {
        throw new Error("New password must be at least 8 characters.");
      }
      if (new_password !== confirm_password) {
        throw new Error("New passwords do not match.");
      }

      await changePassword({ current_password, new_password, confirm_password });

      setPwMsg("Password updated.");
      setPwForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      setPwMsg(err.message || "Failed to update password.");
    } finally {
      setPwSaving(false);
    }
  }

  // Confirmed account deletion flow; redirects to home after success
  async function confirmDelete() {
    if (!canDelete) return;
    setDeleting(true);
    try {
      await deleteAccount();
      window.location.href = "";
    } catch (e) {
      // Reuse top-level msg as inline error and close modal
      setMsg(e.message || "Failed to delete account.");
      setConfirmOpen(false);
      setConfirmText("");
    } finally {
      setDeleting(false);
    }
  }

  // Initial loading state
  if (loading) return <div className="p-4 text-fg">Loading…</div>;

  // Style helpers for notices (success vs neutral)
  const noticeClass =
    msg && msg.toLowerCase().includes("saved")
      ? "text-successFg bg-successBg border-successFg/20"
      : "text-fg bg-surfaceVariant border-border";

  const pwNoticeClass =
    pwMsg && pwMsg.toLowerCase().includes("updated")
      ? "text-successFg bg-successBg border-successFg/20"
      : "text-fg bg-surfaceVariant border-border";

  // Units dropdown options for FrostedSelect
  const unitOptions = [
    { value: KG, label: "kg" },
    { value: LB, label: "lb" },
  ];

  return (
    <div className="p-4 max-w-2xl mx-auto bg-bg text-fg">
      {/* Header with theme selector on the right */}
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <div className="ml-auto">
          <ThemeSelect />
        </div>
      </div>

      {/* Top-level notice for profile save/delete errors or success */}
      {msg && (
        <div className={`mb-3 text-sm px-3 py-2 rounded border ${noticeClass}`}>
          {msg}
        </div>
      )}

      {/* Profile details form */}
      <form
        onSubmit={onSave}
        className="bg-surface border border-border rounded p-4 space-y-4 shadow-subtle"
      >
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            className="w-full border border-border rounded px-3 py-2 bg-surface text-fg focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            className="w-full border border-border rounded px-3 py-2 bg-surface text-fg focus:outline-none focus:ring-1 focus:ring-primary"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
          />
        </div>

        {/* Units selector (FrostedSelect) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Units</label>
            <FrostedSelect
              className="w-full"
              value={form.units}
              onChange={onUnits}
              options={unitOptions}
              placeholder="kg"
            />
          </div>
        </div>

        {/* Privacy toggle with helper text */}
        <div className="pt-2 border-t border-border">
          <label className="block text-sm font-medium mb-2">Privacy</label>
          <div className="flex items-start gap-3">
            <input
              id="privacy_public"
              type="checkbox"
              className="mt-1 h-4 w-4 accent-primary"
              checked={!!form.privacy_public}
              onChange={(e) => setField("privacy_public", e.target.checked)}
            />
            <div>
              <label htmlFor="privacy_public" className="font-medium">
                Show me on the global leaderboard
              </label>
              <p className="text-sm text-muted mt-1">
                When enabled, your name and leaderboard totals are visible to all users.
                Your friends leaderboard isn’t affected.
              </p>
            </div>
          </div>
        </div>

        {/* Save button */}
        <button
          className="bg-primary text-primaryContrast px-4 py-2 rounded disabled:opacity-60"
          disabled={saving}
          type="submit"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>

      {/* Change password section */}
      <div className="mt-8 border border-border rounded p-4 bg-surface shadow-subtle">
        <h2 className="font-semibold mb-2">Change password</h2>
        {/* Inline password notice */}
        {pwMsg && (
          <div className={`mb-3 text-sm px-3 py-2 rounded border ${pwNoticeClass}`}>
            {pwMsg}
          </div>
        )}
        <form className="space-y-3" onSubmit={onChangePassword}>
          {/* Current password */}
          <div>
            <label className="block text-sm font-medium mb-1">Current password</label>
            <input
              type="password"
              className="w-full border border-border rounded px-3 py-2 bg-surface text-fg focus:outline-none focus:ring-1 focus:ring-primary"
              value={pwForm.current_password}
              onChange={(e) => setPwField("current_password", e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {/* New password */}
          <div>
            <label className="block text-sm font-medium mb-1">New password</label>
            <input
              type="password"
              className="w-full border border-border rounded px-3 py-2 bg-surface text-fg focus:outline-none focus:ring-1 focus:ring-primary"
              value={pwForm.new_password}
              onChange={(e) => setPwField("new_password", e.target.value)}
              required
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium mb-1">Confirm new password</label>
            <input
              type="password"
              className="w-full border border-border rounded px-3 py-2 bg-surface text-fg focus:outline-none focus:ring-1 focus:ring-primary"
              value={pwForm.confirm_password}
              onChange={(e) => setPwField("confirm_password", e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          {/* Update password button */}
          <button
            className="bg-fg text-primaryContrast px-4 py-2 rounded disabled:opacity-60"
            disabled={pwSaving}
            type="submit"
          >
            {pwSaving ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>

      {/* Danger zone: account deletion trigger */}
      <div className="mt-8 bg-errorBg/20 border border-errorFg/20 rounded p-4">
        <h2 className="font-semibold text-errorFg mb-2">Danger zone</h2>
        <button
          onClick={() => {
            setConfirmText("");
            setConfirmOpen(true);
          }}
          className="border border-errorFg text-errorFg px-3 py-2 rounded hover:bg-errorBg/10"
          type="button"
        >
          Delete my account
        </button>
      </div>

      {/* Delete confirmation modal (type-to-confirm) */}
      {confirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop closes modal when not deleting */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deleting && setConfirmOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-xl border border-border bg-surface shadow-lg p-4">
            <h3 id="delete-title" className="text-lg font-semibold text-errorFg">
              Confirm account deletion
            </h3>
            <p className="text-sm text-muted mt-1">
              This action is permanent and will remove your data. To confirm, type{" "}
              <span className="font-semibold text-fg">“{deletePhrase}”</span> below.
            </p>

            {/* Phrase input must match deletePhrase to enable the destructive action */}
            <input
              autoFocus
              className="mt-3 w-full border border-border rounded px-3 py-2 bg-surface text-fg focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder={deletePhrase}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={deleting}
            />

            {/* Modal actions */}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => !deleting && setConfirmOpen(false)}
                className="px-3 py-2 rounded border border-border hover:bg-surfaceVariant"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={!canDelete || deleting}
                className={`px-3 py-2 rounded border ${
                  canDelete
                    ? "border-errorFg text-errorFg hover:bg-errorBg/10"
                    : "border-border text-muted"
                }`}
              >
                {deleting ? "Deleting…" : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
