import { useState } from 'react';

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sedentary (little / no exercise)' },
  { value: 'light', label: 'Light (1–3 days / week)' },
  { value: 'moderate', label: 'Moderate (3–5 days / week)' },
  { value: 'active', label: 'Active (6–7 days / week)' },
  { value: 'very_active', label: 'Very active (intense daily training)' },
];

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem('userProfile') || 'null');
  } catch {
    return null;
  }
}

export function useUserProfile() {
  const [profile, setProfile] = useState(loadProfile);

  function save(data) {
    localStorage.setItem('userProfile', JSON.stringify(data));
    setProfile(data);
  }

  function clear() {
    localStorage.removeItem('userProfile');
    setProfile(null);
  }

  return { profile, save, clear };
}

export default function UserProfileModal({ onClose, onSave }) {
  const existing = loadProfile();
  const [form, setForm] = useState({
    weight: existing?.weight ?? '',
    height: existing?.height ?? '',
    age: existing?.age ?? '',
    gender: existing?.gender ?? 'male',
    activity: existing?.activity ?? 'moderate',
  });

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleSave() {
    const { weight, height, age, gender, activity } = form;
    if (!weight || !height || !age) return;
    onSave({ weight: +weight, height: +height, age: +age, gender, activity });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">My Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <p className="text-sm text-gray-500">Used to calculate your recommended portion size.</p>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-gray-600 font-medium">Weight (kg)</span>
              <input
                type="number" min="30" max="250" value={form.weight}
                onChange={e => set('weight', e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="70"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-gray-600 font-medium">Height (cm)</span>
              <input
                type="number" min="100" max="250" value={form.height}
                onChange={e => set('height', e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="175"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600 font-medium">Age</span>
            <input
              type="number" min="10" max="120" value={form.age}
              onChange={e => set('age', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="30"
            />
          </label>

          <div className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600 font-medium">Gender</span>
            <div className="flex gap-2">
              {['male', 'female'].map(g => (
                <button
                  key={g}
                  onClick={() => set('gender', g)}
                  className={`flex-1 py-2 rounded-lg border font-medium capitalize transition-colors ${
                    form.gender === g
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-orange-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600 font-medium">Activity level</span>
            <select
              value={form.activity}
              onChange={e => set('activity', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              {ACTIVITY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        </div>

        <button
          onClick={handleSave}
          disabled={!form.weight || !form.height || !form.age}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl transition-colors"
        >
          Save profile
        </button>
      </div>
    </div>
  );
}
