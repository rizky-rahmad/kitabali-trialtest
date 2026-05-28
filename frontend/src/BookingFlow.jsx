import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

/**
 * BookingFlow.jsx
 * Multi-step reservation form. Posts to `${VITE_API_URL}/api/bookings`.
 *
 * Payload matches server.js exactly:
 *   { name, email, phone, booking_date, booking_time, guests, message }
 *
 * Env:  VITE_API_URL=https://<your-cloudflared-tunnel>.trycloudflare.com
 */

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const HERO =
  "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STEPS = ["Your Stay", "Your Details", "Confirm"];

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  booking_date: "",
  booking_time: "",
  guests: 2,
  message: "",
};

export default function BookingFlow() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [serverError, setServerError] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  /* ---- per-step validation ---- */
  const validateStep = (s) => {
    const e = {};
    if (s === 0) {
      if (!form.booking_date) e.booking_date = "Please choose a date.";
      else if (new Date(form.booking_date) < new Date(new Date().toDateString()))
        e.booking_date = "Date can't be in the past.";
      if (!form.guests || Number(form.guests) < 1)
        e.guests = "At least one guest.";
    }
    if (s === 1) {
      if (!form.name || form.name.trim().length < 2)
        e.name = "Tell us your name.";
      if (!EMAIL_RE.test(form.email)) e.email = "A valid email, please.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => validateStep(step) && setStep((s) => Math.min(s + 1, 2));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  /* ---- submit ---- */
  const submit = async () => {
    if (!validateStep(0) || !validateStep(1)) {
      setStep(0);
      return;
    }
    setStatus("submitting");
    setServerError("");
    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          booking_date: form.booking_date,
          booking_time: form.booking_time || null,
          guests: Number(form.guests),
          message: form.message || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.details?.join(" · ") || data?.error || `Request failed (${res.status})`
        );
      }
      setConfirmation(data.booking);
      setStatus("success");
    } catch (err) {
      setServerError(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const reset = () => {
    setForm(EMPTY);
    setErrors({});
    setStep(0);
    setStatus("idle");
    setConfirmation(null);
    setServerError("");
  };

  const dateLabel = useMemo(() => {
    if (!form.booking_date) return "—";
    return new Date(form.booking_date).toLocaleDateString(undefined, {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [form.booking_date]);

  return (
    <div className="flex min-h-screen flex-col bg-[#f4efe6] font-['Hanken_Grotesk'] text-[#16271d] antialiased lg:flex-row">
      {/* ---- Visual panel ---- */}
      <aside className="relative hidden w-[42%] shrink-0 lg:block">
        <img src={HERO} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1b13]/85 via-[#0e1b13]/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-10 text-[#f4efe6]">
          <Link to="/" className="font-['Fraunces'] text-2xl">
            this<span className="italic text-[#c9a96a]">bali</span>
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[#c9a96a]">
              Reservation
            </p>
            <h1 className="mt-3 max-w-xs font-['Fraunces'] text-4xl font-light leading-tight">
              Let's hold your place in the quiet.
            </h1>
          </div>
        </div>
      </aside>

      {/* ---- Form panel ---- */}
      <main className="flex flex-1 items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-lg">
          {status === "success" ? (
            <SuccessPanel confirmation={confirmation} onReset={reset} />
          ) : (
            <>
              <Stepper step={step} />

              {step === 0 && (
                <Section title="When are you coming?" subtitle="Choose your dates and party size.">
                  <Field label="Arrival date" error={errors.booking_date}>
                    <input
                      type="date"
                      value={form.booking_date}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={set("booking_date")}
                      className={inputCls(errors.booking_date)}
                    />
                  </Field>
                  <Field label="Preferred check-in time (optional)">
                    <input
                      type="time"
                      value={form.booking_time}
                      onChange={set("booking_time")}
                      className={inputCls()}
                    />
                  </Field>
                  <Field label="Guests" error={errors.guests}>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={form.guests}
                      onChange={set("guests")}
                      className={inputCls(errors.guests)}
                    />
                  </Field>
                </Section>
              )}

              {step === 1 && (
                <Section title="Who shall we expect?" subtitle="We'll send your confirmation here.">
                  <Field label="Full name" error={errors.name}>
                    <input
                      type="text"
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Jane Traveller"
                      className={inputCls(errors.name)}
                    />
                  </Field>
                  <Field label="Email" error={errors.email}>
                    <input
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="jane@email.com"
                      className={inputCls(errors.email)}
                    />
                  </Field>
                  <Field label="Phone (optional)">
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={set("phone")}
                      placeholder="+62 ..."
                      className={inputCls()}
                    />
                  </Field>
                </Section>
              )}

              {step === 2 && (
                <Section title="Anything we should know?" subtitle="Then take a last look before you send.">
                  <Field label="Notes or requests (optional)">
                    <textarea
                      rows={3}
                      value={form.message}
                      onChange={set("message")}
                      placeholder="Dietary needs, arrival details, a celebration…"
                      className={`${inputCls()} resize-none`}
                    />
                  </Field>

                  <dl className="mt-6 divide-y divide-[#16271d]/10 rounded-2xl border border-[#16271d]/10 bg-white/40 px-5 text-sm">
                    <Summary label="Dates" value={dateLabel} />
                    <Summary label="Check-in" value={form.booking_time || "Flexible"} />
                    <Summary label="Guests" value={form.guests} />
                    <Summary label="Name" value={form.name || "—"} />
                    <Summary label="Email" value={form.email || "—"} />
                    {form.phone && <Summary label="Phone" value={form.phone} />}
                  </dl>

                  {status === "error" && (
                    <p className="mt-4 rounded-xl bg-[#c1683f]/10 px-4 py-3 text-sm text-[#a4471f]">
                      {serverError}
                    </p>
                  )}
                </Section>
              )}

              {/* ---- nav buttons ---- */}
              <div className="mt-8 flex items-center justify-between">
                {step > 0 ? (
                  <button
                    onClick={back}
                    className="text-sm tracking-wide text-[#16271d]/60 transition-colors hover:text-[#16271d]"
                  >
                    ← Back
                  </button>
                ) : (
                  <Link
                    to="/"
                    className="text-sm tracking-wide text-[#16271d]/60 transition-colors hover:text-[#16271d]"
                  >
                    ← Home
                  </Link>
                )}

                {step < 2 ? (
                  <button
                    onClick={next}
                    className="rounded-full bg-[#16271d] px-8 py-3.5 text-sm font-medium tracking-wide text-[#f4efe6] transition-transform duration-300 hover:scale-[1.03]"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={submit}
                    disabled={status === "submitting"}
                    className="rounded-full bg-[#c1683f] px-8 py-3.5 text-sm font-medium tracking-wide text-[#f4efe6] transition-transform duration-300 hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === "submitting" ? "Sending…" : "Confirm Reservation"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

/* ---------- small presentational helpers ---------- */
const inputCls = (err) =>
  `w-full rounded-xl border bg-white/60 px-4 py-3 text-[15px] outline-none transition-colors placeholder:text-[#16271d]/35 focus:border-[#c1683f] focus:bg-white ${
    err ? "border-[#c1683f]" : "border-[#16271d]/15"
  }`;

function Stepper({ step }) {
  return (
    <div className="mb-10 flex items-center gap-3">
      {STEPS.map((label, i) => (
        <div key={label} className="flex flex-1 items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`grid h-7 w-7 place-items-center rounded-full text-xs font-medium transition-colors ${
                i <= step ? "bg-[#16271d] text-[#f4efe6]" : "bg-[#16271d]/10 text-[#16271d]/50"
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`hidden text-xs tracking-wide sm:block ${
                i <= step ? "text-[#16271d]" : "text-[#16271d]/40"
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <span
              className={`h-px flex-1 transition-colors ${
                i < step ? "bg-[#16271d]" : "bg-[#16271d]/15"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div>
      <h2 className="font-['Fraunces'] text-3xl font-light leading-tight">{title}</h2>
      {subtitle && <p className="mt-2 text-sm text-[#16271d]/60">{subtitle}</p>}
      <div className="mt-7 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-[#16271d]/55">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-[#c1683f]">{error}</span>}
    </label>
  );
}

function Summary({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3">
      <dt className="text-[#16271d]/55">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function SuccessPanel({ confirmation, onReset }) {
  return (
    <div className="text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#16271d] text-[#c9a96a]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </div>
      <h2 className="mt-7 font-['Fraunces'] text-4xl font-light">You're booked.</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm text-[#16271d]/65">
        Thank you{confirmation?.name ? `, ${confirmation.name.split(" ")[0]}` : ""}. A
        confirmation is on its way to {confirmation?.email}. We can't wait to
        welcome you.
      </p>
      {confirmation?.id && (
        <p className="mt-4 text-xs uppercase tracking-[0.3em] text-[#16271d]/40">
          Reference · #{confirmation.id}
        </p>
      )}
      <div className="mt-9 flex justify-center gap-4">
        <Link
          to="/"
          className="rounded-full bg-[#16271d] px-7 py-3.5 text-sm tracking-wide text-[#f4efe6] transition-transform hover:scale-[1.03]"
        >
          Back home
        </Link>
        <button
          onClick={onReset}
          className="rounded-full border border-[#16271d]/20 px-7 py-3.5 text-sm tracking-wide transition-colors hover:bg-[#16271d]/5"
        >
          Book another
        </button>
      </div>
    </div>
  );
}
