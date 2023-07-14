const app = require('express')();
const { v4 } = require('uuid');

app.get('/api', (req, res) => {
    const upgradeHeader = req.headers.get('Upgrade');
    const path = `/api/item/${v4()}`;
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.end(`Hello! Go to item: <a href="${upgradeHeader}">${upgradeHeader}</a>`);
});

app.get('/api/item/:slug', (req, res) => {
    const { slug } = req.params;
    res.end(`Item: ${slug}`);
});

module.exports = app;