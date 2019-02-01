require(['/js/zlib/app.js'], function(App) {

    // 如果在框架或在对话框中，则弹出提示并跳转到首页
    if(self.frameElement && self.frameElement.tagName=="IFRAME"){
        top.location = window.location;
    }
    if (window.top !== window.self) {
        window.top.location = window.location;
    }

    //加载鼠标动画效果
    // require(['CanvasAnimate']);

    //引入css
    Mom.include('myCss_login','/css/','login.css');

    var PageModule = {
        //注册事件
        eventHandler: function(){
            //回车登录
            $("body").keydown(function(event) {
                if (event.keyCode == 13){
                    PageModule.submitHandler();
                }
            });

            //登录判断开始
            $("#loginName, #password").keyup(function () {
                var $val = $.trim($(this).val());
                if ($val == "") {
                    $(".login-error").empty().fadeIn(1000).html("用户名或密码不能为空!");
                } else {
                    $(".login-error").fadeOut(400);
                }
            }).blur(function () {
                $(".login-error").fadeOut(400);
            });

            //提交按钮
            $(".login-submit").click(function () {
                PageModule.submitHandler();
            });

        },

        //提交事件
        submitHandler: function() {
            if ($.trim($("#loginName").val()) == "" || $.trim($("#password").val()) == "") {
                $(".login-error").empty().fadeIn(1000).html("用户名或密码不能为空!");
            } else {
                PageModule.loginButtonDisable(true);
                var data = JSON.stringify($("#loginForm").serializeJSON());
                Api.ajaxJson(Api.admin+"/oauth/token", data, function(result) {
                    if (result.success == true) {
                        Mom.setCookie("authorization", result.accessToken.authorization);
                        Mom.setCookie("token_type", result.accessToken.token_type);
                        Mom.setCookie("userName", result.user.name);
                        Mom.setCookie("loginName", result.user.loginName);
                        Mom.setCookie("loginUserid", result.user.id);
                        location.href = "index.html";
                    } else {
                        PageModule.loginButtonDisable(false);
                        if (result.retCode == "30006") {
                            $(".login-error").empty().fadeIn(1000).html("账户已被禁用!");
                        } else {
                            $(".login-error").empty().fadeIn(1000).html("用户名或密码不正确!");
                        }
                    }
                })
            }
        },

        loginButtonDisable:function(flag){
            if(flag==true){
                $('.login-submit').addClass('disabled');
            }else{
                $('.login-submit').removeClass('disabled');
                $(".login-error").fadeOut(400);
            }
        },


        autoLogin:function(){
            $("#loginName").val('admin');
            $("#password").val('123456');
            PageModule.submitHandler();
        }


    };


    $(function(){
        PageModule.eventHandler();
		/*
        Mom.layMsg('正在为您自动登陆...');
        setTimeout(function(){
            PageModule.autoLogin();
        },2500);
		*/
    });

});

