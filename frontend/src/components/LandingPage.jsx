import { Link } from 'react-router-dom';

const STEPS = [
  { n: '01', title: 'Paste a link', desc: 'Copy any TikTok or Instagram recipe video URL and paste it into 2dish.' },
  { n: '02', title: 'AI does the work', desc: 'We extract the full recipe — title, ingredients with quantities, steps, and nutrition facts.' },
  { n: '03', title: 'Cook smarter', desc: 'Scale to your portions, add everything to your shopping list, and follow along as you cook.' },
];

const FEATURES = [
  { title: 'Social import',    desc: 'TikTok & Instagram recipes extracted in seconds with AI.',                         icon: '⤵' },
  { title: 'Smart nutrition',  desc: 'Auto calorie, protein, carb, and fat tracking — scaled to your portions.',        icon: '◈' },
  { title: 'Auto-tagging',     desc: 'Vegan, high-protein, quick, dairy-free — labelled automatically.',                icon: '◇' },
  { title: 'Shopping list',    desc: 'One tap adds all ingredients to a live checklist.',                               icon: '☑' },
  { title: 'Portion sizing',   desc: 'Enter your stats and get personalized portion recommendations.',                  icon: '◎' },
  { title: 'Recipe editor',    desc: 'Edit steps, ingredients, tags, and nutrition on any saved recipe.',               icon: '✎' },
];

const MARQUEE = ['One link', 'Full recipe', 'Smart portions', 'Shopping list', 'Auto-tagged', 'Nutrition facts', 'Free to use'];

