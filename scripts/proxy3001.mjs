import http from "http";

const server = http.createServer((req, res) => {
  const options = {
    hostname: "localhost",
    port: 3000,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: "localhost:3000",
    },
  };

  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxy.on("error", (err) => {
    res.writeHead(502, { "Content-Type": "text/plain" });
    res.end("Next.js dev server starting up on port 3000... Please refresh in a moment.");
  });

  req.pipe(proxy, { end: true });
});

server.listen(3001, () => {
  console.log("Port 3001 proxy active -> forwards all traffic to port 3000");
});
