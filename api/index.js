const app = require('express')();
const { v4 } = require('uuid');
var expressWs = require("express-ws");
expressWs(app);

app.get('/api', (req, res) => {
    const upgradeHeader = req.headers.upgrade;
    const path = `/api/item/${v4()}`;
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.end(`Hello! Go to item: <a href="${path}">${path}</a>`);
});

app.get('/api/item/:slug', (req, res) => {
    const { slug } = req.params;
    res.end(`Item: ${slug}`);
});

app.ws("/socketTest", function (ws, req) {
    ws.send("你连接成功了");
    ws.on("message", function (msg) {
        ws.send("这是第二次发送信息");
    });
});

module.exports = app;