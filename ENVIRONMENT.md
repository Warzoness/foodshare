# Environment Variables

## Backend URL Configuration

This project uses environment variables to configure the backend API URL.

### Setup

1. Create a `.env.local` file in the root directory:
```bash
# Backend API URL
BACKEND_URL=https://foodshare-production-98da.up.railway.app
```

2. For production deployment, set the environment variable:
```bash
# Vercel
vercel env add BACKEND_URL

# Railway
railway variables set BACKEND_URL=https://foodshare-production-98da.up.railway.app

# Docker
docker run -e BACKEND_URL=https://foodshare-production-98da.up.railway.app ...
```

### Default Value

If `BACKEND_URL` is not set, the application will use the default value:
`https://foodshare-production-98da.up.railway.app`

### Usage

The backend URL is automatically configured in `apiClient.ts` and used by all services:
- AuthService
- ProductService  
- OrderService
- FeedbackService
- StoreService

### Development

For local development with a different backend:
```bash
# .env.local
BACKEND_URL=http://localhost:8080
```

### Production

For production with a different backend:
```bash
# Set environment variable
BACKEND_URL=https://your-production-backend.com
```
