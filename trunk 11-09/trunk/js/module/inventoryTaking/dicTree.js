require(['/js/zlib/app.js'], function (App) {
    var PageModule = {

        dicValue:'', // 把修改计算公式配置中的计算公式保存到指标值
        formula: '', //计算公式保存带span的格式
        //字典树
        planDicInit: function () {
            $('#officeContent').attr('src', 'planDicInner.html');
            require(['easyui_my'],function(easyuiObj){
                var ztree,treeObj;
                treeGridLoad('0');
                function treeGridLoad(nodeId){
                    Api.ajaxJson(Api.aps + "/api/aps/Device/ajaxTreeJson/" + nodeId, {}, function (result) {
                        if(result.success){
                            $('#tt').treegrid({
                                idField:'id',
                                treeField:'name',
                                collapsible: true,
                                fitColumns: true,
                                singleSelect : true,
                                columns:[[
                                    {field:'name',title:'指标名称',width:180,align:'left'},
                                    {field:'code',title:'指标编码',width:150,align:'center'},
                                    {field:'val',title:'指标值',width:150,align:'left',formatter:function(value,row){
                                            return row.formula ==''?value:row.formula;
                                        }
                                    },
                                    {field:'unit',title:'指标单位',width:80,align:'center'},
                                    {field:"text",title:"操作",align:'center',width:320,formatter: function(value,row,index){
                                            if(row.types != 'column'){
                                                return "<a class='btn  btn-info btn-check' id='"+ row.id+"' data-types='"+ row.types+"'><i class='fa fa-search-plus'></i>查看</a>" +
                                                    " <a class='btn btn-success  btn-change' id='"+ row.id+"' data-types='"+ row.types+"'><i class='fa icon-change'></i>修改</a>" +
                                                    " <a class='btn bg-f75c5c btn-delete' id='"+ row.id+"' data-types='"+ row.types+"'><i class='fa fa-trash'></i> 删除</a>"  +
                                                    " <a class='btn  btn-add btn-target' id='"+ row.id+"' data-types='"+ row.types+"'><i class='fa fa-plus'></i>添加下级指标</a>";
                                            }else{
                                                return "<a class='btn  btn-info btn-check' id='"+ row.id+"' data-types='"+ row.types+"'><i class='fa fa-search-plus'></i>查看</a>" +
                                                    " <a class='btn btn-success  btn-change' id='"+ row.id+"' data-types='"+ row.types+"'><i class='fa icon-change'></i>修改</a>" +
                                                    " <a class='btn bg-f75c5c btn-delete' id='"+ row.id+"' data-types='"+ row.types+"'><i class='fa fa-trash'></i> 删除</a>";
                                            }

                                        }},
                                ]],
                                data:result,
                                onBeforeExpand:function(row){
                                    var children = $("#tt").treegrid('getChildren',row.id);
                                    if(!children || children.length==0){
                                        Api.ajaxJson(Api.aps+"/api/aps/Device/ajaxTreeJson/"+row.id,{},function(result){
                                            easyuiObj.tg_appendTreegridNode("#tt",row.id,result.rows[0].children);
                                            // $('#tt').treegrid("expand", row.id);

                                            btncilck();

                                        });
                                    }
                                }
                            });
                            if(nodeId != '0'){
                                $('#tt').treegrid('expandAll', nodeId);//展开该节点
                            }
                            btncilck();
                            easyuiObj.tg_treeGridResize('.treeGridTable');
                        } else {
                            Mom.layMsg(result.message)
                        }
                    });
                };
                require(['ztree_my'],function(ZTree){
                    ztree = new ZTree();
                    //加载左侧树
                    var setting = {
                        async:{
                            dataFilter: function(treeId, parentNode, responseData){
                                if(responseData) {
                                    $.each(responseData.rows,function(i,o){
                                        o.isParent = true;
                                    });
                                    return responseData.rows;
                                }
                                return responseData;
                            }
                        },
                        callback: {
                            onClick: function (e, treeId, node){
                                if(node.id){
                                    treeGridLoad(node.id);
                                    treeObj.expandNode(node);
                                }
                            },
                        }
                    };
                    var asyncUrl = Api.aps + '/api/aps/Device/tree';
                    treeObj = ztree.loadFormAsync($('#tree'),asyncUrl,false,setting);

                });
                function btncilck(){
                    // 查看
                    $('.btn-check').unbind().click(function () {
                        var id = $(this).attr('id');
                        var types = $(this).attr('data-types');
                        Bus.openDialog('查看指标信息', './inventoryTaking/planDicCheckView.html?id=' + id+'&types='+ types, '800px', '315px')
                    });
                    //修改
                    $('.btn-change').unbind().click(function () {
                        var id = $(this).attr('id');
                        var types = $(this).attr('data-types');
                        Bus.openEditDialog('修改指标信息', './inventoryTaking/planDicCheckView.html?id=' + id+'&types='+ types, '800px', '315px',saveCallback);
                    });
                    //删除
                    $('.btn-delete').unbind().click(function () {
                        var data = {ids: $(this).attr('id')};
                        Bus.deleteItem('确定要删除该指标吗', Api.aps + '/api/aps/Device/delete',data,deleteItemCallBack);
                    });
                    // 添加下级菜单
                    $('.btn-add').unbind().click(function(){
                        var id = $(this).attr('id');
                        var types = $(this).attr('data-types');
                        Bus.openEditDialog('添加下级菜单', './inventoryTaking/planDicCheckView.html?pid=' + id+'&types='+ types+'&initType="aa"', '800px', '315px',addSonCallback);
                    });
                }

                //添加、修改回调函数
                function saveCallback(layerIdx,layero){
                    var iframeWin = layero.find('iframe')[0].contentWindow;
                    var formData = iframeWin.getFormData();
                    if(formData){
                        var data = formData.data;
                        Api.ajaxJson(formData.url,JSON.stringify(data),function(result){
                            if(result.success == true){
                                Mom.layMsg('操作成功');
                                //更新treeGrid
                                easyuiObj.tg_editTreegridNode('#tt',result.Device.id, result.Device);
                                // btncilck();
                                //更新左侧zTree
                                var node = treeObj.getNodeByParam("id", result.Device.id, null);
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
                            if(result.success == true){
                                Mom.layMsg('操作成功');
                                //添加treeGrid节点
                                easyuiObj.tg_appendTreegridNode('#tt',parentId,result.Device);
                                btncilck();
                                //更新左侧zTree
                                var parentNode = treeObj.getNodeByParam("id",parentId, null);
                                newNode = treeObj.addNodes(parentNode,result.Device);
                                //关闭弹出层
                                top.layer.close(layerIdx);
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
        planDicCheckView:function () {
            // $('#inputForm').attr('action',Api.aps+'/api/aps/Device/save');
            var id = Mom.getUrlParam('id')||'';
            var pId = Mom.getUrlParam('pid')||'';
            var types = Mom.getUrlParam('types')||'';
            var initType = Mom.getUrlParam('initType')||'';
            $('#id').val(id);
            var targetDic = '';
            // 公式按钮
            $('#computerBtn').click(function(){
                targetDic = $('#val').val();
                Bus.openEditDialog('修改计算公式配置','./inventoryTaking/comForZtree.html?targetDic='+ escape(targetDic)+'&id='+ id,'800px', '500px',callbackFn);
                function callbackFn(index,layero){
                    var dicValue = layero.find("iframe")[0].contentWindow.getDicValue();
                    var dicformula = layero.find("iframe")[0].contentWindow.getDicformula();
                    $('#val').val(dicValue);
                    $('#formula').empty().html(dicformula);
                    return true;
                }
            });

            if (id == '' && pId == '') { //新增
                // 说明是添加 当添加时指标类型只能为空
                $('#parentIdH').val(0);
                Bus.resetSelect('#types','空');
            }else{
                var idParam = id || pId;
                Api.ajaxJson(Api.aps+"/api/aps/Device/view/"+idParam, {}, function (result) {
                    if (result.success) {
                        var deivce = result.stockTakeDevice;
                        //targetDic = deivce.val;
                        if(id != ''){ //修改
                            if(types == 'column'){
                                var typesArr = [{value:types,label:'列'}];
                                Bus.appendOptions('#types', typesArr);
                                //设置名称为下拉框
                                var html = "<select name='name' id='name' class='form-control' require='true'></select>";
                                $('#nameShow').empty().html(html);
                                //获取指标名称集合
                                Bus.appendOptionsValue('#name', result.nameList);
                            }else{
                                Bus.resetSelect('#types','空');
                                var typesArr = [{value:'row',label:'行'}];
                                Bus.appendOptions('#types', typesArr);
                            }
                            var parentid = deivce.parentId;
                            $('#parentIdH').val(parentid);
                            Validator.renderData(deivce, $('#inputForm'));
                            $('#formula').html(deivce.formula);
                            /*渲染parentName*/
                            $('#_parentId').val(result.parentName);
                        }
                        else if(pId != ''){  //添加下级指标
                            $('#parentIdH').val(deivce.id);
                            $('#_parentId').val(deivce.code);
                            //设置types只能是row
                            if(types == ''){
                                // Bus.resetSelect('#types','空');
                                var typesArr = [{value:'row',label:'行'}];
                                Bus.appendOptions('#types', typesArr);
                            }
                            //设置types只能选择'column'
                            else if(types == 'row'){
                                // Bus.resetSelect('#types','空');
                                var typesArr = [{value:'column',label:'列'}];
                                Bus.appendOptions('#types', typesArr);
                                //设置名称为下拉框
                                var html = "<select name='name' id='name' class='form-control' require='true'></select>";
                                $('#nameShow').empty().html(html);
                                //获取指标名称集合
                                Bus.appendOptionsValue('#name', result.nameList);
                            }
                        }
                    }else{
                        Mom.layAlert(result.message);
                    }
                });
            }


            window.getFormData = function(){
                if(!Validator.valid(document.forms[0],1.3)){
                    return;
                }
                var formObj = $('#inputForm');
                var dataTmp = formObj.serializeJSON();
                dataTmp.formula = $('#formula').html();
                return {
                    url:formObj.attr('action'),
                    data: dataTmp
                }

            };

            window.doSubmit1 = function(iframeWin, iframeBody, layerIdx){

            };
        },
        /**计算内页*/
        //初始化ztree页面
        comForZtree: function () {
            window.getDicValue = function(){
                return PageModule.dicValue;
            };
            window.getDicformula = function(){
                return PageModule.formula;
            };
            PageModule.dicValue = ''; //定义全局
            PageModule.formula = ''; //定义全局

            var targetDic = Mom.getUrlParam('targetDic');
            //$('#paramRecord').html(targetDic);
            //$('#inputForm').attr('action', Api.aps + '/api/aps/Formula/save');
            var id = Mom.getUrlParam('id');
            var paramRecord = $("#paramRecord"),
                html = "", htmlArr = [], inputArr = [];
            if (id) {
                $("#objId").val(id);
                Api.ajaxForm(Api.aps + "/api/aps/Device/view/" + id, {}, function (result) {
                    if (result.success) {
                        var Formula = result.stockTakeDevice,
                            str = Formula.formula;
                        //Validator.renderData(Formula, $('#inputForm'));
                        $("#paramRecord").html(str);
                        html = str;
                        if(str == ''){
                        }else{
                            htmlArr = Formula.formula.match(/<[^>]+>([^<]+)<\/[^>]+>/g);
                            PageModule.formulaHiddenValue(inputArr, htmlArr);
                        }


                    }
                })
            }
            renderHtml(html, htmlArr, inputArr);
            function setFontCss(treeId, treeNode) {
                return treeNode.type != 'column' ? {color:"#ccc"} : {};
            }

            require(['ztree_my'],function(ZTree){
                var ztree = new ZTree();
                var setting = {
                    view: {
                        fontCss: setFontCss // 设置颜色
                    },
                    async:{
                        dataFilter: function(treeId, parentNode, responseData){
                            if(responseData) {
                                $.each(responseData.rows,function(i,o){
                                    o.isParent = true;
                                });
                                return responseData.rows;
                            }
                            return responseData;
                        }
                    },
                    callback: {
                        // onClick: zTreeOnDblClick
                        onClick: function (e, treeId, node){
                            if(node.id){
                                zTreeObj.expandNode(node);
                                if(node.type == 'column'){
                                    html += "<span>" + node.name + "</span>";
                                    htmlArr.push(node.name);
                                    inputArr.push(node.nameCode);
                                    renHtmlFn(html, inputArr);
                                }else{
                                    Mom.layAlert('灰色字段不可选,请选择其它配置公式');
                                }
                            }
                        },
                    }
                };
                var asyncUrl = Api.aps + '/api/aps/Device/tree';
                zTreeObj =ztree.loadFormAsync($('#tree'),asyncUrl,false,setting);
            });
            function renderHtml() {
                $(".paramTag span").click(function () {
                    if ($(this).hasClass("clearAll")) {
                        html = "";
                        htmlArr = [];
                        inputArr = [];
                        renHtmlFn(html, htmlArr);
                    } else if ($(this).hasClass("clearOne")) {
                        html = "";
                        htmlArr.pop();
                        inputArr.pop();
                        var len1 = htmlArr.length;
                        for (var i = 0; i < len1; i++) {
                            html += htmlArr[i];
                        }
                        renHtmlFn(html, inputArr)
                    } else {
                        html += "<span>" + $(this).html() + "</span>";
                        //html += $(this).html();
                        htmlArr.push($(this).html());
                        inputArr.push($(this).html());
                        renHtmlFn(html, inputArr);

                    }

                });
            }

            //将htmlArr、inputArr数组中的元素遍历之后作为paramRecordHide、paramRecordShow的值插入。
            function renHtmlFn(html, inputArr) {
                $("#paramRecord").html(html);
                //PageModule.dicValue = html; //定义全局
                var inputHtml = "";
                var len = $(inputArr).length;
                if (len > 0) {
                    for (var i = 0; i < len; i++) {
                        inputHtml += inputArr[i];
                        $("#paramRecordHide").empty().val(inputHtml);
                        PageModule.dicValue = inputHtml; //定义全局
                    }
                } else {
                    $("#paramRecordHide").empty().val("");
                    PageModule.dicValue = ''; //定义全局
                }
                $("#paramRecordShow").val(html);
                PageModule.formula = html; //定义全局

            }


        },
        //加载数据之后获取隐藏元素paramRecordHide的值，使用正则将匹配后的元素放入到inputArr数组中。
        formulaHiddenValue: function (inputArr, htmlArr) {
            for (var i = 0; i < htmlArr.length; i++) {
                var h = htmlArr[i].replace('<span>', '').replace('</span>', '');
                var m = h.match(/\[(.+)\]/g);
                if (m && m.length > 0) {
                    var ss = m[0];
                    ss = ss.substr(1, ss.length - 2);
                    inputArr.push(ss);
                } else {
                    inputArr.push(h);
                }
            }
        }
    };
    $(function () {
        //参数配置列表
        if ($('#dicTree').length > 0) {
            PageModule.planDicInit()
        }else if($('#planDicCheckView').length > 0){
            PageModule.planDicCheckView()
        }else if($('#comForZtree').length > 0){
            PageModule.comForZtree()
        }
    });

})
;
