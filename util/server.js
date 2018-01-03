const log = require('./lib/log.js');
const operate = require('./lib/operate.js');
const object = require('./lib/object.js');
const encrypt = require('./lib/encrypt.js');
const number = require('./lib/number.js');
const db = require('./lib/db.js');

module.exports = {
    log: log,
    object: object,
    number: number,
    encrypt: encrypt,
    operate: operate,
	db: db
};