"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const COOLDOWN_MS = 30_000;

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<number | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (lastSubmission && now - lastSubmission < COOLDOWN_MS) {
      setError(
        `Please wait ${Math.ceil((COOLDOWN_MS - (now - lastSubmission)) / 1000)} seconds before sending again.`,
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }),
      });
      const data = (await res.json()) as { error?: string; retryAfterSec?: number };

      if (!res.ok) {
        if (res.status === 429 && data.retryAfterSec) {
          setError(`Too many requests. Retry in ${data.retryAfterSec}s.`);
        } else {
          setError(data.error ?? "Something went wrong. Please try again.");
        }
        return;
      }

      setSubmitted(true);
      setLastSubmission(now);
      setForm({ name: "", email: "", message: "" });
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="login-card mx-auto w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-md">
        <p className="text-green-600">
          Thank you for contacting us. We will respond as soon as possible.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => setSubmitted(false)}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <div className="login-card mx-auto w-full max-w-md rounded-2xl border bg-card p-8 shadow-md">
      <p className="mb-6 text-center text-sm text-muted-foreground">
        Enter your details below. A team member will respond soon.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            required
            maxLength={100}
            value={form.name}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            name="message"
            required
            rows={4}
            maxLength={1000}
            value={form.message}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Sending…" : "Send message"}
        </Button>
        {error ? (
          <p className="text-center text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
