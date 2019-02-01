require(['/js/zlib/app.js'], function(App) {
    //引入用户登录校验
    require(['checkUser']);

    var PageModule = {
        listInit: function(){
            //引入Page插件
            require(['Page'],function(){
                var page = new Page();
                window.pageLoad = function (){
                    var data = {
                        nameParam: $("#permitName").val(),
                        codeParam: $("#permitCode").val(),
                        enable:$("#permitEnable").val()
                    };
                    //修改默认每页显示条数
                    page.init(Api.admin+"/api/sys/SysPermission/page",data,true,function(tableData, result){
                        renderTableData(tableData);
                        $('.btn-check').click(function(){
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openDialog('查看许可','systemSettings/permitInner.html?id='+id+'&api=view','658px','312px')
                        });
                        $('.btn-change').click(function(){
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openEditDialog('修改许可','systemSettings/permitInner.html?id='+id+'&api=form','658px','312px');
                        });
                        $('.btn-delete').click(function(){
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.deleteItem('确定要删除该许可吗',Api.admin+'/api/sys/SysPermission/delete',{ids:id});
                        });
                        $('.btn-empower').click(function(){
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openEditDialog('授权数据','systemSettings/permitAuthData.html?id='+id,'900px','500px',permitAuthDataCallback);
                        });
                    });
                    function renderTableData(tableData){
                        $('#treeTable').dataTable({
                            "bSort": true,
                            "aoColumnDefs": [
                                {"bSortable": false, "aTargets": [0, 2, 6]}
                            ],
                            "data":tableData,
                            "aoColumns": [
                                {"data": null, "defaultContent":"", 'sClass': "autoWidth center",
                                    "render":function(data, type, row, meta) {
                                        return data = "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                                    }
                                },
                                {"data": "name",'sClass':" center"},
                                {"data": "code",'sClass':"center ","width":"15%"},
                                {"data": "des",'sClass':"center","width":"15%"},
                                {"data": "sort",'sClass':"center","width":"8%"},
                                {"data": "enable",'sClass':"center","width":"8%", "defaultContent": "","render":function (data, type, row, meta){
                                        var chahgeType;
                                        return chahgeType = row.enable==0?"否":"是";
                                    }},
                                {
                                    "data": "id", "orderable": false, "defaultContent": "",'sClass':" center autoWidth",
                                    "render": function (data, type, row, meta) {
                                        return "<a class='btn btn-info btn-xs btn-check' ><i class='fa fa-search-plus'></i>查看</a >" +
                                            "<a class='btn btn-success btn-xs btn-change' ><i class='fa icon-change'></i>修改</a >" +
                                            "<a class='btn btn-danger btn-xs btn-delete' ><i class='fa fa-trash-o' ></i>删除</a >" +
                                            "<a class='btn  btn-xs btn-empower'><i class='fa icon-accredit'></i>授权数据</a >";
                                    }
                                }]
                        });
                        renderIChecks();
                    }

                    function permitAuthDataCallback(layerIdx, layero){
                        var iframeWin = layero.find('iframe')[0].contentWindow;
                        var formData = iframeWin.getFormData();
                        if(formData){
                            var data = formData.data;
                            Api.ajaxJson(formData.url,JSON.stringify(data),function(result){
                                if(result.success == true){
                                    Mom.layMsg('操作成功');
                                    top.layer.close(layerIdx);
                                }else{
                                    Mom.layAlert(result.message);
                                }
                            });
                        }
                    }
                };
                //点击重置按钮
                $('#reset-btn').click(function(){
                    $("#permitEnable option:first").prop("selected", 'selected');
                    $("#permitName").val("");
                    $("#permitCode").val("");
                    page.reset(["nameParam","codeParam","enable"]);
                });
                $("#search-btn").click(function(){
                    pageLoad();
                });
                pageLoad();
            });
        },

        formInit: function(){
            var id =Mom.getUrlParam('id'),
                api = Mom.getUrlParam('api') || 'form';
            var url = Api.admin+"/api/sys/SysPermission/"+api+"/"+id;
            Api.ajaxJson(url,{},function(result){
                if(result.success){
                    var data = result.SysPermission;
                    var operId = data.sysOperation.id,
                        operName = data.sysOperation.name,
                        authClassId = "",
                        authClassName = "";
                    if(api == 'view'){
                        authClassId = data.sysAuthClass.id;
                        authClassName =data.sysAuthClass.name;
                        var html = "<option value='"+operId+"'>"+(operName||'无')+"</option>";
                        $("#operationId").empty().append(html).val(operId);
                        var html1 = "<option value='"+authClassId+"'>"+(authClassName||"无")+"</option>";
                        $("#authClass").empty().append(html1).val(authClassId);
                    }
                    else if(api == 'form'){
                        if(id) {
                            authClassId = data.sysAuthObject.sysAuthClass.id ;
                        }
                        Bus.appendOptionsValue('#operationId', result.OperationList, 'id', 'name');
                        $("#operationId").val(operId||'');
                        Bus.appendOptionsValue('#authClass', result.AuthClassList, 'id', 'name');
                        $("#authClass").val(authClassId||'');
                    }
                    Validator.renderData(data,$('#inputForm'));
                }else{
                    Mom.layMsg(result.message);
                }
            });
        },

        permitAuthData: function(){
            var ztree;
            var id = Mom.getUrlParam('id');
            $("#permissionId").val(id);
            Api.ajaxJson(Api.admin+'/api/sys/SysPermission/authData/'+id,{},function(result) {
                if (result.success) {
                    var SysPermission = result.SysPermission,
                        sysOperation = SysPermission.sysOperation;
                    var selList = SysPermission.sysAuthClass.sysAuthProperties;
                    var operIdArr = result.OperationList,
                        authClassIdArr = result.AuthClassList;
                    if(id){
                        var operId = SysPermission.sysOperation.id,
                        authClassId = SysPermission.sysAuthObject.sysAuthClass.id,
                        authClassName = SysPermission.sysAuthObject.sysAuthClass.name;
                        authClassId = authClassName == null ?"":authClassId;
                    }
                    if(selList.length > 0){
                        Bus.appendOptionsValue("#permitAuthZtree", selList, 'id', 'name');
                        $("#permitAuthZtree").trigger("change");
                    }else{
                        Bus.resetSelect("#permitAuthZtree", '-- 请选择 --');
                    }
                    Bus.resetSelect("#operationId", '-- 请选择 --');
                    Bus.appendOptionsValue("#operationId", operIdArr, 'id', 'name');
                    $("#operationId").val(operId);

                    Bus.resetSelect("#authClass", '-- 请选择 --');
                    Bus.appendOptionsValue("#authClass", authClassIdArr, 'id', 'name');
                    $("#authClass").val(authClassId);

                    Validator.renderData(SysPermission,$('#inputForm'));
                    Validator.renderData(SysPermission,$('#dataInfo'));
                    if(SysPermission.sysOperation.id){
                        $('#sysOperation\\.name').text($("#operationId option:selected").text());
                    }

                    //加载左侧ztree
                    require(['ztree_my'],function(ZTree) {
                        ztree = new ZTree();
                        $('#permitAuthZtree').change(function(){
                            var val = $(this).val(), objectId = $('#objectId').val();
                            url = Api.admin+"/api/sys/SysPermission/listPropVal/"+objectId+"/"+val;
                            Api.ajaxJson(url,{},function(result2){
                                if(result2.success==true) {
                                    var ztreeSetting={
                                        check:{
                                            chkboxType:{ "Y":"ps", "N":"ps" }
                                        },
                                        callback:{
                                            onDblClick: onDblClick
                                        }
                                    };
                                    var treeObj = ztree.loadData($("#tree"),result2.zTree,true,ztreeSetting);
                                    ztree.checkDefaultVal(treeObj,result2.checkIds);
                                    $("#propvals").val(result2.checkIds);
                                }else{
                                    Mom.layAlert("加载左侧树失败：<br>"+result2.message);
                                }
                            });
                            function onDblClick(event, treeId, treeNode){
                                if(treeNode){
                                    var id = treeNode.id;
                                    var url = Api.admin+"/api/sys/SysAuthPropertyValue/perimissionview/"+id;
                                    Api.ajaxJson(url,{},function(result){
                                        if(result.success){
                                            var SysAuthPropertyValue = result.SysAuthPropertyValue;
                                            Validator.renderData(SysAuthPropertyValue,$('#inputForm'));
                                            $("#permitPro").empty().text(SysAuthPropertyValue.sysAuthProperty.code);
                                            $("#enable").val(SysAuthPropertyValue.enable||'0');
                                        }else{
                                            Mom.layAlert(result.message);
                                        }
                                    });
                                }
                            }
                        });
                        $("#permitAuthZtree").trigger("change");
                    });
                }else{
                    Mom.layMsg(result.message);
                }
            });

            window.getFormData = function(){
                if(!Validator.valid(document.forms[0],1.3)){
                    return;
                }
                if(ztree){
                    var checkResult = ztree.getCheckValues(false, false);
                    if(checkResult.success){
                        $('#propvals').val(checkResult.id);
                        return {
                            url: $('#inputForm').attr('action'),
                            data: $('#inputForm').serializeJSON()
                        }
                    }
                }else{
                    Mom.layAlert('未获取到属性值');
                }
            }
        },

    };

    $(function(){
        //许可维护列表
        if($('#permit').length > 0){
            PageModule.listInit();
        }
        else if($('#permitInner').length > 0){
            PageModule.formInit();
        }
        //授权数据
        else if($('#permitAuthData').length > 0){
            PageModule.permitAuthData();
        }

    });

});