/**
 * Created by lumaosai on 2018/9/20.
 */
require(['/js/zlib/app.js'], function (App) {
    var PageModule = {
        plantMaterialAllocation: function(){
            function load() {
                require(['ztree_my'],function(ZTree){
                    var zTreeLeft = new ZTree();
                    var zTreeRight = new ZTree();
                    var arr = [];//保存选择的工厂id
                    var id = $('#id').val();
                    var data = {
                        id:id
                    };
                    Api.ajaxForm(Api.mtrl + "/api/fm/MtrlFctr/form/"+id, data, function (da) {
                        if(da.success){
                            var ztreeSetting1 = {
                                edit: {
                                    enable: true,
                                    showRenameBtn: false,
                                    showRemoveBtn: false,
                                    drag: {
                                        isCopy: true,
                                        isMove: false,
                                        prev: true,
                                        next: true,
                                        // inner: canInner1
                                    }
                                },
                                data: {
                                    simpleData: {
                                        enable: true,
                                        idKey: "id",
                                        pIdKey: "pId"
                                    },
                                    key: {
                                        name: "name",
                                        title: "name"
                                    }
                                },
                                callback: {
                                    beforeDrag: beforeDrag1,
                                    beforeDrop: beforeDrop1,
                                }
                            };
                            function canInner1(treeId, nodes, targetNode) {
                                console.log(treeId, nodes, targetNode);
                                return true;
                                if(!targetNode && !targetNode.isParent ){
                                    return true;
                                }else{
                                    if(targetNode.children){
                                        targetNode.children.forEach(function(item){
                                            if(nodes.id == item.id){
                                                return false;
                                            }else{
                                                return true;
                                            }
                                        })
                                    }
                                    return true;

                                }
                            }
                            function beforeDrag1(treeId, treeNodes) {
                                return treeNodes[0].isleaf != 0 ;
                            }

                            function beforeDrop1(treeId, treeNodes, targetNode, moveType,isCopy) {
                                isCopy = true;
                                if(targetNode) {
                                    if(targetNode.children != undefined){
                                        var id = treeNodes[0].id;
                                        for (i = 0; i < targetNode.children.length; i++) {
                                            if(targetNode.children[i].id == id){
                                                Mom.layMsg("已存在该条数据了");
                                                return false;
                                            }
                                        }
                                    }
                                    return true;
                                }
                                return false;
                            }
                            // 渲染ztree返回ztree对象左侧树treeObj1
                            var treeObj1 = zTreeLeft.loadData($("#tree1"),da.mtrlTreeArr,false,ztreeSetting1);
                            //左侧搜索查询
                            zTreeLeft.registerSearch(treeObj1, '#name', 'name');
                            //点击左侧搜索按钮
                            $('#btn-search1').click(function(){
                                zTreeLeft.registerSearch(treeObj1, '#name', 'name');
                            });
                            var ztreeSetting2 = {
                                edit: {
                                    enable: true,
                                    showRenameBtn: false,
                                    drag: {
                                        isCopy: true,
                                        isMove: false,
                                       /* prev: false,
                                        next: false,*/
                                        // inner: canInner2
                                    }
                                },
                                data: {
                                    key:{
                                        name:"name",
                                        title: "name"
                                    },
                                    simpleData: {
                                        enable: true,
                                        idKey:"id",
                                        pIdKey:"pId",
                                    }
                                },
                                callback: {
                                    beforeDrag: beforeDrag2,
                                    beforeDrop: beforeDrop2,
                                }
                            };
                            function canInner2(treeId, nodes, targetNode) {
                                return true;
                                if(!targetNode.isParent){
                                    return true;
                                }else{
                                    if(targetNode.children){
                                        targetNode.children.forEach(function(item){
                                            if(nodes.id == item.id){
                                                return false;
                                            }else{
                                                return true;
                                            }
                                        })
                                    }
                                    return true

                                }

                            }

                            function beforeDrag2(treeId, treeNodes) {
                                return true;
                            }

                            function beforeDrop2(treeId, treeNodes, targetNode, moveType) {
                                isCopy = true;
                                if(targetNode) {
                                    //禁止将节点拖拽成为根节点
                                    var  dragPro =  !(targetNode == null || (moveType != "inner" && !targetNode.parentTId));
                                    if(dragPro){
                                        if(targetNode.children != undefined){
                                            //var nodes = targetNode.children;
                                            var id = treeNodes[0].id;
                                            for (i = 0; i < targetNode.children.length; i++) {
                                                if(targetNode.children[i].id == id){
                                                    Mom.layMsg("已经存在该数据了");
                                                    return false;
                                                }
                                            }
                                        }
                                        return true;
                                    }
                                }
                                return false;
                            }
                            // 渲染ztree返回ztree对象右侧树treeObj2
                            var treeObj2 = zTreeRight.loadData($("#tree2"),da.fctrTreeArr,false,ztreeSetting2);
                            //右侧搜索查询
                            zTreeRight.registerSearch(treeObj2, '#name1', 'name');
                            //点击右侧搜索按钮
                            $('#btn-search2').click(function(){
                                zTreeRight.registerSearch(treeObj2, '#name1', 'name');
                            });
                            Bus.appendOptionsValue('#id',da.fctrList,'id','fctrName');
                            $('#btn-search').click(function(){
                                arr = [];
                                var id = $('#id').val();
                                arr.push(id);
                                var data = {
                                    fctrId:id
                                }
                                Api.ajaxJson(Api.mtrl + "/api/fm/MtrlFctr/getTree", JSON.stringify(data), function (data) {
                                    if(data.success){
                                         treeObj2 = zTreeRight.loadData($("#tree2"),data.rows,false,ztreeSetting2);
                                    }
                                });
                            });
                            // 保存按钮
                            $('#btn-save').unbind().click(function(){
                                if(arr.length == 0){
                                    Mom.layMsg('请选择工厂');
                                    return;
                                }
                                var nodes = treeObj2.getNodes();
                                var mtrlFctr =[];
                                function getdata(array,data){
                                    data.forEach(function(item){

                                        if(item.children){
                                            var obj = {};
                                            obj.fctrId = arr[0];
                                            obj.mtrlId = item.mtrlId;
                                            obj.children = [];
                                            getdata(obj.children,item.children);
                                            array.push(obj);
                                        }
                                        else{
                                            var obj = {};
                                            obj.fctrId = arr[0];
                                            obj.mtrlId = item.mtrlId;
                                            array.push(obj);
                                        }

                                    });
                                }
                                getdata(mtrlFctr,nodes);
                                var data = {
                                    mtrlFctr:JSON.stringify(mtrlFctr)
                                }
                                Api.ajaxForm(Api.mtrl + "/api/fm/MtrlFctr/save",data, function (res) {
                                    if(res.success){
                                        Mom.layMsg(res.message);
                                    }else{
                                        Mom.layMsg(res.message);
                                    }
                                });

                            })
                        }else{
                            Mom.layMsg(da.message);
                        }
                    });

                })
            }
            load();
        }
    }
    $(function () {
        if ($('#plantMaterialAllocation').length > 0) {
            PageModule.plantMaterialAllocation()
        }
    });
})