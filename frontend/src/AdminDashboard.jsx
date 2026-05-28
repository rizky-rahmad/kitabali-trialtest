import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * AdminDashboard.jsx
 * - Design: matches site (cream bg #f5f0eb, Nunito, brown #7d6554, black nav)
 * - Auth: x-admin-key gate + session logout
 * - Full CRUD: Create · Read · Update · Delete bookings
 *
 * Endpoints (all require x-admin-key header):
 *   GET    /api/admin/bookings       — list
 *   POST   /api/admin/bookings       — create
 *   PATCH  /api/admin/bookings/:id   — update
 *   DELETE /api/admin/bookings/:id   — delete
 */

const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const LOGO = "https://thisbali.com/wp-content/uploads/2025/09/TIB-LIGHT-LOGO-FOR-HOMEPAGE.png";

/* ── Palette / tokens ────────────────────────────────────────────── */
const CSS = `
  :root {
    --cream:   #f5f0eb;
    --brown:   #7d6554;
    --brown-h: #6a5244;
    --dark:    #1a1a1a;
    --mid:     #555555;
    --border:  rgba(0,0,0,0.09);
  }
`;

const STATUS_CFG = {
  pending:   { label: "Pending",   cls: "bg-amber-100   text-amber-800   border-amber-200"  },
  confirmed: { label: "Confirmed", cls: "bg-green-100   text-green-800   border-green-200"  },
  cancelled: { label: "Cancelled", cls: "bg-red-100     text-red-700     border-red-200"    },
};

const SIZES     = ["1","2","3","4","5","6","7","8","9","10+"];
const TIME_SLOTS = Array.from({length:23},(_,i)=>{
  const m=11*60+i*30, h=String(Math.floor(m/60)).padStart(2,"0"), mm=String(m%60).padStart(2,"0");
  const l=new Date(`2000-01-01T${h}:${mm}`).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});
  return {value:`${h}:${mm}`,label:l};
});
const TODAY     = new Date().toISOString().split("T")[0];
const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY_FORM = {name:"",email:"",phone:"",booking_date:"",booking_time:"",guests:"",message:"",status:"pending"};

/* ── Helpers ─────────────────────────────────────────────────────── */
function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"}) : "—";
}
function fmtCreated(d) {
  return d ? new Date(d).toLocaleString(undefined,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}) : "—";
}

