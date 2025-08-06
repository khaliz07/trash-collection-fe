# Quick Fix Script for TypeScript Errors

## Installation Commands
```bash
# Install missing types
npm install --save-dev @types/node-cron @types/multer

# Add to package.json scripts if not present
npm pkg set scripts.build="tsc"
npm pkg set scripts.dev="nodemon --exec ts-node src/server.ts"
npm pkg set scripts.start="node dist/server.js"
```

## Environment Setup (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/trash_collection"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"
JWT_REFRESH_SECRET="your-refresh-secret-key-also-long-and-random"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Email (Gmail example)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-specific-password"

# Payment
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
VNPAY_TMN_CODE="your_vnpay_tmn_code"
VNPAY_HASH_SECRET="your_vnpay_hash_secret"

# Frontend
FRONTEND_URL="http://localhost:3000"

# Server
PORT=5000
NODE_ENV="development"
```

## Database Setup Commands
```bash
# Install PostgreSQL and PostGIS
sudo apt update
sudo apt install postgresql postgresql-contrib postgis postgresql-14-postgis-3

# Create database and user
sudo -u postgres createuser --interactive
sudo -u postgres createdb trash_collection

# Connect to database and enable PostGIS
sudo -u postgres psql -d trash_collection -c "CREATE EXTENSION postgis;"

# Generate and run Prisma migrations
npx prisma migrate dev --name init
npx prisma generate
```

## Redis Setup
```bash
# Install Redis
sudo apt install redis-server

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test Redis
redis-cli ping
```

## Quick Development Start
```bash
# 1. Clone and setup
cd /home/songiang/Projects/trash_collection/fe_5/backend

# 2. Install dependencies (already done)
# npm install

# 3. Create .env file with above content
cp .env.example .env
# Edit .env with your values

# 4. Setup database
npx prisma migrate dev
npx prisma generate

# 5. Fix TypeScript errors (see fixes below)
# Apply the code fixes from the next sections

# 6. Start development server
npm run dev
```

## Critical TypeScript Fixes Needed

### 1. Fix JWT Token Generation (src/controllers/auth.controller.ts)
Replace jwt.sign calls with proper typing:
```typescript
const accessToken = jwt.sign(
  payload, 
  config.jwt.secret as string,  // Add type assertion
  { expiresIn: config.jwt.expiresIn as string }
)
```

### 2. Fix Socket.IO Types (src/websocket/index.ts)
Add interface for Socket:
```typescript
interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}
```

### 3. Fix Redis Configuration (src/config/redis.ts)
Update Redis options:
```typescript
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  connectTimeout: 10000,
  commandTimeout: 5000
})
```

### 4. Fix Unused Variables
Add underscore prefix to unused parameters:
```typescript
// Instead of: (req, res, next)
// Use: (_req, res, _next) or (req, _res, next)
```

## Testing the Backend

### 1. Health Check
```bash
curl http://localhost:5000/health
```

### 2. Test Authentication
```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User", 
    "email": "test@example.com",
    "password": "password123",
    "phone": "1234567890"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Test WebSocket Connection
```javascript
// In browser console
const socket = io('http://localhost:5000');
socket.on('connect', () => console.log('Connected to server'));
```

## Integration with Frontend

### 1. Install Frontend Dependencies
```bash
cd /home/songiang/Projects/trash_collection/fe_5
npm install axios socket.io-client leaflet react-leaflet
```

### 2. Create API Client (lib/api.ts)
```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
})

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

### 3. WebSocket Provider (components/SocketProvider.tsx)
```typescript
import { createContext, useContext } from 'react'
import io from 'socket.io-client'

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000')

export const SocketContext = createContext(socket)
export const useSocket = () => useContext(SocketContext)
```

## Production Deployment

### 1. Build and Start
```bash
npm run build
npm start
```

### 2. Docker Setup (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5000
CMD ["npm", "start"]
```

### 3. Process Manager
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/server.js --name "trash-collection-api"
pm2 startup
pm2 save
```

Ready to continue fixing the TypeScript errors and testing the backend!
