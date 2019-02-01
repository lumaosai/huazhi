/**
 * Created by lumaosai on 2018/9/21.
 */
require(['/js/zlib/app.js'], function (App) {
    var PageModule = {
        deviceBoundaryArea: function(){

            //引入Page插件
            require(['Page'], function () {
                var page = new Page();
                Api.ajaxJson(Api.mtrl + "/api/fm/AreaUnit/getWorkshopList",{},function(result){
                        Bus.appendOptionsValue('#wspId',result,'id','wspName');
                });
                window.pageLoad = function () {
                    var data = {
                        wspId: $("#areaCode option:selected").val(),
                        areaCode: $('#areaCode').val(),
                        areaName: $('#areaName').val(),
                        enable: $('#enable').val()
                    };
                    //修改默认每页显示条数
                    page.init(Api.mtrl + "/api/fm/AreaUnit/page", data, true, function (tableData) {
                        renderTableData(tableData);
                        $('.btn-edit').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openEditDialog('修改装置界区数据', '/material/factoryModels/deviceBoundaryAreaView.html?id=' + id, '830px', '310px');
                        });
                        $('.btn-delete').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.deleteItem('确定要删除该装置界区吗', Api.mtrl + '/api/fm/AreaUnit/del/', {ids:id});
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
                        {"bSortable": false, "aTargets": [0,8]}
                    ],
                    "data": tableData,
                    "aoColumns": [
                        {
                            "data": null, "defaultContent": "", 'sClass': "autoWidth center",
                            "render": function (data, type, row, meta) {
                                return data = "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                            }
                        },
                        {"data": "areaNo", 'sClass': " center", "width": "12%"},
                        {"data": "areaCode", 'sClass': "center ", "width": "12%"},
                        {"data": "areaName", 'sClass': "center", "width": "12%"},
                        {"data": "areaAlias", 'sClass': "center","width": "12%"},
                        {
                            "data": "id", "orderable": false, "defaultContent": "","width": "12%", 'sClass': "center",
                            "render": function (data, type, row, meta) {
                                return "<div>"+ row.workshop.wspName+"</div>"
                            }
                        },
                        {"data": "enable",'sClass': " center","width": '8%',
                            "render": function (data, type, row, meta) {
                                return "<i class='fa gray-check-"+data+"'></i>";
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
        deviceBoundaryAreaView: function() {
            var id = Mom.getUrlParam('id')||'0';
            Api.ajaxJson(Api.mtrl + "/api/fm/AreaUnit/form/" + id,{},function(result){
                if(result.success){
                    Bus.appendOptionsValue('#wspId',result.workshopList,'id','wspName');
                    if(id != '0'){
                        Validator.renderData(result.areaUnit, $('#inputForm'));
                        $('#areaNo').attr('readonly','readonly');
                    }
                }else{
                    Mom.layAlert(result.message);
                }
            });

        }
    }
    $(function () {
        if ($('#deviceBoundaryArea').length > 0) {
            PageModule.deviceBoundaryArea();
        }else if($('#deviceBoundaryAreaView').length > 0){
            PageModule.deviceBoundaryAreaView();
        }
    });
})
