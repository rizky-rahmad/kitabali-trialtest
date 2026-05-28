import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/**
 * LandingPage.jsx
 * Aesthetic direction: "organic luxury" — deep jungle greens, warm sand & cream,
 * terracotta + muted-gold accents, editorial serif (Fraunces) over a clean
 * humanist sans (Hanken Grotesk). Indoor/outdoor, serene, premium-Bali feel.
 *
 * Fonts — add to index.html <head> (or import in index.css):
 *   <link rel="preconnect" href="https://fonts.googleapis.com">
 *   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 *   <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=Hanken+Grotesk:wght@300;400;500;600&display=swap" rel="stylesheet">
 *
 * Images are Unsplash placeholders — swap with the client's real photography.
 */

const IMG = {
  hero:
    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=2000&q=80", // Bali rice terraces
  story:
    "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1400&q=80", // pool villa
  g1: "https://images.unsplash.com/photo-1573790387438-4da905039392?auto=format&fit=crop&w=900&q=80",
  g2: "https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&w=900&q=80",
  g3: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
};

const EXPERIENCES = [
  {
    no: "01",
    title: "Private Villas",
    body: "Open-air pavilions framed by jungle and rice paddy, each with a private pool and a quiet of its own.",
  },
  {
    no: "02",
    title: "Wellness & Ritual",
    body: "Sunrise yoga in the shala, flower baths, and slow mornings designed around how you actually want to feel.",
  },
  {
    no: "03",
    title: "Curated Journeys",
    body: "Hidden waterfalls, temple offerings, and table-side feasts — arranged by people who live here.",
  },
];

