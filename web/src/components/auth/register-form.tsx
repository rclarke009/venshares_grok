"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** MVP registration: minimal PII per product plan (no SSN/EIN/DOB). */
export function RegisterForm() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    first_name: "",
    last_name: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          username: form.username,
          first_name: form.first_name,
          last_name: form.last_name,
        },
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        "Check your email to confirm your account, then you can log in.",
      );
    }
    setLoading(false);
  };

  return (
    <div className="login-card mx-auto w-full max-w-md rounded-2xl border bg-card p-8 shadow-md">
      <h2 className="text-center text-2xl font-bold tracking-wide">REGISTER</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            required
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="first_name">First name</Label>
          <Input
            id="first_name"
            name="first_name"
            required
            value={form.first_name}
            onChange={handleChange}
            autoComplete="given-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last name</Label>
          <Input
            id="last_name"
            name="last_name"
            required
            value={form.last_name}
            onChange={handleChange}
            autoComplete="family-name"
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
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Register"}
        </Button>
        {message ? (
          <p
            className={`text-sm ${message.includes("Check your email") ? "text-green-600" : "text-destructive"}`}
            role="status"
          >
            {message}
          </p>
        ) : null}
      </form>
      <p className="mt-6 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
