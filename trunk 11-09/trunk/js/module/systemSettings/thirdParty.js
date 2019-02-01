require(['/js/zlib/app.js'], function(App) {
    //引入用户登录校验
    require(['checkUser']);
    var PageModule = {
        listInit: function(){
            //引入Page插件
            require(['Page'],function(){
                window.pageLoad = function (){
                    var data = {
                        name:$("#name").val()
                    };
                    //修改默认每页显示条数
                    var page = new Page();
                    page.init(Api.admin+"/api/sys/SysUserRel/page",data,true,function(tableData, result){
                        renderTableData(tableData);
                        //查看
                        $(".btn-check").click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openDialog('查看用户','systemSettings/thirdPartyInner.html?id='+id+'&api=form','738px','454px')
                        });
                        //编辑
                        $(".btn-change").click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openEditDialog('编辑用户','systemSettings/thirdPartyInner.html?id='+id+'&api=form','738px','454px')
                        });
                        //删除
                        $('.btn-delete').click(function(){
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.deleteItem('确定要删除该用户吗',Api.admin+'/api/sys/SysUserRel/delete/',{ids:id});
                        });
                        //重置按钮
                        $('#reset-btn').click(function(){
                            $("#name").val("");
                            page.reset(["name"]);
                        });
                    });
                };

                function renderTableData(tableData){
                    $('#treeTable').dataTable({
                        "data":tableData,
                        "aoColumns": [
                            {"data": null, "defaultContent":"", 'sClass': "autoWidth center",
                                "render":function(data, type, row, meta) {
                                    return "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                                }
                            },
                            {"data": "user.name",'sClass':"center"},
                            {"data": "user.loginName",'sClass':"center"},
                            {"data": "name",'sClass':" center authName"},
                            {"data": "loginName",'sClass':"center ","width":"15%"},
                            {"data": "mobile",'sClass':"center"},
                            {"data": "deptCode",'sClass':"center"},
                            {"data": "deptLabel",'sClass':"center"},
                            {"data": "jobLabel",'sClass':"center"},
                            {"data": "jobCode",'sClass':"center"},
                            {"data":null ,'sClass':"center autoWidth",
                                "render":function (data, type, row, meta) {
                                    var html = "<a class='btn btn-info btn-xs btn-check' ><i class='fa fa-search-plus'></i>查看</a >"+
                                        "<a class='btn btn-info btn-xs btn-change' ><i class='fa icon-change'></i>编辑</a >"+
                                        "<a class='btn btn-info btn-xs btn-delete' ><i class='fa fa-trash-o'></i>删除</a >"
                                    return html;
                                }
                            }
                        ]
                    });
                    renderIChecks();
                }

                $("#search-btn").click(function(){
                    pageLoad();
                });
                pageLoad();
            });
        },

        formInit: function(){
            var id = Mom.getUrlParam('id')||'0';
            var api = Mom.getUrlParam('api') || 'form';
            var url = Api.admin+"/api/sys/SysUserRel/form/"+id;
            Api.ajaxJson(url,{},function(result){
                if(result.success){
                    var SysUserRel = result.SysUserRel;
                    Bus.appendOptionsValue($('#sys'),result.appList);
                    Validator.renderData(SysUserRel, $('#inputForm'));
                }else{
                    Mom.layMsg(result.message);
                }
            });

            function selectUser1(){
                var options = { defaultVals:$('#momUserId').val() };
                Bus.openSelUserWin('选择用户',{},options,function(selResult, layIdx, layero){
                    $('#momUserId').val(selResult.id);
                    $('#momUserName').val(selResult.name);
                    $('#momLoginName').val(selResult.selRows[0].loginName);
                    return true;
                });
            };
            $('#momUserName,#momLoginName').on('dblclick',selectUser1);
            $('#momUserBtn').on('click',selectUser1);

        },

    };

    $(function(){
        //第三方用户管理列表
        if($('#thirdParty').length > 0){
            PageModule.listInit();
        } else if($('#thirdPartyInner').length > 0){//查看、编辑、新增
            PageModule.formInit();
        }
    });
});