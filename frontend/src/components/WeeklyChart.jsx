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
const border = (dark) => (dark ? "rgba(100, 116, 139, 0.35)" : "rgba(148, 163, 184, 0.35)");

export default function WeeklyChart({ labels, calories, protein, loading, error }) {
  const { theme } = useTheme();
  const dark = theme === "dark";

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: text(dark),
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            pointStyle: "circle",
            padding: 16,
          },
        },
        title: {
          display: true,
          text: "Last 7 days",
          color: text(dark),
          font: { size: 14, weight: "600" },
          padding: { bottom: 12 },
        },
        tooltip: {
          backgroundColor: dark ? "rgba(15, 23, 42, 0.94)" : "rgba(255, 255, 255, 0.96)",
          titleColor: dark ? "#f8fafc" : "#0f172a",
          bodyColor: dark ? "#e2e8f0" : "#1e293b",
          borderColor: border(dark),
          borderWidth: 1,
          padding: 10,
          displayColors: true,
          callbacks: {
            label: (ctx) => {
              const value = Number(ctx.parsed.y ?? 0);
              if (ctx.dataset.label === "Protein (g)") return ` Protein: ${value} g`;
              return ` Calories: ${value} kcal`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: tick(dark),
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 7,
          },
          grid: { color: grid(dark) },
          border: { color: border(dark) },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: tick(dark),
            precision: 0,
            callback: (value) => `${value}`,
          },
          grid: { color: grid(dark) },
          border: { color: border(dark) },
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
        backgroundColor: "rgba(16, 185, 129, 0.12)",
        fill: true,
        tension: 0.38,
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHitRadius: 12,
      },
      {
        label: "Protein (g)",
        data: protein,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.38,
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHitRadius: 12,
      },
    ],
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-5 h-80">
      <Line data={data} options={options} />
    </div>
  );
}
