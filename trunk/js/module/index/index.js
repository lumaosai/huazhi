require(['/js/zlib/app.js'], function(App) {
    require(['checkUser']);
    var PageModule = {
        //页面初始化
        init: function(){
            $("#userName .userName").text(unescape(Mom.getCookie('userName'))+"!");
            $("#userName .job").text(unescape(Mom.getCookie('job')));
            $("#userName .time").text(Mom.localDate+" "+ Mom.localWeek);
            $('.num').hide();

            $(".content-tabs").click(function () {
                $("body").addClass('nav-mini');
            });

            //退出
            $("#quit-btn").click(function(){
                Mom.delCookie("authorization");
                Mom.delCookie("token_type");
                location.href="../login.html";
            });

            //加载菜单效果
            require(['inspinia','tabsNav'], function(InspiniaObj){
                //初始化菜单
                TabsNav.menuInit();
                //显示主题设置
                // InspiniaObj.themeConfig();
                $(".alarm-message").click(function () {
                    TabsNav.openTab('通知列表','mes/information.html');
                   /* TabsNav.openTab({url:"../information.html",id:'alarmList',title:"通知列表"},1);*/
                });
                $(".icon").click(function () {
                    TabsNav.openTab("更改密码","systemSettings/changePassword.html");
                });
            });
        },
        //获取通知数
        getAlertNum: function(){
            $.ajax({
                headers:{
                    Accept: "application/json; charset=utf-8",
                    Authorization: Mom.getCookie("token_type")+" " +Mom.getCookie("authorization")
                },
                type: "post",
                url: Const.admin+"/api/mes/AlertMsg/alarm",
                data: '',
                dataType: 'json',
                contentType:'application/x-www-form-urlencoded',
                success: function(result){
                    if(result.success){
                        $('.num').removeClass('hidden');
                        if(result.rows.length>9&&result.rows.length<99) {
                            $('.num').text(result.rows.length).addClass('numberafter')
                        }else if(result.rows.length>99){
                            $('.num').text(99).addClass('number')
                        }else{
                            $('.num').text(result.rows.length)
                        }
                    }
                },
                error:function(){
                    // layer.close(layerIndex);
                    Mom.layMsg('请求服务器异常.');
                }
            });
        }
    };


    $(function(){
        PageModule.init();
        PageModule.getAlertNum();
    });

});

