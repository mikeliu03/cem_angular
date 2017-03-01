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
    _show_typeRef_info();
    // 加载所有的维度类型关联信息
    function _show_typeRef_info() {
//        $.ajax({
//            url: "searchAllObjectTypeReveInfo.ajax",
//            type: "POST",
//            dataType: "json",
//            success: function (data) {
//                if (data.rspData != null) {
//                    var json = data.rspData;
//                    var divHtml = "";
//                    var enableStr = "";
//                    for (var i = 0; i < json.length; i++) {
//                        enableStr = json[i].enable == "000" ? "" : "(禁用)";
//                        divHtml += "<div class='cem-table-row' id='" + json[i].id + "'>";
//                        divHtml += "<div class='cem-table-col'>";
//                        divHtml += "<span class='cem-icon-size'></span>";
//                        divHtml += "</div>";
//                        divHtml += "<div class='cem-table-col'>";
//                        divHtml += "<div class='cem-size-ico'>";
//                        divHtml += "<input type='hidden' id='" + json[i].id + "_enable' value='" + json[i].enable + "'>";
//                        divHtml += "<input type='hidden' id='" + json[i].id + "_sourceTypeId' value='" + json[i].sourceTypeId + "'>";
//                        divHtml += "<input type='hidden' id='" + json[i].id + "_targetTypeId' value='" + json[i].targetTypeId + "'>";
//                        divHtml += "<input type='hidden' id='" + json[i].id + "_typeFlag' value='" + json[i].typeFlag + "'>";
//                        divHtml += "<span id='" + json[i].id + "_sourceTypeName'>" + json[i].sourceTypeName + "</span> ";
//                        divHtml += "<span id='" + json[i].id + "_targetTypeName'>" + json[i].targetTypeName + "</span> " + enableStr + "";
//                        divHtml += "</div>";
//                        divHtml += "</div>";
//                        divHtml += "</div>";
//                    }
//                    $("#tpyeRef").html(divHtml);
//                }
//            }
//        });
        
        utils.post("searchAllObjectTypeReveInfo.ajax",{},function(data){
        	var json = data;
            var divHtml = "";
            var enableStr = "";
            for (var i = 0; i < json.length; i++) {
                enableStr = json[i].enable == "000" ? "" : "(禁用)";
                divHtml += "<div class='cem-table-row' id='" + json[i].id + "'>";
                divHtml += "<div class='cem-table-col'>";
                divHtml += "<span class='cem-icon-size'></span>";
                divHtml += "</div>";
                divHtml += "<div class='cem-table-col'>";
                divHtml += "<div class='cem-size-ico'>";
                divHtml += "<input type='hidden' id='" + json[i].id + "_enable' value='" + json[i].enable + "'>";
                divHtml += "<input type='hidden' id='" + json[i].id + "_sourceTypeId' value='" + json[i].sourceTypeId + "'>";
                divHtml += "<input type='hidden' id='" + json[i].id + "_targetTypeId' value='" + json[i].targetTypeId + "'>";
                divHtml += "<input type='hidden' id='" + json[i].id + "_typeFlag' value='" + json[i].typeFlag + "'>";
                divHtml += ""+json[i].billName+"<br>";
                divHtml += "<span id='" + json[i].id + "_sourceTypeName'>" + json[i].sourceTypeName + "</span> ";
                divHtml += "<span id='" + json[i].id + "_targetTypeName'>" + json[i].targetTypeName + "</span> " + enableStr + "";                
                divHtml += "</div>";
                divHtml += "</div>";
                divHtml += "</div>";
            }
            $("#tpyeRef").html(divHtml);
        });
        $("#add_objref_btn").addClass("disabled");
    }

    // 根据源维度类型ID获得源维度树
    function getSourceObjectTree(sourceTypeId) {
        // check: {
        // enable: true,
        // chkStyle: "radio",
        // radioType: "all"
        // },
        var setting = {
            async: {
                enable: true,
                url: "getObjectTree.ajax?id=" + sourceTypeId,// getObjectTree.do
                autoParam: ["id=parentId", "type", "isParent", "isRef", "typeFlag"],
                type: "POST",
                dataType: "json",
                otherParam: ["enable", "000"],// 只查询启用状态的记录
                dataFilter: function (treeId, parentNode, responseData) {
                    return responseData.rspData;
                }
            },
            data: {
                keep: {
                    leaf: true
                },
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
                        return (!!treeNode.highlight) ? {
                            color: "#A60000",
                            "font-weight": "bold"
                        } : {
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

    utils.common_switch();

    // 点击一行类型关联记录时，中间显示该类型关联下的源维度类型树
    $("#tpyeRef").on("click", ".cem-table-row", function () {
        $(this).addClass("actived").siblings().removeClass("actived");

        getSourceObjectTree($("#" + this.id + "_sourceTypeId").val());
        // 如果当前记录的启用状态为“禁用”，则需改变“停用”按钮为“启用”
        changeBtnText(this.id);
        // 将当前记录的ID放入隐藏域，方便后期操作
        $("#currentTypeRefId").val(this.id);
    });

    // 如果当前记录的启用状态为“禁用”，则需改变“停用”按钮为“启用”
    function changeBtnText(id) {
        var enable = $("#" + id + "_enable").val();// 当前记录的启用状态
        if (enable == "001") {// 停用时"停用"按钮变为“启用”
            $("#func_stop").html("禁用");
        } else {
            $("#func_stop").html("禁用");
        }
        //将编辑维度成员映射按钮置灰
        $("#add_objref_btn").addClass("disabled");
    }

    // 添加维度类型映射
    $("#add_map_btn").click(function () {
        // 初始化维度类型下拉列表
        initTypeSelect();
        //初始化单据组和单据树
        initBillTree();
//		 _init_add_dialog();
        $("#type_map").modal("show");
    });

    // 初始化维度类型下拉框
    function initTypeSelect() {
//        $.ajax({
//            type: "POST",
//            url: "searchAllObjectTypeInfo.ajax",
//            data: {
//                enable: "000"
//            },
//            dataType: "json",
//            success: function (data) {
//                var html = "";
//                if (data.rspData != null) {
//                    var json = eval(data.rspData);
//                    $.each(json, function (index, entity) {
//                        html += "<option value='" + entity.id + "'>"
//                            + entity.name + "</option>";
//                    });
//                }else {//失败
//                	cem_message(data.rspMsg);
//                }
//                $("#sourceTypeSelect").html(html);
//                $("#targetTypeSelect").html(html);
//            }
//        });
        
        utils.post("searchAllObjectTypeInfo.ajax",{enable: "000"},function(data){
        	var html = "";
        	var json = eval(data);
            $.each(json, function (index, entity) {
                html += "<option value='" + entity.id + "'>"
                    + entity.name + "</option>";
            });
            $("#sourceTypeSelect").html(html);
            $("#targetTypeSelect").html(html);
        });
    }

    //初始化单据树
    function initBillTree() {
        var setting = {
            async: {
                enable: true,
                url: "queryBillAndGroupAction.ajax",
                type: "POST",
                dataType: "json",
                dataFilter: function (treeId, parentNode, responseData) {
                    return responseData.rspData;
                }
            },
            data: {
                keep: {
                    leaf: true
                },
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
                    pIdKey: "pId",
                    rootPId: "0"
                },
                view: {
                    fontCss: function (treeId, treeNode) {
                        return (!!treeNode.highlight) ? {
                            color: "#A60000",
                            "font-weight": "bold"
                        } : {
                            color: "#333",
                            "font-weight": "normal"
                        };
                    }
                }
            },
            callback: {
                onClick: _tree2_click
            }
        };
        $.fn.zTree.init($("#p_ztree2"), setting);
        $("#source_data").html("");
        $("#target_data").html("");
        $("#related_data").html("");
    }

    // 树节点点击事件
    function _tree2_click(event, treeId, treeNode) {
//        $("#currentSourceObjectId").val(treeNode.id);//当前的源维度ID
        //根据节点类型，控制“添加维度成员映射”按钮的权限
        _btns_control(treeNode);
        if (treeNode.level != 0) {
            // 根据源维度ID和当前单据树节点ID展示源字段信息
            queryBillRefDefineByObjTypeIdAndBillId(treeNode.id, $("#sourceTypeSelect").val(), "source_data");
            // 根据源维度ID和当前单据树节点ID展示源字段信息
            queryBillRefDefineByObjTypeIdAndBillId(treeNode.id, $("#targetTypeSelect").val(), "target_data");
        }
    }

    //根据当前节点信息和源维度类型ID、目标维度类型ID查询源字段和目标字段信息
    function queryBillRefDefineByObjTypeIdAndBillId(billId, objTypeId, divId) {
//        $.ajax({
//            url: "queryBillRefDefineByObjTypeIdAndBillId.ajax",
//            data: {
//                billId: billId,
//                objTypeId: objTypeId
//            },
//            type: "POST",
//            dataType: "json",
//            success: function (data) {
//                if (data.rspData != null) {
//                    var json = data.rspData;
//                    var divHtml = "";
//                    var areaName = "";
//                    for (var i = 0; i < json.length; i++) {
//                        areaName = json[i].areaName == null ? "" : json[i].areaName;
//                        divHtml += "<li id='" + json[i].id + "'><div class='cem-size-ico'>";
//                        divHtml += "<i class='glyphicon glyphicon-open-file'></i>";
//                        divHtml += areaName + " - " + json[i].fieldName;
//                        divHtml += "</div></li>";
//                    }
//                    $("#" + divId).html(divHtml);
//                }else {//失败
//                	cem_message(data.rspMsg);
//                }
//            }
//        });
        
        utils.post("queryBillRefDefineByObjTypeIdAndBillId.ajax",{billId: billId,objTypeId: objTypeId},function(data){
        	 var json = data;
             var divHtml = "";
             var areaName = "";
             for (var i = 0; i < json.length; i++) {
                 areaName = json[i].areaName == null ? "" : json[i].areaName;
                 divHtml += "<li id='" + json[i].id + "'><div class='cem-size-ico'>";
                 divHtml += "<i class='glyphicon glyphicon-open-file'></i>";
                 divHtml += areaName + " - " + json[i].fieldName;
                 divHtml += "</div></li>";
             }
             $("#" + divId).html(divHtml);
        });
    }


    //源维度类型改变时，如果单据树有节点 被选中，则重新获取源字段信息
    //如果没有节点被选中，则不做任何操作
    $("#sourceTypeSelect").change(function () {
        var treeNodeId = getP_ztree2NodeId();
        if (treeNodeId != null) {
            queryBillRefDefineByObjTypeIdAndBillId(treeNodeId, $("#sourceTypeSelect").val(), "source_data");
        }
    });
    //目标维度类型改变时，如果单据树有节点 被选中，则重新获取目标字段信息
    //如果没有节点被选中，则不做任何操作
    $("#targetTypeSelect").change(function () {
        var treeNodeId = getP_ztree2NodeId();
        if (treeNodeId != null) {
            queryBillRefDefineByObjTypeIdAndBillId(treeNodeId, $("#targetTypeSelect").val(), "target_data");
        }
    });

    //获取当前单据树的节点
    function getP_ztree2NodeId() {
        var treeObj = $.fn.zTree.getZTreeObj("p_ztree2");
        var nodes = treeObj.getSelectedNodes(true);
        if (nodes != null && nodes.length > 0) {
            if (nodes[0].level != 0) {
                return nodes[0].id;
            }
        }
        return null;
    }

    //添加维度类型映射页面，左右移动选中的记录
    _init_add_dialog();
    function _init_add_dialog() {
        var source_datas = $("#source_data");
        var target_datas = $("#target_data");
        var related_datas = $("#related_data");

        source_datas.on("click", "li", function () {
            $(this).toggleClass("active").siblings().removeClass("active");
        });

        target_datas.on("click", "li", function () {
            $(this).toggleClass("active").siblings().removeClass("active");
        });

        related_datas.on("click", ".cem-table-row", function () {
            $(this).toggleClass("active").siblings().removeClass("active");
        });

        $("#move_right").click(function () {
            var source_data = $("li.active", source_datas);
            var target_data = $("li.active", target_datas);
            if (source_data.length === 1 && target_data.length === 1) {
                var sourceId = source_data[0].id;
                var targetId = target_data[0].id;
                if ($("#" + sourceId + "_" + targetId).length == 0) {
                    related_datas.append($('<div class="cem-table-row"><div class="cem-table-col"><span class="cem-icon-size"></span></div><div class="cem-table-col"><div class="cem-size-ico" id="' + sourceId + '_' + targetId + '"><span>' + source_data.text() + '</span><span>' + target_data.text() + '</span></div></div></div>'));
                    $("li", source_datas).removeClass("active");
                    $("li", target_datas).removeClass("active");
                }
            }
        });

        $("#move_left").click(function () {
            $(".cem-table-row.active", related_datas).remove();
        });
    }

    // 保存维度类型映射及关联字段信息
    $("#saveTypeRef").click(function () {
        var sourceTypeId = $("#sourceTypeSelect").val();
        var targetTypeId = $("#targetTypeSelect").val();
        var columnRefs = "";//字段关联信息后续补上
        $("#related_data .cem-table-row").each(function () {
            columnRefs += $(".cem-size-ico", this)[0].id + ",";
        });
        
        var treeObj = $.fn.zTree.getZTreeObj("p_ztree2");
        var nodes = treeObj.getSelectedNodes();
        
        var node = nodes[0];
        
        var datas = {
    		billId: node.id,
            sourceTypeId: sourceTypeId,
            targetTypeId: targetTypeId,
            columnRefs: columnRefs
        };

        // 发送异步请求
//        $.ajax({
//            url: "addObjectTypeReveInfo.ajax",//
//            type: "POST",
//            data: datas,
//            dataType: "json",
//            success: function (data) {
//                if (data != null) {
//                    utils.showMsg(data);
//                    _show_typeRef_info();
//                }
//            }
//        });
        utils.post("addObjectTypeReveInfo.ajax",datas,function(data){
        	utils.cem_message(data);
        	_show_typeRef_info();
       });
    });

    //筛选出右侧关联字段结果div中的值
//	function getRelatedData(){
//		var related_datas = $("#related_data");//右侧的关联结果
//		var columnref=//所有的关联字段的id，格式为  源字段ID_目标字段ID
//	}

    // 禁用按钮click事件
    $("#func_stop").click(function () {
        var id = $("#currentTypeRefId").val();// 当前选择的记录的ID
        var enable = $("#" + id + "_enable").val();// 当前记录的启用状态
        if (enable == null || enable == "" || id == null || id == "") {
            utils.cem_message("请选择一条记录！");
            return;
        }
        utils.cem_alert("确定要禁用该记录吗？", function () {
            setTypeRefEnable("001", id);
        });
    });
    //启用按钮click事件
    $("#func_start").click(function () {
        var id = $("#currentTypeRefId").val();// 当前选择的记录的ID
        var enable = $("#" + id + "_enable").val();// 当前记录的启用状态
        if (enable == null || enable == "" || id == null || id == "") {
            utils.cem_message("请选择一条记录！");
            return;
        }
        utils.cem_alert("确定要启用该记录吗？", function () {
            setTypeRefEnable("000", id);
        });
    });

    // 启用或停用维度类型关联关系
    function setTypeRefEnable(enable, id) {
        var msg = enable == "000" ? "启用成功" : "禁用成功";

//        $.ajax({
//            url: "updateObjectTypeReveInfo.ajax",
//            data: {
//                id: id,
//                enable: enable
//            },
//            dataType: "json",
//            type: "POST",
//            success: function (data) {
//                if (data != null) {
//                    if (data.msgType == "N") {// 成功
//                        utils.cem_alert(msg);
//                        _show_typeRef_info();
//                    } else {
//                        utils.cem_alert(data.rspMsg);
//                    }
//                }
//            }
//        });
        
        var param={
                id: id,
                enable: enable
            };
        utils.post("updateObjectTypeReveInfo.ajax",param,function(data){
        	utils.cem_message(msg);
        	_show_typeRef_info();
       });
    }

    // 删除维度类型关联记录
    $("#del_map_btn").click(function () {
        var id = $("#currentTypeRefId").val();// 当前选择的记录的ID
        if (id == null || id == "") {
            utils.cem_message("请选择一条记录！");
            return;
        }
        utils.cem_alert("确定要删除该节点吗？", function () {
            // 执行删除操作
//            $.ajax({
//                url: "deleteObjectTypeReveInfo.ajax",
//                data: {
//                    id: id
//                },
//                type: "POST",
//                dataType: "json",
//                success: function (data) {
//                    if (data != null) {
//                        utils.showMsg(data);
//                        if (data.msgType == "N") {
//                            _show_typeRef_info();
//                            $("#p_ztree").html("");
//                        }
//                    }
//                }
//            });
            utils.post("deleteObjectTypeReveInfo.ajax",{id: id},function(data){
            	utils.cem_message(data);
            	$("#"+id).hide();
            	$("#p_ztree").html("");
           });
        });
    });

    /*-------------------------以下是维度成员的编辑及删除功能------------------------*/
    // 树节点点击事件
    function _tree_click(event, treeId, treeNode) {
        $("#currentSourceObjectId").val(treeNode.id);//当前的源维度ID
        //根据节点类型，控制“添加维度成员映射”按钮的权限
        _btns_control(treeNode);
        // 根据源维度ID展示维度关联信息
        _show_objRef_info(treeNode.id, $("#currentTypeRefId").val(), treeNode.typeFlag);
    }

    // 按钮权限控制
    function _btns_control(treeNode) {
        var node_type = treeNode.type;//节点类型
        if (node_type == 'T') {//维度类型
            $("#add_objref_btn").addClass("disabled");
        } else {//维度成员
            $("#add_objref_btn").removeClass("disabled");
        }
    }

    // 编辑维度成员映射
    $("#add_objref_btn").click(function () {
        var typeRefId = $("#currentTypeRefId").val();// 当前选择的维度类型关联的ID
        var treeObj = $.fn.zTree.getZTreeObj("p_ztree");
        var nodes = treeObj.getSelectedNodes(true);

        if (typeRefId == null || typeRefId == "") {
            utils.cem_message("请选择一条维度类型映射记录！");
            return;
        }

        if (nodes == null || nodes.length == 0) {
            utils.cem_message("请选择源维度成员！");
            return;
        }

//		var node = nodes[0];
        //根据目标维度类型ID初始化目标维度树
        var targetTypeId = $("#" + typeRefId + "_targetTypeId").val();
        getTargetObjectTree(targetTypeId);
        //根据当前维度关联ID得到所有的目标维度信息 objRefId
        editTargetObjects($("#objRefId").val());

        $("#obj_map").modal("show");
    });

    function editTargetObjects(objRefId) {
        $("div.clearfix", right_c).remove();
        if (objRefId != null && objRefId != "") {
            var objRefResultRowDivId = $("#" + objRefId + " .cem-table-row");//所有的映射结果行的div的ID
            if (objRefResultRowDivId != null && objRefResultRowDivId.length > 0) {
                var right_c = $(".cem-packet-tree-r", $("#obj_map"));
                for (var i = 0; i < objRefResultRowDivId.length; i++) {
                    var targetName = $("#" + objRefResultRowDivId[i].id + "_targetName").text();
                    var defaultId = $("#" + objRefResultRowDivId[i].id).data('defaultid');
                    targetName = targetName.substring(2, targetName.length - 1);
                    if(defaultId !=null && defaultId != undefined){
                    	right_c.append('<div class="clearfix"><p class="pull-left mt10" data-id="' + objRefResultRowDivId[i].id + '" data-defaultId="'+defaultId+'" data-name="'
                                + targetName + '">' + targetName + '</p><span class="badge pull-right mt10" style="background:#338be4">默认</span></div>');
                    }else{
                    	right_c.append('<div class="clearfix"><p class="pull-left mt10" data-id="' + objRefResultRowDivId[i].id + '" data-name="'
                                + targetName + '">' + targetName + '</p><div class="btn btn-default pull-right setting-default mt5 mr5">设为默认</div></div>');
                    }
                    
                }
            }
        }
    }

    // 根据目标维度类型ID获得目标维度树
    function getTargetObjectTree(targetTypeId) {
        var setting = {
            async: {
                enable: true,
                url: "getObjectTree.ajax?id=" + targetTypeId,// getObjectTree.do
                autoParam: ["id=parentId", "type", "isParent", "isRef", "typeFlag"],
                type: "POST",
                dataType: "json",
                otherParam: ["enable", "000"],// 只查询启用状态的记录
                dataFilter: function (treeId, parentNode, responseData) {
                    return responseData.rspData;
                }
            },
            data: {
                keep: {
                    leaf: true
                },
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
                        return (!!treeNode.highlight) ? {
                            color: "#A60000",
                            "font-weight": "bold"
                        } : {
                            color: "#333",
                            "font-weight": "normal"
                        };
                    }
                }
            }
        };
        $.fn.zTree.init($("#p_ztree3"), setting);
    }

    // 根据源维度树节点ID和维度类型关联ID查询维度映射数据
    function _show_objRef_info(sourceId, dimTypeId, typeFlag) {
//        $.ajax({
//            url: "searchAllObjectRefInfo.ajax",
//            data: {
//                sourceId: sourceId,
//                dimTypeId: dimTypeId,
//                typeFlag: typeFlag
//            },
//            type: "POST",
//            dataType: "json",
//            success: function (data) {
//                if (data.rspData != null) {
//                    var json = data.rspData;
//                	if(json.length==0){
//                		$("#objRefId").val("");
//                	}
//                	
//                    var divHtml = "";
//                    for (var i = 0; i < json.length; i++) {
//                        if (json[i].targetNames != null && json[i].targetNames.length >= 0) {
//                            var targetNameArr = json[i].targetNames.split(";");
//                            var targetIdArr = json[i].targetId.split(";");
//                            divHtml += "<div class='cem-table-body' id='" + json[i].id + "'>";
//
//                            for (var k = 0; k < targetNameArr.length - 1; k++) {
//                                var targetId = targetIdArr[k].substring(3, targetIdArr[k].length - 1);
//                                if (k == 0) {
//                                    divHtml += "<div class='cem-table-row active' id='" + targetId + "'>";
//                                } else {
//                                    divHtml += "<div class='cem-table-row' id='" + targetId + "'>";
//                                }
//                                divHtml += "<div class='cem-table-col'>";
//                                divHtml += "<span class='cem-icon-size'></span>";
//                                divHtml += "</div>";
//                                divHtml += "<div class='cem-table-col'>";
//                                divHtml += "<div class='cem-size-ico'>";
//                                divHtml += "<span>" + json[i].sourceName + "</span> ";
//                                divHtml += "<span id='" + targetId + "_targetName'>" + targetNameArr[k] + "</span> ";
//                                divHtml += "</div>";
//                                divHtml += "</div>";
//                                divHtml += "</div>";
//                            }
//                            divHtml += "</div>";
//                        }
//                      //同时将维度关联ID保存到隐藏域，编辑维度关联时用
//                        $("#objRefId").val(json[i].id);
//                    }
//                    $("#objRefResult").html(divHtml);
//                }else {//失败
//                	cem_message(data.rspMsg);
//                }
//            }
//        });
        
        var param={
                sourceId: sourceId,
                dimTypeId: dimTypeId,
                typeFlag: typeFlag
            };
        utils.post("searchAllObjectRefInfo.ajax",param,function(data){
            var json = data;
        	if(json.length==0){
        		$("#objRefId").val("");
        	}
            var divHtml = "";
            for (var i = 0; i < json.length; i++) {
                if (json[i].targetNames != null && json[i].targetNames.length >= 0) {
                    var targetNameArr = json[i].targetNames.split(";");
                    var targetIdArr = json[i].targetId.split(";");
                    var targetDefaultId = json[i].defaultTargetId;
                    divHtml += "<div class='cem-table-body' id='" + json[i].id + "'>";

                    for (var k = 0; k < targetNameArr.length - 1; k++) {
                        var targetId = targetIdArr[k].substring(3, targetIdArr[k].length - 1);
                        if (k == 0) {
                        	if(targetId == targetDefaultId){
                        		divHtml += "<div class='cem-table-row active' id='" + targetId + "' data-DefaultId='"+targetDefaultId+"'>";
                        	}else{
                        		divHtml += "<div class='cem-table-row active' id='" + targetId + "'>";
                        	}
                        } else {
                        	if(targetId == targetDefaultId){
                        		divHtml += "<div class='cem-table-row' id='" + targetId + "' data-DefaultId='"+targetDefaultId+"'>";
                        	}else{
                        		divHtml += "<div class='cem-table-row' id='" + targetId + "'>";
                        	}
                        }
                        divHtml += "<div class='cem-table-col'>";
                        divHtml += "<span class='cem-icon-size'></span>";
                        divHtml += "</div>";
                        divHtml += "<div class='cem-table-col'>";
                        divHtml += "<div class='cem-size-ico'>";
                        divHtml += "<span>" + json[i].sourceName + "</span> ";
                        divHtml += "<span id='" + targetId + "_targetName'>" + targetNameArr[k] + "</span> ";
                        if(targetId == targetDefaultId){
                        	divHtml += '<span class="badge pull-right mt10" style="background:#338be4">默认</span>';
                        }
                        divHtml += "</div>";
                        divHtml += "</div>";
                        divHtml += "</div>";
                    }
                    divHtml += "</div>";
                }
              //同时将维度关联ID保存到隐藏域，编辑维度关联时用
                $("#objRefId").val(json[i].id);
            }
            $("#objRefResult").html(divHtml);
       });
    }

    _init_tree_select($("#obj_map"), "p_ztree3");
    function _init_tree_select(context, tree_id) {
        var move_right = $(".glyphicon-menu-right", context).parent();
        var right_del = $(".glyphicon-menu-left", context).parent();
        var del_all = $(".glyphicon-trash", context).parent();
        var right_c = $(".cem-packet-tree-r", context);

        move_right.click(function () {
            var treeObj = $.fn.zTree.getZTreeObj(tree_id);
            var nodes = treeObj.getSelectedNodes(true);

            if (nodes.length !== 1)
                return;

            var node = nodes[0];
            if (node.type == "T") {//根节点不能又移动
                return;
            }

            var right_nodes = $("div.clearfix", right_c);
            // 判断成员或分组是否已经移动到右侧
            for (var i = 0; i < right_nodes.length; i++) {
                if ((node.id+"") == ($(right_nodes[i]).data("id")+"")) {   
                    return;
                }
            }

            // 移动
            right_c.append('<div class="clearfix"><p class="pull-left mt10" data-id="' + node.id + '" data-name="'
                + node.name + '">' + node.name + '</p><div class="btn btn-default pull-right setting-default mt5 mr5">设为默认</div></div>');

            // 移除左侧tree的选中状态
            treeObj.cancelSelectedNode(nodes[0]);
        });

        right_del.click(function () {
            $("div.actived", right_c).remove();
        });

        right_c.on("click", "div.clearfix", function () {
            $(this).toggleClass("actived").siblings().removeClass(
                "actived");
        });

        del_all.click(function () {
            $("div.clearfix", right_c).remove();
        });
    }
    $("#obj_map").on('click','.setting-default',function(){
    	var _this = $(this);
    	var _that = _this.prev().data('id');
    	_this.parent().append('<span class="badge pull-right mt10" style="background:#338be4">默认</span>');//改变状态为默认
    	_this.prev().attr('data-defaultId',_that);                                                         //添加默认值
    	_this.parent().siblings().find('p').removeAttr("data-defaultId");								   //移除其它兄弟节点的默认值
    	_this.parent().siblings().find('div.btn').remove();												   //移除其它兄弟节点的设为默认按钮
    	_this.parent().siblings().append('<div class="btn btn-default pull-right setting-default mt5 mr5">设为默认</div>');  //当点取消默认状态时应该添加设置默认按钮
    	_this.parent().siblings().find('span').remove();												  //添加设置默认按钮的同时移队默认span标签
    	_this.parent().find('div.btn').remove();														  //添加设置默认按钮之前清空之前遗留下来的btn
    	
    	
    });
    // 保存维度成员映射
    $("#saveObjectRef").click(function () {
        var right_c = $(".cem-packet-tree-r", $("#obj_map"));
        var nodes = $("p", right_c);//选中的所有的目标维度节点
        var targetId = "";//目标维度ID数组
        var targetNames = "";//目标维度名称数组
        var defaultId="";
        var dimTypeId = $("#currentTypeRefId").val();//维度类型关联ID
        var sourceId = $("#currentSourceObjectId").val();//源维度ID
        var id = $("#objRefId").val();//维度关联ID
        var typeFlag = $("#" + dimTypeId + "_typeFlag").val();//维度类型关联ID

        nodes.each(function () {//组装目标维度ID和名称
            targetId += "@3(" + $(this).data("id") + ");";
            targetNames += "@(" + $(this).data("name") + ");";
            if($(this).data("defaultid") != undefined){
            	defaultId=$(this).data("defaultid");
            }
        });

        var datas = {
            targetId: targetId,
            targetNames: targetNames,
            dimTypeId: dimTypeId,
            sourceId: sourceId,
            id: id,
            defaultTargetId: defaultId
        };
        
        // 发送异步请求
//        $.ajax({
//            url: "addObjectRefInfo.ajax",//
//            type: "POST",
//            data: datas,
//            dataType: "json",
//            success: function (data) {
//                if (data != null) {
//                    if (data.msgType == "N") {//成功
//                        utils.cem_message(data.rspData);
////						utils.showMsg(data);
//                        //展示维度关联结果
//                        _show_objRef_info(sourceId, dimTypeId, typeFlag);
//                    } else {//失败
//                        utils.cem_message(data.rspMsg);
//                    }
//                }
//            }
//        });
        utils.post("addObjectRefInfo.ajax",datas,function(data){
        	utils.cem_message(data);
            //展示维度关联结果
            _show_objRef_info(sourceId, dimTypeId, typeFlag);
        });
    });
   
    /**
	 * 选中节点获取所有子节点进行导出操作
	 * **/
	$("#tree_export").click(function() {
		var currentTypeRefId = $("#currentTypeRefId").val();// 当前选择的记录的ID
		var sourceTypeName=$("#"+currentTypeRefId+"_sourceTypeName").html();
		var targetTypeName=$("#"+currentTypeRefId+"_targetTypeName").html();
		var treeObj = $.fn.zTree.getZTreeObj("p_ztree");
		var nodes = treeObj.getSelectedNodes(true);
		var node = nodes[0];
		var param = {};
		param["sourceTypeName"]=sourceTypeName;
		param["targetTypeName"]=targetTypeName;
		param["sourceName"]=node.name;
		param["sourceCode"]=node.code;
		param["id"]=node.id;
		param["dimTypeId"]=currentTypeRefId;
	/*	$.ajax({
			url:"exportObjectRefData.ajax",
			data : param,
			type : "POST",
			success : function(data) {

			}

		});*/
		function download(url, data, method){    // 获得url和data
		    if( url && data ){ 
		        // data 是 string 或者 array/object
		        data = typeof data == 'string' ? data : jQuery.param(data);        // 把参数组装成 form的  input
		        var inputs = '';
		            inputs+='<input type="hidden" name="sourceTypeName" value="'+ sourceTypeName +'" />'; 
		            inputs+='<input type="hidden" name="targetTypeName" value="'+ targetTypeName +'" />';
		            inputs+='<input type="hidden" name="sourceName" value="'+ node.name +'" />';
		            inputs+='<input type="hidden" name="sourceCode" value="'+ node.code +'" />';
		            inputs+='<input type="hidden" name="id" value="'+ node.id +'" />';
		            inputs+='<input type="hidden" name="dimTypeId" value="'+ currentTypeRefId +'" />';
		        // request发送请求
		        jQuery('<form action="'+ url +'" method="'+ (method||'post') +'">'+inputs+'</form>')
		        .appendTo('body').submit().remove();
		    }
		};
		
		download("exportObjectRefData.ajax",param, "POST");
	});


});
