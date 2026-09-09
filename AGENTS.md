# Project instructions

Build Physics Teacher Interactive according to docs/IMPLEMENTATION.md. The first release is a complete foundations course; advanced courses are explicitly planned.

## Authorized source control workflow
The owner explicitly requested automatic commits and pushes after changes. After each coherent, validated change set, update CHANGELOG.md, commit and push to https://github.com/RmaNMetaverse/Physics-Teacher-Interactive.git. This authorization persists for future work in this project. Do not commit secrets, generated build files, unrelated user edits, or failing work. Never force-push. Resolve remote changes without discarding work. Report authentication or push failures honestly.

## Engineering
- Keep SI physics models independent of React and rendering.
- Add meaningful failing tests before new scientific calculations or behavioral changes; verify the fix.
- Run npm run check and relevant browser checks before release changes.
- Maintain a closed, acyclic prerequisite graph. Do not publish a physics lesson whose required math is unavailable.
- Every lesson needs original explanations, equations, worked examples, three assessments, sources and model limitations.
- Clearly label unreleased courses and distinguish supported physics from theoretical proposals.
- Preserve static GitHub Pages compatibility and hash routing. No credentials or paid services are required.
- All dependency changes include the lockfile. Document scientific and interface changes.
