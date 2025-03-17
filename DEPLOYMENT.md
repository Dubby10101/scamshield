# ScamShield Deployment Guide

This guide will help you deploy the ScamShield application using Netlify for the frontend and Railway for the backend.

## Frontend Deployment (Netlify)

1. **Create a Netlify Account**
   - Sign up at [Netlify.com](https://netlify.com)

2. **Connect Your GitHub Repository**
   - Click "New site from Git"
   - Choose GitHub and authorize Netlify
   - Select your ScamShield repository

3. **Configure Build Settings**
   - Set build command: `cd frontend && npm install && npm run build`
   - Set publish directory: `frontend/dist`

4. **Set Environment Variables**
   - Go to Site settings > Build & deploy > Environment
   - Add environment variable: `VITE_API_URL` with the value of your Railway backend URL (you'll get this after deploying the backend)

5. **Deploy Your Site**
   - Click "Deploy site"
   - Netlify will build and deploy your frontend

## Backend Deployment (Railway)

1. **Create a Railway Account**
   - Sign up at [Railway.app](https://railway.app)
   - You'll get $5 of free credits monthly

2. **Create a New Project**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your ScamShield repository

3. **Configure the Service**
   - Railway should automatically detect your Python application
   - If not, manually set:
     - Runtime: Python
     - Build Command: `cd backend && pip install -r requirements.txt`
     - Start Command: `cd backend && gunicorn run:app`

4. **Set Environment Variables**
   - Go to your project's Variables tab
   - Add the following variables:
     - `DEEPSEEK_API_KEY=sk-283d2bc0283e46aab8a42b31037a9d87`
     - `PORT=8080` (Railway uses this by default)
     - `SECRET_KEY=your-secure-secret-key` (generate a random string)

5. **Deploy Your Backend**
   - Railway will automatically deploy your application
   - Once deployed, you'll get a URL like `https://scamshield-production.up.railway.app`

## Connect Frontend to Backend

1. **Update Netlify Environment Variable**
   - Go back to your Netlify site settings
   - Update the `VITE_API_URL` environment variable with your Railway URL
   - Trigger a new deployment in Netlify

2. **Test Your Application**
   - Visit your Netlify URL to test the full application
   - Make sure the URL analysis feature works correctly

## Troubleshooting

- **CORS Issues**: If you encounter CORS errors, double-check the CORS configuration in both app.py and run.py
- **Database Errors**: Railway uses an ephemeral filesystem. For persistent data, consider adding a PostgreSQL database service
- **API Connection Issues**: Make sure your frontend is correctly using the environment variable for the API URL

## Maintenance

- Railway free tier gives you $5 of credits monthly
- To stay within the free tier, you might need to pause your service when not in use
- Netlify's free tier has no time limits for static site hosting
