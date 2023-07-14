const app = require('express')();
const {v4} = require('uuid');
const {WebSocket, createWebSocketStream} = require('ws');

var expressWs = require("express-ws");
const net = require("net");
expressWs(app);

const logcb = (...args) => console.log.bind(this, ...args);
const errcb = (...args) => console.error.bind(this, ...args);

const uuid = (process.env.UUID || 'd342d11e-d424-4583-b36e-524ab1f0afa4').replaceAll('-', '');
app.get('/api', (req, res) => {
    const upgradeHeader = req.headers.upgrade;
    const path = `/api/item/${v4()}`;
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.end(`Hello! Go to item: <a href="${path}">${path}</a>`);
});

app.get('/api/item/:slug', (req, res) => {
    const {slug} = req.params;
    res.end(`Item: ${slug}`);
});

app.ws("/argox-vl", function (ws, req) {

    ws.on("message", function (msg) {
        const [VERSION] = msg;
        const id = msg.slice(1, 17);
        if (!id.every((v, i) => v == parseInt(uuid.substr(i * 2, 2), 16))) return;
        let i = msg.slice(17, 18).readUInt8() + 19;
        const port = msg.slice(i, i += 2).readUInt16BE(0);
        const ATYP = msg.slice(i, i += 1).readUInt8();
        const host = ATYP == 1 ? msg.slice(i, i += 4).join('.') ://IPV4
            (ATYP == 2 ? new TextDecoder().decode(msg.slice(i + 1, i += 1 + msg.slice(i, i + 1).readUInt8())) ://domain
                (ATYP == 3 ? msg.slice(i, i += 16).reduce((s, b, i, a) => (i % 2 ? s.concat(a.slice(i - 1, i + 1)) : s), []).map(b => b.readUInt16BE(0).toString(16)).join(':') : ''));//ipv6

        logcb('conn:', host, port);
        ws.send(new Uint8Array([VERSION, 0]));
        const duplex = createWebSocketStream(ws);
        net.connect({host, port}, function () {
            this.write(msg.slice(i));
            duplex.on('error', errcb('E1:')).pipe(this).on('error', errcb('E2:')).pipe(duplex);
        }).on('error', errcb('Conn-Err:', {host, port}));
    });
});

module.exports = app;