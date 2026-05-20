export type ScenarioModel = "MTT_STANDARD" | "CHIP_EV" | "ICM" | "GTO";

export type ScenarioCategory =
  | "OPEN_RAISE"
  | "PUSH_FOLD"
  | "CALL_VS_PUSH"
  | "BLIND_DEFENSE";

export type ScenarioDifficulty = "easy" | "medium" | "hard";

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
  explanation: string;
};

const TARGET_SCENARIO_COUNT = 1000;

const ranks = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];

const rankValue: Record<string, number> = {
  A: 14,
  K: 13,
  Q: 12,
  J: 11,
  T: 10,
  "9": 9,
  "8": 8,
  "7": 7,
  "6": 6,
  "5": 5,
  "4": 4,
  "3": 3,
  "2": 2,
};

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function buildHands(): string[] {
  const hands: string[] = [];

  for (const r of ranks) {
    hands.push(`${r}${r}`);
  }

  const highCards = ["A", "K", "Q", "J", "T"];

  for (const high of highCards) {
    const start = ranks.indexOf(high);

    for (let i = start + 1; i < ranks.length; i++) {
      const low = ranks[i];

      hands.push(`${high}${low}s`);
      hands.push(`${high}${low}o`);
    }
  }

  for (let i = 0; i < ranks.length - 1; i++) {
    hands.push(`${ranks[i]}${ranks[i + 1]}s`);
  }

  for (let i = 0; i < ranks.length - 2; i++) {
    hands.push(`${ranks[i]}${ranks[i + 2]}s`);
  }

  for (let i = 0; i < ranks.length - 3; i++) {
    hands.push(`${ranks[i]}${ranks[i + 3]}s`);
  }

  return unique(hands);
}

function getHandScore(hand: string): number {
  const first = hand[0];
  const second = hand[1];
  const suited = hand.endsWith("s");
  const pair = first === second;

  const high = Math.max(rankValue[first], rankValue[second]);
  const low = Math.min(rankValue[first], rankValue[second]);

  let score = high + low * 0.55;

  if (pair) score += 8;
  if (suited) score += 2;

  const gap = Math.abs(rankValue[first] - rankValue[second]);

  if (!pair && gap === 1) score += 2;
  if (!pair && gap === 2) score += 1;
  if (!pair && gap === 3) score += 0.4;
  if (!pair && gap >= 5) score -= 2;

  return score;
}

function difficultyFromScore(score: number): ScenarioDifficulty {
  if (score >= 21) return "easy";
  if (score >= 17) return "medium";
  return "hard";
}

function getRaiseSize(stackBB: number): string {
  if (stackBB <= 16) return "2.0 BB";
  if (stackBB <= 24) return "2.2 BB";
  if (stackBB <= 40) return "2.3 BB";
  return "2.5 BB";
}

function openRaiseDecision(hand: string, position: string, stackBB: number): string {
  const score = getHandScore(hand);

  const thresholdByPosition: Record<string, number> = {
    UTG: 21,
    HJ: 19.5,
    MP: 18.8,
    CO: 16.5,
    BTN: 14.3,
    SB: 16.8,
  };

  const threshold = thresholdByPosition[position] ?? 18;

  if (stackBB <= 10 && score >= threshold + 0.8) return "All-in";
  if (score >= threshold) return "Raise";

  return "Fold";
}

function pushFoldDecision(hand: string, position: string, stackBB: number): string {
  const score = getHandScore(hand);

  const baseByPosition: Record<string, number> = {
    HJ: 19,
    CO: 17.8,
    BTN: 15.8,
    SB: 14.2,
  };

  const base = baseByPosition[position] ?? 17;

  const stackAdjustment =
    stackBB <= 5 ? -2.2 :
    stackBB <= 8 ? -1.4 :
    stackBB <= 11 ? -0.4 :
    stackBB >= 15 ? 1.7 :
    0.7;

  return score >= base + stackAdjustment ? "All-in" : "Fold";
}

function callVsPushDecision(
  hand: string,
  villainPosition: string,
  stackBB: number
): string {
  const score = getHandScore(hand);

  const thresholdByVillain: Record<string, number> = {
    SB: 15.5,
    BTN: 17.5,
    CO: 19,
    HJ: 20.5,
    MP: 21.2,
    UTG: 22,
  };

  const stackAdjustment =
    stackBB <= 7 ? -1.2 :
    stackBB <= 10 ? -0.5 :
    stackBB >= 15 ? 1.2 :
    0;

  const threshold = (thresholdByVillain[villainPosition] ?? 19) + stackAdjustment;

  return score >= threshold ? "Call" : "Fold";
}

