require(['/js/zlib/app.js'], function (App) {
    var PageModule = {
        listInit: function () {
            //引入Page插件
            require(['Page'], function () {
                var page = new Page();
                window.pageLoad = function () {
                    var data = {
                        type: $("#type").val(),
                        descriptionParam: $('#description').val()
                    };
                    //修改默认每页显示条数
                    page.init(Const.admin + "/api/sys/SysDict/page", data, true, function (tableData, result) {
                        //  引入mock.js
                        require(['mock'],function(Mock){
                            // 调用生成数据
                            var data = Mock.mock({
                                'message':'操作成功',
                                'retCode':"10000",
                                'success':true,
                                'page':{
                                    'count':619,
                                    'endRowNum':19,
                                    'isFirstPage':true,
                                    'isLastPage':false,
                                    'orderBy':'type,sort',
                                    'pageCount':31,
                                    'pageNo':1,
                                    'pageSize':20
                                },
                                'rows|1-10':[{
                                   'createBy':'',
                                    'createDate':'2018-05-18 20:50:27',
                                    'delBy':'',
                                    'delFlag':'',
                                    'description':'原因',
                                    'enable':'',
                                    'id|+1':1,
                                    'label':'原料、溶出工序指标问题',
                                    'parentId':'',
                                    'remark':'',
                                    'sort|+1':1,
                                    'type':'accidentCauseType',
                                    'updateBy':'',
                                    'updateDate':'2018-05-24 09:11:42',
                                    'value':'ylrcgxzbwt',
                                    'date':'@datetime'//随机生成时间
                                }]
                            })
                           console.log(data);
                            //利用模板渲染
                            require(['artTemplate'],function(template){
                                var html = template('template', data);
                                $('#datainner').html(html);
                                renderIChecks();
                                //$('.btn-check').click(function () {
                                //    var id = $(this).parents("tr").find('.i-checks').attr('id');
                                //    alert(id);
                                //    Bus.openDialog('查看字典', 'systemSettings/dictionaryInner.html?id=' + id, '675px', '310px');
                                //});
                                //$('.btn-change').click(function () {
                                //    var id = $(this).parents("tr").find('.i-checks').attr('id');
                                //    Bus.openEditDialog('修改字典', 'systemSettings/dictionaryInner.html?id=' + id, '675px', '310px');
                                //});
                                //$('.btn-delete').click(function () {
                                //    var id = $(this).parents("tr").find('.i-checks').attr('id');
                                //    Bus.deleteItem('确定要删除该字典吗', Const.admin + '/api/sys/SysDict/delete', {ids:id});
                                //});
                                //$('.btn-add').click(function () {
                                //    var id = $(this).parents("tr").find('.i-checks').attr('id');
                                //    Bus.openDialogCfg('添加键值', 'systemSettings/dictionaryInner.html?id=' + id + '&api=addKey', '675px', '310px',winOptons);
                                //});
                            });
                            //renderTableData(data.rows);
                        });

                    });
                    //动态添加Select的option
                    Bus.createSelect(Const.admin + "/api/sys/SysDict/allType", "#type", 'type', 'type');
                };
                //点击重置按钮
                $('#reset-btn').click(function () {
                    // $("#type option:first").prop("selected", 'selected');
                    // $("#description").val("");
                    // page.reset(["type", "descriptionParam"]);

                    Mom.clearForm($('.toolbar-form'));
                    pageLoad();
                });
                $("#search-btn").click(function () {
                    pageLoad();
                });
                pageLoad();
            });

            function renderTableData(tableData) {
                $('#treeTable').dataTable({
                    "bSort": true,
                    "aoColumnDefs": [
                        {"bSortable": false, "aTargets": [ 2, 4, 6]}
                    ],
                    "data": tableData,
                    "aoColumns": [
                        {
                            "data": null, "defaultContent": "", 'sClass': "autoWidth center", "bSortable":false,
                            "render": function (data, type, row, meta) {
                                return data = "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                            }
                        },
                        {"data": "value", 'sClass': " center", "width": "12%"},
                        {"data": "label", 'sClass': "center ", "width": "12%"},
                        {"data": "type", 'sClass': "center", "width": "12%"},
                        {"data": "description", 'sClass': "center"},
                        {"data": "sort", 'sClass': "center", "width": '8%'},
                        {
                            "data": "id", "orderable": false, "defaultContent": "", 'sClass': " center autoWidth",
                            "render": function (data, type, row, meta) {
                                return "<a class='btn btn-info btn-xs btn-check' ><i class='fa fa-search-plus'></i>查看</a >" +
                                    "<a class='btn btn-success btn-xs btn-change' ><i class='fa icon-change'></i>修改</a >" +
                                    "<a class='btn btn-danger btn-xs btn-delete' ><i class='fa fa-trash-o' ></i>删除</a >" +
                                    "<a class='btn btn-primary btn-xs btn-add'><i class='fa fa-plus'></i>添加键值</a >";
                            }
                        }]
                });
                renderIChecks();
            }
        }



    };
    $(function () {
        //数据字典列表
        if ($('#mockDictionary').length > 0) {
            PageModule.listInit();
        }


    });

});