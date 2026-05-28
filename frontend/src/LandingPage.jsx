import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/**
 * LandingPage.jsx — THIS IS BALI
 * Rebuilt faithfully from live screenshots + scraped HTML.
 *
 * KEY DESIGN FACTS (from screenshots):
 * - Background: warm cream #f5f0eb (NOT dark/black)
 * - Experience section: white bg, 3-col side-by-side cards
 * - Welcome section: single centered column, stacked full-width buttons
 * - Primary button: warm taupe/brown #7d6554
 * - Fonts: Nunito (bold headings) — rounded, clean, matches original
 *
 * Add to index.html <head>:
 * <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
 */

/* ── Real assets from thisbali.com CDN ──────────────────────────── */
const A = {
  logo: "https://thisbali.com/wp-content/uploads/2025/09/TIB-LIGHT-LOGO-FOR-HOMEPAGE.png",
  heroVideo:
    "https://thisbali.com/wp-content/uploads/2025/11/THIS-IS-BALI-The-WORLDs-Best-Indonesian-Restaurant.mp4",
  heroFallback:
    "https://thisbali.com/wp-content/uploads/2025/09/OG-THIS-IS-BALI.jpg",
  google:
    "https://thisbali.com/wp-content/uploads/2025/09/Google_Icons-09-512.webp",
  airasia: "https://thisbali.com/wp-content/uploads/2026/03/airasialogo.png",
  signature:
    "https://thisbali.com/wp-content/uploads/2025/09/tib-signature.svg",
  // Experience cards (from HTML source)
  exp1: "https://thisbali.com/wp-content/uploads/2025/11/THIS-IS-BALI-The-WORLDs-Best-Indonesian-Restaurant-2.webp",
  exp2: "https://thisbali.com/wp-content/uploads/2025/11/THIS-IS-BALI-The-WORLDs-Best-Indonesian-Restaurant-3.webp",
  exp3: "https://thisbali.com/wp-content/uploads/2025/11/THIS-IS-BALI-The-WORLDs-Best-Indonesian-Restaurant-1.webp",
  // Gallery (6 impression photos)
  g1: "https://thisbali.com/wp-content/uploads/2025/11/THIS-IS-BALI-1.webp",
  g2: "https://thisbali.com/wp-content/uploads/2025/11/THIS-IS-BALI-2.webp",
  g3: "https://thisbali.com/wp-content/uploads/2025/11/THIS-IS-BALI-3.webp",
  g4: "https://thisbali.com/wp-content/uploads/2025/11/THIS-IS-BALI-4.webp",
  g5: "https://thisbali.com/wp-content/uploads/2025/11/THIS-IS-BALI-5.webp",
  g6: "https://thisbali.com/wp-content/uploads/2025/11/THIS-IS-BALI-6.webp",
  // Food menu grid (8 items)
  f1: "https://thisbali.com/wp-content/uploads/2025/09/this-is-bali-spring-rolls-1024x1024-1.jpg",
  f2: "https://thisbali.com/wp-content/uploads/2025/09/this-is-bali-mie-goreng-1024x1024-1.jpg",
  f3: "https://thisbali.com/wp-content/uploads/2025/09/honey-chicken-1024x1024-1.jpg",
  f4: "https://thisbali.com/wp-content/uploads/2025/09/this-is-bali-pumpkin-curry-1024x1024-1.jpg",
  f5: "https://thisbali.com/wp-content/uploads/2025/09/sprouts-tofu-1024x1024-1.jpg",
  f6: "https://thisbali.com/wp-content/uploads/2025/09/this-is-bali-honey-chicken-1024x1024-1.jpg",
  f7: "https://thisbali.com/wp-content/uploads/2025/09/eggpant-tomato-1024x1024-1.jpg",
  f8: "https://thisbali.com/wp-content/uploads/2025/09/this-is-bali-dessert-1024x1024-1.jpg",
  //our story
  s1: "https://thisbali.com/wp-content/uploads/2025/09/THIS-IS-BALI-Indonesian-Restaurant.jpg",
};

/* ── CSS variables injected once ─────────────────────────────────── */
const CSS_VARS = `
  :root {
    --cream:   #f5f0eb;
    --cream2:  #f0ebe4;
    --brown:   #7d6554;
    --brown-h: #6a5244;
    --dark:    #1a1a1a;
    --mid:     #555555;
    --light:   #888888;
    --gold:    #F5C518;
    --border:  rgba(0,0,0,0.10);
  }
  html { scroll-behavior: smooth; }
  body { background: var(--cream); }
`;

