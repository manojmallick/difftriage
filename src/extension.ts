import * as vscode from "vscode";
import { formatReport, triagePaths } from "./logic/index.js";

export function activate(context: vscode.ExtensionContext) {
  const triage = vscode.commands.registerCommand(
    "difftriage.triageOpenFiles",
    async () => {
      const paths = vscode.window.tabGroups.all
        .flatMap((g) => g.tabs)
        .map((t) => (t.input as { uri?: vscode.Uri })?.uri?.fsPath)
        .filter((p): p is string => Boolean(p));
      const risks = triagePaths(paths);
      const doc = await vscode.workspace.openTextDocument({
        content: formatReport(risks),
        language: "markdown",
      });
      await vscode.window.showTextDocument(doc, { preview: true });
    },
  );

  const triageGit = vscode.commands.registerCommand(
    "difftriage.triageGitChanges",
    async () => {
      const gitExt = vscode.extensions.getExtension("vscode.git");
      if (!gitExt) {
        vscode.window.showWarningMessage("Git extension not available");
        return;
      }
      await gitExt.activate();
      const api = gitExt.exports.getAPI(1);
      const repo = api.repositories[0];
      if (!repo) {
        vscode.window.showWarningMessage("No git repository");
        return;
      }
      const changes = [
        ...repo.state.workingTreeChanges,
        ...repo.state.indexChanges,
      ].map((c: { uri: vscode.Uri }) => c.uri.fsPath);
      const risks = triagePaths(changes);
      const doc = await vscode.workspace.openTextDocument({
        content: `# DiffTriage\n\n${formatReport(risks)}`,
        language: "markdown",
      });
      await vscode.window.showTextDocument(doc, { preview: true });
    },
  );

  context.subscriptions.push(triage, triageGit);
}

export function deactivate() {}
