require(['/js/zlib/app.js'], function(App) {
    //引入用户登录校验
    require(['checkUser']);

    var PageModule = {
        dictate: function(){
            $('#officeContent').attr('src','./orderCreateInner.html');
            require(['ztree_my'],function(ZTree){
                var ztree = new ZTree();
                //获取tree
                function getOption() {
                    var procValue=$('#proc').val(), gradeValue=$('#grade').val(),kindValue=$('#kind').val();
                    var data={
                        "proc":procValue,
                        "grade":gradeValue,
                        "kind":kindValue
                    };
                    var dat=JSON.stringify(data);
                    Api.ajaxJson(Api.aps+'/api/ctrl/BaseDirectiveCZ/getZTree',dat,function(da) {
                        var treeObj = zTreeInit(da.rows);
                    });
                    reloadZtree();
                }
                //选择框变更后刷新ztree数据
                function reloadZtree(item){
                    $(item).change(function () {
                        getOption();
                        $('#officeContent')[0].contentWindow.tablehide();
                    });
                }

                getOption();//获取tree
                reloadZtree('#proc','/api/ctrl/BaseDirectiveCZ/getZTtree');
                reloadZtree('#kind','/api/ctrl/BaseDirectiveCZ/getZTtree');
                reloadZtree('#grade','/api/ctrl/BaseDirectiveCZ/getZTtree');
            });

            loadGrade();
            ajaxproc();
            ajaxkind();

            $('#btn-add').click(function () {
                Bus.openEditDialog('添加指令', './proDis/opeOrderCV.html?level=1&id=""', '605px', '302px')
            });
            $("#btn-back").click(function () {
                location.href = "./opeOrderIndex.html"
            });
            function ajaxproc(){
                var userId = Mom.getCookie("loginUserid");
                Bus.createSelect(Api.admin+'/api/sys/SysAuthProperty/getAttributeValue/'+userId+'/GXJQ/syswp',$('#proc'), 'value', 'name');
            }
            //获取等级
            function loadGrade() {
                Bus.createSelect(Api.admin+'/api/sys/SysDict/type/directiveLeaveyType',$('#grade'));
            }
            //获取指令分类
            function ajaxkind() {
                Bus.createSelect(Api.admin+'/api/sys/SysDict/type/directiveCassifyType',$('#kind'));
            }

            //ztree渲染
            function zTreeInit(da) {
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
                        onClick: function (e, treeId, node){
                            if(node.id){
                                rendersun(node.id,node.level)
                            }
                        }
                    }

                };
                // zTree 的数据属性，深入使用请参考 API 文档（zTreeNode 节点数据详解）
                var zNodes = da;
                //执行ztree
                var treeObj =$.fn.zTree.init($("#tree"), setting, zNodes);
                return treeObj;
            }
            //点ztree传值id
            function rendersun(data,level) {
                $('#officeContent')[0].contentWindow.updatason(data,level);
            }
        },
        //指令操作列表
        order: function(){
            window.updatason = function (node,level){
                var data={
                    "id":node
                };
                var da=JSON.stringify(data);
                Api.ajaxJson(Api.aps+"/api/ctrl/BaseDirectiveCZ/rightList/",da,function(tableData){
                    renderTableData(tableData);
                    clickButton(level);
                })

            }
            //按钮操作集合
            function clickButton(level) {
                $('.btn-addson').click(function(){
                    var id = $(this).parents("tr").find('.i-Checks').attr('id');
                    var proc = $(this).parents("tr").find(".hide").text();
                    Bus.openEditDialog('添加下级指令','./proDis/opeOrderCV.html?pid='+id+'&proc='+proc,'605px', '302px')
                });
                $('.btn-add').click(function(){
                    var id = $(this).parents("tr").find('.i-Checks').attr('id');
                    Bus.openEditDialog('添加指令','./proDis/opeOrderCV.html?&id='+id,'605px', '302px')
                });
                $('.btn-change').click(function () {
                    var id = $(this).parents("tr").find('.i-Checks').attr('id');
                    Bus.openEditDialog('修改指令', './proDis/opeOrderCV.html?level='+level+'&id=' + id, '605px', '302px')
                });
                $('.btn-delete').click(function () {
                    var id = $(this).parents("tr").find('.i-Checks').attr('id');
                    Bus.deleteItem('确定要删除该指令吗', Api.aps+'/api/ctrl/BaseDirectiveCZ/delete/'+id);
                });

            }
            //渲染表
            function renderTableData(data) {
                if(data.pList[0].grade<3) {
                    var tablehead = "<tr>" +
                        "<td class='hide'>" + data.pList[0].proc + "</td>" +
                        "<td class='i-Checks'  id='" + data.pList[0].id + "'>" + data.pList[0].content + "</td>" +
                        "<td class='center center'>" +
                        " <a class='btn btn-target btn-addson'><i class='fa fa-edit'></i>添加子级</a>" +
                        " <a class='btn btn-delete'><i class='fa fa-trash'></i> 删除</a>" +
                        " <a class='btn btn-change'><i class='fa fa-edit'></i>修改</a>" +
                        "</td>" +
                        "</tr>";
                    var datas = data.childList;
                    var tableStr = "";
                    for (var i = 0; i < datas.length; i++) {
                        tableStr += "<tr>"
                            + "<td class='i-Checks' id='" + datas[i].id + "'>" + datas[i].content + "</td>" +
                            "<td class='center center'  >" +
                            " <a class='btn  btn-delete'><i class='fa fa-trash'></i> 删除</a>" +
                            " <a class='btn  btn-change'><i class='fa fa-edit'></i>修改</a>" +
                            "</td>"
                            + "</tr>";
                    }
                    $('#treeTableBody').html(tablehead+tableStr);
                }
                else{
                    var tablehead = "<tr>" +
                        "<td class='i-Checks'  id='" + data.pList[0].id + "'>" + data.pList[0].content + "</td>" +
                        "<td class='center'>" +
                        "<a class='btn btn-delete'><i class='fa fa-trash'></i> 删除</a>" +
                        "<a class='btn btn-change'><i class='fa fa-edit'></i>修改</a>" +
                        "</td>" +
                        "</tr>";
                    var datas = data.childList;
                    var tableStr = "";
                    for (var i = 0; i < datas.length; i++) {
                        tableStr += "<tr class='center' >"
                            + "<td class='i-Checks' id='" + datas[i].id + "'>" + datas[i].content + "</td>" +
                            "<td class='center'>" +
                            " <a class='btn  btn-delete'><i class='fa fa-trash'></i> 删除</a>" +
                            " <a class='btn  btn-change'><i class='fa fa-edit'></i>修改</a>" +
                            "</td>"
                            + "</tr>";
                    }
                    $('#treeTableBody').html(tablehead+tableStr);
                }

                Mom.setFrameHeight();
            }
            //选择框变更后是指令操作项为空
            window.tablehide = function (){
                $('#treeTableBody').html("");
            }
        },
        //指令的修改与增加
        check: function(){
            var proc = Mom.getUrlParam('proc');
            var id = Mom.getUrlParam('id');
            var pid = Mom.getUrlParam('pid');
            var level = Mom.getUrlParam('level');

            ajaxkind();//获取指令分类
            ajaxproc();//获取工序数据
            if(level){
                $('#grade').val(1);
                $('#gradeVal').val($('#grade').val());
            }
            $('#pid').val(pid);
            if(pid){
                var ids={
                    "id":pid
                };
                var url = Api.aps+"/api/ctrl/BaseDirectiveCZ/form/";
                Api.ajaxJson(url,JSON.stringify(ids), function (result) {
                    if (result.success) {
                        $('#grade').val(parseInt(result.baseDirectiveCZ.grade)+1);
                        $('#gradeVal').val($('#grade').val());
                    } else {
                        Mom.layMsg(result.message);
                    }

                });
            }
            $('#id').val(id);
            if (id) {
                /*此处后端接口  id为弹出窗口自带的id 通过浏览器方法传参得到*/
                var ids={
                    "id":id
                };
                var url = Api.aps+"/api/ctrl/BaseDirectiveCZ/form/";
                Api.ajaxJson(url,JSON.stringify(ids), function (result) {
                    if (result.success) {
                        $('#grade').val(result.baseDirectiveCZ.grade);
                        $('#gradeVal').val($('#grade').val());
                        $('#proc').val(result.baseDirectiveCZ.proc);
                        $('#kind').val(result.baseDirectiveCZ.kind);
                        $("#sort").val(result.baseDirectiveCZ.sort);
                        $("#content").val(result.baseDirectiveCZ.content);
                        $('#id').val(id);
                    } else {
                        Mom.layMsg(result.message);
                    }
                });
            }
            //获取工序数据
            function ajaxproc(){
                _id = Mom.getCookie("loginUserid");
                var url=Api.admin+'/api/sys/SysAuthProperty/getAttributeValue/'+_id+'/GXJQ/syswp';
                Api.ajaxJson(url,{},function (result) {
                    if(result.success){
                        var rows = result.rows;
                        Bus.appendOptionsValue($('#proc'), rows, 'value', 'name');
                        if(null!=level){
                            renderAll();
                        }else{
                            $("#proc option").each(function () {
                                if(proc == $(this).attr('value')){
                                    $(this).attr("selected",true);
                                    $('#proc').attr('disabled','disabled').css({"cursor":"not-allowed"});
                                    $('#proc').after('<input type="hidden" name="proc" value="'+$(this).attr('value')+'" >');
                                }
                            })
                        }
                    }else{
                        Mom.layMsg(result.message);
                    }
                });

            }

            //获取指令分类
            function ajaxkind() {
                Api.ajaxJson(Api.admin+'/api/sys/SysDict/type/directiveCassifyType',{},function (result) {
                    if(result.success){
                        var rows = result.rows;
                        Bus.appendOptionsValue($('#kind'), rows, 'label', 'label');
                        if(null!=level){
                            renderAll();
                        }
                    }else{
                        Mom.layMsg(result.message);
                    }
                });
            }

            function renderAll() {
                if (id) {
                    $('#id').val(id);
                    /*此处后端接口  id为弹出窗口自带的id 通过浏览器方法传参得到*/
                    var ids={
                        "id":id
                    };
                    var url = Api.aps+"/api/ctrl/BaseDirectiveCZ/form/";
                    Api.ajaxJson(url,JSON.stringify(ids), function (result) {
                        if (result.success) {
                            Validator.renderData(result.baseDirectiveCZ, $('#inputForm'));
                        } else {
                            Mom.layMsg(result.message);
                        }
                    });
                }
            }

        }

    };

    $(function(){
        //创建指令
        if($('#addOrder').length > 0){
            PageModule.dictate();
        }
        //指令操作列表
        else if($('#orderCreateInner').length > 0){
            PageModule.order();
        }
        //指令的修改与增加
        else if($('#opeOrderCV').length > 0){
            PageModule.check();
        }

    });
});