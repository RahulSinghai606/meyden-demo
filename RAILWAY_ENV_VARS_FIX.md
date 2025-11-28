# 🛠️ Fixing Railway Deployment: Environment Variables

The deployment failed because the backend is missing required configuration. Follow these steps to fix it.

## 1. Open Railway Dashboard
Go to your project in [Railway](https://railway.app) and select the **backend** service.

## 2. Go to "Variables" Tab
Click on the **Variables** tab to add the missing keys.

## 3. Add the Following Variables

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | **Critical**. Tells the app it's in production mode. |
| `JWT_SECRET` | *(See below)* | Secret key for signing authentication tokens. |
| `JWT_EXPIRES_IN` | `7d` | Token expiration time. |
| `CORS_ORIGIN` | `https://your-frontend-url.vercel.app` | **Update this** with your actual Vercel frontend URL. |

### 🔐 Generating a JWT Secret
You can generate a secure secret by running this command in your terminal:
```bash
openssl rand -hex 32
```
Copy the output and paste it as the value for `JWT_SECRET`.

## 4. Check Database Connection
If you added a PostgreSQL database in Railway, the `DATABASE_URL` should be set automatically.
- Look for `DATABASE_URL` in the Variables list.
- **If it's missing:** You need to add a PostgreSQL service to your Railway project.
  - Click "New" -> "Database" -> "Add PostgreSQL".
  - Railway will automatically link it and set the variable.

## 5. Redeploy
Once the variables are added, Railway usually redeploys automatically. If not:
- Click **Deployments** tab.
- Click **Redeploy** on the latest commit.

## 6. Verify
Watch the deployment logs. You should see:
- `INFO: Database connected successfully`
- `INFO: Server running on port ...`
