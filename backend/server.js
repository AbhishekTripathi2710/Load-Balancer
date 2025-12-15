const http = require("http");

const servers = [
    {id: "Server-1", port: 3001},
    {id: "Server-2", port: 3002},
    {id: "Server-3", port: 3003},
];

servers.forEach(({id,port}) => {
    const server = http.createServer((req,res) => {
        if(req.url === "/health"){
            res.writeHead(200);
            return res.end("OK");
        }

        res.writeHead(200, {"Content-Type":"text/plain"});
        res.end(`Hello from ${id}`);
    });

    server.listen(port, () => {
        console.log(`${id} running on port ${port}`);
    });
});
