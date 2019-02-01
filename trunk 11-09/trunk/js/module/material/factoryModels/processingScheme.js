/**
 * Created by Dora on 2018/9/20.
 */
require(['/js/zlib/app.js'], function (App) {
    //引入用户登录校验
    require(['checkUser']);
    var PageModule = {
        listInit: function () {
            //动态添加Select的option
            //装置
            Bus.createSelect(Api.mtrl + '/api/fm/Unit/unitList', "#unitId", 'id', 'unitAlias');
            //新增=
            $('#btn-add').on('click', function () {
                Bus.openEditDialog('新增加工方案', 'material/factoryModels/processingSchemeInner.html?id=0', '860px', '319px');
            });
            $('#btn-edit').on('click', function () {
                Bus.editCheckedTable('编辑加工方案','material/factoryModels/processingSchemeInner.html','860px','319px','#treeTable')
            });
            //引入page插件
            require(['Page'], function () {
                var page = new Page();
                window.pageLoad = function () {
                    var data = {
                        unitId: $("#unitId").val(),
                        caseName: $("#caseName").val(),
                        enable: $('#enable').val()
                    };
                    page.init(Api.mtrl +'/api/fm/ProCase/page', data, true, function (tableData) {
                        renderTableData(tableData);
                        $('.btn-edit').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openEditDialog('编辑加工方案', 'material/factoryModels/processingSchemeInner.html?id=' + id, '860px', '319px');
                        });
                        $('.btn-delete').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.deleteItem('确定要删除该加工方案吗', Api.mtrl + '/api/fm/ProCase/delete', {ids:id});
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
                        {"data": "caseNo", 'sClass': " center"},
                        {"data": "caseName", 'sClass': "center"},
                        {"data": "caseAlias", 'sClass': "center"},
                        {"data": "unit.unitAlias", 'sClass': "center"},
                        {"data": "isDft", 'sClass': "center",
                            "render": function (data, type, row, meta) {
                                return "<i class='fa gray-check-"+row.isDft+"'></i>";
                            }
                        },
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
            var url = Api.mtrl + '/api/fm/ProCase/form/'+ id;
            Api.ajaxJson(url,{},function(result){

                if (result.success) {
                    // 装置
                    var unitList = result.unitList;
                    Bus.appendOptionsValue('#unitId',unitList,'id','unitName');
                    if(id != '0'){
                        Validator.renderData(result.row, $('#inputForm'));
                        $("#caseNo").attr("readonly","readonly")
                    }
                } else {
                    Mom.layMsg(result.message);
                }
            });
        }
    };
    $(function () {
        //加工方案列表
        if ($('#processingSchemeList').length > 0) {
            PageModule.listInit();
        }

        //加工方案管理修
        else if ($('#processingSchemeInner').length > 0) {
            PageModule.formInit();
        }


    });

});