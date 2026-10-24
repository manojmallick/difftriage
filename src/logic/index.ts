/** Risk-score AI-generated diffs for human review queues */

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface HunkRisk {
  path: string;
  level: RiskLevel;
  reasons: string[];
}

const CRITICAL_PATHS =
  /(auth|payment|billing|password|secret|oauth|\.env|middleware|policy|permission)/i;
const HIGH_PATHS = /(config|deploy|docker|k8s|infra|migration|schema)/i;
const MED_PATHS = /(api|route|controller|service)/i;

export function scorePath(path: string): HunkRisk {
  const reasons: string[] = [];
  let level: RiskLevel = "low";
  if (CRITICAL_PATHS.test(path)) {
    level = "critical";
    reasons.push("Touches auth/payments/secrets surface");
  } else if (HIGH_PATHS.test(path)) {
    level = "high";
    reasons.push("Config / infra / schema change");
  } else if (MED_PATHS.test(path)) {
    level = "medium";
    reasons.push("API / service layer");
  } else {
    reasons.push("Routine application code");
  }
  return { path, level, reasons };
}

export function triagePaths(paths: string[]): HunkRisk[] {
  return paths.map(scorePath).sort((a, b) => rank(b.level) - rank(a.level));
}

function rank(l: RiskLevel): number {
  return { low: 1, medium: 2, high: 3, critical: 4 }[l];
}

export function formatReport(risks: HunkRisk[]): string {
  if (risks.length === 0) return "No files to triage.";
  return risks
    .map((r) => `[${r.level.toUpperCase()}] ${r.path}\n  - ${r.reasons.join("; ")}`)
    .join("\n");
}
