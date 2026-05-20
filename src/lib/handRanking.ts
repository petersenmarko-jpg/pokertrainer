const handRanking = [
  "AA",
  "KK",
  "QQ",
  "AKs",
  "JJ",
  "AKo",
  "AQs",
  "KQs",
  "TT",
  "AQo",
  "AJs",
  "KJs",
  "QJs",
  "99",
  "ATs",
  "KTs",
  "QTs",
  "JTs",
  "AJo",
  "KQo",
  "88",
  "A9s",
  "K9s",
  "Q9s",
  "J9s",
  "T9s",
  "77",
  "ATo",
  "KJo",
  "A8s",
  "A7s",
  "K8s",
  "Q8s",
  "J8s",
  "T8s",
  "98s",
  "66",
  "A5s",
  "A6s",
  "KTo",
  "QJo",
  "87s",
  "97s",
  "T7s",
  "J7s",
  "Q7s",
  "K7s",
  "55",
  "A4s",
  "A3s",
  "A2s",
  "A9o",
  "K6s",
  "Q6s",
  "J6s",
  "T6s",
  "96s",
  "86s",
  "76s",
  "44",
  "A8o",
  "K9o",
  "QTo",
  "JTo",
  "75s",
  "85s",
  "95s",
  "T5s",
  "J5s",
  "Q5s",
  "K5s",
  "65s",
  "33",
  "A7o",
  "A6o",
  "K8o",
  "Q9o",
  "J9o",
  "T9o",
  "54s",
  "64s",
  "74s",
  "84s",
  "94s",
  "T4s",
  "J4s",
  "Q4s",
  "K4s",
  "22",
  "A5o",
  "A4o",
  "K7o",
  "Q8o",
  "J8o",
  "T8o",
  "98o",
  "43s",
  "53s",
  "63s",
  "73s",
  "83s",
  "93s",
  "T3s",
  "J3s",
  "Q3s",
  "K3s",
  "A3o",
  "A2o",
  "K6o",
  "Q7o",
  "J7o",
  "T7o",
  "97o",
  "87o",
  "32s",
  "42s",
  "52s",
  "62s",
  "72s",
  "82s",
  "92s",
  "T2s",
  "J2s",
  "Q2s",
  "K2s",
  "K5o",
  "Q6o",
  "J6o",
  "T6o",
  "96o",
  "86o",
  "76o",
  "K4o",
  "Q5o",
  "J5o",
  "T5o",
  "95o",
  "85o",
  "75o",
  "65o",
  "K3o",
  "Q4o",
  "J4o",
  "T4o",
  "94o",
  "84o",
  "74o",
  "64o",
  "54o",
  "K2o",
  "Q3o",
  "J3o",
  "T3o",
  "93o",
  "83o",
  "73o",
  "63o",
  "53o",
  "43o",
  "Q2o",
  "J2o",
  "T2o",
  "92o",
  "82o",
  "72o",
  "62o",
  "52o",
  "42o",
  "32o",
];

export function getHandRank(hand: string): number {
  const index = handRanking.indexOf(hand);

  if (index === -1) {
    return 999;
  }

  return index + 1;
}

export function getHandPercent(hand: string): number {
  const rank = getHandRank(hand);

  if (rank === 999) {
    return 100;
  }

  return Math.round((rank / handRanking.length) * 100);
}

export function isHandInTopPercent(
  hand: string,
  percent: number
): boolean {
  const rank = getHandRank(hand);

  const maxHands = Math.ceil(
    (handRanking.length * percent) / 100
  );

  return rank <= maxHands;
}

export function getTopPercentHands(percent: number): string[] {
  const maxHands = Math.ceil(
    (handRanking.length * percent) / 100
  );

  return handRanking.slice(0, maxHands);
}

export { handRanking };