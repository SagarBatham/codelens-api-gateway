
import { useState } from "react";
import {
  Send,
  Clock,
  Code2,
  Check,
  AlertCircle,
  Terminal,
} from "lucide-react";
import { getToken } from "../services/authService";

const GATEWAY_URL = "http://localhost:8080";

const methods = [
  {
    label: "GET",
    active: "bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/40",
    inactive: "text-emerald-400/70 hover:bg-emerald-400/10",
  },
  {
    label: "POST",
    active: "bg-blue-400/15 text-blue-300 ring-1 ring-blue-400/40",
    inactive: "text-blue-400/70 hover:bg-blue-400/10",
  },
  {
    label: "PUT",
    active: "bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/40",
    inactive: "text-amber-400/70 hover:bg-amber-400/10",
  },
  {
    label: "PATCH",
    active: "bg-purple-400/15 text-purple-300 ring-1 ring-purple-400/40",
    inactive: "text-purple-400/70 hover:bg-purple-400/10",
  },
  {
    label: "DELETE",
    active: "bg-red-400/15 text-red-300 ring-1 ring-red-400/40",
    inactive: "text-red-400/70 hover:bg-red-400/10",
  },
];

const ApiExplorer = () => {
  const [method, setMethod] = useState("GET");
  const [path, setPath] = useState("/api/products");
  const [body, setBody] = useState("{\n  \n}");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(null);

  const sendRequest = async () => {
    const endpoint = path.trim();

    if (
      !endpoint.startsWith("/") ||
      endpoint.startsWith("//") ||
      endpoint.includes("://")
    ) {
      setError("Enter a valid Gateway path, such as /api/products.");
      return;
    }

    const sendsBody = ["POST", "PUT", "PATCH"].includes(method);

    if (sendsBody) {
      try {
        JSON.parse(body);
      } catch {
        setError("Invalid JSON request body. Please check your syntax.");
        return;
      }
    }

    setLoading(true);
    setError("");
    setResponse(null);
    setElapsed(null);

    const start = performance.now();

    try {
      const options = {
        method,
        headers: {
          Accept: "application/json",
        },
      };

      const token = getToken();

      if (token) {
        options.headers.Authorization = `Bearer ${token}`;
      }

      if (sendsBody) {
        options.headers["Content-Type"] = "application/json";
        options.body = body;
      }

      const result = await fetch(`${GATEWAY_URL}${endpoint}`, options);
      const responseText = await result.text();

      let data = responseText;

      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch {
        // Keep non-JSON responses as plain text.
      }

      setResponse({
        status: result.status,
        statusText: result.statusText,
        data,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? `Request failed: ${err.message}. Check that the API Gateway is running and CORS is configured.`
          : "Request failed. Check your Gateway connection."
      );
    } finally {
      setElapsed(Math.round(performance.now() - start));
      setLoading(false);
    }
  };

  const successfulResponse =
    response && response.status >= 200 && response.status < 300;

  return (
    <section className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
          <Terminal size={21} className="text-zinc-200" />
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">
            API Explorer
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            Test your microservices directly through the CodeLens Gateway.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0d0d0f]">
        <div className="border-b border-white/[0.07] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Request Builder
          </p>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <label className="mb-3 block text-xs font-medium text-zinc-400">
              HTTP Method
            </label>

            <div className="flex flex-wrap gap-2">
              {methods.map((item) => {
                const selected = method === item.label;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setMethod(item.label);
                      setError("");
                    }}
                    aria-pressed={selected}
                    className={`rounded-lg px-4 py-2.5 text-xs font-bold tracking-wide transition-all duration-200 ${
                      selected ? item.active : item.inactive
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="gateway-path"
              className="mb-3 block text-xs font-medium text-zinc-400"
            >
              Request URL
            </label>

            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="flex min-w-0 flex-1 items-center overflow-hidden rounded-xl border border-white/10 bg-[#09090b] transition focus-within:border-white/25">
                <span className="shrink-0 border-r border-white/[0.08] px-3 py-3 text-xs font-semibold text-zinc-500">
                  localhost:8080
                </span>

                <input
                  id="gateway-path"
                  value={path}
                  onChange={(event) => setPath(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !loading) {
                      sendRequest();
                    }
                  }}
                  placeholder="/api/products"
                  aria-label="Gateway request path"
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 font-mono text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                />
              </div>

              <button
                type="button"
                onClick={sendRequest}
                disabled={loading || !path.trim().startsWith("/")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={15} />
                {loading ? "Sending..." : "Send Request"}
              </button>
            </div>

            <p className="mt-2 text-xs text-zinc-600">
              Requests are sent to your local Spring Cloud Gateway.
            </p>
          </div>

          {["POST", "PUT", "PATCH"].includes(method) && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label
                  htmlFor="request-body"
                  className="text-xs font-medium text-zinc-400"
                >
                  JSON Request Body
                </label>

                <span className="rounded-md border border-white/[0.08] px-2 py-1 font-mono text-[10px] text-zinc-500">
                  application/json
                </span>
              </div>

              <textarea
                id="request-body"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={7}
                spellCheck={false}
                aria-label="JSON request body"
                className="w-full resize-y rounded-xl border border-white/[0.08] bg-[#09090b] p-4 font-mono text-sm leading-6 text-zinc-200 outline-none transition focus:border-white/25"
              />
            </div>
          )}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4 text-sm text-red-300"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {response && (
        <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0d0d0f]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <Code2 size={18} className="text-zinc-400" />

              <h3 className="text-sm font-semibold text-white">
                Response
              </h3>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                  successfulResponse
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "bg-red-400/10 text-red-300"
                }`}
              >
                {successfulResponse ? (
                  <Check size={12} />
                ) : (
                  <AlertCircle size={12} />
                )}

                {response.status} {response.statusText}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Clock size={14} />
              {elapsed} ms
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
            <span className="text-xs text-zinc-500">
              Response Body
            </span>

            <span className="font-mono text-[10px] text-zinc-600">
              {typeof response.data === "object" &&
              response.data !== null
                ? "JSON"
                : "TEXT"}
            </span>
          </div>

          <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-sm leading-6 text-zinc-300">
            {typeof response.data === "string"
              ? response.data
              : JSON.stringify(response.data, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
};

export default ApiExplorer;
