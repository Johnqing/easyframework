const path = require('path');

module.exports = function (logdir, filename) {
    return {
        appenders: [
            { type: 'console' },
            {
                type: 'dateFile',
                "filename": path.join(logdir, filename || 'access.log'),
                "pattern": ".yyyyMMdd",
                "alwaysIncludePattern": true,
                layout: {
                    type: 'pattern',
                    pattern: '[%r][%[%5.5p%]]%m%n'
                }
            }
        ],
        replaceConsole: true
    };
};