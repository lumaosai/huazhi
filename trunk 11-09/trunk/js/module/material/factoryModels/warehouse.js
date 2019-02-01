require(['/js/zlib/app.js'], function (App) {
    //引入用户登录校验
    require(['checkUser']);
    /**作者：贾旭光
     *日期：2018.9.27
     *描述：
     *接口问题 checkbox返回后台保存给的是0 enable字段  回来的时候依然是空的
     */
    var PageModule = {
        /**列表页————lateralLineListPage页*/
        //列表页
        warehouseListInit: function () {
            Mom.include('computed_css', '/css/', ['computedCommons.css']);

            Api.ajaxJson(Api.mtrl+'/api/fm/AreaUnit/getWorkshopList',{},function (result) {
                Bus.appendOptionsValue('#wspId',result,'id','wspName');
            });
            Bus.createSelect(Api.admin+'/api/sys/SysDict/type/STOCK_TYPE','#stockType');

            require(['Page'], function () {
                var page = new Page();
                window.pageLoad = function () {
                    var data = {
                        areaCode: $('#areaCode').val(),
                        areaName: $('#areaName').val(),
                        wspId:    $('#wspId option:selected').val(),
                        stockType:$('#stockType option:selected').val(),
                        enable:   $('#enable option:selected').val()
                    };
                    page.init(Api.mtrl+"/api/fm/AreaStock/page", data, true, function (tableData,result) {
                        PageModule.createTable(result.page.rows);
                        PageModule.btngather(page);
                    })



                };
                pageLoad();

            });

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
                    {"data": "areaNo",      'sClass': "center "},
                    {"data": "areaCode",    'sClass': "center "},
                    {"data": "areaName",    'sClass': "center "},
                    {"data": "areaAlias",   'sClass': "center "},
                    {"data": "workshop.wspName", 'sClass': "center "},
                    {"data": "stockTypeLable",        'sClass': "center "},
                    {"data": "enable",     'sClass': "center ",
                        "render": function (data, type, row, meta) {
                            return "<i class='fa gray-check-"+row.enable+"'></i>"

                        }
                    },
                    {"data": "displayOrder",'sClass': "center "},
                    {"data": "remark",      'sClass': "center "},
                    {
                        "data": "id", "orderable": false, "defaultContent": "", 'sClass': "center ",
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
                Bus.openEditDialog('新增仓库', 'material/factoryModels/warehouseForm.html', '755px', '400px');
            });
            //头部修改
            $('#btn-edit').unbind('click').click(function () {
                Bus.editCheckedTable('修改仓库', 'material/factoryModels/warehouseForm.html', '755px', '400px','#treeTable');
            });
            //编辑
            $('.btn-edit').unbind('click').click(function () {
                var id = $(this).parents("tr").find('.i-checks').attr('id');
                Bus.openEditDialog('修改仓库', 'material/factoryModels/warehouseForm.html?id=' + id, '755px', '400px');
            });
            //删除
            $('.btn-delete').unbind('click').click(function () {
                var id = $(this).parents("tr").find('.i-checks').attr('id');
                Bus.deleteItem('确定要删除该仓库吗', Api.mtrl + '/api/fm/AreaStock/del', {ids:id});
            });
            //点击重置按钮
            $('#reset-btn').unbind('click').click(function () {
                $('#areaCode').val('');
                $('#areaName').val('');
                $("#wspId option:first").prop("selected", 'selected');
                $("#stockType option:first").prop("selected", 'selected');
                $("#enable option:first").prop("selected", 'selected');
                page.reset(["areaCode", "areaName","wspId","stockType","enable"]);
            });
            $("#btn-search").click(function () {

                pageLoad();
            });
        },
        /**弹出新增、修改页*/
        warehouseForm: function () {
            var id = Mom.getUrlParam('id'),
                api = Mom.getUrlParam('api') || 'form';
            Api.ajaxJson(Api.mtrl+'/api/fm/AreaStock/form/'+id, {}, function (result) {
                if (result.success) {
                    Bus.appendOptionsValue('#wspId',result.workshopList,'id','wspName');
                    Bus.appendOptionsValue('#stockType',result.stockTypeList);
                    if (id) {
                        Validator.renderData(result.areaStock, $('#inputForm'));
                        PageModule.selectRender('#stockType',result.areaStock.stockType.id);
                        $('#areaNo').attr('readonly', 'readonly');
                    }
                } else {
                    Mom.layMsg(result.message);
                }
            });

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
        if ($('#warehouseList').length > 0) {
            PageModule.warehouseListInit()
        }
        else if ($('#warehouseForm').length > 0) {
            PageModule.warehouseForm()
        }

    });

});
