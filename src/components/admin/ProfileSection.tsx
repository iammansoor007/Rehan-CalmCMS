"use client";

import React, { useState } from "react";
import { Save } from "lucide-react";
import { Role, roleLabel } from "@/lib/permissions";
import { useToast } from "@/components/layout/Toast";
import { api, cardCls, cardTitleCls, inputCls, labelCls, primaryBtnCls } from "./shared";

interface ProfileSectionProps {
  me: { username: string; displayName: string; email: string; role: Role };
  onSaved: () => void;
}

export function ProfileSection({ me, onSaved }: ProfileSectionProps) {
  const { showToast } = useToast();
  const [displayName, setDisplayName] = useState(me.displayName);
  const [email, setEmail] = useState(me.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      showToast("The new passwords do not match.");
      return;
    }

    setSaving(true);
    const res = await api("/api/admin/auth", {
      method: "PUT",
      body: JSON.stringify({ displayName, email, currentPassword, newPassword }),
    });
    setSaving(false);

    if (!res.ok) {
      showToast(res.error);
      return;
    }
    showToast("Profile updated!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    onSaved();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading font-bold text-2xl text-brand-dark mb-1">My Profile</h1>
        <p className="text-xs text-brand-muted">
          Signed in as <strong>@{me.username}</strong> · {roleLabel(me.role)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
        <div className={`${cardCls} space-y-4`}>
          <h3 className={cardTitleCls}>Your Details</h3>
          <div>
            <label className={labelCls}>Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className={`${cardCls} space-y-4`}>
          <h3 className={cardTitleCls}>Change Password</h3>
          <div>
            <label className={labelCls}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className={inputCls}
              />
            </div>
          </div>
          <p className="text-[11px] text-brand-muted">Leave these blank to keep your current password.</p>
        </div>

        <button type="submit" disabled={saving} className={`${primaryBtnCls} px-6 py-2.5`}>
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving…" : "Update Profile"}</span>
        </button>
      </form>
    </div>
  );
}
