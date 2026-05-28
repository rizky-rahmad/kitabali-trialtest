import { useState } from "react";

/**
 * BookingFlow.jsx — "Your VIP Reservation 🏆"
 * Visual replica of list.thisbali.com (from screenshot).
 *
 * Layout: 2-col on desktop (image LEFT sticky, form RIGHT scrollable).
 *         Single-page form — no multi-step. All fields visible at once.
 *
 * Connected to backend: POST ${VITE_API_URL}/api/bookings
 */

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

/* ── Left-panel restaurant photo ─────────────────────────────────── */
const PANEL_IMG =
  "https://thisbali.com/wp-content/uploads/2025/11/THIS-IS-BALI-2.webp";

/* ── Party size options ───────────────────────────────────────────── */
const SIZES = ["1 person","2 people","3 people","4 people",
               "5 people","6 people","7 people","8 people",
               "9 people","10+ people"];

/* ── Time slots 11:00 → 22:00 (last order 22:15) every 30 min ───── */
const TIME_SLOTS = Array.from({ length: 23 }, (_, i) => {
  const mins = 11 * 60 + i * 30;
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  const label = new Date(`2000-01-01T${h}:${m}`)
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return { value: `${h}:${m}`, label };
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ── Small icon components ───────────────────────────────────────── */
const IconPerson  = () => <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>;
const IconEmail   = () => <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>;
const IconCal     = () => <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>;
const IconPencil  = () => <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>;

/* ── Field wrapper ───────────────────────────────────────────────── */
function Field({ label, error, children }) {
  return (
    <div className="mb-6">
      <label className="mb-2 block text-sm font-semibold text-gray-800">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ── Input with optional leading icon ───────────────────────────── */
function IconInput({ icon, error, ...props }) {
  return (
    <div className={`flex items-center gap-3 rounded-lg border bg-white px-3 py-3 transition-colors
      ${error ? "border-red-400 bg-red-50/30" : "border-gray-200 focus-within:border-gray-400"}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      <input
        className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
        {...props}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function BookingFlow() {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    name: "", email: "", phone: "", guests: "",
    booking_date: "", booking_time: "", message: "",
  });
  const [errors, setErrors]     = useState({});
  const [status, setStatus]     = useState("idle"); // idle | submitting | success | error
  const [serverErr, setServerErr] = useState("");
  const [confirmed, setConfirmed] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  /* ── Validation ─────────────────────────────────────────────── */
  function validate() {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Please enter your full name.";
    if (!EMAIL_RE.test(form.email))                        e.email = "Please enter a valid email.";
    if (!form.guests)                                      e.guests = "Please choose a party size.";
    if (!form.booking_date)                                e.booking_date = "Please choose a date.";
    else if (form.booking_date < today)                    e.booking_date = "Date can't be in the past.";
    if (!form.booking_time)                                e.booking_time = "Please select a time.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  /* ── Submit ─────────────────────────────────────────────────── */
  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setStatus("submitting");
    setServerErr("");

    // Parse guests number from "2 people" → 2
    const guestNum = parseInt(form.guests) || 1;
    // Build full phone string
    const phone = form.phone ? `+62${form.phone.replace(/^0/, "")}` : null;

    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:         form.name.trim(),
          email:        form.email.trim().toLowerCase(),
          phone,
          booking_date: form.booking_date,
          booking_time: form.booking_time,
          guests:       guestNum,
          message:      form.message.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.details?.join(" · ") || data?.error || `Error ${res.status}`);
      setConfirmed(data.booking);
      setStatus("success");
    } catch (err) {
      setServerErr(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  /* ── Success screen ─────────────────────────────────────────── */
  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 font-['Nunito']"
        style={{ fontFamily: "'Nunito', sans-serif" }}>
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-black text-4xl">
            🏆
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Reservation Confirmed!</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            Thank you{confirmed?.name ? `, ${confirmed.name.split(" ")[0]}` : ""}!
            We'll see you at THIS IS BALI. A confirmation has been sent to{" "}
            <span className="font-semibold text-gray-800">{confirmed?.email}</span>.
          </p>
          {confirmed?.id && (
            <p className="mt-3 text-xs text-gray-400">
              Booking reference: #{String(confirmed.id).padStart(5, "0")}
            </p>
          )}
          <div className="mt-8 flex flex-col gap-3">
            <a href="/"
              className="w-full rounded-full bg-black py-3.5 text-sm font-extrabold uppercase tracking-widest text-white hover:bg-gray-900 transition-colors">
              Back to Home
            </a>
            <a href="https://wa.me/6281138104002" target="_blank" rel="noreferrer"
              className="w-full rounded-full border-2 border-gray-200 py-3.5 text-sm font-extrabold uppercase tracking-widest text-gray-800 hover:bg-gray-50 transition-colors">
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main form ──────────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen font-['Nunito']" style={{ fontFamily: "'Nunito', sans-serif" }}>

      {/* ── LEFT: restaurant photo panel ────────────────────────── */}
      <div className="sticky top-0 hidden h-screen w-[45%] shrink-0 overflow-hidden lg:block">
        <img
          src={PANEL_IMG}
          alt="THIS IS BALI restaurant"
          className="h-full w-full object-cover"
        />
        {/* bottom info overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-6 pb-6 pt-20">
          <p className="text-xl font-extrabold uppercase tracking-wide text-white">
            THIS IS BALI
          </p>
          <p className="mt-1 text-sm text-white/70">
            Indonesian&nbsp;·&nbsp;$$&nbsp;·&nbsp;4.9 (7.1k reviews)
          </p>
        </div>
      </div>

      {/* ── RIGHT: form panel ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="mx-auto max-w-lg px-6 py-10 lg:px-10 lg:py-12">

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-extrabold text-gray-900 lg:text-3xl">
              Your VIP Reservation
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              How it works: Book your table and get the first available table at your chosen time.
            </p>
            <p className="mt-2 text-sm italic text-gray-500">
              Average wait with VIP reservation is currently 5 minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>

            {/* Full Name */}
            <Field label="Your Full Name" error={errors.name}>
              <IconInput
                icon={<IconPerson />}
                type="text"
                placeholder="Enter your name"
                value={form.name}
                onChange={set("name")}
                error={errors.name}
              />
            </Field>

            {/* Email */}
            <Field label="Your Email" error={errors.email}>
              <IconInput
                icon={<IconEmail />}
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set("email")}
                error={errors.email}
              />
            </Field>

            {/* Phone — Indonesian +62 prefix */}
            <Field label="Your Phone Number">
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3 focus-within:border-gray-400 transition-colors">
                {/* Flag + code */}
                <div className="flex shrink-0 items-center gap-1.5 border-r border-gray-200 pr-3">
                  <span className="text-base">🇮🇩</span>
                  <span className="text-sm font-semibold text-gray-700">+62</span>
                </div>
                <input
                  type="tel"
                  placeholder="812 3456 7890"
                  value={form.phone}
                  onChange={set("phone")}
                  className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>
            </Field>

            {/* Party size */}
            <Field label="How many people are coming:" error={errors.guests}>
              <div className={`flex items-center rounded-lg border bg-white transition-colors
                ${errors.guests ? "border-red-400" : "border-gray-200 focus-within:border-gray-400"}`}>
                <select
                  value={form.guests}
                  onChange={set("guests")}
                  className="w-full cursor-pointer appearance-none bg-transparent px-4 py-3 text-sm text-gray-800 outline-none">
                  <option value="" disabled>- choose size -</option>
                  {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="mr-3 text-gray-400">▾</span>
              </div>
            </Field>

            {/* Preferred Date */}
            <Field label="Preferred Date" error={errors.booking_date}>
              <div className={`flex items-center gap-3 rounded-lg border bg-white px-3 py-3 transition-colors
                ${errors.booking_date ? "border-red-400" : "border-gray-200 focus-within:border-gray-400"}`}>
                <IconCal />
                <input
                  type="date"
                  value={form.booking_date}
                  min={today}
                  onChange={set("booking_date")}
                  className="w-full bg-transparent text-sm text-gray-800 outline-none [color-scheme:light]"
                />
              </div>
            </Field>

            {/* Preferred Time — disabled until date chosen */}
            <Field label="Preferred Time" error={errors.booking_time}>
              {!form.booking_date ? (
                <p className="text-sm text-red-500">*Please select a date first</p>
              ) : (
                <div className={`flex items-center rounded-lg border bg-white transition-colors
                  ${errors.booking_time ? "border-red-400" : "border-gray-200 focus-within:border-gray-400"}`}>
                  <select
                    value={form.booking_time}
                    onChange={set("booking_time")}
                    className="w-full cursor-pointer appearance-none bg-transparent px-4 py-3 text-sm text-gray-800 outline-none">
                    <option value="" disabled>- choose time -</option>
                    {TIME_SLOTS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <span className="mr-3 text-gray-400">▾</span>
                </div>
              )}
            </Field>

            {/* Special request */}
            <Field label="Do you have a special request?:">
              <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3 focus-within:border-gray-400 transition-colors">
                <span className="mt-0.5 shrink-0"><IconPencil /></span>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={set("message")}
                  placeholder="Add your special request"
                  className="w-full resize-none bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>
            </Field>

            {/* Server error */}
            {status === "error" && (
              <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
                {serverErr}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full rounded-full bg-black py-4 text-sm font-extrabold uppercase tracking-wide text-white transition-all hover:bg-gray-900 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 shadow-md">
              {status === "submitting" ? "Processing…" : "Confirm Reservation"}
            </button>

            {/* Back link */}
            <p className="mt-6 text-center text-xs text-gray-400">
              <a href="/" className="hover:underline hover:text-gray-600 transition-colors">
                ← Back to THIS IS BALI
              </a>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}
