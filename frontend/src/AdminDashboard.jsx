import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

/**
 * AdminDashboard.jsx
 * Fetches `${VITE_API_URL}/api/admin/bookings` and renders a table.
 *
 * The backend guards this route with an `x-admin-key` header. We gate the UI
 * behind a key input (kept in sessionStorage so a refresh doesn't lose it).
 * NOTE: a key shipped via VITE_* would be bundled into client JS and is NOT
 * secret — the input approach keeps it out of the build. For real auth, move
 * to a server session / JWT.
 */

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const STATUS_STYLES = {
  pending: "bg-[#c9a96a]/20 text-[#8a6d2f]",
  confirmed: "bg-[#16271d]/10 text-[#16271d]",
  cancelled: "bg-[#c1683f]/15 text-[#a4471f]",
};

export default function AdminDashboard() {
  const [adminKey, setAdminKey] = useState(
    () => sessionStorage.getItem("adminKey") || ""
  );
  const [authed, setAuthed] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [state, setState] = useState("idle"); // idle | loading | ready | error
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(async (key) => {
    setState("loading");
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/bookings`, {
        headers: { "x-admin-key": key },
      });
      if (res.status === 401) throw new Error("Invalid admin key.");
      if (!res.ok) throw new Error(`Failed to load (${res.status}).`);
      const data = await res.json();
      setBookings(data.bookings || []);
      setAuthed(true);
      sessionStorage.setItem("adminKey", key);
      setState("ready");
    } catch (e) {
      setError(e.message || "Could not reach the server.");
      setState("error");
      setAuthed(false);
    }
  }, []);

  // auto-load if a key is already remembered
  useEffect(() => {
    if (adminKey) load(adminKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter((b) =>
      [b.name, b.email, b.phone, b.status]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [bookings, query]);

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";
  const fmtCreated = (d) =>
    d ? new Date(d).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  /* ---- key gate ---- */
  if (!authed) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#0e1b13] px-6 font-['Hanken_Grotesk']">
        <div className="w-full max-w-sm text-center text-[#f4efe6]">
          <p className="text-xs uppercase tracking-[0.4em] text-[#c9a96a]">Admin</p>
          <h1 className="mt-3 font-['Fraunces'] text-4xl font-light">Dashboard access</h1>
          <p className="mt-3 text-sm text-[#f4efe6]/60">
            Enter the admin key to view reservations.
          </p>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && adminKey && load(adminKey)}
            placeholder="x-admin-key"
            className="mt-6 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center text-[#f4efe6] outline-none placeholder:text-[#f4efe6]/30 focus:border-[#c9a96a]"
          />
          {state === "error" && (
            <p className="mt-3 text-sm text-[#e0855f]">{error}</p>
          )}
          <button
            onClick={() => adminKey && load(adminKey)}
            disabled={!adminKey || state === "loading"}
            className="mt-5 w-full rounded-full bg-[#c1683f] py-3.5 text-sm font-medium tracking-wide text-[#f4efe6] transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            {state === "loading" ? "Checking…" : "Enter"}
          </button>
          <Link to="/" className="mt-6 inline-block text-xs tracking-wide text-[#f4efe6]/40 hover:text-[#f4efe6]/70">
            ← Back to site
          </Link>
        </div>
      </div>
    );
  }

  /* ---- dashboard ---- */
  return (
    <div className="min-h-screen bg-[#f4efe6] font-['Hanken_Grotesk'] text-[#16271d] antialiased">
      <header className="border-b border-[#16271d]/10 bg-[#f4efe6]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <Link to="/" className="font-['Fraunces'] text-xl">
              this<span className="italic text-[#c9a96a]">bali</span>
            </Link>
            <span className="ml-3 text-xs uppercase tracking-[0.3em] text-[#16271d]/45">
              Reservations
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, status…"
              className="w-56 rounded-full border border-[#16271d]/15 bg-white/60 px-4 py-2 text-sm outline-none focus:border-[#c1683f]"
            />
            <button
              onClick={() => load(adminKey)}
              className="rounded-full border border-[#16271d]/15 px-4 py-2 text-sm tracking-wide transition-colors hover:bg-[#16271d]/5"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex items-end justify-between">
          <h1 className="font-['Fraunces'] text-3xl font-light">
            {state === "ready" ? `${filtered.length} ` : ""}Bookings
          </h1>
        </div>

        {state === "loading" && <SkeletonTable />}

        {state === "error" && (
          <div className="rounded-2xl border border-[#c1683f]/30 bg-[#c1683f]/10 p-6 text-sm text-[#a4471f]">
            {error}
          </div>
        )}

        {state === "ready" && filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#16271d]/20 p-16 text-center text-[#16271d]/50">
            No bookings {query ? "match your search" : "yet"}.
          </div>
        )}

        {state === "ready" && filtered.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-[#16271d]/10 bg-white/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#16271d]/10 text-xs uppercase tracking-wider text-[#16271d]/50">
                  <tr>
                    <Th>Guest</Th>
                    <Th>Phone</Th>
                    <Th>Date</Th>
                    <Th>Time</Th>
                    <Th className="text-center">Guests</Th>
                    <Th>Status</Th>
                    <Th>Notes</Th>
                    <Th>Received</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#16271d]/8">
                  {filtered.map((b) => (
                    <tr key={b.id} className="transition-colors hover:bg-[#efe7d8]/50">
                      <td className="px-4 py-3.5">
                        <div className="font-medium">{b.name}</div>
                        <div className="text-xs text-[#16271d]/55">{b.email}</div>
                      </td>
                      <td className="px-4 py-3.5 text-[#16271d]/70">{b.phone || "—"}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">{fmtDate(b.booking_date)}</td>
                      <td className="px-4 py-3.5 text-[#16271d]/70">{b.booking_time || "—"}</td>
                      <td className="px-4 py-3.5 text-center">{b.guests ?? "—"}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                            STATUS_STYLES[b.status] || "bg-[#16271d]/10 text-[#16271d]"
                          }`}
                        >
                          {b.status || "pending"}
                        </span>
                      </td>
                      <td className="max-w-[14rem] truncate px-4 py-3.5 text-[#16271d]/70" title={b.message || ""}>
                        {b.message || "—"}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-[#16271d]/55">
                        {fmtCreated(b.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const Th = ({ children, className = "" }) => (
  <th className={`px-4 py-3 font-medium ${className}`}>{children}</th>
);

function SkeletonTable() {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-xl bg-[#16271d]/5" />
      ))}
    </div>
  );
}
