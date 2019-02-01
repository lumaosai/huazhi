require(['/js/zlib/app.js'], function(App) {
    //引入用户登录校验
    require(['checkUser']);

    var PageModule = {
        listInit: function(){
            //引入Page插件
            require(['Page'],function(){
                window.pageLoad = function (){
                    var data = {
                        appNameParam: $("#authNameParam").val(),
                        appCodeParam: $("#authCodeParam").val(),
                        enable:$("#authEnable").val()
                    };
                    //修改默认每页显示条数
                    var page = new Page();
                    page.init(Api.admin+"/api/sys/SysApplication/page",data,true,function(tableData){
                        renderTableData(tableData);
                        $('.btn-check').click(function(){
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openDialog('查看应用','systemSettings/applicationInner.html?id='+id+'&api=view','635px','340px')
                        });
                        $('.btn-change').click(function(){
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openEditDialog('修改应用','systemSettings/applicationInner.html?id='+id,'635px','340px');
                        });
                        $('.btn-delete').click(function(){
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.deleteItem('确定要删除该应用吗',Api.admin+'/api/sys/SysApplication/delete',{ids:id});
                        });
                        //点击重置按钮
                        $('#reset-btn').click(function(){
                            Mom.clearForm('.toolbar-form');
                            page.reset(["appNameParam","appCodeParam","enable"]);
                        });
                    });
                };
                $("#search-btn").click(function(){
                    pageLoad();
                });
                pageLoad();
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
                        {"data": "appName",'sClass':"center ","width":"15%"},
                        {"data": "appCode",'sClass':"center"},
                        {"data": "appRoot",'sClass':"center"},
                        {"data": "applicability","defaultContent":"",'sClass':"center",
                            "render":function(data, type, row, meta) {
                                return applicability = row.applicability=='1'?"B/S端":"手机端";
                            }
                        },
                        {"data": "sort",'sClass':"center"},
                        {"data": "enable",'sClass':"center ","width":"10%", "defaultContent": "","render":function (data, type, row, meta){
                                var chahgeType;
                                return chahgeType = row.enable=='0'?"否":"是";
                            }
                        },
                        {
                            "data": "id", "orderable": false, "defaultContent": "",'sClass':" center autoWidth",
                            "render": function (data, type, row, meta) {
                                return "<a class='btn btn-info btn-xs btn-check' ><i class='fa fa-search-plus'></i>查看</a >" +
                                    "<a class='btn btn-success btn-xs btn-change' ><i class='fa icon-change'></i>修改</a >" +
                                    "<a class='btn btn-danger btn-xs btn-delete' ><i class='fa fa-trash-o' ></i>删除</a >";
                            }
                        }],
                });
                renderIChecks();
            }
        },

        formInit: function(){
            var id = Mom.getUrlParam('id'),
                api = Mom.getUrlParam('api') || 'form';
            $("#value").focus();
            if(id){
                var url = Api.admin+"/api/sys/SysApplication/"+api+"/"+id;
                Api.ajaxJson(url,{},function(result){
                    if(result.success){
                        Validator.renderData(result.SysApplication,$('#inputForm'));
                    }else{
                        Mom.layMsg(result.message);
                    }
                });
            }
        }
    };

    $(function(){
        //应用管理列表
        if($('#application').length > 0){
            PageModule.listInit();
        }
        else if($('#applicationInner').length > 0){
            PageModule.formInit();
        }
    });
});