export type EoyPerformanceTier = "gold" | "silver" | "bronze";

// Tracker thresholds (base starting score is 100 in this build)
export const EOY_SCORE_THRESHOLDS = {
  GOLD_MIN: 160,
  SILVER_MIN: 100,
} as const;

export function getEoyPerformanceTier(totalScore: number): EoyPerformanceTier {
  if (totalScore >= EOY_SCORE_THRESHOLDS.GOLD_MIN) return "gold";
  if (totalScore >= EOY_SCORE_THRESHOLDS.SILVER_MIN) return "silver";
  return "bronze";
}

export function deriveEoyReportCopy(params: { totalScore: number }): {
  reportTitle: string;
  reportBody: string;
} {
  const { totalScore } = params;

  if (totalScore >= EOY_SCORE_THRESHOLDS.GOLD_MIN) {
    return {
      reportTitle: "Best year on record for Sunrise Cereals Co.",
      reportBody:
        "Thanks to your quick decision making and some help from AI, Sunrise Cereals Co. has had a record-breaking year. It's safe to say you impressed the board, your team and customers. Someone's getting a bonus.",
    };
  }

  if (totalScore >= EOY_SCORE_THRESHOLDS.SILVER_MIN) {
    return {
      reportTitle: "Sunrise Cereals Co successfully navigates turbulent year",
      reportBody:
        "It's been a roller coaster year. There were a few missed opportunities, but your innovation with AI ultimately paid off, and Sunrise Cereals Co. moves forward with steady operations. You've proved you can keep operations from going stale, staying crisp under pressure.",
    };
  }

  return {
    reportTitle: "Is Sunrise Cereals Co heading for disaster?",
    reportBody:
      "Do we lose more from wrong decisions or indecision? This year, you somehow managed both. A lack of AI innovation slowed growth and the business is starting to wobble. But there's always room to rebound, so feel free to take another run and see if you can leverage AI to steer Sunrise Cereals Co. to safer ground.",
  };
}
