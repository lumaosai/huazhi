require(['/js/zlib/app.js'], function(App) {
    //引入用户登录校验
    require(['checkUser']);

    var PageModule = {
        init: function(){
            $('#cancel').click(function(){
                $('#oldPass').val('');
                $('#newPass').val('');
                $('#newPassToo').val('');
            });
            $('#submit').click(function() {
                if(!Validator.valid(document.forms[0],2)){
                    return;
                }
                var data = {
                    oldPassword: $('#oldPass').val(),
                    newPassword: $('#newPassToo').val()
                };
                Mom.ajaxForm(Api.admin+'/api/sys/SysUser/updatePassword', data, function(result) {
                    if(result.success==true){
                        Mom.layMsg("密码修改成功,请重新登录");
                        setTimeout(function(){
                            top.location.href = "../login.html";
                        },1500)
                    }else{
                        // oldPass
                        layer.tips(result.message, '#oldPass', {tips:[2, '#F90']});
                    }
                });
            });
        }
    };

    $(function(){
        PageModule.init();
    });

});