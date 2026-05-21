import { useMemo, useState } from "react";

import { Scenario, scenarios } from "./types/scenario";

import { getHandPercent } from "./lib/handRanking";

import { getRequiredPercent } from "./lib/ranges";

import CardBox from "./components/CardBox";

import { getAvailableActions } from "./lib/actions";

const categories = [
  "ALL",
  "OPEN_RAISE",
  "PUSH_FOLD",
  "CALL_VS_PUSH",
  "BLIND_DEFENSE",
];

type RangeScenario = Scenario & {
  requiredPercent?: number;
  rangePercent?: number;
};

function getScenarioRangePercent(scenario: Scenario): number | null {
  const rangeScenario = scenario as RangeScenario;

  if (typeof rangeScenario.requiredPercent === "number") {
    return rangeScenario.requiredPercent;
  }

  if (typeof rangeScenario.rangePercent === "number") {
    return rangeScenario.rangePercent;
  }

  return null;
}

function getInRangeAction(scenario: Scenario): string {
  switch (scenario.category) {
    case "OPEN_RAISE":
      return "Raise";
    case "PUSH_FOLD":
      return "All-in";
    case "CALL_VS_PUSH":
      return "Call";
    case "BLIND_DEFENSE":
      return "Call";
    default:
      return scenario.correctAction;
  }
}

function getEffectiveCorrectAction(scenario: Scenario): string {
  const requiredPercent =
  getScenarioRangePercent(scenario) ??
  getRequiredPercent(
  scenario.category,
  scenario.position,
  scenario.stackBB,
  scenario.players
);

  if (requiredPercent === null) {
    return scenario.correctAction;
  }

  const handPercent = getHandPercent(scenario.hand);
  const handIsInRange = handPercent <= requiredPercent;

  return handIsInRange ? getInRangeAction(scenario) : "Fold";
}

function getRandomScenario(filteredScenarios: Scenario[]): Scenario {
  if (filteredScenarios.length === 0) {
    return scenarios[0];
  }

  return filteredScenarios[
    Math.floor(Math.random() * filteredScenarios.length)
  ];
}

function parseHand(hand: string) {
  const ranks = hand.slice(0, 2).split("");
  const suited = hand.includes("s");
  const pair = ranks[0] === ranks[1];

  const allSuits = ["♠", "♥", "♦", "♣"];
  const blackSuits = ["♠", "♣"];
  const redSuits = ["♥", "♦"];

  function randomItem(arr: string[]) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  if (pair) {
    return [
      { value: ranks[0], suit: randomItem(blackSuits) },
      { value: ranks[1], suit: randomItem(redSuits) },
    ];
  }

  if (suited) {
    const suit = randomItem(allSuits);

    return [
      { value: ranks[0], suit },
      { value: ranks[1], suit },
    ];
  }

  let suit1 = randomItem(allSuits);
  let suit2 = randomItem(allSuits);

  while (suit1 === suit2) {
    suit2 = randomItem(allSuits);
  }

  return [
    { value: ranks[0], suit: suit1 },
    { value: ranks[1], suit: suit2 },
  ];
}

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const filteredScenarios =
    selectedCategory === "ALL"
      ? scenarios
      : scenarios.filter((s) => s.category === selectedCategory);

  const [scenario, setScenario] = useState<Scenario>(
    getRandomScenario(filteredScenarios)
  );

  const displayedCards = useMemo(
    () => parseHand(scenario.hand),
    [scenario.hand]
  );

  const handPercent = useMemo(
    () => getHandPercent(scenario.hand),
    [scenario.hand]
  );

  const requiredPercent = getScenarioRangePercent(scenario);
  const correctAction = getEffectiveCorrectAction(scenario);
  const availableActions = getAvailableActions(scenario);

  const [result, setResult] = useState("");
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");

  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  function handleAnswer(answer: string) {
    if (answered) return;

    setAnswered(true);
    setSelectedAnswer(answer);

    if (answer === correctAction) {
      setResult("✅ Correct");
      setCorrectCount((prev) => prev + 1);
    } else {
      setResult("❌ Wrong");
      setWrongCount((prev) => prev + 1);
    }
  }

  function nextScenario() {
    setScenario(getRandomScenario(filteredScenarios));
    setResult("");
    setAnswered(false);
    setSelectedAnswer("");
  }

  function selectCategory(category: string) {
    const newFiltered =
      category === "ALL"
        ? scenarios
        : scenarios.filter((s) => s.category === category);

    if (newFiltered.length === 0) {
      console.warn("No scenarios for category:", category);
      return;
    }

    setSelectedCategory(category);
    setScenario(getRandomScenario(newFiltered));
    setResult("");
    setAnswered(false);
    setSelectedAnswer("");
  }

  function getButtonBackground(option: string) {
    if (answered) {
      if (option === correctAction) return "#15803d";
      if (option === selectedAnswer) return "#991b1b";
      return "#333";
    }

    switch (option) {
      case "Fold":
        return "#262626";
      case "Call":
        return "#2563eb";
      case "Raise":
        return "#d97706";
      case "All-in":
        return "#dc2626";
      default:
        return "#202020";
    }
  }

  const totalAnswers = correctCount + wrongCount;
  const accuracy =
    totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #222 0%, #0b0b0b 45%, #050505 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "18px",
        boxSizing: "border-box",
      }}
    >
      <main
        style={{
          maxWidth: "430px",
          margin: "0 auto",
          paddingBottom: "32px",
        }}
      >
        <h1
          style={{
            fontSize: "30px",
            margin: "10px 0 20px",
            letterSpacing: "-0.5px",
          }}
        >
          Poker Trainer
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginBottom: "18px",
          }}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => selectCategory(category)}
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                padding: "12px 10px",
                background:
                  selectedCategory === category
                    ? "#2563eb"
                    : "rgba(255,255,255,0.07)",
                color: "white",
                fontWeight: "bold",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              {category}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "8px",
            marginBottom: "18px",
          }}
        >
          <div style={statBoxStyle}>✅ {correctCount}</div>
          <div style={statBoxStyle}>❌ {wrongCount}</div>
          <div style={statBoxStyle}>🎯 {accuracy}%</div>
        </div>

        <section
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "20px",
            borderRadius: "22px",
            boxShadow: "0 12px 35px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "18px",
            }}
          >
            <Badge text={scenario.model} />
            <Badge text={scenario.category} />
            <Badge text={scenario.difficulty} />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
           <InfoTile
  label="Table"
  value={scenario.players >= 7 ? "9-Max" : "6-Max"}
