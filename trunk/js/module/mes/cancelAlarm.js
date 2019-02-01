require([cdnDomain+'/js/zlib/app.js'], function(App) {
    var PageModule = {
        init: function(){
            var id = Mom.getUrlParam('dataId');
            $('input').val(id);
            window.getFormData =function(){
                var formObj = $('#inputForm');
                return {
                    url: formObj.attr('action'),
                    data: formObj.serializeJSON()
                }
            }
        }
    };

    $(function(){
        PageModule.init();
    });

});