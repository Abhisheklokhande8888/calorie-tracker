import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTheme } from "../context/ThemeContext.jsx";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const grid = (dark) => (dark ? "rgba(51, 65, 85, 0.6)" : "rgba(226, 232, 240, 0.9)");
const tick = (dark) => (dark ? "#94a3b8" : "#64748b");
const text = (dark) => (dark ? "#e2e8f0" : "#334155");

export default function WeeklyChart({ labels, calories, protein, loading, error }) {
  const { theme } = useTheme();
  const dark = theme === "dark";

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: { color: text(dark) },
        },
        title: {
          display: true,
          text: "Last 7 days",
          color: text(dark),
        },
      },
      scales: {
        x: {
          ticks: { color: tick(dark) },
          grid: { color: grid(dark) },
        },
        y: {
          beginAtZero: true,
          ticks: { color: tick(dark) },
          grid: { color: grid(dark) },
        },
      },
    }),
    [dark]
  );

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-sm px-4 text-center">
        {error}
      </div>
    );
  }

  const data = {
    labels,
    datasets: [
      {
        label: "Calories",
        data: calories,
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.35,
      },
      {
        label: "Protein (g)",
        data: protein,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.05)",
        fill: true,
        tension: 0.35,
      },
    ],
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 h-72">
      <Line data={data} options={options} />
    </div>
  );
}
