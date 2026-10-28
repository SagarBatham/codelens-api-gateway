
import { useState } from "react";
import {
  Activity,
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
} from "lucide-react";
import { loginUser } from "../services/authService";

export default function Login({ onLogin, onShowRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    const normalizedUsername = username.trim();

    if (!normalizedUsername || !password) {
      setError("Enter your username and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await loginUser({
        username: normalizedUsername,
        password,
      });

      onLogin(data.token);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 py-10 text-zinc-100">
      <section
        aria-labelledby="login-title"
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111113] p-7 shadow-2xl sm:p-9"
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-white p-3 text-black">
            <Activity size={24} aria-hidden="true" />
          </div>

          <div>
            <h1 className="text-xl font-bold">CodeLens</h1>
            <p className="text-xs text-zinc-500">
              API Gateway Dashboard
            </p>
          </div>
        </div>

        <h2 id="login-title" className="text-2xl font-semibold">
          Welcome back
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Sign in to monitor your services.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label
              htmlFor="login-username"
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
                id="login-username"
                name="username"
                type="text"
                required
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your username"
                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-zinc-600"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="login-password"
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
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-zinc-600"
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="rounded-md p-1 text-zinc-500 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {showPassword ? (
                  <EyeOff size={18} aria-hidden="true" />
                ) : (
                  <Eye size={18} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p
              id="login-error"
              role="alert"
              className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onShowRegister}
            disabled={loading}
            className="font-medium text-white underline underline-offset-4 hover:text-zinc-300 disabled:opacity-50"
          >
            Register
          </button>
        </p>
      </section>
    </main>
  );
}