function blindDefenseDecision(
  hand: string,
  villainPosition: string,
  openSizeBB: number
): string {
  const score = getHandScore(hand);

  const pressureByPosition: Record<string, number> = {
    UTG: 2.2,
    MP: 1.6,
    HJ: 1.1,
    CO: 0.4,
    BTN: -0.6,
    SB: -1.1,
  };

  const sizePressure = openSizeBB >= 3 ? 1.3 : openSizeBB >= 2.5 ? 0.6 : 0;
  const pressure = (pressureByPosition[villainPosition] ?? 0) + sizePressure;

  if (score >= 22.5 + pressure) return "Raise";
  if (score >= 15.2 + pressure) return "Call";

  return "Fold";
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

function buildScenarios(): Scenario[] {
  const hands = buildHands();
  const scenarios: Scenario[] = [];

  const playerCounts = [6, 9];

  const openPositions = ["UTG", "HJ", "MP", "CO", "BTN", "SB"];
  const openStacks = [10, 12, 15, 18, 22, 25, 30, 40, 50];

  for (const hand of hands) {
    for (const position of openPositions) {
      for (const stackBB of openStacks) {
        const correctAction = openRaiseDecision(hand, position, stackBB);
        const score = getHandScore(hand);

        addScenario(scenarios, {
          model: "MTT_STANDARD",
          category: "OPEN_RAISE",
          difficulty: difficultyFromScore(score),
          players: playerCounts[scenarios.length % playerCounts.length],
          position,
          stackBB,
          hand,
          actionBefore:
            position === "UTG"
              ? "You are first to act."
              : "Action folds to you.",
          options: ["Fold", "Raise", "All-in"],
          correctAction,
          raiseSizeBB:
            correctAction === "Raise" ? getRaiseSize(stackBB) : undefined,
          explanation:
            correctAction === "Raise"
              ? `${hand} is strong enough to open-raise from ${position} with ${stackBB} BB.`
              : correctAction === "All-in"
              ? `${hand} works well as a direct jam with ${stackBB} BB because you generate fold equity and have limited postflop maneuverability.`
              : `${hand} is too weak to open profitably from ${position} with ${stackBB} BB.`,
        });
      }
    }
  }

  const pushPositions = ["HJ", "CO", "BTN", "SB"];
  const pushStacks = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  for (const hand of hands) {
    for (const position of pushPositions) {
      for (const stackBB of pushStacks) {
        const correctAction = pushFoldDecision(hand, position, stackBB);
        const score = getHandScore(hand);

        addScenario(scenarios, {
          model: "CHIP_EV",
          category: "PUSH_FOLD",
          difficulty: difficultyFromScore(score),
          players: playerCounts[scenarios.length % playerCounts.length],
          position,
          stackBB,
          hand,
          actionBefore: "Action folds to you.",
          options: ["Fold", "All-in"],
          correctAction,
          explanation:
            correctAction === "All-in"
              ? `${hand} is a profitable jam from ${position} with ${stackBB} BB.`
              : `${hand} is too weak for a standard jam from ${position} with ${stackBB} BB.`,
        });
      }
    }
  }

  const villainPushPositions = ["UTG", "MP", "HJ", "CO", "BTN", "SB"];
  const callStacks = [5, 6, 8, 10, 12, 14, 16, 18];

  for (const hand of hands) {
    for (const villainPosition of villainPushPositions) {
      for (const stackBB of callStacks) {
        const correctAction = callVsPushDecision(
          hand,
          villainPosition,
          stackBB
        );
        const score = getHandScore(hand);

        addScenario(scenarios, {
          model: "CHIP_EV",
          category: "CALL_VS_PUSH",
          difficulty: difficultyFromScore(score),
          players: playerCounts[scenarios.length % playerCounts.length],
          position: "BB",
          stackBB,
          hand,
          actionBefore: `${villainPosition} jams all-in. You are in the BB.`,
          options: ["Fold", "Call"],
          correctAction,
          explanation:
            correctAction === "Call"
              ? `${hand} has enough equity to call against a typical ${villainPosition} shoving range.`
              : `${hand} does not have enough equity to call against a typical ${villainPosition} shoving range.`,
        });
      }
    }
  }

  const defenseVillains = ["UTG", "MP", "HJ", "CO", "BTN", "SB"];
  const defenseStacks = [18, 22, 25, 30, 35, 40, 50];
  const openSizes = [2.0, 2.2, 2.5, 3.0];

  for (const hand of hands) {
    for (const villainPosition of defenseVillains) {
      for (const stackBB of defenseStacks) {
        for (const openSizeBB of openSizes) {
          const correctAction = blindDefenseDecision(
            hand,
            villainPosition,
            openSizeBB
          );
          const score = getHandScore(hand);

          addScenario(scenarios, {
            model: "MTT_STANDARD",
            category: "BLIND_DEFENSE",
            difficulty: difficultyFromScore(score),
            players: playerCounts[scenarios.length % playerCounts.length],
            position: "BB",
            stackBB,
            hand,
            actionBefore: `${villainPosition} opens to ${openSizeBB.toFixed(
              1
            )} BB. Everyone else folds. You are in the BB.`,
            options: ["Fold", "Call", "Raise"],
            correctAction,
            raiseSizeBB:
              correctAction === "Raise"
                ? `${Math.round(openSizeBB * 3.2 * 10) / 10} BB`
                : undefined,
            explanation:
              correctAction === "Raise"
                ? `${hand} is strong enough to 3-bet against the ${villainPosition} open.`
                : correctAction === "Call"
                ? `${hand} is strong enough to defend the Big Blind against the ${villainPosition} open.`
                : `${hand} is too weak to defend against the ${villainPosition} open.`,
          });
        }
      }
    }
  }

  return scenarios.slice(0, TARGET_SCENARIO_COUNT);
}

export const scenarios: Scenario[] = buildScenarios();