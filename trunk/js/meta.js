var cdnDomain = '/cdnDomain';
(function(){
    //获取上下文路径
    var basePath = function(){
        var obj=window.location;
        // var contextPath=obj.pathname.split("/")[1];
        // var path=obj.protocol+"//"+obj.host+"/"+contextPath;
        var path=obj.protocol+"//"+obj.host;
        return path;
    };

    var getKVAttr = function(str){
        var res = new Array();
        var reg=/(\S+)\=\'(\S+)\'/g;
        var arr=reg.exec(str);
        var i=0;
        while(arr){
            var obj=new Object();
            obj.key=arr[1];
            obj.value=arr[2];
            res[i++]=obj;
            arr=reg.exec(str);
        }
        return res;
    };
    //引入requireJs文件
    window.includeRJ = function(js){
        if(js.indexOf('.') < 0){
            js += '.js';
        }
        //添加时间戳
        js = js + '?r='+new Date().getTime();
        //添加版本号（稳定时使用）
        // js = js + '?r=v1';
        var oScript = document.createElement('script');
        oScript.type = 'text/javascript';
        oScript.src = cdnDomain+'/js/zlib/require.js';
        oScript.setAttribute("data-main",js);
        document.body.appendChild(oScript);
    };


    window.include = function(file,okFn) {
        var files = typeof file == "string" ? file.split(',') : file;
        var path = basePath();
        for (var i = 0; i < files.length; i++){
            var name = files[i].replace(/^\s|\s$/g, "");
            if(name.length == 0) continue;
            var ext = name.substr(name.lastIndexOf('.')+1).toLowerCase();
            var fileref;
            if(name.indexOf('<meta') == 0){
                fileref = document.createElement('meta');
                var res = getKVAttr(name);
                for(var j=0; j<res.length; j++){
                    fileref.setAttribute(res[j].key, res[j].value);
                }
            }else{
                var fullName = name+'?r='+(new Date()).getTime();
                if(name.toLowerCase().indexOf('http://') < 0){
                    fullName = path + fullName;
                }
                if(ext == 'css'){
                    fileref = document.createElement('link');
                    fileref.setAttribute("rel", "stylesheet");
                    fileref.setAttribute("type", "text/css");
                    fileref.setAttribute("href", fullName);
                }
                else if(ext == 'js'){
                    fileref = document.createElement('script');
                    fileref.setAttribute("type", "text/javascript");
                    fileref.setAttribute("src", fullName);
                    fileref.onload = fileref.onreadystatechange = function(){
                        if(fileref.readyState && fileref.readyState != 'loaded' && fileref.readyState != 'complete') return ;
                        fileref.onreadystatechange = fileref.onload = null;
                        if(okFn) okFn();
                    }
                }
            }
            if(fileref){
                var head = document.getElementsByTagName('head')[0],
                    style= document.getElementsByTagName('style');
                if(style.length>0){
                    head.insertBefore(fileref,style[style.length-1]);
                }else{
                    head.appendChild(fileref);
                }
            }
        }
    };

    //设置标题
    document.title = document.title.replace('{{title}}','复晟铝业MOM平台（新版）');

    //添加meta
    include([
        "<meta name='viewport' content='width=device-width,initial-scale=1.0' >",
        "<meta http-equiv='X-UA-Compatible' content='IE=Edge,chrome=1' >",
        "<meta http-equiv='Cache-Control' content='no-store' >",
        "<meta http-equiv='Pragma' content='no-cache' >"
    ]);
    //添加css
    include([
        cdnDomain+'/js/plugins/bootstrap/css/bootstrap.min.css',
        cdnDomain+'/js/plugins/font-awesome/css/font-awesome.min.css',
        cdnDomain+'/css/iconFont/iconfont.css',
        cdnDomain+'/js/plugins/icheck/skins/flat/green.css',
        cdnDomain+'/js/plugins/select2/dist/css/select2.min.css',
        cdnDomain+'/css/common.css',
        'http://127.0.0.1:80/js/plugins/datatables/css/colReorder.dataTables.min.css',
        'http://127.0.0.1:80/js/plugins/datatables/css/fixedHeader.dataTables.min.css',
        'http://127.0.0.1:80/js/plugins/datatables/css/fixedColumns.dataTables.min.css',


    ]);

    //添加js 加载aa.js依赖jq.js
   /* include(['/js/jquery/jquery-2.2.4.min.js',],function(){
        include([
            '/js/aa.js'
        ]);
    });*/

})();
