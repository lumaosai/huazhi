require(['/js/zlib/app.js'], function(App) {

    //引入用户登录校验
    // require(['checkUser']);

    //引入样式文件
    Mom.include('myCss_index','',[
        'js/plugins/metismenu/metisMenu.css',
        'css/index.css',
    ]);


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
                    TabsNav.toParentTab({url:"../information.html",id:'alarmList',title:"通知列表"},1);
                });
                $(".icon").click(function () {
                    TabsNav.toParentTab({url:"systemSettings/changePassword.html",id:"changePassword",title:"更改密码"},1);
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
                url: Api.admin+"/api/mes/AlertMsg/alarm",
                data: '',
                dataType: 'json',
                contentType:'application/x-www-form-urlencoded',
                success: function(result){
                    $('.num').show();
                    if(result.success){
                        if(result.rows.length>9&&result.rows.length<99) {
                            $('.num').text(result.rows.length).addClass('numberafter')
                        }else if(result.rows.length>99){
                            $('.num').text(99).addClass('number')
                        }else{
                            $('.num').text(result.rows.length)
                        }
                    }else{
                        $('.num').hide();
                    }
                },
                error:function(){
                    layer.close(layerIndex);
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

