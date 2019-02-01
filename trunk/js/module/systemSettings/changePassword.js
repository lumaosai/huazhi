require([cdnDomain+'/js/zlib/app.js'], function(App) {
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
				var that = this;
                if($('#oldPass').val()!=''){
                    var data = {
                        type:'vf',
                        oldPassword: $('#oldPass').val(),
                        newPassword: ''
                    };
                    Api.ajaxForm(Const.admin+'/api/sys/SysUser/updatePassword', data, function(result) {
                        if (result.success != true) {
							layer.tips('原密码有误，请重新输入', that, {tips:[2, '#F90']} );
							$('#oldPass').val('');
                        }
                    });
                }else{
                    layer.tips('请填写原密码', that, {tips:[2, '#F90']} );
                }
            });
            /*递交*/
            $('#submit').click(function () {
				if(!Validator.valid(document.forms[0],1.2)){
                    return;
                }
                var data = {
					type: 'save',
					oldPassword: $('#oldPass').val(),
					newPassword: $('#newPass').val()
				};
				Api.ajaxForm(Const.admin + '/api/sys/SysUser/updatePassword', data, function (result) {
					if (result.success) {
						top.layer.msg("密码修改成功,已为您跳转登录页");
						setTimeout('top.location.href = "../login.html"', 2000)
					} else {
						Mom.layMsg(result.message);
					}
				});
            })
        }
    };

    $(function(){
        PageModule.init();
    });

});