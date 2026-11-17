# Deployment

StreetCar runs as three hosted pieces:

```
Browser ──> Vercel (React SPA, frontend/) ──> Render (Spring Boot API, backend/Dockerfile) ──> Supabase (PostgreSQL)
```

- **Vercel** serves the static build of `frontend/`. `frontend/vercel.json` sets the Vite build, rewrites every path to `/index.html` so deep links like `/student` work, and turns off Git auto-deploys.
- **Render** runs the backend from `backend/Dockerfile`, described by the Blueprint in `render.yaml`. Render sets `PORT`; the image sets `SERVER_ADDRESS=0.0.0.0`. Auto-deploy is off.
- **Supabase** holds the database. The backend reaches it through `DB_URL`, `DB_USERNAME` and `DB_PASSWORD` (see `backend/.env.example` for the Session pooler format).

## How a deploy happens

Every push and pull request runs `.github/workflows/ci.yml`: the `backend` job (tests and coverage gate), the `frontend` job (lint, tests, build) and the `docker` job (builds the image, runs it, and expects `GET /courses` to answer 401). On a push to `main`, once all three pass, `deploy-backend` and `deploy-frontend` POST the Render and Vercel deploy hooks. Neither host deploys on its own, so nothing reaches production without green checks.

Until the hook secrets exist, the deploy jobs pass with a "deploy skipped" notice.

## One-time setup

These steps need dashboard access and are done once by a person.

1. **Create the Render service.** In Render, choose **New > Blueprint**, connect this GitHub repository, and select `render.yaml`. Render asks for each `sync: false` value:
   - `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`: the Supabase Session pooler JDBC URL, user and password.
   - `JWT_SECRET`: at least 32 random bytes, e.g. `openssl rand -base64 48`. Do not reuse a local one.
   - `ALLOWED_ORIGINS`: the Vercel production URL, e.g. `https://streetcar.vercel.app` (comma-separate several).

   Note the service URL, e.g. `https://streetcar-backend.onrender.com`.
2. **Create the Render deploy hook.** Service **Settings > Deploy Hook**, copy the URL.
3. **Create the Vercel project.** **Add New > Project**, import this repository, and set **Root Directory** to `frontend`. `vercel.json` supplies the build settings.
4. **Set `VITE_API_URL` in Vercel.** **Project Settings > Environment Variables**, for Production: the Render URL from step 1, with no trailing slash. Vite bakes it in at build time, so redeploy after changing it.
5. **Create the Vercel deploy hook.** **Project Settings > Git > Deploy Hooks**, branch `main`, copy the URL.
6. **Add both hooks as GitHub secrets.** Repository **Settings > Secrets and variables > Actions**: `RENDER_DEPLOY_HOOK_URL` and `VERCEL_DEPLOY_HOOK_URL`. A deploy hook URL is a credential: anyone holding it can trigger a deploy, so never commit or paste it anywhere else.
7. **Check it.** Push to `main` (or re-run CI on `main`) and confirm both deploy jobs log "deploy triggered" and a new deploy appears on each host. Confirm Vercel did not also start a Git deploy.

## Known gap: CORS

`config/CorsConfig.java` still allows only `http://localhost:5173` and `http://localhost:5174`. Until **SCRUM-99** makes it read `ALLOWED_ORIGINS`, the browser blocks the deployed frontend's calls to the API, and the app falls back to its offline fixtures. Setting `ALLOWED_ORIGINS` on Render now means SCRUM-99 needs no further dashboard change.

## Notes

- The Render free plan sleeps after inactivity; the first request after a sleep takes up to a minute. Open the API URL shortly before a demo.
- Without `DB_URL` the container falls back to an H2 file inside the container, which Render discards on every deploy. Always set the Supabase values.
- To build the image locally: `docker build -t streetcar-backend backend`, then `docker run -p 9000:9000 -e PORT=9000 -e JWT_SECRET=<32+ bytes> streetcar-backend`.
