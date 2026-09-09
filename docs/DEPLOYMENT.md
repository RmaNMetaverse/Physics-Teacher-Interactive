# Deployment

The application builds to static files and needs no runtime server, secret, API key, or paid service. GitHub Pages publishes the `dist/` artifact through `.github/workflows/deploy.yml` after validation on pushes to `main` or a manual workflow dispatch.

## Repository setup

In GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**. The workflow has only the permissions Pages requires: read repository contents, write Pages, and request an OIDC identity token. The `github-pages` environment exposes the deployed URL and GitHub environment protection rules can be added without changing the build.

The workflow uses one `pages` concurrency group and does not cancel an active deployment. A newer queued run replaces an older queued run while preserving the deployment already in progress.

## Root and repository subpaths

Vite's asset base is relative (`./`), so built scripts, styles, and assets resolve from either a root such as `https://example.org/` or a repository path such as `https://rmanmetaverse.github.io/Physics-Teacher-Interactive/`. Navigation uses hash routes (`#/curriculum`, for example), so GitHub Pages always serves `index.html`; no rewrite or `404.html` fallback is required.

Do not replace hash routing with history routing unless the hosting plan also provides a tested fallback for direct URL requests. Do not hard-code `/src`, `/assets`, or the repository name into runtime asset URLs.

## Local release verification

From a clean dependency install:

```sh
npm ci
npm run check
npx playwright install chromium
npm run test:e2e
```

`npm run check` includes the production build. To inspect the exact artifact, run `npm run preview` after it succeeds. Test navigation after loading `/` and after loading a nested hash route. For repository-subpath behavior, serve the contents of `dist/` beneath a nested directory and confirm assets load, a lesson route survives reload, and progress remains scoped to that origin.

The deployment workflow repeats validation and browser tests before uploading `dist/`. Failed checks cannot create a Pages artifact or deployment.

## Rollback and troubleshooting

GitHub Pages deployments are immutable workflow artifacts. To roll back, revert the problematic commit on `main`; the resulting validated workflow run publishes the previous code without rewriting Git history.

If Pages reports a missing artifact, confirm the build produced `dist/index.html`. If assets fail only at a repository subpath, inspect generated URLs for an accidental leading slash. If a hash route fails after reload, confirm application navigation keeps the `#` fragment and that GitHub Pages is configured for GitHub Actions rather than a branch directory.
