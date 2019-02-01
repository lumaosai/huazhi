require(['/js/zlib/app.js'], function (App) {
    //引入用户登录校验
    require(['checkUser']);
    /**作者：贾旭光
     *日期：2018.9.20
     * 接口问题： 修改了以后checkbox保存 传了参数 但是返回是空 enable字段
     */
    var PageModule = {
        /**列表页————lateralLineListPage页*/
        //列表页
        measurementPointListInit: function () {
            Mom.include('computed_css', '/css/', ['computedCommons.css']);

            Api.ajaxJson(Api.mtrl+'/api/fm/Fctr/fctrSelect',{},function (result) {
                Bus.appendOptionsValue('#fctrId',result.rows,'id','fctrName')
            });
            Api.ajaxJson(Api.mtrl+'/api/fm/NodeArea/list',JSON.stringify({}),function (result) {
                Bus.appendOptionsValue('#nodeAreaId',result.rows,'id','areaName')
            });
            Bus.createSelect(Api.admin+'/api/sys/SysDict/type/MTRL_TYPE','#mtrlType');


            require(['Page'], function (){
                var page = new Page();
                window.pageLoad = function () {
                    var data = {
                        instrName: $('#instrName').val(),
                        nodeAreaId: $('#nodeAreaId').val(),
                        Tag: $('#Tag').val(),
                        fctrId: $('#fctrId option:selected').val(),
                        mtrlType: $('#mtrlType option:selected').val()
                    };
                    page.init(Api.mtrl + "/api/fm/Instrument/page", data, true, function (tableData,result) {
                        PageModule.createTable(tableData);
                        PageModule.btngather(page);
                    })



                };
                pageLoad();

            })


        },
        //创建表格
        createTable: function (tableDate) {
            $('#treeTable').dataTable({
                "bSort": true,
                "aoColumnDefs": [
                    {"bSortable": false, "aTargets": [0]}
                ],
                "data": tableDate,
                "aoColumns": [
                    {
                        "data": null, "defaultContent": "", 'sClass': " center",
                        "render": function (data, type, row, meta) {
                            return data = "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                        }
                    },
                    {"data": "instrNo",      'sClass': "center "},
                    {"data": "instrName",      'sClass': "center "},
                    {"data": "instrAlias",    'sClass': "center "},
                    {"data": "area.areaName",       'sClass': "center "},
                    {"data": "tag",           'sClass': "center "},
                    {"data": "coefficient",       'sClass': "center "},
                    {"data": "dimensionType",       'sClass': "center "},
                    {"data": "fctr.fctrName",       'sClass': "center "},
                    {"data": "mtrlTypeLabel",       'sClass': "center "},
                    {"data": "enable",        'sClass': "center ",
                        "render": function (data, type, row, meta) {
                            return "<i class='fa gray-check-"+row.enable+"'></i>"

                        }
                    },
                    {"data": "realFlag",       'sClass': "center ",
                        "render": function (data, type, row, meta) {
                            return "<i class='fa gray-check-"+row.realFlag+"'></i>"

                        }
                    },
                    {"data": "accuInstrFlag",   'sClass': "center ",
                        "render": function (data, type, row, meta) {
                            return "<i class='fa gray-check-"+row.accuInstrFlag+"'></i>"

                        }
                    },
                    {"data": "upSpan",        'sClass': "center "},
                    {"data": "dowmSpan",      'sClass': "center "},
                    {"data": "displayOrder",  'sClass': "center "},
                    {"data": "remark",          'sClass': "center "},
                    {
                        "data": "id", "orderable": false, "defaultContent": "", 'sClass': " center ","width":"8%",
                        "render": function (data, type, row, meta) {
                            return"<a class='btn-edit' title='编辑'><i class='fa fa-edit '></i></a >" +
                                "<a class='btn-delete' title='删除'><i class='fa fa-trash-o '></i></a >";
                        }
                    }

                ]
            });
            renderIChecks();
        },
        //按钮集合
        btngather: function (page) {
            //新增
            $('#btn-add').unbind('click').click(function () {
                Bus.openEditDialog('新增测量点', 'material/factoryModels/measurementPointForm.html?id=0', '755px', '600px');
            });
            //头部修改
            $('#btn-edit').unbind('click').click(function () {
                Bus.editCheckedTable('修改测量点', 'material/factoryModels/measurementPointForm.html', '755px', '600px','#treeTable');
            });
            //编辑
            $('.btn-edit').unbind('click').click(function () {
                var id = $(this).parents("tr").find('.i-checks').attr('id');
                Bus.openEditDialog('修改测量点', 'material/factoryModels/measurementPointForm.html?id=' + id, '755px', '600px');
            });
            //删除
            $('.btn-delete').unbind('click').click(function () {
                var id = $(this).parents("tr").find('.i-checks').attr('id');
                Bus.deleteItem('确定要删除该测量点吗', Api.mtrl + '/api/fm/Instrument/delete', {ids:id});
            });
            //点击重置按钮
            $('#reset-btn').unbind('click').click(function () {
                $("#nodeAreaId option:first").prop("selected", 'selected');
                $("#fctrId option:first").prop("selected", 'selected');
                $("#mtrlType option:first").prop("selected", 'selected');
                $("#instrName").val("");
                $("#Tag").val("");
                page.reset(["nodeAreaId", "instrName","Tag","mtrlType","fctrId"]);
            });
            $("#btn-search").unbind('click').click(function () {
                pageLoad();
            });
        },
        /**弹出新增、修改页*/
        measurementPointFormInit: function () {
            var id = Mom.getUrlParam('id'),
                api = Mom.getUrlParam('api') || 'form';


            // 加载select
            function loadSelect(list,pId,id) {
                var val = $(pId+'>option:selected').val();
                $(list).each(function(i,item){
                        if( val == item.key){
                            Bus.appendOptionsValue(id, item.value,'id','areaName');
                        }
                })
            }
            // select 改变事件
            function selectChange(list,pId,id) {
                $(pId).change(function(){
                    var val = $(this).val();
                    $(id).empty();
                    $(list).each(function(i,item){
                        if( val == item.key){
                            Bus.appendOptionsValue(id, item.value,'id','areaName');
                        }
                    })
                })
            }

            Api.ajaxJson(Api.mtrl + "/api/fm/Instrument/form/"+id, {}, function (result) {
                if (result.success) {
                    var list=result.fctrListAndnodeAreaList;
                    Bus.appendOptionsValue('#dimensionType',result.dimensionTypeList);
                    Bus.appendOptionsValue('#mesType',result.mesTypeList);
                    Bus.appendOptionsValue('#mtrlType',result.mtrlTypeList);
                    Bus.appendOptionsValue('#fctrId',result.fctrList,'id','fctrName');

                    PageModule.selectRender('#areaName',result.row.area.id);
                    selectChange(list,'#fctrId','#areaName');
                        Validator.renderData(result.row, $('#inputForm'));
                        PageModule.selectRender('#fctrId',result.row.fctr.id);
                        loadSelect(list,'#fctrId','#nodeAreaId');
                        selectChange(list,'#fctrId','#nodeAreaId');
                        PageModule.selectRender('#nodeAreaId',result.row.area.id);
                    if (id!=0) {
                        $('#instrNo').attr('readonly', 'readonly');
                    }
                } else {
                    Mom.layMsg(result.message);
                }
            });
            $('#nodeNo').attr('readonly', 'readonly');
        },
        //select 写select的选择器 dataval写返回值的id路径
        selectRender: function (select, dataval) {
            $(select + ">option").each(function () {
                if (dataval == $(this).attr('value')) {
                    $(this).attr("selected", true);
                }
            });
        }


    };
    $(function () {
        //参数配置列表
        if ($('#measurementPointList').length > 0) {
            PageModule.measurementPointListInit()
        }
        else if ($('#measurementPointForm').length > 0) {
            PageModule.measurementPointFormInit()
        }

    });

});
