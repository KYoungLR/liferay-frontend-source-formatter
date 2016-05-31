var _ = require('lodash');
var stylelint = require('stylelint');
var STYLELINT_CONFIG = require('./config/stylelint');
var glob = require('glob');

var ruleUtils = require('./rule_utils');

var customRules = {};

var runLinter = function(contents, file, context) {
	var customRules = context.customRules || {};

	_.merge(stylelint.rules, customRules);

	var config = context.lintConfig;

	var configs = [{}, STYLELINT_CONFIG];

	if (_.isObject(config)) {
		configs.push(config);
	}

	config = _.merge.apply(_, configs);

	return stylelint.lint(
		{
			code: contents,
			codeFileName: file,
			config: config,
			formatter: 'json',
			syntax: 'scss'
		}
	);
};

var globOptions = {
	cwd: __dirname
};

module.exports = function(contents, file, context) {
	context.customRules = customRules;

	glob.sync(
		'./lint_css_rules/*.js',
		globOptions
	).forEach(
		function(item, index) {
			var id = ruleUtils.getRuleId(item);

			customRules[id] = require(item);
		}
	);

	return runLinter(contents, file, context);
};

module.exports.stylelint = stylelint;
module.exports.linter = stylelint.linter;
module.exports.runLinter = runLinter;