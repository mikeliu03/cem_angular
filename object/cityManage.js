require.config({
	baseUrl: "resource/js/public",
	paths: {
		jquery: "jquery-2.1.4.min",
		bootstrap: "bootstrap.min",
		jq_validate: "jquery.validate.min",
		jq_validata_msg: "messages_zh",
		jq_ui: "jquery-ui.custom.min",
		jq_ztree: "jquery.ztree.all-3.5.min",
		jq_hc: "highcharts",
		jq_datepicker_zh_cn: "jquery.ui.datepicker-zh-CN",
		angular: 'angular/angular.min',
		cityapp: "../private/system/object/city/cityapp",
		citymanageCtrl: "../private/system/object/city-manag/citymanagement.controller",
		citymanageFactory: "../private/system/object/city-manag/citymanagement.factory",
		citylistCtrl: "../private/system/object/city-list/citylist.controller"
	},
	shim: {
		bootstrap: ["jquery"],
		jq_validate: ["jquery"],
		jq_validata_msg: ["jquery", "jq_validate"],
		jq_ui: ["jquery"],
		jq_ztree: ["jquery"],
		jq_hc: ["jquery"],
		jq_datepicker_zh_cn: ["jquery","jq_ui"],
		cityapp: ["jquery", 'angular'],
		citymanageCtrl: ["jquery", "angular", "citymanageFactory", "cityapp"],
		citymanageFactory: ["jquery", 'angular', "cityapp"],
		citylistCtrl: ["utils","jquery", 'angular', "cityapp"]
	}, urlArgs: "v=de1dbef188"});

// 引入公共脚本：header和左侧menu
require(["common"]);

require(["utils", "citymanageCtrl", "citylistCtrl", "bootstrap", "jq_validata_msg"], function(utils){
	angular.bootstrap(document, ['app']);
});