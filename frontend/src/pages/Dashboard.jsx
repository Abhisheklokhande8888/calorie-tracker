import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import GoalProgress from "../components/GoalProgress.jsx";
import WeeklyChart from "../components/WeeklyChart.jsx";
import { unitLabel } from "../constants/foodUnits.js";

export default function Dashboard() {
  const { user, updateUserLocal } = useAuth();
  const [today, setToday] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weeklyLoading, setWeeklyLoading] = useState(true);
  const [error, setError] = useState("");
  const [weeklyError, setWeeklyError] = useState("");
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [calorieGoal, setCalorieGoal] = useState(user?.calorieGoal ?? 2000);
  const [proteinGoal, setProteinGoal] = useState(user?.proteinGoal ?? 100);
  const [savingGoals, setSavingGoals] = useState(false);

  const loadToday = async () => {
    setError("");
    try {
      const { data } = await api.get("/api/food/today");
      setToday(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load today’s data");
    } finally {
      setLoading(false);
    }
  };

  const loadWeekly = async () => {
    setWeeklyError("");
    try {
      const { data } = await api.get("/api/food/weekly");
      setWeekly(data);
    } catch (err) {
      setWeeklyError(err.response?.data?.message || "Could not load weekly chart");
    } finally {
      setWeeklyLoading(false);
    }
  };

  useEffect(() => {
    loadToday();
    loadWeekly();
  }, []);

  useEffect(() => {
    if (user) {
      setCalorieGoal(user.calorieGoal ?? 2000);
      setProteinGoal(user.proteinGoal ?? 100);
    }
  }, [user]);

  const saveGoals = async (e) => {
    e.preventDefault();
    setSavingGoals(true);
    try {
      const { data } = await api.put("/api/user/goals", {
        calorieGoal: Number(calorieGoal),
        proteinGoal: Number(proteinGoal),
      });
      updateUserLocal({
        calorieGoal: data.calorieGoal,
        proteinGoal: data.proteinGoal,
      });
      setGoalsOpen(false);
      await loadToday();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save goals");
    } finally {
      setSavingGoals(false);
    }
  };

  if (loading && !today) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex justify-center">
        <div className="h-10 w-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totals = today?.totals ?? { calories: 0, protein: 0 };
  const goals = today?.goals ?? { calorieGoal: user?.calorieGoal ?? 2000, proteinGoal: user?.proteinGoal ?? 100 };
  const progress = today?.progress ?? { caloriesPercent: 0, proteinPercent: 0 };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Hello, {user?.name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Today · {today?.date || new Date().toISOString().slice(0, 10)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setGoalsOpen(true)}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium"
          >
            Edit goals
          </button>
          <Link
            to="/add-food"
            className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium shadow-lg shadow-brand-500/25"
          >
            Add food
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Today’s progress</h2>
            <div className="space-y-8">
              <GoalProgress
                label="Calories"
                current={totals.calories}
                goal={goals.calorieGoal}
                percent={progress.caloriesPercent}
                colorClass="bg-emerald-500"
              />
              <GoalProgress
                label="Protein (g)"
                current={totals.protein}
                goal={goals.proteinGoal}
                percent={progress.proteinPercent}
                colorClass="bg-blue-500"
              />
            </div>
          </div>

          <WeeklyChart
            labels={weekly?.labels || []}
            calories={weekly?.calories || []}
            protein={weekly?.protein || []}
            loading={weeklyLoading}
            error={weeklyError}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm h-fit">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Today’s meals</h2>
          {!today?.entries?.length ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm">No entries yet. Add your first meal.</p>
          ) : (
            <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {today.entries.map((e) => (
                <li
                  key={e._id}
                  className="flex justify-between gap-2 text-sm border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-100 truncate">{e.foodName}</span>
                  <span className="text-slate-500 dark:text-slate-400 shrink-0 text-right">
                    {e.calories} kcal · {e.protein}g
                    <span className="block text-xs text-slate-400 dark:text-slate-500">
                      {(e.quantity ?? 1)}× {unitLabel(e.unit)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/history"
            className="mt-4 inline-block text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline"
          >
            View full history →
          </Link>
        </div>
      </div>

      {goalsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Daily goals</h3>
            <form onSubmit={saveGoals} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Calorie goal (kcal)
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={calorieGoal}
                  onChange={(e) => setCalorieGoal(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Protein goal (g)
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={proteinGoal}
                  onChange={(e) => setProteinGoal(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setGoalsOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingGoals}
                  className="px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-60"
                >
                  {savingGoals ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
