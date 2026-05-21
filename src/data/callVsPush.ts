import {
  handRanking,
  isHandInTopPercent,
} from "../lib/handRanking";

import type {
  Scenario,
  ScenarioDifficulty,
} from "../types/scenario";

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

export function buildCallVsPushScenarios(
  scenarios: Scenario[]
) {
  const spots = [
    {
      villainPosition: "BTN",
      players: 9,
      stackBB: 10,
      rangePercent: 38,
    },

    {
      villainPosition: "CO",
      players: 9,
      stackBB: 10,
      rangePercent: 28,
    },

    {
      villainPosition: "HJ",
      players: 9,
      stackBB: 10,
      rangePercent: 22,
    },

    {
      villainPosition: "MP",
      players: 9,
      stackBB: 10,
      rangePercent: 18,
    },

    {
      villainPosition: "SB",
      players: 9,
      stackBB: 10,
      rangePercent: 62,
    },

    {
      villainPosition: "BTN",
      players: 6,
      stackBB: 10,
      rangePercent: 48,
    },

    {
      villainPosition: "CO",
      players: 6,
      stackBB: 10,
      rangePercent: 34,
    },

    {
      villainPosition: "HJ",
      players: 6,
      stackBB: 10,
      rangePercent: 28,
    },

    {
      villainPosition: "SB",
      players: 6,
      stackBB: 10,
      rangePercent: 72,
    },
  ];

  for (const spot of spots) {
    const callPercent =
      Math.max(
        6,
        spot.rangePercent * 0.42
      );

    for (const hand of handRanking) {
      const canCall =
        isHandInTopPercent(
          hand,
          callPercent
        );

      const correctAction =
        canCall
          ? "Call"
          : "Fold";

      addScenario(scenarios, {
        model: "CHIP_EV",

        category: "CALL_VS_PUSH",

        difficulty:
          getDifficultyByRange(
            hand,
            callPercent
          ),

        players: spot.players,

        position: "BB",

        stackBB: spot.stackBB,

        hand,

        actionBeforeType:
          "FACING_SHOVE",

        actionBefore: `${spot.villainPosition} pushes all-in. You are in the BB.`,

        options: [
          "Fold",
          "Call",
        ],

        correctAction,

        rangePercent:
          callPercent,

        explanation: canCall
          ? `${hand} performs well enough against a ${spot.villainPosition} shove range to call profitably.`
          : `${hand} does not perform well enough against a ${spot.villainPosition} shove range to call profitably.`,
      });
    }
  }
}