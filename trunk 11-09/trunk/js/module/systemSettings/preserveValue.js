require(['/js/zlib/app.js'], function(App) {
    //引入用户登录校验
    require(['checkUser']);

    var PageModule = {
        proPreserveValue: function(){
            var propId = Mom.getUrlParam('id');
            require(['ztree_my','easyui_my'],function(ZTree,easyuiObj){
                var ztree = new ZTree(), treeObj;
                Api.ajaxJson(Api.admin+'/api/sys/SysAuthPropertyValue/list/'+propId,{},function(result){
                    if(result.success){
                        var ztreeSetting = {
                            callback:{
                                onClick: function (e, treeId, node){
                                    if(node.id){
                                        if(node.id==''){
                                            var obj={"id":'',"sysAuthProperty":{"id":propId}};
                                        }else{
                                            var obj={"id":node.id,"sysAuthProperty":{"id":propId}};
                                        }
                                        loadTreeTable(JSON.stringify(obj));
                                    }
                                }
                            }
                        };
                        treeObj = ztree.loadData($("#tree"),result.zTree,false,ztreeSetting);
                    }else{
                        Mom.layAlert(result.message);
                    }
                });

                $('#btnadd').click(function () {
                    Bus.openEditDialog('添加属性', './systemSettings/proValueCheckView.html?Sid=' + propId + '&oper=add', '805px', '340px', function(layerIdx, layero){
                        var iframeWin = layero.find('iframe')[0].contentWindow;
                        var formData = iframeWin.getFormData();
                        if(formData){
                            var data = formData.data;
                            Api.ajaxJson(formData.url, JSON.stringify(data),function(result){
                                if(result.success == true){
                                    window.location.reload();
                                    top.layer.close(layerIdx);
                                }else{
                                    Mom.layAlert(result.message);
                                }
                            });
                        }
                    });
                });

                function loadTreeTable(data){
                    var url = Api.admin+"/api/sys/SysAuthPropertyValue/ajaxTreeJson";
                    // url = Api.aps + "/api/aps/Device/ajaxTreeJson/0";
                    Api.ajaxJson(url,data,function(result){
                        if(result.success){
                            renderTableData(result.rows);
                            console.log(result.rows);
                        }else{
                            Mom.layAlert(result.message);
                        }
                    });
                }

                // 渲染表格
                function renderTableData(treegridData) {
                    $('#tt').treegrid({
                        idField:'id',
                        treeField:'name',
                        collapsible: true,
                        fitColumns: true,
                        singleSelect : true,
                        data: treegridData,
                        columns:[[
                            {field:'name',title:'名称',width:150,align:'left'},
                            {field:'value',title:'值',width:80,align:'center'},
                            {field:'sort',title:'排序',width:80,align:'center'},
                            {field:'null',title:"操作",align:'center',width:300,formatter: function(value,row,index){
                                return "<a class='btn  btn-info btn-check' id='"+ row.id+"'><i class='fa fa-search-plus'></i>查看</a>" +
                                        " <a class='btn btn-success btn-mr btn-change' id='"+ row.id+"'><i class='fa icon-change'></i>修改</a>" +
                                        " <a class='btn bg-f75c5c btn-delete' id='"+ row.id+"'><i class='fa fa-trash'></i> 删除</a>"  +
                                        " <a class='btn  btn-add btn-target' id='"+ row.id+"'><i class='fa fa-plus'></i>添加下级节点</a>";
                                }
                            }
                        ]]
                    });
                    clickButton();
                }
                function clickButton() {
                    $('.btn-check').click(function () {
                        var id = $(this).attr('id');
                        Bus.openDialog('查看属性信息', './systemSettings/proValueCheckView.html?id=' + id+'&oper=view', '805px', '340px');

                    });
                    $('.btn-change').click(function () {
                        var id = $(this).attr('id');
                        Bus.openEditDialog('修改属性信息', './systemSettings/proValueCheckView.html?id=' + id+'&oper=edit', '805px', '340px', saveCallback);
                    });
                    $('.btn-delete').click(function () {
                        var id = $(this).attr('id');
                        Bus.deleteItem('确定要删除该属性吗', Api.admin+'/api/sys/SysAuthPropertyValue/ajaxDel/'+id,{},function (result,layerIndex) {
                            if(result.success == true){
                                easyuiObj.tg_removeTreegridNode('#tt', id);
                                var node = treeObj.getNodeByParam("id", id, null);
                                treeObj.removeNode(node);
                                return true;
                            }else{
                                Mom.layAlert(result.message);
                            }
                            return false;
                        });
                    });
                    $('.btn-target').click(function(){
                        var id = $(this).attr('id');
                        Bus.openEditDialog('添加下级属性','./systemSettings/proValueCheckView.html?id='+id+"&Sid="+propId+'&oper=addSon','805px','340px',addSonCallback);
                    });
                }

                function saveCallback(layerIdx, layero){
                    var iframeWin = layero.find('iframe')[0].contentWindow;
                    var formData = iframeWin.getFormData();
                    if(formData){
                        var data = formData.data;
                        Api.ajaxJson(formData.url, JSON.stringify(data),function(result){
                            if(result.success == true){
                                Mom.layMsg('操作成功');
                                var sysAuthPropertyValue = result.SysAuthPropertyValue;
                                //添加treeGrid节点
                                easyuiObj.tg_editTreegridNode('#tt',sysAuthPropertyValue.id, sysAuthPropertyValue);
                                // clickButton();
                                //更新左侧zTree
                                var node = treeObj.getNodeByParam("id", sysAuthPropertyValue.id, null);
                                treeObj.updateNode(node);
                                top.layer.close(layerIdx);
                            }else{
                                Mom.layAlert(result.message);
                            }
                        });
                    }
                }

                function addSonCallback(layerIdx,layero){
                    var iframeWin = layero.find('iframe')[0].contentWindow;
                    var formData = iframeWin.getFormData();
                    if(formData){
                        var data = formData.data;
                        Api.ajaxJson(formData.url, JSON.stringify(data),function(result){
                            if(result.success == true){
                                Mom.layMsg('操作成功');
                                var sysAuthPropertyValue = result.SysAuthPropertyValue;
                                var parentId = data.parent.id;
                                //添加treeGrid节点
                                easyuiObj.tg_appendTreegridNode('#tt',parentId,sysAuthPropertyValue);
                                clickButton();
                                //左侧zTree添加节点
                                var parentNode = treeObj.getNodeByParam("id", parentId, null);
                                treeObj.addNodes(parentNode,sysAuthPropertyValue);
                                top.layer.close(layerIdx);
                            }else{
                                Mom.layAlert(result.message)
                            }
                        });
                    }
                }

                var initData={"id":'',"sysAuthProperty":{"id":propId}};
                loadTreeTable(JSON.stringify(initData));
            });
        },

        //修改页面
        proValueCheckView: function(){
            var id = Mom.getUrlParam('id');
            var Sid= Mom.getUrlParam('Sid');
            var oper= Mom.getUrlParam('oper');
            $('#sysAuthPropertyId').val(Sid);
            var dataParam = {};
            if(oper == 'addSon'){
                $('#parentId').val(id);
                dataParam = {parent:{id:id},sysAuthProperty:{id:Sid}};
            }else{
                $('#id').val(id);
                dataParam = {id:id,sysAuthProperty:{id:Sid}};
            }
            if (id) {
                /*此处后端接口  id为弹出窗口自带的id 通过浏览器方法传参得到*/
                var url = Api.admin+"/api/sys/SysAuthPropertyValue/form";
                Api.ajaxJson(url, JSON.stringify(dataParam), function(result){
                    if (result.success) {
                        var SysAuthPropertyValue = result.SysAuthPropertyValue;
                        Validator.renderData(SysAuthPropertyValue, $('#inputForm'));
                        $('#sysAuthPropertyName').val(SysAuthPropertyValue.sysAuthProperty.name);
                        $('#parentName').text(result.parentName);
                    } else {
                        Mom.layMsg(result.message);
                    }
                });
            }

            window.getFormData = function(){
                if(!Validator.valid(document.forms[0],1.3)){
                    return null;
                }
                var formObj =$("#inputForm");
                var formdata = formObj.serializeJSON();
                return {
                    url: formObj.attr('action'),
                    data: formdata
                };
            }
        },

    };

    $(function(){
        //维护属性值
        if($('#proPreserveValue').length > 0){
            PageModule.proPreserveValue();
        }
        else if($('#proValueCheckView').length > 0){
            PageModule.proValueCheckView();
        }
    });

});