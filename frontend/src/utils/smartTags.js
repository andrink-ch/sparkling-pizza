const SMART_TAGS = [
  { key: 'high-protein', label: 'High protein', color: 'green',   fn: r => r.protein_g >= 25 },
  { key: 'low-cal',      label: 'Low cal',      color: 'blue',    fn: r => r.calories > 0 && r.calories <= 400 },
  { key: 'low-carb',     label: 'Low carb',     color: 'purple',  fn: r => r.carbs_g > 0 && r.carbs_g <= 20 },
  { key: 'high-fiber',   label: 'High fiber',   color: 'emerald', fn: r => r.fiber_g >= 8 },
  { key: 'quick',        label: 'Quick',        color: 'amber',   fn: r => {
    const t = (r.prep_time_min || 0) + (r.cook_time_min || 0);
    return t > 0 && t <= 20;
  }},
];

export const TAG_COLORS = {
  green:   'bg-green-100 text-green-700',
  blue:    'bg-sky-100 text-sky-700',
  purple:  'bg-violet-100 text-violet-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  amber:   'bg-amber-100 text-amber-700',
};

export function getSmartTags(recipe) {
  return SMART_TAGS.filter(t => t.fn(recipe));
}

export { SMART_TAGS };
