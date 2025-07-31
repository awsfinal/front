const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, 'build', req.url === '/' ? 'index.html' : req.url);
  
  // SPA 라우팅을 위해 존재하지 않는 경로는 index.html로 리다이렉트
  if (!fs.existsSync(filePath) && !req.url.startsWith('/static/')) {
    filePath = path.join(__dirname, 'build', 'index.html');
  }
  
  const ext = path.extname(filePath);
  let contentType = 'text/html';
  
  switch (ext) {
    case '.js': contentType = 'text/javascript'; break;
    case '.css': contentType = 'text/css'; break;
    case '.json': contentType = 'application/json'; break;
    case '.png': contentType = 'image/png'; break;
    case '.jpg': contentType = 'image/jpg'; break;
    case '.jpeg': contentType = 'image/jpeg'; break;
    case '.gif': contentType = 'image/gif'; break;
    case '.svg': contentType = 'image/svg+xml'; break;
  }
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
