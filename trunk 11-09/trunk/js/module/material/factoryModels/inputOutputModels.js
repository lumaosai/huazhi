/**
 * Created by Dora on 2018/9/20.
 */
require(['/js/zlib/app.js'], function (App) {
    //引入用户登录校验
    require(['checkUser']);
    var PageModule = {
        listInit: function () {
            //新增下拉数据
            //工厂
            Bus.createSelect(Api.mtrl + '/api/fm/Fctr/fctrSelect', "#fctrId", 'id', 'fctrName');
            //物料
            Api.ajaxJson(Api.mtrl + '/api/fm/Mtrl/list',JSON.stringify({}),function(result){
                if(result.success){
                    //var list = [];
                    //result.rows.forEach(function(i){
                    //   list.push({
                    //       id: i.id,
                    //       mtrlName: i.mtrl.mtrlName
                    //   })
                    //});
                    Bus.appendOptionsValue("#mtrlId", result.rows,'id','mtrlName');
                }
            });
            //Bus.createSelect(Api.mtrl + '/api/fm/Mtrl/list', "#fctrId", 'id', 'fctrName');
            //新增=
            $('#btn-add').on('click', function () {
                Bus.openEditDialog('新增投入产出模型配置', 'material/factoryModels/inputOutputModelsInner.html?id=0', '700px', '445px');
            });
            $('#btn-edit').on('click', function () {
                Bus.editCheckedTable('编辑投入产出模型配置','material/factoryModels/inputOutputModelsInner.html','700px','445px','#treeTable')
            });
            //引入page插件
            require(['Page'], function () {
                var page = new Page();
                window.pageLoad = function () {
                    var data = {
                        node:{
                            nodename:$("#nodename").val()
                        },
                        proCase:{
                            caseName:$("#caseName").val()
                        },
                        mtrlId: $("#mtrlId").val(),
                        fctr:{
                            id:$("#fctrId").val()
                        }
                    };
                    page.init(Api.mtrl +'/api/fm/InoutputModel/page', data, true, function (tableData) {
                        renderTableData(tableData);
                        $('.btn-edit').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openEditDialog('编辑投入产出模型配置', 'material/factoryModels/inputOutputModelsInner.html?id=' + id, '700px', '445px');
                        });
                        $('.btn-delete').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.deleteItem('确定要删除该投入产出模型配置吗', Api.mtrl + '/api/fm/InoutputModel/delete', {ids:id});
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
                        {"data": "unit.unitName", 'sClass': " center"},
                        {"data": "proCase.caseName", 'sClass': "center"},
                        {"data": "node.nodename", 'sClass': "center"},
                        {"data": "mtrl.mtrlName", 'sClass': "center"},
                        {"data": "fctr.fctrName", 'sClass': "center"},
                        {"data": "ratioUplimit", 'sClass': "center"},
                        {"data": "ratioDownlimit", 'sClass': "center"},
                        {"data": "ratio", 'sClass': "center"},
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

            PageModule.findKeyByKey([
                {
                    id:222,
                    aa:444
                }
            ],'id',222,'aa')
        },
        /*
        * list 数组
        * idFrom 通过哪个字段找
        * idValue 字段的值
        * aTo 要找的字段
        * */
        findKeyByKey:function(list,idFrom,idValue,aTo){
            list.forEach(function(i,o){
                if(i[idFrom] == idValue){
                    return i[aTo];
                }else{
                    console.log('没有找到要找的字段')
                }
            })
        },
        formInit: function () {
            var id = Mom.getUrlParam('id');
            var url = Api.mtrl +'/api/fm/InoutputModel/form/' + id;

            Api.ajaxJson(url ,{},function(result){
                console.log(result)
                if (result.success) {
                    // MOM工厂
                    var fctrList = result.mtrlFctrList;
                    var row =result.row;
                    var unitList = result.unitList;
                    Bus.appendOptionsValue('#fctrName',fctrList,'id','fctrName');

                    $("#fctrName").change(function(){
                        var id = $(this).val();
                        fctrList.forEach(function(item){
                            if( id == item.id){
                                //装置
                                Bus.resetSelect($("#unitId"),'请选择');
                                Bus.appendOptionsValue("#unitId", item.children1,'id','unitName');

                                //物料
                                Bus.resetSelect($("#mtrlId"),'请选择');
                                Bus.appendOptionsValue("#mtrlId", item.children2,'id','mtrlName');
                            }
                        });
                    });

                    $("#unitId").change(function(){
                        var id = $(this).val();
                        unitList.forEach(function(item){
                           if(item.id == id){
                               //加工方案
                               Bus.resetSelect($("#caseId"),'请选择');
                               Bus.appendOptionsValue("#caseId", item.children1,'id','caseName');

                               //料线
                               Bus.resetSelect($("#nodeId"),'请选择');
                               Bus.appendOptionsValue("#nodeId", item.children2,'id','nodename');
                           }
                        });
                    });
                    if(id!='0'){
                        //如果有工厂
                        if(result.row.fctr.id){
                            fctrList.forEach(function(item){
                                if( result.row.fctr.id == item.id){
                                    //装置
                                    Bus.resetSelect($("#unitId"),'请选择');
                                    Bus.appendOptionsValue("#unitId", item.children1,'id','unitName');

                                    //物料
                                    Bus.resetSelect($("#mtrlId"),'请选择');
                                    Bus.appendOptionsValue("#mtrlId", item.children2,'id','mtrlName');
                                }
                            });
                        }
                        //如果有装置
                        if(result.row.unitId){
                            unitList.forEach(function(item){
                                if(item.id == result.row.unitId){
                                    //加工方案
                                    Bus.resetSelect($("#caseId"),'请选择');
                                    Bus.appendOptionsValue("#caseId", item.children1,'id','caseName');

                                    //料线
                                    Bus.resetSelect($("#nodeId"),'请选择');
                                    Bus.appendOptionsValue("#nodeId", item.children2,'id','nodename');
                                }
                            });
                        }


                        Validator.renderData(row, $('#inputForm'));
                    }

                } else {
                    Mom.layMsg(result.message);
                }

            });
        }
    };
    $(function () {
        //加工方案列表
        if ($('#inputOutputModelsList').length > 0) {
            PageModule.listInit();
        }

        //加工方案管理修改
        else if ($('#inputOutputModelsInner').length > 0) {
            PageModule.formInit();
        }


    });

});