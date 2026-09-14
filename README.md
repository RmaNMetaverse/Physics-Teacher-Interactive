# Physics Teacher Interactive

Physics Teacher Interactive is an interactive physics teacher inspired by **Brilliant** and **Duolingo**—but built for physics.

It teaches through short, guided lessons instead of long textbook chapters. You make predictions, run simulations, work through examples, and explain what happened. When a lesson needs algebra, vectors, trigonometry, or another prerequisite, the app teaches that background math as part of the lesson.

The goal is to make physics feel like a skill you practice every day: curious, visual, and hands-on.

## App Preview

The interface uses a responsive Apple-inspired Liquid Glass visual system with a focused mission player, cinematic simulation labs, and a progress report dashboard for long-term mastery.

![Explore course gallery](docs/assets/app-explore.png)

![Foundations course path](docs/assets/app-course-path.png)

![Interactive mission lab](docs/assets/app-mission-lab.png)

### 3D simulation gallery

Mission laboratories include interactive 3D scenes with adjustable parameters, camera controls, and live scientific readouts.

![Measurement laboratory simulation](docs/assets/simulation-measurement.png)
![Quantum light simulation](docs/assets/simulation-quantum.png)
![Cosmology expansion simulation](docs/assets/simulation-cosmology.png)

![Progress report dashboard](docs/assets/app-progress.png)

The screenshots above are captured from the running app. The repository currently exposes Explore, Learn, and Progress tabs; the Progress screen is the learner-facing report dashboard.

Run the app locally with `npm run dev` to explore the live simulations and responsive layouts.

## What you can do

- Follow a complete Physics Foundations course from measurement and vectors through mechanics and oscillations.
- Explore 14 released course paths with 89 normal missions and 13 checkpoints, covering classical mechanics, waves, thermodynamics, electromagnetism, optics, relativity, quantum physics, atomic physics, nuclear physics, particles, condensed matter, astrophysics, and cosmology.
- Learn with bite-sized missions built around **Observe → Predict → Simulate → Explain → Check**.
- Open the math behind an equation in two ways: a quick explanation or a step-by-step foundation lesson.
- Change values in interactive experiments and see the physics respond immediately.
- See bounded, model-derived 3D scenes with responsive materials, lighting, particle systems, scientific readouts, graphs, accessible data tables, and autoplaying lesson simulations.
- Track XP, streaks, daily goals, course mastery, activity, checkpoint badges, and backup/restore data in the Progress report dashboard.
- Use anonymous localStorage mode or create an account with email/password, Google, or GitHub through Supabase Auth.
- Merge and sync progress, answers, settings, themes, and achievements across devices through a protected Supabase database with per-user row-level security.
- Use Light, Night, Eye Comfort, Ocean, High Contrast, custom primary/secondary colors, and optional Liquid Glass styling.
- Keep learning when WebGL is unavailable: simulations fall back to controls, measurements, graphs, explanations, and tables.

Every simulation is designed to remain useful on mobile devices. If a device cannot run WebGL, the app keeps the controls, explanations, graphs, and measurements available in a reduced visual mode.

The app is free and open source. An account is optional: anonymous learners keep their progress in the browser and can export a backup, while signed-in learners sync the same progress through Supabase. The frontend remains a static Vite build suitable for GitHub Pages; Vercel can provide branch previews, and neither deployment requires Docker or a custom application server.

## Run Locally

Requires Node.js 22.20 or newer:

```sh
npm ci
npm run dev
```

Run comprehensive quality checks:

```sh
npm run check          # Typecheck, lint, unit tests, and Vite production build
npm run test:e2e        # Playwright end-to-end browser journeys
```

Cloud accounts require a Supabase project. Copy `.env.example` to `.env.local`, add the project URL and public publishable key, then run the SQL migration in `supabase/migrations`. The [deployment guide](docs/DEPLOYMENT.md) covers GitHub Pages and Vercel setup. Never expose a Supabase secret or service-role key in this frontend.

## Project Guides

- [Architecture](docs/ARCHITECTURE.md) — System components, boundaries, state machine, and data flow
- [Curriculum](docs/CURRICULUM.md) — Complete 14-course syllabus, starter paths, and math roadmap
- [Authoring Guide](docs/AUTHORING.md) — Authoring courses, missions, layered math, and physics models
- [Scientific Validation](docs/SCIENTIFIC_VALIDATION.md) — Dimensional consistency, reference cases, and model limits
- [Sources and Citations](docs/SOURCES.md) — Open educational citations, reference maps, and boundary limits
- [Deployment](docs/DEPLOYMENT.md) — GitHub Pages static deployment and subpath verification
- [Contributing](CONTRIBUTING.md) — Development guidelines and contribution policies

## License and Source Policy

Project licensing is recorded in the repository license. Source citations support scientific claims and contextual study; course explanations, numerical problems, interactive simulations, and learning assets are original works.
