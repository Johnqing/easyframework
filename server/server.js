const app = require('./app');

const server = app.listen(ENV_CONFIG.port, ENV_CONFIG.hostname || '127.0.0.1', 1024, function() {
    console.debug(`[${SERVER_ENV}]`, `Server running http://${server.address().address}:${server.address().port}`);
});