/* ── Scroll reveal ───────────────────────────────────────────────── */
function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, on];
}

function Reveal({ children, delay = 0, className = "" }) {
  const [ref, on] = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out
        ${on ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
        ${className}`}
    >
      {children}
    </div>
  );
}

/* ── FAQ accordion item ──────────────────────────────────────────── */
const FAQ_DATA = [
  [
    "Are you open today?",
    "Yes! We are open every day from 11:00 AM to 11:00 PM. Last order is at 10:15 PM.",
  ],
  [
    "Is the food halal?",
    "Yes, all our suppliers are HALAL certified. We do not process pork or lard in our kitchen.",
  ],
  [
    "Do you have vegetarian / vegan options?",
    "Yes! Check our menu with the vegan logo at go.thisbali.com/air-asia-menu for full options.",
  ],
  [
    "Do you use any MSG?",
    "All our food and desserts are MSG-free with no harmful additives or preservatives.",
  ],
  [
    "What for special occasions?",
    "For birthdays, honeymoons or anniversaries we provide a complimentary mini cake upon request.",
  ],
  [
    "Do you accept walk-ins?",
    "Yes! But we suggest reserving a table to minimize your wait time.",
  ],
  [
    "Is there air conditioning?",
    "Yes, we have air conditioning throughout the restaurant.",
  ],
  [
    "Where can I park?",
    "Public parking at Lapangan Astina Ubud (soccer fields) — a 5-minute walk away.",
  ],
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left text-sm font-semibold text-[--dark] hover:text-[--brown] transition-colors"
        aria-expanded={open}
      >
        <span>{q}</span>
        <span
          className={`shrink-0 text-xl font-light leading-none text-[--brown] transition-transform duration-300 ${open ? "rotate-45" : ""}`}
        >
          +
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-40" : "max-h-0"}`}
      >
        <p className="border-t border-black/8 px-6 py-4 text-sm leading-relaxed text-[--mid]">
          {a}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   NAV
   Black bar · hamburger left · logo center (or left) · Book Table right
═══════════════════════════════════════════════════════════════════ */
function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-black" role="banner">
      <div className="flex h-14 items-center justify-between px-4 lg:px-8">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open navigation menu"
            className="flex h-8 w-8 flex-col items-center justify-center gap-[5px]"
          >
            <span
              className={`block h-0.5 w-5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 bg-white transition-opacity ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`}
            />
          </button>
          <Link to="/">
            <img
              src={A.logo}
              alt="THIS IS BALI"
              className="h-7 w-auto object-contain"
              fetchpriority="high"
            />
          </Link>
        </div>

        {/* Right: Book Table pill */}
        <Link
          to="/booking"
          className="rounded-full bg-[#e8e0d6] px-5 py-2 text-[12px] font-bold uppercase tracking-widest text-[#1a1a1a] transition-all hover:bg-[#d6cbbf] hover:scale-105 active:scale-95"
        >
          BOOK TABLE
        </Link>
      </div>

      {/* Dropdown nav (hamburger) */}
      <nav
        className={`overflow-hidden border-t border-white/10 bg-black transition-all duration-300 ${menuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}
      >
        {[
          ["Our Menu", "https://go.thisbali.com/air-asia-menu", true],
          ["Book a Table", null, false],
          ["Visit Us", "https://maps.app.goo.gl/sqAuWHsB3aszXWxh9", true],
          ["Contact Us", "https://wa.me/6281138104002", true],
          ["Join Our Team", "https://people.ptunicorn.id/careers", true],
        ].map(([label, href, ext]) =>
          ext ? (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMenuOpen(false)}
              className="block border-b border-white/8 px-6 py-3.5 text-sm font-semibold uppercase tracking-widest text-white/80 hover:text-white"
            >
              {label}
            </a>
          ) : (
            <Link
              key={label}
              to="/booking"
              onClick={() => setMenuOpen(false)}
              className="block border-b border-white/8 px-6 py-3.5 text-sm font-semibold uppercase tracking-widest text-white/80 hover:text-white"
            >
              {label}
            </Link>
          ),
        )}
      </nav>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HERO
   Full-screen video · image fallback · rating badges at bottom
═══════════════════════════════════════════════════════════════════ */
function Hero() {
  const videoRef = useRef(null);
  const [videoOk, setVideoOk] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => setVideoOk(false));
  }, []);

  const scrollToWelcome = (e) => {
    e.preventDefault();
    document.querySelector("#welcome")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative h-screen min-h-[580px] overflow-hidden bg-[#f0e8df]"
      aria-label="Hero"
    >
      {/* Fallback image */}
      <img
        src={A.heroFallback}
        alt="THIS IS BALI restaurant"
        fetchpriority="high"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          videoOk ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Video */}
      <video
        ref={videoRef}
        loop
        playsInline
        preload="auto"
        onError={() => setVideoOk(false)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          videoOk ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      >
        <source src={A.heroVideo} type="video/mp4" />
      </video>

      {/* Top gradient (nav contrast) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent" />

      {/* Bottom gradient — fade to cream so badges row blends in */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f5f0eb] to-transparent" />

      {/* VISIT US TODAY */}
      <div className="absolute inset-x-0 bottom-32 flex flex-col items-center gap-2">
        <a
          href="#welcome"
          onClick={scrollToWelcome}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[11px] font-extrabold uppercase tracking-[0.45em] text-white drop-shadow-lg">
            VISIT US TODAY
          </span>
          <svg
            className="animate-bounce text-white drop-shadow"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 5v14M5 12l7 7 7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}

/* ── Badge row — standalone section between Hero and Welcome ─────── */
function BadgeRow() {
  return (
    <div className="bg-[--cream] flex flex-wrap justify-center gap-3 px-4 py-6">
      {/* Google rating */}
      <div className="flex items-center gap-2.5 rounded-full border border-black/10 bg-white px-5 py-3 shadow-md shadow-black/8">
        <img
          src={A.google}
          alt="Google"
          loading="eager"
          className="h-5 w-5 shrink-0"
        />
        <div>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-[#F5C518] text-sm leading-none">
                ★
              </span>
            ))}
          </div>
          <p className="mt-0.5 text-[11px] font-semibold leading-none text-[--dark]">
            15.000 Reviews, 4.9 Rating
          </p>
        </div>
      </div>
      {/* Award */}
      <div className="flex items-center gap-2.5 rounded-full border border-black/10 bg-white px-5 py-3 shadow-md shadow-black/8">
        <span className="text-xl shrink-0">🏅</span>
        <p className="text-[11px] font-semibold leading-snug text-[--dark]">
          Bali International Customers
          <br />
          Satisfaction Award 2024
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   WELCOME  (screenshot 2)
   Cream bg · single centered column · stacked full-width buttons
═══════════════════════════════════════════════════════════════════ */
function Welcome() {
  return (
    <section id="welcome" className="bg-[--cream] pb-16 lg:pb-20">
      <div className="mx-auto max-w-xl px-5 text-center">
        <Reveal>
          <h2 className="text-2xl font-extrabold text-[--dark] lg:text-3xl">
            Welcome To THIS IS BALI
          </h2>
          <h1 className="mt-2 text-base font-semibold text-[--mid] lg:text-lg">
            The WORLD's Best Indonesian Restaurant
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[--mid] lg:text-[15px]">
            Visit THIS IS BALI Today And Experience{" "}
            <strong className="text-[--dark]">Award Winning</strong> Authentic
            Balinese Food And Desserts In The Heart Of Ubud.
          </p>
        </Reveal>

        {/* AirAsia partner */}
        <Reveal delay={80}>
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="text-sm italic text-[--mid]">
              Official partner of
            </span>
            <img
              src={A.airasia}
              alt="AirAsia"
              loading="lazy"
              className="h-5 object-contain"
            />
          </div>
        </Reveal>

        {/* Stacked CTA buttons — full width, rounded pill */}
        <Reveal delay={130}>
          <div className="mt-7 flex flex-col gap-3">
            <Link
              to="/booking"
              className="w-full rounded-full bg-[--brown] py-4 text-[13px] font-extrabold uppercase tracking-[0.15em] text-white transition-all hover:bg-[--brown-h] hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-black/10"
            >
              RESERVE A TABLE
            </Link>
            <a
              href="https://goo.gl/maps/Fn2xrDAF9EbPoz526"
              target="_blank"
              rel="noreferrer"
              className="w-full rounded-full border-2 border-[--border] bg-white py-4 text-[13px] font-extrabold uppercase tracking-[0.15em] text-[--dark] transition-all hover:bg-[--cream2] hover:scale-[1.02] active:scale-[0.98]"
            >
              VISIT US NOW
            </a>
          </div>
        </Reveal>

        {/* HIGHLIGHTS box */}
        <Reveal delay={180}>
          <div className="mt-7 rounded-2xl border-2 border-[--border] bg-white/80 px-6 py-5 text-left">
            <p className="mb-4 text-center text-[11px] font-extrabold uppercase tracking-[0.25em] text-[--dark]">
              HIGHLIGHTS
            </p>
            <ul className="space-y-2.5">
              {[
                ["More Than ", "15.000 5-Star Reviews"],
                ["", "Award Winning", " Service & Design"],
                ["Viral Interactive ", "Stamp Menu"],
                ["", "Floating Tables"],
                ["", "4.9", " Star Rating"],
              ].map((parts, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-[--mid]"
                >
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-[--brown]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    {parts[0]}
                    {parts[1] && (
                      <strong className="text-[--dark]">{parts[1]}</strong>
                    )}
                    {parts[2]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* WhatsApp button */}
        <Reveal delay={220}>
          <a
            href="https://wa.me/6281138104002?text=Hello%20THIS%20IS%20BALI%20Team,%20"
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border-2 border-[--border] bg-white py-4 text-[13px] font-extrabold uppercase tracking-[0.15em] text-[--dark] transition-all hover:bg-[--cream2] hover:scale-[1.02]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4 text-green-500"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.533 5.855L.07 23.928a.53.53 0 0 0 .643.643l6.074-1.463A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.808 9.808 0 0 1-5.032-1.383l-.36-.214-3.733.9.915-3.643-.235-.374A9.818 9.818 0 1 1 12 21.818z" />
            </svg>
            WRITE US ON WHATSAPP
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   EXPERIENCE  (screenshot 3)
   White bg · title LEFT · subtitle TOP-RIGHT · 3-col card grid
═══════════════════════════════════════════════════════════════════ */
const EXP_CARDS = [
  {
    img: A.exp1,
    title: "Be Wowed By Our Beautiful And Unique Ambience",
    body: "Immerse yourself in a unique dining experience with meticulously handcrafted elements throughout our restaurant. From the chairs to the plates, every detail is designed to elevate your experience.",
  },
  {
    img: A.exp2,
    title: "Experience Our Award Winning Service",
    body: "From the moment you step through our doors, you'll feel the difference. At THIS IS BALI, we don't just serve food, we create lasting memories through heartfelt hospitality, warm smiles, and a team that truly cares.",
  },
  {
    img: A.exp3,
    title: "Exquisite Creations By Award-Winning Chefs",
    body: "Prepare your taste buds for a treat! Our award-winning chefs have mastered the art of creating mouthwatering, homemade Indonesian delicacies that are sure to satisfy your cravings.",
  },
];

function Experience() {
  return (
    <section id="experience" className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        {/* Header row: title LEFT, subtitle TOP-RIGHT */}
        <Reveal>
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <h2 className="max-w-lg text-3xl font-extrabold leading-tight text-[--dark] lg:text-4xl">
              One Of A Kind Dining Experience
            </h2>
            <p className="max-w-xs text-sm leading-relaxed text-[--mid] lg:pt-2 lg:text-right">
              Join us and indulge your heart and taste buds at Bali's highest
              rated Indonesian restaurant.
            </p>
          </div>
        </Reveal>

        {/* 3-col card grid */}
        <div className="grid gap-8 sm:grid-cols-3">
          {EXP_CARDS.map(({ img, title, body }, i) => (
            <Reveal key={title} delay={i * 100}>
              <article className="flex flex-col">
                {/* Image */}
                <div className="overflow-hidden rounded-xl aspect-[4/3] bg-[--cream]">
                  <img
                    src={img}
                    alt={title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                {/* Text */}
                <h3 className="mt-4 text-base font-bold leading-snug text-[--dark]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[--mid]">
                  {body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Quote + CTAs */}
        <Reveal delay={200}>
          <div className="mt-12 flex flex-col items-center gap-5 text-center">
            <p className="italic text-[--mid] text-sm">
              "This truly was an amazing experience."
            </p>
            <div className="flex flex-col gap-3 w-full max-w-sm sm:flex-row sm:max-w-none sm:justify-center sm:gap-4">
              <Link
                to="/booking"
                className="rounded-full bg-[--brown] px-8 py-3.5 text-[13px] font-extrabold uppercase tracking-widest text-white hover:bg-[--brown-h] hover:scale-105 transition-all"
              >
                Get a Table
              </Link>
              <a
                href="https://goo.gl/maps/Fn2xrDAF9EbPoz526"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border-2 border-[--border] bg-white px-8 py-3.5 text-[13px] font-extrabold uppercase tracking-widest text-[--dark] hover:bg-[--cream] transition-all"
              >
                Visit Us Now
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   GALLERY  (screenshot 4)
   Cream bg · "THIS IS BALI Restaurant" · 3 tall images · quote · CTAs
   Scrollable on mobile, 3-col on desktop
═══════════════════════════════════════════════════════════════════ */
function Gallery() {
  return (
    <section className="bg-[--cream] py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <Reveal className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-[--dark] lg:text-4xl">
            THIS IS BALI Restaurant
          </h2>
          <p className="mt-2 text-sm text-[--mid]">
            Here are some impression shared by our guests.
          </p>
        </Reveal>

        {/* 3-col on desktop, 1-col scroll on mobile */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[A.g1, A.g2, A.g3].map((src, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="overflow-hidden rounded-2xl">
                <img
                  src={src}
                  alt={`THIS IS BALI guest impression ${i + 1}`}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-700 hover:scale-105"
                  style={{ aspectRatio: "3/4" }}
                />
              </div>
            </Reveal>
          ))}
        </div>

        {/* Quote + CTAs */}
        <Reveal delay={200}>
          <div className="mt-10 flex flex-col items-center gap-5 text-center">
            <p className="italic text-[--mid]">
              "This truly was an amazing experience."
            </p>
            <div className="flex flex-col gap-3 w-full max-w-sm sm:flex-row sm:max-w-none sm:justify-center sm:gap-4">
              <Link
                to="/booking"
                className="rounded-full bg-[--brown] px-8 py-3.5 text-[13px] font-extrabold uppercase tracking-widest text-white hover:bg-[--brown-h] hover:scale-105 transition-all"
              >
                Get a Table
              </Link>
              <a
                href="https://goo.gl/maps/Fn2xrDAF9EbPoz526"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border-2 border-[--border] bg-white px-8 py-3.5 text-[13px] font-extrabold uppercase tracking-widest text-[--dark] hover:bg-[--cream2] transition-all"
              >
                Visit Us Now
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PEOPLE LOVE OUR FOOD  (screenshot 5)
   Cream bg · centered review card · 4×2 food grid · menu link
═══════════════════════════════════════════════════════════════════ */
const FOOD_ITEMS = [
  [A.f1, "Spring Rolls"],
  [A.f2, "Mie Goreng"],
  [A.f3, "Honey Chicken"],
  [A.f4, "Pumpkin Curry"],
  [A.f5, "Sprouts & Tofu"],
  [A.f6, "Nasi Campur"],
  [A.f7, "Eggplant Tomato"],
  [A.f8, "Chocolate Dessert"],
];

function FoodSection() {
  return (
    <section className="bg-[--cream2] py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <Reveal className="mb-6 text-center">
          <h2 className="text-3xl font-extrabold text-[--dark] lg:text-4xl">
            People Love Our Food…
          </h2>
          <p className="mt-2 text-sm text-[--mid]">
            We are famous for our tasty food, hand-selected, high-quality
            ingredients,
            <br className="hidden sm:block" />
            free of MSG, preservatives or additives.
          </p>
        </Reveal>

        {/* Single centered Google review card — matches screenshot 5 */}
        <Reveal delay={80}>
          <div className="mx-auto mb-10 max-w-sm rounded-2xl border border-black/8 bg-white p-6 text-center shadow-sm">
            <div className="mb-3 flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-[#F5C518] text-lg">
                  ★
                </span>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-[--mid]">
              I really love the vibes here. The food is typical Indonesian and
              the flavors are truly authentic. If you're looking for Indonesian
              food served in an aesthetic way, this is definitely the place.
            </p>
            <div className="mt-4 flex justify-center">
              <img
                src={A.google}
                alt="Google"
                loading="lazy"
                className="h-6 w-6"
              />
            </div>
          </div>
        </Reveal>

        {/* 4×2 food photo grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          {FOOD_ITEMS.map(([src, name], i) => (
            <Reveal key={name} delay={i * 50}>
              <div className="group cursor-pointer">
                <div className="overflow-hidden rounded-xl aspect-square bg-white">
                  <img
                    src={src}
                    alt={name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <p className="mt-2 text-center text-xs font-semibold text-[--mid] group-hover:text-[--brown] transition-colors">
                  {name}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 text-center">
          <a
            href="https://go.thisbali.com/air-asia-menu"
            target="_blank"
            rel="noreferrer"
            className="inline-block rounded-full border-2 border-[--brown] px-8 py-3.5 text-[13px] font-extrabold uppercase tracking-widest text-[--brown] transition-all hover:bg-[--brown] hover:text-white hover:scale-105"
          >
            Explore Our Full Menu
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TESTIMONIALS
   White bg · 3 Google review cards
═══════════════════════════════════════════════════════════════════ */
const REVIEWS = [
  "It was delicious! The service is extremely well too! The concept is very interesting — using stamps on the card was fun and yummy! I strongly recommend!",
  "Absolutely fantastic all round! As a vegetarian, it's not easy to find really good flavorsome pure vegetarian Balinese cuisine. Staff were so friendly and accommodating.",
  "Delicious Balinese food. Attentive and kind staff. I enjoyed the stamp card concept. I highly recommend trying the jackfruit curry!",
];

function Testimonials() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <Reveal className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-[--dark] lg:text-4xl">
            What Our Guests Say…
          </h2>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-3">
          {REVIEWS.map((text, i) => (
            <Reveal key={i} delay={i * 100}>
              <article className="flex h-full flex-col gap-4 rounded-2xl border border-black/8 bg-[--cream] p-6 shadow-sm">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-[#F5C518]">
                      ★
                    </span>
                  ))}
                </div>
                <p className="flex-1 text-sm italic leading-relaxed text-[--mid]">
                  "{text}"
                </p>
                <footer className="flex items-center gap-2">
                  <img
                    src={A.google}
                    alt="Google"
                    loading="lazy"
                    className="h-5 w-5"
                  />
                  <span className="text-xs text-[--light]">
                    via Google Reviews
                  </span>
                </footer>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   OUR STORY
   Cream bg · award badge · story text · signature
═══════════════════════════════════════════════════════════════════ */
function Story() {
  return (
    <section id="story" className="bg-[--cream] py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <Reveal>
            {/* Award badge */}
            <div className="mb-6 inline-flex flex-col items-center gap-1 rounded-full border-2 border-[--brown]/40 bg-white/80 px-8 py-4">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-[--brown]">
                Award
              </span>
              <span className="text-3xl font-extrabold italic text-[--dark]">
                Winning
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-[--brown]">
                — 2023 —
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-[--dark] lg:text-4xl">
              Our Story…
            </h2>
            <p className="mt-5 text-[15px] leading-loose text-[--mid]">
              <strong className="text-[--dark]">"THIS IS BALI"</strong> offers
              authentic Balinese food and desserts, along with a world-class
              restaurant experience, right in the center of Ubud.
            </p>
            <p className="mt-4 text-[15px] leading-loose text-[--mid]">
              Our restaurant is born from a love of traditional Balinese street
              food & desserts. We wanted to create a place where South-East
              Asian flavors are celebrated using clean, healthy & pure
              ingredients — cooked freshly every day, free of MSG or additives.
            </p>
            <p className="mt-4 italic text-[--mid] text-sm">
              THIS IS BALI truly is a love letter to Bali's rich tastes and
              flavors.
            </p>
            <div className="mt-6">
              <img
                src={A.signature}
                alt="Signature"
                loading="lazy"
                className="h-12 opacity-60"
              />
              <p className="mt-1 text-sm italic text-[--light]">
                Adina & the THIS IS BALI team
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="overflow-hidden rounded-3xl">
              <img
                src={A.s1}
                alt="THIS IS BALI restaurant interior"
                loading="lazy"
                className="w-full object-cover aspect-square"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   READY TO VISIT
   White bg · hours · 3 CTA buttons
═══════════════════════════════════════════════════════════════════ */
function VisitCTA() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-xl px-5 text-center">
        <Reveal>
          <h2 className="text-3xl font-extrabold text-[--dark] lg:text-4xl">
            Ready to Visit Us?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[--mid]">
            We are there for you{" "}
            <strong className="text-[--dark]">
              Monday to Sunday from 11am – 11pm
            </strong>
            . ❤️ People love us — to minimize wait time, please reserve a table
            below.
          </p>
          <div className="mt-7 flex flex-col gap-3">
            <Link
              to="/booking"
              className="w-full rounded-full bg-[--brown] py-4 text-[13px] font-extrabold uppercase tracking-[0.15em] text-white hover:bg-[--brown-h] transition-all hover:scale-[1.02] shadow-md"
            >
              Reserve a Table
            </Link>
            <a
              href="https://wa.me/6281138104002?text=Hello%20THIS%20IS%20BALI%20Team,%20"
              target="_blank"
              rel="noreferrer"
              className="w-full rounded-full border-2 border-[--border] bg-white py-4 text-[13px] font-extrabold uppercase tracking-[0.15em] text-[--dark] hover:bg-[--cream] transition-all hover:scale-[1.02]"
            >
              Write us on WhatsApp
            </a>
            <a
              href="https://goo.gl/maps/Fn2xrDAF9EbPoz526"
              target="_blank"
              rel="noreferrer"
              className="w-full rounded-full border-2 border-[--border] bg-white py-4 text-[13px] font-extrabold uppercase tracking-[0.15em] text-[--dark] hover:bg-[--cream] transition-all hover:scale-[1.02]"
            >
              Directions
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FAQ
   Cream bg · accordion
═══════════════════════════════════════════════════════════════════ */
function FAQ() {
  return (
    <section className="bg-[--cream] py-16 lg:py-20">
      <div className="mx-auto max-w-2xl px-5 lg:px-10">
        <Reveal className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-[--dark] lg:text-4xl">
            Frequently Asked Questions
          </h2>
        </Reveal>
        <div className="space-y-2">
          {FAQ_DATA.map(([q, a], i) => (
            <Reveal key={i} delay={i * 30}>
              <FaqItem q={q} a={a} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FOOTER
   Black bg · logo · address · socials
═══════════════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="bg-black py-12 text-white/60" role="contentinfo">
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <img
              src={A.logo}
              alt="THIS IS BALI"
              loading="lazy"
              className="mb-4 h-8 object-contain"
            />
            <p className="text-sm leading-relaxed">
              PT Unicorn Food And Services
              <br />
              Jl. Goutama No.2, Ubud, Kecamatan Ubud,
              <br />
              Kabupaten Gianyar, Bali 80571
            </p>
          </div>
          <div>
            <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.3em] text-white/30">
              Hours
            </p>
            <p className="text-sm">Monday – Sunday</p>
            <p className="font-semibold text-white">11:00 AM – 11:00 PM</p>
            <p className="mt-1 text-xs text-white/40">Last order 10:15 PM</p>
          </div>
          <div>
            <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.3em] text-white/30">
              Follow Us
            </p>
            <div className="flex gap-2">
              {[
                ["FB", "https://www.facebook.com/thisisbali.eatery/"],
                ["IG", "https://www.instagram.com/thisisbali.eatery/"],
                ["TT", "https://www.tiktok.com/@thisisbali.eatery"],
                ["YT", "https://www.youtube.com/@THISISBALI.eatery"],
              ].map(([l, h]) => (
                <a
                  key={l}
                  href={h}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={l}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-xs font-bold hover:border-white/60 hover:text-white transition-colors"
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row">
          <span>
            © {new Date().getFullYear()} THIS IS BALI. All rights reserved.
          </span>
          <div className="flex gap-5">
            <a
              href="https://thisbali.com/privacy-policy/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              Privacy Policy
            </a>
            <a
              href="https://thisbali.com/terms-disclaimer/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE ROOT
═══════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <>
      <style>{CSS_VARS}</style>
      <div
        className="font-['Nunito'] antialiased"
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >
        <Nav />
        <main>
          <Hero />
          <BadgeRow />
          <Welcome />
          <Experience />
          <Gallery />
          <FoodSection />
          <Testimonials />
          <Story />
          <VisitCTA />
          <FAQ />
        </main>
        <Footer />
      </div>
    </>
  );
}
