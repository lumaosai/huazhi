require(['/js/zlib/app.js'], function(App) {
    //引入用户登录校验
    require(['checkUser','treeTable']);

    var PageModule = {
        listInit: function(){
            var treeObj;
            require(['ztree_my','easyui_my'],function(ZTree, easyuiObj){
                var ztree = new ZTree();
                Api.ajaxJson(Api.admin+'/api/sys/SysOrg/orgTree',{},function(result){
                    if(result.success){
                        var ztreeSetting = {
                            callback:{
                                onClick: function (e, treeId, node){
                                    if(node.id){
                                        updatason(node.id);
                                    }
                                }
                            }
                        };
                        treeObj = ztree.loadData($("#tree"),result.rows,false,ztreeSetting);
                    }
                });
                function updatason(node){
                    load(node);
                }
                var pageLoad = function () {
                    load(0);
                };
                //立即调用
                pageLoad();

                // 加载右侧数据
                function load(node) {
                    Api.ajaxJson(Api.admin+"/api/sys/SysOrg/treeJson/"+node,{},function(tableData){
                        if(tableData.success){
                            $('#tt').treegrid({
                                idField:'id',
                                treeField:'name',
                                collapsible: true,
                                fitColumns: true,
                                singleSelect : true,
                                data: tableData,
                                columns:[[
                                    {field:'name',title:'机构名称',width:150,align:'left'},
                                    {field:'typeLabel',title:'机构类型',width:80,align:'center'},
                                    {field:'gradeLabel',title:'机构等级',width:80,align:'center'},
                                    {field:"text",title:"操作",align:'center',width:400,formatter: function(value,row,index){
                                        var html="<a class='btn  btn-info btn-check' id='"+ row.id+"'><i class='fa fa-search-plus'></i>查看</a>" +
                                            " <a class='btn btn-success btn-mr btn-change' id='"+ row.id+"'><i class='fa icon-change'></i>修改</a>" ;
                                            if(row.type !="1" && row.type !="0"){
                                                html += "<a class='btn  btn-warning btn-xs btn-allot' id='"+ row.id+"' data-type='"+ row.type+"'><i class='fa fa-user'></i> 分配用户</a> ";
                                            }
                                            html += "<a class='btn   btn-xs btn-allotApp' id='"+ row.id+"'><i class='fa fa-pie-chart'></i> 分配应用</a>" +
                                                " <a class='btn bg-f75c5c btn-delete' id='"+ row.id+"'><i class='fa fa-trash'></i> 删除</a>"  +
                                                " <a class='btn  btn-add btn-target' id='"+ row.id+"'><i class='fa fa-plus'></i>添加下级指标</a>";
                                             return html;
                                        }
                                    }
                                ]]
                            });
                            btncilck();
                        }else{
                            Mom.layMsg(tableData.message)
                        }
                    });
                }

                function btncilck(){
                    // 查看
                    $('.btn-check').click(function () {
                        var id = $(this).attr('id');
                        Bus.openDialog('查看组织机构信息', './systemSettings/orgCheckView.html?id=' + id, '800px', '550px');
                    });
                    //修改
                    $('.btn-change').click(function () {
                        var id = $(this).attr('id');
                        Bus.openEditDialog('修改组织机构信息', './systemSettings/orgCheckView.html?id=' + id, '800px', '550px', saveCallback);
                    });
                    //删除
                    $('.btn-delete').click(function () {
                        var data = {id: $(this).attr('id')};
                        Bus.deleteItem('确定要删除该机构吗', Api.admin+'/api/sys/SysOrg/del/',data, deleteCallback);
                    });
                    // 添加下级
                    $('.btn-add').click(function(){
                        var id = $(this).attr('id');
                        Bus.openEditDialog('添加下级菜单','./systemSettings/orgCheckView.html?pid='+id,'800px','550px', addSonCallback)
                    });
                    // 分配用户
                    $('.btn-allot').click(function(){
                        var id = $(this).attr('id');
                        var type = $(this).attr('data-type');
                        Bus.openDialog('分配用户','./systemSettings/orgAssign.html?id='+id+'&type='+type,'800px','600px');
                    });
                    // 分配应用
                    $('.btn-allotApp').click(function(){
                        var id = $(this).attr('id');
                        Bus.openDialog('分配应用','./systemSettings/orgAllotApp.html?id='+id,'800px','600px');
                    });
                }

                //新增、编辑回调函数
                function saveCallback(layerIdx, layero){
                    var body = top.layer.getChildFrame('body', layerIdx);  //获取子iframe
                    var iframeWin = layero.find('iframe')[0].contentWindow;
                    //提交内部表单
                    var formData = iframeWin.getFormData();
                    if(formData){
                        Api.ajaxJson(formData.url, JSON.stringify(formData.data), function(result){
                            if(result.success == true){
                                var data = result.SysOrg;
                                Mom.layMsg('操作成功');
                                //新增、更新treeGrid节点信息
                                easyuiObj.tg_editTreegridNode('#tt',data.id, data);
                                btncilck();
                                var node = treeObj.getNodeByParam("id", data.id, null);
                                treeObj.updateNode(node);
                                top.layer.close(layerIdx);
                            }else{
                                Mom.layAlert(result.message);
                            }
                        });
                    }
                }

                //添加下级指标回调函数
                function addSonCallback(layerIdx, layero){
                    var body = top.layer.getChildFrame('body', layerIdx);  //获取子iframe
                    var iframeWin = layero.find('iframe')[0].contentWindow;
                    //提交内部表单
                    var formData = iframeWin.getFormData();
                    if(formData){
                        Api.ajaxJson(formData.url, JSON.stringify(formData.data), function(result){
                            var data =result.SysOrg;
                            if(result.success == true){
                                Mom.layMsg('操作成功');
                                //添加treeGrid节点
                                easyuiObj.tg_appendTreegridNode('#tt',data.parentId,data);
                                btncilck();
                                //更新左侧zTree
                                var parentNode = treeObj.getNodeByParam("id",data.parentId, null);
                                newNode = treeObj.addNodes(parentNode,result.SysOrg);
                                //关闭弹出层
                                top.layer.close(layerIdx);
                            }else{
                                Mom.layAlert(result.message);
                            }
                        });
                    }
                }
                //删除方法的回调
                function deleteCallback(result, layerIndex, data){
                    if(result.success == true){
                        easyuiObj.tg_removeTreegridNode('#tt', data.id);
                        var treeObj = $.fn.zTree.getZTreeObj("tree");
                        var node = treeObj.getNodeByParam("id", data.id, null);
                        treeObj.removeNode(node);
                    }else{
                        Mom.layAlert(result.message);
                    }
                    return true;
                }

            });

        },
        //查看(修改)组织机构信息 && 添加下级菜单
        formInit: function(){
            // 获取机构类型
            Bus.createSelect(Api.admin+"/api/sys/SysDict/type/orgType","#type");
            // 获取机构等级
            Bus.createSelect(Api.admin+"/api/sys/SysDict/type/orgGrade","#grade");

            var id = Mom.getUrlParam('id');
            var pid = Mom.getUrlParam('pid');
            $("#id").val(id);
            if (id!==null) {
                /*此处后端接口  id为弹出窗口自带的id 通过浏览器方法传参得到*/
                var url = Api.admin+"/api/sys/SysOrg/view/" + id;
                Api.ajaxForm(url, {}, function (result) {
                    if (result.success) {
                        var SysOrg = result.SysOrg;
                        Validator.renderData(SysOrg, $('#inputForm'));
                        /*运行把ajax数据渲染到弹出窗口中*/
                        $('#pname').val(SysOrg.primaryPerson?SysOrg.primaryPerson.name:"");
                        $('#dname').val(SysOrg.deputyPerson?SysOrg.deputyPerson.name:"");
                        $('#parentName').val(result.parentName);
                    } else {
                        Mom.layMsg(result.message);
                    }
                });
            }else if(pid!==null){
                var url = Api.admin+"/api/sys/SysOrg/view/" + pid;
                Api.ajaxForm(url, {}, function (result) {
                    if (result.success) {
                        var SysOrg = result.SysOrg;
                        $('#parentName').val(SysOrg.name);
                        $('#parentId').val(SysOrg.id);
                    } else {
                        Mom.layMsg(result.message);
                    }
                });
            }
            $('#parentName').on('dblclick',selParent);
            $('#parentNameButton').on('click',selParent);
            //主负责人
            $('#pname').on('dblclick',function(){selUser('#pnameId','#pname');});
            $('#primaryPersonButton').on('click',function(){selUser('#pnameId','#pname');});
            //副负责人
            $('#dname').on('dblclick',function(){selUser('#dnameId','#dname');});
            $('#deputyPersonButton').on('click',function(){selUser('#dnameId','#dname');});

            /**
             * 选择上级机构
             */
            function selParent(){
                var options = {defaultVals: $('#parentId').val() };
                Bus.openOrgSelect('选择上级机构',{},options,function(selResult, layIdx, layero){
                    $('#parentId').val(selResult.id);
                    $('#parentName').val(selResult.name);
                    return true;
                },function(){
                    $('#parentId,#parentName').val('');
                });
            }

            //选择负责人
            function selUser(id, name){
                Bus.openSelUserWin('选择负责人',{},{},function(selResult, layIdx, layero){
                    $(id).val(selResult.id);
                    $(name).val(selResult.name);
                    return true;
                },function(){
                    $(id).val('');
                    $(name).val('');
                });
            }

            window.getFormData = function(){
                if(!Validator.valid(document.forms[0],1.3)){
                    return;
                }
                var formObj = $('#inputForm');
                return {
                    url: formObj.attr('action'),
                    data: formObj.serializeJSON()
                }
            }
        },

    };

    $(function(){
        //机构管理首页
        if($('#orgIndex').length > 0){
            PageModule.listInit();
        }
        //查看(修改)组织机构信息 && 添加下级菜单
        else if($('#orgCheckView').length > 0){
            PageModule.formInit();
        }

    });
});