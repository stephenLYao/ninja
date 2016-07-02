/**
 * app.js
 *
 * bootstrap the express server
 */

// deps
var request = require('request');
var express = require('express');
var cons = require('consolidate');
var app = express();
var fs = require('fs');
var webpackDevMiddleware = require("webpack-dev-middleware");
var webpackHotMiddleware = require('webpack-hot-middleware');
var webpack = require("webpack");
var chalk = require("chalk");

// modules
var socket = require('./socket');

module.exports = function(template, mock, webpackFlag, proxyConf, staticDir, templateDir) {

  // configure app
  app.engine('html', cons[template]);
  app.set('view engine', 'html');
  app.set('views', process.cwd() + templateDir);
  var mock = JSON.parse(fs.readFileSync(process.cwd() + mock, 'utf8'));

  app.use(require('connect-inject')({
    snippet: "<script src='http://localhost:5000/client.js'></script><script src='http://localhost:5000/livereload.js'></script>"
  }));

  // map routes
  mock.routes.map(function(obj, i) {
    if (obj.async) {
      if (proxyConf) {
        var reg = new RegExp(proxyConf.route);
        if (reg.test(obj.endpoint)) {
          return;
        }
      }
      app.get(obj.endpoint, function(req, res) {
        res.send(mock.data[obj.name])
      });
    } else {
      app.get(obj.endpoint, function(req, res, next) {
        res.render(obj.template, mock.data[obj.name])
      });
    }
  })


  if (webpackFlag) {
    var config = require(process.cwd() + '/webpack.dev.config')
    var compiler = webpack(config)
    app.use(webpackDevMiddleware(compiler, {
      publicPath: config.output.publicPath,
      stats: {
        colors: true
      }
    }))
    app.use(webpackHotMiddleware(compiler, {
      log: console.log
    }))
  }else {
    app.use(express.static(process.cwd() + staticDir));
  }

  if (proxyConf) {
    app.use(proxyConf.route, function(req, res) {
      //modify the url in any way you want
      var url = proxyConf.origin + proxyConf.route + req.url;
      var r;
      if (req.method === 'POST') {
        r = request.post({
          uri: url,
          headers: res.headers,
          json: req.body
        });
      } else if (req.method === 'PUT') {
        r = request.put({
          uri: url,
          headers: res.headers,
          json: req.body
        });
      } else {
        r = request({
          url: url,
          headers: res.headers
        });
      }

      r.pipe(res);
    });
  }

  socket();

  // start server
  app.listen(3000, function() {

    console.log(chalk.blue(" __    _  ___   __    _      ___  _______ "));
    console.log(chalk.blue("|  |  | ||   | |  |  | |    |   ||   _   |"));
    console.log(chalk.blue("|   |_| ||   | |   |_| |    |   ||  |_|  |"));
    console.log(chalk.blue("|       ||   | |       |    |   ||       |"));
    console.log(chalk.blue("|  _    ||   | |  _    | ___|   ||       |"));
    console.log(chalk.blue("| | |   ||   | | | |   ||       ||   _   |"));
    console.log(chalk.blue("|_|  |__||___| |_|  |__||_______||__| |__|"));

    console.log(chalk.yellow('Ninja Power on port http://localhost:3000'));
  });
};
