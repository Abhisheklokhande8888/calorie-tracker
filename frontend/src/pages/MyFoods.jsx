import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import { SAVED_FOOD_UNIT_OPTIONS } from "../constants/foodUnits.js";

const emptyForm = {
  name: "",
  calories: "",
  protein: "",
  unit: "100g",
};

export default function MyFoods() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.get("/api/saved-foods");
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load your foods");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      calories: String(item.calories),
      protein: String(item.protein),
      unit: item.unit,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        calories: Number(form.calories),
        protein: Number(form.protein),
        unit: form.unit,
      };
      if (editingId) {
        await api.put(`/api/saved-foods/${editingId}`, payload);
      } else {
        await api.post("/api/saved-foods", payload);
      }
      resetForm();
      await load();
    } catch (err) {
      const msg = err.response?.data?.message || "Save failed";
      const details = err.response?.data?.errors;
      setError(details ? `${msg}: ${JSON.stringify(details)}` : msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this item from your list?")) return;
    try {
      await api.delete(`/api/saved-foods/${id}`);
      if (editingId === id) resetForm();
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My foods</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Save calories and protein per 100g or 100 ml, then pick them on{" "}
            <Link to="/add-food" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
              Add food
            </Link>{" "}
            and set quantity.
          </p>
        </div>
        <Link
          to="/add-food"
          className="inline-flex justify-center px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium shrink-0"
        >
          Log a meal
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm mb-10">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {editingId ? "Edit item" : "Add new item"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm px-3 py-2">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Homemade granola"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Calories (kcal / 100g or 100 ml)
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                required
                value={form.calories}
                onChange={(e) => setForm((f) => ({ ...f, calories: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Protein (g / 100g or 100 ml)
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                required
                value={form.protein}
                onChange={(e) => setForm((f) => ({ ...f, protein: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Per</label>
              <select
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              >
                {SAVED_FOOD_UNIT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium disabled:opacity-60"
            >
              {saving ? "Saving…" : editingId ? "Update item" : "Save to my list"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>

      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Your list</h2>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400 text-center py-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
          No saved foods yet. Add one above.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item._id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {item.calories} kcal · {item.protein}g protein per {item.unit === "100ml" ? "100 ml" : "100g"}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item._id)}
                  className="text-sm px-3 py-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
