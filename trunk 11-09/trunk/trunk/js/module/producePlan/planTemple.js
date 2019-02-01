require(['/js/zlib/app.js'], function (App) {
    var PageModule = {
            /**模板列表页*/

            //模板页初始化
            planTempInit: function () {
                require(['Page'], function () {
                    var pageLoad = function () {
                        new Page().init(Api.aps + "/api/aps/Template/page", {}, true, function (data) {
                                planTempdataout(data);
                                $('.btn-preserve').click(function () {
                                    var id = $(this).parents("tr").find('.i-checks').attr('id');
                                    Bus.openDialog('项目信息维护', './producePlan/planTempPreserve.html?id=' + id, '500px', '600px')
                                });
                                //配置json文件
                                $(".btn-compile").click(function () {
                                    var id = $(this).parents("tr").find('.i-checks').attr('id');
                                    Bus.openEditDialog('JSON信息配置', './producePlan/configureJson.html?id=' + id, '800px', '500px')
                                })
                                $('#add-btn').click(function () {
                                    Bus.openEditDialog('新增模板', './producePlan/planTempCheckView.html', '800px', '300px')
                                });
                                $('#edit-btn').click(function () {
                                    Bus.editCheckedTable('修改模板信息', './producePlan/planTempCheckView.html', '800px', '300px', '#treeTable')
                                });
                                $('#del-btn').click(function () {
                                    Bus.delCheckTable('内置模板不允许删除，您确定要删除吗？', Api.aps+'/api/aps/Template/delete/','#treeTable')
                                });
                            });
                    };
                    // ajax请求渲染datatable数据
                    var planTempdataout = function (data) {
                        $('#treeTable').dataTable({
                            "data": data,
                            "columns": [
                                {
                                    "data": null, "defaultContent": "", 'sClass': "autoWidth center",
                                    "render": function (data, type, row, meta) {
                                        return data = "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                                    }
                                },
                                {"data": "name", 'sClass': "alignLeft"},//修改内容居左
                                {"data": "type", 'sClass': "alignLeft"},//修改内容居左
                                {"data": "createDate", 'sClass': "center"},
                                {
                                    "data": null, 'sClass': "center",
                                    "render": function (data) {
                                        if (data.enable == 0) {
                                            return data = '未启用'
                                        } else {
                                            return data = '启用'
                                        }
                                    }
                                },
                                {
                                    "data": "id", "orderable": false, "defaultContent": "",
                                    "render": function (data, type, row, meta) {
                                        return data =
                                            "<a class='btn-maintain btn btn-preserve'><i class='fa icon-project' ></i>项目信息维护</a >"+
                                            "<a class='btn-json btn btn-compile'><i class='fa fa-edit' ></i>JSON配置</a >"
                                    }
                                }]
                        });
                        $('tbody tr').attr('class', 'center');
                        renderIChecks()
                    }

                    pageLoad();
                });
                var treeId = Mom.getUrlParam("treeId");
                $('#treeId').val(treeId);
            },

            /**模板查看页*/
            //模板查看初始化
            planTempInitCV: function () {
                var id = Mom.getUrlParam('id');
                $('#id').val(id);
                if (id) {
                    /*此处后端接口  id为弹出窗口自带的id 通过浏览器方法传参得到*/
                    var url = Api.aps + "/api/aps/Template/form/" + id;
                    Api.ajaxJson(url, {}, function (result) {
                        if (result.success) {
                            Validator.renderData(result.template, $('#inputForm'));
                            PageModule.dsRender(result);
                        } else {
                            Mom.layMsg(result.message);
                        }
                    });
                } else {
                    PageModule.dsRender();
                }
            },
            //渲染select
            dsRender: function (res) {
                Api.ajaxJson(Api.admin + '/api/sys/SysDict/type/SCJH_TEMPLETE', {}, function (result) {
                    if (result.success) {
                        Bus.appendOptionsValue($('#opeCode'), result.rows, 'value', 'value');
                        $('#opeCode').select2().val(res.template.type).trigger('change');
                    } else {
                        Mom.layAlert(result.message);
                    }
                });
            },
            /**模板新增*/
            planTempupdata:function () {
                $('#inputForm').attr('action', Api.aps+"/api/aps/Template/saveTemplate");
                var id = Mom.getUrlParam('id');
                $('#id').val(id);
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
                            Bus.appendOptionsValue($('#opeCode'),result.rows,'value','value');
                            if(res!==undefined){
                                $('#opeCode').select2().val(res.template.type).trigger('change');
                            }
                        }else{
                            Mom.layMsg(result.message);
                        }
                    });
                }
                /*清除头像*/
                function getSubmitFormId(){
                    return "#inputForm";
                }
            },

            /**项目信息维护*/
            planTempPInit: function () {
                /*
                修改中发现此两行代码没用，暂时注释掉,如发现没影响其他功能可删掉
                author:王茂宁
                date:20180913
                page = 'orgInner.html';
                $('#officeContent').attr('src', './orgInner.html');*/
                var id = Mom.getUrlParam('id');
                Api.ajaxJson(Api.aps + '/api/aps/Template/formTemplateDetail/' + id, 'json', PageModule.zTree);
            },
            zTree: function (da) {
                var data = da.treeArr;
                var zTreeObj;
                // zTree 的参数配置，深入使用请参考 API 文档（setting 配置详解）
                var setting = {
                    data: {
                        simpleData: {
                            enable: true,   //设置是否使用简单数据模式(Array)
                            idKey: "id",    //设置节点唯一标识属性名称
                            pIdKey: "pId"      //设置父节点唯一标识属性名称
                        },
                        key: {
                            name: "name",//zTree 节点数据保存节点名称的属性名称
                            title: "name"//zTree 节点数据保存节点提示信息的属性名称
                        }
                    },
                    callback: {
                        onClick: function (e, treeId, node) {
                            if (node.id) {
                                rendersun(node.id, node.name)
                            }
                        }
                    }

                };
                // zTree 的数据属性，深入使用请参考 API 文档（zTreeNode 节点数据详解）
                var zNodes = data;
                //执行ztree
                require(['/js/plugins/ztree/js/jquery.ztree.core.js'], function () {
                    var treeObj = $.fn.zTree.init($("#tree"), setting, zNodes);
                });
                str = "";
                parentName = "";
                function rendersun(data, nodename) {
                    str = data;
                    parentName = nodename;
                }

                var tempId = Mom.getUrlParam('id');
                //阻止事件冒泡
                $(".btn").unbind("click").on("click",function (event) {
                    event.stopPropagation();
                });
                $("#left #tree").unbind("click").on("click",function (event) {
                    event.stopPropagation();
                });
                //点击执行取消选中
                $(".wrapper").unbind("click").on("click",function () {
                    var treeObj = $.fn.zTree.getZTreeObj("tree");
                    treeObj.cancelSelectedNode();
                    str = "";
                });
                $('#btn-add').click(function () {
                    EditDialogTemp('添加根指标', './producePlan/planTempPreserveCV.html?id=0&tempId=' + tempId, '800px', '700px');
                });
                $('#btn-addSon').click(function () {
                    if (str === '') {
                        Mom.layMsg('请单选父级指标后再试');
                    } else {
                        EditDialogTemp('添加下级指标', './producePlan/planTempPreserveCV.html?id=' + str + '&tempId=' + tempId, '800px', '500px');
                    }
                });

                $('#btn-update').click(function () {
                    parentName = parentName || "指标排序";
                    var ids = str;
                    var type = "";
                    if(str == ""){
                        ids = Mom.getUrlParam('id');
                        type = "template";
                    }else{
                        ids = str;
                        type = "templates";
                    }
                        EditDialogTemp(parentName, './producePlan/planTempPreserveCVEdit.html?id=' + ids+"&type="+type, '800px', '500px')
                });

                $('#btn-del').click(function () {
                    if (str === '') {
                        Mom.layMsg('请单选指标后再试');
                    } else {
                        deleteItOne('确定要删除该指标吗', Api.aps + '/api/aps/Template/delTempDetail/' + str)
                    }
                });
                //        删除
                function deleteItOne(mess, url) {
                    top.layer.confirm(mess, {icon: 3, title: '系统提示'}, function (index) {
                        Api.ajaxForm(url, {}, function (result) {
                            if (result.success == true) {
                                window.location.reload();
                            }
                        });
                        top.layer.close(index);
                    });
                    return false;
                }

                function EditDialogTemp(title, url, width, height, innerCallbackFn) {
                    var clickFlag = true;
                    if (navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)) {//如果是移动端，就使用自适应大小弹窗
                        width = 'auto';
                        height = 'auto';
                    } else {//如果是PC端，根据用户设置的width和height显示。
                    }
                    var ind = top.layer.open({
                        type: 2,
                        area: [width, height],
                        title: title,
                        maxmin: true, //开启最大化最小化按钮
                        content: url,
                        btn: ['保存', '取消'],
                        yes: function (index, layero) {
                            var body = top.layer.getChildFrame('body', index);  //获取子iframe
                            var iframeWin = layero.find('iframe')[0]; //得到iframe页的窗口对象，执行iframe页的方法：iframeWin.method();
                            if (clickFlag) {
                                if (!innerCallbackFn) {
                                    iframeWin.contentWindow.clicksubmit(iframeWin.contentWindow, body, index);
                                    window.location.reload();
                                } else {
                                    innerCallbackFn.call(iframeWin.contentWindow, iframeWin.contentWindow, body, index);
                                }
                                clickFlag = false;
                                setTimeout(function () {
                                    clickFlag = true;
                                }, 1500);
                            }
                        },
                        cancel: function (index) {
                        }
                    });
                }
            },

            /**维护信息内页*/
            planTempPCVInit: function () {
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
            /**维护信息编辑内页*/
            planTempPCVEInit: function () {
                var id = Mom.getUrlParam('id');
                var type = Mom.getUrlParam("type");
                var url = "";
                if(type == "template"){
                    url = Api.aps+"/api/aps/Template/editTitle/"+id;
                }else if(type == "templates"){
                    url = Api.aps+"/api/aps/Template/edit/"+id;
                }
                Api.ajaxForm(url,{},function (result) {
                    dataout(result.list)
                })
                function dataout(data) {
                    var tempId = Mom.getUrlParam('tempId');
                    $('#treeTable').dataTable({
                        "data": data,
                        "columns": [
                            {"data": "itemName", "width": "auto"},
                            {"data": "itemCode", "width": "auto"},
                            {
                                "data": "id", "orderable": false, "defaultContent": "", 'sClass': "autoWidth center",
                                "render": function (data, type, row, meta) {
                                    return data =
                                        "<input type='checkbox' id='" + row.id + "' name='id' hidden='hidden' class='hidd'>" +
                                        "<a class='btn btn-success btn-xs btn-preserve btn-up'><i class='fa fa-edit' ></i>上移</a >" +
                                        "<a class='btn btn-success btn-xs btn-preserve btn-down' ><i class='fa fa-edit' ></i>下移</a >"
                                }
                            }]
                    });
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
                    $('tbody tr').attr('class', 'center')
                }
                //    点击递交
                window.clicksubmit = function (iframeWin, body, index) {
                    var id = "";
                    var url = Api.aps +"/api/aps/Template/saveTempDetail";
                    $("tbody tr td input.hidd").each(function () {
                        id += "," + $(this).attr('id');
                    });
                    var data = {
                        "id": id.substr(1)
                    };
                    Api.ajaxForm(url, data, function (result) {
                        if (result.success == true) {
                            Mom.layMsg('保存成功');
                            top.layer.close(index);
                        } else {
                            Mom.layMsg(result.message);
                        }
                    });
                 }
            },
        confinJsonInit:function () {
             var id = Mom.getUrlParam("id");
            $("#id").val(Mom.getUrlParam('id'));
            Api.ajaxJson(Api.aps+"/api/aps/Template/form/"+id,{},function (result) {
                $("#textcontent").val(result.template.jsonCfg);
            });
              /*得到传后台的表单*/
               function getSubmitFormId(){
                   return "#inputForm";
               }
            }
        };

    $(function () {
        if ($('#planTempleIndex').length > 0) {
            PageModule.planTempInit()
        } else if ($('#planTempInitCV').length > 0) {
            PageModule.planTempInitCV()
        } else if ($('#planTempPreserve').length > 0) {
            PageModule.planTempPInit()
        } else if ($('#planTempPreserveCV').length > 0) {
            PageModule.planTempPCVInit()
        } else if ($('#planTempPreserveCVE').length > 0) {
            PageModule.planTempPCVEInit()
        } else if ($('#planTempCheckView').length>0){
            PageModule.planTempupdata()
        }else if($("#configureJson").length>0){
            PageModule.confinJsonInit()
        }
    });
})
;