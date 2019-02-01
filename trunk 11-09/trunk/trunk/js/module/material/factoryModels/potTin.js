/**
 * Created by admin on 2018/9/24.
 */
require(['/js/zlib/app.js'], function (App) {
    var PageModel = {
        init:function () {
            require(["Page"],function () {
                // Bus.createSelect(Api.admin + "/api/sys/SysDict/Type/TANK_TYPE", "#slineMtrlType", 'type', 'type');
                //加载罐类型下拉
                Api.ajaxForm(Api.admin + "/api/sys/SysDict/type/TANK_TYPE",{},function(result){
                    Bus.appendOptionsValue('#tankType',result.rows,'value','label');
                });
                //加载界区下拉
                Api.ajaxJson(Api.mtrl+"/api/fm/NodeArea/list",JSON.stringify({}),function(result){
                    Bus.appendOptionsValue('#nodeAreaId',result.rows,'id','areaName');
                });
                var page = new Page();
                window.pageLoad = function () {
                    var data = {
                        nodeCode:$("#nodecode").val(),
                        nodename:$("#nodename").val(),
                        tankType:$("#tankType option:selected").val(),     //罐类型
                        nodeAreaId:$("#nodeAreaId option:selected").val()           //罐区
                    };
                    page.init(Api.mtrl+"/api/fm/NodeTank/page",data,true,function (result) {
                        PageModel.createTable(result);
                        //编辑按钮
                        $(".tableEdit").click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openEditDialog('修改罐','../material/factoryModels/potTinInner.html?id='+id,'770px','666px',callback);
                        });
                        //新增
                        $("#btn-add").unbind("click").on("click",function () {
                            Bus.openEditDialog('新增罐','../material/factoryModels/potTinInner.html','770px', '666px');
                        });
                        //编辑
                        $("#btn-edit").unbind("click").on("click",function () {
                            Bus.editCheckedTable('修改罐','../material/factoryModels/potTinInner.html','770px','666px','#treeTable',callback);
                        });
                        //删除
                        $(".btn-delete").click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.deleteItem('确定要删除该罐', Api.mtrl + '/api/fm/NodeTank/delete',{ids:id});
                        });
                        //点击重置按钮
                        $('#reset-btn').unbind('click').on("click",function () {
                            $("#nodecode").val('');
                            $("#nodename").val('');
                            $("#tankType option:first").prop("selected", 'selected');
                            $("#nodeAreaId option:first").prop("selected", 'selected');
                            page.reset(["nodecode", "nodename","tankType","nodeAreaId"]);
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
                    })
                };
                window.pageLoad();
            })
        },
        checkInit:function () {
            var id = Mom.getUrlParam("id");
            Api.ajaxForm(Api.mtrl+"/api/fm/NodeTank/form/"+id,{},function (result) {
                if(result.success){
                    Bus.appendOptionsValue('#tankType',result.tankTypeList,'value','label');
                    Bus.appendOptionsValue('#nodeAreaId',result.nodeAreaList,'id','areaName');
                   if(id){
                       $("#tankType option").each(function () {
                           if(result.row.tankType == $(this).attr('value')){
                               $(this).attr("selected",true);
                           }
                       });
                       Validator.renderData(result.row, $('#inputForm'));
                       $('#nodeNo').attr('readonly', 'readonly');
                       $('#nodeAreaId').attr('disabled','disabled');

                   }
                }else{
                    Mom.layMsg(result.message);
                }
            })
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
                    {"data": "nodeNo", 'sClass': "center "},
                    {"data": "nodeCode", 'sClass': "center"},
                    {"data": "nodename", 'sClass': "center "},
                    {"data": "nodeAlias", 'sClass': "center "},
                    {"data": "tankTypeLabel", 'sClass': "center "},
                    {"data": "area.areaName", 'sClass': "center "},
                    {"data": "tankHgt", 'sClass': "center "},
                    {"data": "pres", 'sClass': "center "},
                    {"data": "id", "orderable": false, "defaultContent": "", 'sClass': " center autoWidth",
                        "render": function (data, type, row, meta) {
                            return "<i class='fa gray-check-"+row.enable+"'></i>";
                        }
                    },
                    {"data": "stkhsFlag", 'sClass': "center ",
                        "render": function (data, type, row, meta) {
                            return "<i class='fa gray-check-"+row.stkhsFlag+"'></i>";
                        }
                    },
                    {"data": "fltPlatWgt", 'sClass': "center " },
                    {"data": "tankHtPret", 'sClass': "center ",
                        "render": function (data, type, row, meta) {
                            return "<i class='fa gray-check-"+row.tankHtPret+"'></i>";
                        }
                    },
                    {"data": "fltPlatPerhgt", 'sClass': "center "},
                    {"data": "tankTotlCuba", 'sClass': "center "},
                    {"data": "fltTipLst", 'sClass': "center "},
                    {"data": "tankMaxHgt", 'sClass': "center "},
                    {"data": "tankMinHgt", 'sClass': "center "},
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
        if($("#potTin").length>0){
            PageModel.init();
        }else if($("#potTinInner").length>0){
            PageModel.checkInit();
        }
    })
});