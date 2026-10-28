
import { useState } from "react";
import {
  Activity,
  LockKeyhole,
  UserRound,
} from "lucide-react";
import { registerUser } from "../services/authService";

export default function Register({ onShowLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    const normalizedUsername = username.trim();

    if (normalizedUsername.length < 3) {
      setError("Username must contain at least 3 characters.");
      return;
    }

    if (password.length < 4) {
      setError("Password must contain at least 4 characters.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await registerUser({
        username: normalizedUsername,
        password,
      });

      setSuccess("Account created successfully. You can now sign in.");
      setUsername("");
      setPassword("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 py-10 text-zinc-100">
      <section
        aria-labelledby="register-title"
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111113] p-7 shadow-2xl sm:p-9"
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-white p-3 text-black">
            <Activity size={24} aria-hidden="true" />
          </div>

          <div>
            <h1 className="text-xl font-bold">CodeLens</h1>
            <p className="text-xs text-zinc-500">
              Create your account
            </p>
          </div>
        </div>

        <h2 id="register-title" className="text-2xl font-semibold">
          Get started
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Register to access your dashboard.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label
              htmlFor="register-username"
              className="mb-2 block text-sm text-zinc-300"
            >
              Username
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 focus-within:border-white/25">
              <UserRound
                size={18}
                aria-hidden="true"
                className="shrink-0 text-zinc-500"
              />

              <input
                id="register-username"
                name="username"
                type="text"
                required
                minLength={3}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  setError("");
                  setSuccess("");
                }}
                placeholder="Choose a username"
                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-zinc-600"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="register-password"
              className="mb-2 block text-sm text-zinc-300"
            >
              Password
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 focus-within:border-white/25">
              <LockKeyhole
                size={18}
                aria-hidden="true"
                className="shrink-0 text-zinc-500"
              />

              <input
                id="register-password"
                name="password"
                type="password"
                required
                minLength={4}
                autoComplete="new-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                  setSuccess("");
                }}
                placeholder="Create a password"
                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-zinc-600"
              />
            </div>

            <p className="mt-2 text-xs text-zinc-500">
              Use at least 4 characters, subject to your server's password rules.
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300"
            >
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Already registered?{" "}
          <button
            type="button"
            onClick={onShowLogin}
            disabled={loading}
            className="font-medium text-white underline underline-offset-4 hover:text-zinc-300 disabled:opacity-50"
          >
            Sign in
          </button>
        </p>
      </section>
    </main>
  );
}
