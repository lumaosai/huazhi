/**
 * Created by admin on 2018/9/24.
 */
require(['/js/zlib/app.js'], function (App) {
    var PageModel = {
        init:function () {
            require(["Page"],function () {
                var page = new Page();
                PageModel.loadWarehouse();
                window.pageLoad = function () {
                    var data = {
                        nodeCode:$("#nodecode").val(),
                        nodeName:$("#nodename").val(),
                        nodeAreaId:$("#warehouse option:selected").val()
                    };
                    console.log(data)
                    page.init(Api.mtrl+"/api/fm/NodeLocation/page",data,true,function (result) {
                        PageModel.createTable(result);
                        //编辑按钮
                        $(".tableEdit").unbind("click").on("click",function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openEditDialog('修改库位','../material/factoryModels/storageLocationInner.html?id='+id,'700px','400px');
                        });
                        //删除
                        $(".btn-delete").unbind("click").on("click",function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.deleteItem('确定要删除该库位', Api.mtrl + '/api/fm/NodeLocation/delete',{ids:id});
                        });
                        //新增
                        $("#btn-add").unbind("click").on("click",function () {
                            Bus.openEditDialog('新增库位','../material/factoryModels/storageLocationInner.html','700px', '400px')
                        });
                        //编辑
                        $("#btn-edit").unbind("click").on("click",function () {
                            Bus.editCheckedTable('修改库位','../material/factoryModels/potTinInner.html','770px','666px','#treeTable')
                        });
                        //点击重置按钮
                        $('#reset-btn').unbind('click').on("click",function () {
                            $("#nodecode").val('');
                            $("#nodename").val('');
                            $("#nodeAreaId option:first").prop("selected", 'selected');
                            page.reset(["nodecode", "nodename","nodeAreaId"]);
                        });
                    })
                };
                window.pageLoad();
            })
        },
        checkInit:function () {
            var id = Mom.getUrlParam("id");
             Api.ajaxForm(Api.mtrl+"/api/fm/NodeLocation/form/"+id,{},function (result) {
                    if(result.success){
                        Bus.appendOptionsValue('#nodeAreaId',result.AreaStockList,'id','areaName');
                        if(id){
                            Validator.renderData(result.nodeLocation, $('#inputForm'));
                            $("#nodeAreaId option").each(function () {
                                if(result.nodeLocation.nodeAreaId == $(this).attr('value')){
                                    $(this).attr("selected",true);
                                }
                                $('#nodeNo').attr('readonly', 'readonly');
                            });
                        }
                    }else{
                        Mom.layMsg(result.message);
                    }
                })
        },
        createTable:function (dataTable) {
            $('#treeTable').dataTable({
                "bSort": true,
                "aoColumnDefs": [
                    {"bSortable": false, "aTargets": [0, 2, 4, 6]}
                ],
                "data": dataTable,
                "aoColumns": [
                    {"data": null, "defaultContent":"", 'sClass': "autoWidth center",
                        "render":function(data, type, row, meta) {
                            return data = "<input type='checkbox' id=" + row.nodeId + " class='i-checks'>"
                        }
                    },
                    {"data": "nodeNo", 'sClass': "center "},
                    {"data": "nodeCode", 'sClass': "center"},
                    {"data": "nodename", 'sClass': "center "},
                    {"data": "nodeAlias", 'sClass': "center "},
                    {"data": "pres", 'sClass': "center "},
                    {"data": "areaName", 'sClass': "center "},
                    {"data": "id", "orderable": false, "defaultContent": "", 'sClass': " center autoWidth",
                        "render": function (data, type, row, meta) {
                            return "<i class='fa gray-check-"+row.enable+"'></i>";
                        }
                    },
                    {"data": "remark", 'sClass': "center "},
                    {
                        "data": null, "orderable": false, "defaultContent": "", 'sClass': "center autoWidth",
                        "render": function (data, type, row, meta) {
                            var html = "<a class='btn-edit' title='编辑'>" +
                                "<i class='fa tableEdit fa-edit'></i>"+
                                "</a>"+
                                "<a class='btn-delete' title='删除'>" +
                                "<i class='fa fa-trash'></i>"+
                                "</a>";
                            return  html;
                        }
                    }
                ]
            });
            renderIChecks();
        },
        loadWarehouse:function () {
            Api.ajaxForm(Api.mtrl + "/api/fm/AreaStock/stockList",{},function(result){
                Bus.appendOptionsValue('#warehouse',result.rows,'id','areaName');
            });
        }
    }
    $(function () {
        if($("#storageLocation").length>0){
            PageModel.init();
        }else if($("#storageLocationInner").length>0){
            PageModel.checkInit();
        }
    })
});