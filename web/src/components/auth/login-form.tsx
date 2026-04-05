"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const confirmed = searchParams.get("confirmed");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (user) {
      const { error: upsertError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: user.email ?? email,
          username: (user.user_metadata?.username as string) ?? null,
          first_name: (user.user_metadata?.first_name as string) ?? null,
          last_name: (user.user_metadata?.last_name as string) ?? null,
        },
        { onConflict: "id" },
      );
      if (upsertError) {
        console.error("MYDEBUG →", upsertError.message);
      }
    }

    router.push(next);
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="login-card mx-auto w-full max-w-md rounded-2xl border bg-card p-8 shadow-md">
      <h2 className="text-center text-2xl font-bold tracking-wide">LOGIN</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Logging in…" : "LOG IN"}
        </Button>
        {message ? (
          <p className="text-sm text-destructive" role="alert">
            {message}
          </p>
        ) : null}
        {confirmed ? (
          <p className="text-sm text-green-600">
            Your email is confirmed. Please log in.
          </p>
        ) : null}
      </form>
      <div className="mt-6 space-y-2 text-center text-sm">
        <p>
          Need to register?{" "}
          <Link href="/register" className="font-medium text-primary underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
