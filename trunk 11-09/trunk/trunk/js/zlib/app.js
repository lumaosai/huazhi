requirejs.config({
    baseUrl: '/js',
    paths: {
        domReady: 'zlib/domReady',
        /*jquery: 'jquery/jquery-3.2.1.min', jquery3会导致iframe跳出来*/
        jquery: 'jquery/jquery-2.2.4.min',
		bootstrap: 'plugins/bootstrap/js/bootstrap.min',
        pace: 'plugins/pace/pace.min',
        datetimepicker: 'plugins/datetimepicker/js/bootstrap-datetimepicker',
        slimscroll: 'plugins/slimScroll/jquery.slimscroll.min',

        dataTable_my: 'plugins/datatables/js/jquery.dataTable.my',
        jqGrid_my: 'plugins/jqGrid/js/jqGrid.my',
        editTable: 'module/common/table/editTable',
        treeTable: 'plugins/treetable/jquery.treetable.my',

        ztree_my: 'plugins/ztree/jquery.ztree.my',
        easyui_my: 'plugins/easyui/jquery.easyui.my',
        summernote_all: 'plugins/summernote/lang/summernote-zh-CN',
        select2_all: 'plugins/select2/dist/js/i18n/zh-CN',
        icheck: 'plugins/icheck/icheck.min',
        layer: 'plugins/layer/layer',
        metisMenu: 'plugins/metismenu/metisMenu',
        mustache: 'plugins/mustache/mustache.min',
        CanvasAnimate: 'plugins/canvas/CanvasAnimate',
        inspinia: 'layout/inspinia',
        tabsNav: 'layout/tabsNav',
        validator: 'validator',
        json2: 'json2',
        Common: 'common',
        Bus: 'bus',
        Api: 'api',
        Page: 'module/common/page/page',

        checkUser: 'module/common/checkUser',
        jsrender: 'jsrender.min'

    },
    shim: {
        'layer':{ deps:['jquery'] },
        'bootstrap':{ deps:['jquery'] },
        'validator': { deps:['layer'] },
        'json2': { exports: 'json2' },
        'Common': { deps:['json2','layer'] },
        'Api': { deps:['Common'] },
        'Bus': { deps:['Api'] },
        'pace': { deps:['bootstrap'] },
        'icheck':{ deps:['jquery'] },
        'treeTable':{ deps:['jquery'] },
        'dataTable_my':{ deps:['jquery', 'plugins/datatables/js/jquery.dataTables.min'] },
        'ztree_my': { deps:['jquery', 'plugins/ztree/js/jquery.ztree.all.min'] },
        'easyui_my': { deps:['jquery', 'plugins/easyui/jquery.easyui.min'] },
        'jqGrid_my': { deps:['jquery', 'plugins/jqGrid/js/jqGrid'] },
        'editTable':{deps:['jquery']},
        'select2_all': {deps:['jquery', 'plugins/select2/dist/js/select2.full.min'] },
        'summernote_all': {deps:['jquery', 'plugins/summernote/summernote.min'] },
        'CanvasAnimate': {
            deps:['plugins/canvas/EasePack.min','plugins/canvas/TweenLite.min']
        },
        'inspinia': {
            deps:['metisMenu','slimscroll']
        },
        'Page': {
            deps:['plugins/bootStrapPager/js/extendPagination']
        },
    },
    urlArgs: "r=" + (new Date()).getTime(),
    waitSeconds: 15 //资源加载超时时间（秒）
});

/**
 * define中不包含加载资源的参数，则里边的require()方法使用同步加载，require([])使用异步加载
 */
