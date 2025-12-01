# 🌱 Seeding Your Railway Database

The "401 Unauthorized" error happens because your production database is empty—it doesn't have the user accounts or vendor data yet.

You can populate it with your demo data (vendors, users, etc.) by running the seed script directly on Railway.

## Option 1: Run via Railway Dashboard (Easiest)

1.  Go to your **Railway Dashboard**.
2.  Click on your **backend service** (`meyden-demo`).
3.  Go to the **Settings** tab.
4.  Scroll down to **Deploy** -> **Custom Start Command**.
5.  Temporarily change the start command to:
    ```bash
    npm run db:migrate:deploy && npm run db:seed && node dist/server.js
    ```
6.  **Redeploy** the service.
7.  **Watch the logs**. You should see:
    - `🌱 Starting database seeding...`
    - `🎉 Seeding completed!`
    - `🚀 Meyden Backend Server Started!`
8.  **Important:** Once seeded, change the Start Command back to just:
    ```bash
    node dist/server.js
    ```
    (Otherwise, it will reset your data on every deploy!)

## Option 2: Run via CLI (If you have it installed)

If you have the Railway CLI installed and linked:

```bash
railway run npm run db:migrate:deploy
railway run npm run db:seed
```

## 🔑 Demo Credentials (Created by Seed)

Once seeded, you can login with:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@meyden.com` | `admin123` |
| **Vendor** | `vendor@meyden.com` | `vendor123` |
| **User** | `user@meyden.com` | `user123` |
