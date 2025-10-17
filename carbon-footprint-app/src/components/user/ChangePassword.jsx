/**
 * ============================================================
 *  File: ChangePassword.jsx
 *  Component: ChangePassword
 *
 *  Description:
 *  A secure form that allows users to update their account password.
 *  Integrates with the backend profile service and displays success or
 *  error messages via a toast notification.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import { useState } from "react";
import { changePassword } from "../../services/profile";
import InputField from "../ui/InputField";
import Button from "../ui/Button";
import ToastNotification from "../ui/ToastNotification";

export default function ChangePassword() {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await changePassword(form);
      setToast({ type: "success", message: "Password updated." });
      setForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Failed to update password",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-8 border border-border rounded-lg p-4 bg-surface text-fg shadow-subtle">
      <h2 className="font-semibold mb-3">Change password</h2>

      {toast && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <form className="space-y-3" onSubmit={onSubmit}>
        <InputField
          type="password"
          label="Current password"
          required
          value={form.current_password}
          onChange={(e) => set("current_password", e.target.value)}
        />
        <InputField
          type="password"
          label="New password"
          required
          placeholder="At least 8 characters"
          value={form.new_password}
          onChange={(e) => set("new_password", e.target.value)}
        />
        <InputField
          type="password"
          label="Confirm new password"
          required
          value={form.confirm_password}
          onChange={(e) => set("confirm_password", e.target.value)}
        />

        <Button type="submit" disabled={saving}>
          {saving ? "Updating…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
