import { useMemo, useState } from "react";

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary (little/no exercise)", factor: 1.2 },
  { value: "light", label: "Lightly active (1-3 days/week)", factor: 1.375 },
  { value: "moderate", label: "Moderately active (3-5 days/week)", factor: 1.55 },
  { value: "very", label: "Very active (6-7 days/week)", factor: 1.725 },
  { value: "extra", label: "Extra active (physical job + training)", factor: 1.9 },
];

function round(n) {
  return Math.round(n);
}

function calcBmr({ gender, age, heightCm, weightKg }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "male" ? base + 5 : base - 161;
}

export default function Calculator() {
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState("25");
  const [heightCm, setHeightCm] = useState("170");
  const [weightKg, setWeightKg] = useState("70");
  const [activity, setActivity] = useState("moderate");

  const result = useMemo(() => {
    const ageNum = Number(age);
    const hNum = Number(heightCm);
    const wNum = Number(weightKg);
    const activityObj = ACTIVITY_LEVELS.find((a) => a.value === activity);

    if (
      !activityObj ||
      !Number.isFinite(ageNum) ||
      !Number.isFinite(hNum) ||
      !Number.isFinite(wNum) ||
      ageNum <= 0 ||
      hNum <= 0 ||
      wNum <= 0
    ) {
      return null;
    }

    const bmr = calcBmr({ gender, age: ageNum, heightCm: hNum, weightKg: wNum });
    const maintenance = bmr * activityObj.factor;
    const lose = Math.max(1200, maintenance - 400);
    const gain = maintenance + 300;

    return {
      bmr: round(bmr),
      maintenance: round(maintenance),
      lose: round(lose),
      gain: round(gain),
      protein: {
        maintain: `${round(wNum * 1.4)} g`,
        lose: `${round(wNum * 1.8)}-${round(wNum * 2.2)} g`,
        gain: `${round(wNum * 1.6)}-${round(wNum * 2.0)} g`,
      },
    };
  }, [gender, age, heightCm, weightKg, activity]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Calories & Protein Calculator</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
        Enter your details to estimate daily calories and protein for weight loss, maintenance, and gain.
      </p>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Age</label>
            <input
              type="number"
              min={1}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Height (cm)</label>
            <input
              type="number"
              min={1}
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Weight (kg)</label>
            <input
              type="number"
              min={1}
              step={0.1}
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Activity</label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2"
            >
              {ACTIVITY_LEVELS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {result && (
        <>
          <div className="mb-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Estimated BMR: <span className="font-semibold">{result.bmr} kcal/day</span>
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Estimated maintenance (TDEE): <span className="font-semibold">{result.maintenance} kcal/day</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/70 dark:bg-red-950/20 p-4">
              <h2 className="font-semibold text-red-700 dark:text-red-300 mb-2">Weight Loss</h2>
              <p className="text-sm text-slate-700 dark:text-slate-200">Calories: {result.lose} kcal/day</p>
              <p className="text-sm text-slate-700 dark:text-slate-200">Protein: {result.protein.lose}</p>
            </div>

            <div className="rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/70 dark:bg-blue-950/20 p-4">
              <h2 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Maintain</h2>
              <p className="text-sm text-slate-700 dark:text-slate-200">Calories: {result.maintenance} kcal/day</p>
              <p className="text-sm text-slate-700 dark:text-slate-200">Protein: {result.protein.maintain}</p>
            </div>

            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/70 dark:bg-emerald-950/20 p-4">
              <h2 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Weight Gain</h2>
              <p className="text-sm text-slate-700 dark:text-slate-200">Calories: {result.gain} kcal/day</p>
              <p className="text-sm text-slate-700 dark:text-slate-200">Protein: {result.protein.gain}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
