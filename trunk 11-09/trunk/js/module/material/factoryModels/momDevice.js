/**
 * Created by lumaosai on 2018/9/21.
 */
require(['/js/zlib/app.js'], function (App) {
    var PageModule = {
        momDevice: function(){

            //引入Page插件
            require(['Page'], function () {
                var page = new Page();
                Api.ajaxJson(Api.mtrl + "/api/fm/AreaUnit/areaUnitList",{},function(result){
                    if(result.success){
                        Bus.appendOptionsValue('#nodeAreaId',result.rows,'id','areaName');
                    }
                });
                Api.ajaxJson(Api.admin + "/api/sys/SysDict/type/UNIT_TYPE",{},function(result){
                    if(result.success){
                        Bus.appendOptionsValue('#unitType',result.rows,'value','label');
                    }
                });
                window.pageLoad = function () {
                    var data = {
                        nodeAreaId: $("#nodeAreaId option:selected").val(),
                        unitType: $("#unitType option:selected").val(),
                        unitCode: $('#unitCode').val(),
                        unitName: $('#unitName').val()
                    };
                    //修改默认每页显示条数
                    page.init(Api.mtrl + "/api/fm/Unit/page", data, true, function (tableData) {
                        renderTableData(tableData);
                        $('.btn-edit').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openEditDialog('修改装置数据', '/material/factoryModels/momDeviceView.html?id=' + id, '700px', '370px',callback);
                        });
                        $('.btn-delete').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.deleteItem('确定要删除该装置数据吗', Api.mtrl + "/api/fm/Unit/delete", {ids:id});
                        });
                        //编辑
                        $("#btn-edit").unbind("click").on("click",function () {
                            Bus.editCheckedTable('修改装置数据','/material/factoryModels/momDeviceView.html','700px', '370px','#treeTable',callback);
                        });
                    });
                };
                $("#btn-search").click(function () {
                    pageLoad();
                });
                pageLoad();
            });

            function callback(layerIdx,layero){
                var iframeWin = layero.find('iframe')[0].contentWindow;
                var formData = iframeWin.getFormData();
                if(formData){
                    var data = formData.data;
                    Api.ajaxJson(formData.url, JSON.stringify(data), function(result){
                        if(result.success == true){
                            Mom.layMsg('操作成功', 1000);
                            //关闭弹出层
                            pageLoad();
                            top.layer.close(layerIdx);
                        }else{
                            Mom.layAlert(result.message);
                        }
                    });
                }
                return false;
            }

            function renderTableData(tableData) {
                $('#treeTable').dataTable({
                    "bSort": true,
                    "aoColumnDefs": [
                        {"bSortable": false, "aTargets": [0,6,10]}
                    ],
                    "data": tableData,
                    "aoColumns": [
                        {
                            "data": null, "defaultContent": "", 'sClass': "autoWidth center",
                            "render": function (data, type, row, meta) {
                                return data = "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                            }
                        },
                        {"data": "unitNo", 'sClass': " center", "width": "5%"},
                        {"data": "unitCode", 'sClass': "center ", "width": "8%"},
                        {"data": "unitName", 'sClass': "center", "width": "12%"},
                        {"data": "unitAlias", 'sClass': "center","width": "12%"},
                        {"data": "unitTypeLabel", 'sClass': "center","width": "12%"},
                        {"data": "capacity", 'sClass': "center", "width": '5%'},
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
        momDeviceView: function() {
            var id =Mom.getUrlParam('id');
            if(id){
                    Api.ajaxJson(Api.mtrl + "/api/fm/Unit/form/"+id,{},function(result){
                        if(result.success){
                            Bus.appendOptionsValue('#unitType',result.unitTypeList,'value','label');
                            Bus.appendOptionsValue('#nodeAreaId',result.areaUnitList,'id','areaName');
                            Validator.renderData(result.row, $('#inputForm'));
                        }
                        $('#unitNo').attr('disabled','disabled');
                        $('#nodeAreaId').attr('disabled','disabled');
                    });
            }else{
                Api.ajaxJson(Api.mtrl + "/api/fm/Unit/form/0",{},function(result){
                    if(result.success){
                        Bus.appendOptionsValue('#unitType',result.unitTypeList,'value','label');
                        Bus.appendOptionsValue('#nodeAreaId',result.areaUnitList,'id','areaName');
                    }
                });
            }
            window.getFormData = function(){
                $('#nodeAreaId').attr('disabled',false);
                if(!Validator.valid(document.forms[0],1.3)){
                    return;
                }
                var formObj = $('#inputForm');
                return {
                    url: formObj.attr('action'),
                    data: formObj.serializeJSON()
                }
            };
        }
    }
    $(function () {
        if ($('#momDevice').length > 0) {
            PageModule.momDevice();
        }else if($('#momDeviceView').length > 0){
            PageModule.momDeviceView();
        }
    });
})
