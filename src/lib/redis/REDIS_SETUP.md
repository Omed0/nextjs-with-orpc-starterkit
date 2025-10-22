# Redis Integration - Quick Start Guide

## 🚀 What's Been Added

A complete Redis integration has been added to your nextjs-kit-with-orpc project with:

1. **Docker Compose Configuration** - Redis 7 Alpine with persistence
2. **Redis Client** - Singleton connection manager with auto-reconnect
3. **Cache Manager** - Namespaced key-value storage with TTL

## 📦 Installation

Packages installed:
- `ioredis@5.8.1` - Modern Redis client
- `@types/ioredis@5.0.0` - TypeScript definitions

## 🔧 Setup Steps

### 1. Add Environment Variables

Add to your `.env` file:

```env
# Redis Configuration
REDIS_HOST=kubernetes.docker.internal
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_password_here
```

### 2. Start Redis with Docker

```bash
bun run docker:up
```

This starts:
- PostgreSQL (existing)
- MinIO (existing)
- **Redis** (new!) on port 6379


## 📁 Files Created

```
src/lib/redis/
├── index.ts              # Main exports
├── client.ts             # Redis connection manager
├── cache.ts              # Cache utilities
├── health.ts             # Health checks
└── REDIS_SETUP.md             # Full documentation

docker-compose.yml        # Updated with Redis service
```

## 🎯 Quick Usage Examples

### Caching

```typescript
import { cache } from '@/lib/redis';

// Set cache with 1 hour TTL
await cache.set('user:123', { name: 'John' }, 3600);

// Get from cache
const user = await cache.get('user:123');

// Get or fetch if not cached
const data = await cache.getOrSet('key', async () => {
  return await fetchFromDB();
}, 3600);
```


## 🎨 Docker Redis Features

The Redis service includes:

✅ **Redis 7 Alpine** - Latest stable, lightweight image  
✅ **Password Protection** - Secure by default  
✅ **Data Persistence** - AOF enabled, volume mounted  
✅ **Health Checks** - Automatic monitoring  
✅ **Memory Management** - 256MB limit with LRU eviction  
✅ **Auto-restart** - Restarts on failure  

## 🔍 Redis Client Features

### Connection Management
- Singleton pattern (reuses connection)
- Automatic reconnection on failure
- Exponential backoff retry strategy
- Connection status monitoring
- Graceful shutdown support

### Cache Manager
- Namespaced keys (avoid conflicts)
- TTL support (automatic expiration)
- JSON serialization (store objects)
- Batch operations (set/get many)
- Pattern matching (wildcards)
- Increment/decrement counters

### Health Checks
- Connection status
- Response latency
- Server statistics
- Memory usage
- Connected clients
- Uptime information

## 📚 Documentation

Full documentation available at:
- `src/lib/redis/REDIS_SETUP.md` - Comprehensive guide with examples


## 🔐 Security Notes

1. **Always use a password** in production
2. **Don't expose port 6379** publicly
3. **Use environment variables** for credentials
4. **Enable SSL/TLS** for remote connections
5. **Monitor memory usage** regularly
6. **Set appropriate TTLs** to prevent memory bloat

## 🎓 Next Steps

1. Add Redis environment variables to your `.env` file
2. Start Docker containers with `bun run docker:up`
3. Import and use Redis utilities in your routes
4. Implement caching for expensive database queries
5. Add rate limiting to public endpoints
6. Use sessions for user authentication state

---

**Ready to use!** 🎉 Your Redis integration is fully configured and ready for development.
