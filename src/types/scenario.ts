import {
  handRanking,
  isHandInTopPercent,
} from "../lib/handRanking";

export type ScenarioModel =
  | "MTT_STANDARD"
  | "CHIP_EV"
  | "ICM"
  | "GTO";

export type ScenarioCategory =
  | "OPEN_RAISE"
  | "PUSH_FOLD"
  | "CALL_VS_PUSH"
  | "BLIND_DEFENSE";

export type ScenarioDifficulty =
  | "easy"
  | "medium"
  | "hard";

export type Scenario = {
  id: number;
  model: ScenarioModel;
  category: ScenarioCategory;
  difficulty: ScenarioDifficulty;
  players: number;
  position: string;
  stackBB: number;
  hand: string;
  actionBefore: string;
  options: string[];
  correctAction: string;
  raiseSizeBB?: string;
  rangePercent?: number;
  explanation: string;
};

const TARGET_SCENARIO_COUNT = 1000;

function getRaiseSize(
  stackBB: number
): string {
  if (stackBB <= 16) return "2.0 BB";
  if (stackBB <= 24) return "2.2 BB";
  if (stackBB <= 40) return "2.3 BB";

  return "2.5 BB";
}

function getDifficultyByRange(
  hand: string,
  rangePercent: number
): ScenarioDifficulty {
  const index =
    handRanking.indexOf(hand);

  if (index === -1) {
    return "hard";
  }

  const handPercent =
    ((index + 1) /
      handRanking.length) *
    100;

  const distance = Math.abs(
    handPercent - rangePercent
  );

  if (distance <= 3) {
    return "hard";
  }

  if (distance <= 8) {
    return "medium";
  }

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

function buildOpenRaiseScenarios(
  scenarios: Scenario[]
) {
  const spots = [
    {
      players: 9,
      position: "UTG",
      stackBB: 25,
      rangePercent: 14,
    },

    {
      players: 9,
      position: "MP",
      stackBB: 25,
      rangePercent: 18,
    },

    {
      players: 9,
      position: "HJ",
      stackBB: 25,
      rangePercent: 22,
    },

    {
      players: 9,
      position: "CO",
      stackBB: 25,
      rangePercent: 30,
    },

    {
      players: 9,
      position: "BTN",
      stackBB: 25,
      rangePercent: 45,
    },

    {
      players: 9,
      position: "SB",
      stackBB: 25,
      rangePercent: 38,
    },

    {
      players: 6,
      position: "UTG",
      stackBB: 30,
      rangePercent: 20,
    },

    {
      players: 6,
      position: "HJ",
      stackBB: 30,
      rangePercent: 24,
    },

    {
      players: 6,
      position: "CO",
      stackBB: 30,
      rangePercent: 32,
    },

    {
      players: 6,
      position: "BTN",
      stackBB: 30,
      rangePercent: 48,
    },

    {
      players: 6,
      position: "SB",
      stackBB: 30,
      rangePercent: 42,
    },

    {
      players: 6,
      position: "BTN",
      stackBB: 15,
      rangePercent: 42,
    },

    {
      players: 6,
      position: "CO",
      stackBB: 15,
      rangePercent: 28,
    },

    {
      players: 9,
      position: "BTN",
      stackBB: 15,
      rangePercent: 40,
    },

    {
      players: 9,
      position: "CO",
      stackBB: 15,
      rangePercent: 26,
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
          ? "Raise"
          : "Fold";

      addScenario(scenarios, {
        model: "MTT_STANDARD",

        category: "OPEN_RAISE",

        difficulty:
          getDifficultyByRange(
            hand,
            spot.rangePercent
          ),

        players: spot.players,

        position: spot.position,

        stackBB: spot.stackBB,

        hand,

        actionBefore:
          spot.position === "UTG"
            ? "You are first to act."
            : "Action folds to you.",

        options: [
          "Fold",
          "Raise",
        ],

        correctAction,

        raiseSizeBB: inRange
          ? getRaiseSize(
              spot.stackBB
            )
          : undefined,

        rangePercent:
          spot.rangePercent,

        explanation: inRange
          ? `${hand} is inside the recommended top ${spot.rangePercent}% opening range from ${spot.position} with ${spot.stackBB} BB.`
          : `${hand} is outside the recommended top ${spot.rangePercent}% opening range from ${spot.position} with ${spot.stackBB} BB.`,
      });
    }
  }
}

function buildPushFoldScenarios(
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

function buildCallVsPushScenarios(
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
function buildBlindDefenseScenarios(
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

function buildScenarios(): Scenario[] {
  const scenarios: Scenario[] = [];

  buildOpenRaiseScenarios(scenarios);
  buildPushFoldScenarios(scenarios);
  buildCallVsPushScenarios(scenarios);
  buildBlindDefenseScenarios(scenarios);

  return scenarios.slice(
    0,
    TARGET_SCENARIO_COUNT
  );
}

export const scenarios: Scenario[] =
  buildScenarios();