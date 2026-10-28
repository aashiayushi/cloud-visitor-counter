
const express = require("express");
const { createClient } = require("redis");
const client = require("prom-client");

const app = express();
const PORT = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const redis = createClient({ url: REDIS_URL });

redis.on("error", () => {
  // Avoid logging repeated connection errors.
});

// Collect standard Node.js process metrics.
client.collectDefaultMetrics();

// Count HTTP requests and measure their duration.
const httpRequests = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

const httpDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});

// Record request metrics after each response finishes.
app.use((req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    // Do not include metrics scraping in application request counts.
    if (req.path === "/metrics") return;

    const route = req.route?.path || req.path;
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };

    httpRequests.inc(labels);

    const duration =
      Number(process.hrtime.bigint() - start) / 1e9;
    httpDuration.observe(labels, duration);
  });

  next();
});

app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  } catch {
    res.status(500).send("Unable to collect metrics");
  }
});

app.get("/", async (req, res) => {
  try {
    const count = await redis.incr("visitor-count");

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Cloud Visitor Counter</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 650px;
            margin: 80px auto;
            padding: 24px;
            text-align: center;
            background: #f2f6fc;
            color: #1c2b3a;
          }
          main {
            background: white;
            padding: 35px;
            border-radius: 16px;
            box-shadow: 0 4px 18px #0001;
          }
          h1 { color: #1769aa; }
          .count { font-size: 52px; font-weight: bold; }
          a { color: #1769aa; }
        </style>
      </head>
      <body>
        <main>
          <h1>Cloud Visitor Counter</h1>
          <p>Node.js frontend + Redis backend</p>
          <div class="count">${count}</div>
          <p>Total visits recorded by Redis</p>
          <p><a href="/api/visits">View visitor count API</a></p>
          <p><a href="/health/live">Liveness health check</a></p>
          <p><a href="/health/ready">Readiness health check</a></p>
        </main>
      </body>
      </html>
    `);
  } catch {
    res.status(503).send("Visitor counter is temporarily unavailable.");
  }
});

app.get("/api/visits", async (req, res) => {
  try {
    const count = Number(await redis.get("visitor-count") || 0);
    res.json({ visitors: count });
  } catch {
    res.status(503).json({ error: "Redis is unavailable" });
  }
});

app.get("/health/live", (req, res) => {
  res.status(200).json({ status: "alive" });
});

app.get("/health/ready", async (req, res) => {
  try {
    await redis.ping();
    res.status(200).json({ status: "ready" });
  } catch {
    res.status(503).json({ status: "not ready" });
  }
});

async function start() {
  await redis.connect();

  app.listen(PORT, "0.0.0.0", () => {
    // HTTP access logs are intentionally omitted.
  });
}

start().catch(() => {
  process.exit(1);
});

async function shutdown() {
  try {
    await redis.quit();
  } catch {
    // Redis may already be disconnected.
  }
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

  