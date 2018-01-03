module.exports = {
    port: 5000,
    logPath: './logs',
    secretKey: 'this is a key',
    api: {
        test: {
            test: {
                url: 'http://127.0.0.1:8090/test'
            }
        }
    },
    db: {
        store: (session)=> {
            const redisStore = require('connect-redis')(session);

            return new redisStore({
                host: '127.0.0.1',
                port: '6379',
                db: 1,
                pass: 'password',
                ttl: 1000
            });
        },
        // UDB
        test: {
            host: '127.0.0.1',
            port: 3306,
            username: 'username',
            password: 'password',
            database: 'test',
            charset: 'utf8',
            comments: 'config'
        }
    },
    locals: {}
};
