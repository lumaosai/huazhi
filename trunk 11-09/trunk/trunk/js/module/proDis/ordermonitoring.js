require(['/js/zlib/app.js'], function(App) {
    //引入用户登录校验
    require(['checkUser']);
    Mom.include('my1_js','/js/plugins/',[
        'websocket/sockjs.min.js',
        "websocket/stomp.min.js"
    ]);

    var PageModule = {
        listInit: function(){
            //当前时间
            $(".gettingTime").empty().html(Mom.shortDate+"  "+Mom.localTime);
            //Websocket连接
            connect();

            //重试次数
            var tryConnCount = 3;
            // webscoket连接方法
            function connect() {
                var socket = new SockJS(Api.aps +'/endpointWisely'); //链接SockJS 的endpoint 名称为"/endpointWisely"
                stompClient = Stomp.over(socket);//使用stomp子协议的WebSocket 客户端
                stompClient.connect({},
                    function connectCallback(frame) {//链接Web Socket的服务端。
                        $('#wsConnError').hide();
                        //连接成功后，客户端可使用 send() 方法向服务器发送信息：
                        sendName();
                        stompClient.subscribe('/topic/getZljkResponse',function(respnose){ //订阅/topic/getResponse 目标发送的消息。这个是在控制器的@SendTo中定义的。
                            var result = JSON.parse(respnose.body);
                            if(result.success==true){
                                showResponse(result.page);
                            }else{
                                top.layer.alert(result.message);
                            }
                        });
                    },
                    function errorCallBack (error) {
                        // 连接失败时（服务器响应 ERROR 帧）的回调方法
                        if(tryConnCount > 0){
                            $('#wsConnError').html('WebSocket连接失败，正在进行第 '+(4-tryConnCount) + ' 次重连....').show();
                            tryConnCount --;
                            connect();
                        }else{
                            $('#wsConnError').html('WebSocket连接失败. ').show();
                        }
                    }
                );
            };

            // 发送消息
            function sendName() {
                //通过stompClient.send 向/welcome 目标 发送消息,这个是在控制器的@messageMapping 中定义的。
                stompClient.send("/directiveMonitor", {}, JSON.stringify({ 'name': "" }));
                //stompClient.send("http://localhost:8083/aps-api/websocket/welcome", {}, JSON.stringify({ 'name': name }));
            }

            // 接收返回信息
            function showResponse(page) {
                var statusarr = [];
                var statusarr1 = [];
                var statusarr2 = [];
                var statusarr3 = [];
                for(var i=0;i<page.rows.length;i++){
                    if(page.rows[i].status == "cancel"){         //取消
                        statusarr.push(page.rows[i].status);
                    }else if(page.rows[i].status == "finish"){     //完成
                        statusarr1.push(page.rows[i].status);
                    }else if(page.rows[i].status == "stop"){        //停止
                        statusarr2.push(page.rows[i].status);
                    }else if(page.rows[i].status == "wait"){             //待执行
                        statusarr3.push(page.rows[i].status);
                    };
                    page.rows[i].updateDate = new Date(page.rows[i].updateDate).Format("yyyy-MM-dd hh:mm:ss");
                }
                $(".col-ffa82d span").text(statusarr3.length);   //待执行
                $(".col-1ab394 span").text(statusarr1.length);  //完成
                $(".stopbn span").text(statusarr2.length);          //停止
                $(".btn-cacel span").text(statusarr.length);   //取消
                createTable(page.rows)
            }

            //创建table
            function createTable(data){
                //  datatables使用ajax
                $('#treeTable').dataTable({
                    "data": data,
                    "aoColumns": [
                        {"data": "proc", 'sClass': " center authName"},
                        {"data": "content", 'sClass': "center"},//修改table居左
                        {"data": "",'order':false,"defaultContent": "", 'sClass': "center","width":"15%",
                            "render":function (data,type,row,meta) {
                                var html = "";
                                if (row.status == "finish") {
                                    var setText = "执行完成";
                                    html = "<span class='btn-primary1'><i class='fa fa-check-circle'></i>"+setText+"</span>";
                                } else if (row.status == "stop") {
                                    setText = "停止执行";
                                    html = "<span class='btn-stop'><i class='fa fa-exclamation-circle'></i>"+setText+"</span>";
                                } else if (row.status == "cancel") {
                                    setText = "取消执行";
                                    html ="<span class='btn-cancel'><i class='fa fa-times-circle'></i>"+setText+"</span>";
                                } else if (row.status == "wait") {
                                    setText = "待执行";
                                    html = "<span class='btn-await1'><i class='fa icon-wait'></i>"+setText+"</span>";
                                }
                                return html;
                            }
                        },
                        {"data": "issuedTime", 'sClass': "center ","width":"15%"},
                        {"data": "updateDate", 'sClass': "center ","width":"15%",
                            "render":function (data,type,row,meta) {
                                if(row.status == "wait"){
                                    var html = "<span></span>";
                                }else{
                                    var html = "<span>"+row.updateDate+"</span>";
                                };
                                return html;
                            }
                        }
                    ]
                });
                renderIChecks();
            }
            Date.prototype.Format = function (fmt) { //author: meizz
                var o = {
                    "M+": this.getMonth() + 1, //月份
                    "d+": this.getDate(), //日
                    "h+": this.getHours(), //小时
                    "m+": this.getMinutes(), //分
                    "s+": this.getSeconds(), //秒
                    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                    "S": this.getMilliseconds() //毫秒
                };
                if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
                for (var k in o)
                    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                return fmt;
            }
        },

    };

    $(function(){
        //指令监控列表
        if($('#ordermonitoring').length > 0){
            PageModule.listInit();
        }

    });
});