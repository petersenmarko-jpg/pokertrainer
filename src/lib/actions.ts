import type { Scenario } from "../types/scenario";

export type PokerAction =
  | "Fold"
  | "Limp"
  | "Check"
  | "Call"
  | "Raise"
  | "All-in";

export function getAvailableActions(scenario: Scenario): PokerAction[] {
  switch (scenario.category) {
    case "OPEN_RAISE":
      return ["Fold", "Limp", "Raise"];

    case "PUSH_FOLD":
      return ["Fold", "All-in"];

    case "CALL_VS_PUSH":
      return ["Fold", "Call"];

    case "BLIND_DEFENSE":
      return ["Fold", "Call", "Raise"];

    default:
      return ["Fold", "Call", "Raise"];
  }
}