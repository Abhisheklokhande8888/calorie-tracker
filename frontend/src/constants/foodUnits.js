/** Must match backend `config/foodUnits.js` values. */
export const DEFAULT_FOOD_UNIT = "100g";

/** Units allowed for user-saved foods. */
export const SAVED_FOOD_UNIT_OPTIONS = [
  { value: "100g", label: "100g" },
  { value: "100ml", label: "100 ml" },
  { value: "serving", label: "Per serving" },
  { value: "tbsp", label: "Per tbsp" },
  { value: "piece", label: "Per piece" },
];

export const FOOD_UNIT_OPTIONS = [
  { value: "100g", label: "100g" },
  { value: "100ml", label: "100 ml" },
  { value: "1g", label: "Per 1g" },
  { value: "serving", label: "Per serving" },
  { value: "cup", label: "Per cup" },
  { value: "tbsp", label: "Per tbsp" },
  { value: "piece", label: "Per piece" },
  { value: "ml", label: "Per ml" },
  { value: "oz", label: "Per oz" },
];

const LABEL_BY_VALUE = Object.fromEntries(FOOD_UNIT_OPTIONS.map((o) => [o.value, o.label]));

/** Human-readable label for a unit key (e.g. "100g"). */
export function unitLabel(unit) {
  const u = unit || DEFAULT_FOOD_UNIT;
  return LABEL_BY_VALUE[u] ?? u;
}
