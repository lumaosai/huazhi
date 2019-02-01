/**
 * ztree自定义组件
 * 理论上支持所有用到ztree的地方，只需要传入相关配置即可，详情查看ztree的api
 * @author Qiyh
 * @date 2018-09-23
 */
define(function(require){
    /**
     * 使用同步加载依赖
     * zTree.all.js是完整的js库，可单纯加载此文件实现所有zTree功能，包含：
     * ztree.core：基本功能
     * ztree.excheck：复选功能
     * ztree.exedit：编辑功能
     */
    require('plugins/ztree/js/jquery.ztree.exhide.min');
    Mom.include('myCss_ztree', '', [
        //'../js/plugins/ztree/css/zTreeStyle/zTreeStyle.css',
        '/js/plugins/ztree/css/metroStyle/metroStyle.css'    ///metro主题
    ]);

    var that=this, lastValue, treeObj, nodataHtml="<p class='nodata mgt-30'>暂无数据</p>";

    /**
     * 使用json数据渲染ztree
     * @param ztreeDom
     * @param jsonNodes
     * @param multiple: 是否多选
     * @param settings：自定义配置，请参照ztree的api
     * @returns treeObj
     */
    var loadData = function(ztreeDom, jsonNodes, multiple, settings){
        var ztreeSt = this.ztreeSetting(multiple, settings);
        treeObj = $.fn.zTree.init(ztreeDom, ztreeSt, jsonNodes);
        $(ztreeDom).find('.nodata').remove();
        if(jsonNodes && jsonNodes.length > 0){
            if(settings && settings.defaultVals){
                checkDefaultVal(treeObj,settings.defaultVals);
            }
        }else{
            $(ztreeDom).append(nodataHtml);
        }
        registerSearch(treeObj, $('#ztree_searchText'), 'name');
        return treeObj;
    };

    /**
     * 异步加载ztree
     * @param ztreeDom
     * @param asyncUrl：接口url:''，如果需要传参请在setting配置autoParam或otherParam，详情查看api
     * @param multiple: 是否多选
     * @param settings：自定义配置，请参照ztree的api
     * @returns treeObj
     */
    var loadJsonAsync = function(ztreeDom, asyncUrl, multiple, settings){
        var ztreeSt = ztreeSettingAsync(multiple, asyncUrl, {
            async: {contentType: "application/json"}
        },settings.defaultVals);
        ztreeSt = $.extend(true,{},ztreeSt,settings);
        treeObj = $.fn.zTree.init(ztreeDom, ztreeSt);
        if(settings && settings.defaultVals){
            checkDefaultVal(treeObj,settings.defaultVals);
        }
        registerSearch(treeObj, $('#ztree_searchText'), 'name');
        return treeObj;
    };

    /**
     * 异步加载ztree
     * @param ztreeDom
     * @param asyncUrl：接口url:''，如果需要传参请在setting配置autoParam或otherParam，详情查看api
     * @param multiple: 是否多选
     * @param settings：自定义配置，请参照ztree的api
     * @returns treeObj
     */
    var loadFormAsync = function(ztreeDom, asyncUrl, multiple, settings){
        var ztreeSt = ztreeSettingAsync(multiple, asyncUrl, {
            async: {contentType: "application/x-www-form-urlencoded"}
        },settings.defaultVals);
        ztreeSt = $.extend(true,{},ztreeSt,settings);
        treeObj = $.fn.zTree.init(ztreeDom, ztreeSt);
        if(settings && settings.defaultVals){
            checkDefaultVal(treeObj,settings.defaultVals);
        }
        registerSearch(treeObj, $('#ztree_searchText'), 'name');
        return treeObj;
    };

    /**
     * 查询/搜索节点
     * @param treeObj_
     * @param prop：字段
     * @param value：值
     */
    var searchNodes = function(treeObj_, prop, value){
        var ztreeDom = $('#'+treeObj_.setting.treeId);
        // 如果和上次一样，就退出不查了。
        if (lastValue === value) {
            return;
        }
        // 保存最后一次输入的值
        that.lastValue = value;

        var nodes = treeObj_.getNodes();
        // 如果要查空字串，就退出不查了。
        if (value == "") {
            showNodesAndChild(treeObj_, nodes);
        }else{
            hideAllNodes(treeObj_, nodes);
            nodes = treeObj_.getNodesByParamFuzzy(prop, value);
        }
        $(ztreeDom).find('.nodata').remove();
        if(nodes.length == 0){
            $(ztreeDom).append(nodataHtml);
        }else{
            showNodesAndParent(treeObj_, nodes);
        }
    };

    //显示节点及其所有子节点
    var showNodesAndChild = function(treeObj_, nodes){
        var nodes = treeObj_.transformToArray(nodes);
        for(var i=nodes.length-1; i>=0; i--) {
            /* if(!nodes[i].isParent){
             treeObj_.showNode(nodes[i]);
             }else{ */
            if(nodes[i].getParentNode()!=null){
                treeObj_.expandNode(nodes[i],false,false,false,false);
            }else{
                treeObj_.expandNode(nodes[i],true,true,false,false);
            }
            treeObj_.showNode(nodes[i]);
            showNodesAndChild(treeObj_, nodes[i].children);
            // }
        }
    };

    //显示节点及其所有父节点
    function showNodesAndParent(treeObj_, nodeList) {
        treeObj_.showNodes(nodeList);
        for(var i=0, l=nodeList.length; i<l; i++) {
            //展开当前节点的父节点
            treeObj_.showNode(nodeList[i].getParentNode());
            //treeObj.expandNode(nodeList[i].getParentNode(), true, false, false);
            //显示展开符合条件节点的父节点
            while(nodeList[i].getParentNode()!=null){
                treeObj_.expandNode(nodeList[i].getParentNode(), true, false, false);
                nodeList[i] = nodeList[i].getParentNode();
                treeObj_.showNode(nodeList[i].getParentNode());
            }
            //显示根节点
            treeObj_.showNode(nodeList[i].getParentNode());
            //展开根节点
            treeObj_.expandNode(nodeList[i].getParentNode(), true, false, false);
        }
    }

    //隐藏所有节点
    var hideAllNodes = function(treeObj_, nodes){
        var nodes = treeObj_.transformToArray(nodes);
        treeObj_.hideNodes(nodes);
    };

    /**
     * ztree配置
     * @param multiple: 是否多选
     * @param settings
     * @returns
     */
    var ztreeSetting = function(multiple, settings){
        that.multiple = multiple==true||multiple=='true';
        var setting = {
            check: {enable:that.multiple},
            view: {selectedMulti:false, dblClickExpand:false, nameIsHTML:true},
            data: { simpleData:{enable:true, idKey:'id', pIdKey:'pId'} },
            callback:{
                beforeClick:function(treeId, node, clickFlag){
                    // treeObj = $.fn.zTree.getZTreeObj(treeId);
                    // if(that.multiple == true){
                    //     treeObj.checkNode(node, !node.checked, true, true);
                    //     return false;
                    // }
                }
                ,onClick:function(event, treeId, treeNode){
                    // treeObj = $.fn.zTree.getZTreeObj(treeId);
                    // treeObj.expandNode(treeNode);
                }
                ,onCheck: function(event, treeId, treeNode){
                    treeObj = $.fn.zTree.getZTreeObj(treeId);
                    var nodes = treeObj.getCheckedNodes(true);
                    for (var i=0, l=nodes.length; i<l; i++) {
                        treeObj.expandNode(nodes[i], true, false, false);
                    }
                    return false;
                }
            }
        };
        if(that.multiple){
            setting.check.chkboxType = { "Y":"p", "N":"s" };
        }
        if(settings){
            setting = $.extend(true,{},setting,settings);
        }
        return setting;
    };

    /**
     * ztree异步配置
     * @param multiple: 是否多选
     * @param asyncUrl
     * @param settings
     */
    var ztreeSettingAsync = function(multiple, asyncUrl, settings, defaultVals){
        var asyncSetting = ztreeSetting(multiple, {
        async: {
                enable:true, url:asyncUrl, autoParam:["id"],
                headers:{
                    Accept: "application/json; charset=utf-8",
                    Authorization: Mom.getCookie('token_type') + ' ' + Mom.getCookie('authorization')
                }
            },
            callback: {
                onAsyncSuccess: function(event, treeId, treeNode, msg){
                    treeObj = $.fn.zTree.getZTreeObj(treeId);
                    if(treeNode){
                        var nodes = treeNode.children;
                        for (var i=0; i<nodes.length; i++) {
                            try{treeObj.checkNode(nodes[i], treeNode.checked, true);}catch(e){}
                        }
                        //展开时设置子节点选中状态
                        checkDefaultVal(treeObj, defaultVals);
                    }
                }
            }
        });
        if(settings){
            asyncSetting = $.extend(true,{},asyncSetting,settings);
        }
        return asyncSetting;
    };

    registerSearch = function(treeObj, searchDom, prop){
        $(searchDom).keyup(function(e){
            searchNodes(treeObj, prop, $(this).val());
        });
        $(searchDom).parent().find('.searchAll').click(function(){
            $(searchDom).trigger("keyup");
        });
    };

    /**
     * 设置选中默认值
     * @param defaultVals：默认值对象{value:'1,2,3',prop:'id'}
     */
    var checkDefaultVal = function(treeObj, defaultVals){
        if(!defaultVals)return;
        var valueArr=[], param='id';
        if(Object.prototype.toString.call(defaultVals) === '[object Array]'){
            valueArr = defaultVals;
        }
        else if(typeof(defaultVals) == 'object'){
            valueArr = (defaultVals.value||'').split(',');
            param = defaultVals.prop||'id';
        }else{
            valueArr = defaultVals.split(',');
        }
        if(valueArr.length > 0){
            var nodeArr = [];
            for(var j=0; j<valueArr.length; j++){
                if(0 <valueArr[j].length){
                    var nodes = treeObj.getNodesByParam(param, valueArr[j], null);
                    if(nodes.length > 0){
                        nodeArr.push(nodes[0]);
                    }
                }
            }
            for (var i=0; i<nodeArr.length; i++) {
                if(nodeArr[i]){
                    if(treeObj.setting.check.enable == true){
                        treeObj.checkNode(nodeArr[i], true, false);
                    }else{
                        treeObj.selectNode(nodeArr[i]);
                    }
                    treeObj.expandNode(nodeArr[i].getParentNode(), true, false, true);
                }

            }
        }
    }

    /**
     * 在外部窗口中获取treeSelect页面选中的值
     *
     * noRoot:是否可选择根节点 （true/false）
     * onlyLeaf:是否只能选择叶子节点（true/false）
     * @return:
     *    success:[boolean]成功/失败
     *    id: 选择的id，多个时用逗号隔开
     *    name: 选择的name，多个时用逗号隔开
     */
    var getCheckValues=function(noRoot, onlyLeaf){
        onlyLeaf = onlyLeaf==true||onlyLeaf=='true';
        noRoot = noRoot==true||noRoot=='true';

        var ids=[], names=[], selNodes=[], retNodes=[], success=true;
        if (treeObj.setting.check.enable == true) {
            selNodes = treeObj.getCheckedNodes(true);
        } else {
            selNodes = treeObj.getSelectedNodes();
        }
        for (var i = 0; i < selNodes.length; i++) {
            var selNode = selNodes[i];
            if (onlyLeaf == true && selNode.isParent) {
                // 如果为复选框选择，则过滤掉父节点
                Mom.layMsg("不能选择父节点（" + selNode.name + "）请重新选择。");
                success=false;
                break;
            }
            if (noRoot == true && selNode.level == 0) {
                Mom.layMsg("不能选择根节点（" + selNode.name + "）请重新选择。");
                success=false;
                break;
            }
            ids.push(selNode.id);
            names.push(selNode.name);
            retNodes.push(selNode);
            if (that.multiple != true) { //如果不是复选框选择，则返回第一个选择
                break;
            }
        }
        if(success && ids.length == 0){
            Mom.layMsg("您没有选择任何数据.");
            success = false;
        }
        var selResult = {
            success: success,
            id: ids.join(",").replace(/u_/ig, ""),
            name: names.join(","),
            nodes: retNodes,
            zTreeObj: treeObj
        };
        console.log('选中结果：', selResult);
        return selResult;
    };

    //在被依赖回调中使用new ZTree()来创建对象
    return function(){
        this.ztreeSetting = ztreeSetting;
        this.ztreeSettingAsync = ztreeSettingAsync;

        this.loadData = loadData;
        this.loadJsonAsync = loadJsonAsync;
        this.loadFormAsync = loadFormAsync;
        this.searchNodes = searchNodes;
        this.showNodesAndChild = showNodesAndChild;
        this.showNodesAndParent = showNodesAndParent;
        this.hideAllNodes = hideAllNodes;

        this.registerSearch = registerSearch;
        this.checkDefaultVal = checkDefaultVal;
        this.getCheckValues = getCheckValues;
    }

});