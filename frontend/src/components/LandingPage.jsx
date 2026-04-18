import { Link } from 'react-router-dom';

const FLOATERS = [
  { t: 'basil',       x: 6,   y: 18,  s: 13, d: 0,   dr: 26 },
  { t: 'olive oil',   x: 83,  y: 10,  s: 11, d: 5,   dr: 32 },
  { t: 'garlic',      x: 61,  y: 76,  s: 14, d: 9,   dr: 21 },
  { t: 'tomatoes',    x: 17,  y: 63,  s: 10, d: 2,   dr: 28 },
  { t: 'pasta',       x: 91,  y: 52,  s: 15, d: 13,  dr: 24 },
  { t: 'lemon',       x: 36,  y: 87,  s: 10, d: 6,   dr: 30 },
  { t: 'parmesan',    x: 74,  y: 33,  s: 9,  d: 17,  dr: 27 },
  { t: 'butter',      x: 44,  y: 4,   s: 12, d: 8,   dr: 22 },
  { t: 'thyme',       x: 24,  y: 42,  s: 11, d: 20,  dr: 35 },
  { t: 'cream',       x: 56,  y: 58,  s: 12, d: 1,   dr: 25 },
  { t: 'rosemary',    x: 3,   y: 80,  s: 10, d: 11,  dr: 29 },
  { t: 'mozzarella',  x: 88,  y: 82,  s: 13, d: 16,  dr: 20 },
  { t: 'flour',       x: 48,  y: 25,  s: 9,  d: 4,   dr: 33 },
  { t: 'cinnamon',    x: 14,  y: 35,  s: 10, d: 14,  dr: 23 },
  { t: 'honey',       x: 70,  y: 90,  s: 11, d: 7,   dr: 31 },
];

const STEPS = [
  {
    n: '01',
    title: 'Paste a link',
    desc: 'Copy any TikTok or Instagram recipe video URL and drop it into sparkling.pizza.',
  },
  {
    n: '02',
    title: 'AI does the work',
    desc: 'We extract the full recipe — ingredients with quantities, step-by-step instructions, and nutrition facts.',
  },
  {
    n: '03',
    title: 'Cook smarter',
    desc: 'Scale to your portions, add to your shopping list, and follow along as you cook.',
  },
];

const FEATURES = [
  {
    label: 'Social import',
    desc: 'TikTok and Instagram recipes extracted in seconds — title, ingredients, steps, all of it.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22 }}>
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" strokeLinecap="round" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Smart nutrition',
    desc: 'Automatic calorie, protein, carb, fat and fiber tracking — per serving, scaled to your portions.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22 }}>
        <path d="M3 3v18h18" strokeLinecap="round" />
        <path d="M7 16l4-4 4 4 4-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Auto-tagging',
    desc: 'Vegan, high-protein, quick, dairy-free — recipes are categorised automatically from the ingredients.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22 }}>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Shopping list',
    desc: 'One tap sends all ingredients to a live checklist. Check off as you shop.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22 }}>
        <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Portion sizing',
    desc: 'Enter your stats once and get recommended portions based on your daily calorie needs.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22 }}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Recipe editor',
    desc: 'Tweak anything — fix an ingredient, rewrite a step, add your own tags or nutrition notes.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22 }}>
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" />
      </svg>
    ),
  },
];

const MARQUEE_ITEMS = ['One link', 'Full recipe', 'Smart portions', 'Shopping list', 'Auto-tagged', 'Nutrition facts', 'No account needed'];

