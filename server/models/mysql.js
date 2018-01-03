const mysql = require('mysql');
const log4js = require('log4js');
const sqlLog = log4js.getLogger('[MYSQL_SQL]');


const createPool = mysql.createPool;
const createConnection = mysql.createConnection;


function formatSql(sql) {
	return sql.replace(/\s{2,}/g, ' ')
}

/**
 * mysql类
 *
 * {
 *      transaction: true, // 是否支持事物
 *      isPool: true, //是否支持连接池
 *      router: true, //是否支持router,
 *      comments: '备注',
 *		limit: 10,	// 连接池的情况下，连接数
 *		host: '127.0.0.1', // 连接ip
 *		user: '用户名',
 *		password: '密码',
 *		database: '数据库',
 *		port: '端口',
 *		dateStrings: '日期展示方式，默认DATE'
 * }
 *
 *
 */
class Mysql {
	constructor(options = {}) {
		this.connect = {
			connectionLimit: options.limit || 10,
			comments: options.comments || options.host,
			host: options.host,
			user: options.user,
			password: options.password,
			database: options.database,
			port: options.port || 3306,
			dateStrings: options.dateStrings || 'DATE'
		};

		this.pool = options.isPool ? createPool(this.connect) : null;
	}

	logger(arg = [], type){
		if(!arg.length){
			return;
		}

		const loggerArr = [];
		arg.forEach((log)=>{
			const content = typeof log === 'Object' ? JSON.stringify(log) : log;
			loggerArr.push(content);
		});

		const logStr = loggerArr.join('###');

		if(type === 'error'){
			return sqlLog.error(logStr);
		}

		sqlLog.info(logStr);
	}

	/**
	 * 链接池的方式链接数据库
	 * @param sql      sql语句
	 * @param config    {data: []} data:数据项
	 * @returns {Promise}
	 */
	queryPool(sql, config = {}) {
		return new Promise((resolve, reject) => {
			let query;
			this.pool.getConnection((err, conn) => {
				if (err) {
					reject(err);
				} else {
					sql = formatSql(sql);
					query = conn.query(sql, config.data || [],  (err, rows, fields) => {
						if (err) {
							reject(err);
							this.logger(['ERROR', query.sql, config, this.connect, err], 'error');
							return
						}
						let result = JSON.stringify(rows);
						resolve(JSON.parse(result));
						conn.release();
						this.logger(['DONE', query.sql, config, this.connect, result]);
					});
				}
			});
		});
	}

	/**
	 * 客户端链接
	 * @param sql       sql语句
	 * @param config    {data: []} 数据
	 * @param connConfig   数据库链接，可选参数
	 * @returns {Promise}
	 */
	queryClient(sql, config = {}, connConfig = {}) {
		sql = formatSql(sql);
		connConfig = connConfig || this.connect;
		return new Promise((resolve, reject) => {
			let connection = createConnection(connConfig);
			connection.connect();
			let query;
			query = connection.query(sql, config.data || [], function (err, rows, fields) {
				if (err) {
					reject(err);
					this.logger(['ERROR', query.sql, config, connConfig, err], 'error');
					return
				}
				let result = JSON.stringify(rows);
				this.logger(['DONE', query.sql, config, connConfig, result]);
				resolve(JSON.parse(result), fields);
			});

			this.logger(['OPTS', query.sql, config, connConfig]);
			connection.end();
		})
	}

	/**
	 * 事物提交
	 * @param config  [{sql: `select * from aa`, data: []}] 同一个事物，按照顺序写入
	 * @returns {Promise}
	 */
	queryTransaction(config = [], connConfig = {}) {

		connConfig = connConfig || this.connect;

		return new Promise((resolve, reject) => {
			let connection = mysql.createConnection(connConfig);
			connection.connect();

			connection.beginTransaction(function (err) {
				if (err) {
					reject(err);
					this.logger(['ERROR', config, connConfig, err], 'error');
					return;
				}
				let query;

				// 回滚
				function rollback(err) {
					return connection.rollback(function () {
						this.logger(['ERROR', config, connConfig, err], 'error');
						reject(err);
					});
				}

				function commint(query) {
					return connection.commit(function (err) {
						if (err) {
							this.logger(['ERROR', config, connConfig, err], 'error');
							return rollback(err);
						}
						resolve();
						connection.end();
					});
				}

				/**
				 * 轮询
				 */
				function selectQuery() {
					const sqlConfig = config.shift();
					if (!sqlConfig) {
						return commint(query);
					}

					let sqlStr = formatSql(sqlConfig.sql);
					query = connection.query(sqlStr, sqlConfig.data || [], function (err, rows) {
						if (err) {
							this.logger(['ERROR', query.sql, sqlConfig.data, connConfig, err], 'error');
							// 事物回滚
							return rollback(err);
						}

						this.logger(['DONE', query.sql, sqlConfig.data, connConfig, rows]);
						selectQuery()
					});
					this.logger(['OPTS', query.sql, sqlConfig.data, connConfig]);

				}

				selectQuery();
			});
		})
	}

	/**
	 * 数据库路由支持
	 * @param options       {routerSql: 'select * from aa', routerData: [], sql: 'select * from bb', data: []}
	 * 通过路由表，查询不同数据库实例/db的数据。路由表的字段必须为{host:'', user: 'xx', password: 'xx', port: 3306, database: 'aa', comments: 'xx'}
	 * @returns {Promise.<T>}
	 */
	queryRouter(options = {}) {
		return this.queryClient(options.routerSql, options.routerData, this.connect).then((res)=> {
			const promiseArr = [];
			res.forEach((conn)=> {
				// 新酒店未建立路由的情况
				if (!conn) {
					return;
				}

				promiseArr.push(
					this.queryClient(options.sql, {
						data: options.data
					}, {
						host: conn.host,
						user: conn.user,
						password: conn.password,
						port: conn.port || 3306,
						database: conn.database,
						comments: conn.comments,
						dateStrings: 'DATE'
					})
				)
			});
			return Promise.all(promiseArr).then((res)=> {
				let arr = [];
				res.forEach((item)=> {
					arr = arr.concat(item);
				});

				return arr;
			})
		});
	}

	/**
	 * 通用方法根据不同的选项，切换不同的类型
	 * @param arg
	 * @returns {*}
	 */
	query(...arg) {
		if (this.transaction) {
			return this.queryTransaction(...arg);
		}

		if (this.pool) {
			return this.queryPool(...arg);
		}

		if (this.router) {
			return this.queryRouter(...arg);
		}

		return this.queryClient(...arg);
	}
}

module.exports = Mysql;