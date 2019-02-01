/**
 * Created by Dora on 2018/9/20.
 */
require(['/js/zlib/app.js'], function (App) {
    //引入用户登录校验
    require(['checkUser']);
    var PageModule = {
        listInit: function () {
            //动态添加Select的option
            //物料类型
            Bus.createSelect(Api.admin + '/api/sys/SysDict/type/MTRL_TYPE', "#mtrlType", 'value', 'label');

            //vcf类型
            Bus.createSelect(Api.admin + "/api/sys/SysDict/type/VCF_TYPE", "#vcfType", 'value', 'label');

            //新增=
            $('#btn-add').on('click', function () {
                Bus.openEditDialog('新增物料', 'material/factoryModels/materialInner.html?id=0', '700px', '420px');
            });
            $('#btn-edit').on('click', function () {
                Bus.editCheckedTable('编辑物料','material/factoryModels/materialInner.html','700px','420px','#treeTable')
            });
            //引入page插件

            require(['Page'], function () {
                window.pageLoad = function () {
                    var data = {
                        mtrlName: $("#mtrlName").val(),
                        mtrlCode: $("#mtrlCode").val(),
                        mtrlType: $("#mtrlType").val(),
                        vcfType: $("#vcfType").val(),
                        enable: $('#enable').val()
                    };
                    var page = new Page();
                    page.init(Api.mtrl +'/api/fm/Mtrl/page', data, true, function (tableData) {
                        renderTableData(tableData);
                        $('.btn-edit').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openEditDialog('编辑物料', 'material/factoryModels/materialInner.html?id=' + id, '700px', '420px');
                        });
                        $('.btn-delete').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.deleteItem('确定要删除该物料吗', Api.mtrl + '/api/fm/Mtrl/delete/', {ids:id});
                        });
                    });


                };
                //搜索
                $("#btn-search").click(function () {
                    pageLoad();
                });
                pageLoad();
            });
            //渲染表格
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
                        {"data": "mtrlNo", 'sClass': " center"},
                        {"data": "mtrlCode", 'sClass': "center "},
                        {"data": "mtrlName", 'sClass': "center"},
                        {"data": "mtrlAlias", 'sClass': "center"},
                        {"data": "parent.mtrlName", 'sClass': "center"},
                        {"data": "vcfTypeLabel", 'sClass': "center"},
                        {"data": "mtrlTypeLabel", 'sClass': "center"},
                        {"data": "pres", 'sClass': "center"},
                        {"data": "dimensionType", 'sClass': "center"},
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
        //物料管理
        formInit: function () {
            var id = Mom.getUrlParam('id');
            var url = Api.mtrl + '/api/fm/Mtrl/form/'+id;

            Api.ajaxJson(url, {}, function (result) {
                if (result.success) {
                    // 物料类型
                    var mtlrTypeList = result.mtrlType;
                    Bus.appendOptionsValue('#mtrlType',mtlrTypeList,'value','label');

                    // 量纲
                    var dimensionTypeList = result.dimensionType;
                    Bus.appendOptionsValue('#dimensionType',dimensionTypeList,'value','label');
                    //上级物料
                    var parentMtrlList = result.parentMtrlList;
                    Bus.appendOptionsValue('#parentMtrlId',parentMtrlList,'id','mtrlName');
                    //VCF类别
                    var vcfTypeList = result.vcfType;
                    Bus.appendOptionsValue('#vcfType',vcfTypeList,'value','label');

                    if(id != '0'){
                        Validator.renderData(result.Mtrl, $('#inputForm'));
                        $("#mtrlNo").attr("readonly","readonly")
                    }
                } else {
                    Mom.layMsg(result.message);
                }
            });
        }
    };
    $(function () {
        //物料列表
        if ($('#materialList').length > 0) {
            PageModule.listInit();
        }

        //物料管理
        else if ($('#materialInner').length > 0) {
            PageModule.formInit();
        }


    });

});