# SwaraGPT Production Deployment Guide

This guide covers production deployment configurations for SwaraGPT across cloud providers, container registries, and serverless environments.

---

## 1. Cloud Architecture Overview

* **Frontend:** Vercel / AWS CloudFront + S3 / Docker
* **Backend:** Render / Railway / AWS ECS Fargate
* **Relational DB:** AWS RDS PostgreSQL / Neon / Supabase
* **Document Store:** MongoDB Atlas
* **Vector Store:** ChromaDB Managed / EC2 Persistent Volume
* **Object Storage:** AWS S3 / Cloudflare R2 for user audio archives

---

## 2. Docker Compose Deployment (Self-Hosted)

For single-server deployment on Ubuntu 22.04 LTS (AWS EC2, DigitalOcean Droplet, Hetzner):

```bash
# 1. Clone repository
git clone https://github.com/your-username/swara-gpt.git
cd swara-gpt

# 2. Configure production secrets
cp .env.example .env
nano .env

# Set strong JWT_SECRET, Postgres passwords, and AI Provider keys

# 3. Launch full stack with multi-stage builds
docker compose up -d --build

# 4. Verify running health
docker compose ps
curl http://localhost:8000/health
```

---

## 3. Vercel (Frontend) & Render (Backend)

### Frontend on Vercel (1-Click Deployment)

Deploy directly to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fom-mane-coder%2FSwaraGPT&root-directory=frontend)

#### Manual Deployment via Vercel Dashboard:
1. Log in to [Vercel](https://vercel.com) and click **"Add New..." > "Project"**.
2. Select your imported GitHub repository: `https://github.com/om-mane-coder/SwaraGPT`.
3. Under **Project Settings**:
   * **Framework Preset:** Next.js
   * **Root Directory:** Click "Edit" and set to `frontend` (critical for this monorepo).
4. Environment Variables (Optional):
   * `NEXT_PUBLIC_API_URL`: URL of your deployed backend (e.g. `https://your-backend.onrender.com` or leave empty to use built-in offline simulation mode).
5. Click **Deploy**. Vercel will build and assign a global, free, SSL-secured domain: `https://swaragpt.vercel.app`.

#### CLI Deployment:
```bash
cd frontend
npx vercel
# Follow prompts: Link to existing project, choose Next.js preset, deploy to production with:
npx vercel --prod
```

### Backend on Render / Railway
1. Create a new Web Service pointing to `backend/`.
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Set Environment Variables:
   * `DATABASE_URL`: Your PostgreSQL connection string.
   * `JWT_SECRET`: 64-character random string.
   * `AI_PROVIDER`: `gemini`, `openai`, or `offline`.
   * `CORS_ORIGINS`: `https://your-frontend.vercel.app`

---

## 4. Reverse Proxy with SSL (Nginx & Certbot)

```nginx
server {
    server_name swaragpt.yourdomain.com;

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ws/ {
        proxy_pass http://127.0.0.1:8000/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }
}
```

```bash
sudo certbot --nginx -d swaragpt.yourdomain.com
```
