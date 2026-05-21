import {
  handRanking,
  isHandInTopPercent,
} from "../lib/handRanking";

import type {
  Scenario,
  ScenarioDifficulty,
} from "../types/scenario";

function getRaiseSize(stackBB: number): string {
  if (stackBB <= 16) return "2.0 BB";
  if (stackBB <= 24) return "2.2 BB";
  if (stackBB <= 40) return "2.3 BB";

  return "2.5 BB";
}

function getDifficultyByRange(
  hand: string,
  rangePercent: number
): ScenarioDifficulty {
  const index = handRanking.indexOf(hand);

  if (index === -1) {
    return "hard";
  }

  const handPercent =
    ((index + 1) / handRanking.length) * 100;

  const distance = Math.abs(handPercent - rangePercent);

  if (distance <= 3) return "hard";
  if (distance <= 8) return "medium";

  return "easy";
}

function addScenario(
  scenarios: Scenario[],
  data: Omit<Scenario, "id">
) {
  scenarios.push({
    id: scenarios.length + 1,
    ...data,
  });
}

export function buildOpenRaiseScenarios(
  scenarios: Scenario[]
) {
  const spots = [
    { players: 9, position: "UTG", stackBB: 25, rangePercent: 14 },
    { players: 9, position: "MP", stackBB: 25, rangePercent: 18 },
    { players: 9, position: "HJ", stackBB: 25, rangePercent: 22 },
    { players: 9, position: "CO", stackBB: 25, rangePercent: 30 },
    { players: 9, position: "BTN", stackBB: 25, rangePercent: 45 },
    { players: 9, position: "SB", stackBB: 25, rangePercent: 38 },

    { players: 6, position: "UTG", stackBB: 30, rangePercent: 20 },
    { players: 6, position: "HJ", stackBB: 30, rangePercent: 24 },
    { players: 6, position: "CO", stackBB: 30, rangePercent: 32 },
    { players: 6, position: "BTN", stackBB: 30, rangePercent: 48 },
    { players: 6, position: "SB", stackBB: 30, rangePercent: 42 },

    { players: 6, position: "BTN", stackBB: 15, rangePercent: 42 },
    { players: 6, position: "CO", stackBB: 15, rangePercent: 28 },
    { players: 9, position: "BTN", stackBB: 15, rangePercent: 40 },
    { players: 9, position: "CO", stackBB: 15, rangePercent: 26 },
  ];

  for (const spot of spots) {
    for (const hand of handRanking) {
      const inRange = isHandInTopPercent(hand, spot.rangePercent);
      const correctAction = inRange ? "Raise" : "Fold";

      addScenario(scenarios, {
        model: "MTT_STANDARD",
        category: "OPEN_RAISE",
        difficulty: getDifficultyByRange(hand, spot.rangePercent),

        players: spot.players,
        position: spot.position,
        stackBB: spot.stackBB,
        hand,

        actionBeforeType: "UNOPENED",
        actionBefore:
          spot.position === "UTG"
            ? "You are first to act."
            : "Action folds to you.",

        options: ["Fold", "Raise"],
        correctAction,

        raiseSizeBB: inRange ? getRaiseSize(spot.stackBB) : undefined,
        rangePercent: spot.rangePercent,

        explanation: inRange
          ? `${hand} is inside the recommended top ${spot.rangePercent}% opening range from ${spot.position} with ${spot.stackBB} BB.`
          : `${hand} is outside the recommended top ${spot.rangePercent}% opening range from ${spot.position} with ${spot.stackBB} BB.`,
      });
    }
  }
}