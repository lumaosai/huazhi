require(['/js/zlib/app.js'], function(App) {
    //引入用户登录校验
    require(['checkUser']);
    Mom.include('my1_css','/css/',[
        'customDataTable.css',
    ]);
    Mom.include('my1_js','/js/plugins/',[
        'websocket/sockjs.min.js',
        "websocket/stomp.min.js"
    ]);

    var PageModule = {
        homePage: function(){
            $(".date").text(Mom.shortDate);
            require(['ztree_my'],function(ZTree) {
                var ztree = new ZTree();
                //得到下拉菜单的值
                function getOption() {
                    var procValue=$('#proc option:selected').val(), gradeValue=$('#grade').val(),kindValue=$('#kind').val(),contentParme=$('#contentParam').val();
                    var data={
                        "proc":procValue,
                        "grade":gradeValue,
                        "kind":kindValue,
                        "contentParam":contentParme
                    };
                    var dat=JSON.stringify(data);
                    Api.ajaxJson(Api.aps+'/api/ctrl/BaseDirective/getZTree',dat,function (da) {
                        var treeObj = zTreeInit(da.rows)
                    });
                    reloadZtree();
                    reloadZtreeinput();
                }
                function reloadZtree(item){
                    $('.rank-ul').on('change',item,function () {
                        $(".rank-ul").unbind();
                        getOption();
                        $('#treeTableBody').html("");
                    });

                }
                function reloadZtreeinput(item1){
                    $(item1).on('blur','.rank-ul',function () {
                        $(".rank-ul").unbind();
                        getOption();
                    });

                }

                getOption();
                reloadZtree('#proc',Api.aps+'/api/ctrl/BaseDirective/getZTree');
                reloadZtree('#kind','Api.aps+/api/ctrl/BaseDirective/getZTree');
                reloadZtree('#grade',Api.aps+'/api/ctrl/BaseDirective/getZTree');
                reloadZtreeinput('#contentParam',Api.aps+'/api/ctrl/BaseDirective/getZTree');

            });
            ajaxproc();
            ajaxkind();
            //写入班信息
            function renderclass(){
                //获取当前时间
                Api.ajaxJson(Api.aps+'/api/ctrl/DirectiveIssued/goupList',{},function (data) {
                    if(data.rows.length!==0) {
                        var groupName = data.rows[0].name;
                        var shiftName = data.rows[0].shift.name;
                        var startTime = data.rows[0].shift.startTime;
                        var endTime = data.rows[0].shift.endTime;
                        $('.groupName').text(groupName+'班');//班组
                        $('.updateDate').text(shiftName+"("+startTime + "-" + endTime+")");//班次
                    }
                });
            };

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
                                rendersun(node.id)
                            }
                        }
                    }

                };
                // zTree 的数据属性，深入使用请参考 API 文档（zTreeNode 节点数据详解）
                var zNodes = da;
                //执行ztree
                var treeObj =$.fn.zTree.init($("#tree"), setting, zNodes);
                return treeObj;
            };

            //获取工序数据
            function ajaxproc(){
                var userId = Mom.getCookie("loginUserid");
                Bus.createSelect(Api.admin+'/api/sys/SysAuthProperty/getAttributeValue/'+userId+'/GXJQ/syswp',$('#proc'), 'value', 'name');
            };
            //获取指令分类下拉框
            function ajaxkind() {
                Bus.createSelect(Api.admin+'/api/sys/SysDict/type/directiveCassifyType',$('#kind'),'value','label');
            };
            //点ztree传值id
            function rendersun(data) {
                updatason(data);
            }
            //指令下达
            $('#giveOrders').click(function () {
                giveorder();
            });
            // 右侧内容
            $(document).ready(function(){
                connect();
                var data={
                    // proc:$("#proc option:selected").val()
                };
                Api.ajaxJson(Api.aps+'/api/ctrl/DirectiveIssued/list1',JSON.stringify(data),function (data) {
                    if(data.rows.length!==0){
                        issuedUser=data.rows[0].issuedUser;
                        groupsId=data.rows[0].id;
                        shiftId=data.rows[0].shift.id;
                    }
                });

            });

            function updatason(node){
                var data={
                    "id":node
                };
                var da=JSON.stringify(data);
                Api.ajaxJson(Api.aps+"/api/ctrl/BaseDirective/rightList/",da,function(tableData){
                    $("#proc").val(tableData.pList[0].proc);
                    renderTableData(tableData);
                })
            }
            function giveorder() {
                var str="";
                var ids="";
                $("input.i-checks:checkbox").each(function(){
                    if(true == $(this).is(':checked')){
                        str+=","+$(this).attr("id");
                    }
                });
                var proc =  $("#proc").val();
                if(str.length>0){
                    ids=str.substr(1);
                    var data={
                        ids:ids,
                        issuedUser:issuedUser,
                        groupsId:groupsId,
                        shiftId:shiftId,
                        process:proc
                    };
                    var url = Api.aps + "/api/ctrl/DirectiveIssued/save/";
                    Api.ajaxJson(url,JSON.stringify(data),function(result){
                        if(result.success){
                            sendName();
                            top.layer.alert('请求成功',function () {
                                top.layer.closeAll();
                                window.location.reload();
                                parent.location.reload();
                            });
                        }else{
                            Mom.layMsg(result.message);
                        }
                    });
                }else{
                    top.layer.alert('请至少选择一条数据递交!', {icon: 0, title:'警告'});
                }
            }

            function renderHtml(id,content){
                return "<tr>" +
                    "<td class='center' >" +
                    "<input type='checkbox' id='" + id+ "' class='i-checks'>"+
                    "</td>" +
                    "<td>"+content+"</td>"+
                    "</tr>";
            }

            //渲染表
            function renderTableData(data) {
                //↓接口到后修改↓
                var tablehead=renderHtml(data.pList[0].id,data.pList[0].content);
                var datas=data.childList;
                var tableStr = "";
                for (var i =0; i < datas.length; i++) {
                    tableStr += renderHtml(datas[i].id,datas[i].content);
                }
                $('#treeTableBody').html(tablehead+tableStr);
                renderIChecks();
            }

            //重试次数
            var tryConnCount = 3;
            // webscoket连接方法
            function connect() {
                //var socket = new SockJS('/endpointWisel.y'); //链接SockJS 的endpoint 名称为"/endpointWisely"
                var socket = new SockJS(Api.aps + '/endpointWisely'); //链接SockJS 的endpoint 名称为"/endpointWisely"
                stompClient = Stomp.over(socket);//使用stomp子协议的WebSocket 客户端
                stompClient.connect({},
                    function connectCallback(frame) {//链接Web Socket的服务端。
                        //连接成功后，客户端可使用 send() 方法向服务器发送信息：
                        stompClient.subscribe('/topic/getZljkResponse',function(respnose){ //订阅/topic/getResponse 目标发送的消息。这个是在控制器的@SendTo中定义的。
                            var result = JSON.parse(respnose.body);
                            if(result.success==true){
                            }else{
                                top.layer.alert(result.message);
                            }
                        });
                    }
                );
            }
            function sendName() {
                //通过stompClient.send 向/welcome 目标 发送消息,这个是在控制器的@messageMapping 中定义的。
                stompClient.send("/directiveMonitor", {}, JSON.stringify({'name': ""}));
            }

        },

    };

    $(function(){
        //指令下达
        if($('#giveOrdersIndex').length > 0){
            PageModule.homePage();
        }

    });
});