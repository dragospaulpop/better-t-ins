---
name: VPS Deployment Plan
overview: "Deploy the better-t-ins monorepo across 4 Ubuntu VPSes: nginx as entry point with SSL termination, Bun/PM2 for the web and API apps, MinIO in Docker for file storage, and MySQL for the database. All services communicate via private network."
todos:
  - id: mysql-setup
    content: Document VPS 4 MySQL installation, user/database creation, and firewall config
    status: pending
  - id: minio-setup
    content: Document VPS 3 Docker + MinIO setup with persistent storage and bucket creation
    status: pending
  - id: node-apps-setup
    content: Document VPS 2 Bun/PM2 setup, build process, and deployment scripts
    status: pending
  - id: nginx-gateway
    content: Document VPS 1 nginx reverse proxy config with Let's Encrypt SSL
    status: pending
  - id: env-variables
    content: Create comprehensive .env.example template for production
    status: pending
  - id: deploy-scripts
    content: Create deployment shell scripts for each VPS
    status: pending
---

# VPS Deployment Plan for better-t-ins

## Architecture Overview

```
Internet -> [phpint: Nginx + SSL] -> Private Network -> [nodeint: Bun API + Web]
                                                     -> [filesint: MinIO]
                                                     -> [mysqlint: MySQL]
```

**Subdomains:**

- `app.yourdomain.com` -> Web frontend (static build served via nginx reverse proxy)
- `api.yourdomain.com` -> Hono/Bun API server (port 3000)
- `s3.yourdomain.com` -> MinIO S3 API (port 9000)
- `storage.yourdomain.com` -> MinIO Console (port 9001, optional)

## VPS Configuration Summary

| Hostname | Role | Private IP | Resources | Status |

|----------|------|------------|-----------|--------|

| `phpint` | Nginx Gateway (internet access) | 10.194.250.33 | 4 CPU, 8GB RAM | nginx already installed |

| `nodeint` | Bun/App Server | 10.194.250.35 | 4 CPU, 8GB RAM | PM2 installed, needs Bun |

| `filesint` | MinIO Storage | 10.194.250.31 | 2 CPU, 4GB RAM | needs Docker + MinIO |

| `mysqlint` | MySQL Database | 10.194.250.30 | 4 CPU, 4GB RAM | MySQL installed |

**Note:** `phpint` is the public entry point. All servers have internet access for package installation.

## Key Files

- Server entry: [`apps/server/src/index.ts`](apps/server/src/index.ts) - Hono API on port 3000
- Web build: [`apps/web/vite.config.ts`](apps/web/vite.config.ts) - Vite build outputs to `dist/`
- DB config: [`packages/db/src/index.ts`](packages/db/src/index.ts) - Uses `DATABASE_URL`
- Storage config: [`packages/storage/src/index.ts`](packages/storage/src/index.ts) - MinIO client config
- Mail config: [`packages/mail/src/index.ts`](packages/mail/src/index.ts) - Uses Resend in production

## Environment Variables Required

Create `/home/deploy/better-t-ins/apps/server/.env` on `nodeint`:

```bash
# Database (mysqlint)
DATABASE_URL=mysql://bettertins_user:YOUR_DB_PASSWORD@10.194.250.30:3306/bettertins

# Auth & Security
RECAPTCHA_SECRET_KEY=your_recaptcha_secret
ARCJET_KEY=your_arcjet_key

# Domain Config (replace yourdomain.com with actual domain)
CORS_ORIGIN=https://app.yourdomain.com
DOMAIN=yourdomain.com
FRONTEND_URL=https://app.yourdomain.com
APP_NAME=better-t-ins

# MinIO Storage (filesint - internal network, no SSL)
MINIO_CLIENT_REGION=us-east-1
MINIO_CLIENT_ENDPOINT=10.194.250.31
MINIO_CLIENT_PORT=9000
MINIO_CLIENT_USE_SSL=false
MINIO_CLIENT_ACCESS_KEY=minioadmin
MINIO_CLIENT_SECRET_KEY=YOUR_MINIO_SECRET
MINIO_CLIENT_BUCKET_NAME=bettertins

# Email (Resend for production)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com
NODE_ENV=production
```

