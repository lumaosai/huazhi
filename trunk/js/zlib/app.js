requirejs.config({
    baseUrl: cdnDomain,
    paths: {
        domReady: 'js/zlib/domReady',
        /*jquery: 'js/jquery/jquery-3.2.1.min', jquery3会导致iframe跳出来*/
        jquery: 'js/jquery/jquery-2.2.4.min',
		bootstrap: 'js/plugins/bootstrap/js/bootstrap.min',
        pace: 'js/plugins/pace/pace.min',
        WdatePicker: 'js/plugins/My97DatePicker/WdatePicker',
        slimscroll: 'js/plugins/slimScroll/jquery.slimscroll.min',

        colResizable: 'http://127.0.0.1:80/js/plugins/datatables/js/colResizable-1.6',//列宽调整
        dataTable_colReorder: 'http://127.0.0.1:80/js/plugins/datatables/js/dataTables.colReorder',//拖动列
        dataTable_fixedHeader: 'http://127.0.0.1:80/js/plugins/datatables/js/dataTables.fixedHeader',//固定表头
        dataTable_fixedColumns: 'http://127.0.0.1:80/js/plugins/datatables/js/dataTables.fixedColumns.min',//固定列

        mock: 'http://127.0.0.1:80/js/plugins/mock',
        artTemplate: 'http://127.0.0.1:80/js/plugins/template-debug',
        'ueditor.config': 'http://127.0.0.1:80/js/plugins/utf8-jsp/ueditor.config',
        ueditor: 'http://127.0.0.1:80/js/plugins/utf8-jsp/ueditor.all',
        zeroclipboard:'http://127.0.0.1:80/js/plugins/utf8-jsp/third-party/zeroclipboard/ZeroClipboard.min',
        lazn:'http://127.0.0.1:80/js/plugins/utf8-jsp/lang/zh-cn/zh-cn',

        'datatables.net' : 'js/plugins/datatables/js/jquery.dataTables.min',

        dataTable_my: 'http://127.0.0.1:80/js/plugins/datatables/js/jquery.dataTable.my',
        jqGrid_my: 'http://127.0.0.1:80/js/plugins/jqGrid/js/jqGrid.my',
        editTable: 'js/module/common/table/editTable',
        treeTable: 'js/plugins/treetable/jquery.treetable.my',
        ztree_my: 'js/plugins/ztree/jquery.ztree.my',
        easyui_my: 'js/plugins/easyui/jquery.easyui.my',
        summernote_all: 'js/plugins/summernote/lang/summernote-zh-CN',
        select2_all: 'js/plugins/select2/dist/js/i18n/zh-CN',
        icheck: 'js/plugins/icheck/icheck.min',
        layer: 'js/plugins/layer/layer',
        metisMenu: 'js/plugins/metismenu/metisMenu',
        mustache: 'js/plugins/mustache/mustache.min',
        CanvasAnimate: 'js/plugins/canvas/CanvasAnimate',
        inspinia: 'js/layout/inspinia',
        tabsNav: 'http://127.0.0.1:80/js/layout/tabsNav',
        validator: 'js/validator',
        json2: 'js/json2',
        Common: 'js/common',
        Bus: 'js/bus',
        Api: 'js/api',
        Page: 'http://127.0.0.1:80/js/module/common/page/page',
        SmallPage: 'js/module/common/page/smallPage',
        checkUser: 'js/module/common/checkUser',
        jsrender: 'js/jsrender.min',

        echarts: 'http://127.0.0.1:80/js/plugins/echarts/js/echarts',
        macarons:'js/plugins/echarts/js/macarons',
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
        'dataTable_my':{ deps:['jquery', 'datatables.net'] },
        //'dataTable_my':{ deps:['jquery', 'datatables.net','colResizable'] },//可行改变列宽

        //'dataTable_my':{ deps:['jquery','colResizable', 'datatables.net','dataTable_colReorder','dataTable_fixedHeader'] },
        //'dataTable_my':{ deps:['jquery', 'js/plugins/datatables/js/jquery.dataTables.min','http://127.0.0.1:80/js/plugins/datatables/js/dataTables.colReorder.js'] },

        'dataTable_colReorder':{ deps:['jquery', 'datatables.net'] },
        'dataTable_fixedHeader':{ deps:['jquery', 'datatables.net'] },
        'dataTable_fixedColumns':{ deps:['jquery', 'datatables.net'] },
        'ueditor':{deps:['zeroclipboard','ueditor.config'],exports: 'UE',init:function(ZeroClipboard){
//导出到全局变量，供ueditor使用
            window.ZeroClipboard = ZeroClipboard;
        }},

        'colResizable':{ deps:['jquery'] },


        'ztree_my': { deps:['jquery', 'js/plugins/ztree/js/jquery.ztree.all.min'] },
        'easyui_my': { deps:['jquery', 'js/plugins/easyui/jquery.easyui.min'] },
        'jqGrid_my': { deps:['jquery', 'js/plugins/jqGrid/js/jqGrid'] },
        'editTable':{deps:['jquery']},
        'select2_all': {deps:['jquery', 'js/plugins/select2/dist/js/select2.full'] },
        'summernote_all': {deps:['jquery', 'js/plugins/summernote/summernote.min'] },
        'CanvasAnimate': {
            deps:['js/plugins/canvas/EasePack.min','js/plugins/canvas/TweenLite.min']
        },
        'inspinia': {
            deps:['metisMenu','slimscroll']
        },
        'Page': {
            deps:['js/plugins/bootStrapPager/js/extendPagination']
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
	require('/js/Constant.js');
	require('validator');
	require('Common');
	require('Api');
    require('Bus');
    require('WdatePicker');
    require('dataTable_my');

    //require('mock');
    //require('artTemplate');



    //require('dataTable_colReorder');
    //require('dataTable_fixedHeader');


    //异步加载↓↓↓

    //select2
    require('select2_all'); //同步加载select2.js
    window.renderSelect2 = function(os){
        if(os==undefined){
            os = $('.select2');
        }
        $.each(os,function(i,o){
            var width = $(o).attr('data-width')||'100%';
            var height = $(o).attr('data-height')||'200px';  //设置高度
            var allowClear = $(o).attr('data-allowClear')||'true';  //是否可清除
            var options = {
                // theme: "bootstrap",
                language: "zh-CN",
                placeholder: "请选择",
                allowClear: allowClear=='true',
                minimumResultsForSearch: 15, //数据超过15条自动显示搜索框
                //tags: true,  //可以手动添加数据
                width: width, //设置宽度，也可以在ui中加入data-width属性进行个性化设置
                height: height,
                // dropdownAutoWidth: true,
            };
            //多选
            if($(o).hasClass('multiple')){
                options.allowClear = allowClear=='true';
                options.multiple =  true;
                options.closeOnSelect = false;
            }
            $(o).select2(options);
        });
    }
    //如果元素使用select2插件实现下拉框，在元素添加.select2的类名即可
    renderSelect2($('.select2'));

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
        path: cdnDomain+'/js/plugins/layer/', //layer.js所在的目录，可以是绝对目录，也可以是相对目录
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