/* ── Input component ─────────────────────────────────────────────── */
function Input({ label, error, children }) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[--mid]">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function TextInput({ error, ...p }) {
  return (
    <input
      className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-[--dark] outline-none transition-colors placeholder:text-gray-400 focus:border-[--brown]
        ${error ? "border-red-400" : "border-[--border]"}`}
      {...p}
    />
  );
}

/* ── Booking modal (create + edit) ───────────────────────────────── */
function BookingModal({ mode, initial, onClose, onSave }) {
  const [form, setForm]     = useState(initial || EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverErr, setServerErr] = useState("");

  const set = k => e => setForm(f => ({...f,[k]:e.target.value}));

  function validate() {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2)  e.name  = "Name required (min 2 chars).";
    if (!EMAIL_RE.test(form.email))                         e.email = "Valid email required.";
    if (!form.booking_date)                                 e.booking_date = "Date required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    setServerErr("");
    try {
      await onSave({
        name:         form.name.trim(),
        email:        form.email.trim().toLowerCase(),
        phone:        form.phone || null,
        booking_date: form.booking_date,
        booking_time: form.booking_time || null,
        guests:       form.guests ? Number(form.guests) : null,
        message:      form.message || null,
        ...(mode === "edit" && { status: form.status }),
      });
      onClose();
    } catch(err) {
      setServerErr(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[--dark]">
            {mode === "create" ? "New Booking" : `Edit Booking #${initial?.id}`}
          </h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-gray-100 transition-colors">
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto pr-1">
          <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-4">
            <Input label="Full Name" error={errors.name}>
              <TextInput placeholder="Guest name" value={form.name} onChange={set("name")} error={errors.name} />
            </Input>
            <Input label="Email" error={errors.email}>
              <TextInput type="email" placeholder="email@example.com" value={form.email} onChange={set("email")} error={errors.email} />
            </Input>
            <Input label="Phone (optional)">
              <TextInput placeholder="+62 812…" value={form.phone} onChange={set("phone")} />
            </Input>
            <Input label="Guests">
              <select value={form.guests} onChange={set("guests")}
                className="w-full rounded-lg border border-[--border] bg-white px-3 py-2.5 text-sm text-[--dark] outline-none focus:border-[--brown]">
                <option value="">— select —</option>
                {SIZES.map(s=><option key={s} value={s}>{s} {Number(s)===1?"person":"people"}</option>)}
              </select>
            </Input>
            <Input label="Date" error={errors.booking_date}>
              <TextInput type="date" value={form.booking_date} onChange={set("booking_date")} error={errors.booking_date} />
            </Input>
            <Input label="Time">
              <select value={form.booking_time} onChange={set("booking_time")}
                className="w-full rounded-lg border border-[--border] bg-white px-3 py-2.5 text-sm text-[--dark] outline-none focus:border-[--brown]">
                <option value="">— select —</option>
                {TIME_SLOTS.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Input>
          </div>

          {mode === "edit" && (
            <Input label="Status">
              <select value={form.status} onChange={set("status")}
                className="w-full rounded-lg border border-[--border] bg-white px-3 py-2.5 text-sm text-[--dark] outline-none focus:border-[--brown]">
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </Input>
          )}

          <Input label="Special Request">
            <textarea rows={2} value={form.message} onChange={set("message")}
              placeholder="Birthday, anniversary, dietary needs…"
              className="w-full resize-none rounded-lg border border-[--border] bg-white px-3 py-2.5 text-sm text-[--dark] outline-none focus:border-[--brown] placeholder:text-gray-400" />
          </Input>
        </div>

        {serverErr && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 border border-red-200">{serverErr}</p>
        )}

        <div className="mt-4 flex gap-3">
          <button onClick={onClose}
            className="flex-1 rounded-full border-2 border-[--border] py-3 text-sm font-bold text-[--dark] hover:bg-[--cream] transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 rounded-full bg-[--brown] py-3 text-sm font-bold text-white hover:bg-[--brown-h] transition-colors disabled:opacity-50">
            {saving ? "Saving…" : mode === "create" ? "Create Booking" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Delete confirm modal ────────────────────────────────────────── */
function DeleteModal({ booking, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  async function handle() {
    setDeleting(true);
    await onConfirm();
    onClose();
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl" onClick={e=>e.stopPropagation()}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </div>
        <h2 className="text-lg font-extrabold text-[--dark]">Delete Booking</h2>
        <p className="mt-2 text-sm text-[--mid]">
          Are you sure you want to delete the booking for{" "}
          <strong className="text-[--dark]">{booking.name}</strong>?
          This action cannot be undone.
        </p>
        <div className="mt-5 flex gap-3">
          <button onClick={onClose}
            className="flex-1 rounded-full border-2 border-[--border] py-3 text-sm font-bold text-[--dark] hover:bg-[--cream] transition-colors">
            Keep It
          </button>
          <button onClick={handle} disabled={deleting}
            className="flex-1 rounded-full bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50">
            {deleting ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [adminKey, setAdminKey]   = useState(() => sessionStorage.getItem("tib_admin_key") || "");
  const [keyInput, setKeyInput]   = useState("");
  const [authed, setAuthed]       = useState(false);
  const [bookings, setBookings]   = useState([]);
  const [loadState, setLoadState] = useState("idle"); // idle|loading|ready|error
  const [loadErr, setLoadErr]     = useState("");
  const [query, setQuery]         = useState("");

  // Modals
  const [createOpen,  setCreateOpen]  = useState(false);
  const [editTarget,  setEditTarget]  = useState(null); // booking object
  const [deleteTarget,setDeleteTarget]= useState(null); // booking object

  /* ── API helper ────────────────────────────────────────────── */
  const apiFetch = useCallback(async (method, path, body) => {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: { "Content-Type":"application/json", "x-admin-key": adminKey },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.details?.join(" · ") || data?.error || `HTTP ${res.status}`);
    return data;
  }, [adminKey]);

  /* ── Load bookings ─────────────────────────────────────────── */
  const load = useCallback(async (key = adminKey) => {
    setLoadState("loading");
    setLoadErr("");
    try {
      const res = await fetch(`${API}/api/admin/bookings`, {
        headers: { "x-admin-key": key },
      });
      if (res.status === 401) throw new Error("Invalid admin key.");
      if (!res.ok) throw new Error(`Failed to load (${res.status}).`);
      const data = await res.json();
      setBookings(data.bookings || []);
      setAuthed(true);
      sessionStorage.setItem("tib_admin_key", key);
      setAdminKey(key);
      setLoadState("ready");
    } catch(e) {
      setLoadErr(e.message);
      setLoadState("error");
      setAuthed(false);
    }
  }, [adminKey]);

  useEffect(() => { if (adminKey) load(adminKey); }, []); // eslint-disable-line

  /* ── CRUD handlers ─────────────────────────────────────────── */
  async function handleCreate(formData) {
    const { booking } = await apiFetch("POST", "/api/admin/bookings", formData);
    setBookings(prev => [booking, ...prev]);
  }

  async function handleUpdate(id, formData) {
    const { booking } = await apiFetch("PATCH", `/api/admin/bookings/${id}`, formData);
    setBookings(prev => prev.map(b => b.id === id ? booking : b));
  }

  async function handleDelete(id) {
    await apiFetch("DELETE", `/api/admin/bookings/${id}`);
    setBookings(prev => prev.filter(b => b.id !== id));
  }

  /* ── Logout ────────────────────────────────────────────────── */
  function logout() {
    sessionStorage.removeItem("tib_admin_key");
    setAdminKey("");
    setAuthed(false);
    setBookings([]);
    setKeyInput("");
    setLoadState("idle");
  }

  /* ── Filtered list ─────────────────────────────────────────── */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter(b =>
      [b.name,b.email,b.phone,b.status].filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q))
    );
  }, [bookings, query]);

  /* ── Stats ─────────────────────────────────────────────────── */
  const stats = useMemo(() => ({
    total:     bookings.length,
    pending:   bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  }), [bookings]);

  /* ════════════════════════════════════════════════════════════
     LOGIN GATE
  ════════════════════════════════════════════════════════════ */
  if (!authed) return (
    <>
      <style>{CSS}</style>
      <div
        className="flex min-h-screen font-['Nunito']"
        style={{ fontFamily: "'Nunito',sans-serif" }}
      >
        {/* ── LEFT panel: restaurant photo (desktop only) ───────── */}
        <div className="relative hidden w-[45%] shrink-0 overflow-hidden lg:block">
          <img
            src="https://thisbali.com/wp-content/uploads/2025/11/THIS-IS-BALI-The-WORLDs-Best-Indonesian-Restaurant-2.webp"
            alt="THIS IS BALI restaurant"
            className="h-full w-full object-cover"
          />
          {/* dark gradient + branding overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-10 text-center">
            <img src={LOGO} alt="THIS IS BALI" className="h-12 object-contain drop-shadow-2xl" />
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
              Admin Dashboard
            </p>
          </div>
          {/* bottom badge */}
          <div className="absolute bottom-6 inset-x-0 text-center">
            <p className="text-xs text-white/40">THIS IS BALI · Ubud, Bali</p>
          </div>
        </div>

        {/* ── RIGHT panel: login form ───────────────────────────── */}
        <div className="flex flex-1 items-center justify-center bg-[--cream] px-6 py-16">
          <div className="w-full max-w-sm">

            {/* Mobile-only logo (dark bg strip so it's visible) */}
            <div className="mb-8 flex justify-center lg:hidden">
              <div className="rounded-2xl bg-black px-8 py-5">
                <img src={LOGO} alt="THIS IS BALI" className="h-8 object-contain" />
              </div>
            </div>

            {/* Login card */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-lg shadow-black/8">

              {/* Card dark header */}
              <div className="bg-[#1a1a1a] px-8 py-7 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <h1 className="text-xl font-extrabold text-white">Admin Access</h1>
                <p className="mt-1 text-xs text-white/55">Enter your key to manage reservations</p>
              </div>

              {/* Form body */}
              <div className="px-8 py-7">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[--mid]">
                  Admin Key
                </label>
                <div className={`flex items-center gap-3 rounded-xl border bg-[--cream] px-4 py-3.5 transition-colors
                  ${loadState === "error" ? "border-red-400" : "border-[--border] focus-within:border-[--brown]"}`}>
                  <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                  </svg>
                  <input
                    type="password"
                    value={keyInput}
                    onChange={e => setKeyInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && keyInput && load(keyInput)}
                    placeholder="Enter your admin key"
                    className="w-full bg-transparent text-sm text-[--dark] outline-none placeholder:text-gray-400"
                    autoFocus
                  />
                </div>

                {loadState === "error" && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
                    <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    {loadErr}
                  </p>
                )}

                <button
                  onClick={() => keyInput && load(keyInput)}
                  disabled={!keyInput || loadState === "loading"}
                  className="mt-5 w-full rounded-full bg-[--brown] py-3.5 text-sm font-extrabold uppercase tracking-widest text-white shadow-md shadow-[--brown]/20 transition-all hover:bg-[--brown-h] hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40">
                  {loadState === "loading"
                    ? <span className="flex items-center justify-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Verifying…
                      </span>
                    : "Enter Dashboard"
                  }
                </button>
              </div>
            </div>

            <p className="mt-6 text-center">
              <a href="/" className="text-xs text-[--mid] transition-colors hover:text-[--dark] hover:underline">
                ← Back to THIS IS BALI
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );

  /* ════════════════════════════════════════════════════════════
     DASHBOARD
  ════════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{CSS}</style>
      <div className="min-h-screen bg-[--cream] font-['Nunito']" style={{fontFamily:"'Nunito',sans-serif"}}>

        {/* ── Nav ───────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 bg-black">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 lg:px-10">
            <div className="flex items-center gap-3">
              <img src={LOGO} alt="THIS IS BALI" className="h-7 object-contain" />
              <span className="rounded-full border border-white/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/70">
                Admin
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/80 hover:border-white/50 hover:text-white transition-all">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Logout
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-5 py-8 lg:px-10">

          {/* ── Page title ──────────────────────────────────────── */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-[--dark]">Reservations</h1>
              <p className="text-sm text-[--mid]">Manage all incoming bookings</p>
            </div>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 rounded-full bg-[--brown] px-5 py-2.5 text-sm font-bold text-white hover:bg-[--brown-h] hover:scale-105 transition-all shadow-md">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" d="M12 4v16m8-8H4"/>
              </svg>
              New Booking
            </button>
          </div>

          {/* ── Stats row ───────────────────────────────────────── */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Total",     stats.total,     "text-[--dark]"],
              ["Pending",   stats.pending,   "text-amber-700"],
              ["Confirmed", stats.confirmed, "text-green-700"],
              ["Cancelled", stats.cancelled, "text-red-600"],
            ].map(([label, count, cls]) => (
              <div key={label} className="rounded-2xl border border-[--border] bg-white px-5 py-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-[--mid]">{label}</p>
                <p className={`mt-1 text-3xl font-extrabold ${cls}`}>{count}</p>
              </div>
            ))}
          </div>

          {/* ── Controls ────────────────────────────────────────── */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search name, email, status…"
              className="flex-1 min-w-[200px] rounded-full border border-[--border] bg-white px-4 py-2.5 text-sm outline-none focus:border-[--brown] transition-colors placeholder:text-gray-400"
            />
            <button
              onClick={() => load()}
              className="flex items-center gap-2 rounded-full border border-[--border] bg-white px-4 py-2.5 text-sm font-semibold text-[--mid] hover:border-[--brown] hover:text-[--brown] transition-all">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Refresh
            </button>
          </div>

          {/* ── Table ───────────────────────────────────────────── */}
          {loadState === "loading" && (
            <div className="space-y-3">
              {Array.from({length:5}).map((_,i)=>(
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/80" />
              ))}
            </div>
          )}

          {loadState === "error" && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">{loadErr}</div>
          )}

          {loadState === "ready" && filtered.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-[--border] py-20 text-center text-sm text-[--mid]">
              {query ? "No bookings match your search." : "No bookings yet."}
            </div>
          )}

          {loadState === "ready" && filtered.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-[--border] bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[--border] bg-[--cream]/60">
                    <tr>
                      {["#","Guest","Phone","Date","Time","Pax","Status","Notes","Received","Actions"].map(h=>(
                        <th key={h} className="whitespace-nowrap px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-[--mid]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[--border]">
                    {filtered.map(b => {
                      const sc = STATUS_CFG[b.status] || STATUS_CFG.pending;
                      return (
                        <tr key={b.id} className="transition-colors hover:bg-[--cream]/40">
                          <td className="px-4 py-3.5 text-xs text-[--mid]">#{b.id}</td>
                          <td className="px-4 py-3.5">
                            <p className="font-bold text-[--dark]">{b.name}</p>
                            <p className="text-xs text-[--mid]">{b.email}</p>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-[--mid]">{b.phone||"—"}</td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-sm">{fmtDate(b.booking_date)}</td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-sm text-[--mid]">{b.booking_time||"—"}</td>
                          <td className="px-4 py-3.5 text-center font-bold">{b.guests??"—"}</td>
                          <td className="px-4 py-3.5">
                            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${sc.cls}`}>
                              {sc.label}
                            </span>
                          </td>
                          <td className="max-w-[10rem] truncate px-4 py-3.5 text-xs text-[--mid]" title={b.message||""}>
                            {b.message||"—"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-xs text-[--mid]">{fmtCreated(b.created_at)}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              {/* Edit */}
                              <button
                                onClick={() => setEditTarget(b)}
                                title="Edit"
                                className="rounded-lg border border-[--border] bg-white p-2 text-[--mid] hover:border-[--brown] hover:text-[--brown] transition-all hover:scale-110">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                              </button>
                              {/* Delete */}
                              <button
                                onClick={() => setDeleteTarget(b)}
                                title="Delete"
                                className="rounded-lg border border-[--border] bg-white p-2 text-[--mid] hover:border-red-400 hover:text-red-500 transition-all hover:scale-110">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Create modal ──────────────────────────────────────────── */}
      {createOpen && (
        <BookingModal
          mode="create"
          onClose={() => setCreateOpen(false)}
          onSave={handleCreate}
        />
      )}

      {/* ── Edit modal ────────────────────────────────────────────── */}
      {editTarget && (
        <BookingModal
          mode="edit"
          initial={{
            ...editTarget,
            guests: editTarget.guests ? String(editTarget.guests) : "",
            booking_date: editTarget.booking_date
              ? new Date(editTarget.booking_date).toISOString().split("T")[0]
              : "",
          }}
          onClose={() => setEditTarget(null)}
          onSave={data => handleUpdate(editTarget.id, data)}
        />
      )}

      {/* ── Delete modal ──────────────────────────────────────────── */}
      {deleteTarget && (
        <DeleteModal
          booking={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget.id)}
        />
      )}
    </>
  );
}
