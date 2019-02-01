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
    }

    window.include = function(file) {
        var files = typeof file == "string" ? [file] : file;
        var path = basePath();
        for (var i = 0; i < files.length; i++){
            var name = files[i].replace(/^\s|\s$/g, "");
            if(name.length == 0) continue;
            var ext = name.substr(name.lastIndexOf('.')+1).toLowerCase();
            var fileref;
            var fullName = path+name+'?r='+(new Date()).getTime();
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
            }
            else if(name.indexOf('<meta') == 0){
                fileref = document.createElement('meta');
                var res = getKVAttr(name);
                for(var j=0; j<res.length; j++){
                    fileref.setAttribute(res[j].key, res[j].value);
                }
            }
            if(fileref){
                var head = document.getElementsByTagName('head')[0];
                head.appendChild(fileref);
            }
        }
    };

    //添加meta
    include([
        "<meta name='viewport' content='width=device-width,initial-scale=1.0' >",
        "<meta http-equiv='X-UA-Compatible' content='IE=Edge,chrome=1' >",
        "<meta http-equiv='Cache-Control' content='no-store' >",
        "<meta http-equiv='Pragma' content='no-cache' >"
    ]);

    //添加css
    include([
        '/js/plugins/bootstrap/css/bootstrap.min.css',
        '/js/plugins/font-awesome/css/font-awesome.min.css',
        '/js/plugins/icheck/skins/flat/green.css',
        '/js/plugins/select2/dist/css/select2.min.css',
        '/css/common.css'
    ]);

})();
