/**
 * Skalowanie ilości składnika do wybranej liczby porcji.
 * Dla szt/opak: zaokrąglenie do liczby całkowitej (min 1).
 * Dla pozostałych: do 2 miejsc po przecinku.
 */
export function scaleIngredientQuantity(
  quantity: number,
  unit: string,
  desiredServings: number,
  recipeServings: number
): number {
  if (recipeServings <= 0) return quantity;
  const scale = desiredServings / recipeServings;
  const scaled = quantity * scale;
  const u = unit?.toLowerCase() ?? '';
  if (u === 'szt' || u === 'opak') {
    return Math.max(1, Math.round(scaled));
  }
  const rounded = Math.round(scaled * 100) / 100;
  return rounded < 0.01 ? 0.01 : rounded;
}
