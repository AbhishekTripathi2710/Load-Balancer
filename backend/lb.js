const http = require("http");
const ConsistentHashing = require('./hashRing'); 

const rings = new ConsistentHashing({replicas: 100});

const backends = [
    {id : "S1",host: "localhost", port: 3001},
    {id: "S2", host: "localhost", port: 3002},
    {id: "S3", host: "localhost", port: 3003},
];

const backendMap = new Map();
backends.forEach(b => {
    rings.addNode(b.id);
    backendMap.set(b.id,b);
});

function getRoutingKey(req){
    return req.headers["x-user-id"] || req.socket.remoteAddress;
}

const server = http.createServer((clientReq, clientRes) => {
    const routingKey = getRoutingKey(clientReq);
    const nodeId = rings.getNode(routingKey);

    if(!nodeId){
        clientRes.writeHead(503);
        return clientRes.end("No backend available");
    }

    const backend = backendMap.get(nodeId);

    const options = {
        hostname: backend.host,
        port: backend.port,
        path: clientReq.url,
        method: clientReq.method,
        headers: clientReq.headers,
    };

    const proxyReq = http.request(options, proxyRes =>{
        clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(clientRes);
    });

    proxyReq.on("error", () => {
        clientRes.writeHead(502);
        clientRes.end("Bad Gateway");
    });

    clientReq.pipe(proxyReq);
});

server.listen(3000, () => {
    console.log("Load Balancer (Consistent hashing) on port 3000");
})