require([cdnDomain+'/js/zlib/app.js'], function(App) {

    var PageModule = {
        init: function(){
            require(['js/module/home/Tile.js'],function(Tile){
                Tile.register_tile(true);
               /* var cancel_Alarm;
                window.cancelAlarm = function(event,detailUrl,id,titleName){
                    var id = $(event).attr('data-id');
                    cancel_Alarm = event;
                    Bus.openDialog(titleName,detailUrl+id,"390px","240px");
                };*/
                var cancel_Alarm;
                window.cancelAlarm = function(event,app,id,appName){
                    var id = $(event).attr('data-id');
                    cancel_Alarm = event;
                    Bus.openEditDialog("取消报警","mes/cancelAlarm.html?dataId="+id,"390px","240px",cancelAlarm_callback);
                };
                window.cancelAlarm_callback = function(layerIdx, layero){
                    var iframeWin = layero.find('iframe')[0].contentWindow;
                    var formData = iframeWin.getFormData();
                    if(formData){
                        var data = formData.data;
                        if($.trim(data.DealInstruction) == ""){
                            Mom.layMsg("请填写取消原因！");
                            return;
                        }
                        Api.ajaxJson(formData.url, JSON.stringify(data), function(result){
                            if(result.success == true){
                                Mom.layMsg('操作成功', 1000);
                                //关闭弹出层
                                top.layer.close(layerIdx);
                                if(cancel_Alarm){
                                    $(cancel_Alarm).parent().parent().remove();
                                }
                            }else{
                                Mom.layAlert(result.message);
                            }
                        });
                    }
                    return false;
                };
            });
        }
    };
    $(function(){
        PageModule.init();
    });

});