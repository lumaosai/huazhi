require(['/js/zlib/app.js'], function (App) {
    require(['checkUser','treeTable']);
    var PageModule = {
        //字典树
        planDicInit: function () {
            $('#officeContent').attr('src', 'planDicInner.html');
            Api.ajaxForm(Api.aps + '/api/aps/Dict/tree', {}, function (da) {
                zTree(da)
            });
            page(0);
            function zTree(da) {
                var data = da.rows;
                var zTreeObj;
                var zNodes = data;
                require(['ztree_my'], function (ZTree) {
                    var ztree = new ZTree();
                    var ztreeSetting = {                                            //配置ztree参数
                        callback:{
                            onClick: function (e, treeId, node) {
                                if (node.id) {
                                    rendersun(node.id)
                                }
                            }
                        }
                    };
                    zTreeObj = ztree.loadData($("#tree"),zNodes,false,ztreeSetting);  //渲染ztree
                });
            }

            function rendersun(data) {
                page(data);
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
                    openEditDialogDic('修改指标信息', './producePlan/planDicCheckView.html?id=' + id, '800px', '350px')
                });
                //删除
                $('.btn-delete').unbind().click(function () {
                    var id = $(this).attr('id');
                    deleteItem('确定要删除该指标吗', Api.aps + '/api/aps/Dict/delete/',id)
                });
                // 添加下级指标
                $('.btn-add').unbind().click(function(){
                    var id = $(this).attr('id');
                    openEditDialogLevel('添加下级指标','./producePlan/planDicCheckView.html?pid='+id,'800px','350px')
                });

            }

            function page(node) {
                Api.ajaxJson(Api.aps + "/api/aps/Dict/ajaxTreeJson/" + node, {}, function (tableData) {
                    if (tableData.success) {
                        require(['easyui_my'],function(){
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
                                data:tableData,
                                onClickCell:function(field,row){

                                }
                            });

                            btncilck();

                        });
                        //PageModule.renderTableData(tableData.rows);
                        //clickButton();
                    } else {
                        Mom.layMsg(tableData.message)
                    }

                })
            }


                //修改
                function openEditDialogDic(title,url,width,height,innerCallbackFn){
                    var clickFlag = true;
                    if(navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)){//如果是移动端，就使用自适应大小弹窗
                        width='auto';
                        height='auto';
                    }else{//如果是PC端，根据用户设置的width和height显示。
                    }
                    var ind =  top.layer.open({
                        type: 2,
                        area: [width, height],
                        title: title,
                        maxmin: false, //开启最大化最小化按钮
                        content: url ,
                        btn: ['确定', '关闭'],
                        yes: function(index, layero){
                            var body = top.layer.getChildFrame('body', index);  //获取子iframe
                            var iframeWin = layero.find('iframe')[0]; //得到iframe页的窗口对象，执行iframe页的方法：iframeWin.method();
                            if(clickFlag){
                                if(!innerCallbackFn){
                                    iframeWin.contentWindow.doSubmit1(iframeWin.contentWindow,body,index);
                                    var objDic = iframeWin.contentWindow.formdata;

                                            var data = {
                                                itemName: objDic.itemName ,
                                                itemCode: objDic.itemCode,
                                                itemValue: objDic.itemValue,
                                                itemMonthValue: objDic.itemMonthValue,
                                                itemUnit: objDic.itemUnit
                                            }
                                            require(['easyui_my'],function(easyuiObj){
                                                easyuiObj.tg_editTreegridNode('#tt',objDic.id, data);
                                                btncilck();
                                            });

                                            var treeObj = $.fn.zTree.getZTreeObj("tree");
                                            var node = treeObj.getNodeByParam("id", objDic.id, null);
                                            node.name = objDic.itemName;
                                            treeObj.updateNode(node);

                                        //})
                                    //},500);


                                }else{
                                    //iframeWin.contentWindow[innerCallbackFn]();   //有bug  innerCallbackFn必须是字符串 待解决
                                    innerCallbackFn(iframeWin, body, index);

                                }
                                clickFlag = false;
                                setTimeout(function(){
                                    clickFlag = true;
                                },3000);
                            }
                        },
                        cancel: function(index){
                        }
                    });

                }

                //添加下级指标
            function openEditDialogLevel(title,url,width,height,innerCallbackFn){
                var clickFlag = true;
                if(navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)){//如果是移动端，就使用自适应大小弹窗
                    width='auto';
                    height='auto';
                }else{//如果是PC端，根据用户设置的width和height显示。
                }
                var ind =  top.layer.open({
                    type: 2,
                    area: [width, height],
                    title: title,
                    maxmin: false, //开启最大化最小化按钮
                    content: url ,
                    btn: ['确定', '关闭'],
                    yes: function(index, layero){
                        var body = top.layer.getChildFrame('body', index);  //获取子iframe
                        var iframeWin = layero.find('iframe')[0]; //得到iframe页的窗口对象，执行iframe页的方法：iframeWin.method();
                        if(clickFlag){
                            if(!innerCallbackFn){
                                iframeWin.contentWindow.doSubmit1(iframeWin.contentWindow,body,index);
                                var objDic = iframeWin.contentWindow.formdata;

                                // 添加到父节点需要获取添加子节点
                                var id = '';
                                setTimeout(function(){
                                    Api.ajaxJson(Api.aps +"/api/aps/Dict/ajaxTreeJson/"+0,{},function(tableData){
                                        var ArrayData =tableData.rows;
                                        getNodeId(ArrayData);
                                        function getNodeId (data) {
                                            data.forEach(function(item){
                                                if(item.itemName == objDic.itemName && item.itemCode == objDic.itemCode && item.itemUnit == objDic.itemUnit){
                                                    id = item.id;
                                                }
                                                if(item.children.length > 0 ){
                                                    getNodeId(item.children);
                                                }
                                            })
                                        }
                                        // 添加到父节点下面
                                        var data = [{
                                            id: id,
                                            itemName: objDic.itemName,
                                            itemCode: objDic.itemCode,
                                            itemValue: objDic.itemValue,
                                            itemMonthValue: objDic.itemMonthValue,
                                            itemUnit: objDic.itemUnit
                                        }];
                                        require(['easyui_my'],function(easyuiObj){
                                            easyuiObj.tg_appendTreegridNode('#tt',objDic.parent.id, data);
                                            btncilck();
                                        });
                                        // 重新加载左侧树，由于存在异步操作，用到定时器
                                        setTimeout(function(){
                                            var newNodes  = '';
                                            Api.ajaxForm(Api.aps + '/api/aps/Dict/tree',{},function (data) {
                                                var ArrayDic =data.rows;
                                                ArrayDic.forEach(function(item,index){
                                                    if(item.itemCode == objDic.itemCode){
                                                        newNodes  = item;
                                                    }
                                                })
                                                var treeObj = $.fn.zTree.getZTreeObj("tree");
                                                var node = treeObj.getNodeByParam("id",newNodes.pId, null);
                                                newNode = treeObj.addNodes(node, newNodes);
                                            });
                                        },1000);
                                    });
                                },1000)

                            }else{
                                //iframeWin.contentWindow[innerCallbackFn]();   //有bug  innerCallbackFn必须是字符串 待解决
                                innerCallbackFn(iframeWin, body, index);

                            }
                            clickFlag = false;
                            setTimeout(function(){
                                clickFlag = true;
                            },3000);
                        }
                    },
                    cancel: function(index){
                    }
                });

            }

            //删除单条数据
            function deleteItem(mess,url,id){
                var data = {ids:id} || {};
                top.layer.confirm(mess, {icon: 3, title:'系统提示'},function(index){
                    Api.ajaxForm(url,data,function(result){
                        if(result.success == true){
                            require(['easyui_my'],function(easyuiObj){
                                easyuiObj.tg_removeTreegridNode('#tt',id);
                                btncilck();
                            });
                            // 重新加载左侧树，由于存在异步操作，用到定时器
                            setTimeout(function(){
                                var treeObj = $.fn.zTree.getZTreeObj("tree");
                                var node = treeObj.getNodeByParam("id",id, null);
                                treeObj.removeNode(node);
                            },1000);

                        }
                    });
                    top.layer.close(index);
                });
                return false;
            }

        },

        /**字典数查看新增编辑*/
        //字典数查看编辑
        planDicCVInit:function () {
            $('#inputForm').attr('action',Api.aps+'/api/aps/Dict/save');
            var id = Mom.getUrlParam('id');
            var pId = Mom.getUrlParam('pid');
            $('#id').val(id);
            if (id == null && pId == null) {
                $('#parentIdH').val(0);
            } else {
                if (id == null) {
                    var url = Api.aps+"/api/aps/Dict/view/" + pId;
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
                    var url = Api.aps+"/api/aps/Dict/view/" + id;
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

            window.doSubmit1 = function(iframeWin, iframeBody, layerIdx){
                if(!Validator.valid(document.forms[0],1.3)){
                    return;
                }
                var formObj = $('#inputForm');
                var url = formObj.attr('action');
                var formdata = formObj.serializeJSON();
                window.formdata = formdata;
                Api.ajaxJson(url,JSON.stringify(formdata),function(result){
                    if(result.success == true){
                        Mom.layMsg('已成功提交',{time: 1000});
                        setTimeout(function(){
                            //关闭弹出层
                            top.layer.close(layerIdx);

                        },1000);
                    }else{
                        Mom.layAlert(result.message);
                    }
                });
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