/>
            <InfoTile label="Position" value={scenario.position} />
            <InfoTile label="Stack" value={`${scenario.stackBB} BB`} />
          </div>

          <div style={{ marginTop: "18px" }}>
            <div
              style={{
                fontWeight: "bold",
                marginBottom: "12px",
              }}
            >
              Hand
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                marginTop: "14px",
              }}
            >
              {displayedCards.map((card, index) => (
                <CardBox key={index} value={card.value} suit={card.suit} />
              ))}
            </div>
          </div>

          <p
            style={{
              marginTop: "22px",
              lineHeight: 1.45,
              fontSize: "15px",
            }}
          >
            <strong>Spot:</strong> {scenario.actionBefore}
          </p>
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginTop: "18px",
          }}
        >
         {availableActions.map((option, index) => (
            <button
              key={option}
              disabled={answered}
              onClick={() => handleAnswer(option)}
              style={{
                gridColumn:
                  availableActions.length % 2 !== 0 &&
                  index === availableActions.length - 1
                    ? "1 / -1"
                    : "auto",
                minHeight: "58px",
                borderRadius: "18px",
                border: "1px solid rgba(255,255,255,0.14)",
                background: getButtonBackground(option),
                color: "white",
                fontSize: "18px",
                fontWeight: "bold",
                cursor: answered ? "default" : "pointer",
                boxShadow: answered
                  ? "none"
                  : "0 8px 20px rgba(0,0,0,0.35)",
              }}
            >
              {option}
            </button>
          ))}
        </div>

        {result && (
          <section
            style={{
              marginTop: "14px",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "18px",
              borderRadius: "22px",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "10px" }}>{result}</h2>

            <p>
              <strong>Correct Action:</strong> {correctAction}
            </p>

            {requiredPercent !== null && (
              <>
                <p>
                  <strong>Hand Percent:</strong> {handPercent}%
                </p>

                <p>
                  <strong>Required Range:</strong> Top {requiredPercent}%
                </p>

                <p>
                  <strong>Range Result:</strong>{" "}
                  {handPercent <= requiredPercent
                    ? "Hand is inside the range"
                    : "Hand is outside the range"}
                </p>
              </>
            )}

            {scenario.raiseSizeBB && (
              <p>
                <strong>Recommended Raise Size:</strong> {scenario.raiseSizeBB}
              </p>
            )}

            <p style={{ lineHeight: 1.5, marginBottom: "18px" }}>
              {scenario.explanation}
            </p>

            <button
              onClick={nextScenario}
              style={{
                width: "100%",
                minHeight: "58px",
                borderRadius: "18px",
                border: "none",
                background: "#2563eb",
                color: "white",
                cursor: "pointer",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              Next Scenario
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span
      style={{
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "7px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "bold",
      }}
    >
      {text}
    </span>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "16px",
        padding: "12px 10px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          opacity: 0.7,
          marginBottom: "6px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "19px",
          fontWeight: "bold",
        }}
      >
        {value}
      </div>
    </div>
  );
}

const statBoxStyle = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "14px",
  padding: "10px 8px",
  textAlign: "center" as const,
  fontWeight: "bold",
  fontSize: "14px",
};