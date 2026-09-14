# Deployment

The application builds to static files. GitHub Pages or Vercel can host the frontend, while the optional account system uses hosted Supabase Auth and PostgreSQL. It needs no application server or Docker container.

## Supabase account and progress sync

Create a Supabase project, then open its SQL editor and run `supabase/migrations/202609140001_user_progress.sql`. This creates one JSON progress document per authenticated user and enables row-level security so users can only read and update their own row.

Copy `.env.example` to `.env.local` for local development and set:

```sh
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-public-publishable-key
```

Both values are designed to be present in browser code. Never use a Supabase secret key or `service_role` key in this project.

For this deployed GitHub Pages app, configure **Supabase → Authentication → URL Configuration** with the exact values below:

```text
Site URL
https://rmanmetaverse.github.io/Physics-Teacher-Interactive/

Redirect URLs
https://rmanmetaverse.github.io/Physics-Teacher-Interactive/
http://localhost:5173/
```

The app now supplies that redirect URL for both social login and email confirmation. In Supabase's email confirmation template, use `{{ .RedirectTo }}` rather than `{{ .SiteURL }}` if the template has been customized.

To enable Google, create a Web OAuth client in Google Cloud. Add `https://rmanmetaverse.github.io` as an authorized JavaScript origin and add this exact callback URI as an authorized redirect URI:

```text
https://nwjijntqqmocmforvdiz.supabase.co/auth/v1/callback
```

Then paste that Google Client ID and Client Secret into **Supabase → Authentication → Providers → Google** and enable the provider. For GitHub, create an OAuth App with the same callback URI, add its Client ID and Client Secret in **Supabase → Authentication → Providers → GitHub**, and enable GitHub. The external provider callback is always the Supabase callback; the final return to the app is controlled by the Supabase Site URL and Redirect URLs above.

The app remains fully usable without these variables. Anonymous progress stays in localStorage. After sign-in, the app merges the browser and cloud documents, writes the result to both locations, and debounces later cloud updates.

## Repository setup

In GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**. The workflow has only the permissions Pages requires: read repository contents, write Pages, and request an OIDC identity token. The `github-pages` environment exposes the deployed URL and GitHub environment protection rules can be added without changing the build.

To enable accounts on GitHub Pages, open **Settings → Environments → github-pages → Environment variables** and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The build job explicitly uses the `github-pages` environment so those values are available while Vite bundles the browser application. The workflow fails with a clear configuration error instead of silently deploying a local-only build when either value is missing.

GitHub's `github-pages` environment is the only environment used by this workflow. Vercel's Production, Preview, and Development variable scopes are separate Vercel concepts and are only needed if the repository is also deployed through Vercel.

The workflow uses one `pages` concurrency group and does not cancel an active deployment. A newer queued run replaces an older queued run while preserving the deployment already in progress.

## Root and repository subpaths

Vite's asset base is relative (`./`), so built scripts, styles, and assets resolve from either a root such as `https://example.org/` or a repository path such as `https://rmanmetaverse.github.io/Physics-Teacher-Interactive/`. Navigation uses hash routes (`#/curriculum`, for example), so GitHub Pages always serves `index.html`; no rewrite or `404.html` fallback is required.

Do not replace hash routing with history routing unless the hosting plan also provides a tested fallback for direct URL requests. Do not hard-code `/src`, `/assets`, or the repository name into runtime asset URLs.

## Vercel deployment and branch previews

Import the GitHub repository in Vercel and keep the detected Vite settings. The committed `vercel.json` selects `npm run build` and the `dist` output folder. Add the two public Supabase environment variables in **Project Settings → Environment Variables** for Production, Preview, and Development.

Vercel deploys the selected production branch to the production domain. Every pushed feature branch and pull request receives a separate preview URL, so this account branch can be tested before it replaces the static release. No Vercel Function is required because Supabase handles authentication and data access.

Vercel is optional. GitHub Pages plus Supabase supports the same account and sync behavior and is the smallest production setup for this application.

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
