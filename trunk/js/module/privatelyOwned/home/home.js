require(['/js/zlib/app.js'], function(App) {

    var PageModule = {
        init: function(){
            require(['js/module/home/Tile.js'],function(Tile){
                $.views.converters("MathRound", function (value) {
                    return Math.round(value);
                });
                Tile.register_tile(true);
            });

        }
    };
    $(function(){
        PageModule.init();
    });

});