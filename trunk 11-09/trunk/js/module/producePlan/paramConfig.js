require(['/js/zlib/app.js'], function(App) {
    var PageModule = {
        paramConfig: function(){
            //引入Page插件
            require(['Page'], function () {
                var pageLoad = function () {
                    new Page().init(Api.aps+"/api/aps/Configure/page",{},true, function(data, result) {
                        dataout(data);
                        $('tbody tr').attr('class', 'center');
                        $('.btn-change').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openEditDialog('修改参数', './producePlan/paramConfigCheckView.html?id=' + id, '568px', '355px')
                        });
                        $('.btn-delete').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.deleteItem('确定要删除该参数吗',Api.aps+'/api/aps/Configure/delete', {ids:id});
                        });
                    });
                };
                pageLoad();
            });
            //   ajax请求渲染datatable数据
            function dataout(data) {
                $('#treeTable').dataTable({
                    "data": data,
                    "columns": [
                        {
                            "data": null, "defaultContent": "", 'sClass': "autoWidth center",
                            "render": function (data, type, row, meta) {
                                return "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                            }
                        },

                        {"data": "paramCode", "width": "100px"},
                        {"data": "value", "width": "100px"},
                        {"data": "remark", "width": "320px",'sClass':"alignLeft  autoWidth"},
                        {
                            "data": "id", "orderable": false, "defaultContent": "", 'sClass': "autoWidth center",
                            "render": function (data, type, row, meta) {
                                return "<a class='btn  btn-xs btn-change'><i class='fa icon-change'></i>修改</a >" +
                                    "<a class='btn  btn-xs btn-delete'><i class='fa fa-trash' ></i>删除</a >"
                            }
                        }
                    ]
                });
                renderIChecks();
            }
        },

        formInit: function(){
            var id = Mom.getUrlParam('id');
            $('#id').val(id);
            if (id) {
                /*此处后端接口  id为弹出窗口自带的id 通过浏览器方法传参得到*/
                var url = Api.aps+"/api/aps/Configure/form/"+id;
                Api.ajaxJson(url, {}, function (result) {
                    if (result.success) {
                        Validator.renderData(result.Configure, $('#inputForm'));
                    } else {
                        Mom.layMsg(result.message);
                    }
                });
            }
        }
    };

    $(function(){
        //参数配置列表
        if($('#paramConfigIndex').length > 0){
            PageModule.paramConfig();
        }
        //修改、增加
        else if($('#paramConfigCheckView').length > 0){
            PageModule.formInit();
        }
    });
});