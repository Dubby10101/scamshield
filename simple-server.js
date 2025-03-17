const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

// Create a simple server that serves the test page
const server = http.createServer((req, res) => {
  console.log(`Request: ${req.url}`);
  
  // Serve the test page for all routes
  const testPagePath = path.join(__dirname, 'test-page.html');
  fs.readFile(testPagePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading test page');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
