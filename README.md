# Tesla Fleet Telemetry & Management Dashboard (React + TypeScript + Vite)

A modern, high-aesthetic web dashboard for interacting with the Tesla Fleet API and monitoring real-time vehicle telemetry streams.

---

## Features
- **Global Status Card:** Live vs. Mock mode banner and one-click OAuth login/disconnect.
- **Fleet Cards Grid:** Interactive cards for vehicles (Model S Plaid, Cybertruck Cyberbeast, Model 3).
- **Vehicle Telemetry View:** Real-time metrics for Battery SoC, Range, Speed, Power, Cabin/Ambient Climate, Locks, and GPS.
- **Live Telemetry Streamer:** Real-time signal updates connected via SignalR WebSockets and high-frequency driving simulation.
- **Safety-Gated Vehicle Commands:** Confirmation modal before executing remote actions (`flash_lights`, `honk_horn`, `door_lock`, `door_unlock`, `auto_conditioning_start/stop`).
- **Command Audit Trail:** Real-time view of immutable security audit logs queried from SQL Server.

---

## Local Development

```bash
# Install dependencies
npm install

# Run local dev server with hot reload
npm run dev
```

The application runs on `http://localhost:5173/` and proxies `/api` requests to `http://localhost:5000`.

---

## Production Build

```bash
npm run build
```

The compiled production bundle is generated in `dist/`.

---

## Deploying to Azure

### Option A: Azure Static Web Apps (Recommended)
1. Push this repository to GitHub.
2. In the [Azure Portal](https://portal.azure.com/), click **Create a resource** &rarr; **Static Web App**.
3. Choose your subscription and resource group, and select **Free** or **Standard** plan.
4. Under **Deployment details**, select **GitHub**, authenticate, and select this repository and branch (`main` or `master`).
5. In **Build Presets**, select **Custom**:
   - **App location:** `/`
   - **Api location:** *(leave empty)*
   - **Output location:** `dist`
6. Click **Review + create**.
7. In the Static Web App resource in Azure Portal, go to **Configuration** &rarr; **Application settings**, add:
   - Name: `VITE_API_BASE_URL`
   - Value: `https://your-backend-api.azurewebsites.net` (your deployed ASP.NET Core API URL)
8. Save settings. Azure will trigger the GitHub Actions workflow and deploy your live dashboard!

### Option B: Docker on Azure App Service / Container Apps
This repository includes a multi-stage `Dockerfile` and `nginx.conf`:
```bash
# Build Docker image
docker build -t tesla-fleet-dashboard .

# Run locally
docker run -p 8080:80 tesla-fleet-dashboard
```

Deploy the container directly to **Azure App Service (Linux Web App)** or **Azure Container Apps**.

---

## Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL of the ASP.NET Core backend Web API | `""` (relative `/api/tesla`) |
