var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var sequence = require('run-sequence');
var webpack = require("webpack");
var jadeRev = require('gulp-jade-static-rev');
// var scsslint = require('gulp-scsslint');


var proStaticDir = path.join(__dirname, '/public/static');
var viewDir = path.join(__dirname, '/public/views');

var webpackConfig = require("./webpack.config.js");
gulp.task("webpack:dev", function (callback) {
    var myConfig = Object.create(webpackConfig);
    myConfig.output = {
        path: path.join(__dirname, '/build/static/'),
        filename: '[name].js'
    };

    myConfig.plugins = myConfig.plugins.concat(
        new webpack.DefinePlugin({
            "process.env": {
                // This has effect on the react lib size
                "NODE_ENV": JSON.stringify("dev")
            }
        })
    );

    // run webpack
    webpack(
        // configuration
        myConfig
        , function (err, stats) {
            callback();
        });
});
gulp.task('dev', function (cb) {
    gulp.run(['webpack:dev']);
});
/**
 * webpack生产环境编译配置
 */
gulp.task("webpack:build", function(callback) {
    var ExtractTextPlugin = require('extract-text-webpack-plugin');
    var ngAnnotatePlugin = require('ng-annotate-webpack-plugin');
    var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
    function chunkList(){
        this.plugin('done', function(stats) {
            // 获取文件列表
            var filemaps = stats.toJson();
            var filemapsStr = JSON.stringify(filemaps.assetsByChunkName);
            // 生成编译文件的maps
            fs.writeFileSync(path.join(__dirname, 'build', 'assets.json'), filemapsStr);
        });
    }

    // modify some webpack config options
    var myConfig = Object.create(webpackConfig);
    myConfig.output = {
        path: path.join(__dirname, '/build/static/'),
        filename: '[name].[chunkhash:6].js'
    };
    myConfig.plugins = (myConfig.plugins || []).concat(
        new webpack.DefinePlugin({
            "process.env": {
                // This has effect on the react lib size
                "NODE_ENV": JSON.stringify("production")
            }
        }),
        new webpack.optimize.DedupePlugin(),
        chunkList,
        new ngAnnotatePlugin({
            add: true
        }),
        new webpack.optimize.UglifyJsPlugin({
            mangle: {
                except: ['angular', '$super', '$', 'exports', 'require']
            },
            compress: {
                warnings: false
            }
        })
    );
    // run webpack
    webpack(myConfig, function(err, stats) {
        if(err)
            return console.log(err);
        console.log(stats.toString({
            colors: true
        }));
        callback();
    });
});

gulp.task('jadeMd5',function() {
    var json = require('./build/assets.json');
    gulp.src('./public/views/**/*.html')
        .pipe(jadeRev({
            root: '/',
            assets: json
        }))
        .pipe(gulp.dest('./build/views/'));
});

gulp.task('copyUpload',function(){
    gulp.src('./public/upload/*')
        .pipe(gulp.dest('./build/static/upload'));
});

// 生产环境使用
gulp.task('prod', function (cb) {
    sequence(['webpack:build'],
        ['jadeMd5'],
        ['copyUpload'],
        cb)
});