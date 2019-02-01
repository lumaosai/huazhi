require(['/js/zlib/app.js'], function (App) {
    //引入用户登录校验
    require(['checkUser']);

    var PageModule = {
        /**模板列表页*/
        planTempInit: function () {
            var treeId = Mom.getUrlParam("treeId");
            $('#treeId').val(treeId);
            $('#add-btn').click(function () {
                Bus.openEditDialog('新增模板', './inventoryTaking/planTempCheckView.html', '455px', '290px');
            });
            $('#edit-btn').click(function () {
                Bus.editCheckedTable('修改模板', './inventoryTaking/planTempCheckView.html', '455px', '290px', '#listTable');
            });
            $('#del-btn').click(function () {
                Bus.delCheckTable('您确定要删除吗', Api.aps+'/api/stocktake/StocktakeTemplate/delete','#listTable');
            });
            require(['Page'], function () {
                var page = new Page();
                var pageLoad = function () {
                    page.init(Api.aps + "/api/stocktake/StocktakeTemplate/page", {}, true, function(data) {
                        planTempdataout(data);
                        $('.btn-preserve').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openDialog('项目信息维护', './inventoryTaking/planTempPreserve.html?id=' + id, '500px', '600px')
                        });
                    });
                };
                pageLoad();

                //   ajax请求渲染datatable数据
                function planTempdataout(data) {
                    $('#listTable').dataTable({
                        // bFilter: true,   //搜索框
                        "data": data,
                        "columns": [
                            {
                                "data": null, "defaultContent": "", 'sClass': "autoWidth center",
                                "render": function (data, type, row, meta) {
                                    return data = "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                                }
                            },
                            {"data": "name", 'sClass': "alignLeft"},//修改内容居左
                            {"data": "types", 'sClass': "center", "render": function (value, type, row, meta) {
                                    return row.typesLabel+" ["+value+"]";
                                }
                            },//修改内容居左
                            {"data": "createDate", 'sClass': "center"},
                            {
                                "data": null, 'sClass': "center",
                                "render": function (data) {
                                    return data.enable == 0?'未启用':'启用';
                                }
                            },
                            {
                                "data": "null", "orderable": false, "defaultContent": "", 'sClass':'autoWidth center',
                                "render": function (data, type, row, meta) {
                                    return "<a class='btn-maintain btn btn-preserve'><i class='fa icon-project' ></i>项目信息维护</a >"
                                }
                            }]
                    });
                    renderIChecks();
                }

            });
        },

        //新增、修改
        planTempCheckViewInit: function(){
            $('#inputForm').attr('action', Api.aps+"/api/stocktake/StocktakeTemplate/saveTemplate");
            var id = Mom.getUrlParam('id');
            $('#id').val(id);
            if (id) {
                Api.ajaxJson(Api.aps+"/api/stocktake/StocktakeTemplate/form/"+id, {}, function(result) {
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
                Api.ajaxJson(Api.admin+'/api/sys/SysDict/type/PC_TEMPLETE',{},function (result) {
                    if(result.success) {
                        Bus.appendOptionsValue($('#opeCode'),result.rows,'value','label');
                        if(res){
                            $('#opeCode').val(res.template.types);
                        }
                    }else{
                        Mom.layMsg(result.message);
                    }
                });
            }
        },

        //项目信息维护
        planTempPreserveInit: function(){
            var tmpId = Mom.getUrlParam('id'), selResult;
            require(['ztree_my'],function(ZTree){
                var ztree = new ZTree(), treeObj;
                function ztreeLoad(){
                    var apiUrl = Api.aps+'/api/stocktake/StocktakeTemplate/formTemplateDetail/'+tmpId;
                    Api.ajaxJson(apiUrl, {}, function(result){
                        treeObj = ztree.loadData($("#tree"), result.treeArr, false);
                    });
                }
                ztreeLoad();

                $('#btn-add').click(function () {
                    Bus.openEditDialog('添加根指标', './inventoryTaking/planTempPreserveCV.html?id=0&tempId='+tmpId, '620px', '500px', addRootCallback);
                });

                $('#btn-addSon').click(function () {
                    selResult = ztree.getCheckValues(false, false);
                    if(selResult.success){
                        var childrenCodeArr = [];//已添加的子节点
                        var selNode = selResult.nodes[0];
                        $.each(selNode.children,function(i,o){
                            childrenCodeArr.push(o.code);
                        });
                        var options = {
                            width: '450px',
                            height: '550px',
                            defaultVals: {value:childrenCodeArr.join(','), prop:'code'},
                            multiple: true,
                            setting: {
                                check: {
                                    chkboxType: { "Y": "ps", "N": "s" }
                                }
                            }
                        };
                        var apiCfg = {
                            url: Api.aps+'/api/aps/Device/tableTree',
                            data: {}
                        };
                        Bus.openTreeSelect('添加下级指标', apiCfg, options, addSonCallback);
                    }
                });
                //编辑指标
                $('#btn-update').click(function () {
                    var selNode = ztree.getCheckValues();
                    if (selNode.success) {
                        Bus.openEditDialog(selNode.name, './inventoryTaking/planTempPreserveCVEdit.html?id=' + selNode.id, '600px', '440px', saveCallback);
                    }
                });
                //删除指标
                $('#btn-del').click(function () {
                    var selNode = ztree.getCheckValues();
                    if (selNode.success) {
                        Mom.layConfirm('确定要删除该指标吗?',function(layIdx,layero){
                            Api.ajaxForm(Api.aps + '/api/stocktake/StocktakeTemplate/delTempDetail/' + selNode.id, {}, function (result) {
                                if (result.success == true) {
                                    treeObj.removeNode(selNode.nodes[0]);
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

                function addSonCallback(chkResult, layIdx, layero){
                    if(chkResult.success){
                        var codeArr = [];
                        $.each(chkResult.nodes,function(i,o){
                            codeArr.push(o.code);
                        });
                        var data = {
                            "templateId": tmpId,
                            "parentId": selResult.id,
                            "codes": codeArr.join(',')
                        };
                        Api.ajaxForm(Api.aps+"/api/stocktake/StocktakeTemplate/addTempDetail", data, function (result) {
                            if (result.success == true) {
                                Mom.layMsg('保存成功');
                                top.layer.close(layIdx);
                                ztreeLoad();
                            } else {
                                Mom.layAlert(result.message);
                            }
                        });
                        return false;
                    }
                }
            });
        },

        planTempPreserveCVInit: function(){
            var parentId = Mom.getUrlParam('id');
            var tempId = Mom.getUrlParam('tempId');

            function loadData(){
                if (parentId) {
                    var url = Api.aps + "/api/stocktake/StocktakeTemplate/queryDevice";
                    var data = {
                        id: parentId,
                        template: {
                            id: tempId
                        }
                    };
                    Api.ajaxJson(url, JSON.stringify(data), function (result) {
                        if (result.success) {
                            dataout(result.rows);
                        } else {
                            layer.msg(result.message);
                        }
                    });
                }
            }
            function dataout(data){
                $('#treeTable').dataTable({
                    "data": data,
                    "columns": [
                        {
                            "data": null, "width": "50px", "defaultContent": "", "sClass":"center",
                            "render": function (data, type, row, meta) {
                                return "<input type='checkbox' id=" + row.id + " class='i-checks' name='id'>" +
                                    "<input type='text' hidden='hidden' class='parentId'  name='parentId' value='" + parentId + "'>" +
                                    "<input type='text' hidden='hidden' class='code'  name='code' value='" + data.code + "'>" +
                                    "<input type='text' hidden='hidden' class='templateId'  name='templateId' value='" + tempId + "'>"
                            }
                        },
                        {"data": "name", "width": "auto", "sClass":"center"},
                        {
                            "data": "null", "orderable": false, "defaultContent": "", "sClass":"center", width:'145px',
                            "render": function (data, type, row, meta) {
                                return "<span class='updown hide'>"+
                                    "<a class='btn btn-success btn-xs btn-preserve btn-up'><i class='fa fa-edit' ></i>上移</a >" +
                                    "<a class='btn btn-success btn-xs btn-preserve btn-down' ><i class='fa fa-edit' ></i>下移</a >"+
                                    "</span>";
                            }
                        }
                    ]
                });
                renderIChecks();

                $('#tBodyId .i-checks').on('ifChanged', function(event){
                    if($(this).is(':checked')){
                        $(this).closest('tr').find('.updown').removeClass('hide');
                    }else{
                        $(this).closest('tr').find('.updown').addClass('hide');
                    }
                });

                //上移
                $("a.btn-up").click(function () {
                    var that=this, count=0, preTr;
                    var curTr = $(that).closest('tr');
                    $("tbody tr td input.i-checks:checkbox").each(function (i) {
                        var trTmp = $(this).closest('tr');
                        if(true==$(this).is(':checked')){
                            if(preTr==undefined && trTmp.index()<curTr.index()){
                                preTr = $(this).closest('tr');
                            }
                            count++;
                        }
                    });
                    if(preTr == undefined){
                        Mom.layMsg('前面无勾选指标，无法上移');
                        return;
                    }
                    if(count == 0){
                        Mom.layMsg('请至少勾选两条指令');
                        return;
                    }
                    $('tr.active').removeClass('active');
                    curTr.addClass('active');
                    preTr.before(curTr);
                });
                //下移
                $("a.btn-down").click(function () {
                    var that=this, count=0, nextTr;
                    var curTr = $(that).closest('tr');
                    $("tbody tr td input.i-checks:checkbox").each(function (i) {
                        var trTmp = $(this).closest('tr');
                        if(true==$(this).is(':checked')){
                            if(nextTr==undefined && trTmp.index()>curTr.index()){
                                nextTr = $(this).closest('tr');
                            }
                            count++;
                        }
                    });
                    if(nextTr == undefined){
                        Mom.layMsg('后面无勾选指标，无法下移');
                        return;
                    }
                    if(count == 0){
                        Mom.layMsg('请至少勾选两条指令');
                        return;
                    }
                    $('tr.active').removeClass('active');
                    curTr.addClass('active');
                    nextTr.after(curTr);
                });
            }

            loadData();

            window.getFormData = function(){
                var codes = "";
                $("tbody tr td input.i-checks:checkbox").each(function (i) {
                    if (true == $(this).is(':checked')) {
                        codes += "," + $(this).parent().siblings('.code').val();
                    }
                });
                if(codes == '') {
                    Mom.layMsg('请至少勾选一条指令');
                    return;
                }
                var data = {
                    "templateId": tempId,
                    "parentId": parentId,
                    "codes": codes.substr(1)
                };
                return {
                    url: Api.aps+"/api/stocktake/StocktakeTemplate/addTempDetail",
                    data: data
                }
            }
        }

    };

    $(function () {
        //模板列表页
        if ($('#planTemple').length > 0) {
            PageModule.planTempInit();
        }
        //新增、修改
        else if($('#planTempCheckView').length){
            PageModule.planTempCheckViewInit();
        }
        //项目信息维护
        else if ($('#planTempPreserve').length > 0) {
            PageModule.planTempPreserveInit()
        }
        else if ($('#planTempPreserveCV').length > 0) {
            PageModule.planTempPreserveCVInit()
        }

    });
})
;