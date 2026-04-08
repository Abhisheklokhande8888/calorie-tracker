import { useCallback, useEffect, useState } from "react";
import api from "../services/api.js";
import { unitLabel } from "../constants/foodUnits.js";

export default function History() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState(null);

  const limit = 5;

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const { data: res } = await api.get("/api/food/history", { params: { page, limit } });
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load history");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const removeEntry = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    setDeleting(id);
    try {
      await api.delete(`/api/food/${id}`);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const pag = data?.pagination;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">History</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Entries grouped by day</p>

      {loading && !data ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 px-4 py-3">{error}</div>
      ) : (
        <>
          <div className="space-y-8">
            {(data?.days || []).map((day) => (
              <section key={day.date} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-wrap justify-between gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">{day.date}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Day total: {Math.round(day.dayCalories)} kcal · {Math.round(day.dayProtein * 10) / 10}g protein
                  </span>
                </div>
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {day.entries.map((e) => (
                    <li key={e._id} className="px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-100">{e.foodName}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {e.calories} kcal · {e.protein}g protein
                          <span className="text-slate-400 dark:text-slate-500">
                            {" "}
                            · {(e.quantity ?? 1)}× {unitLabel(e.unit)}
                          </span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEntry(e._id)}
                        disabled={deleting === e._id}
                        className="text-sm text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                      >
                        {deleting === e._id ? "Deleting…" : "Delete"}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {!data?.days?.length && (
            <p className="text-center text-slate-500 dark:text-slate-400 py-12">No entries yet.</p>
          )}

          {pag && pag.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-10">
              <button
                type="button"
                disabled={!pag.hasPrev || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Page {pag.page} of {pag.totalPages}
              </span>
              <button
                type="button"
                disabled={!pag.hasNext || loading}
                onClick={() => setPage((p) => p + 1)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
