"use client";

import React, { useState } from "react";
import { useToast } from "@/components/layout/Toast";
import { Send } from "lucide-react";

interface ContactFormProps {
  subjects: string[];
  buttonText: string;
  recipientEmail: string;
  /** Toast shown after sending. "{name}" is replaced with the sender's name. */
  successMessage: string;
}

export function ContactForm({ subjects, buttonText, recipientEmail, successMessage }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(subjects[0] || "General Inquiry");
  const [message, setMessage] = useState("");
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast("Please fill in all required fields.");
      return;
    }

    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
    } catch (err) {
      console.warn("Could not record inquiry in database:", err);
    }

    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(
      `[${subject}] Inquiry from ${name}`
    )}&body=${encodeURIComponent(`Sender Name: ${name}\nSender Email: ${email}\n\nMessage:\n${message}`)}`;

    window.location.href = mailtoUrl;
    showToast(successMessage.replace("{name}", name));
    setName("");
    setEmail("");
    setMessage("");
  };

  const fieldCls =
    "w-full px-4 py-3 rounded-lg border border-brand-border bg-brand-bgSoft text-[0.95rem] text-brand-dark transition-all focus:outline-none focus:border-primary focus:bg-white focus:ring-[3px] focus:ring-primary/15";
  const labelCls = "block text-[0.88rem] font-semibold text-brand-dark mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>
            Your Full Name *
          </label>
          <input
            type="text"
            required
            placeholder="Sarah Johnson"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldCls}
          />
        </div>
        <div>
          <label className={labelCls}>
            Email Address *
          </label>
          <input
            type="email"
            required
            placeholder="sarah@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>
          Subject Topic
        </label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={fieldCls}
        >
          {subjects.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelCls}>
          Your Message *
        </label>
        <textarea
          required
          rows={5}
          placeholder="How can we help you or what topic would you like us to cover?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${fieldCls} resize-y`}
        />
      </div>

      <button
        type="submit"
        className="w-full mt-2 px-6 py-3.5 rounded-full bg-primary text-white text-base font-semibold hover:bg-primary-dark hover:-translate-y-0.5 transition-all shadow-[0_4px_14px_rgba(78,110,88,0.25)] inline-flex items-center justify-center gap-2"
      >
        <Send className="w-[18px] h-[18px]" />
        <span>{buttonText}</span>
      </button>
    </form>
  );
}
