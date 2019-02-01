require(['/js/zlib/app.js'], function(App) {
    //引入用户登录校验
    require(['checkUser']);

    var PageModule = {
        //  角色管理
        listInit: function(){
            //引入Page插件
            require(['Page'],function(){
                var page = new Page();
                window.pageLoad = function (){
                    var data = {
                        nameParam: $("#name").val()
                    };
                    //修改默认每页显示条数
                    page.init(Api.admin+"/api/sys/SysRole/page",data,true,function(tableData, result){
                        renderTableData(tableData);
                        $('.btn-check').click(function(){
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openDialog('查看角色','systemSettings/roleInner.html?id='+id+'&api=view','800px','362px');
                        });
                        $('.btn-change').click(function(){
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openEditDialog('修改角色','systemSettings/roleInner.html?id='+id,'800px','362px');
                        });
                        $('.btn-delete').click(function(){
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.deleteItem('确定要删除该角色吗',Api.admin+'/api/sys/SysRole/delete/',{ids:id});
                        });
                        $('.btn-add').click(function(){
                            var id = $(this).parents("tr").find('.i-checks').attr('id'),
                                authName =  $(this).parents("tr").find('.authName').text();
                            Bus.openDialog(authName+'-分配许可','systemSettings/roleTypeOfAllotPro.html?id='+id,'800px','500px');
                        });
                        $('.btn-allot').click(function(){
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openDialog('分配用户','systemSettings/roleAssign.html?id='+id,'800px','500px');
                        });
                    });
                };
                //点击重置按钮
                $('#reset-btn').click(function(){
                    $("#name").val("");
                    page.reset(["nameParam"]);
                });
                $("#search-btn").click(function(){
                    pageLoad();
                });

                pageLoad();

                function renderTableData(tableData){
                    $('#treeTable').dataTable({
                        "bSort": true,
                        "aoColumnDefs": [
                            {"bSortable": false, "aTargets": [0, 4]}
                        ],
                        "data":tableData,
                        "aoColumns": [
                            {"data": null, "defaultContent":"", 'sClass': "autoWidth center",
                                "render":function(data, type, row, meta) {
                                    return data = "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                                }
                            },
                            {"data": "name",'sClass':" center authName"},
                            {"data": "enname",'sClass':"center ","width":"15%"},
                            {"data": "roleTypeLabel",'sClass':"center"},
                            {
                                "data": "id", "orderable": false, "defaultContent": "",'sClass':" center autoWidth",
                                "render": function (data, type, row, meta) {
                                    return "<a class='btn btn-info btn-xs btn-check' ><i class='fa fa-search-plus'></i>查看</a >" +
                                        "<a class='btn btn-success btn-xs btn-change' ><i class='fa icon-change'></i>修改</a >" +
                                        "<a class='btn btn-danger btn-xs btn-delete' ><i class='fa fa-trash' ></i>删除</a >" +
                                        "<a class='btn btn-primary btn-xs btn-add'><i class='fa fa-briefcase'></i>分配许可</a >" +
                                        "<a class='btn btn-warning btn-xs btn-allot'><i class='fa fa-user'></i>分配用户</a >";
                                }
                            }]
                    });
                    renderIChecks();
                }
            });
        },

        //  查看，修改
        formInit: function(){
            var id =Mom.getUrlParam('id'),
                api = Mom.getUrlParam('api') || 'form';
            var url = Api.admin+"/api/sys/SysRole/"+api+"/"+id;
            Api.ajaxJson(url,{},function(result){
                if (result.success) {
                    var roleList = result.roleTypeList;
                    Bus.appendOptionsValue('#roleType',roleList);
                    Validator.renderData(result.SysRole,$('#inputForm'));
                } else {
                    Mom.layMsg(result.message);
                }
            });
        },

    };

    $(function(){
        //角色列表
        if($('#role').length > 0){
            PageModule.listInit();
        }
        else if($('#roleInner').length > 0){
            PageModule.formInit();
        }
    });

});