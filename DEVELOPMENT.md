# 🚀 HumanLenk Development Guide

## **BEST PRACTICE: Run Separately!**

### **Option 1: Separate Terminals (RECOMMENDED)**
```bash
# Terminal 1 - Backend
yarn dev:backend

# Terminal 2 - Frontend  
yarn dev:frontend
```

### **Option 2: Using Scripts**
```bash
# Backend only
./scripts/dev-backend.sh

# Frontend only
./scripts/dev-frontend.sh
```

## **✅ Benefits of Running Separately:**

- **🔥 Instant Hot Reload** - Changes reflect immediately
- **🚫 No Cache Conflicts** - Each service runs independently  
- **🐛 Better Debugging** - Clean logs per service
- **⚡ Faster Restarts** - Restart just one service if needed
- **🎯 Pure Experience** - No Turbo/monorepo interference

## **🌐 Development URLs:**
- **Frontend**: http://localhost:4000
- **Backend**: http://localhost:5000
- **Backend Health**: http://localhost:5000/health

## **🧹 If You Need to Clean Cache:**
```bash
yarn dev:clean  # Clears all caches and restarts
```

## **🛑 Emergency Reset:**
```bash
# Kill all processes
pkill -f "yarn dev" && pkill -f "turbo" && pkill -f "tsx" && pkill -f "next"

# Clear ports
lsof -ti:4000,5000 | xargs kill -9 2>/dev/null || true

# Clear caches
rm -rf apps/frontend/.next .turbo node_modules/.cache

# Start fresh
yarn dev:backend & yarn dev:frontend
```

---

**💡 Pro Tip**: With separate terminals, you can see exactly what each service is doing and restart them independently. No more cache nightmares! 🎯


