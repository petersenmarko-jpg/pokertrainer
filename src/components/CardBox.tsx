type CardBoxProps = {
  value: string;
  suit: string;
};

export default function CardBox({
  value,
  suit,
}: CardBoxProps) {
  const isRed =
    suit === "♥" || suit === "♦";

  return (
    <div
      style={{
        width: "90px",
        height: "120px",
        background: "white",
        borderRadius: "12px",
        border: "2px solid #ddd",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        padding: "10px",
        color: isRed ? "#d22" : "#111",
        fontWeight: "bold",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontSize: "30px",
          lineHeight: 1,
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: "34px",
          marginTop: "6px",
        }}
      >
        {suit}
      </div>
    </div>
  );
}