define(function(require, exports, module){
    //同步加载
    require('pace');
    require('jquery');
    require('layer');
	require('validator');
	require('Common');
	require('Api');
    require('Bus');
    require('dataTable_my');
    // require('datetimepicker'); //放到自己的js文件中引入，然后再回调中设置效果

    //异步加载↓↓↓

    //加载样式文件
    require(['/js/cssInclude.js']);

    //select2
    require(['select2_all'],function() {
        //如果元素使用select2插件实现下拉框，在元素添加.select2的类名即可
        $('.select2').each(function(i,o){
            var width = $(o).attr('data-width')||'100%';
            var options = {
                // theme: "bootstrap",
                language: "zh-CN",
                placeholder: "请选择",
                allowClear:true,
                //tags: true,  //可以手动添加数据
                width: width //设置宽度，也可以在ui中加入data-width属性进行个性化设置
            };
            //多选
            if($(this).hasClass('multiple')){
                options.allowClear = true;
                options.multiple =  true;
                options.closeOnSelect = false;
            }
            $(o).select2(options);
        });
    });

    //icheck
    require('icheck');  //同步加载icheck.js
    window.renderIChecks = function(){
        $('.i-checks').iCheck({
            // checkboxClass: 'icheckbox_square-green',
            // radioClass: 'iradio_square-green'
            checkboxClass: 'icheckbox_flat-green',
            radioClass: 'iradio_flat-green'
        });

        //监听全选
        $('th input.i-checks').on('ifChecked', function(event){ //ifCreated 事件应该在插件初始化之前绑定
            $(this).closest('table').find('input.i-checks').iCheck('check');
        });
        //监听全不选
        $('th input.i-checks').on('ifUnchecked', function(event){ //ifCreated 事件应该在插件初始化之前绑定
            $(this).closest('table').find('input.i-checks').iCheck('uncheck');
        });
    };
    $(function() {
        renderIChecks();
    });


    //Called automatically if you don’t use AMD or CommonJS.
    //Pace.start();
	Pace.start({
		document: false
	});

    // setting the rootPath of layer
    layer.config({
        path: '/js/plugins/layer/', //layer.js所在的目录，可以是绝对目录，也可以是相对目录
        // skin: 'layui-layer-molv' //默认皮肤
        // skin: 'layer-ext-moon'
    });

    //数字函数（加法，能解决小数运算失精的问题）
    Number.prototype.Add=function(arg2){
        var arg1 = this, r1, r2, m;
        try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0}
        try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0}
        m=Math.pow(10,Math.max(r1,r2));
        return (arg1*m+arg2*m)/m;
    };
    //数字函数（乘法）
    Number.prototype.Mul=function(arg2){
        var m=0,s1=this.toString(),s2=arg2.toString();
        try{m+=s1.split(".")[1].length}catch(e){}
        try{m+=s2.split(".")[1].length}catch(e){}
        return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m);
    };

    //去掉空格
    String.prototype.trim = function(){
        return this.replace(/^\s*|\s*$/g,"");
    };
    //是否以?开头
    String.prototype.startWith=function(str){
        var reg=new RegExp("^"+str);
        return reg.test(this);
    };
    //是否以?结尾
    String.prototype.endWith=function(str){
        var reg=new RegExp(str+"$");
        return reg.test(this);
    };
    //字符串替换
    String.prototype.replaceAll = function(reallyDo, replaceWith, ignoreCase) {
        if (!RegExp.prototype.isPrototypeOf(reallyDo)) {
            if(reallyDo=="?") return this.replace(/\?/g,replaceWith);
            return this.replace(new RegExp(reallyDo, (ignoreCase ? "gi": "g")), replaceWith);
        } else {
            return this.replace(reallyDo, replaceWith);
        }
    };
    //字符串转码
    String.prototype.encode=function(){
        return encodeURIComponent(this);
    };
    //字符串转日期
    String.prototype.toDate=function(){
        var ipt1 = this;
        var aDate = ipt1.split("-");
        var dt1 = new Date(aDate[0], aDate[1]-1, aDate[2]);     //转换为10-18-2004格式
        return dt1;
    };
    //字符串转数组
    String.prototype.toArr=function(rex){
        var ret=[], str=this;
        if(null == str || 0==str.length) return ret;
        var arr = str.split(rex||",");
        for(var i=0; i<arr.length; i++){
            var t = arr[i].trim();
            if(t.length > 0){
                ret.push(t);
            }
        }
        return ret;
    };
    //字符串转Json
    String.prototype.toJson=function(){
        return eval('(' + this + ')');
    };
    //字符串转数据库查询类型字符串
    String.prototype.toDbStr=function(regex){
        if(regex==undefined || regex==null){
            regex = "'";
        }
        var str = "", bol = 0;
        var oldVal = this.trim().replaceAll("，",",");
        if(oldVal!="" && regex=="'"){
            if(!oldVal.startWith("'") && !oldVal.endWith("'")){
                for(var n=0;n<oldVal.length;n++){
                    if(oldVal.charCodeAt(n)==44 ||oldVal.charCodeAt(n)==32 || oldVal.charCodeAt(n)==13 || oldVal.charCodeAt(n)==10 || oldVal.charCodeAt(n)==9){
                        if(bol == 0){
                            str += "','";
                            bol =1;
                        }
                        if(bol == 1){
                            continue;
                        }
                    } else{
                        str += oldVal.charAt(n).trim();
                        bol = 0;
                    }
                }
            }else{
                str = oldVal;
            }
            if(!str.startWith("'"))
                str = "'"+str;
            if(!str.endWith("'"))
                str = str+"'";
        }
        else{
            for(var n=0;n<oldVal.length;n++){
                if(oldVal.charCodeAt(n)==44 ||oldVal.charCodeAt(n)==32 || oldVal.charCodeAt(n)==13 || oldVal.charCodeAt(n)==10 || oldVal.charCodeAt(n)==9){
                    if(bol == 0){
                        str += regex+","+regex;
                        bol =1;
                    }
                    if(bol == 1){
                        continue;
                    }
                } else{
                    str += oldVal.charAt(n).trim();
                    bol = 0;
                }
            }
        }
        return str;
    };

    //数组是否包含
    Array.prototype.contains = function(item){
        return RegExp("(^|,)" + item.toString() + "($|,)").test(this);
    };
    //去掉数组中的重复项
    Array.prototype.unique = function() {
        var res = [], hash = {};
        for(var i=0, elem; (elem = this[i]) != null; i++) {
            if (!hash[elem]) {
                res.push(elem);
                hash[elem] = true;
            }
        }
        return res;
    };
    //数组转字符串
    Array.prototype.toStr=function(){
        var str = "", arr = this;
        if(arr == undefined){
            return str;
        }
        for(var i=0; i<arr.length; i++){
            var t = arr[i].trim();
            str += t;
            if(i<arr.length-1){
                str += ",";
            }
        }
        return str;
    };

    /*
     * Jquery扩展：序列化选择器下表单（不仅支持form，而且支持容器）
     * @see: $(selector).serializeJSON();
     */
    $.fn.serializeJSON=function(){
        var o = {};
        var a = this.serializeArray();
        if(a.length == 0){
            $(this).find('input,textarea,select,:checkbox,:radio').each(function(_i,_o){
                a.push(_o);
            });
        }
        //var str=this.serialize();
        //console.log('serialize:', str);
        $.each(a, function() {
            if($(this).prop('disabled')!=true){
                var name = this.name;
                var value = this.value;
                var paths = this.name.split(".");
                var len = paths.length;
                var obj = o;
                $.each(paths,function(i,e){
                    if(i == len-1){
                        if (obj[e]) {
                            if (!obj[e].push) {
                                obj[e] = [obj[e]];
                            }
                            obj[e].push(value || '');
                        } else {
                            obj[e] = value || '';
                        }
                    }else{
                        if(!obj[e]){
                            obj[e] = {};
                        }
                    }
                    obj = o[e];
                });
            }
        });
        return o;
    };

    window.refresh=function(index){
        // index = index||0;
        // document.forms[index].submit();
        window.location.reload();
    };

    //查询重置
    window.searchAll=function(formInex, clearHidden){
        // formInex = formInex||0;
        // var formObj = document.forms[formInex];
        // Mom.clearForm(formObj,clearHidden);
        // //初始化分页参数
        // formObj['page.pageNo'].value = "1";
        // formObj['page.pageSize'].value = "10";
        // formObj.submit();
    };

    //初始化
    $(function(){
        //设置标题
        document.title = document.title.replace('{{title}}','复晟铝业MOM平台（新版）');
        //tooltip
        $("[data-toggle='tooltip']").tooltip();
        //刷新ibox
        $('.refresh-link').click(function(){
            window.location.reload();
        });
        //默认查询
        $("#search-btn").click(function(){
            try{
                pageLoad();
            }catch(e){
                console.error(e);
            }
        });


        //折叠ibox
        $('.collapse-link').click(function () {
            var ibox = $(this).closest('div.ibox');
            var button = $(this).find('i');
            var content = ibox.find('div.ibox-content');
            content.slideToggle(200);
            button.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
            setTimeout(function () {
                ibox.resize();
                ibox.find('[id^=map-]').resize();
            }, 50);
        });
        //左右折叠ibox
        $('.collapse-left-link').click(function () {
            var ibox = $(this).closest('div.leftBox');
            var button = $(this).find('i');
            var content = ibox.find('div.leftBox-content');
            content.slideToggle(200);
            button.toggleClass('fa-chevron-left').toggleClass('fa-chevron-right');
            if(button.hasClass('fa-chevron-left')){
                setTimeout(function () {
                    ibox.width("180px");
                    // ibox.find('[id^=map-]').resize();
                }, 200);
            }else{

                setTimeout(function () {
                    ibox.width("10px");
                    // ibox.find('[id^=map-]').resize();
                }, 200);

            }
        });
        //关闭ibox
        $('.close-link').click(function () {
            var content = $(this).closest('div.ibox');
            content.remove();
        });

    });


    module.exports = {myModule: 1};

});

