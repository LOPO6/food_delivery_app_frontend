# GourmAI Frontend (Angular)

Angular 19 standalone app for GourmAI. Connects to the Express + PostgreSQL backend and supports cookie-based auth. Can be deployed independently (Vercel) or “exported” and served by the backend.

## Project Overview
- Role-based auth (customer, courier, admin)
- Courier approval flow and dashboard
- Restaurant browsing, AI recommendations banner, menu search
- JWT auth via HttpOnly cookies (`withCredentials: true`)

## Environment Configuration
Frontend reads the backend URL from `src/environments/environment.ts` and `src/environments/environments.development.ts`.

Typical variables:
- `environment.serverUrl` → e.g. `http://localhost:3000`

Update these before building for production.

## Development (Windows PowerShell)

```powershell
Push-Location "C:\University\GourmAI\backend\food_delivery_app_frontend"; npm install; ng serve; Pop-Location
```

Open `http://localhost:4200/`. Ensure backend is running on the URL referenced by `environment.serverUrl` and that CORS allows `localhost:4200` with credentials if cross-origin.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Build

```powershell
Push-Location "C:\University\GourmAI\backend\food_delivery_app_frontend"; ng build; Pop-Location
```

Output directory is defined in `angular.json` under `projects.<name>.architect.build.options.outputPath` (commonly `dist/<project-name>`).

### Serve via Backend (Single-Origin)
1. Build the frontend (see above).
2. Copy the `dist/<project-name>` contents to backend `public/`.

```powershell
$distPath = "C:\University\GourmAI\backend\food_delivery_app_frontend\dist\<your-project-name>"
$backendPublic = "C:\University\GourmAI\backend\food_delivery_app_backendv2\public"
New-Item -ItemType Directory -Force -Path $backendPublic | Out-Null
Copy-Item -Path "$distPath\*" -Destination $backendPublic -Recurse -Force
```

Make sure backend `app.js` serves static files and SPA fallback to `index.html` (see backend README). This gives a single origin for UI + API and simplifies CORS/cookies.

### Deploy Frontend to Vercel (Optional)
- `npm i -g vercel; vercel login`
- From frontend folder: `vercel` then `vercel --prod`
- Set env `environment.serverUrl` to your backend public URL (e.g. Render/Railway). Ensure backend CORS allows your Vercel domain with credentials.

## Running unit tests

```powershell
Push-Location "C:\University\GourmAI\backend\food_delivery_app_frontend"; ng test; Pop-Location
```

## Running end-to-end tests

```powershell
Push-Location "C:\University\GourmAI\backend\food_delivery_app_frontend"; ng e2e; Pop-Location
```

Choose and configure your e2e framework (Angular CLI isn’t shipping one by default).

## Additional Resources

- Angular CLI: [Overview and Command Reference](https://angular.dev/tools/cli)
- Deployment notes: See backend README for serving Angular build and CORS/cookies configuration.
