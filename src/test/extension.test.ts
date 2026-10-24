import * as assert from "node:assert";
import { formatReport, triagePaths } from "../logic/index.js";

suite("DiffTriage logic", () => {
  test("scores auth path critical", () => {
    const r = triagePaths(["src/auth/login.ts", "src/ui/Button.tsx"]);
    assert.equal(r[0]!.level, "critical");
    assert.ok(formatReport(r).includes("CRITICAL"));
  });
});
