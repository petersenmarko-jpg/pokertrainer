export const OPEN_RAISE_RANGES: Record<string, number> = {
  UTG: 14,
  HJ: 20,
  CO: 30,
  BTN: 48,
  SB: 55,
};

export const PUSH_FOLD_RANGES: Record<string, Record<number, number>> = {
  BTN: {
    10: 45,
    15: 32,
    20: 24,
  },

  SB: {
    10: 60,
    15: 48,
    20: 35,
  },
};

export const CALL_VS_PUSH_RANGES: Record<string, Record<number, number>> = {
  BB: {
    10: 28,
    15: 22,
  },
};

export const BLIND_DEFENSE_RANGES: Record<string, number> = {
  BB: 42,
  SB: 30,
};

export function getRequiredPercent(
  category: string,
  position: string,
  stackBB: number
): number {
  switch (category) {
    case "OPEN_RAISE":
      return OPEN_RAISE_RANGES[position] ?? 20;

    case "PUSH_FOLD": {
      const ranges = PUSH_FOLD_RANGES[position];

      if (!ranges) return 20;

      return ranges[stackBB] ?? 20;
    }

    case "CALL_VS_PUSH": {
      const ranges = CALL_VS_PUSH_RANGES[position];

      if (!ranges) return 15;

      return ranges[stackBB] ?? 15;
    }

    case "BLIND_DEFENSE":
      return BLIND_DEFENSE_RANGES[position] ?? 25;

    default:
      return 20;
  }
}