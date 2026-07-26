export const SCORE_STYLES = {
  strong: {
    ring: "text-emerald-500",
    label: "text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300",
    result: "border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20",
  },
  moderate: {
    ring: "text-amber-500",
    label: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300",
    result: "border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/20",
  },
  weak: {
    ring: "text-red-500",
    label: "text-red-600 dark:text-red-400",
    badge: "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300",
    result: "border-red-200 dark:border-red-800 bg-red-50/60 dark:bg-red-950/20",
  },
};

export function getScoreStyle(score: number) {
  if (score >= 70) return SCORE_STYLES.strong;
  if (score >= 50) return SCORE_STYLES.moderate;
  return SCORE_STYLES.weak;
}
