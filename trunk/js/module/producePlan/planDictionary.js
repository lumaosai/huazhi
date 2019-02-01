require([cdnDomain+'/js/zlib/app.js'], function (App) {
    require(['checkUser','treeTable']);
    var PageModule = {
        //字典树
        planDicInit: function () {
            $('#officeContent').attr('src', 'planDicInner.html');
            require(['easyui_my'],function(easyuiObj){
                var ztree,treeObj;
                Api.ajaxForm(Const.aps + '/api/aps/Dict/tree', {}, function (da) {
                    zTree(da)
                });
                page(0);
                function page(node) {
                    Api.ajaxJson(Const.aps + "/api/aps/Dict/ajaxTreeJson/" + node, {}, function (tableData) {
                        if (tableData.success) {
                            $('#tt').treegrid({
                                idField:'id',
                                treeField:'itemName',
                                collapsible: true,
                                fitColumns: true,
                                //rownumbers: true,
                                columns:[[
                                    {field:'itemName',title:'指标名称',width:200,align:'left'},
                                    {field:'itemCode',title:'指标编码',width:80,align:'center'},
                                    {field:'itemValue',title:'年指标值',width:80,align:'center'},
                                    {field:'itemMonthValue',title:'月指标值',width:80,align:'center'},
                                    {field:'itemUnit',title:'指标单位',width:80,align:'center'},
                                    {field:"text",title:"操作",align:'center',width:300,formatter: function(value,row,index){
                                        return "<a class='btn  btn-info btn-check' id='"+ row.id+"'><i class='fa fa-search-plus'></i>查看</a>" +
                                            " <a class='btn btn-success  btn-change' id='"+ row.id+"'><i class='fa icon-change'></i>修改</a>" +
                                            " <a class='btn bg-f75c5c btn-delete' id='"+ row.id+"'><i class='fa fa-trash'></i> 删除</a>"  +
                                            " <a class='btn  btn-add btn-target' id='"+ row.id+"'><i class='fa fa-plus'></i>添加下级指标</a>";
                                    }},
                                ]],
                                data:tableData
                            });
                            btncilck();
                        } else {
                            Mom.layMsg(tableData.message)
                        }

                    })
                }
                function btncilck(){
                    // 查看
                    $('.btn-check').unbind().click(function () {
                        var id = $(this).attr('id');
                        Bus.openDialog('查看指标信息', './producePlan/planDicCheckView.html?id=' + id, '800px', '350px')
                    });
                    //修改
                    $('.btn-change').unbind().click(function () {
                        var id = $(this).attr('id');
                        Bus.openEditDialog('修改指标信息', './producePlan/planDicCheckView.html?id=' + id, '800px', '350px',saveCallback);
                    });
                    //删除
                    $('.btn-delete').unbind().click(function () {
                        var data = {ids: $(this).attr('id')};
                        Bus.deleteItem('确定要删除该指标吗', Const.aps + '/api/aps/Dict/delete/',data,deleteItemCallBack);
                    });
                    // 添加下级指标
                    $('.btn-add').unbind().click(function(){
                        var id = $(this).attr('id');
                        Bus.openEditDialog('添加下级指标','./producePlan/planDicCheckView.html?pid='+id,'800px','350px',addSonCallback);

                    });

                }
                function zTree(da) {
                    var data = da.rows;
                    var zTreeObj;
                    var zNodes = data;
                    require(['ztree_my'], function (ZTree) {
                         ztree = new ZTree();
                        var ztreeSetting = {                                            //配置ztree参数
                            callback:{
                                onClick: function (e, treeId, node) {
                                    if (node.id) {
                                        rendersun(node.id)
                                    }
                                }
                            }
                        };
                        treeObj = ztree.loadData($("#tree"),zNodes,false,ztreeSetting);  //渲染ztree
                    });
                }
                function rendersun(data) {
                    page(data);
                }

                //添加、修改回调函数
                function saveCallback(layerIdx,layero){
                    var iframeWin = layero.find('iframe')[0].contentWindow;
                    var formData = iframeWin.getFormData();
                    if(formData){
                        var data = formData.data;
                        Api.ajaxJson(formData.url,JSON.stringify(data),function(result){
                            console.log(result,6555);
                            if(result.success == true){
                                Mom.layMsg('操作成功');
                                //更新treeGrid
                                easyuiObj.tg_editTreegridNode('#tt',result.Dict.id, result.Dict);
                                 btncilck();
                                //更新左侧zTree
                                var node = treeObj.getNodeByParam("id", result.Dict.id, null);
                                node.name = result.Dict.itemName;
                                treeObj.updateNode(node);
                                top.layer.close(layerIdx);
                            }else{
                                Mom.layAlert(result.message);
                            }
                        });
                    }

                }

                //添加下级节点回调函数
                function addSonCallback(layerIdx,layero){
                    var iframeWin = layero.find('iframe')[0].contentWindow;
                    var formData = iframeWin.getFormData();
                    if(formData){
                        var data = formData.data;
                        var parentId = data.parent.id;
                        Api.ajaxJson(formData.url,JSON.stringify(data),function(result){
                            console.log(result,888);
                            if(result.success == true){
                                Mom.layMsg('操作成功');
                                //添加treeGrid节点
                                easyuiObj.tg_appendTreegridNode('#tt',parentId,result.Dict);
                                btncilck();
                                //更新左侧zTree
                                Api.ajaxForm(Const.aps + '/api/aps/Dict/tree',{},function (data) {
                                    var newNodes = '';
                                    var ArrayDic =data.rows;
                                    ArrayDic.forEach(function(item,index){
                                        if(item.id == result.Dict.id){
                                            newNodes  = item;
                                        }
                                    })
                                    var parentNode = treeObj.getNodeByParam("id",parentId, null);
                                    newNode = treeObj.addNodes(parentNode,newNodes);
                                    //关闭弹出层
                                    top.layer.close(layerIdx);
                                });

                            }else{
                                Mom.layAlert(result.message);
                            }
                        });
                    }
                }

                //删除的回调函数
                function deleteItemCallBack(result, layerIndex, data){
                    if(result.success == true){
                        easyuiObj.tg_removeTreegridNode('#tt', data.ids);
                        var node = treeObj.getNodeByParam("id", data.ids, null);
                        treeObj.removeNode(node);
                    }else{
                        Mom.layAlert(result.message);
                    }
                    return true;
                }
            });
        },

        /**字典数查看新增编辑*/
        //字典数查看编辑
        planDicCVInit:function () {
            $('#inputForm').attr('action',Const.aps+'/api/aps/Dict/save');
            var id = Mom.getUrlParam('id');
            var pId = Mom.getUrlParam('pid');
            $('#id').val(id);
            if (id == null && pId == null) {
                $('#parentIdH').val(0);
            } else {
                if (id == null) {
                    var url = Const.aps+"/api/aps/Dict/view/" + pId;
                    Api.ajaxJson(url, {}, function (result) {
                        if (result.success) {
                            SysOrg = result.apsDict;
                            var id = SysOrg.id;
                            $('#parentIdH').val(id);
                            $('#_parentId').val(result.apsDict.itemName);

                        } else {
                            Mom.layMsg(result.message);
                        }
                    });
                } else {
                    var url = Const.aps+"/api/aps/Dict/view/" + id;
                    Api.ajaxJson(url, {}, function (result) {
                        if (result.success) {
                            SysOrg = result.apsDict;
                            var parentid = SysOrg.parentId;
                            $('#parentIdH').val(parentid);
                            Validator.renderData(SysOrg, $('#inputForm'));
                            /*渲染parentName*/
                            Validator.renderData(result, $('#inputForm'));

                        } else {
                            Mom.layMsg(result.message);
                        }
                    });
                }
            }

            window.getFormData = function(){
                if(!Validator.valid(document.forms[0],1.3)){
                    return;
                }
                var formObj = $('#inputForm');
                var dataTmp = formObj.serializeJSON();
                return {
                    url:formObj.attr('action'),
                    data: dataTmp
                }

            };
        }

    };

$(function () {
    //参数配置列表
    if ($('#planDicIndex').length > 0) {
        PageModule.planDicInit()
    }else if($('#planDicCheckView').length > 0){
        PageModule.planDicCVInit()
    }
});

})
;
