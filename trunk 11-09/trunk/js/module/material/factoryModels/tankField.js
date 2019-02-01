/**
 * Created by admin on 2018/9/24.
 */
require(['/js/zlib/app.js'], function (App) {
    var PageModel = {
        init:function () {
            //加载车间下拉
            Api.ajaxJson(Api.mtrl + "/api/fm/AreaUnit/getWorkshopList",{},function(result){
                Bus.appendOptionsValue('#wspId',result,'id','wspName');
            });
            require(["Page"],function () {
                var page = new Page();
                window.pageLoad = function () {
                    var data = {
                        areaCode:$("#areaCode").val(),
                        areaName:$("#areaName").val(),
                        wspId:$("#wspId option:selected").val(),
                        enable:$("#startUsing option:selected").val()
                    };
                    page.init(Api.mtrl+"/api/fm/AreaTank/page",data,true,function (result) {
                        PageModel.createTable(result);
                        //编辑按钮
                        $(".tableEdit").click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openEditDialog('修改罐区','../material/factoryModels/tankFieldInner.html?id='+id,'783px','318px');
                        });
                        //删除
                        $(".btn-delete").click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.deleteItem('确定要删除该罐区', Api.mtrl + '/api/fm/AreaTank/del',{ids:id});
                        });
                        //点击重置按钮
                        $('#reset-btn').unbind('click').on("click",function () {
                            $("#areaCode").val('');
                            $("#areaName").val('');
                            $("#wspId option:first").prop("selected", 'selected');
                            $("#startUsing option:first").prop("selected", 'selected');
                            page.reset(["areaCode", "areaName","wspId","startUsing"])
                        });
                    })
                };
                window.pageLoad();
            });
            //新增
            $("#btn-add").click(function () {
                Bus.openEditDialog('新增罐区','/material/factoryModels/tankFieldInner.html','783px', '318px')
            });
            //修改
            $("#btn-edit").click(function () {
                Bus.editCheckedTable('修改罐区','../material/factoryModels/tankFieldInner.html','783px','318px','#treeTable')
            });
        },
        checkInit:function () {
            var id = Mom.getUrlParam("id");
            Api.ajaxForm(Api.mtrl+"/api/fm/AreaTank/form/"+id,{},function (result) {
                if(result.success){
                    Bus.appendOptionsValue('#wspId',result.workshopList,'id','wspName');
                    if(id){
                        Validator.renderData(result.areaTank, $('#inputForm'));
                        $('#areaNo').attr('readonly', 'readonly');
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
                            return data = "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                        }
                    },
                    {"data": "areaNo", 'sClass': "center "},
                    {"data": "areaCode", 'sClass': "center"},
                    {"data": "areaName", 'sClass': "center "},
                    {"data": "areaAlias", 'sClass': "center "},
                    {"data": "workshop.wspName", 'sClass': "center "},
                    {"data": "id", "orderable": false, "defaultContent": "", 'sClass': " center autoWidth",
                        "render": function (data, type, row, meta) {
                            return "<i class='fa gray-check-"+row.enable+"'></i>";
                        }
                    },
                    {"data": "displayOrder", 'sClass': "center "},
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
        }
    }
    $(function () {
        if($("#tankField").length>0){
            PageModel.init();
        }else if($("#tankFieldInner").length>0){
            PageModel.checkInit();
        }
    })
    });