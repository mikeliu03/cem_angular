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

// 引入公共脚本：header和左侧menu
require(["common"]);

require(["utils", "jq_ui", "bootstrap", "jq_ztree", "jq_validata_msg", "datatables"], function (utils) {
    var table_example = $("#table_example");
    var chk_all = $("#table_example_all");
    var p_operate = $("#add_type");
    var o_operate = $("#add_member");
    var d_operate = $("#add_dept");

    var table = table_example.DataTable({
        processing: true,		// 服务器端获取数据时，需添加
        serverSide: true,		// 服务器端获取数据时，需添加
        lengthChange: false,
        ajax: {
            url: "searchAllObjectTypeInfoPage.ajax",
            type: "POST",
            data: {
                columnsLength: $("thead th", table_example).length
            }
        },
        info: false,
        columns: [{
            searchable: false,
            data: "id",
            render: function (data) {
                return "<input type='checkbox' value='" + data + "' />";
            },
            orderable: false,
            width: "8",
        },
            {data: "name"},
            {
                searchable: false,
                data: "enable",
                render: function (data) {
                    return data == "000" ? "启用" : "禁用";

                },
                orderable: false
            },
            {
                searchable: false,
                data: "isBudget",
                render: function (data) {
                    return data == "000" ? "是" : "否";

                },
                orderable: false
            },
            {
                searchable: false,
                data: "isDataAccess",
                render: function (data) {
                    return data == "000" ? "是" : "否";

                },
                orderable: false
            },
            {
                searchable: false,
                data: "isDeductible",
                render: function (data) {
                    return data == "000" ? "是" : "否";

                },
                orderable: false
            },
            {
                searchable: false,
                data: "isContract",
                render: function (data) {
                    return data == "000" ? "是" : "否";

                },
                orderable: false
            },
            {
                searchable: false,
                data: "isAccounting",
                render: function (data) {
                    return data == "000" ? "是" : "否";

                },
                orderable: false
            }
        ],
        order: [[1, 'asc']]
    });

    // 注册表格单页全选事件
    chk_all.click(function () {
        var _this = this;
        $("tbody :checkbox", table_example).each(function () {
            this.checked = _this.checked;
        });
    });
    table_example.on("click", "tbody :checkbox[data-id='id']", function () {
        var checked_len = $("tbody :checkbox:checked[data-id='id']", table_example).length;
        var chk_len = $("tbody :checkbox[data-id='id']", table_example).length;

        chk_all[0].checked = checked_len === chk_len;
    });
    table_example.on('click', 'tbody tr', function () {
        table.$('tr.selected').removeClass('selected');
        $(this).addClass('selected');
        // 动态加载树
        var selected_tr = table.row(this).data();
        showObjectTree(selected_tr.id);
		$("#btns1 button").removeClass("disabled");
    });
    $("#table_example_paginate").click(function(){
    	chk_all.attr("checked",false);
    });
    utils.init_table_search(table_example);
    
    // 给表单添加验证
    // 绑定验证
    $("#type_form").tooltip({
        show: false,
        hide: false
    });
    //提交维度类型
    $("#type_form").validate({
        // 使用jquery-ui风格进行验证提示
        showErrors: function (map, list) {
            var focussed = document.activeElement;
            if (focussed && $(focussed).is("input, textarea")) {
                $(this.currentForm).tooltip("close", {
                    currentTarget: focussed
                }, true);
            }
            this.currentElements.removeAttr("title").removeClass("ui-state-highlight");
            $.each(list, function (index, error) {
                $(error.element).attr("title", error.message).addClass("ui-state-highlight");
            });
            if (focussed && $(focussed).is("input, textarea")) {
                $(this.currentForm).tooltip("open", {
                    target: focussed
                });
            }
        },
        // 异步提交时添加到方法，如果不添加此方法，验证通过后，会进行同步提交。
        submitHandler: function (form) {
        	// 序列化表单
            var form_data = $(form).serialize();
            $("#table_example_all").trigger("click");
            var operation = $("#operation").val();
            var name=$("#name").val();
            if (operation == "add") {
                // 提交异步表单请求
                utils.post("addObjectTypeInfo.ajax",form_data,function(data){
                	utils.cem_message(data);
                	p_operate.modal("hide");
                    table.draw();
                    
                    table.$('tr.selected').removeClass('selected');
                    $(this).addClass('selected');
                    // 动态加载树
                    var selected_tr = table.row(this).data();
                    showObjectTree(selected_tr.id);
                });
            } else if (operation == "update") {
                utils.post("updateObjectTypeInfo.ajax",form_data,function(data){
                	p_operate.modal("hide");
                    table.draw();
                    
                    table.$('tr.selected').removeClass('selected');
                    $(this).addClass('selected');
                    // 动态加载树
                    var selected_tr = table.row(this).data();
                    showObjectTree(selected_tr.id);
                });
            }
        },
        // 添加验证规则
        rules: {
            name: {
                required: true,
                no_special_char:true
            }
        },
        // 验证规则对应的提示信息，如果不填写，则使用框架默认的提示信息。
        messages: {
            name: {
                required: "请输入名称！"
            }
        }
    });

    //第一次调用时为维度类型的ID，之后为维度ID
    var dimElement = null;
    function showObjectTree(id) {
    	utils.post("searchAllObjectTypeInfoPage1.ajax", {id: id}, function(data){
    		dimElement = data.isContract;
    		_showObjectTreeCall(id);
    		$("#objectSearchId").val(id);
    	});
    }
    function _showObjectTreeCall(id) {
        var setting = {
            async: {
                enable: true,
                autoParam: ["id=parentId", "type", "isParent", "typeFlag"],
                url: "getObjectTree.ajax?id=" + id,
                type: "POST",
                dataType: "json",
                dataFilter: function (treeId, parentNode, responseData) {
                    return responseData.rspData;
                }
            },
            data: {
                key: {
                    checked: "checked",
                    children: "children",
                    name: "name",
                    title: "name",
                    url: "url"
                },
                simpleData: {
                    enable: true,
                    idKey: "id",
                    pIdKey: "parentId",
                    rootPId: "0"
                },
                view: {
                    fontCss: function (treeId, treeNode) {
                        return (!!treeNode.highlight) ? {color: "#A60000", "font-weight": "bold"} : {
                            color: "#333",
                            "font-weight": "normal"
                        };
                    }
                }
            },
            callback: {
                onClick: _tree_click
            }
        };
        $.fn.zTree.init($("#p_ztree"), setting);
    }
    
    // 树节点点击事件
    function _tree_click(event, treeId, treeNode) {
        //按钮权限控制
        _btns_control(treeNode);
        //如果当前节点的启用状态为“禁用”，则需改变“禁用”按钮为“启用”
//		changeBtnText(treeNode.enable);
    }

    // 按钮权限控制
    function _btns_control(treeNode) {
        var node_type = treeNode.type;//节点类型
        if (node_type == "T") {
            if ("000" == treeNode.typeFlag) {//组织机构
                $("#add_member_btn").addClass("disabled");
            } else {
                $("#add_member_btn").removeClass("disabled");
            }

            $("#update_member_btn").addClass("disabled");
            $("#delete_member_btn").addClass("disabled");
            $("#object_enable").addClass("disabled");
            $("#object_stop").addClass("disabled");
        } else {
            $("#add_member_btn").removeClass("disabled");
            $("#update_member_btn").removeClass("disabled");
            $("#delete_member_btn").removeClass("disabled");
            $("#object_enable").removeClass("disabled");
            $("#object_stop").removeClass("disabled");
        }
    }

    //如果当前节点的启用状态为“禁用”，则需改变“禁用”按钮为“启用”
    function changeBtnText(enable) {
        if (enable == "001") {//停用时"禁用"按钮变为“启用”
            $("#object_enable").html("启用");
        } else {
            $("#object_enable").html("禁用");
        }
    }

    //添加类型
    $("#add_type_btn").click(function () {
        $("#operation").val("add");
        $("#id").val("");
        $("#corpId").val("");
        $("#typeFlag").val("");//类型标识，默认为空
        $("#name").val("");
        $("#useType").val("000");//使用类型  000默认，001用于预算002用于权限003用于预算与权限

        $("#isBudget").val("000");//预算控制    000启用001禁用
        $("#isBudget")[0].checked = false;
        $("#isDataAccess").val("000");//数据权限控制    000启用001禁用
        $("#isDataAccess")[0].checked = false;
        
        $("#isDeductible").val("000");//抵扣    000启用001禁用
        $("#isDeductible")[0].checked = false;
        
        $("#isContract").val("000");//关联合同    000启用001禁用
        $("#isContract")[0].checked = false;
        
        $("#isAccounting").val("000");//核算    000启用001禁用
        $("#isAccounting")[0].checked = false;
        

        $("#typeDesc").val("");//类型描述

//		$("#enable")[0].checked = false;
//		$("#enable").val("001");
//		$("#enable").closest(".fee-switch").addClass("actived");
//		
        $(".modal-title", p_operate).html("添加维度类型");
        $("#name").removeAttr("disabled");
    	$("#typeDesc").removeAttr("disabled");
        $("#add_type").modal("show");
    });

    //修改类型
    $("#update_type_btn").click(function () {
        var checked_elem = $("tbody :checkbox:checked", table_example);
        var checked_len = checked_elem.length;

        if (checked_len <= 0) {
            utils.cem_message("请选择一条记录。");
            return false;
        } else if (checked_len > 1) {
            utils.cem_message("一次只能修改一条记录。");
            return false;
        }
        $("#operation").val("update");
        var selected_data = table.row(checked_elem.closest("tr")[0]).data();

        utils.post("searchObjectTypeInfoById.ajax",{id: selected_data.id},function(data){
        	var json = data;
            $("#id").val(json.id);
            $("#corpId").val(json.corpId);
            $("#typeFlag").val(json.typeFlag);
            $("#name").val(json.name);
            $("#useType").val(json.useType);
            $("#isBudget").val("000");
            if (json.isBudget == "000") {
                $("#isBudget")[0].checked = true;
            } else {
                $("#isBudget")[0].checked = false;
            }
            $("#isDataAccess").val("000");
            if (json.isDataAccess == "000") {
                $("#isDataAccess")[0].checked = true;
            } else {
                $("#isDataAccess")[0].checked = false;
            }
            
            $("#isDeductible").val("000");
            
            if (json.isDeductible == "000") {
                $("#isDeductible")[0].checked = true;
            } else {
                $("#isDeductible")[0].checked = false;
            }
            $("#isContract").val("000");
            if (json.isContract == "000") {
                $("#isContract")[0].checked = true;
            } else {
                $("#isContract")[0].checked = false;
            }
            
            $("#isAccounting").val("000");
            if (json.isAccounting == "000") {
                $("#isAccounting")[0].checked = true;
            } else {
                $("#isAccounting")[0].checked = false;
            }
            
            $("#typeDesc").val(json.typeDesc);
            if(selected_data.isSysType=="000"){
            	$("#name").attr("disabled",true);
            	$("#typeDesc").attr("disabled",true);
            }else{
            	$("#name").removeAttr("disabled");
            	$("#typeDesc").removeAttr("disabled");
            }
        });

        $(".modal-title", p_operate).html("修改维度类型");
        $("#add_type").modal("show");
    });

    //删除类型
    $("#delete_type_btn").click(function () {
        var checked_elem = $("tbody :checkbox:checked", table_example);

        if (checked_elem.length <= 0) {
            utils.cem_message("请选择一条记录。");
            return false;
        }
        var selected_data = table.row(checked_elem.closest("tr")[0]).data();
        if(selected_data.isSysType=="000"){
        	utils.cem_message("系统维度不能删除。");
        	return false;
        }
        //检查是否有类型标识为000组织机构的数据，组织机构不能删除
        if (!checkTypeFlag()) {
            utils.cem_message("组织机构不能删除！");
            return false;
        }

        utils.cem_alert("确定要执行删除操作吗？", function () {
            var ids = [];
            checked_elem.each(function () {
                ids.push(this.value);
            });

            // 发送异步请求删除数据
//            $.ajax({
//                url: "deleteObjectTypeInfo.ajax",//
//                type: "POST",
//                data: {ids: ids + ""},
//                dataType: "json",
//                success: function (data) {
//                    if (data != null) {
//                        utils.showMsg(data);
//                        if (data.msgType == "N") {
//                        	$("#p_ztree").html("");
//                            table.draw();
//                        }
//                    }
//                }
//            });
            utils.post("deleteObjectTypeInfo.ajax",{ids: ids + ""},function(data){
            	utils.cem_message(data);
            	$("#p_ztree").html("");
                table.draw();
            });
        });
    });

    //查询要删除的记录中，是否有类型标识为000组织机构的记录
    function checkTypeFlag() {
        var checked_elem = $("tbody :checkbox:checked", table_example);
        var canDel = true;
        var selected_datas = checked_elem.closest("tr");
        selected_datas.each(function () {
            tempTypeFlag = table.row(this).data().typeFlag;
            if (tempTypeFlag == "000") {
                canDel = false;
                return;
            }
        });
        return canDel;
    }

    function checkChecked_elem() {
        var checked_elem = $("tbody :checkbox:checked", table_example);

        if (checked_elem.length <= 0) {
            utils.cem_message("请选择一条记录。");
            return false;
        }
        return true;
    }

    //批量启用
    $("#type_enable").click(function () {
        var checked_elem = $("tbody :checkbox:checked", table_example);
        setEnable(checked_elem, "000");
    });

    //批量禁用
    $("#type_disable").click(function () {
        var checked_elem = $("tbody :checkbox:checked", table_example);
        setEnable(checked_elem, "001");
    });

    /**
     * 启用或禁用
     * checked_elem 选中的记录ID
     * enbale   000启用 001禁用
     */
    function setEnable(checked_elem, enable) {
        var ids = [];
        var typeFlags = [];

        if (checkChecked_elem()) {
            var selected_datas = checked_elem.closest("tr");
            selected_datas.each(function () {
//				alert(table.row(this).data().typeFlag);
                typeFlags.push(table.row(this).data().typeFlag);
            });
            checked_elem.each(function () {
                ids.push(this.value);
            });
            // 发送异步请求
//            $.ajax({
//                url: "setObjectTypeEnable.ajax",//
//                type: "POST",
//                data: {
//                    ids: ids + "",
//                    enable: enable,
//                    typeFlags: typeFlags + ""
//                },
//                dataType: "json",
//                success: function (data) {
//                    if (data != null) {
//                        utils.showMsg(data);
//                        if (data.msgType == "N") {
//                            table.draw();
//                        }
//                    }
//                }
//            });
            var param={
                    ids: ids + "",
                    enable: enable,
                    typeFlags: typeFlags + ""
                };
            utils.post("setObjectTypeEnable.ajax",param,function(data){
            	utils.cem_message(data);
                table.draw();
            });
        }
    }


    /*--------------------------------以下是维度成员的维护---------------------------------------*/

    // 给表单添加验证
    // 绑定验证
    $("#add_tree_node").tooltip({
        show: false,
        hide: false
    });
    //提交维度信息（不包括组织 机构）
    $("#add_tree_node").validate({
        // 使用jquery-ui风格进行验证提示
        showErrors: function (map, list) {
            var focussed = document.activeElement;
            if (focussed && $(focussed).is("input, textarea")) {
                $(this.currentForm).tooltip("close", {
                    currentTarget: focussed
                }, true);
            }
            this.currentElements.removeAttr("title").removeClass("ui-state-highlight");
            $.each(list, function (index, error) {
                $(error.element).attr("title", error.message).addClass("ui-state-highlight");
            });
            if (focussed && $(focussed).is("input, textarea")) {
                $(this.currentForm).tooltip("open", {
                    target: focussed
                });
            }
        },
        // 异步提交时添加到方法，如果不添加此方法，验证通过后，会进行同步提交。
        submitHandler: function (form) {
            // 获取所有选中树节点的ID
            var treeObj = $.fn.zTree.getZTreeObj("p_ztree");
            var nodes = treeObj.getSelectedNodes(true);
            var node = nodes[0];
            var parentName = $("#parentName").val();
            var objName = parseFloat($("#objName").val()) || -1;
            if(parentName == '税率'){
            	if(!(/^(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d{1,2})?$/.test(objName))){
            		utils.cem_message('税率应输入大于或等于零的整数或小数');
            		return false;
            	}
            }else{
            	if(/[\!\@\#\$\%\^\&\*\~\[\]\\\;\'\,\.\/\{\}\|\:\"\<\>\?]/g.test($("#objName").val())){
            		utils.cem_message('名称不能输入特殊字符');
            		return false;
            	}
            }
            //是否可抵扣  1:可以   0:不可以
        	if($("#deductibleFlagCheckbox")[0].checked)
        	{
        		$("#deductibleFlag").val("1");
        	}
        	else
        	{
        		$("#deductibleFlag").val("0");
        	}
        	if($("#contractFlagCheckbox")[0].checked)
        	{
        		$("#contractFlag").val("1");
        	}
        	else
        	{
        		$("#contractFlag").val("0");
        	}
            
            // 序列化表单
            var form_data = $(form).serialize();
            var operation = $("#objOperation").val();
            if (operation == "add") {
                // 提交异步表单请求
                utils.post("addObjectInfo.ajax",form_data,function(data){
                	utils.cem_message(data);
                	treeObj.reAsyncChildNodes(node.getParentNode(), "refresh");
                    o_operate.modal("hide");
                });
            } else if (operation == "update") {
            	form_data=form_data+"&objCode="+$("#objCode").val();
                utils.post("updateObjectInfo.ajax",form_data,function(data){
                	utils.cem_message(data);
                	treeObj.reAsyncChildNodes(node.getParentNode(), "refresh");
                    o_operate.modal("hide");
                });
            }
        },
        // 添加验证规则
        rules: {
            objCode: {
                required: true,
                no_special_char:true
            },
            objName: {
                required: true,
            }
        },
        // 验证规则对应的提示信息，如果不填写，则使用框架默认的提示信息。
        messages: {
            objCode: {
                required: "请输入编码。"
            },
            objName: {
                required: "请输入名称"
            }
        }
    });

    //添加成员,需要区分是否组织机构
    $("#add_member_btn").click(function () {
        var treeObj = $.fn.zTree.getZTreeObj("p_ztree");
        var nodes = treeObj.getSelectedNodes(true);

        if (!_common_valid(nodes)) return;
        var node = nodes[0];
        var rootNode = treeObj.getNodeByParam("parentId", "0", null);//根节点
        var typeFlag = rootNode.typeFlag;
        if (typeFlag == "000") {//组织机构
            setDeptValue_add(node);
        } else {
            setObjectValue_add(node, rootNode);
        }
    });

    //新增部门机构记录时，初始化
    function setDeptValue_add(node) {
        utils.findDictionaryByBatchCode({batchCode: "BUSTYPE"}, "#busType");//初始化属性下拉框
        $("#deptOperation").val("add");
        if (node.type == "T") {//如果当前节点类型为T（类型），也就是根节点
            $("#deptParentName").val("");//父项名称
            $("#deptParentId").val("");//父项ID
            $("#parentLevelCode").val("");//父项的层级CODE
        } else {
            $("#deptParentName").val(node.name);//父项名称
            $("#deptParentId").val(node.id);//父项ID
            $("#parentLevelCode").val(node.levelCode);//父项的层级CODE
        }
        initOrgType(node.type);//初始化类别下拉框
        $("#deptId").val("");
        $("#deptCode").val("");//编码
        $("#deptName").val("");//名称
        $("#deptDescrip").val("");//描述
        //属性下拉框后续补上
        $("#busType").val("1");//属性
//		$("#busType option[value='"+json.busType+"']").attr("selected", "selected");
        
        $(".modal-title", d_operate).html("新增部门机构");
        $("#add_dept").modal("show");
    }

    //根据节点类型来动态初始化组织类别下拉框的值
    function initOrgType(node_type) {
        var datas;
        if (node_type == 'O') {//机构
            datas = {batchCode: "ORGTYPE"};
        } else {//部门
            datas = {batchCode: "ORGTYPE", key: "1"};
        }
        utils.findDictionaryByBatchCode(datas, "#deptType");

        $("#deptType").attr("disabled", false).parent().parent().show();//隐藏类别控件
    }

    //新增维度记录时，初始化
    function setObjectValue_add(node, rootNode) {
        $("#objOperation").val("add");
        if (node.type == "T") {//如果当前节点类型为T（类型），也就是根节点
            $("#parentName").val(node.name);//父项名称
            $("#parentId").val("");//父项ID
            $("#parentTotalCode").val("");//父项的层级CODE
        } else {
            $("#parentName").val(node.name);//父项名称
            $("#parentId").val(node.id);//父项ID
            $("#parentTotalCode").val(node.totalCode);//父项的层级CODE
        }
        $("#objId").val("");
        $("#objCode").val("");//编码
        $("#objName").val("");//名称
        $("#descrip").val("");//描述
        $("#objectTypeName").val(rootNode.name);//维度类型名称
        $("#objectTypeId").val(rootNode.id);//维度类型ID

//		$("#objEnable").val("000");//维度启用状态    000启用001禁用	
//		$("#objEnable")[0].checked=true;
        
        $("#objName").removeAttr("disabled");
   	 	$("#objCode").removeAttr("disabled");
   	 	$("#descrip").removeAttr("disabled");
   	 	$("#deductibleFlagCheckbox").removeAttr("disabled");
   	 	$("#deductibleFlagCheckbox")[0].checked = false;
   	 	$("#object_save").show();
   	 	if(dimElement == "000"){
   	 		$("#contractDiv").show();
   	 	}else{
   	 		$("#contractDiv").hide();
   	 	} 

        $(".modal-title", o_operate).html("新增维度成员");
        $("#add_member").modal("show");
    }

    //修改成员,需要区分是否组织机构
    $("#update_member_btn").click(function () {
        var treeObj = $.fn.zTree.getZTreeObj("p_ztree");
        var nodes = treeObj.getSelectedNodes(true);
        if (!_common_valid(nodes)) return;
        var node = nodes[0];
        var rootNode = treeObj.getNodeByParam("parentId", "0", null);//根节点
        var typeFlag = rootNode.typeFlag;
        if (typeFlag == "000") {//组织机构
            setDeptValue_update(node);
        } else {
            setObjectValue_update(node, rootNode);
        }
    });

    //修改节点内容时，查询部门信息并显示到页面
    function setDeptValue_update(node) {
        utils.findDictionaryByBatchCode({batchCode: "BUSTYPE"}, "#busType");//属性
        $("#deptOperation").val("update");
//        $.ajax({
//            url: "ajaxSearchDeptInfoById.ajax",
//            data: {id: node.id},
//            type: "POST",
//            dataType: "json",
//            success: function (data) {
//                if (data.rspData != null) {
//                    var json = data.rspData;
//                    $("#deptType").attr("disabled", true).parent().parent().hide();//隐藏类别控件
//                    $("#deptId").val(json.id);
//                    $("#deptCorpId").val(json.corpId);
//                    $("#deptParentName").val(node.getParentNode().name || "");//父项名称
//                    $("#deptParentId").val(node.getParentNode().id || "");//父项ID
//                    $("#parentLevelCode").val(node.getParentNode().levelCode || "");//父项的层级CODE
//                    $("#deptCode").val(json.code);//编码
//                    $("#deptName").val(json.name);//名称
//                    $("#deptDescrip").val(json.description);//描述
//                    //属性下拉框后续补上
//                    $("#busType").val(json.busType);//属性
//                    $("#busType option[value='" + json.busType + "']").attr("selected", "selected");
//                }else {//失败
//                	cem_message(data.rspMsg);
//                }
//            }
//        });
        
        utils.post("ajaxSearchDeptInfoById.ajax",{id: node.id},function(data){
        	var json = data;
            $("#deptType").attr("disabled", true).parent().parent().hide();//隐藏类别控件
            $("#deptId").val(json.id);
            $("#deptCorpId").val(json.corpId);
            $("#deptParentName").val(node.getParentNode().name || "");//父项名称
            $("#deptParentId").val(node.getParentNode().id || "");//父项ID
            $("#parentLevelCode").val(node.getParentNode().levelCode || "");//父项的层级CODE
            $("#deptCode").val(json.code);//编码
            $("#deptName").val(json.name);//名称
            $("#deptDescrip").val(json.description);//描述
            //属性下拉框后续补上
            $("#busType").val(json.busType);//属性
            $("#busType option[value='" + json.busType + "']").attr("selected", "selected");
        });

        $(".modal-title", d_operate).html("修改部门机构");
        $("#add_dept").modal("show");
    }

    //修改节点内容时，修改维度成员信息并显示到页面
    function setObjectValue_update(node, rootNode) {
        $("#objOperation").val("update");
        
        utils.post("searchObjectInfoById.ajax",{id: node.id},function(data){
        	var json = data;
            $("#objId").val(json.id);
            $("#objCorpId").val(json.corpId);
            if (json.generation == "1") {
                $("#parentName").val(rootNode.name);//父项名称
                $("#parentId").val("");//父项ID
                $("#parentTotalCode").val("");//父项的层级CODE
            } else {
                $("#parentName").val(node.getParentNode().name || "");//父项名称
                $("#parentId").val(node.getParentNode().id || "");//父项ID
                $("#parentTotalCode").val(node.getParentNode().totalCode || "");//父项的层级CODE
            }

            $("#objectTypeName").val(rootNode.name);//维度类型名称
            $("#objectTypeId").val(rootNode.id);//维度类型ID
            $("#objCode").val(json.code);//编码
            $("#objName").val(json.name);//名称
            $("#descrip").val(json.description);//描述
            //1:可以  0: 不可以   是否可以抵扣
            if(json.deductibleFlag == "1")
            {
            	$("#deductibleFlagCheckbox")[0].checked = true;
            }
            else
            {
            	$("#deductibleFlagCheckbox")[0].checked = false;
            }
            
            $("#objCode").attr("disabled","disabled");
            //增值税专用发票  不可维护
            if(json.code == "VAT001")
            {
            	$("#objName").attr("disabled","disabled");
//            	 $("#objCode").attr("disabled","disabled");
            	 $("#descrip").attr("disabled","disabled");
            	 $("#deductibleFlagCheckbox").attr("disabled","disabled");
            	 $("#object_save").hide();
            }
            else
            {
            	$("#objName").removeAttr("disabled");
//           	 	$("#objCode").removeAttr("disabled");
           	 	$("#descrip").removeAttr("disabled");
           	 	$("#deductibleFlagCheckbox").removeAttr("disabled");
           	 	$("#object_save").show();
            }	
            
            if(dimElement == "000"){
       	 		$("#contractDiv").show();
       	 		//是否关联合同  1:关联合同  0:不关联合同
                if(json.contractFlag == "1")
                {
                	$("#contractFlagCheckbox")[0].checked = true;
                }
                else
                {
                	$("#contractFlagCheckbox")[0].checked = false;
                }
       	 	}else{
       	 		$("#contractDiv").hide();
       	 	} 
        });
        $(".modal-title", o_operate).html("修改维度成员");
        $("#add_member").modal("show");
        
    }

    //删除成员
    $("#delete_member_btn").click(function () {
        var treeObj = $.fn.zTree.getZTreeObj("p_ztree");
        var nodes = treeObj.getSelectedNodes(true);
        var rootNode = treeObj.getNodeByParam("parentId", "0", null);//根节点

        if (!_common_valid(nodes)) return;

        var node = nodes[0];

        if (node.children && node.children.length > 0) {
            utils.cem_message("该节点包含子节点，不能被删除。");
            return;
        }

        var url = "";
        var datas = {};
        var typeFlag = rootNode.typeFlag;
        if (typeFlag == "000") {//组织机构
            var type = node.type == "O" ? "0" : "1";
            var corpId = node.corpId;
            var qParentId = node.parentId;
            url = "deleteDeptInfo.ajax";
            datas = {
                id: node.id,
                type: type,
                corpId: corpId,
                qParentId: qParentId
            };
        } else {
            url = "deleteObjectInfo.ajax";
            datas = {
                id: node.id,
                parentId: node.parentId
            };
        }

        utils.cem_alert("确定要删除该节点吗？", function () {
            // 执行删除操作
//            $.ajax({
//                url: url,
//                data: datas,
//                type: "POST",
//                dataType: "json",
//                success: function (data) {
//                    if (data != null) {
//                        utils.showMsg(data);
//                        if (data.msgType == "N") {
//                        	treeObj.removeNode(node);
//                        }
//                    }
//                }
//            });
            utils.post(url,datas,function(data){
            	utils.cem_message(data);
            	treeObj.removeNode(node);
            });
        });
    });

    //根据当前节点是否有子节点来确定isParent的值
    function setIsParen(node) {
        if (node != null || node.children == null || node.children.length == null || node.children.length <= 0) {//没有子节点
            node.isParent = false;
        } else {
            node.isParent = true;
        }
    }

    function _common_valid(nodes) {
        // 没有选中成员或分组
        if (nodes.length <= 0) {
            utils.cem_message("请选择节点。");
            return false;
        }
        // 一次只能移动一个成员或分组
        if (nodes.length > 1) {
            utils.cem_message("请选择一个节点进行操作。");
            return false;
        }
        return true;
    }


    // 绑定验证
    $("#add_dept_node").tooltip({
        show: false,
        hide: false
    });
    //提交组织机构信息
    $("#add_dept_node").validate({
        // 使用jquery-ui风格进行验证提示
        showErrors: function (map, list) {
            var focussed = document.activeElement;
            if (focussed && $(focussed).is("input, textarea")) {
                $(this.currentForm).tooltip("close", {
                    currentTarget: focussed
                }, true);
            }
            this.currentElements.removeAttr("title").removeClass("ui-state-highlight");
            $.each(list, function (index, error) {
                $(error.element).attr("title", error.message).addClass("ui-state-highlight");
            });
            if (focussed && $(focussed).is("input, textarea")) {
                $(this.currentForm).tooltip("open", {
                    target: focussed
                });
            }
        },
        // 异步提交时添加到方法，如果不添加此方法，验证通过后，会进行同步提交。
        submitHandler: function (form) {
            // 获取所有选中树节点的ID
            var treeObj = $.fn.zTree.getZTreeObj("p_ztree");
            var nodes = treeObj.getSelectedNodes(true);
            var node = nodes[0];
            var datas = formatDeptData();

            // 序列化表单
//			var form_data = $(form).serialize();
            var operation = $("#deptOperation").val();
            if (operation == "add") {
                // 提交异步表单请求
                utils.post("addDeptInfo.ajax",datas,function(data){
                	utils.cem_message(data);
                	treeObj.reAsyncChildNodes(node.getParentNode(), "refresh");
                    d_operate.modal("hide");
                });
            } else if (operation == "update") {
                utils.post("updateDeptInfo.ajax",datas,function(data){
                	utils.cem_message(data);
                	treeObj.reAsyncChildNodes(node.getParentNode(), "refresh");
                    d_operate.modal("hide");
                });
            }
        },
        // 添加验证规则
        rules: {
            objCode: {
                required: true
            },
            objName: {
                required: true
            }
        },
        // 验证规则对应的提示信息，如果不填写，则使用框架默认的提示信息。
        messages: {
            objCode: {
                required: "请输入编码。"
            },
            objName: {
                required: "请输入名称"
            }
        }
    });

    //将字段名整理成与部门机构维护模块的一致
    function formatDeptData() {
        var id = $("#deptId").val();
        var parentId = $("#deptParentId").val();
        var busType = $("#busType").val();
        var name = $("#deptName").val();
        var code = $("#deptCode").val();
        var descrip = $("#deptDescrip").val();
        var parentLevelCode = $("#parentLevelCode").val();
        var corpId = $("#deptCode").val();
        var type = $("#deptType").val();
        var datas = {
            id: id,
            parentId: parentId,
            busType: busType,
            name: name,
            code: code,
            descrip: descrip,
            parentLevelCode: parentLevelCode,
            corpId: corpId,
            type: type
        };
        return datas;
    }

    // 停用按钮click事件
    $("#object_stop").click(function () {
        var treeObj = $.fn.zTree.getZTreeObj("p_ztree");
        var nodes = treeObj.getSelectedNodes(true);

        if (!_common_valid(nodes)) return;

        var node = nodes[0];

//		if(node.children){
//			utils.cem_alert("该节点包含子节点，不能被禁用。");
//			return;
//		}

        if (node.isParent) {
            utils.cem_alert("该节点有子节点，确定要禁用吗？", function () {
                setTreeNodeEnable("001");
            });
        } else {
            utils.cem_alert("确定要禁用该节点吗？", function () {
                setTreeNodeEnable("001");
            });
        }

    });

    // 启用按钮click事件
    $("#object_enable").click(function () {
        var treeObj = $.fn.zTree.getZTreeObj("p_ztree");
        var nodes = treeObj.getSelectedNodes(true);

        if (!_common_valid(nodes)) return;

        setTreeNodeEnable("000");

    });

    //启用或停用维度成员、部门
    function setTreeNodeEnable(enable) {
        var treeObj = $.fn.zTree.getZTreeObj("p_ztree");
        var nodes = treeObj.getSelectedNodes(true);
        var rootNode = treeObj.getNodeByParam("parentId", "0", null);//根节点
        var node = nodes[0];
        if (!_common_valid(nodes)) return;

        var typeFlag = rootNode.typeFlag;
        if (typeFlag == "000") {//禁用、启用部门机构
            setDeptEnable(node, enable);
        } else {//启用、禁用维度成员
            setObjectEnable(node, enable);
        }
    }

    //启用或停用部门
    function setDeptEnable(node, enable) {
        if (node.isParent) {
            utils.cem_message("该节点包含子节点，不能被禁用。");
            return;
        }

        var treeObj = $.fn.zTree.getZTreeObj("p_ztree");
        var nodes = treeObj.getSelectedNodes(true);
        var node = nodes[0];
        var type = node.type == "O" ? "0" : "1";
        var corpId = node.corpId;
        var msg = enable == "000" ? "启用成功" : "禁用成功";
//        $.ajax({
//            url: "setDeptEnable.ajax",
//            data: {
//                parentId: node.id,
//                type: type,
//                corpId: corpId,
//                enable: enable
//            },
//            dataType: "json",
//            type: "POST",
//            success: function (data) {
//                if (data != null) {
//                    treeObj.reAsyncChildNodes(node.getParentNode(), "refresh");
//                    if (data.msgType == "N") {//成功
//                    	utils.cem_message(msg);
//                    } else {
//                    	utils.cem_message(data.rspMsg);
//                    }
//                    treeObj.removeNode(node);
//                }
//            }
//        });
        
        var param={
                parentId: node.id,
                type: type,
                corpId: corpId,
                enable: enable
            };
        utils.post("setDeptEnable.ajax",param,function(data){
        	treeObj.reAsyncChildNodes(node.getParentNode(), "refresh");
        	utils.cem_message(msg);
        	treeObj.removeNode(node);
        });
    }

    //启用或停用维度成员
    function setObjectEnable(node, enable) {
        var treeObj = $.fn.zTree.getZTreeObj("p_ztree");
        var nodes = treeObj.getSelectedNodes(true);
        var node = nodes[0];
        var msg = enable == "000" ? "启用成功" : "禁用成功";

        if (!_common_valid(nodes)) return;

//        $.ajax({
//            url: "setObjectEnable.ajax",
//            data: {
//                parentId: node.parentId,
//                id: node.id,
//                enable: enable
//            },
//            dataType: "json",
//            type: "POST",
//            success: function (data) {
//                if (data != null) {
//                    if (data.msgType == "N") {//成功
//                    	utils.cem_message(msg);
//                        if (enable == "000") {
//                            treeObj.reAsyncChildNodes(node.getParentNode().getParentNode(), "refresh");
////							treeObj.expandNode(node.getParentNode(), true, true, true);
//                        } else {
//                            treeObj.reAsyncChildNodes(node.getParentNode(), "refresh");
//                        }
//                    } else {
//                    	utils.cem_message(data.rspMsg);
//                    }
//                }
//            }
//        });
        var param={
              parentId: node.parentId,
              id: node.id,
              enable: enable
          };
        utils.post("setObjectEnable.ajax",param,function(data){
        	utils.cem_message(msg);
        	if (enable == "000") {
                treeObj.reAsyncChildNodes(node.getParentNode(), "refresh");//getParentNode()
            } else {
                treeObj.reAsyncChildNodes(node.getParentNode(), "refresh");
            }
        });
    }
    /**
	 * 选中节点获取所有子节点进行导出操作
	 * **/
	$("#tree_export").click(function() {
		var treeObj = $.fn.zTree.getZTreeObj("p_ztree");
		if(treeObj==null){
			 utils.cem_message("请选择维度类型！");
	         return;
		}
		var nodes = treeObj.getSelectedNodes(true);
		var node =null;
//		if (nodes.length==0) {
//            utils.cem_message("请选择导出节点！");
//            return;
            node = treeObj.getNodeByParam("parentId", "0", null);//根节点
//        }else{
//        	node = nodes[0];
//        }
		var id = node.id;
		var param = {};
		param["id"] = id;
		//导出
		download("exportObjectData.ajax",param, "POST",node);
	});
	// 获得url和data
	function download(url, data, method,node){    
	    if( url && data ){ 
	        // data 是 string 或者 array/object
	        data = typeof data == 'string' ? data : jQuery.param(data);        // 把参数组装成 form的  input
	        var inputs = '';
	            inputs+='<input type="hidden" name="id" value="'+ node.id +'" />'; 
	            inputs+='<input type="hidden" name="typeFlag" value="'+ node.typeFlag +'" />'; 
	          
	        // request发送请求
	        jQuery('<form action="'+ url +'" method="'+ (method||'post') +'">'+inputs+'</form>')
	        .appendTo('body').submit().remove();
	    }
	};
    $("#tree_search_btn").click(function(){
			var param = {};
			//var target_url = modal_ztree.data('target').data("url");
			param["id"] = $("#objectSearchId").val();
			param["objectTypeId"] = $("#objectSearchId").val();
			param["name"] = $.trim($("#tree_search").val());
			$.ajax({
				url: "searchObjectTreeByName.ajax",
				type: "post",
				data:param,
				dataType: "json",
				success: function(data){
					data = data.rspData;
					var setting = {
						async: {
								enable: true,
								autoParam: ["id=parentId", "type", "isParent", "typeFlag"],
			                    otherParam: param,
			                    url: "getObjectTree.ajax",
			                    type: "POST",
			                    dataType: "json",
			                    dataFilter: function (treeId, parentNode, responseData) {
			                        return responseData.rspData;
			                    }
							},
		                data: {
		                    simpleData: {
		                    	enable: true,
		                    	idKey: "id",
		                    	pIdKey: "parentId",
		                    	rootPId: "0"
		                    }
		                }
		            };
					
					var isEmptyVal = !($.trim($("#tree_search").val()) != "" && $.trim($("#tree_search").val()));
					var zTree = $.fn.zTree.getZTreeObj("p_ztree");
					zTree.destroy();
					$.fn.zTree.init($("#p_ztree"), setting,data);
					
					!isEmptyVal && zTree.expandAll(true);
				}
		 });	
	   });
});