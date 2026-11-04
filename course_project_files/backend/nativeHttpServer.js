/**
 * ==============================================================================
 * CanteenX - Native Node.js HTTP Server (Demonstrating Module 4 of Syllabus)
 * Built WITHOUT Express using only Node.js Core Modules:
 * - http: Server creation, request & response streams
 * - events (EventEmitter): Kitchen event bus
 * - buffer: Memory buffers and binary payload handling
 * - stream: Streaming large static menu assets
 * - fs & path: File system I/O and cross-platform path resolution
 * ==============================================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

const PORT = process.env.NATIVE_PORT || 5050;

// 1. EventEmitter Demonstration (Module 4)
class KitchenEventEmitter extends EventEmitter {}
const kitchenBus = new KitchenEventEmitter();

kitchenBus.on('orderPlaced', (token) => {
  console.log(`[Event Loop - EventEmitter] New kitchen ticket received: ${token}`);
});

kitchenBus.on('orderReady', (token) => {
  console.log(`[Event Loop - EventEmitter] Counter Bell Ding! Token ${token} is ready for pickup.`);
});

// 2. Native HTTP Server without Express (Module 4)
const server = http.createServer((req, res) => {
  const { method, url } = req;
  const parsedUrl = new URL(url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // Set standard CORS & JSON headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Route: /api/native/health
  if (pathname === '/api/native/health' && method === 'GET') {
    // 3. Buffer Demonstration (Module 4)
    const payload = JSON.stringify({
      status: 'operational',
      engine: 'Node.js Core (No Express)',
      nodeVersion: process.version,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    });
    const buffer = Buffer.from(payload, 'utf-8');

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-Length': buffer.length
    });
    res.end(buffer);
    return;
  }

  // Route: /api/native/notify (Simulate order placement via Event Loop)
  if (pathname === '/api/native/notify' && method === 'POST') {
    let body = [];
    req.on('data', (chunk) => body.push(chunk)); // Stream chunks
    req.on('end', () => {
      body = Buffer.concat(body).toString();
      try {
        const data = JSON.parse(body);
        const token = data.token || '#CX-999';
        
        // Emit event on Node.js event loop
        kitchenBus.emit('orderPlaced', token);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: `Dispatched ${token} via native EventEmitter` }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // Route: Static Stream Demonstration (Module 4: Streams & File System)
  if (pathname === '/' || pathname === '/index.html') {
    const filePath = path.join(__dirname, '..', '..', 'index.html');
    if (fs.existsSync(filePath)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      // Stream file directly to HTTP response stream
      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
      return;
    }
  }

  // 404 Fallback
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Route not found on native HTTP server' }));
});

server.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`  [Module 4] Native Node.js Core HTTP Server running on :${PORT}`);
  console.log(`  Demonstrating Event Loop, EventEmitter, Streams, & Buffers`);
  console.log(`================================================================`);
});
