import { describe, expect, it } from "vitest";
import { runBuildMatrix } from "../../scripts/run-build-matrix";

describe("build matrix playtest", () => {
  it("prints the current preset matchup table", () => {
    const result = runBuildMatrix({
      runs: 10,
      maxRounds: 40,
      difficulty: "champion",
    });

    const header = ["Build", ...result.presets.map((preset) => preset.label)].join(" | ");
    const separator = ["---", ...result.presets.map(() => "---")].join(" | ");
    const rows = result.presets.map((left) => {
      const cells = result.presets.map((right) => {
        const match = result.matrix.get(`${left.id}__${right.id}`);
        return match ? `${match.leftWins}-${match.rightWins}-${match.draws} / ${match.averageRounds}r` : "-";
      });

      return [left.label, ...cells].join(" | ");
    });

    const summary = [...result.totals]
      .sort((left, right) => {
        const leftNet = left.wins - left.losses;
        const rightNet = right.wins - right.losses;
        if (rightNet !== leftNet) {
          return rightNet - leftNet;
        }
        return right.wins - left.wins;
      })
      .map(
        (entry) =>
          `${entry.label}: W ${entry.wins}, L ${entry.losses}, D ${entry.draws}, Net ${entry.wins - entry.losses}, Avg ${(entry.rounds / Math.max(1, entry.matches)).toFixed(1)}r`
      );

    console.log("");
    console.log(`# Build Matrix`);
    console.log(header);
    console.log(separator);
    for (const row of rows) {
      console.log(row);
    }
    console.log("");
    console.log("## Summary");
    for (const line of summary) {
      console.log(line);
    }

    expect(result.presets.length).toBeGreaterThan(0);
    expect(result.matrix.size).toBe(result.presets.length * result.presets.length);
  });
});
