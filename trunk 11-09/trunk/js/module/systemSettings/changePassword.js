require(['/js/zlib/app.js'], function(App) {
    //引入用户登录校验
    require(['checkUser']);

    var PageModule = {
        init: function(){
            /*取消按钮*/
            $('#cancel').click(function(){
                $('#oldPass').val('');
                $('#newPass').val('');
                $('#newPassToo').val('');
            });
            /*验证两次密码*/
            $('#newPassToo').on('blur', function () {
                if($('#newPassToo').val()!=$('#newPass').val()){
                    $('#newPassToo-error').show();
                }else{
                    $('#newPassToo-error').hide();

                }
            });
            /*验证老密码是否正确*/
            $('#oldPass').on('blur', function () {
                if($('#oldPass').val()!=''){
                    var data = {
                        type:'vf',
                        oldPassword: $('#oldPass').val(),
                        newPassword: ''
                    };
                    Api.ajaxForm(Api.admin+'/api/sys/SysUser/updatePassword', data, function(result) {
                        if (result.success) {
                            $('#pass-error').hide();
                        }else{
                            $('#pass-error').show();
                        }

                    });
                }else{
                    layer.tips('请填写原密码', this, {tips:[2, '#F90']} );
                }
            });
            /*递交*/
            $('#submit').click(function () {
                if($('#oldPass').val()!=''&&$('#newPass').val()!=''&&$('#newPassToo').val()!=''&&$('#newPassToo').val()===$('#newPass').val()) {
                    var data = {
                        type: 'save',
                        oldPassword: $('#oldPass').val(),
                        newPassword: $('#newPass').val()
                    };
                    Api.ajaxForm(Api.admin + '/api/sys/SysUser/updatePassword', data, function (result) {
                        if (result.success) {
                            top.layer.msg("密码修改成功,已为您跳转登录页");
                            setTimeout('top.location.href = "../login.html"', 2000)
                        } else {
                            Mom.layMsg(result.message)
                        }
                    });
                }else{
                    Mom.layAlert('请按提示正确填写，点击确定后继续操作');
                }
            })
        }
    };

    $(function(){
        PageModule.init();
    });

});