/**
 * Created by lumaosai on 2018/9/21.
 */
require(['/js/zlib/app.js'], function (App) {
    var PageModule = {
        momFactory: function(){

            require(['ueditor'],function(UE){
                var ue = UE.getEditor('myEditor1');
                $('#btn-search').click(function(){
                    alert(1);
                    ue.ready(function() {
                        //    ue.setContent('hello');  //设置编辑器的内容
                        var html = ue.getContent();//获取html内容，返回: <p>hello</p>
                        var txt = ue.getContentTxt(); //获取纯文本内容，返回: hello
                        console.log(html,111,txt);
                        if(!Validator.valid(document.forms[0],1.3)){
                            return;
                        }

                        if(txt.trim() == ''){
                            Mom.layMsg('信息内容不能为空');
                            return;
                        }
                        var formObj = $('#inputForm');
                        //var url = formObj.attr('action');
                        var formdata = formObj.serializeJSON();
                        console.log(formdata);


                    });



                })
            });
        },

        //编辑页面
        momFactoryView: function() {
            var id =Mom.getUrlParam('id');
            if(id){
                   //http://localhost/json/fwork/workedit.json
                Api.ajaxJson(Const.mtrl + "/api/fm/Fctr/form/" + id,{},function(result){
                    if(result.success){
                        Bus.appendOptionsValue('#fctrType',result.fctrType,'value','label');
                        Validator.renderData(result.Fctr, $('#inputForm'));
                    }
                    $('#fctrNo').attr('disabled','disabled');
                });
            }else{
                Api.ajaxJson(Const.mtrl + "/api/fm/Fctr/form/0",{},function(result){
                    if(result.success){
                        Bus.appendOptionsValue('#fctrType',result.fctrType,'value','label');
                    }
                });
            }

        }
    };
    $(function () {
        if ($('#momFactory').length > 0) {
            PageModule.momFactory()
        }else if($('#momFactoryView').length > 0){
            PageModule.momFactoryView();
        }
    });
})