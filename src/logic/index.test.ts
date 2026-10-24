import { formatReport, scorePath, triagePaths } from "./index.js";

export function runDiffTriageTests() {
  // Test 1: Critical path scoring (auth, billing, secrets, .env)
  const authRisk = scorePath("src/auth/jwt.ts");
  if (authRisk.level !== "critical" || !authRisk.reasons[0]?.includes("auth/payments")) {
    throw new Error(`Critical auth path scoring failed: ${JSON.stringify(authRisk)}`);
  }

  const envRisk = scorePath(".env.production");
  if (envRisk.level !== "critical") {
    throw new Error(`Critical .env path scoring failed: ${JSON.stringify(envRisk)}`);
  }

  // Test 2: High path scoring (infra, docker, migrations, schema)
  const infraRisk = scorePath("infrastructure/k8s/deployment.yaml");
  if (infraRisk.level !== "high" || !infraRisk.reasons[0]?.includes("Config / infra")) {
    throw new Error(`High infra path scoring failed: ${JSON.stringify(infraRisk)}`);
  }

  const migrationRisk = scorePath("prisma/migrations/001_init.sql");
  if (migrationRisk.level !== "high") {
    throw new Error(`High migration path scoring failed: ${JSON.stringify(migrationRisk)}`);
  }

  // Test 3: Medium path scoring (API, controllers, services)
  const apiRisk = scorePath("src/api/users.ts");
  if (apiRisk.level !== "medium" || !apiRisk.reasons[0]?.includes("API / service")) {
    throw new Error(`Medium API path scoring failed: ${JSON.stringify(apiRisk)}`);
  }

  // Test 4: Low path scoring (routine UI/components)
  const uiRisk = scorePath("src/components/Button.tsx");
  if (uiRisk.level !== "low") {
    throw new Error(`Low UI path scoring failed: ${JSON.stringify(uiRisk)}`);
  }

  // Test 5: Triaging multiple paths and ranking by risk level
  const triaged = triagePaths([
    "src/components/Card.tsx",
    "src/services/payment.ts",
    "docker-compose.yml",
    "src/controllers/auth.ts",
  ]);

  if (triaged.length !== 4) throw new Error(`Expected 4 triaged items, got ${triaged.length}`);
  // Expected rank order: critical (auth/payment) -> high (docker) -> medium -> low (card)
  if (triaged[0]?.level !== "critical") {
    throw new Error(`Expected rank 1 critical, got ${triaged[0]?.level}`);
  }
  if (triaged[triaged.length - 1]?.level !== "low") {
    throw new Error(`Expected last rank low, got ${triaged[triaged.length - 1]?.level}`);
  }

  // Test 6: Report formatting
  const formatted = formatReport(triaged);
  if (!formatted.includes("[CRITICAL]") || !formatted.includes("[LOW]")) {
    throw new Error(`Report formatting failed: ${formatted}`);
  }

  const emptyFormatted = formatReport([]);
  if (emptyFormatted !== "No files to triage.") {
    throw new Error(`Empty report formatting failed: ${emptyFormatted}`);
  }

  console.log("✓ All 6 DiffTriage unit tests passed!");
}

runDiffTriageTests();