## Deployment Steps

### Step 1: mysqlint - Create Database and User

MySQL is already installed. Just create the database and user for this application.

```bash
# SSH to mysqlint (10.194.250.30)
mysql -u root -p

CREATE DATABASE bettertins CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'bettertins_user'@'10.194.250.%' IDENTIFIED BY 'YOUR_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON bettertins.* TO 'bettertins_user'@'10.194.250.%';
FLUSH PRIVILEGES;
```

### Step 2: filesint - MinIO Setup

Install Docker and deploy MinIO container.

```bash
# SSH to filesint (10.194.250.31)
# Install Docker (requires internet - see note below)
# Download from phpint and SCP, or use phpint as HTTP proxy

# Create MinIO data directory
sudo mkdir -p /data/minio

# Run MinIO container
docker run -d \
  --name minio \
  --restart unless-stopped \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=YOUR_MINIO_SECRET \
  -v /data/minio:/data \
  minio/minio server /data --console-address ":9001"
```

### Step 3: nodeint - Bun and App Server Setup

PM2 is already installed. Install Bun, build and deploy the application.

```bash
# SSH to nodeint (10.194.250.35)

# Install Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Clone/copy project and build
cd /home/deploy
git clone <repo> better-t-ins
cd better-t-ins
bun install
bun run build

# Create .env file at apps/server/.env (see Environment Variables section)
```

Create PM2 ecosystem file at `/home/deploy/better-t-ins/ecosystem.config.cjs`:

```javascript
module.exports = {
  apps: [
    {
      name: 'bettertins-api',
      cwd: './apps/server',
      script: 'bun',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
```
```bash
# Start with PM2
pm2 start ecosystem.config.cjs
pm2 save
```

### Step 4: phpint - Nginx Configuration

Nginx is already installed. Add server blocks for the new subdomains.

```nginx
# /etc/nginx/sites-available/bettertins-app
server {
    listen 80;
    server_name app.yourdomain.com;
    
    location / {
        proxy_pass http://10.194.250.35:3001;  # or serve static files
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# /etc/nginx/sites-available/bettertins-api
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://10.194.250.35:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# /etc/nginx/sites-available/bettertins-s3
server {
    listen 80;
    server_name s3.yourdomain.com;
    client_max_body_size 50G;
    
    location / {
        proxy_pass http://10.194.250.31:9000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
```bash
# Enable sites and get SSL
sudo ln -s /etc/nginx/sites-available/bettertins-* /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get Let's Encrypt certificates
sudo certbot --nginx -d app.yourdomain.com -d api.yourdomain.com -d s3.yourdomain.com
```

### Step 5: Database Migration

Run Drizzle migrations from nodeint.

```bash
# SSH to nodeint
cd /home/deploy/better-t-ins
bun run db:push
```

### Step 6: Create MinIO Bucket

```bash
# On nodeint or via MinIO console
# Access MinIO console: http://10.194.250.31:9001
# Login with minioadmin / YOUR_MINIO_SECRET
# Create bucket named "bettertins"
```

## Internet Access Workaround

Since only `phpint` has internet access, use one of these methods for other servers:

**Option A: HTTP Proxy via phpint**

```bash
# On phpint, install squid
sudo apt install squid
# Configure /etc/squid/squid.conf to allow 10.194.250.0/24

# On other servers, set proxy
export http_proxy=http://10.194.250.33:3128
export https_proxy=http://10.194.250.33:3128
```

**Option B: Download and SCP**

```bash
# Download on phpint, then SCP to target server
# For Docker: download .deb packages
# For Bun: download binary and transfer
```

## Security Considerations

- MySQL and MinIO only accessible via private network (10.194.250.0/24)
- SSL termination at nginx gateway (phpint)
- PM2 runs server as non-root user
- MinIO credentials stored securely in .env