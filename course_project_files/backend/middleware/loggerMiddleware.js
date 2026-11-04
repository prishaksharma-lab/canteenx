/**
 * CanteenX - Custom Request Logging Middleware (Module 5)
 * Logs incoming HTTP method, URL, status code, IP, and latency.
 */

const logger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    console.log(`[HTTP] ${new Date().toISOString()} | ${method} ${originalUrl} ${statusCode} - ${duration}ms (Client: ${ip})`);
  });

  next();
};

module.exports = logger;
