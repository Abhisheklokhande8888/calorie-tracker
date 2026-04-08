import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import {
  DEFAULT_FOOD_UNIT,
  FOOD_UNIT_OPTIONS,
  unitLabel,
} from "../constants/foodUnits.js";

export default function AddFood() {
  const navigate = useNavigate();
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState(DEFAULT_FOOD_UNIT);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedFoods, setSavedFoods] = useState([]);
  const [pickSaved, setPickSaved] = useState("");

  useEffect(() => {
    api
      .get("/api/saved-foods")
      .then((res) => setSavedFoods(res.data))
      .catch(() => setSavedFoods([]));
  }, []);

  const applySavedFood = (item) => {
    setFoodName(item.name);
    setCalories(String(item.calories));
    setProtein(String(item.protein));
    setUnit(item.unit);
    setQuantity("1");
    setPickSaved("");
  };

  const qtyNum = Number(quantity);
  const calNum = Number(calories);
  const protNum = Number(protein);
  const preview = useMemo(() => {
    if (calories === "" || protein === "" || quantity === "") return null;
    if (!Number.isFinite(qtyNum) || qtyNum <= 0) return null;
    if (!Number.isFinite(calNum) || !Number.isFinite(protNum)) return null;
    return {
      calories: Math.round(calNum * qtyNum * 100) / 100,
      protein: Math.round(protNum * qtyNum * 100) / 100,
    };
  }, [qtyNum, calNum, protNum, calories, protein, quantity]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const q = Number(quantity);
      if (!Number.isFinite(q) || q <= 0) {
        setError("Enter a valid quantity (greater than 0).");
        setLoading(false);
        return;
      }
      await api.post("/api/food/add", {
        foodName: foodName.trim(),
        calories: Number(calories),
        protein: Number(protein),
        quantity: q,
        unit,
      });
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Could not save entry";
      const details = err.response?.data?.errors;
      setError(details ? `${msg}: ${JSON.stringify(details)}` : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 sm:py-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Add food</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
        Choose what your numbers refer to in <strong className="text-slate-700 dark:text-slate-300">Unit</strong>, enter
        calories and protein for that unit, then set <strong className="text-slate-700 dark:text-slate-300">quantity</strong>{" "}
        to scale. Use <strong className="text-slate-700 dark:text-slate-300">100g</strong> for solids and{" "}
        <strong className="text-slate-700 dark:text-slate-300">100 ml</strong> for drinks, or load from{" "}
        <Link to="/my-foods" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
          My foods
        </Link>
        .
      </p>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm mb-8">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">My foods</h2>
        {savedFoods.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Save your own items (per selected unit) on{" "}
            <Link to="/my-foods" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
              My foods
            </Link>{" "}
            to quickly fill this form.
          </p>
        ) : (
          <>
            <label htmlFor="saved-food-pick" className="sr-only">
              Load from my foods
            </label>
            <select
              id="saved-food-pick"
              value={pickSaved}
              onChange={(e) => {
                const id = e.target.value;
                if (!id) return;
                const item = savedFoods.find((s) => s._id === id);
                if (item) applySavedFood(item);
              }}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white"
            >
              <option value="">Load from my foods…</option>
              {savedFoods.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.calories} kcal · {s.protein}g / {unitLabel(s.unit)})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Then adjust <span className="font-medium">quantity</span> below (e.g. 2 = two 100g or two 100 ml portions).
            </p>
          </>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm px-3 py-2">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Food name</label>
            <input
              required
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Calories (kcal)
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                required
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                required
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2">
            Values above apply to one <span className="font-medium text-slate-600 dark:text-slate-300">unit</span> you
            pick below.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
              <input
                type="number"
                min={0.01}
                step={0.01}
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="food-unit" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Unit
              </label>
              <select
                id="food-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              >
                {FOOD_UNIT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2">
            Example: 100g + quantity 2 = 200g of food; 100 ml + quantity 0.5 = 50 ml of drink.
          </p>
          {preview && (
            <div className="rounded-lg bg-slate-100 dark:bg-slate-800/80 px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
              <span className="font-medium">Logged totals: </span>
              {preview.calories} kcal · {preview.protein}g protein
              <span className="text-slate-500 dark:text-slate-400">
                {" "}
                ({quantity}× {unitLabel(unit)})
              </span>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