export default function LandingPage() {
  return (
    <>
      <style>{`
        @keyframes lp-floatUp {
          0%   { transform: translateY(0px);   opacity: 0; }
          8%   { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(-110px); opacity: 0; }
        }
        @keyframes lp-in {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lp-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes lp-pulse-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        .lp-floater { animation: lp-floatUp var(--dur)s ease-in-out var(--delay)s infinite; }
        .lp-in-1    { animation: lp-in 0.85s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
        .lp-in-2    { animation: lp-in 0.85s cubic-bezier(0.22,1,0.36,1) 0.22s both; }
        .lp-in-3    { animation: lp-in 0.85s cubic-bezier(0.22,1,0.36,1) 0.38s both; }
        .lp-in-4    { animation: lp-in 0.85s cubic-bezier(0.22,1,0.36,1) 0.52s both; }
        .lp-marquee-track { animation: lp-marquee 28s linear infinite; }
        .lp-dot     { animation: lp-pulse-dot 2.4s ease-in-out infinite; }

        .lp-cta-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background-color: #C4592A; color: #fff;
          padding: 15px 32px; border-radius: 10px;
          font-size: 15px; font-weight: 600; text-decoration: none;
          font-family: 'Outfit', system-ui, sans-serif;
          box-shadow: 0 4px 24px rgba(196,89,42,0.45);
          transition: all 0.2s ease;
        }
        .lp-cta-primary:hover {
          background-color: #A84420;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(196,89,42,0.55);
        }
        .lp-cta-dark {
          display: inline-flex; align-items: center; gap: 10px;
          background-color: #1C2B1A; color: #F5EED8;
          padding: 16px 36px; border-radius: 10px;
          font-size: 15px; font-weight: 600; text-decoration: none;
          font-family: 'Outfit', system-ui, sans-serif;
          box-shadow: 0 4px 24px rgba(26,18,8,0.35);
          transition: all 0.2s ease;
        }
        .lp-cta-dark:hover {
          background-color: #243621;
          transform: translateY(-2px);
          box-shadow: 0 10px 36px rgba(26,18,8,0.45);
        }
        .lp-feature-card {
          padding: 32px 28px;
          background-color: #FAF6EC;
          border-top: 2.5px solid #C4592A;
          transition: background-color 0.2s ease, transform 0.2s ease;
          cursor: default;
        }
        .lp-feature-card:hover {
          background-color: #F5EED8;
          transform: translateY(-3px);
        }
        .lp-nav-link {
          background: transparent;
          border: 1.5px solid rgba(245,238,216,0.2);
          color: rgba(245,238,216,0.65);
          padding: 9px 20px; border-radius: 8px;
          font-size: 13px; font-weight: 500; text-decoration: none;
          font-family: 'Outfit', system-ui, sans-serif;
          transition: all 0.2s;
        }
        .lp-nav-link:hover {
          background: rgba(255,255,255,0.1);
          color: #F5EED8;
          border-color: rgba(245,238,216,0.4);
        }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: '#1C2B1A',
          minHeight: '100svh',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Grain overlay */}
        <div
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
            opacity: 0.45,
          }}
        />

        {/* Radial glow */}
        <div
          style={{
            position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
            width: '70vw', height: '60vh',
            background: 'radial-gradient(ellipse, rgba(196,89,42,0.07) 0%, transparent 70%)',
            pointerEvents: 'none', zIndex: 1,
          }}
        />

        {/* Floating ingredient words */}
        {FLOATERS.map((f, i) => (
          <span
            key={i}
            className="lp-floater"
            style={{
              position: 'absolute', left: `${f.x}%`, top: `${f.y}%`,
              fontSize: `${f.s}px`,
              color: 'rgba(245,238,216,0.06)',
              fontFamily: 'Cormorant, Georgia, serif',
              fontStyle: 'italic', pointerEvents: 'none', userSelect: 'none',
              '--dur': f.dr, '--delay': f.d, zIndex: 2,
            }}
          >
            {f.t}
          </span>
        ))}

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', position: 'relative', zIndex: 10 }}>
          <span
            style={{
              fontFamily: 'Cormorant, Georgia, serif',
              fontSize: '21px', fontWeight: 600, color: '#F5EED8',
              letterSpacing: '-0.01em', lineHeight: 1,
            }}
          >
            sparkling<span className="lp-dot" style={{ color: '#C4592A' }}>.</span>pizza
          </span>
          <Link to="/app" className="lp-nav-link">Open app</Link>
        </nav>

        {/* Hero content */}
        <div
          style={{
            flex: 1, display: 'flex', alignItems: 'center',
            padding: 'clamp(32px, 5vw, 64px) clamp(24px, 6vw, 80px) clamp(64px, 10vw, 120px)',
            position: 'relative', zIndex: 10,
          }}
        >
          <div style={{ maxWidth: '820px' }}>

            <div className="lp-in-1" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#C4592A', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(245,238,216,0.45)', fontWeight: 500, fontFamily: 'Outfit, system-ui, sans-serif' }}>
                Your personal recipe collection
              </span>
            </div>

            <h1
              className="lp-in-2"
              style={{
                fontFamily: 'Cormorant, Georgia, serif',
                fontSize: 'clamp(54px, 11vw, 112px)',
                fontWeight: 600, fontStyle: 'italic',
                lineHeight: 0.9, color: '#F5EED8',
                letterSpacing: '-0.025em',
                marginBottom: 'clamp(28px, 4vw, 44px)',
              }}
            >
              From scroll<br />
              <span style={{ color: 'rgba(245,238,216,0.35)' }}>to plate</span>
              <span style={{ color: '#C4592A' }}>.</span>
            </h1>

            <p
              className="lp-in-3"
              style={{
                fontSize: 'clamp(15px, 1.8vw, 18px)',
                color: 'rgba(245,238,216,0.5)',
                lineHeight: 1.7, maxWidth: '520px',
                marginBottom: 'clamp(32px, 5vw, 52px)',
                fontFamily: 'Outfit, system-ui, sans-serif', fontWeight: 300,
              }}
            >
              Paste a TikTok or Instagram link. Get the full recipe — ingredients,
              steps, and nutrition — saved in your personal cookbook, instantly.
            </p>

            <div className="lp-in-4" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <Link to="/app" className="lp-cta-primary">
                Start cooking
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 16, height: 16 }}>
                  <path d="M4 10h12M10 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <span style={{ fontSize: '13px', color: 'rgba(245,238,216,0.25)', fontFamily: 'Outfit, system-ui, sans-serif' }}>
                Free · No account needed
              </span>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to top, rgba(28,43,26,0.6), transparent)', pointerEvents: 'none', zIndex: 3 }} />
      </section>

      {/* ── MARQUEE ───────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#243621',
          padding: '13px 0', overflow: 'hidden',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="lp-marquee-track" style={{ display: 'flex', whiteSpace: 'nowrap' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '18px', paddingRight: '18px' }}>
              <span style={{ color: 'rgba(245,238,216,0.4)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Outfit, system-ui, sans-serif', fontWeight: 500 }}>
                {item}
              </span>
              <span style={{ color: '#C4592A', fontSize: '14px', opacity: 0.7 }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#F5EED8', padding: 'clamp(64px, 9vw, 128px) clamp(24px, 6vw, 80px)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

          <div style={{ marginBottom: 'clamp(48px, 7vw, 80px)' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8B7D6B', fontWeight: 500, marginBottom: '14px', fontFamily: 'Outfit, system-ui, sans-serif' }}>
              How it works
            </p>
            <h2
              style={{
                fontFamily: 'Cormorant, Georgia, serif',
                fontSize: 'clamp(34px, 5.5vw, 58px)', fontWeight: 600,
                color: '#1A1208', lineHeight: 1.05, letterSpacing: '-0.015em',
              }}
            >
              Three steps to your<br />
              <em style={{ color: '#8B7D6B' }}>personal cookbook.</em>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'clamp(36px, 5vw, 64px)' }}>
            {STEPS.map((step, i) => (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0', marginBottom: '24px' }}>
                  <span
                    style={{
                      fontFamily: 'Cormorant, Georgia, serif',
                      fontSize: 'clamp(72px, 8vw, 96px)', fontWeight: 300,
                      color: '#E2D5BE', lineHeight: 1, fontStyle: 'italic',
                      marginRight: '16px',
                    }}
                  >
                    {step.n}
                  </span>
                  <div style={{ width: '1px', height: '44px', backgroundColor: '#CFC0A8', marginBottom: '6px', flexShrink: 0 }} />
                </div>
                <h3
                  style={{
                    fontFamily: 'Cormorant, Georgia, serif',
                    fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 600,
                    color: '#1A1208', marginBottom: '12px', letterSpacing: '-0.01em',
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#8B7D6B', lineHeight: 1.75, fontFamily: 'Outfit, system-ui, sans-serif', fontWeight: 300 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: '#FAF6EC',
          padding: 'clamp(64px, 9vw, 112px) clamp(24px, 6vw, 80px)',
          borderTop: '1px solid #E2D5BE',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

          <div style={{ marginBottom: 'clamp(40px, 6vw, 64px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
            <div>
              <p style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8B7D6B', fontWeight: 500, marginBottom: '12px', fontFamily: 'Outfit, system-ui, sans-serif' }}>
                Everything you need
              </p>
              <h2
                style={{
                  fontFamily: 'Cormorant, Georgia, serif',
                  fontSize: 'clamp(34px, 5.5vw, 58px)', fontWeight: 600,
                  color: '#1A1208', lineHeight: 1.05, letterSpacing: '-0.015em',
                }}
              >
                Built for real cooks.
              </h2>
            </div>
            <Link to="/app" className="lp-cta-primary" style={{ flexShrink: 0 }}>
              Try it free
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2px',
              backgroundColor: '#E2D5BE',
            }}
          >
            {FEATURES.map((f, i) => (
              <div key={i} className="lp-feature-card">
                <div style={{ color: '#C4592A', marginBottom: '18px', opacity: 0.85 }}>
                  {f.icon}
                </div>
                <h3
                  style={{
                    fontFamily: 'Cormorant, Georgia, serif',
                    fontSize: '22px', fontWeight: 600,
                    color: '#1A1208', marginBottom: '8px',
                  }}
                >
                  {f.label}
                </h3>
                <p style={{ fontSize: '13px', color: '#8B7D6B', lineHeight: 1.7, fontFamily: 'Outfit, system-ui, sans-serif', fontWeight: 300 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: '#C4592A',
          padding: 'clamp(80px, 12vw, 160px) clamp(24px, 6vw, 80px)',
          position: 'relative', overflow: 'hidden', textAlign: 'center',
        }}
      >
        {/* Decorative oversized letters */}
        <div
          style={{
            position: 'absolute', bottom: '-30px', left: '-10px',
            fontFamily: 'Cormorant, Georgia, serif',
            fontSize: 'clamp(160px, 22vw, 280px)', fontWeight: 700, fontStyle: 'italic',
            color: 'rgba(253,240,232,0.055)', lineHeight: 1,
            pointerEvents: 'none', userSelect: 'none', zIndex: 1,
          }}
        >
          sp
        </div>
        <div
          style={{
            position: 'absolute', top: '-20px', right: '-10px',
            fontFamily: 'Cormorant, Georgia, serif',
            fontSize: 'clamp(120px, 18vw, 220px)', fontWeight: 700, fontStyle: 'italic',
            color: 'rgba(253,240,232,0.04)', lineHeight: 1,
            pointerEvents: 'none', userSelect: 'none', zIndex: 1,
          }}
        >
           pizza
        </div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '640px', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'Cormorant, Georgia, serif',
              fontSize: 'clamp(42px, 8vw, 80px)', fontWeight: 600, fontStyle: 'italic',
              color: '#FDF0E8', lineHeight: 1.0,
              marginBottom: '24px', letterSpacing: '-0.025em',
            }}
          >
            Your recipes,<br />finally organized.
          </h2>

          <p
            style={{
              fontSize: 'clamp(14px, 1.8vw, 17px)',
              color: 'rgba(253,240,232,0.65)',
              lineHeight: 1.65, marginBottom: '44px',
              fontFamily: 'Outfit, system-ui, sans-serif', fontWeight: 300,
            }}
          >
            No subscriptions. No account. Just paste a link and start building
            your personal cookbook right now.
          </p>

          <Link to="/app" className="lp-cta-dark">
            Open sparkling.pizza
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 16, height: 16 }}>
              <path d="M4 10h12M10 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer
        style={{
          backgroundColor: '#1C2B1A',
          padding: '28px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <span
          style={{
            fontFamily: 'Cormorant, Georgia, serif',
            fontSize: '19px', fontWeight: 600, color: '#F5EED8',
          }}
        >
          sparkling<span style={{ color: '#C4592A' }}>.</span>pizza
        </span>
        <span style={{ fontSize: '12px', color: 'rgba(245,238,216,0.25)', fontFamily: 'Outfit, system-ui, sans-serif' }}>
          Save recipes. Cook smarter.
        </span>
      </footer>
    </>
  );
}
