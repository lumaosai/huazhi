require(['/js/zlib/app.js'], function(App) {
    var PageModule = {
        init: function(){
            $("#icons li").click(function(){
                $("#icons li").removeClass("active");
                $(this).addClass("active");
                var iconVal = $(this).find('i').attr('class').split(" ")[1];
                $("#icon").val(iconVal);
            });
            $("#icons li").dblclick(function(){
                var iconVal = $(this).find('i').attr('class').split(" ")[1];
                top.layer.prompt({title:'图标样式', value:iconVal,}, function(text, index){
                    top.layer.close(index);
                });
            });
            //默认值
            var selVal = Mom.getUrlParam('selVal');
            console.log(selVal);
            $("#icon").val(selVal);
            $("#icons li").each(function(){
                if ($(this).find("i").hasClass(selVal)){
                    $(this).addClass("old-active");
                }
            });
        },
    };

    $(function(){
        if($('#iconSelect').length > 0){
            PageModule.init();
        }
    });
});