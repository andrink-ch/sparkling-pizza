export function calcTDEE({ weight, height, age, gender, activity }) {
  const bmr =
    gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  const factors = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  return Math.round(bmr * (factors[activity] ?? 1.55));
}

export function recommendedPortions(tdee, caloriesPerServing) {
  if (!tdee || !caloriesPerServing) return null;
  const perMeal = tdee / 3;
  return Math.max(1, Math.min(3, Math.round(perMeal / caloriesPerServing)));
}

export function formatQty(value) {
  if (value == null) return '';
  const rounded = Math.round(value * 100) / 100;
  return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(2).replace(/\.?0+$/, '');
}
