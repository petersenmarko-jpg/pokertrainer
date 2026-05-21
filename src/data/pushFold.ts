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

export function buildPushFoldScenarios(
  scenarios: Scenario[]
) {
  const spots = [
    {
      players: 9,
      position: "UTG",
      stackBB: 10,
      rangePercent: 12,
    },

    {
      players: 9,
      position: "MP",
      stackBB: 10,
      rangePercent: 18,
    },

    {
      players: 9,
      position: "HJ",
      stackBB: 10,
      rangePercent: 24,
    },

    {
      players: 9,
      position: "CO",
      stackBB: 10,
      rangePercent: 30,
    },

    {
      players: 9,
      position: "BTN",
      stackBB: 10,
      rangePercent: 48,
    },

    {
      players: 9,
      position: "SB",
      stackBB: 10,
      rangePercent: 72,
    },

    {
      players: 6,
      position: "UTG",
      stackBB: 10,
      rangePercent: 18,
    },

    {
      players: 6,
      position: "HJ",
      stackBB: 10,
      rangePercent: 28,
    },

    {
      players: 6,
      position: "CO",
      stackBB: 10,
      rangePercent: 38,
    },

    {
      players: 6,
      position: "BTN",
      stackBB: 10,
      rangePercent: 58,
    },

    {
      players: 6,
      position: "SB",
      stackBB: 10,
      rangePercent: 82,
    },

    {
      players: 9,
      position: "BTN",
      stackBB: 8,
      rangePercent: 58,
    },

    {
      players: 9,
      position: "SB",
      stackBB: 8,
      rangePercent: 92,
    },

    {
      players: 6,
      position: "BTN",
      stackBB: 8,
      rangePercent: 70,
    },

    {
      players: 6,
      position: "SB",
      stackBB: 8,
      rangePercent: 100,
    },
  ];

  for (const spot of spots) {
    for (const hand of handRanking) {
      const inRange =
        isHandInTopPercent(
          hand,
          spot.rangePercent
        );

      const correctAction =
        inRange
          ? "All-in"
          : "Fold";

      addScenario(scenarios, {
        model: "CHIP_EV",

        category: "PUSH_FOLD",

        difficulty:
          getDifficultyByRange(
            hand,
            spot.rangePercent
          ),

        players: spot.players,

        position: spot.position,

        stackBB: spot.stackBB,

        hand,

        actionBeforeType: "UNOPENED",

        actionBefore:
          "Action folds to you.",

        options: [
          "Fold",
          "All-in",
        ],

        correctAction,

        rangePercent:
          spot.rangePercent,

        explanation: inRange
          ? `${hand} is profitable as a shove from ${spot.position} with ${spot.stackBB} BB in Chip EV.`
          : `${hand} is too weak to shove profitably from ${spot.position} with ${spot.stackBB} BB in Chip EV.`,
      });
    }
  }
}