require(['/js/zlib/app.js'], function(App) {
    //获取参数
    var multiple = Mom.getUrlParam('multiple')||'false';//是否多选
    var noRoot = Mom.getUrlParam('noRoot')||'false';//是否不能选择根节点
    var onlyLeaf = Mom.getUrlParam('onlyLeaf')||'false';//是否只能选择叶子节点
    var showSearch = Mom.getUrlParam('showSearch')||'true';//是否显示搜索框
    var oper = Mom.getUrlParam('oper')||''; //Bus.openSelUserWin2()
    if(showSearch!='true' || oper=='user'){
        $('.searchGroup').hide();
    }
    //加载ztree插件
    require(['ztree_my'], function(ZTree) {
        var ztree = new ZTree();
        window.loadDataFn = function (url, data, defaultVals,setting) {
            Api.ajaxForm(url, data, function (result) {
                if (result.success) {
                    if(oper == 'user'){
                        //异步获取部门下的用户
                        setting = $.extend(true,{},setting||{},{
                            callback: {
                                beforeExpand: function(treeId, treeNode){
                                    var treeObj = $.fn.zTree.getZTreeObj(treeId);
                                    if(treeNode.type!='1'){
                                        var queryUserParam = JSON.stringify({
                                            deptId: treeNode.id
                                        });
                                        Api.ajaxJson(Api.admin+"/api/sys/SysUser/list",queryUserParam,function(userResult){
                                            if(userResult.success){
                                                treeObj.addNodes(treeNode, userResult.rows);
                                                ztree.checkDefaultVal(treeObj, defaultVals);
                                            }else{
                                                Mom.layAlert(userResult.message);
                                            }
                                        });
                                    }
                                }
                            }
                        });
                        if(multiple == 'false'){
                            setting.check = {
                                enable: true,
                                chkStyle: "radio"
                            }
                        }
                    }
                    var treeObj = ztree.loadData($('#tree'), result.rows, multiple, setting);
                    if(oper == 'user'){
                        //如果是选择用户，默认初始化加载出来的是机构不允许勾选
                        var nodes = treeObj.transformToArray(treeObj.getNodes());
                        for (var i=0; i<nodes.length; i++) {
                            nodes[i].isParent = true;
                            nodes[i].nocheck = true;
                            treeObj.updateNode(nodes[i]);
                        }
                    }
                    ztree.checkDefaultVal(treeObj, defaultVals);
                } else {
                    Mom.layMsg(result.message);
                }
            });
        };
        window.getCheckValues = function() {
            var treeObj = ztree.treeObj;
            return ztree.getCheckValues(noRoot, onlyLeaf);
        }

        //检测到获取配置后执行
        var timer = setInterval(function(){
            if(treeSelectCfg == true){
                //立即调用，加载数据
                loadDataFn(url, data, defaultVals, setting);
                clearInterval(timer);
            }
        },500);

    });

});