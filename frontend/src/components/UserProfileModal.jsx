import { useState } from 'react';

const ACTIVITY_OPTIONS = [
  { value: 'sedentary',   label: 'Sedentary',    sub: 'Little or no exercise' },
  { value: 'light',       label: 'Light',         sub: '1–3 days / week' },
  { value: 'moderate',    label: 'Moderate',      sub: '3–5 days / week' },
  { value: 'active',      label: 'Active',        sub: '6–7 days / week' },
  { value: 'very_active', label: 'Very active',   sub: 'Intense daily training' },
];

function loadProfile() {
  try { return JSON.parse(localStorage.getItem('userProfile') || 'null'); }
  catch { return null; }
}

export function useUserProfile() {
  const [profile, setProfile] = useState(loadProfile);
  function save(data)  { localStorage.setItem('userProfile', JSON.stringify(data)); setProfile(data); }
  function clear()     { localStorage.removeItem('userProfile'); setProfile(null); }
  return { profile, save, clear };
}

const fieldCls = 'w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all font-sans';

export default function UserProfileModal({ onClose, onSave }) {
  const existing = loadProfile();
  const [form, setForm] = useState({
    weight:   existing?.weight   ?? '',
    height:   existing?.height   ?? '',
    age:      existing?.age      ?? '',
    gender:   existing?.gender   ?? 'male',
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
      style={{ backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
    >
      <div className="bg-surface rounded-2xl w-full max-w-sm shadow-modal border border-border animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="font-display font-bold text-xl text-ink">My Profile</h2>
            <p className="text-xs text-ink-4 mt-0.5">Used to calculate your recommended portions.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-4 hover:text-ink hover:bg-border transition-colors text-xl mt-0.5">×</button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {[['weight', 'Weight (kg)', '70', 30, 250], ['height', 'Height (cm)', '175', 100, 250]].map(([key, label, ph, min, max]) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-4">{label}</label>
                <input type="number" min={min} max={max} value={form[key]} placeholder={ph}
                  onChange={e => set(key, e.target.value)} className={fieldCls} />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-4">Age</label>
            <input type="number" min="10" max="120" value={form.age} placeholder="30"
              onChange={e => set('age', e.target.value)} className={fieldCls} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-4">Gender</label>
            <div className="grid grid-cols-2 gap-2">
              {['male', 'female'].map(g => (
                <button
                  key={g}
                  onClick={() => set('gender', g)}
                  className="py-2.5 rounded-lg text-sm font-semibold capitalize transition-all border"
                  style={{
                    backgroundColor: form.gender === g ? '#FF5500' : '#fff',
                    color:           form.gender === g ? '#fff'    : '#71717A',
                    borderColor:     form.gender === g ? '#FF5500' : '#E4E4E7',
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-4">Activity level</label>
            <select value={form.activity} onChange={e => set('activity', e.target.value)} className={fieldCls}>
              {ACTIVITY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label} — {o.sub}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={handleSave}
            disabled={!valid}
            className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-accent hover:bg-accent-dark disabled:opacity-40 transition-colors"
          >
            Save profile
          </button>
        </div>
      </div>
    </div>
  );
}
