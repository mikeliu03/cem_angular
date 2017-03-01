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
		var table_example = $("#bank_list");
		var dialog_bank_list = $("#dialog_bank_list");
		var chk_all = $("#bank_list_checkbox");
		var dialog = $("#supplier_modal");
		var dialog_bank = null;
		var dialog_bank_list = $("#dialog_bank_list");
		var supplierId = $("#supplierId").val();
		var param = {"refid":supplierId};   //获取供应商ID
		var table = table_example.DataTable({
		processing: true,		// 服务器端获取数据时，需添加
		serverSide: true,			// 服务器端获取数据时，需添加
		ajax: {
	         url: "searchBankAccountInfoBySupplier.ajax",
	         type: "POST",
	         data: param
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
			{data: "bankName"},
			{data: "accountName"},
			{data: "bankAccountNo"},
			{data: "payMethod"},
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
			{	searchable: false,
				data: "puborpri",
				 render: function (data) {
		           if(data=="0"){
		        	   return "对公";
		           } else if(data=="1"){
		        	   return "对私";
		           } else {
		        	   return "";
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
	utils.common_switch();
	// 添加账户
	$("#supplier_add").click(function(){
		var paymethodcombox =  $("#bank_paymethod");
		findObjects("paymethod",paymethodcombox);
		// 清空选项
		$("#bank_name").val("");
		$("#bank_detail").hide();
		$("#username").val("");
		$("#count").val("");
		$("#card_type").val("1");
		$("#is_enable")[0].checked = true;
		$("#is_enable").closest(".fee-switch").removeClass("actived");
		$(".modal-title", supplier_modal).text("添加开户行及卡号");
		$("#bankOperation").val("add");
		// 隐藏银行选择列表
		dialog.modal("show");
	});
	//修改账户
	$("#supplier_update").click(function(){
		$(".modal-title", supplier_modal).text("修改开户行及卡号");
		$("#bankOperation").val("update");
		var checked_elem = $("tbody :checkbox:checked", table_example);
		if(checked_elem.length <= 0){
			utils.cem_message("请选择一条记录。");
			return false;
		}else if(checked_elem.length > 1){
			utils.cem_message("一次只能修改一条记录。");
			return false;
		}
		var paymethodcombox =  $("#bank_paymethod");
		findObjects("paymethod",paymethodcombox);
		var selected_tr = table.row(checked_elem.closest("tr")[0]).data();
		utils.post("findBankAccountInfoBySupplier.ajax",{id:selected_tr.id},function(data){
			$("#bankID").val(selected_tr.id);
			$("#bank_name").val(selected_tr.bankName);
			$("#bank_detail").hide();
			//init_dialog_bank({});
			$("#username").val(selected_tr.accountName);
			$("#count").val(selected_tr.bankAccountNo);
			$("#bank_code").val(data.bankCode);
			$("#bank_paymethod").val(data.payMethod);
			$("#card_type").val(data.isCard);
			$("#puborpri").val(data.puborpri);
			if(selected_tr.enable=="000"){
				$("#is_enable").closest(".fee-switch").removeClass("actived");
				$("#is_enable")[0].checked = true;
			}else if(selected_tr.enable=="001"){
				$("#is_enable").closest(".fee-switch").addClass("actived");
				$("#is_enable")[0].checked = false;
			}
		});
		dialog.modal("show");
	});
	//删除
	$("#supplier_delete").click(function(){
		var checked_elem = $("tbody :checkbox:checked", table_example);
		if(checked_elem.length <= 0){
			utils.cem_message("请选择一条记录。");
			return false;
		}else if(checked_elem.length > 1){
			utils.cem_message("一次只能修改一条记录。");
			return false;
		}
	    var selected_tr = table.row(checked_elem.closest("tr")[0]).data();
	    utils.cem_alert("确定要删除吗？",function(){
	    	utils.post("deleteBankAccountInfoBySupplier.ajax",{id:selected_tr.id},function(data){
	    		utils.cem_message("银行信息删除成功！");
		        table.draw();
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
	        utils.post("updateSupplierBankStatus.ajax",{ids: ids + "",enable: enable},function(data){
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
	init_dialog();
	//添加账户MODAL
	$.validator.addMethod("supplier_blank_count",function(value,element){
		return this.optional(element)||/^[0-9\-\-]*$/.test(value);
		
	},"请输入包含数字或'-'的银行卡信息！");
	function init_dialog(){
//		init_dialog_bank();
	
		$("#bank_name").click(function(){
			$("#bank_detail").show();
			init_dialog_bank();
		});
	
		$("#bank_form").tooltip({
			show: false,
			hide: false
		});
		$("#bank_form").validate({
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
				 var form_data = $(form).serializeArray();
				 var bankOperation = $("#bankOperation").val();
				 var username = $("#username").val();
				 if(/[\!\@\#\$\%\^\&\*\~\\\;\'\/\{\}\|\:\"\<\>\?]/g.test(username)){
						utils.cem_message("收款人名称不能有特殊字符");
						return false;
					}
				 if (bankOperation == "add") {
			     utils.ajax({
		                url: "addBankAccountInfoBySupplier.ajax",
		                data: form_data,
		                type: "post",
		                timeout: 8000,
		                success: function(data){
		                	if(data=="repeatCode"){
		                		utils.cem_message("银行账户已存在，请重新输入！");
		                	} else{
		                		 	table.ajax.reload();
				                    dialog.modal("hide");
				                    utils.cem_message("添加成功");
		                	}
//		                    var ref_id = $("#ref_id").val();
//		        			var params = {"refid":ref_id};
//		        	        init_bank_list(params);
		                }
		            });
				 } else if(bankOperation == "update"){
				     utils.ajax({
			                url: "updateBankAccountInfoBySupplier.ajax",
			                data: form_data,
			                type: "post",
			                timeout: 8000,
			                success: function(data){
			                	if(data=="repeatCode"){
			                		utils.cem_message("银行账户已存在，请重新输入！");
			                	} else{
			                		//刷新供应商表格
				                    table.ajax.reload();
				                    dialog.modal("hide");
				                    utils.cem_message("修改成功");
			                	}
			                }
			            });
				 }
			},
			// 添加验证规则
			rules: {
				bank_name: {
					required: true
				},
				username: {
					required: true,
				},
				count: {
					required: true,
					supplier_blank_count: true
				}
			},
			// 验证规则对应的提示信息，如果不填写，则使用框架默认的提示信息。
			messages: {
				bank_name: {
					required: "请输入银行"
				},
				username: {
					required: "请输入收款人名称",
				},
				count: {
					required: "请输入银行帐号",
				}
			}
		});
	}
	function init_dialog_bank(){
		if(dialog_bank){
			//$("#bank_detail input").val("");
			//dialog_bank.settings()[0].ajax.data.provincename = provincename;
			dialog_bank.ajax.reload();
			return;
		}
		dialog_bank = dialog_bank_list.DataTable({
			processing: true,		// 服务器端获取数据时，需添加
			serverSide: true,			// 服务器端获取数据时，需添加
			ajax: {
				url: "findBankInfoList.ajax",
				type:"post",
				data: {
					columnsLength: $("thead th", dialog_bank_list).length	
				}
			},
			lengthChange: false,
			info:false,
			ordering: true,
			columns: [
				{data: "bankcode"},
				{data: "bankname"}
			]
		});
		init_table_search(dialog_bank_list);
	
		// 行点击事件
		dialog_bank_list.on("click", "tbody tr", function(){
			var selected_data = dialog_bank.row(this).data();
			$("#bank_name").val(selected_data.bankname);
			$("#bank_code").val(selected_data.bankcode);
			$("#bank_detail").hide();
		});
	}
	
	function init_table_search(table, arr){
		arr = arr || [];
		table = $(table);
		var id = "#" + table[0].id;
		var context = table.closest(".cem-table");
		var search_c = $('<div class="btn-group container-fluid cem-permission cem-table-search" style="width:100%;top:10px;"><div class="row"><div class="col-lg-4"><div class="input-group"><span class="input-group-addon">地域</span><input type="text" class="form-control"/></div></div><div class="col-lg-4"><div class="select-group"><select class="form-control"></select></div></div><div class="col-lg-4"><div class="input-group"><input type="text" class="form-control" placeholder="搜索条件"><span class="input-group-btn"><button class="btn btn-default" type="button">搜索</button></span></div></div></div></div>');
		var str = '';
		$("thead th", table).each(function(index){
			var _text = $(this).text();
			if(_text && arr.indexOf(index) < 0){
				if(index==1){
					str = '<option value="'+(id+' thead th:eq('+index+')')+'">'+_text+'</option>'+str;
				} else {
					str += '<option value="'+(id+' thead th:eq('+index+')')+'">'+_text+'</option>';
				}
			}
		});
		$("select", search_c).html(str);
	
		context.prepend(search_c);
	
		$("button", search_c).click(function(){
			var t = table.DataTable();
			var _input = $("input:eq(1)", search_c);
	//		var _value = $.trim(_input.val());
			var _value = { "startValue": $.trim(_input.val()) };
			
			t.columns().every(function(){
				this.search("");
			});
			t.settings()[0].ajax.data.provincename = $.trim($("input:eq(0)", search_c).val());
	//		t.column($("select", search_c).val()).search(_value).draw();
			t.column($("select", search_c).val()).search(JSON.stringify(_value)).draw();
		});
	}
	
	//初始化下拉框
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