var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var glob = require('glob');
var appRoot = __dirname;
var node_modules = path.join(appRoot, 'node_modules');
/**
 * 生成map，在上生产前用来做替换用
 */
function chunkList(){
    this.plugin('done', function(stats) {
        // 获取文件列表
        var filemaps = stats.toJson();
        var filemapsStr = JSON.stringify(filemaps.assetsByChunkName);
        // 生成编译文件的maps
        fs.writeFileSync(path.join(__dirname, 'build', 'assets.json'), filemapsStr);
    });
}
var cssLoader = 'css!autoprefixer!less?sourceMap';

var plugins = [
    new webpack.optimize.DedupePlugin()
];

if (process.env.NODE_ENV === 'production') {
    plugins.push(
        chunkList
    );
    plugins.push(
	    new webpack.optimize.CommonsChunkPlugin({
		    name: 'vendor',
		    filename: '[name].[chunkhash:8].js'
	    })
    )
} else {
	plugins.push(new webpack.optimize.CommonsChunkPlugin({
		name: 'vendor',
		filename: '[name].js'
	}))
}

module.exports = {
    cache: true,
    entry: {
        app: appRoot + '/public/static/index.js'
    },
    output: {
        path: appRoot + '/build/static/',
        filename: '[name].js'
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.less', '.css', '.html']
    },
    module: {
        loaders: [
            {
                test: /\.js?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel',
                query: {
                    loose: ['es6.classes', 'es6.modules']
                }
            },
            {
                test: /\.css$/,
                loader: 'style!css',
                exclude: /node_modules/
            },
            {
                test: /\.less$/,
                loader: `style!${cssLoader}`
            },
            {
                test: /\.(png|jpg|gif)$/,
                loader: 'url?limit=25000',
                exclude: /node_modules/
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "url-loader?limit=10000&minetype=application/font-woff"
            },
            {
                test: /\.html$/,
                loader: 'raw',
                exclude: /node_modules/
            }
        ]
    },

    plugins: plugins
};