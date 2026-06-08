# HoloTrack.io Production Cloud Deployment Guide

This guide provides step-by-step instructions for deploying your decoupled full-stack application.

- **Express Backend**: Hosted on **Render** (Free Plan)
- **Next.js Frontend**: Hosted on **Vercel** (Free Plan)
- **Database**: Hosted on **MongoDB Atlas** (Free Cluster)
- **Static Assets (Screenshots)**: Hosted on **Cloudinary** (Free Tier)

---

## 🛠️ Step 1: Push Project to GitHub

Initialize git at the workspace root (`C:\Users\user\.gemini\antigravity\scratch\trainer-tracker-3d`) and push the code to a private or public GitHub repository.

```bash
git init
git add .
git commit -m "feat: prepare production cloud deployment setup"
# Push to your GitHub repository...
```

---

## 💾 Step 2: Set Up MongoDB Atlas

Render's free hosting does not include a database. You must configure a cloud database cluster:

1. Sign up/log in at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new **Shared Cluster** (free tier). Select your preferred cloud provider and region.
3. Under **Database Access**, create a user (e.g. `holotrack_user`) and a secure password.
4. Under **Network Access**, click **Add IP Address** and set it to **`0.0.0.0/0`** (Allow Access from Anywhere). This is necessary because Render's free servers use dynamic IP addresses.
5. In the cluster dashboard, click **Connect** -> **Drivers** -> Copy the connection URI string.
   - Replace `<password>` in the connection string with the database user password you created.
   - *Example URI*: `mongodb+srv://holotrack_user:<password>@cluster0.asmo40p.mongodb.net/holotrack?retryWrites=true&w=majority`

---

## ☁️ Step 3: Set Up Cloudinary (Highly Recommended)

Render's free tier uses **ephemeral storage**. If students upload screenshots locally to `/uploads`, those files will be permanently deleted whenever the container restarts or you re-deploy.

To preserve screenshot proofs:
1. Register for a free account at [Cloudinary](https://cloudinary.com/).
2. On your Cloudinary Dashboard, locate and copy your:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. These credentials will be passed to Render to enable direct secure cloud asset uploads.

---

## ⚙️ Step 4: Deploy the Express Backend on Render

1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Blueprint**.
3. Connect your GitHub account and select your **HoloTrack.io** repository.
4. Render will automatically read the `render.yaml` file at your root directory and prepare the blueprint.
5. Provide the service details and configure the environment variables:
   - `MONGO_URI`: Enter your MongoDB Atlas URI string (from Step 2).
   - `JWT_SECRET`: Enter a long, secure random string (e.g. `f73e5124ae80...`).
   - `GEMINI_API_KEY`: Enter your Google AI Studio API key (to enable HoloBot chat).
   - `CLOUDINARY_CLOUD_NAME`: Enter your Cloudinary Cloud Name.
   - `CLOUDINARY_API_KEY`: Enter your Cloudinary API Key.
   - `CLOUDINARY_API_SECRET`: Enter your Cloudinary API Secret.
6. Click **Approve** to deploy. Once the build finishes, Render will host your backend API at a URL like:
   `https://holotrack-backend.onrender.com`

---

## 💻 Step 5: Deploy the Next.js Frontend on Vercel

1. Log in to the [Vercel Dashboard](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. In the configuration settings:
   - For **Root Directory**, click **Edit** and select the **`frontend`** directory.
   - Expand the **Environment Variables** section.
   - Add the following variable:
     - **Key**: `NEXT_PUBLIC_API_URL`
     - **Value**: Your live Render backend URL with `/api` appended (e.g. `https://holotrack-backend.onrender.com/api`).
5. Click **Deploy**. Vercel will build your Next.js application and host it on a public domain (e.g. `https://holotrack-frontend.vercel.app`).

---

## 🔑 Step 6: Create the Trainer Account in Production

Since public trainer registration is disabled on the portal to prevent students from registering as administrators, you must register the trainer using a secure HTTP call.

Once the backend is live, send a `POST` request to your production URL using `curl`, Postman, or a REST client:

```bash
curl -X POST https://your-backend-live-url.onrender.com/api/auth/register-trainer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vamsi Paidi",
    "email": "vamsi@tracker.com",
    "password": "Tracker@123",
    "code": "holo-admin-secret"
  }'
```

*(If you set a custom `TRAINER_SIGNUP_SECRET` environment variable on Render, replace the `"code": "holo-admin-secret"` value with your custom secret).*

Upon receiving a successful JSON response (`Trainer registered successfully`), your trainer account is fully active in production!
