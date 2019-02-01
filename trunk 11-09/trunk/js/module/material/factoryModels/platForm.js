/**
 * Created by admin on 2018/9/24.
 */
require(['/js/zlib/app.js'], function (App) {
    var PageModel = {
        init:function () {
            //动态添加Select的option
            Api.ajaxJson(Api.mtrl + "/api/fm/AreaUnit/getWorkshopList",{},function(result){
                Bus.appendOptionsValue('#wspId',result,'id','wspName');
            });
            //类型
            Api.ajaxJson(Api.admin + "/api/sys/SysDict/type/LOADRACK_TYPE",{},function(result){
                Bus.appendOptionsValue('#type',result.rows,'value','label');
            });
            require(["Page"],function () {
                var page = new Page();
                window.pageLoad = function () {
                    var data = {
                        loadrackType:$("#type option:selected").val(),
                        areaName:$("#areaName").val(),
                        wspId:$("#wspId option:selected").val(),
                        enable:$("#useFlag option:selected").val()
                    };
                    page.init(Api.mtrl+"/api/fm/AreaLoadRack/page",data,true,function (result) {
                        PageModel.createTable(result);
                        //编辑按钮
                        $(".tableEdit").click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openEditDialog('修改装卸台','../material/factoryModels/platFormInner.html?id='+id,'780px','400px');
                        });
                        //新增
                        $("#btn-add").unbind("click").on("click",function () {
                            Bus.openEditDialog('新增装卸台','../material/factoryModels/platFormInner.html','780px', '400px')
                        });
                        //编辑
                        $("#btn-edit").unbind("click").on("click",function () {
                            Bus.editCheckedTable('修改装卸台','../material/factoryModels/platFormInner.html','780px','400px','#treeTable')
                        });
                        //删除
                        $(".btn-delete").click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.deleteItem('确定要删除该罐区', Api.mtrl + '/api/fm/AreaLoadRack/del',{ids:id})
                        });
                        //点击重置按钮
                        $('#reset-btn').unbind('click').on("click",function () {
                            $("#areaName").val('');
                            $("#wspId option:first").prop("selected", 'selected');
                            $("#type option:first").prop("selected", 'selected');
                            $("#useFlag option:first").prop("selected", 'selected');
                            page.reset(["areaName", "wspId","type","useFlag"])
                        });
                    })
                }
                window.pageLoad();
            })
        },
        checkInit:function () {
            var id = Mom.getUrlParam("id");
            Api.ajaxForm(Api.mtrl+"/api/fm/AreaLoadRack/form/"+id,{},function (result) {
                if(result.success){
                    Bus.appendOptionsValue('#loadrackType',result.loadrackTypeList,'value','label');
                    Bus.appendOptionsValue('#wspId',result.workshopList,'id','wspName');
                    if(id){
                        Validator.renderData(result.areaLoadRack, $('#inputForm'))
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
                    {"data": "loadrackTypeLabel", 'sClass': "center "},
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
        if($("#platForm").length>0){
            PageModel.init();
        }else if($("#platFormInner").length>0){
            PageModel.checkInit();
        }
    })
});