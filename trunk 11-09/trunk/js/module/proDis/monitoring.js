require(['/js/zlib/app.js'], function(App) {
    Mom.include('my1_js','/js/plugins/',[
        'websocket/sockjs.min.js',
        "websocket/stomp.min.js"
    ]);

    var PageModule = {
        init:function(){
            $(".reportingTime").empty().html(PageModule.getShortDate()+"  "+PageModule.getLocalTime());
            PageModule.connect();
        },
        connect:function(){
            var tryConnCount = 3;
            var socket = new SockJS(Api.aps + '/endpointMonitor'); //链接SockJS 的endpoint 名称为"/endpointWisely"
            stompClient = Stomp.over(socket);//使用stomp子协议的WebSocket 客户端
            stompClient.connect({},
                function connectCallback(frame) {//链接Web Socket的服务端。
                    $('#wsConnError').hide();
                    //连接成功后，客户端可使用 send() 方法向服务器发送信息：
                    PageModule.sendName();
                    stompClient.subscribe('/topic/getAccidentResponse',function(respnose){ //订阅/topic/getResponse 目标发送的消息。这个是在控制器的@SendTo中定义的。
                        var result = JSON.parse(respnose.body);
                        if(result.success==true){
                            PageModule.showResponse(result.page.rows);
                        }else{
                            top.layer.alert(result.message);
                        }
                    });
                },
                function errorCallBack (error) {
                    // 连接失败时（服务器响应 ERROR 帧）的回调方法
                }
            )
        },
        sendName:function(){
            stompClient.send("/accidentMonitor", {}, JSON.stringify({ 'name': "" }));
        },
        showResponse:function(page){
            var str1 = str2 = str3 = 0;
            for(var i=0;i<page.length;i++){
                if(page[i].status == "0"){        //上报
                    str1 += 1;
                    $(".col-1ab394 span").text(str1)
                }else if(page[i].status == "1"){  //处理
                    str2 += 1;
                    $(".wait span").text(str2)
                }else if(page[i].status == "2"){
                    str3 += 1;
                    $(".btn-cacel span").text(str3)
                }
                page[i].updateDate = PageModule.timestampToTime(page[i].updateDate);
            }
            PageModule.createTable(page)
        },
        createTable:function(dataTable){
            $('#treeTable').dataTable({
                "data": dataTable,
                "aoColumns": [
                    {"data": null, 'sClass': " center authName","width":'8%'},
                    {"data": "event", 'sClass': " center authName","width":'27%'},
                    {"data": "cause", 'sClass': "center ","width":'30%'},
                    {"data": "reportUser", 'sClass': "center ","width":'10%'},
                    {"data": "reportTime", 'sClass': "center ","width":'15%'},
                    {"data": "status",'order':false,"defaultContent": "", 'sClass': "center","width":'10%',
                        "render":function (data,type,row,meta) {
                            var html = "";
                            if(row.status=="0"){
                                var setText = "上报";
                                var setClass = 'col-1ab394';
                                html = "<span class='"+setClass+"'><i class='fa fa-check-circle'></i>"+setText+"</span>";
                            }else if(row.status=="1"){
                                var setText = "处理中";
                                var setClass = 'col-ffa82d';
                                html = "<span class='"+setClass+"'>"+setText+"</span>";
                            }else if(row.status=="2"){
                                var setText = "关闭";
                                var setClass = 'btn-cacel';
                                html = "<span class='"+setClass+"'><i class='fa fa-times-circle'></i>"+setText+"</span>";
                            }
                            return html;
                        }
                    },
                ],
                "fnDrawCallback" : function(){
                    this.api().column(0).nodes().each(function(cell, i) {
                        cell.innerHTML =  i + 1;
                    });
                },
            });
        },
        timestampToTime:function (timestamp) {
            var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
            Y = date.getFullYear() + '-';
            M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()) + '-';
            D = (date.getDate() +1 < 10 ? '0'+(date.getDate()+1) : date.getDate()) + ' ';
            h = date.getHours() +1 < 10 ? '0'+(date.getHours()+1) : date.getHours() + ':';
            m = date.getMinutes() +1 < 10 ? '0'+(date.getMinutes()+1)+ ':' : date.getMinutes() + ':';
            s = date.getSeconds()+1 < 10 ? '0'+(date.getSeconds()+1) : date.getSeconds();
            return Y+M+D+h+m+s;
        },
        getShortDate:function (){
            return PageModule.getLocalDate().replace('年','-').replace('月','-').replace('日','');
        },
        getLocalDate:function (){
            var objD = new Date();
            var yy = objD.getFullYear();
            if (yy < 1900) yy = yy + 1900;
            var MM = objD.getMonth() + 1;
            if (MM < 10) MM = '0' + MM;
            var dd = objD.getDate();
            if (dd < 10) dd = '0' + dd;
            return yy + "年" + MM + "月" + dd + "日";
        },
        getLocalTime:function (){
            var objD = new Date();
            var hh = objD.getHours();
            if (hh < 10) hh = '0' + hh;
            var mm = objD.getMinutes();
            if (mm < 10) mm = '0' + mm;
            var ss = objD.getSeconds();
            if (ss < 10) ss = '0' + ss;
            return hh + ":" + mm + ":" + ss;
        }

    };
    $(function(){
        if($("#monitoring").length>0){
            PageModule.init();
        }
    })
});

