const log4js = require('log4js');
const utilLog = log4js.getLogger('[ERROR_LOG]');

const operate = require('./operate.js');
const object = require('./object.js');

/**
 * 记录日志
 * @param logger
 * @param options
 */
exports.recordLog = function recordLog(logger, options) {
    const __session = options.req.session || {};
    const userInfo = __session.user_info || {};

    let key = req.__uniqueid || operate.createRequestUid(options.req, options.res);
    let ip = operate.realIp(options.req) || operate.clientIp(options.req);
    let content = options.content;
    if(typeof options.content !== 'string'){
        let pwd;
        if(content.form){
            pwd = content.form.pwd || content.form.password;
        }
        content = JSON.stringify(options.content);
        pwd && (content = content.replace(pwd, '*********'));
    }
    let other = options.other || '';
    if(typeof other !== 'string'){
        other.username = userInfo.login_email || '';
        other = JSON.stringify(other);
    }
    // log info
    let logFn = logger.info;
    // error
    if (options.type === 'error') {
        logFn = logger.error;
    }
    // warn
    if (options.type === 'warn') {
        logFn = logger.warn;
    }

    req.__uniqueid = key;
    const loggerArr = [key, ip, options.req.originalUrl || '', content, other];
    const logStr = loggerArr.join('###');
    logFn.call(logStr, log);
};
