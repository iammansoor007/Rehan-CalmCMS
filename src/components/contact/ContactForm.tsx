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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-brand-dark mb-1.5">
            Your Full Name *
          </label>
          <input
            type="text"
            required
            placeholder="Sarah Johnson"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-sm text-brand-dark focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-brand-dark mb-1.5">
            Email Address *
          </label>
          <input
            type="email"
            required
            placeholder="sarah@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-sm text-brand-dark focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-brand-dark mb-1.5">
          Subject Topic
        </label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-sm text-brand-dark focus:outline-none focus:border-primary transition-colors"
        >
          {subjects.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-brand-dark mb-1.5">
          Your Message *
        </label>
        <textarea
          required
          rows={5}
          placeholder="How can we help you or what topic would you like us to cover?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-sm text-brand-dark focus:outline-none focus:border-primary transition-colors resize-y"
        />
      </div>

      <button
        type="submit"
        className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark shadow-sm transition-all duration-200 inline-flex items-center justify-center gap-2"
      >
        <span>{buttonText}</span>
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}
