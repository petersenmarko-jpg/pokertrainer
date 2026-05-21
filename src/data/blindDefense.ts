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

export function buildBlindDefenseScenarios(
  scenarios: Scenario[]
) {
  const spots = [
    {
      villainPosition: "UTG",
      players: 9,
      stackBB: 30,
      openSizeBB: 2.2,
      defendPercent: 18,
      raisePercent: 5,
    },

    {
      villainPosition: "MP",
      players: 9,
      stackBB: 30,
      openSizeBB: 2.2,
      defendPercent: 24,
      raisePercent: 6,
    },

    {
      villainPosition: "HJ",
      players: 9,
      stackBB: 30,
      openSizeBB: 2.2,
      defendPercent: 28,
      raisePercent: 7,
    },

    {
      villainPosition: "CO",
      players: 9,
      stackBB: 30,
      openSizeBB: 2.2,
      defendPercent: 36,
      raisePercent: 9,
    },

    {
      villainPosition: "BTN",
      players: 9,
      stackBB: 30,
      openSizeBB: 2.2,
      defendPercent: 50,
      raisePercent: 12,
    },

    {
      villainPosition: "SB",
      players: 9,
      stackBB: 30,
      openSizeBB: 2.5,
      defendPercent: 62,
      raisePercent: 15,
    },

    {
      villainPosition: "CO",
      players: 6,
      stackBB: 30,
      openSizeBB: 2.2,
      defendPercent: 40,
      raisePercent: 10,
    },

    {
      villainPosition: "BTN",
      players: 6,
      stackBB: 30,
      openSizeBB: 2.2,
      defendPercent: 56,
      raisePercent: 13,
    },

    {
      villainPosition: "SB",
      players: 6,
      stackBB: 30,
      openSizeBB: 2.5,
      defendPercent: 68,
      raisePercent: 16,
    },
  ];

  for (const spot of spots) {
    for (const hand of handRanking) {
      const inRaiseRange =
        isHandInTopPercent(
          hand,
          spot.raisePercent
        );

      const inDefendRange =
        isHandInTopPercent(
          hand,
          spot.defendPercent
        );

      const correctAction =
        inRaiseRange
          ? "Raise"
          : inDefendRange
          ? "Call"
          : "Fold";

      const borderPercent =
        correctAction === "Raise"
          ? spot.raisePercent
          : spot.defendPercent;

      addScenario(scenarios, {
        model: "MTT_STANDARD",

        category: "BLIND_DEFENSE",

        difficulty:
          getDifficultyByRange(
            hand,
            borderPercent
          ),

        players: spot.players,

        position: "BB",

        stackBB: spot.stackBB,

        hand,

        actionBeforeType:
          "FACING_OPEN",

        actionBefore: `${spot.villainPosition} opens to ${spot.openSizeBB} BB. Everyone else folds. You are in the BB.`,

        options: [
          "Fold",
          "Call",
          "Raise",
        ],

        correctAction,

        raiseSizeBB:
          correctAction === "Raise"
            ? `${Math.round(
                spot.openSizeBB *
                  3.2 *
                  10
              ) / 10} BB`
            : undefined,

        rangePercent:
          correctAction === "Raise"
            ? spot.raisePercent
            : spot.defendPercent,

        explanation:
          correctAction === "Raise"
            ? `${hand} belongs to the recommended top ${spot.raisePercent}% 3-bet range against a ${spot.villainPosition} open.`
            : correctAction === "Call"
            ? `${hand} is outside the 3-bet range but inside the recommended top ${spot.defendPercent}% Big Blind defense range against a ${spot.villainPosition} open.`
            : `${hand} is outside the recommended top ${spot.defendPercent}% Big Blind defense range against a ${spot.villainPosition} open.`,
      });
    }
  }
}