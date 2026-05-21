import { buildBlindDefenseScenarios } from "../data/blindDefense";
import { buildCallVsPushScenarios } from "../data/callVsPush";
import { buildPushFoldScenarios } from "../data/pushFold";
import { buildOpenRaiseScenarios } from "../data/openRaise";
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
  id?: string | number;

  category: string;
  model: string;
  difficulty: string;
  players: number;
  position: string;
  stackBB: number;
  hand: string;
  actionBefore: string;

  actionBeforeType?:
    | "UNOPENED"
    | "FACING_OPEN"
    | "FACING_SHOVE"
    | "LIMPED_POT";

 rangePercent?: number;
  requiredPercent?: number;    

  options: string[];
  correctAction: string;
  explanation: string;
  raiseSizeBB?: string;
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