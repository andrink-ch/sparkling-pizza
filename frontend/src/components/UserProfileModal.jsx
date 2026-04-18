import { useState } from 'react';

const ACTIVITY_OPTIONS = [
  { value: 'sedentary',   label: 'Sedentary',   sub: 'Little / no exercise' },
  { value: 'light',       label: 'Light',        sub: '1–3 days / week' },
  { value: 'moderate',    label: 'Moderate',     sub: '3–5 days / week' },
  { value: 'active',      label: 'Active',       sub: '6–7 days / week' },
  { value: 'very_active', label: 'Very active',  sub: 'Intense daily training' },
];

function loadProfile() {
  try { return JSON.parse(localStorage.getItem('userProfile') || 'null'); }
  catch { return null; }
}

export function useUserProfile() {
  const [profile, setProfile] = useState(loadProfile);
  function save(data) { localStorage.setItem('userProfile', JSON.stringify(data)); setProfile(data); }
  function clear() { localStorage.removeItem('userProfile'); setProfile(null); }
  return { profile, save, clear };
}

const inputStyle = {
  backgroundColor: '#F5EED8',
  border: '1.5px solid #E2D5BE',
  borderRadius: '10px',
  padding: '10px 14px',
  fontSize: '14px',
  color: '#1A1208',
  width: '100%',
  outline: 'none',
  fontFamily: 'Outfit, system-ui, sans-serif',
};

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">{label}</label>
      {children}
    </div>
  );
}

export default function UserProfileModal({ onClose, onSave }) {
  const existing = loadProfile();
  const [form, setForm] = useState({
    weight:   existing?.weight ?? '',
    height:   existing?.height ?? '',
    age:      existing?.age ?? '',
    gender:   existing?.gender ?? 'male',
    activity: existing?.activity ?? 'moderate',
  });

  function set(field, value) { setForm(f => ({ ...f, [field]: value })); }

  function handleSave() {
    const { weight, height, age, gender, activity } = form;
    if (!weight || !height || !age) return;
    onSave({ weight: +weight, height: +height, age: +age, gender, activity });
    onClose();
  }

  const valid = form.weight && form.height && form.age;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(26,18,8,0.45)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden animate-slide-up"
        style={{
          backgroundColor: '#FAF6EC',
          boxShadow: '0 24px 64px rgba(26,18,8,0.22)',
          border: '1px solid #E2D5BE',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-start justify-between"
          style={{ borderBottom: '1px solid #EDE4D0' }}
        >
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">My Profile</h2>
            <p className="text-xs text-muted mt-0.5">Used to calculate your recommended portions.</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-warm-border transition-colors mt-0.5"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Weight (kg)">
              <input
                type="number" min="30" max="250"
                value={form.weight}
                onChange={e => set('weight', e.target.value)}
                placeholder="70"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#C4592A'; e.target.style.boxShadow = '0 0 0 3px rgba(196,89,42,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = '#E2D5BE'; e.target.style.boxShadow = 'none'; }}
              />
            </Field>
            <Field label="Height (cm)">
              <input
                type="number" min="100" max="250"
                value={form.height}
                onChange={e => set('height', e.target.value)}
                placeholder="175"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#C4592A'; e.target.style.boxShadow = '0 0 0 3px rgba(196,89,42,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = '#E2D5BE'; e.target.style.boxShadow = 'none'; }}
              />
            </Field>
          </div>

          <Field label="Age">
            <input
              type="number" min="10" max="120"
              value={form.age}
              onChange={e => set('age', e.target.value)}
              placeholder="30"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = '#C4592A'; e.target.style.boxShadow = '0 0 0 3px rgba(196,89,42,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = '#E2D5BE'; e.target.style.boxShadow = 'none'; }}
            />
          </Field>

          <Field label="Gender">
            <div className="grid grid-cols-2 gap-2">
              {['male', 'female'].map(g => {
                const active = form.gender === g;
                return (
                  <button
                    key={g}
                    onClick={() => set('gender', g)}
                    className="py-2.5 rounded-[10px] text-sm font-medium capitalize transition-all duration-200"
                    style={{
                      backgroundColor: active ? '#C4592A' : '#F5EED8',
                      color: active ? '#fff' : '#8B7D6B',
                      border: `1.5px solid ${active ? '#C4592A' : '#E2D5BE'}`,
                      boxShadow: active ? '0 2px 8px rgba(196,89,42,0.25)' : 'none',
                    }}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Activity level">
            <select
              value={form.activity}
              onChange={e => set('activity', e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={e => { e.target.style.borderColor = '#C4592A'; e.target.style.boxShadow = '0 0 0 3px rgba(196,89,42,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = '#E2D5BE'; e.target.style.boxShadow = 'none'; }}
            >
              {ACTIVITY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label} — {o.sub}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={handleSave}
            disabled={!valid}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-40"
            style={{
              backgroundColor: '#C4592A',
              boxShadow: valid ? '0 3px 12px rgba(196,89,42,0.3)' : 'none',
            }}
            onMouseEnter={e => { if (valid) e.currentTarget.style.backgroundColor = '#A84420'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#C4592A'; }}
          >
            Save profile
          </button>
        </div>
      </div>
    </div>
  );
}
