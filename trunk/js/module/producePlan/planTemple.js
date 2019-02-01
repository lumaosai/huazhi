require([cdnDomain+'/js/zlib/app.js'], function (App) {
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
                Bus.delCheckTable('您确定要删除吗？', Const.aps+'/api/aps/Template/delete/','#treeTable');
            });
            require(['Page'], function () {
                var page = new Page();
                var pageLoad = function () {
                    page.init(Const.aps + "/api/aps/Template/page", {}, true, function (data) {
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
                var url = Const.aps+"/api/aps/Template/form/" + id;
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
                Api.ajaxJson(Const.admin+'/api/sys/SysDict/type/SCJH_TEMPLETE',{},function (result) {
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
                    var apiUrl = Const.aps+'/api/aps/Template/formTemplateDetail/'+tempId;
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
                    var selResult1 = ztree.getCheckValues(false, false);
                    if(selResult1.success){
                        var id='', selResult = ztree.getCheckValues();
                        if (selResult.success) {
                            curNode = selResult.nodes[0];
                            id = selResult.id;
                        }
                        Bus.openEditDialog(selResult.name+"添加下级指标", './producePlan/planTempPreserveCVEdit.html?oper=add&tempId='+tempId+'&id='+id, '620px', '500px', saveSonCallback);
                    }

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
                            Api.ajaxForm(Const.aps + '/api/aps/Template/delTempDetail/' + selResult.id, {}, function (result) {
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

                function saveSonCallback(layIdx, layero){
                    var iframeWin = layero.find('iframe')[0].contentWindow;
                    var formData = iframeWin.getSubmit();
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

            var parentId = Mom.getUrlParam('id')||'0';
            var tempId = Mom.getUrlParam('tempId');
            var existCodes = Mom.getUrlParam('existCodes');
            var oper = Mom.getUrlParam('oper');
            loadData();
            function loadData(){
                if (tempId) {
                    var url, data;
                    if(oper != 'edit') {
                        url = Const.aps + "/api/aps/Template/selectDict";
                        data = {
                            id: parentId,
                            template: {id: tempId}
                        };
                        Api.ajaxJson(url, JSON.stringify(data), function (result) {
                            if (result.success) {
                                dataout(result.rows);
                            } else {
                                layer.msg(result.message);
                            }
                        });

                    }else{
                        if(parentId == 0 ){
                            url = Const.aps + "/api/aps/Template/editTitle/"+ tempId ;
                            data = {};
                            Api.ajaxJson(url, JSON.stringify(data), function (result) {
                                if (result.success) {
                                    dataout(result.list);
                                } else {
                                    layer.msg(result.message);
                                }
                            });
                        }else{
                            url = Const.aps + "/api/aps/Template/edit/"+ parentId ;
                            data = {};
                            Api.ajaxJson(url, JSON.stringify(data), function (result) {
                                if (result.success) {
                                    dataout(result.list);
                                } else {
                                    layer.msg(result.message);
                                }
                            });
                        }
                    }
                }
            }
            function dataout(data) {
                $('#treeTable').dataTable({
                    "data": data,
                    "columns": [
                        {
                            "data": null, "width": "50px", "defaultContent": "", "sClass": "center",
                            "render": function (data, type, row, meta) {
                                return "<input type='checkbox' id=" + row.id + " class='i-checks' name='id' " + (oper == 'edit' ? 'checked disabled' : '') + ">" +
                                    "<input type='text' hidden='hidden' class='code' name='code' value='" + row.itemCode + "'>" +
                                    "<input type='text' hidden='hidden' class='id' name='id' value='" + row.id + "'>"
                            }
                        },
                        {"data": "itemName", "width": "auto", "sClass": "center"},
                        {
                            "data": "null",
                            "orderable": false,
                            "defaultContent": "",
                            "sClass": "center",
                            width: '145px',
                            "render": function (data, type, row, meta) {
                                return "<span class='updown " + (oper != 'edit' ? 'hide' : '') + "'>" +
                                    "<a class='btn btn-success btn-xs btn-preserve btn-up'><i class='fa fa-edit' ></i>上移</a >" +
                                    "<a class='btn btn-success btn-xs btn-preserve btn-down' ><i class='fa fa-edit' ></i>下移</a >" +
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

                window.getFormData = function(){
                    if(oper == 'edit'){
                        var idArr=[];
                        $("tbody tr td input.i-checks:checkbox").each(function (i) {
                            idArr.push($(this).parent().siblings('.id').val());
                        });
                        return {
                            url: Const.aps +"/api/aps/Template/saveTempDetail",
                            data: {
                                "id": idArr.join(',')
                            }
                        }
                    }
                    var nodes=[];
                    $("tbody tr td input.i-checks:checkbox").each(function (i) {
                        if (true == $(this).is(':checked')) {
                            nodes.push($(this).parent().siblings('.code').val());
                        }
                    });
                    if(nodes.length == 0) {
                        Mom.layMsg('请至少勾选一条指令');
                        return;
                    }
                    return {
                        url: Const.aps + "/api/aps/Template/addTempDetail",
                        data: {
                            "templateId": tempId,
                            "parentId": parentId,
                            "itemCodes": nodes.join(',')
                        }
                    }
                }
            };
        },
        planTempPreserveCVE:function(){
            var parentId = Mom.getUrlParam('id');
            var tempId = Mom.getUrlParam('tempId');
            var oper = Mom.getUrlParam('oper');
            var data = {
                id: parentId,
                template: {id: tempId}
            };
            Api.ajaxJson(Const.aps + "/api/aps/Template/selectDict", JSON.stringify(data), function (result) {
                if (result.success) {
                    renderData(result.rows);
                } else {
                    layer.msg(result.message);
                }
            });
            function renderData(data) {
                $('#treeTable').dataTable({
                    "data": data,
                    "columns": [
                        {
                            "data": null, "width": "50px", "defaultContent": "", "sClass": "center",
                            "render": function (data, type, row, meta) {
                                return "<input type='checkbox' id=" + row.id + " class='i-checks' name='id' " + (oper == 'edit' ? 'checked disabled' : '') + ">" +
                                    "<input type='text' hidden='hidden' class='code' name='code' value='" + row.itemCode + "'>" +
                                    "<input type='text' hidden='hidden' class='id' name='id' value='" + row.id + "'>"
                            }
                        },
                        {"data": "itemName", "width": "auto", "sClass": "center"},
                        {
                            "data": "null",
                            "orderable": false,
                            "defaultContent": "",
                            "sClass": "center",
                            width: '145px',
                            "render": function (data, type, row, meta) {
                                return "<span class='updown " + (oper != 'edit' ? 'hide' : '') + "'>" +
                                    "<a class='btn btn-success btn-xs btn-preserve btn-up'><i class='fa fa-edit' ></i>上移</a >" +
                                    "<a class='btn btn-success btn-xs btn-preserve btn-down' ><i class='fa fa-edit' ></i>下移</a >" +
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
            };

            window.getSubmit = function(){
                var nodes=[];
                $("tbody tr td input.i-checks:checkbox").each(function (i) {
                    if (true == $(this).is(':checked')) {
                        nodes.push($(this).parent().siblings('.code').val());
                    }
                });
                if(nodes.length == 0) {
                    Mom.layMsg('请至少勾选一条指令');
                    return;
                }
                return {
                    url: Const.aps + "/api/aps/Template/addTempDetail",
                    data: {
                        "templateId": tempId,
                        "parentId": parentId,
                        "itemCodes": nodes.join(',')
                    }
                }
            }
        },
        /** json配置 **/
        confinJsonInit:function () {
            var id = Mom.getUrlParam("id");
            $("#id").val(Mom.getUrlParam('id'));
            Api.ajaxJson(Const.aps+"/api/aps/Template/form/"+id,{},function (result) {
                $("#textcontent").val(result.template.jsonCfg);
            });
            /*得到传后台的表单*/
            function getSubmitFormId(){
                return "#inputForm";
            }
        }

    };

    $(function () {
        if ($('#planTempIndex').length > 0) {
            PageModule.planTempIndex();
        }
        else if ($('#planTempCheckView').length>0){
            PageModule.planTempCheckView();
        }
        else if ($('#planTempPreserve').length > 0) {
            PageModule.planTempPreserve();
        }
        else if ($('#planTempPreserveCV').length > 0) {
            PageModule.planTempPreserveCV();
        }
        else if($("#planTempPreserveCVE").length>0){
            PageModule.planTempPreserveCVE();
        }
        else if($("#configureJson").length>0){
            PageModule.confinJsonInit();
        }
    });
})
;