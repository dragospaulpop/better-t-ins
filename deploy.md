# Deployment Instructions

This guide outlines how to deploy the **tud-box** application across your VPS infrastructure.

## Infrastructure Overview

| Hostname | Role | Private IP | Services |
|----------|------|------------|----------|
| `phpint` | Nginx Gateway (Public) | 10.194.250.33 | Nginx, Certbot |
| `nodeint` | App Server (Private) | 10.194.250.35 | Bun, PM2, API + Web |
| `filesint` | Storage (Private) | 10.194.250.31 | Docker, MinIO |
| `mysqlint` | Database (Private) | 10.194.250.30 | MySQL 8.0+ |

**Networking Note:**
- All servers have internet access (outbound).
- Only `phpint` allows inbound traffic on ports 80/443.
- Internal communication happens on the `10.194.250.0/24` subnet.

---

## Step 1: Database Setup (`mysqlint`)

SSH into `mysqlint` (10.194.250.30) and create the database and user.

```bash
mysql -u root -p
```

Execute the following SQL commands:

```sql
CREATE DATABASE tudbox CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Replace 'YOUR_SECURE_PASSWORD' with a strong password
CREATE USER 'tudbox_user'@'10.194.250.%' IDENTIFIED BY 'YOUR_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON tudbox.* TO 'tudbox_user'@'10.194.250.%';
FLUSH PRIVILEGES;
EXIT;
```

---

## Step 2: Storage Setup (`filesint`)

SSH into `filesint` (10.194.250.31).

1.  **Install Docker:**

    ```bash
    # Add Docker's official GPG key:
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    # Add the repository to Apt sources:
    echo \
      "deb [arch=\"$(dpkg --print-architecture)\" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      \"$(. /etc/os-release && echo "$VERSION_CODENAME")\" stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    ```

2.  **Run MinIO:**

    ```bash
    # Create persistent data directory
    sudo mkdir -p /data/minio

    # Run MinIO (Replace 'YOUR_MINIO_SECRET' with a strong secret)
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

---

## Step 3: Application Server Setup (`nodeint`)

SSH into `nodeint` (10.194.250.35).

1.  **Install Bun:**

    ```bash
    curl -fsSL https://bun.sh/install | bash
    source ~/.bashrc
    ```

2.  **Clone and Build:**

    ```bash
    # Navigate to your deployment directory (e.g., /home/deploy)
    git clone <your-repo-url> tud-box
    cd tud-box

    # Install dependencies and build
    bun install
    bun run build
    ```

3.  **Configure Environment Variables:**

    Create a `.env` file in `apps/server/.env`:

    ```env
    # Database
    DATABASE_URL=mysql://tudbox_user:YOUR_SECURE_PASSWORD@10.194.250.30:3306/tudbox

    # App Config
    NODE_ENV=production
    CORS_ORIGIN=https://app.yourdomain.com
    DOMAIN=yourdomain.com
    FRONTEND_URL=https://app.yourdomain.com
    APP_NAME=tud-box

    # Security
    RECAPTCHA_SECRET_KEY=your_recaptcha_key
    ARCJET_KEY=your_arcjet_key

    # Storage (Internal IP)
    MINIO_CLIENT_REGION=us-east-1
    MINIO_CLIENT_ENDPOINT=10.194.250.31
    MINIO_CLIENT_PORT=9000
    MINIO_CLIENT_USE_SSL=false
    MINIO_CLIENT_ACCESS_KEY=minioadmin
    MINIO_CLIENT_SECRET_KEY=YOUR_MINIO_SECRET
    MINIO_CLIENT_BUCKET_NAME=tudbox

    # Mail (Resend)
    RESEND_API_KEY=your_resend_api_key
    FROM_EMAIL=noreply@yourdomain.com
    ```

4.  **Run Database Migrations:**

    ```bash
    bun run db:push
    ```

5.  **Start with PM2:**

    We use the `ecosystem.config.cjs` file in the root of the project.

    ```bash
    # Start the apps
    pm2 start ecosystem.config.cjs

    # Save the list to respawn on reboot
    pm2 save
    ```

---

## Step 4: Nginx Gateway Setup (`phpint`)

SSH into `phpint` (10.194.250.33).

1.  **Configure Nginx:**

    Create three new configuration files in `/etc/nginx/sites-available/`:

    **File:** `/etc/nginx/sites-available/tudbox-app`
    ```nginx
    # /etc/nginx/sites-available/tudbox-app
    server {
        server_name app.yourdomain.com;
        root /var/www/tudbox-web/dist;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;  # SPA fallback
        }

        # Static asset caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    ```

    **File:** `/etc/nginx/sites-available/tudbox-api`
    ```nginx
    server {
        server_name api.yourdomain.com;

        location / {
            # Proxy to the Hono API server running on nodeint
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
    ```

    **File:** `/etc/nginx/sites-available/tudbox-s3`
    ```nginx
    server {
        server_name s3.yourdomain.com;
        client_max_body_size 50G; # Allow large uploads

        location / {
            # Proxy to MinIO API on filesint
            proxy_pass http://10.194.250.31:9000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    ```

2.  **Enable Sites and SSL:**

    ```bash
    sudo ln -s /etc/nginx/sites-available/tudbox-* /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx

    # Obtain certificates
    sudo certbot --nginx -d app.yourdomain.com -d api.yourdomain.com -d s3.yourdomain.com
    ```

---

## Step 5: Final Configuration

1.  **Create MinIO Bucket:**
    - Access the MinIO Console at `http://10.194.250.31:9001` (You might need an SSH tunnel to access this: `ssh -L 9001:localhost:9001 deploy@10.194.250.31`).
    - Login with the credentials set in Step 2.
    - Create a bucket named `tudbox`.
    - Go to "Identity" -> "Users" and create access keys if you don't want to use root credentials in the app (Recommended). Update `apps/server/.env` with these new keys.

2.  **Verify Deployment:**
    - Visit `https://app.yourdomain.com` -> Should load the web app.
    - Visit `https://api.yourdomain.com/health` (or root) -> Should return OK.

