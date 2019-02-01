require(['/js/zlib/app.js'], function(App) {
    //引入用户登录校验
    require(['checkUser']);

    //引入样式文件
    Mom.include('myCss_home','',[
        'js/plugins/layer/theme/default/layer.css',
        'js/plugins/gridster/jquery.gridster.css',
        'css/home/personalDesk.css',
        'css/home/home-slide.css'
    ]);


    var PageModule = {
        init: function(){
            require(['js/module/home/Tile.js'],function(Tile){
                Tile.register_tile(true);
            });
        }
    };


    $(function(){
        PageModule.init();
    });

});