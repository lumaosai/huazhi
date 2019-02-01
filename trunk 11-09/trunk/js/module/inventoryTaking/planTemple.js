require(['/js/zlib/app.js'], function (App) {
    //引入用户登录校验
    require(['checkUser']);

    var PageModule = {
        /**模板列表页*/
        planTempInit: function () {
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
            var id = Mom.getUrlParam('id');
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
            var tempId = Mom.getUrlParam('id'), curNode;
            require(['ztree_my'],function(ZTree){
                var ztree = new ZTree(), treeObj;
                function ztreeLoad(){
                    var apiUrl = Api.aps+'/api/stocktake/StocktakeTemplate/formTemplateDetail/'+tempId;
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
                    Bus.openEditDialog('添加根指标', './inventoryTaking/planTempPreserveCV.html?oper=add&id=0&tempId='+tempId+'&existCodes='+existCodeArr.join(','), '620px', '500px', addRootCallback);
                });

                $('#btn-addSon').click(function () {
                    var selResult = ztree.getCheckValues(false, false);
                    if(selResult.success){
                        var childrenCodeArr = [];//已添加的子节点
                        curNode = selResult.nodes[0];
                        $.each(curNode.children,function(i,o){
                            childrenCodeArr.push(o.code);
                        });
                        var options = {
                            width: '450px',
                            height: '550px',
                            multiple: true,
                            defaultVals: {value:childrenCodeArr.join(','), prop:'code'},
                            setting: {
                                check: {
                                    chkboxType: { "Y": "s", "N": "" }
                                }
                            }
                        };
                        var apiCfg = {
                            url: Api.aps+'/api/aps/Device/tableTree',
                            data: {
                                whereClause: "types<>'column'"
                            },
                            contentType: 'Json'
                        };
                        Bus.openTreeSelect(selResult.name+' 添加下级指标', apiCfg, options, addSonCallback);
                    }
                });
                //指标排序
                $('#btn-update').click(function () {
                    var id='', selResult = ztree.getCheckValues();
                    if (selResult.success) {
                        curNode = selResult.nodes[0];
                        id = selResult.id;
                    }
                    Bus.openEditDialog(selResult.name+" 调整顺序", './inventoryTaking/planTempPreserveCV.html?oper=edit&tempId='+tempId+'&id='+id, '620px', '500px', saveCallback);
                });
                //删除指标
                $('#btn-del').click(function () {
                    var selResult = ztree.getCheckValues();
                    if (selResult.success) {
                        curNode = selResult.nodes[0];
                        Mom.layConfirm('确定要删除该指标吗?<br>如果有下级指标将也被删除.',function(layIdx,layero){
                            Api.ajaxForm(Api.aps + '/api/stocktake/StocktakeTemplate/delTempDetail/' + selResult.id, {}, function (result) {
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

                function addSonCallback(chkResult, layIdx, layero){
                    if(chkResult.success){
                        var codeArr=[];
                        $.each(chkResult.nodes,function(i,o){
                            var parentNode = o.getParentNode();
                            var pId = (parentNode&&parentNode.checked)?o.pId:curNode.id;//判断父是否选中
                            codeArr.push({code:o.code, level:o.level, idTmp:o.id, 'pId':pId});
                        });
                        var data = {
                            "templateId": tempId,
                            "detailListStr": JSON.stringify(codeArr)
                        };
                        Api.ajaxForm(Api.aps+"/api/stocktake/StocktakeTemplate/addTempDetail", data, function (result) {
                            if (result.success == true) {
                                Mom.layMsg('保存成功');
                                ztreeLoad();
                                top.layer.close(layIdx);
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
            var parentId = Mom.getUrlParam('id')||'0';
            var tempId = Mom.getUrlParam('tempId');
            var existCodes = Mom.getUrlParam('existCodes');
            var oper = Mom.getUrlParam('oper');

            function loadData(){
                if (tempId) {
                    var url, data;
                    if(oper == 'edit'){
                        url = Api.aps + "/api/stocktake/StocktakeTemplate/queryDevice";
                        data = {
                            pId: parentId,
                            stocktakeTemplate: { id: tempId }
                        };
                    }else{
                        url = Api.aps + "/api/aps/Device/queryRootlist";    //选择根指标
                        data = {
                            whereClause: "types<>'column' and code not in('"+existCodes.split(',').join("','")+"')"
                        }
                    }
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
                                return "<input type='checkbox' id=" + row.id + " class='i-checks' name='id' "+(oper=='edit'?'checked disabled':'')+">" +
                                    "<input type='text' hidden='hidden' class='code' name='code' value='" + row.code + "'>" +
                                    "<input type='text' hidden='hidden' class='id' name='id' value='" + row.id + "'>"
                            }
                        },
                        {"data": "name", "width": "auto", "sClass":"center"},
                        {
                            "data": "null", "orderable": false, "defaultContent": "", "sClass":"center", width:'145px',
                            "render": function (data, type, row, meta) {
                                return "<span class='updown "+(oper!='edit'?'hide':'')+"'>"+
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
                            count++;
                            if(trTmp.index()<curTr.index()){
                                preTr = $(this).closest('tr');
                            }
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
                if(oper == 'edit'){
                    var idArr=[];
                    $("tbody tr td input.i-checks:checkbox").each(function (i) {
                        idArr.push($(this).parent().siblings('.id').val());
                    });
                    return {
                        url: Api.aps +"/api/stocktake/StocktakeTemplate/saveTempDetail",
                        data: {
                            "id": idArr.join(',')
                        }
                    }
                }
                var nodes=[], codeArr=[];
                $("tbody tr td input.i-checks:checkbox").each(function (i) {
                    if (true == $(this).is(':checked')) {
                        nodes.push($(this).parent().siblings('.code').val());
                    }
                });
                if(nodes.length == 0) {
                    Mom.layMsg('请至少勾选一条指令');
                    return;
                }
                $.each(nodes,function(i,o){
                    codeArr.push({code:o, level:0, idTmp:'', 'pId':'0'});
                });
                return {
                    url: Api.aps+"/api/stocktake/StocktakeTemplate/addTempDetail",
                    data: {
                        "templateId": tempId,
                        "detailListStr": JSON.stringify(codeArr)
                    }
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