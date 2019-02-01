require(['/js/zlib/app.js'], function (App) {
    //引入用户登录校验
    require(['checkUser']);

    var PageModule = {
        listInit: function () {
            var winOptons = {
                btnArr: [
                    {btn:'添加下一个', fn: function(layerIdx, layero){
                            var iframeWin = layero.find('iframe')[0].contentWindow;
                            if(!iframeWin.Validator.valid(iframeWin.document.forms[0],1.3)){
                                return false;
                            }
                            var formObj = $('#inputForm',iframeWin.document);
                            var url = formObj.attr('action');
                            var formdata = formObj.serializeJSON();
                            Api.ajaxJson(url,JSON.stringify(formdata),function(result){
                                if(result.success == true){
                                    $('#value, #label', iframeWin.document).val('');
                                    var sortVal = $('#sort', iframeWin.document).val();
                                    $('#sort', iframeWin.document).val(Number(sortVal)+5);
                                    Mom.layMsg('已成功提交');
                                    setTimeout(function(){
                                        //刷新父层
                                        var frameActive = top.TabsNav.getActiveTab().attr("name");
                                        var obj = $('#search-btn', top.window.frames[frameActive].document);
                                        if(obj.length == 0){
                                            obj = $('#refresh-btn', top.window.frames[frameActive].document);
                                        }
                                        obj.trigger('click');
                                    },1000);
                                }else{
                                    Mom.layAlert(result.message);
                                }
                            });
                            return false;
                        }},
                    {btn:'保存并关闭', fn: 'doSubmit'},
                ],
            };

            //新增
            $('#add-btn').on('click', function () {
                Bus.openDialogCfg('新增字典', 'systemSettings/dictionaryInner.html', '675px', '310px', winOptons);
            });
            //引入Page插件
            require(['Page'], function () {
                var page = new Page();
                window.pageLoad = function () {
                    var data = {
                        type: $("#type").val(),
                        descriptionParam: $('#description').val()
                    };
                    //修改默认每页显示条数
                    page.init(Api.admin + "/api/sys/SysDict/page", data, true, function (tableData, result) {
                        renderTableData(tableData);
                        $('.btn-check').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openDialog('查看字典', 'systemSettings/dictionaryInner.html?id=' + id, '675px', '310px');
                        });
                        $('.btn-change').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openEditDialog('修改字典', 'systemSettings/dictionaryInner.html?id=' + id, '675px', '310px');
                        });
                        $('.btn-delete').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.deleteItem('确定要删除该字典吗', Api.admin + '/api/sys/SysDict/delete', {ids:id});
                        });
                        $('.btn-add').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openDialogCfg('添加键值', 'systemSettings/dictionaryInner.html?id=' + id + '&api=addKey', '675px', '310px',winOptons);
                        });
                    });
                    //动态添加Select的option
                    Bus.createSelect(Api.admin + "/api/sys/SysDict/allType", "#type", 'type', 'type');
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
        },

        formInit: function () {
            var id = Mom.getUrlParam('id'),
                api = Mom.getUrlParam('api') || 'form';
            if(id) {
                var url = Api.admin + "/api/sys/SysDict/" + api + "/" + id;
                Api.ajaxJson(url, {}, function (result) {
                    if (result.success) {
                        Validator.renderData(result.SysDict, $('#inputForm'));
                    } else {
                        Mom.layMsg(result.message);
                    }
                    if(result.SysDict.id){
                        $('#value').attr('readonly','readonly');
                    }
                });
                if(api == 'addKey'){
                    $('#type').attr('readonly','readonly');
                }
            }

        },

    };
    $(function () {
        //数据字典列表
        if ($('#dictionary').length > 0) {
            PageModule.listInit();
        }
        else if ($('#dictionaryInner').length > 0) {
            PageModule.formInit();
        }


    });

});