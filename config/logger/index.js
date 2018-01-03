const path = require('path');
const log4js = require('log4js');
const config = require('./config');
const connect = require('./connect');
/**
 * 初始化日志配置
 * @param logPath
 */
log4js.configure(config(path.join(ROOT_PATH, ENV_CONFIG.logPath)));

/**
 * 默认会记录所有http请求
 */
exports.use = function use(){
    return connect(log4js.getLogger('[HTTP_ACCESS]'), `[:remote-addr] -- :url|:req[cookies]|:referrer|:user-agent`)
};