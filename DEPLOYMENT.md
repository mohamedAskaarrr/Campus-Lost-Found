# 🚀 Deployment Guide - Railway.app

This guide walks you through deploying the Campus Lost & Found app to **Railway.app** - a modern hosting platform that's perfect for Python Flask applications.

---

## 📋 Prerequisites

Before you start, make sure you have:
- ✅ A GitHub account (free at https://github.com)
- ✅ A Railway account (free tier at https://railway.app)
- ✅ Git installed on your computer
- ✅ Your project pushed to GitHub

---

## 🔧 Step 1: Prepare Your Repository

### Option A: If using Git (Recommended)
```bash
# Initialize git (if not already done)
cd campus-lost-and-found
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Campus Lost & Found with deployment files"

# Add GitHub remote (replace YOUR_USERNAME and YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### Option B: Push to GitHub using GitHub Desktop
1. Download GitHub Desktop (https://desktop.github.com)
2. Login with your GitHub account
3. Click "Add" → "Create New Repository"
4. Choose your local folder
5. Click "Publish Repository"

---

## 🚂 Step 2: Deploy on Railway

### Method 1: Railway CLI (Fastest)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli
# Or download from: https://docs.railway.app/guides/cli

# 2. Login to Railway
railway login

# 3. Create new project
railway init

# 4. Deploy
railway up
```

### Method 2: Railway Dashboard (Easiest)

1. **Go to** https://railway.app/dashboard
2. **Sign up** with GitHub (one-click authentication)
3. **Click** "+ New Project"
4. **Select** "Deploy from GitHub repo"
5. **Connect** your GitHub account
6. **Choose** your Campus Lost & Found repository
7. **Railway auto-detects** Python and Flask
8. **Wait** for deployment (2-3 minutes)

---

## ⚙️ Step 3: Configure Environment Variables

After deployment, set environment variables in Railway Dashboard:

1. Go to your project → **Variables**
2. Add these variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `FLASK_ENV` | `production` | Disables debug mode |
| `PORT` | (auto-set by Railway) | Leave empty |

---

## ✅ Step 4: Test Your Deployment

Once Railway shows **"Success"** in the deployment logs:

1. **Get your URL**: Click "Settings" → Copy your domain (e.g., `https://your-app-name.railway.app`)
2. **Test in browser**: Visit `https://your-app-name.railway.app`
3. **Try the app**:
   - Submit a test report
   - Search for matches
   - Browse records

---

## 📊 File Structure (Railway Ready)

Your repository should have:

```
campus-lost-and-found/
├── app.py                      ✅ Updated for production
├── index.html                  ✅ Updated API URL
├── requirements.txt            ✅ Dependencies listed
├── Procfile                    ✅ Railway instructions
├── lost_items.csv              ✅ Sample data
├── found_items.csv             ✅ Sample data
├── classifier_training_data.csv ✅ ML training data
├── README.md                   ✅ Documentation
└── DEPLOYMENT.md               ✅ This file
```

---

## 🔍 Check Deployment Status

### In Railway Dashboard:
1. Go to **Deployments** tab
2. Watch the build progress
3. Check **Logs** for any errors

### Common Log Messages:
- ✅ `INFO: App started` = Success
- ✅ `Running on 0.0.0.0:PORT` = Ready
- ❌ `ModuleNotFoundError` = Missing dependency
- ❌ `FileNotFoundError` = Missing CSV files

---

## 🆘 Troubleshooting

### Build Fails: "ModuleNotFoundError: No module named..."

**Solution**: Add missing package to `requirements.txt`
```bash
pip freeze > requirements.txt
git add requirements.txt
git commit -m "Update requirements"
git push
# Railway will auto-redeploy
```

### App Crashes: "No such file or directory"

**Reason**: CSV files not found
**Solution**: 
- Ensure all `.csv` files are in the root directory
- Upload files to GitHub (not in .gitignore)
- Verify with: `git ls-files | grep .csv`

### API Returns 404 Errors

**Reason**: Frontend API URL misconfigured
**Solution**: Check `index.html` line 1025 uses:
```javascript
const API = `${window.location.origin}/api`;
```

### App Loads But "Server Unreachable"

**Reason**: Backend not responding
**Solution**: Check Railway logs for Python errors
```
1. Click Deployments
2. View latest logs
3. Look for errors in app.py
```

### Data Not Persisting After Restart

⚠️ **Note**: Railway ephemeral filesystem means CSV data resets on redeploy
**Solution**: Add a database
- Upgrade to PostgreSQL (Railway → Add Service)
- Modify `app.py` to use SQLAlchemy
- Contact support if data persistence needed

---

## 📈 Monitoring & Logs

### View Logs in Railway:
1. Dashboard → Your Project
2. Click **Deployments**
3. Select latest deployment
4. Scroll to see **Build & Runtime Logs**

### Monitor Metrics:
- **CPU Usage**: Should be < 5% idle
- **Memory**: < 256MB typical
- **Network**: Minimal unless heavy traffic

---

## 🔐 Security Best Practices

✅ Done automatically:
- HTTPS enabled (Railway provides SSL cert)
- Environment variables not in code
- CORS configured for safe access

⚠️ Consider adding:
- Rate limiting (for spam prevention)
- Input validation (already in `app.py`)
- Authentication (for report verification)

---

## 🎯 Next Steps

After successful deployment:

1. **Share your app**: Send the URL to campus
   ```
   Example: https://campus-lost-found.railway.app
   ```

2. **Add database** (optional but recommended):
   ```
   Railway Dashboard → Add Service → PostgreSQL
   ```

3. **Set up auto-deployments**:
   - Railway auto-deploys on GitHub push
   - No manual restart needed!

4. **Monitor performance**:
   - Check Railway Dashboard metrics weekly
   - Upgrade if needed (paid plans available)

---

## 💰 Pricing & Limits

**Railway Free Tier:**
- ✅ $5 free credit monthly
- ✅ Up to 100 deployments
- ✅ Automatic shutdown if inactive 7+ days
- ✅ 512MB RAM (typical usage)

**Paid Plans:**
- Usage-based pricing
- No credit card required to start
- Auto-upgrade if you exceed free tier

---

## 📞 Support

### Railway Documentation:
- https://docs.railway.app
- https://docs.railway.app/guides/flask

### Common Issues:
- [Deploy from GitHub](https://docs.railway.app/guides/github)
- [Environment Variables](https://docs.railway.app/develop/variables)
- [Logs & Debugging](https://docs.railway.app/develop/logs)

---

## ✨ Deployment Checklist

- [ ] All files pushed to GitHub
- [ ] `requirements.txt` includes all packages
- [ ] `Procfile` exists and correct
- [ ] `app.py` updated for production
- [ ] `index.html` uses relative API URL
- [ ] Railway project created
- [ ] Auto-deploy from GitHub enabled
- [ ] Environment variables set
- [ ] Deployment successful (no errors)
- [ ] App loads in browser
- [ ] API endpoints working
- [ ] Data persisting (CSV files)

---

<div align="center">

**🎉 Your app is live! Share your deployment URL**

For example: `https://your-app-name.railway.app`

---

*Last Updated: April 2026*

</div>
