const http = require("http");

const PORT = process.env.PORT;
const ID = process.env.ID;

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200);
    return res.end("OK");
  }
  res.writeHead(200);
  res.end(`Hello from ${ID}`);
//   setTimeout(() => {
//     res.writeHead(200);
//     res.end(`Hello from ${ID}`);
//   }, 5000);
});

server.listen(PORT, () => {
  console.log(`${ID} running on port ${PORT}`);
});
