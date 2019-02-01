require(['/js/zlib/app.js'], function(App) {
    //引入用户登录校验
    require(['checkUser']);
    Mom.include('my1_js','/js/plugins/',[
        'websocket/sockjs.min.js',
        "websocket/stomp.min.js"
    ]);

    var PageModule = {
        listInit: function(){
            connect();   //webscoket连接
            var userId = Mom.getCookie("loginUserid");
            //获取工序数据
            Bus.createSelect(Api.admin+'/api/sys/SysAuthProperty/getAttributeValue/'+userId+'/GXJQ/syswp',$('#process'),'value','name');
            //获取分类数据
            Bus.createSelect(Api.admin +'/api/sys/SysDict/type/directiveCassifyType',$('#classify'));
            //获取班次数据
            loadShift();

            require(['Page'],function() {
                window.pageLoad = function () {
                    var exctTime = $("#startDateParam").val();
                    var time = $("#time").val()==""?"":$("#time option:selected").text();
                    var temp,startTime,endTime;
                    if(time!=""){
                        temp = time.split("(")[1].split(")")[0];
                        startTime = temp.split("-")[0];
                        endTime = temp.split("-")[1]=="00:00:00"?"24:00:00":temp.split("-")[1];
                        startTime = exctTime +" "+ startTime;
                        endTime = exctTime + " "+endTime;
                    }else{
                        startTime = exctTime;
                        endTime = "";
                    }
                    var data = {
                        startTime:startTime, //开始时间
                        endTime:endTime, //结束时间
                        issuedTime:exctTime,//下达时间
                        proc:$("#process option:selected").val()==""?"":$("#process option:selected").val(),            //工序
                        kind:$("#classify option:selected").val()=="-- 全部 --"?"":$("#classify option:selected").val(),            //分类
                        contentParam:$(".name").val(),  //指令
                        status: Validator.getCheckboxValue('status')               //状态
                    };

                    var page = new Page();
                    page.init(Api.aps+"/api/ctrl/DirectiveDetail/queryPage", data, true, function (tableData) {
                        createTable(tableData);
                    });

                    //查询按钮
                    $("#reset-btn").click(function () {
                        Mom.clearForm('.toolbar-form');
                        Validator.setCheckboxValue('status','');
                        page.reset(["startTime","endTime","proc","kind","contentParam","status"]);

                    });
                };
                pageLoad(true);
            });

            //获取班次数据
            function loadShift(){
                var url_ = Api.aps+'/api/ctrl/Shift/list';
                Api.ajaxJson(url_, {}, function(result) {
                    if (result.success) {
                        var rows = result.rows;
                        var options = new Array();
                        $(rows).each(function (i, o) {
                            var label = o['name'] + '(' + o['startTime'] + '-' + o['endTime'] + ')';
                            options.push({'value': o['id'], 'label': label});
                        });
                        Bus.appendOptions($('#time'), options);
                    } else {
                        Mom.layMsg(result.message);
                    }
                })
            }

            //创建table
            function createTable(data) {
                //  datatables使用ajax
                $('#treeTable').dataTable({
                    "data": data,
                    "aoColumns": [
                        {"data": "id", 'sClass':"id hidden"},//id设置为隐藏
                        {"data": "kind", 'sClass':"id hidden"},
                        {"data": "proc", 'sClass':"id hidden"},
                        {"data": "oneContent",'width':"17%", 'sClass': " center authName"},
                        {"data": "twoContent",'width':"17%", 'sClass': "center "},
                        {"data": "threeContent", 'width':"17%",'sClass': "center"},
                        {"data": "issuedTime",'width':"13%", 'sClass': "center"},
                        {"data": "issuedUser",'width':"9%", 'sClass': "center"},

                        {
                            "data": " ", 'order': false, "defaultContent": "",'width':"9%", 'sClass': "center",
                            "render": function (data, type, row, meta) {
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
                                    html = "<span class='btn-await1'><i class='fa fa-times-circle'></i>"+setText+"</span>";
                                }
                                return html;
                            }
                        }, //状态
                        {
                            "data": " ", 'order': false, "defaultContent": "", 'width':"18%",'sClass': "center",
                            "render": function (data, type, row, meta) {
                                var html = "";
                                if (row.status == "cancel") {
                                    html = ""
                                } else if (row.status == "finish") {
                                    html = ""
                                } else if (row.status == "stop") {
                                    html = ""
                                } else if (row.status == "wait") {
                                    html = "<a class='btn btn-review1 btn-operate btn-stop'><i class='fa fa-play'></i>停止指令</a >" +
                                        "<a class='btn btn-review btn-operate btn-end'><i class='fa fa-power-off'></i>取消指令</a >";
                                }
                                return html;
                            }
                        },
                    ]
                });
                renderIChecks();
                clickHandler();
            }
            //点击事件
            function clickHandler() {
                //停止指令
                $(".btn-operate").click(function (e) {
                    var data = {
                        ids:this.parentNode.parentNode.firstElementChild.textContent
                    };
                    Api.ajaxForm(Api.aps+"/api/ctrl/DirectiveIssued/directiveStop",data,function (result) {
                        if(result.success){
                            pageLoad();
                            sendName();
                        }else{
                            Mom.layMsg(result.message);
                        }
                    })
                });
                //取消指令
                $(".btn-end").click(function () {
                    var data = {
                        ids:this.parentNode.parentNode.firstElementChild.textContent
                    };
                    Api.ajaxForm(Api.aps+"/api/ctrl/DirectiveIssued/directiveCancel",data,function (result) {
                        if(result.success){
                            pageLoad();
                            sendName();
                        }else{
                            Mom.layMsg(result.message);
                        }
                    })
                });
                //值班指令
                $("#duty").click(function () {
                    Api.ajaxJson(Api.aps+"/api/ctrl/DirectiveDetail/queryZbzlPage",{},function (result) {
                        var data = result.page.rows;
                        createTable(data)
                    })
                });
            }
            // 开启socket连接
            function connect() {
                var socket= new SockJS(Api.aps +'/endpointWisely'); //链接SockJS 的endpoint 名称为"/endpointWisely"
                stompClient = Stomp.over(socket);
                stompClient.connect({}, function (frame) {
                });
            }
            function sendName() {
                //通过stompClient.send 向/welcome 目标 发送消息,这个是在控制器的@messageMapping 中定义的。
                stompClient.send("/directiveMonitor", {}, JSON.stringify({'name': ""}));
            }
            if($('#startDateParam').val() === '' ) {
                $('#class-hidden').css('display','none')
            }else{
                $('#class-hidden').css('display','block')
            }
            $('#startDateParam').change(function(){
                if($('#startDateParam').val() === '' ) {
                    $('#class-hidden').css('display','none')
                }else{
                    $('#class-hidden').css({
                        display:'block',
                        display:'inline-block'
                    })
                }
            })

        },

    };

    $(function(){
        //指令跟踪
        if($('#ordertailafter').length > 0){
            PageModule.listInit();
        }

    });
});