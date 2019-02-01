require(['/js/zlib/app.js'], function(App) {
    //引入用户登录校验
    require(['checkUser']);

    var PageModule = {

        //  分配许可
        listAllotPro: function(){
            var roleId = Mom.getUrlParam('id');
            require(['Page'], function () {
                var page = new Page();
                page.pageShowNum = 0;
                window.pageLoad = function () {
                    var data = {
                        roleId: roleId,
                        nameParam: $("#authProName").val(),
                        codeParam: $("#authPro").val()
                    };
                    page.init(Api.admin+"/api/sys/SysRole/rolePermPage", data, true, function (tableData, result) {
                        renderTableData(tableData);
                    });
                };
                function renderTableData(tableData){
                    $('#treeTable').dataTable({
                        "data":tableData,
                        "aoColumns": [
                            {"data": null, "defaultContent":"", 'sClass': "autoWidth center",
                                "render":function(data, type, row, meta) {
                                    return "<input type='checkbox' id=" + row.id + " class='i-checks'>";
                                }
                            },
                            {"data": "name",'sClass':" center"},
                            {"data": "code",'sClass':"center "},
                            {"data": "des",'sClass':"center"},
                            {"data": "null",'sClass':"center autoWidth ifAllot", "defaultContent": "","render":function (data, type, row, meta){
                                    return row.distStatus==1?"是":"否";
                                }
                            }
                        ]
                    });
                    renderIChecks();
                }

                //分配
                $('#allot-btn').click(function () {
                    allotCancelItem("#treeTable", "dist", "是", Api.admin+"/api/sys/SysRole/ajaxSaveDist");
                });
                //撤销
                $('#cancel-btn').click(function () {
                    allotCancelItem("#treeTable", "cancel", "否", Api.admin+"/api/sys/SysRole/ajaxSaveDist");
                });
                //点击重置按钮
                $('#reset-btn').click(function () {
                    $("#authProName").val("");
                    $("#authPro").val("");
                    page.reset(["nameParam", "codeParam"]);
                });
                $("#search-btn").click(function(){
                    pageLoad();
                });

                //分配、撤销功能
                function allotCancelItem(tableId,opflag,ifAllot,url){
                    var str="",flag = true;
                    $(tableId +" tbody tr td input.i-checks:checkbox").each(function(){
                        if(true == $(this).is(':checked')) {
                            var ifAllotText = "";
                            ifAllotText = $(this).parents("tr").find('.ifAllot').text();
                            str += "," + $(this).attr("id");
                            if (ifAllotText == ifAllot) {
                                var tit = "";
                                if(ifAllot == "是"){
                                    tit = "您所选的有已分配项！";
                                }else{
                                    tit ="您所选的有已撤销项！";
                                }
                                Mom.layAlert(tit);
                                flag = false;
                                return;
                            }
                        }
                    });
                    if(str == ""){
                        Mom.layMsg('请至少选择一条数据!');
                        return;
                    }
                    if(flag){
                        var data = {
                            opflag: opflag,
                            roleId: roleId,
                            permIds: str.substr(1)
                        };
                        Api.ajaxForm(url,data,function (result) {
                            if (result.success == true) {
                                pageLoad();
                                Mom.layMsg('操作成功');
                            }else{
                                Mom.layAlert(result.message);
                            }
                        });
                    }
                };

                pageLoad();
            });
        },

        // 分配用户
        roleAssign: function(){
            var roleId = Mom.getUrlParam('id');
            $('#roleId').val(roleId);
            function refreshLoad(){
                if(roleId != ''){
                    var url = Api.admin+"/api/sys/SysRole/view/"+roleId;
                    Api.ajaxJson(url,{},function(result){
                        if (result.success) {
                            Validator.renderData(result.SysRole,$('#dataInfo'));
                        } else {
                            Mom.layMsg(result.message);
                        }
                    });
                    //用户功能显示（已分配）用户信息列表
                    var url = Api.admin+"/api/sys/SysRole/assign/" + roleId;
                    Api.ajaxJson(url, {}, function (result) {
                        if (result.success) {
                            renderTableData(result.rows);
                        } else {
                            Mom.layMsg(result.message);
                        }
                    });
                }
            }
            function renderTableData(tableData){
                $('#treeTable').dataTable({
                    bFilter: true,
                    data: tableData,
                    aoColumns: [
                        {"data": null, "defaultContent":"", 'sClass': "autoWidth center",
                            "render":function(data, type, row, meta) {
                                return "<input type='checkbox' id=" + data.id + " class='i-checks'>"
                            }
                        },
                        {"data": "loginName",'sClass':" center"},
                        {
                            "data": "name", "orderable": false, "defaultContent": "",'sClass':" center  ",
                            "render": function (data, type, row, meta) {
                                return "<a class='roleName' style='color:#000'>"+row.name+"</a >" ;
                            }
                        },
                        {"data": "phone",'sClass':"center"},
                        {"data": "mobile",'sClass':"center"},
                        {
                            "data": null, "orderable": false, "defaultContent": "",'sClass':"autoWidth center ",
                            "render": function (data, type, row, meta) {
                                return "<a class='btn btn-delete' style='cursor:pointer' id='"+row.id+"' name='"+row.name+"'>移除</a >" ;
                            }
                        }]
                });
                renderIChecks();
            }

            /*移除按钮操作*/
            $("#datainner").on("click", '.btn-delete', function () {
                var userIds = $(this).attr('id'),
                    userName = $(this).attr('name'),
                    roleName = $('#name').text();
                var data = {
                    roleId: roleId,
                    userIds: userIds
                };
                deleteACallback('确认要将用户 <b>[' + userName + ']</b><br>从 <b>['+roleName+']</b> 中移除吗？', data);
            });

            $('#delete-btn').click(function () {
                var userIds = "", roleName = $('#name').text();
                $("#treeTable tbody tr td input.i-checks:checkbox").each(function () {
                    if (true == $(this).is(':checked')) {
                        userIds += "," + $(this).attr("id");
                    }
                });
                if (userIds.length > 0) {
                    var data = {
                        roleId: roleId,
                        userIds: userIds.substr(1)
                    };
                    deleteACallback('确认要将已选择的用户从 <b>['+roleName+']</b><br>中移除吗？', data);
                } else {
                    Mom.layMsg('请至少选择一条数据!');
                }
            });

            function deleteACallback(msg, data){
                Mom.layConfirm(msg, function(layIdx, layero){
                    Api.ajaxForm(Api.admin+'/api/sys/SysRole/removeUser', data, function (result) {
                        if (result.success == true) {
                            refreshLoad();
                            top.layer.close(layIdx);
                        }
                    });
                });
            }

            //角色添加人员
            $("#assignButton").click(function(){
                var options = {
                    hasUserOptions:{
                        apiCfg:{
                            url: Api.admin+"/api/sys/SysRole/assign/"+roleId,
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
                            roleId: roleId,
                            userIds: idsArr.join(',')
                        };
                        Api.ajaxForm(Api.admin+'/api/sys/SysRole/saveUserRole', formdata, function(result){
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

            refreshLoad();
        }

    };

    $(function(){
        if($('#roleTypeOfAllotPro').length > 0){
            PageModule.listAllotPro();
        }
        else if($('#roleAssign').length > 0){
            PageModule.roleAssign();
        }
    });

});