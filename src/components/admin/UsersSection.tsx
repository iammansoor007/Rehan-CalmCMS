"use client";

import React, { useState } from "react";
import { Edit, Eye, EyeOff, KeyRound, Plus, Save, Trash2 } from "lucide-react";
import { CmsUser } from "@/types/cms";
import { ROLES, Role, roleLabel } from "@/lib/permissions";
import { useToast } from "@/components/layout/Toast";
import {
  api,
  cardCls,
  cardTitleCls,
  inputCls,
  labelCls,
  primaryBtnCls,
  secondaryBtnCls,
} from "./shared";

interface UsersSectionProps {
  users: CmsUser[];
  meUsername: string;
  onChanged: () => void;
}

const ROLE_STYLE: Record<Role, string> = {
  administrator: "bg-rose-100 text-rose-800",
  editor: "bg-sky-100 text-sky-800",
  author: "bg-emerald-100 text-emerald-800",
  contributor: "bg-slate-100 text-slate-700",
};

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  const bytes = new Uint32Array(14);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export function UsersSection({ users, meUsername, onChanged }: UsersSectionProps) {
  const { showToast } = useToast();

  // `editing` holds the id of the user being edited (null = adding a new one).
  const [editing, setEditing] = useState<CmsUser | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>("author");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setEditing(null);
    setUsername("");
    setEmail("");
    setDisplayName("");
    setPassword("");
    setShowPassword(false);
    setRole("author");
  };

  const startEdit = (u: CmsUser) => {
    setEditing(u);
    setUsername(u.username);
    setEmail(u.email);
    setDisplayName(u.displayName);
    setPassword("");
    setRole(u.role);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = editing
      ? await api("/api/admin/users", {
          method: "PUT",
          body: JSON.stringify({ id: editing.id, email, displayName, role, password }),
        })
      : await api("/api/admin/users", {
          method: "POST",
          body: JSON.stringify({ username, email, displayName, role, password }),
        });
    setSaving(false);

    if (!res.ok) {
      showToast(res.error);
      return;
    }
    showToast(editing ? `User "${editing.username}" updated!` : `User "${username}" created!`);
    reset();
    onChanged();
  };

  const handleDelete = async (u: CmsUser) => {
    if (!confirm(`Delete user "${u.username}"? They will no longer be able to log in.`)) return;
    const res = await api(`/api/admin/users?id=${encodeURIComponent(u.id)}`, { method: "DELETE" });
    if (res.ok) {
      showToast("User deleted");
      if (editing?.id === u.id) reset();
      onChanged();
    } else {
      showToast(res.error);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-heading font-bold text-2xl text-brand-dark mb-1">Users</h1>
        <p className="text-xs text-brand-muted">
          Add team members and choose what each person is allowed to do in the admin panel.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-5 space-y-5">
          <div className={`${cardCls} space-y-4`}>
            <h3 className={cardTitleCls}>{editing ? `Edit User: ${editing.username}` : "Add New User"}</h3>

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div>
                <label className={labelCls}>Username *</label>
                <input
                  type="text"
                  required
                  disabled={!!editing}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. sara.editor"
                  autoComplete="off"
                  className={`${inputCls} ${editing ? "bg-brand-bgSoft" : ""}`}
                />
                <p className="text-[11px] text-brand-muted mt-1">
                  {editing
                    ? "Usernames cannot be changed."
                    : "Letters, numbers, dots, dashes and underscores."}
                </p>
              </div>

              <div>
                <label className={labelCls}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="off"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Shown as the post author"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>{editing ? "New Password" : "Password *"}</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      required={!editing}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={editing ? "Leave blank to keep the current password" : "At least 8 characters"}
                      autoComplete="new-password"
                      className={`${inputCls} pr-9`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-dark"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPassword(generatePassword());
                      setShowPassword(true);
                    }}
                    className={secondaryBtnCls}
                    title="Generate a strong password"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Generate</span>
                  </button>
                </div>
              </div>

              <div>
                <label className={labelCls}>Role *</label>
                <select value={role} onChange={(e) => setRole(e.target.value as Role)} className={inputCls}>
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-brand-muted mt-1">
                  {ROLES.find((r) => r.value === role)?.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button type="submit" disabled={saving} className={primaryBtnCls}>
                  {editing ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{saving ? "Saving…" : editing ? "Update User" : "Add New User"}</span>
                </button>
                {editing && (
                  <button type="button" onClick={reset} className={secondaryBtnCls}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className={`${cardCls} !p-5 space-y-3`}>
            <h3 className={cardTitleCls}>What each role can do</h3>
            <ul className="space-y-2.5">
              {ROLES.map((r) => (
                <li key={r.value} className="text-xs text-brand-muted leading-relaxed">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mr-1.5 ${ROLE_STYLE[r.value]}`}
                  >
                    {r.label}
                  </span>
                  {r.description}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Table */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#DCDCDE] shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-bgSoft border-b border-[#DCDCDE] text-brand-dark font-bold">
                <th className="p-3.5">User</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-borderLight">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-brand-bgSoft/60 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {(u.displayName || u.username).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <button
                          onClick={() => startEdit(u)}
                          className="text-sm font-semibold text-brand-dark hover:text-primary block text-left"
                        >
                          {u.displayName}
                        </button>
                        <span className="text-[11px] text-brand-muted">
                          @{u.username}
                          {u.username === meUsername && " (you)"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 text-brand-muted">{u.email || "—"}</td>
                  <td className="p-3.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${ROLE_STYLE[u.role]}`}
                    >
                      {roleLabel(u.role)}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => startEdit(u)}
                        className="p-1.5 rounded text-brand-muted hover:text-primary hover:bg-brand-bgLight"
                        title="Edit user"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {u.username !== meUsername && (
                        <button
                          onClick={() => handleDelete(u)}
                          className="p-1.5 rounded text-brand-muted hover:text-red-600 hover:bg-red-50"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
