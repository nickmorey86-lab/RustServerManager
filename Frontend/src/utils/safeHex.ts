export function safeHex(value: string): string {
  if (/^#[0-9A-Fa-f]{6}$/.test(value)) return value;
  if (/^#[0-9A-Fa-f]{8}$/.test(value)) return value.slice(0, 7);

  if (value.startsWith("rgba(")) {
    const [r, g, b] = value
      .replace("rgba(", "")
      .replace(")", "")
      .split(",")
      .map(v => parseInt(v.trim(), 10));

    return (
      "#" +
      r.toString(16).padStart(2, "0") +
      g.toString(16).padStart(2, "0") +
      b.toString(16).padStart(2, "0")
    );
  }

  return "#000000";
}
