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

### Frontend on Vercel
1. Link your GitHub repository in Vercel.
2. Set Root Directory to `frontend`.
3. Add Environment Variables:
   * `NEXT_PUBLIC_API_URL`: `https://your-backend.onrender.com`
4. Deploy! Next.js 16 App Router will build and optimize static and dynamic pages automatically.

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
