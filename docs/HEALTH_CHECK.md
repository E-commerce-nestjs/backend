# Health Check Endpoints

Health check endpoints cho production monitoring và Kubernetes readiness/liveness probes.

## Endpoints

### 1. Full Health Check
```
GET /health
```

**Kiểm tra:**
- ✅ Database (Prisma/PostgreSQL)
- ✅ Redis connection
- ✅ Memory usage (Heap < 300MB)
- ✅ Memory RSS (< 300MB)
- ✅ Disk space (> 50% free)

**Response (200 OK):**
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "redis": {
      "status": "up",
      "message": "Redis is up"
    },
    "memory_heap": {
      "status": "up"
    },
    "memory_rss": {
      "status": "up"
    },
    "disk": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    },
    "redis": {
      "status": "up",
      "message": "Redis is up"
    },
    "memory_heap": {
      "status": "up"
    },
    "memory_rss": {
      "status": "up"
    },
    "disk": {
      "status": "up"
    }
  }
}
```

**Response (503 Service Unavailable):**
```json
{
  "status": "error",
  "info": {
    "database": {
      "status": "up"
    }
  },
  "error": {
    "redis": {
      "status": "down",
      "message": "Redis is down",
      "error": "Connection timeout"
    }
  },
  "details": {
    "database": {
      "status": "up"
    },
    "redis": {
      "status": "down",
      "message": "Redis is down",
      "error": "Connection timeout"
    }
  }
}
```

---

### 2. Readiness Probe
```
GET /health/ready
```

**Kiểm tra critical services only:**
- ✅ Database
- ✅ Redis

**Use case:** Kubernetes readiness probe để check service có sẵn sàng nhận traffic.

**Kubernetes config example:**
```yaml
readinessProbe:
  httpGet:
    path: /api/v1/health/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
  timeoutSeconds: 3
  successThreshold: 1
  failureThreshold: 3
```

---

### 3. Liveness Probe
```
GET /health/live
```

**Kiểm tra:** Service đang running (lightweight check)

**Use case:** Kubernetes liveness probe để restart container nếu service bị hang.

**Kubernetes config example:**
```yaml
livenessProbe:
  httpGet:
    path: /api/v1/health/live
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 3
  successThreshold: 1
  failureThreshold: 3
```

---

## Monitoring Setup

### 1. **Local Development**
```bash
# Check full health
curl http://localhost:3000/api/v1/health

# Check readiness
curl http://localhost:3000/api/v1/health/ready

# Check liveness
curl http://localhost:3000/api/v1/health/live
```

### 2. **Production Monitoring**

Thêm vào monitoring tools (Prometheus, Datadog, etc.):

```bash
# Prometheus scrape config
scrape_configs:
  - job_name: 'nestjs-app'
    metrics_path: '/api/v1/health'
    static_configs:
      - targets: ['app:3000']
```

### 3. **Alerting**

Tạo alerts khi health check fails:

```yaml
# Alert example (Prometheus AlertManager)
groups:
  - name: app_health
    rules:
      - alert: AppUnhealthy
        expr: up{job="nestjs-app"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "App is unhealthy"
          description: "Health check failed for {{ $labels.instance }}"
```

---

## Health Check Thresholds

Có thể customize trong `health.controller.ts`:

```typescript
// Memory heap threshold (default: 300MB)
() => this.memoryHealth.checkHeap('memory_heap', 300 * 1024 * 1024),

// Memory RSS threshold (default: 300MB)
() => this.memoryHealth.checkRSS('memory_rss', 300 * 1024 * 1024),

// Disk space threshold (default: 50% free)
() => this.diskHealth.checkStorage('disk', {
  path: '/',
  thresholdPercent: 0.5,
}),
```

---

## Troubleshooting

### Database health check fails
```bash
# Check database connection
docker exec -it postgres_ecommerce psql -U nguyentuananh -d e_commerce -c "SELECT 1"

# Check database logs
docker logs postgres_ecommerce
```

### Redis health check fails
```bash
# Check Redis connection
docker exec -it redis_data redis-cli ping

# Check Redis logs
docker logs redis_data
```

### Memory health check fails
```bash
# Check Node.js memory usage
curl http://localhost:3000/api/v1/health | jq '.details.memory_heap'

# Increase threshold if needed (in production with more traffic)
```

---

## Best Practices

1. **Separate readiness from liveness**
   - Liveness: Lightweight, chỉ check app đang chạy
   - Readiness: Chi tiết hơn, check dependencies

2. **Set appropriate timeouts**
   - Health check timeout < probe timeout
   - Tránh cascade failures

3. **Don't check external APIs trong health**
   - Chỉ check dependencies bạn control
   - External APIs failures không nên mark app là unhealthy

4. **Monitor trends, not just status**
   - Track response time của health checks
   - Alert khi degradation trend được phát hiện

5. **Test health checks**
   - Simulate failures (stop Redis, DB)
   - Verify alerts work correctly
