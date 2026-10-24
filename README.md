# DiffTriage

DiffTriage is a Visual Studio Code extension prototype that ranks open files and Git changes by path-based review risk. It produces a Markdown report with a risk level and the reason for each result.

## What it checks

The current heuristic looks at file paths only. Authentication, billing, secrets, and policy paths are marked critical; infrastructure, deployment, and schema paths are high risk; API and service paths are medium risk. It does not read file contents or evaluate the actual diff, and its scores are review hints rather than a security assessment.

## Use in VS Code

Open the Command Palette and run either command:

- `DiffTriage: Score open files`
- `DiffTriage: Score git changes`

The Git command uses the first repository reported by VS Code's built-in Git extension and considers its working-tree and staged changes.

## Develop

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

Package a VS Code extension bundle with `pnpm package`.

Core path scoring is in `src/logic/`; VS Code commands are in `src/extension.ts`.

Marketplace publishing is a manual workflow and does not run on ordinary pushes.

## License

Original project content is offered under the [PolyForm Noncommercial License 1.0.0](LICENSE). Third-party dependencies retain their own licenses. This is source-available software, not OSI-approved open source.