/* ------------------------------------------------------------------ */
/* Tiny scroll-reveal helper (IntersectionObserver, CSS-only motion)   */
/* ------------------------------------------------------------------ */
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-[900ms] ease-out ${
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled
          ? "bg-[#0e1b13]/85 backdrop-blur-md border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <Link
          to="/"
          className="font-['Fraunces'] text-2xl tracking-tight text-[#f4efe6]"
        >
          this<span className="italic text-[#c9a96a]">bali</span>
        </Link>

        <div className="hidden items-center gap-9 text-sm tracking-wide text-[#f4efe6]/80 md:flex">
          {["Villas", "Wellness", "Journeys", "Story"].map((i) => (
            <a
              key={i}
              href={`#${i.toLowerCase()}`}
              className="transition-colors hover:text-[#c9a96a]"
            >
              {i}
            </a>
          ))}
        </div>

        <Link
          to="/booking"
          className="rounded-full bg-[#c1683f] px-5 py-2.5 text-sm font-medium tracking-wide text-[#f4efe6] shadow-lg shadow-[#c1683f]/20 transition-transform duration-300 hover:scale-[1.04] hover:bg-[#b15834]"
        >
          Reserve a Stay
        </Link>
      </nav>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* background image + scrims */}
      <img
        src={IMG.hero}
        alt="Lush Balinese landscape at golden hour"
        className="absolute inset-0 h-full w-full object-cover scale-105 animate-[slowzoom_18s_ease-out_forwards]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0e1b13]/55 via-[#0e1b13]/25 to-[#0e1b13]/85" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,transparent,rgba(14,27,19,0.35))]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 lg:px-10">
        <p className="mb-5 translate-y-3 animate-[fadeup_0.9s_0.1s_ease-out_forwards] text-xs uppercase tracking-[0.4em] text-[#c9a96a] opacity-0">
          Ubud · Bali · Indonesia
        </p>

        <h1 className="max-w-4xl font-['Fraunces'] text-5xl font-light leading-[1.02] text-[#f4efe6] sm:text-6xl lg:text-8xl">
          <span className="block translate-y-4 animate-[fadeup_1s_0.25s_ease-out_forwards] opacity-0">
            Where the island
          </span>
          <span className="block translate-y-4 animate-[fadeup_1s_0.45s_ease-out_forwards] italic text-[#e9d7b4] opacity-0">
            slows you down.
          </span>
        </h1>

        <p className="mt-7 max-w-xl translate-y-3 animate-[fadeup_1s_0.65s_ease-out_forwards] text-base leading-relaxed text-[#f4efe6]/85 opacity-0 sm:text-lg">
          A collection of open-air villas tucked into the jungle — built for
          stillness, long mornings, and the kind of quiet you forgot you needed.
        </p>

        <div className="mt-10 flex translate-y-3 animate-[fadeup_1s_0.85s_ease-out_forwards] flex-col gap-4 opacity-0 sm:flex-row">
          <Link
            to="/booking"
            className="rounded-full bg-[#f4efe6] px-8 py-4 text-center text-sm font-medium tracking-wide text-[#0e1b13] transition-transform duration-300 hover:scale-[1.03]"
          >
            Begin Your Booking
          </Link>
          <a
            href="#villas"
            className="rounded-full border border-[#f4efe6]/30 px-8 py-4 text-center text-sm tracking-wide text-[#f4efe6] transition-colors duration-300 hover:bg-[#f4efe6]/10"
          >
            Explore the Villas
          </a>
        </div>
      </div>

      {/* scroll cue */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce text-[#f4efe6]/60">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </div>

      <style>{`
        @keyframes fadeup { to { opacity: 1; transform: translateY(0); } }
        @keyframes slowzoom { to { transform: scale(1); } }
      `}</style>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Experiences                                                         */
/* ------------------------------------------------------------------ */
function Experiences() {
  return (
    <section id="villas" className="bg-[#f4efe6] py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.4em] text-[#c1683f]">
            The Experience
          </p>
          <h2 className="mt-4 max-w-2xl font-['Fraunces'] text-4xl font-light leading-tight text-[#16271d] lg:text-5xl">
            Nothing to rush toward. Everything to slow into.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-[#16271d]/10 bg-[#16271d]/10 md:grid-cols-3">
          {EXPERIENCES.map((e, i) => (
            <Reveal key={e.no} delay={i * 120}>
              <div className="group h-full bg-[#f4efe6] p-9 transition-colors duration-500 hover:bg-[#efe7d8]">
                <span className="font-['Fraunces'] text-sm text-[#c1683f]">
                  {e.no}
                </span>
                <h3 className="mt-6 font-['Fraunces'] text-2xl text-[#16271d]">
                  {e.title}
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed text-[#16271d]/70">
                  {e.body}
                </p>
                <span className="mt-8 inline-flex items-center gap-2 text-sm tracking-wide text-[#16271d] transition-all duration-300 group-hover:gap-3 group-hover:text-[#c1683f]">
                  Discover
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Story (split)                                                       */
/* ------------------------------------------------------------------ */
function Story() {
  return (
    <section id="story" className="bg-[#16271d] py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2 lg:gap-20 lg:px-10">
        <Reveal>
          <div className="relative">
            <img
              src={IMG.story}
              alt="Private pool villa opening onto the jungle"
              className="aspect-[4/5] w-full rounded-[2rem] object-cover"
            />
            <div className="absolute -bottom-6 -right-4 rounded-2xl bg-[#c9a96a] px-7 py-5 text-[#16271d] shadow-xl sm:-right-6">
              <p className="font-['Fraunces'] text-3xl">12</p>
              <p className="text-xs uppercase tracking-widest">private villas</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <p className="text-xs uppercase tracking-[0.4em] text-[#c9a96a]">
            Our Story
          </p>
          <h2 className="mt-4 font-['Fraunces'] text-4xl font-light leading-tight text-[#f4efe6] lg:text-5xl">
            Built by the land, <span className="italic">not over it.</span>
          </h2>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[#f4efe6]/75">
            Every pavilion is shaped around the trees that were already here.
            Local stone, hand-thatched roofs, water that catches the morning
            light. We kept the wild parts wild — and built quietly in between.
          </p>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#f4efe6]/75">
            The result is a place that feels less like a hotel and more like a
            friend's home, if your friend happened to live in paradise.
          </p>
          <Link
            to="/booking"
            className="mt-9 inline-block rounded-full border border-[#f4efe6]/30 px-7 py-3.5 text-sm tracking-wide text-[#f4efe6] transition-colors hover:bg-[#f4efe6] hover:text-[#16271d]"
          >
            Check Availability
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Gallery strip                                                       */
/* ------------------------------------------------------------------ */
function Gallery() {
  const shots = [IMG.g1, IMG.g2, IMG.g3];
  return (
    <section id="journeys" className="bg-[#f4efe6] py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="mb-14 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <h2 className="max-w-md font-['Fraunces'] text-4xl font-light leading-tight text-[#16271d] lg:text-5xl">
            A few frames from a slow day.
          </h2>
          <p className="max-w-xs text-[15px] text-[#16271d]/60">
            Mornings in the mist, afternoons by the water, evenings under a sky
            full of stars.
          </p>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-3">
          {shots.map((src, i) => (
            <Reveal key={i} delay={i * 120}>
              <div className="group overflow-hidden rounded-2xl">
                <img
                  src={src}
                  alt="Scenes from the retreat"
                  className={`w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105 ${
                    i === 1 ? "sm:mt-10 aspect-[3/4]" : "aspect-square"
                  }`}
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* CTA band                                                            */
/* ------------------------------------------------------------------ */
function CTA() {
  return (
    <section id="wellness" className="relative overflow-hidden bg-[#0e1b13] py-28">
      <div className="absolute inset-0 bg-[radial-gradient(80%_120%_at_80%_20%,rgba(201,169,106,0.15),transparent)]" />
      <Reveal className="relative mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-['Fraunces'] text-4xl font-light leading-tight text-[#f4efe6] sm:text-6xl">
          Your villa is <span className="italic text-[#e9d7b4]">waiting.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-[#f4efe6]/75">
          Tell us your dates and we'll take care of the rest — transfers, rituals,
          a chef if you'd like one.
        </p>
        <Link
          to="/booking"
          className="mt-10 inline-block rounded-full bg-[#c1683f] px-9 py-4 text-sm font-medium tracking-wide text-[#f4efe6] shadow-lg shadow-[#c1683f]/25 transition-transform duration-300 hover:scale-[1.04] hover:bg-[#b15834]"
        >
          Start Your Booking
        </Link>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */
function Footer() {
  return (
    <footer className="bg-[#0b150e] py-14 text-[#f4efe6]/60">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 lg:flex-row lg:items-center lg:px-10">
        <div>
          <p className="font-['Fraunces'] text-2xl text-[#f4efe6]">
            this<span className="italic text-[#c9a96a]">bali</span>
          </p>
          <p className="mt-2 max-w-xs text-sm">
            Jl. Raya Ubud, Gianyar, Bali 80571, Indonesia
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
          {["Villas", "Wellness", "Journeys", "Contact"].map((i) => (
            <a key={i} href={`#${i.toLowerCase()}`} className="hover:text-[#c9a96a]">
              {i}
            </a>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 px-6 pt-6 text-xs lg:px-10">
        © {new Date().getFullYear()} thisbali — a quieter way to stay.
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
export default function LandingPage() {
  return (
    <div className="font-['Hanken_Grotesk'] antialiased selection:bg-[#c9a96a] selection:text-[#16271d]">
      <Nav />
      <main>
        <Hero />
        <Experiences />
        <Story />
        <Gallery />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