export default function LandingPage() {
  return (
    <>
      <style>{`
        @keyframes lp-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lp-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes lp-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        .lp-1 { animation: lp-up 0.7s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
        .lp-2 { animation: lp-up 0.7s cubic-bezier(0.22,1,0.36,1) 0.17s both; }
        .lp-3 { animation: lp-up 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s  both; }
        .lp-4 { animation: lp-up 0.7s cubic-bezier(0.22,1,0.36,1) 0.42s both; }
        .lp-marquee { animation: lp-marquee 24s linear infinite; }
        .lp-float   { animation: lp-float 4s ease-in-out infinite; }

        .lp-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #FF5500; color: #fff;
          padding: 14px 28px; border-radius: 10px;
          font-size: 15px; font-weight: 600; text-decoration: none;
          font-family: 'Outfit', system-ui, sans-serif;
          transition: all 0.18s ease;
          box-shadow: 0 0 0 0 rgba(255,85,0,0);
        }
        .lp-btn-primary:hover {
          background: #E04800;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(255,85,0,0.35);
        }
        .lp-btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent;
          border: 1.5px solid rgba(255,255,255,0.18);
          color: rgba(255,255,255,0.7);
          padding: 9px 18px; border-radius: 8px;
          font-size: 13px; font-weight: 500; text-decoration: none;
          font-family: 'Outfit', system-ui, sans-serif;
          transition: all 0.18s;
        }
        .lp-btn-outline:hover {
          border-color: rgba(255,255,255,0.35);
          color: #fff;
          background: rgba(255,255,255,0.06);
        }
        .lp-btn-dark {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; color: #09090B;
          padding: 14px 28px; border-radius: 10px;
          font-size: 15px; font-weight: 600; text-decoration: none;
          font-family: 'Outfit', system-ui, sans-serif;
          transition: all 0.18s;
        }
        .lp-btn-dark:hover {
          background: #F3F4F6;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
        .lp-card {
          padding: 28px 24px;
          background: #fff;
          border: 1px solid #E4E4E7;
          border-radius: 12px;
          transition: all 0.18s ease;
        }
        .lp-card:hover {
          border-color: #FFD0B8;
          box-shadow: 0 4px 20px rgba(255,85,0,0.08);
          transform: translateY(-2px);
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ background: '#09090B', minHeight: '100svh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {/* Glow */}
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: '80vw', height: '70vh',
          background: 'radial-gradient(ellipse at center, rgba(255,85,0,0.09) 0%, transparent 65%)',
          pointerEvents: 'none', zIndex: 1,
        }} />

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', position: 'relative', zIndex: 10 }}>
          <span style={{ fontFamily: 'Syne, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
            2<span style={{ color: '#FF5500' }}>d</span>ish
          </span>
          <Link to="/app" className="lp-btn-outline">Open app</Link>
        </nav>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: 'clamp(32px,5vw,64px) clamp(24px,6vw,80px) clamp(80px,12vw,140px)', position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: '780px' }}>

            <div className="lp-1" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,85,0,0.12)', border: '1px solid rgba(255,85,0,0.25)', borderRadius: '99px', padding: '5px 14px', marginBottom: '32px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#FF5500', flexShrink: 0, display: 'inline-block' }} />
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontFamily: 'Outfit, system-ui, sans-serif', fontWeight: 500 }}>TikTok & Instagram → your cookbook</span>
            </div>

            <h1 className="lp-2" style={{
              fontFamily: 'Syne, system-ui, sans-serif',
              fontSize: 'clamp(52px, 10vw, 108px)',
              fontWeight: 800,
              lineHeight: 0.92,
              color: '#fff',
              letterSpacing: '-0.04em',
              marginBottom: 'clamp(24px, 4vw, 40px)',
            }}>
              From scroll<br />
              <span style={{ color: '#FF5500' }}>to plate.</span>
            </h1>

            <p className="lp-3" style={{
              fontSize: 'clamp(15px, 1.8vw, 18px)',
              color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.7, maxWidth: '500px',
              marginBottom: 'clamp(28px, 4vw, 44px)',
              fontFamily: 'Outfit, system-ui, sans-serif', fontWeight: 300,
            }}>
              Paste any TikTok or Instagram recipe link. Get the full recipe with ingredients, steps, and nutrition — saved instantly in your personal cookbook.
            </p>

            <div className="lp-4" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <Link to="/app" className="lp-btn-primary">
                Start cooking
                <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 16, height: 16 }}>
                  <path d="M4 9h10M9 4l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)', fontFamily: 'Outfit, system-ui, sans-serif' }}>
                Free · No account needed
              </span>
            </div>
          </div>
        </div>

        {/* Bottom border */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
      </section>

      {/* ── MARQUEE ── */}
      <div style={{ background: '#111113', padding: '12px 0', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="lp-marquee" style={{ display: 'flex', whiteSpace: 'nowrap' }}>
          {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', paddingRight: '16px' }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Outfit, system-ui, sans-serif', fontWeight: 500 }}>{item}</span>
              <span style={{ color: '#FF5500', opacity: 0.6 }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: '#F3F4F6', padding: 'clamp(64px,9vw,120px) clamp(24px,6vw,80px)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

          <p style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#71717A', fontWeight: 600, marginBottom: '14px', fontFamily: 'Outfit, system-ui, sans-serif' }}>
            How it works
          </p>
          <h2 style={{ fontFamily: 'Syne, system-ui, sans-serif', fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, color: '#09090B', marginBottom: 'clamp(48px,7vw,80px)', lineHeight: 1.0, letterSpacing: '-0.03em' }}>
            Three steps.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'clamp(32px,5vw,56px)' }}>
            {STEPS.map((step, i) => (
              <div key={i}>
                <span style={{ display: 'inline-block', fontFamily: 'Syne, system-ui, sans-serif', fontSize: '13px', fontWeight: 700, color: '#FF5500', letterSpacing: '0.05em', marginBottom: '16px' }}>
                  {step.n}
                </span>
                <h3 style={{ fontFamily: 'Syne, system-ui, sans-serif', fontSize: 'clamp(22px,3vw,26px)', fontWeight: 700, color: '#09090B', marginBottom: '10px', letterSpacing: '-0.02em' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#71717A', lineHeight: 1.75, fontFamily: 'Outfit, system-ui, sans-serif', fontWeight: 300 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ background: '#fff', padding: 'clamp(64px,9vw,112px) clamp(24px,6vw,80px)', borderTop: '1px solid #E4E4E7' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px', marginBottom: 'clamp(40px,6vw,64px)' }}>
            <div>
              <p style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#71717A', fontWeight: 600, marginBottom: '12px', fontFamily: 'Outfit, system-ui, sans-serif' }}>
                Everything you need
              </p>
              <h2 style={{ fontFamily: 'Syne, system-ui, sans-serif', fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, color: '#09090B', lineHeight: 1.0, letterSpacing: '-0.03em' }}>
                Built for real cooks.
              </h2>
            </div>
            <Link to="/app" className="lp-btn-primary" style={{ flexShrink: 0 }}>Try it free</Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="lp-card">
                <span style={{ fontSize: '20px', display: 'block', marginBottom: '14px', color: '#FF5500' }}>{f.icon}</span>
                <h3 style={{ fontFamily: 'Syne, system-ui, sans-serif', fontSize: '18px', fontWeight: 700, color: '#09090B', marginBottom: '6px', letterSpacing: '-0.02em' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#71717A', lineHeight: 1.7, fontFamily: 'Outfit, system-ui, sans-serif', fontWeight: 300 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: '#09090B', padding: 'clamp(80px,12vw,160px) clamp(24px,6vw,80px)', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>

        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />

        {/* Glow */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '60vw', height: '60vh', background: 'radial-gradient(ellipse, rgba(255,85,0,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Syne, system-ui, sans-serif', fontSize: 'clamp(40px,7vw,72px)', fontWeight: 800, color: '#fff', lineHeight: 1.0, marginBottom: '20px', letterSpacing: '-0.04em' }}>
            Your recipes,<br /><span style={{ color: '#FF5500' }}>organized.</span>
          </h2>
          <p style={{ fontSize: 'clamp(14px,1.8vw,17px)', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, marginBottom: '40px', fontFamily: 'Outfit, system-ui, sans-serif', fontWeight: 300 }}>
            No subscriptions. No account. Paste a link and start building your cookbook right now.
          </p>
          <Link to="/app" className="lp-btn-dark">
            Open 2dish
            <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 16, height: 16 }}>
              <path d="M4 9h10M9 4l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#09090B', padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontFamily: 'Syne, system-ui, sans-serif', fontSize: '18px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
          2<span style={{ color: '#FF5500' }}>d</span>ish
        </span>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', fontFamily: 'Outfit, system-ui, sans-serif' }}>
          Save recipes. Cook smarter.
        </span>
      </footer>
    </>
  );
}
