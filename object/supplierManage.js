require.config({
    baseUrl: "resource/js/public",
    paths: {
        jquery: "jquery-2.1.4.min",
        bootstrap: "bootstrap.min",
        jq_validate: "jquery.validate.min",
        jq_validata_msg: "messages_zh",
        jq_ui: "jquery-ui.custom.min",
        jq_ztree: "jquery.ztree.all-3.5.min",
        datatables: "jquery.dataTables.min"
    },
    shim: {
        bootstrap: ["jquery"],
        jq_validate: ["jquery"],
        jq_validata_msg: ["jquery", "jq_validate"],
        jq_ui: ["jquery"],
        jq_ztree: ["jquery"],
        datatables: ["jquery"]
    }, urlArgs: "v=de1dbef188"});

//引入公共脚本：header和左侧menu
require(["common"]);

require(["utils", "jq_ui", "bootstrap", "jq_validata_msg", "datatables"], function(utils){
	findObjects("supplierType",$("#supplierType"));
	findObjects("taxpayertype",$("#taxpayerIdentity"));
		var table_example = $("#table_example");
		var chk_all = $("#table_example_checkbox");
		var p_operate = $("#p_operate");
		var table = table_example.DataTable({
		processing: true,		// 服务器端获取数据时，需添加
		serverSide: true,			// 服务器端获取数据时，需添加
		ajax: {
	         url: "searchSuppliers.ajax",
	         type: "POST",
	         data: function(d){
		 		var searchJson = _getSearchJson();
		 		var param = jQuery.extend(true, d, searchJson);
		        return param;
	    		}
	    },
		lengthChange: false,
		info:false,
		searching: true,
		columns: [
			{
	            searchable: false,
	            data: "id",
	            render: function (data) {
	                return "<input type='checkbox' data-id='id' value='" + data + "' />";
	            },
	            orderable: false,
	            width: "3%",
	        },
			{data: "code"},
			{data: "type"},
			{data: "name"},
			{data: "taxPayerType"},
			{data: "taxPayerCode"},
			{	searchable: false,
				data: "enable",
				 render: function (data) {
		           if(data=="000"){
		        	   return "启用";
		           } else if(data=="001"){
		        	   return "禁用";
		           }
				 }
			},
		],
		order: [[1, 'asc']]
	});
	// 注册表格单页全选事件
	chk_all.click(function() {
		var _this = this;
		$("tbody :checkbox", table_example).each(function() {
			this.checked = _this.checked;
		});
	});
	table_example.on("click", "tbody :checkbox",
		function() {
			var checked_len = $("tbody :checkbox:checked",
					table_example).length;
			var chk_len = $("tbody :checkbox",
					table_example).length;
	
			chk_all[0].checked = checked_len === chk_len;
	});
	$("#clearContent").click(function(){
		$("#supplierNo").val("");
		$("#supplierName").val("");
		$("#supplierType").val("");
		$("#taxpayerIdentityNumber").val("");
		$("#taxpayerIdentity").val("");
		$("#status").val("");
	});
	function _getSearchJson(){
		var obj = {
				"supplierNo": $.trim($("#supplierNo").val()),
				"supplierName": $.trim($("#supplierName").val()),
				"supplierType": $.trim($("#supplierType").val()),
				"taxpayerIdentityNumber": $.trim($("#taxpayerIdentityNumber").val()),
				"taxpayerIdentity": $.trim($("#taxpayerIdentity").val()),
				"status": $.trim($("#status").val()),
			};
	
		var result = {};
		for(var e in obj){
			if(e && obj[e] && obj[e].trim()!== ","){
				result[e] = obj[e];
			}
		}
		return result;
	}
	$("#search").click(function(){
		var taxpayerIdentityNumber = $("#taxpayerIdentityNumber").val();
		var supplierName = $("#supplierName").val();
		if(supplierName != ""){
			if(/[\!\@\#\$\%\^\&\*\~\\\;\'\/\{\}\|\:\"\<\>\?]/g.test(supplierName)){
				utils.cemValiMess($("#supplierName"),"供应商名称不能有特殊字符");
				return false;
			}
		}else if(taxpayerIdentityNumber != ""){
			if(!/^(\d{15}|\d{18})$/g.test(taxpayerIdentityNumber)){
				utils.cemValiMess($("#taxpayerIdentityNumber"),"请输入15或18位纳税人识别号(纯数字)");
				return false;
			}
		}
		table.ajax.reload();
	});
	utils.common_switch();
	// 添加
	$("#supplier_add").click(function(){
		var supplerTypecombox = $("#dialog_supplier_type");
		findObjects("supplierType",supplerTypecombox);
		var taxpayerIdentitycombox = $("#dialog_taxpayerIdentity");
		findObjects("taxpayertype",taxpayerIdentitycombox);
		$("#operation").val("add");
		$(".modal-title", p_operate).text("新增供应商");
		$("#dialog_supplier_id").val("");
//		$("#supplier_code").hide();
		$("#dialog_supplier_type").val("");
		$("#dialog_supplier_name").val("");
		$("#dialog_supplier_description").val("");
		$("#dialog_taxpayerIdentityNumber").val("");
		$("#dialog_taxpayerIdentity").val("");
		$("#is_enable")[0].checked = true;
		p_operate.modal("show");
	});
	// 修改
	$("#supplier_update").click(function(){
		$("#supplier_code").show();
		var supplerTypecombox = $("#dialog_supplier_type");
		findObjects("supplierType",supplerTypecombox);
		var taxpayerIdentitycombox = $("#dialog_taxpayerIdentity");
		findObjects("taxpayertype",taxpayerIdentitycombox);
		var checked_elem = $("tbody :checkbox:checked", table_example);
		if(checked_elem.length <= 0){
			utils.cem_message("请选择一条记录。");
			return false;
		}else if(checked_elem.length > 1){
			utils.cem_message("一次只能修改一条记录。");
			return false;
		}
		$("#operation").val("update");
		var selected_data = table.row(checked_elem.closest("tr")[0]).data();
//		$("#update_ref_id").val(selected_data.id);
	    utils.post("findSupplierInfoById.ajax",{id: selected_data.id},function(data){
	            $("#supplierID").val(data.id);
	            $("#dialog_supplier_id").val(data.code);
				$("#dialog_supplier_type").val(data.type);
	            $("#dialog_supplier_name").val(data.name);
	            $("#dialog_supplier_description").val(data.describe);
	            $("#dialog_taxpayerIdentity").val(data.taxPayerType);
	            $("#dialog_taxpayerIdentityNumber").val(data.taxPayerCode);
	            if(data.enable=="000"){
	            	 $("#is_enable").closest(".fee-switch").removeClass("actived");
	            	 $("#is_enable")[0].checked = true;
	            } else if(data.enable=="001"){
	            	$("#is_enable").closest(".fee-switch").addClass("actived");
	            	$("#is_enable")[0].checked = false;
	            	//$("#is_enable").removeAttr("checked");
	            }
	           
	    });
		$(".modal-title", p_operate).text("修改供应商信息");
		p_operate.modal("show");
	});
	//验证表单
	$("#p_form").tooltip({
		show: false,
		hide: false
	});
	$("#p_form").validate({
		// 使用jquery-ui风格进行验证提示
		showErrors: function(map, list) {
			var focussed = document.activeElement;
			if (focussed && $(focussed).is("input, textarea")) {
				$(this.currentForm).tooltip("close", {
					currentTarget: focussed
				}, true);
			}
			this.currentElements.removeAttr("title").removeClass("ui-state-highlight");
			$.each(list, function(index, error) {
				$(error.element).attr("title", error.message).addClass("ui-state-highlight");
			});
			if (focussed && $(focussed).is("input, textarea")) {
				$(this.currentForm).tooltip("open", {
					target: focussed
				});
			}
		},
		// 异步提交时添加到方法，如果不添加此方法，验证通过后，会进行同步提交。
		submitHandler: function(form){
			//纳税人字段校验
			var taxpayerIdentityNumber = $("#dialog_taxpayerIdentityNumber").val();
			var dialog_supplier_name = $("#dialog_supplier_name").val();
			if(/[\!\@\#\$\%\^\&\*\~\\\;\'\/\{\}\|\:\"\<\>\?]/g.test(dialog_supplier_name)){
				utils.cemValiMess($("#dialog_supplier_name"),"供应商名称不能有特殊字符");
				return false;
			}else if(taxpayerIdentityNumber && (!/^(\d{15}|\d{18})$/g.test(taxpayerIdentityNumber))){
				utils.cemValiMess($("#dialog_taxpayerIdentityNumber"),"请输入15或18位纳税人识别号(纯数字)");
				return false;
			}
			// 序列化表单
			var form_data = $(form).serializeArray();
			var operation = $("#operation").val();
			if (operation == "add") {
		       utils.ajax({
	                url: "addSuppliers.ajax",
	                data: form_data,
	                type: "post",
	                timeout: 8000,
	                success: function(data){
	                	if(data=="repeatName"){
	                		utils.cem_message("供应商名称重复，请重新输入！");
	                	}
	                	else if(data=="repeatCode"){
	                		utils.cem_message("供应商编号重复，请重新输入！");
	                	}
	                	else{
		                	p_operate.modal("hide");
		                    table.ajax.reload();
		                    utils.cem_message("添加成功");
	                	}
	                }
	            });
			} else if (operation == "update"){
				utils.ajax({
	                url: "updateSupplierInfo.ajax",
	                data: form_data,
	                type: "post",
	                timeout: 8000,
	                success: function(data){
	                	if(data=="repeatName"){
	                		utils.cem_message("供应商名称重复，请重新输入！");
	                	}
	                	else if(data=="repeatCode"){
	                		utils.cem_message("供应商编号重复，请重新输入！");
	                	}
	                	else{
		                	p_operate.modal("hide");
		                	//刷新供应商表格
		                    table.ajax.reload();
		                    //刷新供应商详细信息
		                    var dialog_supplier_id = $("#dialog_supplier_id").val();
		                    var dialog_supplier_type = $("#dialog_supplier_type").find("option:selected").text();
		                    var dialog_supplier_name = $("#dialog_supplier_name").val();
		                    var dialog_supplier_description = $("#dialog_supplier_description").val();
		        	        $("#supplier_id").val(dialog_supplier_id);
		        			$("#supplier_type").val(dialog_supplier_type);
		        			$("#supplier_name").val(dialog_supplier_name);
		        			$("#supplier_description").val(dialog_supplier_description);
		        			//刷新供应商对应的银行信息
//		        			 var update_ref_id = $("#update_ref_id").val();
//		        			 $("#ref_id").val(update_ref_id);
//		        			 var ref_id = $("#ref_id").val();
//			        		 var params = {"refid":ref_id};
//			        	     init_bank_list(params);
		                     utils.cem_message("修改成功");
	                	}
	                }
	            });
			}
		},
		// 添加验证规则
		rules: {
			dialog_supplier_id: {
				required: true,
				no_special_char:true
			},
			dialog_supplier_type: {
				required: true
			},
			dialog_supplier_name: {
				required: true
			},
			dialog_supplier_description: {
				required: false
			},
			/*dialog_taxpayerIdentityNumber: {
				required: true
			},
			dialog_taxpayerIdentity: {
				required: true
			}*/
		},
		// 验证规则对应的提示信息，如果不填写，则使用框架默认的提示信息。
		messages: {
			dialog_bank_name: {
				required: "请输入供应商编号"
			},
			dialog_username: {
				required: "请输入供应商类别"
			},
			dialog_count: {
				required: "请输入供应商名称",
				no_special_char:true
			},
			dialog_supplier_description: {
				required: "请输入描述"
			},
			dialog_bank_name: {
				required: "请输入纳税人识别号"
			},
			dialog_username: {
				required: "请选择纳税人身份"
			},
		}
	});
	// 删除
	$("#supplier_delete").click(function(){
		var checked_elem = $("tbody :checkbox:checked", table_example);
	
		if(checked_elem.length <= 0){
			utils.cem_message("请至少选择一条记录。");
			return false;
		}
	
		//收集ID值，并删除
		utils.cem_alert("确认要删除选中项吗？", function(){
			var ids = [];
			
			checked_elem.each(function(){
				ids.push(this.value);
			});
	
			utils.post("deleteSupplierInfo.ajax",{ids: ids + ""},function(data){
				table.draw();
				//$("#right_area").hide();
			});
		});
	});
	// 启用 
	$("#supplier_enable").click(function(){
		var checked_elem = $("tbody :checkbox:checked[data-id='id']", table_example);
		 setEnable(checked_elem, "000");
	});
	
	// 禁用
	$("#supplier_disable").click(function(){
		var checked_elem = $("tbody :checkbox:checked[data-id='id']", table_example);
		setEnable(checked_elem, "001");
	});
	
		/**
	 * 启用或禁用
	 * checked_elem 选中的记录ID
	 * enbale   000启用 001禁用
	 */
	function setEnable(checked_elem, enable) {
	    var ids = [];
	    if (checkChecked_elem()) {
	        checked_elem.each(function () {
	            ids.push(this.value);
	        });
	        // 发送异步请求
	        utils.post("updateSupplierStatus.ajax",{ids: ids + "",enable: enable},function(data){
	        	$("#supplier_list_all").trigger('click')
	        	  utils.cem_message("状态修改成功！");
	            	table.draw();
	        });
	    }
	}
	function checkChecked_elem() {
	    var checked_elem = $("tbody :checkbox:checked", table_example);
	
	    if (checked_elem.length <= 0) {
	        utils.cem_message("请选择一条记录。");
	        return false;
	    }
	    return true;
	}
	
	//查看银行账号信息
	$("#findBankCount").click(function(){
		var checked_elem = $("tbody :checkbox:checked", table_example);
		if(checked_elem.length <= 0){
			utils.cem_message("请先选择一条供应商信息");
			return false;
		}else if(checked_elem.length > 1){
			utils.cem_message("只可选择一个供应商进行查看");
			return false;
		}
		var selected_data = table.row(checked_elem.closest("tr")[0]).data();
		window.location.href='toSupplierBack.do?id='+selected_data.id;
	});
	//初始化供应商下拉框
	function findObjects(typeCode,combox) {
	       utils.ajax({
               url: "selectObjectsByObjectTypeCode.ajax",
               data: {typeCode:typeCode},
               type: "post",
               async:false, 
               success: function(data){
            	   var html = "";
       	    	html+="<option value=\"\">请选择..</option>";
       	            $.each(data, function (index, entity) {
       	                html += "<option value='" + entity.id + "'>" + entity.name + "</option>";
       	            });
       	           combox.html(html);
               }
           });
	}
});