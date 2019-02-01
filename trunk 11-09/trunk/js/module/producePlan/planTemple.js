require(['/js/zlib/app.js'], function (App) {
    var PageModule = {
        /**模板列表页*/

        //模板页初始化
        planTempIndex: function () {
            $('#add-btn').click(function () {
                Bus.openEditDialog('新增模板', './producePlan/planTempCheckView.html', '455px', '300px');
            });
            $('#edit-btn').click(function () {
                Bus.editCheckedTable('修改模板信息', './producePlan/planTempCheckView.html', '455px', '300px', '#treeTable');
            });
            $('#del-btn').click(function () {
                Bus.delCheckTable('您确定要删除吗？', Api.aps+'/api/aps/Template/delete/','#treeTable');
            });
            require(['Page'], function () {
                var page = new Page();
                var pageLoad = function () {
                    page.init(Api.aps + "/api/aps/Template/page", {}, true, function (data) {
                        planTempdataout(data);
                        $('.btn-preserve').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openDialog('项目信息维护', './producePlan/planTempPreserve.html?id=' + id, '500px', '600px');
                        });
                        //配置json文件
                        $(".btn-compile").click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openEditDialog('JSON信息配置', './producePlan/configureJson.html?id=' + id, '800px', '500px');
                        });
                    });

                    // ajax请求渲染datatable数据
                    function planTempdataout(data) {
                        $('#treeTable').dataTable({
                            "data": data,
                            "columns": [
                                {
                                    "data": null, "defaultContent": "", 'sClass': "autoWidth center",
                                    "render": function (data, type, row, meta) {
                                        return "<input type='checkbox' id=" + row.id + " class='i-checks'>";
                                    }
                                },
                                {"data": "name", 'sClass': "alignLeft"},//修改内容居左
                                {"data": "type", 'sClass': "alignLeft"},//修改内容居左
                                {"data": "createDate", 'sClass': "center"},
                                {
                                    "data": null, 'sClass': "center",
                                    "render": function (data) {
                                        return data.enable == 0?'禁用':'启用';
                                    }
                                },
                                {
                                    "data": "id", "orderable": false, "defaultContent": "", 'sClass': "autoWidth center",
                                    "render": function (data, type, row, meta) {
                                        return "<a class='btn-maintain btn btn-preserve'><i class='fa icon-project' ></i>项目信息维护</a >"+
                                            "<a class='btn-json btn btn-compile'><i class='fa fa-edit' ></i>JSON配置</a >";
                                    }
                                }]
                        });
                        renderIChecks();
                    }
                };
                pageLoad();
            });
        },

        /**模板新增、修改*/
        planTempCheckView:function () {
            var id = Mom.getUrlParam('id');
            if (id) {
                /*此处后端接口  id为弹出窗口自带的id 通过浏览器方法传参得到*/
                var url = Api.aps+"/api/aps/Template/form/" + id;
                Api.ajaxJson(url, {}, function (result) {
                    if (result.success) {
                        Validator.renderData(result.template, $('#inputForm'));
                        dsRender(result);
                    } else {
                        Mom.layMsg(result.message);
                    }
                });
            }else{
                dsRender();
            }
            function dsRender(res) {
                Api.ajaxJson(Api.admin+'/api/sys/SysDict/type/SCJH_TEMPLETE',{},function (result) {
                    if(result.success) {
                        Bus.appendOptionsValue($('#opeCode'),result.rows,'value','label');
                        if(res){
                            $('#opeCode').val(res.template.type).trigger('change');
                        }
                    }else{
                        Mom.layMsg(result.message);
                    }
                });
            }
        },

        /**项目信息维护*/
        planTempPreserve: function () {
            var tempId = Mom.getUrlParam('id'), curNode;
            require(['ztree_my'],function(ZTree){
                var ztree = new ZTree(), treeObj;
                function ztreeLoad(){
                    var apiUrl = Api.aps+'/api/aps/Template/formTemplateDetail/'+tempId;
                    Api.ajaxJson(apiUrl, {}, function(result){
                        treeObj = ztree.loadData($("#tree"), result.treeArr, false);
                    });
                }
                ztreeLoad();

                $('#left').click(function(evt){
                    evt = evt|| window.event;   // IE: window.event
                    var selected = evt.target || evt.srcElement;
                    if(selected.tagName != 'SPAN' && selected.tagName != 'A'){
                        treeObj.cancelSelectedNode();
                    }
                });

                $('#btn-add').click(function () {
                    var existCodeArr = [];
                    var nodes = treeObj.getNodes();
                    $.each(nodes,function(i,o){
                        existCodeArr.push(o.code);
                    });
                    Bus.openEditDialog('添加根指标', './producePlan/planTempPreserveCV.html?oper=add&id=0&tempId='+tempId+'&existCodes='+existCodeArr.join(','), '620px', '500px', addRootCallback);
                });

                $('#btn-addSon').click(function () {

                });
                //指标排序
                $('#btn-update').click(function () {
                    var id='', selResult = ztree.getCheckValues();
                    if (selResult.success) {
                        curNode = selResult.nodes[0];
                        id = selResult.id;
                    }
                    Bus.openEditDialog(selResult.name+" 调整顺序", './producePlan/planTempPreserveCV.html?oper=edit&tempId='+tempId+'&id='+id, '620px', '500px', saveCallback);
                });
                //删除指标
                $('#btn-del').click(function () {
                    var selResult = ztree.getCheckValues();
                    if (selResult.success) {
                        curNode = selResult.nodes[0];
                        Mom.layConfirm('确定要删除该指标吗?<br>如果有下级指标将也被删除.',function(layIdx,layero){
                            Api.ajaxForm(Api.aps + '/api/aps/Template/delTempDetail/' + selResult.id, {}, function (result) {
                                if (result.success == true) {
                                    Mom.layMsg('删除成功');
                                    treeObj.removeNode(curNode);
                                    top.layer.close(layIdx);
                                }else{
                                    Mom.layAlert(result.message);
                                }
                            });
                        });
                    }
                });

                function saveCallback(layIdx, layero){
                    var iframeWin = layero.find('iframe')[0].contentWindow;
                    var formData = iframeWin.getFormData();
                    if(formData){
                        var data = formData.data;
                        Api.ajaxForm(formData.url, data, function (result) {
                            if (result.success == true) {
                                Mom.layMsg('保存成功');
                                ztreeLoad();
                                top.layer.close(layIdx);
                            }else {
                                Mom.layMsg(result.message);
                            }
                        });
                    }
                    return false;
                }

                function addRootCallback(layIdx, layero){
                    var iframeWin = layero.find('iframe')[0].contentWindow;
                    var formData = iframeWin.getFormData();
                    if(formData){
                        var data = formData.data;
                        Api.ajaxForm(formData.url, data, function (result) {
                            if (result.success == true) {
                                Mom.layMsg('保存成功');
                                ztreeLoad();
                                top.layer.close(layIdx);
                            }else {
                                Mom.layMsg(result.message);
                            }
                        });
                    }
                    return false;
                }

            });
        },

        /**维护信息内页*/
        planTempPreserveCV: function () {
            $('#inputForm').attr('action', Api.aps + '/api/aps/Template/addTempDetail');
            var id = Mom.getUrlParam('id');
            var tempId = Mom.getUrlParam('tempId');
            $('#id').val(id);
            if (id) {
                /*此处后端接口  id为弹出窗口自带的id 通过浏览器方法传参得到*/
                var url = Api.aps + "/api/aps/Template/selectDict";
                var data = {
                    id: id,
                    template: {
                        id: tempId
                    }
                };
                Api.ajaxJson(url, JSON.stringify(data), function (result) {
                    if (result.success) {
                        dataout(result.rows);
                    } else {
                        Mom.layMsg(result.message);
                    }
                });
            }
            function dataout(data) {
                var tempId = Mom.getUrlParam('tempId');
                var parentId = Mom.getUrlParam('id');
                $('#treeTable').dataTable({
                    "data": data,
                    "columns": [
                        {
                            "data": null, "defaultContent": "", 'sClass': "autoWidth center",
                            "render": function (data, type, row, meta) {
                                return data = "<input type='checkbox' id=" + row.id + " class='i-checks' name='id'>" +
                                    "<input type='text' hidden='hidden' class='parentId'  name='parentId' value='" + parentId + "'>" +
                                    "<input type='text' hidden='hidden' class='itemCode'  name='itemCode' value='" + data.itemCode + "'>" +
                                    "<input type='text' hidden='hidden' class='templateId'  name='templateId' value='" + tempId + "'>"
                            }
                        },
                        {"data": "itemName", "width": "auto"},
                        {
                            "data": "id", "orderable": false, "defaultContent": "",
                            "render": function (data, type, row, meta) {
                                return data =
                                    "<a class='btn btn-success btn-xs btn-preserve btn-up'><i class='fa fa-edit' ></i>上移</a >" +
                                    "<a class='btn btn-success btn-xs btn-preserve btn-down' ><i class='fa fa-edit' ></i>下移</a >"
                            }
                        }]
                });
                renderIChecks(); // checkbox
                $('tbody tr').attr('class', 'center');
                //上移下移
                $("a.btn-up").each(function () {
                    $(this).click(function () {
                        var $tr = $(this).parents("tr");
                        if ($tr.index() != 0) {
                            $tr.prev().before($tr);
                        }
                    });
                });
                var trLength = $("a.btn-down").length;
                $("a.btn-down").each(function () {
                    $(this).click(function () {
                        var $tr = $(this).parents("tr");
                        if ($tr.index() != trLength - 1) {
                            $tr.next().after($tr);
                        }
                    });
                });
            }
            //    点击递交
            window.clicksubmit = function (iframeWin, body, index) {
                var templateId = "", parentId = "", itemCodes = "";
                var url = Api.aps + "/api/aps/Template/addTempDetail";
                $("tbody tr td input.i-checks:checkbox").each(function (i) {
                    if (true == $(this).is(':checked')) {
                        parentId = $(this).parent().siblings('.parentId').val();
                        itemCodes += "," + $(this).parent().siblings('.itemCode').val();
                        templateId = $(this).parent().siblings('.templateId').val();
                    }
                });
                var data = {
                    "templateId": templateId,
                    "parentId": parentId,
                    "itemCodes": itemCodes.substr(1)
                };
                if (itemCodes == '') {
                    layer.alert('请勾选指令后再进行保存')
                } else {
                    Api.ajaxForm(url, data, function (result) {
                        if (result.success == true) {
                            top.layer.msg('保存成功');
                            top.layer.close(index);
                        } else {
                            top.layer.msg(result.message);
                            top.layer.close(index);
                        }
                    });
                }
            }
        },

    };

    $(function () {
        if ($('#planTempIndex').length > 0) {
            PageModule.planTempIndex()
        }
        else if ($('#planTempCheckView').length>0){
            PageModule.planTempCheckView()
        }
        else if ($('#planTempPreserve').length > 0) {
            PageModule.planTempPreserve()
        }
        else if ($('#planTempPreserveCV').length > 0) {
            PageModule.planTempPreserveCV()
        }
    });
})
;