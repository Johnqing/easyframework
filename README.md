# easyframework
> 监狱Express，进行了封装

## 使用

### 文件结构

```
util 工具
-- lib 基础工具
-- request 服务端请求第三方服务
-- server 基础工具的入口（lib中增加文件后，请在引入）

server 服务端
-- controller 控制器
-- filter 过滤器
-- models 数据处理层
---- mysql mysql的连接工具，支持连接池、事物处理等
-- task 任务
-- app.js 入口文件
-- server.js 启动文件
logs 日志
config 配置目录
-- startup 服务启动时，产生的总配置
-- env 环境配置
-- logger 日志相关的配置
-- ngx ngx的配置文件
-- pm2 pm2启动时的配置文件。ps: 其中的 NODE_ENV 对应 env 的文件名
```

### 启动文件配置

```
module.exports = {
	routers: ['controller'], // 需要产生路由的目录，server文件下的目录。
	prodEnvs: ['production', 'test', 'uat', 'prev', 'demo'], // 按照生产环境启用的环境变量
	dbs: ['test'] // 需要增加的数据库连接，这个和 env 下的 db 内的 key 对应
}
```

### 环境配置

```
module.exports = {
    port: 5000, // 启动的端口号
    logPath: './logs', // 日志目录
    secretKey: 'this is a key', // 生成cookie时的秘钥
    api: {
        // 第三方接口
        test: {
            test: {
                url: 'http://127.0.0.1:8090/test'
            }
        }
    },
    // 数据库配置
    db: {
        // 连接session相关的sessionstore
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
        // 给这个数据库连接起一个名字
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
    // 页面上用的一些公共配置
    locals: {}
};

### pm2配置

```
{
  "apps": [
    {
      "name": "easyframework", // 应用名称
      "cwd": "/Users/Charles/demo/framework", // 应用根目录
      "script": "server/server.js", // 这里不用改，除非你把启动文件挪走了
      "exec_mode": "cluster",       // 是否以cluster的方式启动
      "node_args": "--harmony",     // 是否支持一些新特效
      "env": {
        "NODE_ENV": "test"          // 对应 env 目录下的文件名
      },
      "error_file": "/dev/null",
      "out_file": "/dev/null",
      "pid_file": "/dev/null",
      "max_memory_restart": "800M", // 内存超过多大就重启
      "instances": "2"              // 最大的进程数，在生产环境推荐 max 
    }
  ]
}

```
