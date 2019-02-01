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
                        nameParam: $("#operationName").val(),
                        codeParam: $('#operationCode').val(),
                        desParam: $('#opeDescription').val(),
                        enable:   $('#enable').val(),
                    };
                    //修改默认每页显示条数
                    page.init(Api.admin+"/api/sys/SysOperation/page",data,true,function(tableData, result){
                        renderTableData(tableData);
                        $('tbody tr').attr('class','center');
                        $('.btn-check').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openDialog('查看属性信息', '/systemSettings/operationIndexInner.html?id=' + id, '640px','294px')
                        });
                        $('.btn-change').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openEditDialog('修改属性', '/systemSettings/operationIndexInner.html?id=' + id, '640px','294px')
                        });
                        $('.btn-delete').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.deleteItem('确定要删除该属性吗', Api.admin+'/api/sys/SysOperation/delete',{ids:id});
                        });
                    });
                };
                //点击重置按钮
                $("#reset-btn").click(function () {
                    Mom.clearForm('.toolbar-form');
                    page.reset(["nameParam","codeParam","desParam","enable"]);
                });
                $("#search-btn").click(function(){
                    pageLoad();
                });
                pageLoad();
            });

            function renderTableData(tableData) {
                $('#treeTable').dataTable({
                    "bSort": true,
                    "data": tableData,
                    "columns": [
                        {
                            "data": null, "defaultContent": "", 'sClass': "autoWidth center",
                            "render": function (data, type, row, meta) {
                                return data = "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                            }
                        },
                        {"data": null,"width":"6%" },
                        {"data": "name",'sClass':"center  "},
                        {"data": "code",'sClass':"center","width":"15%"},
                        {"data": "des", 'sClass':"center","width":"15%"},
                        {"data": "sort","width":"6%" },
                        {
                            "data": null,"width":"6%",
                            "render":function (data) {
                                if(data.enable==0){
                                    return data = '否'
                                }else{
                                    return data = '是'
                                }
                            }
                        },
                        {"data": "id", "orderable": false, "defaultContent": "",
                            "render": function (data, type, row, meta) {
                                return data = "<a class='btn btn-info btn-xs  btn-check'><i class='fa fa-search-plus'></i>查看</a >" +
                                    "<a class='btn btn-success btn-xs btn-change'><i class='fa fa icon-change'></i>修改</a >" +
                                    "<a class='btn btn-danger btn-xs btn-delete'><i class='fa fa-trash' ></i>删除</a >"
                            }
                        }],
                    "fnDrawCallback" : function(){
                        this.api().column(1).nodes().each(function(cell, i) {
                            cell.innerHTML =  i + 1;
                        });
                    },

                });
                renderIChecks();
            }
        },

        formInit: function(){
            var id = Mom.getUrlParam('id'),
                api = Mom.getUrlParam('api') || 'form';
            $("#value").focus();
            if(id){
                var url = Api.admin+"/api/sys/SysOperation/"+api+"/"+id;
                Api.ajaxJson(url,{},function(result){
                    if(result.success){
                        Validator.renderData(result.SysOperation,$('#inputForm'));
                    }else{
                        Mom.layMsg(result.message);
                    }
                });
            }
        }
    };

    $(function(){
        //操作管理列表
        if($('#operationIndex').length > 0){
            PageModule.listInit();
        }
        else if($('#operationIndexInner').length > 0){
            PageModule.formInit();
        }
    });
});