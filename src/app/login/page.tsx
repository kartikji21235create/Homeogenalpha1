"use client";

import React, { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-anon-key"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setError(signInError.message);
        } else {
          // Redirect to dashboard on successful login
          window.location.href = "/";
        }
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: email.split("@")[0],
            },
          },
        });
        if (signUpError) {
          setError(signUpError.message);
        } else {
          setMessage(
            "Account created! Please check your email for a verification link, then log in."
          );
          setMode("login");
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Branding */}
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-bg font-bold font-display text-2xl mb-4">
            H
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Homeogenalpha1
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Clinical Decision Support for Homoeopathy
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-surface rounded-xl border border-border p-6 space-y-5"
        >
          <h2 className="text-lg font-semibold text-text-primary">
            {mode === "login" ? "Sign In" : "Create Account"}
          </h2>

          {error && (
            <div className="rounded-md border border-danger/60 bg-danger/10 px-3 py-2 text-xs text-danger">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-md border border-accent/60 bg-accent/10 px-3 py-2 text-xs text-accent">
              {message}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              placeholder="doctor@clinic.example"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={6}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg hover:bg-accent-strong disabled:opacity-50 transition"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Sign In"
              : "Create Account"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError(null);
                setMessage(null);
              }}
              className="text-xs text-accent hover:underline"
            >
              {mode === "login"
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </form>

        <p className="text-center text-[10px] text-text-secondary">
          DPDP Act 2023 Compliant &middot; Release 1 &middot; Kent 1897 Public Domain Data
        </p>
      </div>
    </div>
  );
}
