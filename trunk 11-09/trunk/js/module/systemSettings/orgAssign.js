require(['/js/zlib/app.js'], function(App) {
    require(['checkUser']);
    var PageModule = {
        orgAssign: function(){
            var id = Mom.getUrlParam('id') || "";
            var type = Mom.getUrlParam('type') || "";
            if(id!=='') {
                $("#orgId").val(id);
                Api.ajaxForm(Api.admin+'/api/sys/SysOrg/view/'+id, {}, function(result){
                    if (result.success) {
                        Validator.renderData(result.SysOrg, $('#orgData'));
                    } else {
                        Mom.layMsg(result.message)
                    }
                });
            }else{
                Mom.layMsg('机构信息接收失败！');
                return false
            }
            //查看角色信息接口
            require(['Page'],function(){
                function refreshLoad(){
                    var data = type=='1'?{companyId:id}:{deptId:id};
                    var page = new Page();
                    page.pageShowNum=0;
                    page.init(Api.admin+"/api/sys/SysUser/page",data,true,function (rows, result) {
                        if (result.success) {
                            renderTableData(rows);
                        }else {
                            Mom.layMsg(result.message);
                        }
                    });
                }

                //渲染表格
                function renderTableData(tableData) {
                    $('#treeTable').dataTable({
                        bFilter: true,
                        "bSort": true,
                        "aoColumnDefs": [
                            {"bSortable": false, "aTargets": [0]}
                        ],
                        "data": tableData,
                        "aoColumns": [
                            {
                                "data": null, "defaultContent": "", 'sClass': "autoWidth center",
                                "render": function (data, type, row, meta) {
                                    return "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                                }
                            },
                            {"data": "loginName", 'sClass': " center"},
                            {
                                "data": "name", "orderable": false, "defaultContent": "", 'sClass': " center  ",
                                "render": function (data, type, row, meta) {
                                    return "<a class='roleName' >" + row.name + "</a >";
                                }
                            },
                            {"data": "phone", 'sClass': "center"},
                            {"data": "mobile", 'sClass': "center"},
                            {
                                "data": "id", "orderable": false, "defaultContent": "", 'sClass': "autoWidth center ",
                                "render": function (data, type, row, meta) {
                                    return "<a class='btn btn-delete' id='" + row.id + "'>移除</a >";
                                }
                            }]
                    });
                    renderIChecks();
                };

                /*移除按钮操作*/
                $("#datainner").on("click", '.btn-delete', function () {
                    var userIds = $(this).attr('id'),
                        roleName = $(this).parents('tr').find('.roleName').text();
                    var companyId = $('#companyId').val();
                    var data = {
                        userIds: userIds,
                        deptId: id,
                        companyId:companyId
                    };
                    deleteACallback('确认要将用户 <strong>[' + roleName + ']</strong>移除吗？', data);
                });

                $('#delete-btn').click(function () {
                    var userIds = "";
                    $("#treeTable tbody tr td input.i-checks:checkbox").each(function () {
                        if (true == $(this).is(':checked')) {
                            userIds += "," + $(this).attr("id");
                        }
                    });
                    var companyId=$('#companyId').val();
                    if (userIds.length > 0) {
                        var data = {
                            userIds: userIds.substr(1),
                            deptId: id,
                            companyId:companyId
                        };
                        deleteACallback('确认要将已选择的用户移除吗？', data);
                    } else {
                        Mom.layMsg('请至少选择一条数据!');
                    }
                });

                //组织机构添加人员
                $("#assignButton").click(function(){
                    var options = {
                        hasUserOptions:{
                            apiCfg:{
                                url: Api.admin+"/api/sys/SysUser/list",
                                data: type=='1'?{companyId:id}:{deptId:id}
                            }
                        }
                    }
                    Bus.openSelUserWin3('选择用户', options, function(selResult, layIdx, layero){
                        if(selResult.success){
                            var idsArr = [];
                            $.each(selResult.newValues,function(i,o){
                                idsArr.push(o.id);
                            });
                            var formdata = {
                                companyId: $('#companyId').val(),
                                deptId: id,
                                userIds: idsArr.join(',')
                            };
                            Api.ajaxForm(Api.admin+'/api/sys/SysOrg/addUser', formdata, function(result){
                                if (result.success == true) {
                                    Mom.layMsg('已成功提交','',1000);
                                    refreshLoad();
                                    top.layer.close(layIdx);
                                } else {
                                    Mom.layAlert(result.message);
                                }
                            });
                            return false;
                        }
                    });
                });

                function deleteACallback(msg, data){
                    Mom.layConfirm(msg, function(layIdx, layero){
                        Api.ajaxForm(Api.admin+'/api/sys/SysOrg/delUser', data, function (result) {
                            if (result.success == true) {
                                refreshLoad();
                                top.layer.close(layIdx);
                            }
                        });
                    });
                }

                /*刷新页面按钮*/
                $("#refresh-btn").click(function () {
                    refreshLoad();
                });

                refreshLoad();
            });
        },

        orgAllotApp: function(){
            var orgId = Mom.getUrlParam('id') || "";
            if(orgId!=='') {
                $("#orgId").val(orgId);
                Api.ajaxForm(Api.admin+'/api/sys/SysOrg/view/'+orgId, {}, function(result){
                    if (result.success) {
                        Validator.renderData(result.SysOrg, $('#orgData'));
                    } else {
                        Mom.layMsg(result.message)
                    }
                });
            }else{
                Mom.layMsg('机构信息接收失败！');
                return false
            }
            /*刷新页面按钮*/
            $("#refresh-btn").click(function () {
                refreshLoad();
            });
            function refreshLoad(){
                Api.ajaxJson(Api.admin+"/api/sys/SysOrg/assignApp/"+orgId, {}, function(result){
                    if (result.success) {
                        renderTableData(result.rows);
                    } else {
                        Mom.layMsg(result.message);
                    }
                });
            }
            function renderTableData(rows){
                $('#treeTable').dataTable({
                    bFilter: true,
                    "bSort": true,
                    "aoColumnDefs": [
                        {"bSortable": false, "aTargets": [0]}
                    ],
                    "data": rows,
                    "aoColumns": [
                        {
                            "data": null, "defaultContent": "", 'sClass': "autoWidth center",
                            "render": function (data, type, row, meta) {
                                return "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                            }
                        },
                        {"data": "appName",'sClass': "center"},
                        {"data": "appCode",'sClass': "center"},
                        {"data": "appRoot",'sClass': "center"},
                        {"data": "applicability",'sClass': "center"},
                        {
                            "data": "id", "orderable": false, "defaultContent": "", 'sClass': "autoWidth center ",
                            "render": function (data, type, row, meta) {
                                return "<a class='btn btn-delete' id='"+row.id+"' name='"+row.appName+"'>移除</a >";
                            }
                        }]
                });
                renderIChecks();
            }
            //添加应用
            $("#assignButton").click(function () {
                Bus.openEditDialog('选择应用','systemSettings/selectApp.html?orgId='+orgId,'800px','545px',function(layerIdx,layero){
                    var iframeWin = layero.find('iframe')[0].contentWindow;
                    var formData = iframeWin.getFormData();
                    if(formData){
                        var data= formData.data;
                        Api.ajaxForm(Api.admin+'/api/sys/SysOrg/addApp',data,function(result) {
                            if (result.success) {
                                refreshLoad();
                                top.layer.close(layerIdx);
                            } else {
                                Mom.layMsg(result.message);
                            }
                        });
                    }
                });
            });

            /*移除按钮操作*/
            $("#datainner").on("click", '.btn-delete', function () {
                var appId = $(this).attr('id'),
                    appName = $(this).attr('name');
                var data = {
                    appIds: appId,
                    orgId: orgId
                };
                deleteACallback('确认要将应用 <strong>[' + appName + ']</strong>移除吗？', data);
            });

            $('#delete-btn').click(function () {
                var appIdArr = [];
                $("#treeTable tbody tr td input.i-checks:checkbox").each(function () {
                    if (true == $(this).is(':checked')) {
                        appIdArr.push($(this).attr("id"));
                    }
                });
                if (appIdArr.length > 0) {
                    var data = {
                        appIds: appIdArr.join(','),
                        orgId: orgId
                    };
                    deleteACallback('确认要将已选择的应用移除吗？', data);
                } else {
                    Mom.layMsg('请选择应用!');
                }
            });
            function deleteACallback(msg, data){
                Mom.layConfirm(msg, function(layIdx, layero){
                    var url = Api.admin+'/api/sys/SysOrg/delApp';
                    Api.ajaxForm(url, data, function (result) {
                        if (result.success == true) {
                            refreshLoad();
                            top.layer.close(layIdx);
                        }else{
                            Mom.layAlert(result.message);
                        }
                    });
                });
            }

            refreshLoad();
        },

        selectApp: function(){
            var orgId = Mom.getUrlParam('orgId') || "";
            require(['Page'],function(){
                var page = new Page();
                window.pageLoad= function () {
                    var id = Mom.getUrlParam('id') || "";
                    var data = {
                        orgId: orgId
                    };
                    page.pageShowNum = 0;
                    page.init(Api.admin+"/api/sys/SysOrg/selectApp",data, true, function(tableData){
                        dataout(tableData);
                    });
                    //表格渲染
                    function dataout(data) {
                        $('#treeTable').dataTable({
                            "data": data,
                            //定义列 宽度 以及在json中的列名
                            "columns": [
                                {
                                    "data": null, 'sClass': "autoWidth center",
                                    "render": function (data, type, row, meta) {
                                        return "<input type='checkbox' name='id' value=" + row.id + " class='i-checks'>"
                                    }
                                },
                                {"data": "sort",'sClass': " center"},
                                {"data": "appName",'sClass': " center"},
                                {"data": "appCode",'sClass': " center"},
                                {"data": "appRoot",'sClass': " center"},
                                {"data": "applicability",'sClass': " center",
                                    "render": function(value, type, row, meta){
                                        if(value=='1'){
                                            return 'B/S端';
                                        }else if(value == '2'){
                                            return 'C/S端';
                                        }
                                        return value;
                                    }
                                }
                            ],

                        });
                        renderIChecks();
                    }
                };
                pageLoad();

            });

            window.getFormData = function(){
                var ids=[];
                $("#datainner tr td .i-checks").each(function(index,item){
                    if($(item).is(":checked")) {
                        ids.push($(item).val());
                    }
                });
                if(ids.length == 0){
                    success = false;
                    Mom.layMsg('请选择应用');
                    return;
                }
                return {
                    data: {
                        orgId: orgId,
                        appIds: ids.join(",")
                    }
                };
            }
        }
    };

    $(function(){
        //分配用户页面
        if($('#orgAssign').length > 0){
            PageModule.orgAssign();
        }
        else if($('#orgAllotApp').length > 0){
            PageModule.orgAllotApp();
        }
        else if($('#selectApp').length > 0){
            PageModule.selectApp();
        }

    });

});