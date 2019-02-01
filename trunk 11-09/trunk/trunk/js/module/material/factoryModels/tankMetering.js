/**
 * Created by Dora on 2018/9/20.
 */
require(['/js/zlib/app.js'], function (App) {
    //引入用户登录校验
    require(['checkUser']);
    var PageModule = {
        listInit: function () {

            //一些下拉数据
            //计量类型
            Bus.createSelect(Api.admin + '/api/sys/SysDict/type/GAUGE_TYPE', "#measType", 'value', 'label');

            //工厂
            Bus.createSelect(Api.mtrl + '/api/fm/Fctr/fctrSelect', "#fctrId", 'id', 'fctrName');
            //新增=
            $('#btn-add').on('click', function () {
                Bus.openEditDialog('新增罐计量', 'material/factoryModels/tankMeteringInner.html?id=0', '700px', '400px');
            });
            $('#btn-edit').on('click', function () {
                Bus.editCheckedTable('编辑罐计量','material/factoryModels/tankMeteringInner.html','700px','400px','#treeTable')
            });
            //引入page插件
            require(['Page'], function () {
                window.pageLoad = function () {
                    var data = {
                        nodename: $("#nodename").val(),
                        fctrId : $("#fctrId ").val(),
                        tag: $("#tag").val(),
                        measType: $("#measType").val()
                    };
                    var page = new Page();
                    page.init(Api.mtrl +'/api/fm/TankMeas/page', data, true, function (tableData) {
                        renderTableData(tableData);
                        $('.btn-edit').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openEditDialog('编辑罐计量', 'material/factoryModels/tankMeteringInner.html?id=' + id, '700px', '400px');
                        });
                        $('.btn-delete').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.deleteItem('确定要删除该罐计量吗', Api.mtrl + '/api/fm/TankMeas/delete', {ids:id});
                        });
                    });
                };
                //搜索
                $("#btn-search").click(function () {
                    pageLoad();
                });
                pageLoad();
            });
            function renderTableData(tableData) {
                $('#treeTable').dataTable({
                    "bSort": true,
                    "aoColumnDefs": [
                        {"bSortable": false, "aTargets": [0, 2, 6]}
                    ],
                    "data": tableData,
                    "aoColumns": [
                        {
                            "data": null, "defaultContent": "", 'sClass': "autoWidth center",
                            "render": function (data, type, row, meta) {
                                return data = "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                            }
                        },
                        {"data": "nodeTank.nodeNo", 'sClass': " center"},
                        {"data": "nodeTank.nodename", 'sClass': "center"},
                        {"data": "nodeTank.nodeAlias", 'sClass': "center"},
                        {"data": "fctr.fctrName", 'sClass': "center"},
                        {"data": "tag", 'sClass': "center"},
                        {"data": "measTypeLabel", 'sClass': "center"},
                        {"data": "coefficient", 'sClass': "center"},
                        //{"data": "areaName", 'sClass': "center"},
                        {"data": "nodeArea.areaName", 'sClass': "center"},
                        {"data": "enable", 'sClass': "center",
                            "render": function (data, type, row, meta) {
                                return "<i class='fa gray-check-"+row.enable+"'></i>";
                            }
                        },
                        {"data": "displayOrder", 'sClass': "center"},
                        {"data": "remark", 'sClass': "center"},
                        {
                            "data": "id", "defaultContent": "", 'sClass': " center ",
                            /*"render": function (data, type, row, meta) {
                             return "<a class='btn btn-info btn-xs btn-check' ><i class='fa fa-search-plus'></i>查看</a >" +
                             "<a class='btn btn-success btn-xs btn-change' ><i class='fa icon-change'></i>修改</a >" +
                             "<a class='btn btn-danger btn-xs btn-delete' ><i class='fa fa-trash-o' ></i>删除</a >" +
                             "<a class='btn btn-primary btn-xs btn-add'><i class='fa fa-plus'></i>添加键值</a >";
                             }*/
                            "render": function (data, type, row, meta) {
                                return "<a class='btn-edit' title='编辑'><i class='fa fa-edit '></i></a >" +
                                    "<a class='btn-delete' title='删除'><i class='fa fa-trash-o '></i></a >";
                            }
                        }]
                });
                renderIChecks();
            }
        },

        formInit: function () {
            var id = Mom.getUrlParam('id');
            var url = Api.mtrl + '/api/fm/TankMeas/form/'+id;
            Api.ajaxJson(url,{},function(result){
                if (result.success) {
                    //工厂
                    var fctrNameList = result.fctrList;
                    Bus.appendOptionsValue('#fctrId',fctrNameList,'id','fctrName');
                    Bus.appendOptionsValue('#nodeAreaType',result.nodeAreaTypeList,'value','label');
                    // //界区类型--不要了
                    //var areaTypeList = result.nodeAreaTypeList;
                    //Bus.appendOptionsValue('#areaType',areaTypeList,'label','id');

                    // 界区
                    var fctrListAndnodeAreaList = result.fctrListAndnodeAreaList;

                    $("#fctrId").change(function(){
                        var id = $(this).val();
                        fctrListAndnodeAreaList.forEach(function(item){
                            if( id == item.key){
                                Bus.resetSelect($("#nodeAreaId"),'请选择');
                                Bus.appendOptionsValue('#nodeAreaId',item.value,'id','areaName');
                            }
                        });
                    });


                    // 罐
                    var nodeNameList = result.tankTypeList;
                    Bus.appendOptionsValue('#nodeId',nodeNameList,'nodeId','nodename');

                    // 计量类型
                    var measTypeList = result.gaugeTypeList;
                    Bus.appendOptionsValue('#measType',measTypeList,'value','label');


                    if(id != '0'){
                        //如果有工厂
                        if(result.row.fctrId){
                            fctrListAndnodeAreaList.forEach(function(item){
                                if( result.row.fctrId == item.key){
                                    Bus.resetSelect($("#nodeAreaId"),'请选择');
                                    Bus.appendOptionsValue('#nodeAreaId',item.value,'id','areaName');
                                }
                            });
                        }
                        Validator.renderData(result.row, $('#inputForm'));
                    }
                } else {
                    Mom.layMsg(result.message);
                }
            });
        }
    };
    $(function () {
        //加工方案列表
        if ($('#tankMeteringList').length > 0) {
            PageModule.listInit();
        }

        //加工方案管理修改
        else if ($('#tankMeteringInner').length > 0) {
            PageModule.formInit();
        }


    });

});