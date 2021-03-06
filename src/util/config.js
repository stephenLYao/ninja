// load conf
var conf = {};

try {
	var file = require(process.cwd() + '/ninja.conf');
	conf.port = file.port || 3000;
	conf.template = file.template || 'swig';
	conf.mock = file.mock || null;
	conf.webpackFlag = file.webpack || false;
	conf.proxyConf = file.proxy || null;
	conf.staticDir = file.staticDir || null;
	conf.templateDir = file.templateDir || null;
	conf.browser = file.browser || 'google chrome'
} catch (e) {

}
module.exports = conf;