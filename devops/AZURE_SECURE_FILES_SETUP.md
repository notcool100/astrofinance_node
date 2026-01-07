# Azure DevOps Secure Files Setup Guide

This guide explains how to configure secure .env files in Azure DevOps Library for the AstroFinance deployment pipeline.

## Overview

The Azure pipeline uses secure files stored in Azure DevOps Library to manage sensitive environment variables for both frontend and backend applications. This approach keeps secrets out of your repository while enabling automated deployments.

## Prerequisites

- Azure DevOps project access with permissions to manage Library
- Pipeline permissions to access secure files
- Your .env files ready for upload

## Step 1: Upload Secure Files to Azure DevOps Library

### 1.1 Navigate to Library

1. Open your Azure DevOps project
2. Go to **Pipelines** → **Library**
3. Click on **Secure files** tab

### 1.2 Upload Backend .env File

1. Click **+ Secure file** button
2. Click **Browse** and select your backend `.env` file
3. **Important**: Name it exactly **`backend-dev.env`** when uploading
4. Click **OK** to upload

**Required variables in backend-dev.env**:
```env
JWT_SECRET=super_secret_key_change_this
NODE_ENV=development
PORT=5500
DATABASE_URL="postgresql://username:password@host:5432/database_name?schema=public"
```

### 1.3 Upload Frontend .env File

1. Click **+ Secure file** button again
2. Click **Browse** and select your frontend `.env` file
3. **Important**: Name it exactly **`frontend-dev.env`** when uploading
4. Click **OK** to upload

**Required variables in frontend-dev.env**:
```env
NEXT_PUBLIC_API_URL=http://82.180.144.91:4000/api
NEXT_PUBLIC_APP_NAME=AstroFinance
```

> [!IMPORTANT]
> Make sure `NEXT_PUBLIC_API_URL` points to your server IP with port 4000, which is where nginx will serve the backend API.

## Step 2: Grant Pipeline Access to Secure Files

### 2.1 Configure Permissions for Backend .env

1. In the **Secure files** list, click on **backend-dev.env**
2. Click the **Pipeline permissions** tab
3. Click **+** button
4. Select your pipeline (e.g., "astrofinance_node")
5. Click **Create**

### 2.2 Configure Permissions for Frontend .env

1. Click on **frontend-dev.env**
2. Click the **Pipeline permissions** tab
3. Click **+** button
4. Select your pipeline
5. Click **Create**

## Step 3: Verify Secure Files Configuration

1. Go back to **Library** → **Secure files**
2. Verify both files are listed:
   - ✅ `backend-dev.env`
   - ✅ `frontend-dev.env`
3. Both should show your pipeline in the "Authorized for use in" column

## Step 4: Initial Server Setup

Before running the pipeline for the first time, ensure these directories exist on your server:

```bash
# SSH to your server
ssh root@82.180.144.91

# Create deployment directories
mkdir -p /var/www/astrofinance/frontend-dev
mkdir -p /var/www/astrofinance/backend-dev

# Set proper ownership (assuming astroagent is the deployment user)
chown -R astroagent:astroagent /var/www/astrofinance

# Create nginx log directory if it doesn't exist
mkdir -p /var/log/nginx
```

## Step 5: Configure Nginx Sudoers Permissions

The pipeline needs to deploy nginx configuration. Grant the deployment user sudo access for nginx commands:

```bash
# Edit sudoers file
sudo visudo

# Add this line at the end (replace 'astroagent' with your deployment user):
astroagent ALL=(ALL) NOPASSWD: /usr/bin/cp * /etc/nginx/sites-available/*, /bin/ln -s /etc/nginx/sites-available/* /etc/nginx/sites-enabled/*, /usr/sbin/nginx -t, /bin/systemctl reload nginx
```

> [!CAUTION]
> Be careful when editing sudoers file. Syntax errors can lock you out of sudo access.

## Step 6: Test the Pipeline

1. Commit and push your changes to the `develop` branch
2. The pipeline should automatically trigger
3. Monitor the pipeline run:
   - Verify "Download Frontend .env File" step succeeds
   - Verify "Download Backend .env File" step succeeds
   - Verify "Deploy and Reload Nginx Configuration" step succeeds

## Verification Steps

After a successful deployment, verify everything is working:

### 1. Check .env Files on Server

```bash
# SSH to server
ssh root@82.180.144.91

# Verify backend .env exists
cat /var/www/astrofinance/backend-dev/.env

# Verify frontend .env exists
cat /var/www/astrofinance/frontend-dev/.env.local
```

### 2. Check Nginx Configuration

```bash
# Verify nginx configuration
sudo nginx -t

# Check if site is enabled
ls -la /etc/nginx/sites-enabled/ | grep astrofinance

# Test nginx is listening on port 4000
sudo netstat -tlnp | grep 4000
```

### 3. Test API Through Nginx

```bash
# Test health endpoint
curl http://localhost:4000/health

# Test API endpoint (adjust based on your API)
curl http://localhost:4000/api/health
```

## Troubleshooting

### Pipeline fails with "Secure file not found"

**Solution**: Verify the secure file name exactly matches `backend-dev.env` or `frontend-dev.env` in Azure DevOps Library.

### Pipeline fails with "Pipeline permissions not granted"

**Solution**: Go to Library → Secure files → Click on the file → Pipeline permissions → Grant access to your pipeline.

### Nginx fails to reload

**Solution**: 
1. Check nginx syntax: `sudo nginx -t`
2. Review nginx error logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify nginx configuration file: `sudo cat /etc/nginx/sites-available/astrofinance-backend-dev`

### Backend API not accessible on port 4000

**Solution**:
1. Verify nginx is running: `sudo systemctl status nginx`
2. Check if port 4000 is listening: `sudo netstat -tlnp | grep 4000`
3. Verify backend is running on port 5500: `sudo netstat -tlnp | grep 5500`
4. Check firewall rules: `sudo ufw status`

## Production Environment Setup

To set up the production environment, repeat these steps with production-specific files:

1. Upload **`backend-live.env`** with production environment variables
2. Upload **`frontend-live.env`** with production API URL
3. Grant pipeline permissions to both files
4. Create production directories: `/var/www/astrofinance/backend-live` and `/var/www/astrofinance/frontend-live`

The nginx configuration for production will use port 4001 (see `devops/infrastructure/nginx-backend-live.conf`).

## Security Best Practices

1. ✅ **Never commit .env files to the repository**
2. ✅ **Use different secrets for development and production**
3. ✅ **Regularly rotate sensitive credentials (JWT_SECRET, database passwords)**
4. ✅ **Limit Azure DevOps Library access to authorized personnel only**
5. ✅ **Set secure file permissions (600) on deployed .env files**
6. ✅ **Use SSL/TLS certificates for production deployments**

## Additional Resources

- [Azure DevOps Secure Files Documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/library/secure-files)
- [Nginx Reverse Proxy Configuration](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
