# Helen ADHD Support - Railway Deployment Guide

## Pre-Deployment Checklist

### 1. **Environment Variables**
Make sure to set these in Railway's environment variables:
- `VITE_GEMINI_API_KEY` - Required for AI functionality
- `VITE_CLERK_PUBLISHABLE_KEY` - Optional, for authentication
- `PORT` - Railway will set this automatically

### 2. **Build Configuration**
✅ **package.json** configured with:
- `build` script for production build
- `start` script that runs `preview`
- `preview` script with PORT binding

✅ **vite.config.ts** configured with:
- Dynamic PORT binding
- Host set to true for Railway

### 3. **Dependencies**
✅ All dependencies are production-ready
⚠️ **Note**: Monitor `@clerk/clerk-react` for React 19 compatibility updates

### 4. **File Structure**
✅ All necessary files in place:
- `.gitignore` - Excludes node_modules, dist, env files
- `railway.json` - Railway-specific configuration
- `vite.config.ts` - Build configuration
- `package.json` - Dependencies and scripts

## Deployment Steps

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Helen ADHD Support App"
   ```

2. **Create GitHub Repository**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/helen-adhd-support.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy to Railway**:
   - Go to [Railway](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect the Vite app

4. **Configure Environment Variables** in Railway:
   - Go to your project settings
   - Click on "Variables"
   - Add:
     ```
     VITE_GEMINI_API_KEY=your_actual_api_key_here
     ```

5. **Custom Domain** (Optional):
   - In Railway project settings
   - Go to "Settings" → "Domains"
   - Add your custom domain

## Post-Deployment Verification

1. **Check Build Logs**:
   - Ensure `npm install` completes
   - Verify `npm run build` creates dist folder
   - Confirm `npm start` launches preview server

2. **Test Core Features**:
   - User onboarding flow
   - AI chat functionality
   - Memory creation
   - All intervention modes (breathing, grounding, etc.)

3. **Monitor for Errors**:
   - Check Railway logs for runtime errors
   - Test RSD pattern recognition
   - Verify local storage functionality

## Troubleshooting

### Common Issues:

1. **Port Binding Error**:
   - Railway sets PORT automatically
   - Our config uses `${PORT:-4173}` as fallback

2. **Build Failures**:
   - Check Node version compatibility
   - Verify all dependencies installed
   - Look for TypeScript errors

3. **Environment Variables Not Working**:
   - Ensure variables start with `VITE_`
   - Restart deployment after adding variables
   - Check for typos in variable names

4. **Blank Page After Deploy**:
   - Check browser console for errors
   - Verify all routes work correctly
   - Ensure assets are served properly

## Performance Optimization

1. **Enable Caching**:
   - Static assets are automatically cached
   - Consider CDN for global performance

2. **Monitor Memory Usage**:
   - Railway provides metrics
   - Our app uses local storage (no database)
   - WebGL orb effect is optimized

3. **Scale as Needed**:
   - Start with 1 replica
   - Monitor usage patterns
   - Scale horizontally if needed

## Security Considerations

1. **API Keys**:
   - Never commit API keys to Git
   - Use Railway's environment variables
   - Rotate keys regularly

2. **Local Storage**:
   - User data encrypted in browser
   - No server-side storage
   - Privacy-first approach

3. **HTTPS**:
   - Railway provides SSL automatically
   - Enforced for all domains

## Support

- **Railway Documentation**: https://docs.railway.app
- **Vite Deployment Guide**: https://vitejs.dev/guide/static-deploy
- **React 19 Migration**: https://react.dev/blog/2024/04/25/react-19-upgrade-guide
