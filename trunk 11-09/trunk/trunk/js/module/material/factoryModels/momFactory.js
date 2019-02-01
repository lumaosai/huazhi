/**
 * Created by lumaosai on 2018/9/21.
 */
require(['/js/zlib/app.js'], function (App) {
    require(['checkUser']);
    var PageModule = {
        momFactory: function(){

            //引入Page插件
            require(['Page'], function () {
                var page = new Page();

                window.pageLoad = function () {
                    var data = {
                        enable: $("#enable option:selected").val(),
                        fctrName: $('#fctrName').val()
                    };
                    //修改默认每页显示条数http://localhost/json/fwork/momgongchang.json
                    page.init(Api.mtrl + "/api/fm/Fctr/page", data, true, function (tableData) {
                        renderTableData(tableData);
                        $('.btn-edit').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openEditDialog('修改MOM工厂', '/material/factoryModels/momFactoryView.html?id=' + id, '700px', '320px');
                        });
                        $('.btn-delete').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.deleteItem('确定要删除该工厂吗', Api.mtrl + '/api/fm/Fctr/delete/', {ids:id});
                        });
                    });
                };
                $("#btn-search").click(function () {
                    pageLoad();
                });
                pageLoad();
            });
            function renderTableData(tableData) {
                $('#treeTable').dataTable({
                    "bSort": true,
                    "aoColumnDefs": [
                        {"bSortable": false, "aTargets": [0, 1,8 ]}
                    ],
                    "data": tableData,
                    "aoColumns": [
                        {
                            "data": null, "defaultContent": "", 'sClass': "autoWidth center",
                            "render": function (data, type, row, meta) {
                                return data = "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                            }
                        },
                        {"data": "fctrNo", 'sClass': " center", "width": "12%"},
                        {"data": "fctrCode", 'sClass': "center ", "width": "12%"},
                        {"data": "fctrName", 'sClass': "center", "width": "12%"},
                        {"data": "fctrAlias", 'sClass': "center","width": "12%"},
                        {"data": "fctrTypeLabel", 'sClass': "center", "width": '8%'},
                        {"data": "enable", 'sClass': "center", "width": "12%",
                            "render": function (data, type, row, meta) {
                                return "<i class='fa gray-check-"+row.enable+"'></i>";
                            }
                        },
                        {"data": "displayOrder", 'sClass': "center", "width": '8%'},
                        {"data": "remark", 'sClass': "center"},
                        {
                            "data": "id", "orderable": false, "defaultContent": "", 'sClass': " center autoWidth",
                            "render": function (data, type, row, meta) {
                                return "<a class='btn-edit' title='编辑'><i class='fa fa-edit '></i></a >" +
                                    "<a class='btn-delete' title='删除'><i class='fa fa-trash-o '></i></a >";
                            }
                        }]
                });
                renderIChecks();
            };
        },

        //编辑页面
        momFactoryView: function() {
            var id =Mom.getUrlParam('id');
            if(id){
                   //http://localhost/json/fwork/workedit.json
                Api.ajaxJson(Api.mtrl + "/api/fm/Fctr/form/" + id,{},function(result){
                    if(result.success){
                        Bus.appendOptionsValue('#fctrType',result.fctrType,'value','label');
                        Validator.renderData(result.Fctr, $('#inputForm'));
                    }
                    $('#fctrNo').attr('disabled','disabled');
                });
            }else{
                Api.ajaxJson(Api.mtrl + "/api/fm/Fctr/form/0",{},function(result){
                    if(result.success){
                        Bus.appendOptionsValue('#fctrType',result.fctrType,'value','label');
                    }
                });
            }

        }
    }
    $(function () {
        if ($('#momFactory').length > 0) {
            PageModule.momFactory()
        }else if($('#momFactoryView').length > 0){
            PageModule.momFactoryView();
        }
    });
})