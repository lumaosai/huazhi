define([
    'jsrender',
    'js/plugins/gridster/jquery.gridster.js',
    'js/module/home/index-chart.js',
    'js/module/common/page/smallPage.js',
    'tabsNav',
    ], function(jsrender,gridster,ec){
    var store_tiles;//磁贴商店中的所有磁贴
    var move_tile;//移动中的磁贴
    var cu_move_tiles = [];  //从磁贴商店拖拽到容器之后 记录被拖拽的磁贴id
    var cu_panel_tiles = []; //存储面板类组内所有子磁贴   //存储显示区域的所有磁贴
    var choose_panel_tiles = []; //将面板类磁贴子元素挑选出来存储，进行删除
    var appdates;
    var template = {};
    var app_array = [];   //第一个下拉框存放的数组数据
    var gridster = [];   //首页磁贴实例化
    var alltiles = [];
    var timeStart;
    var flagB = false;//声明全局变量  
    var del_tiles = "";  //存储容器中被删除的磁贴id

    var del_cu_panel_tiles = []; //存储分组中被删除的磁贴、用来调整商店磁贴状态  lss 20180424
    var isEdit = false;
    var widthx = 129;
    var margins = 10;
    if ($(window).width() < 1730) {
        widthx = 110;
        if ($(window).width() < 1600) {
            widthx = 102;
            if ($(window).width() < 1530) {
                widthx = 95;
                if ($(window).width() < 1400) {
                    widthx = 85;
                    if ($(window).width() < 1200) {
                        widthx = 85;
                    }
                }
            }
        }
    }
    //将number转换成百分数
    Number.prototype.toPercent = function () {
        return (Math.round(this * 100) / 100).toFixed(2) + '%';
    };

    String.prototype.changedouhao = function(){
        return  this.replace(/；/ig,';');
    };
    String.prototype.changemaohao = function(){
        return this.replace(/：/ig,':');
    };
    String.prototype.startWith=function(str){
        var reg=new RegExp("^"+str);
        return reg.test(this);
    };
    jQuery.fn.extend({
        //增加下拉框选项
        addOptions: function (text, val, id) {
            return this.append("<option value='" + val + "' title='" + text + "' data-id='"+ id +"'>" + text + "</option>");
        },
        chartStyleInit: function (x,y) {
            var wid = x * workbench.unitWidth + (x - 1) * 20;
            var hei = y * workbench.unitWidth + (y - 1) * 20 - 30;
            $(this).css("height", hei + "px");
            $(this).css("width", wid + "px");
        }
    });

    var register_tile = function(){
        gridster[0] = $(".gridster>ul").gridster({
            namespace: ".gridster",
            widget_selector: "li",                        //确定哪个元素是widget
            widget_margins: [margins, margins],                       //margin大小
            widget_base_dimensions: [widthx, widthx],           //面积大小
            //extra_rows: 0,                              //增加更多的横数确保空隙合适
            //extra_cols: 0,                              //增加更多的列数确保空隙合适
            //max_size_x: 6,                              //一个widget最大多少列
            //max_size_y: 6,                              //一个widget最大多少横
            max_cols: 14,                             //最多创建多少列，null表示没有限制
            //max_rows: null,                             //最多创建多少横，null表示没有限制
            min_cols: 14,                                //至少创建多少列
            //min_rows: 15,                               //至少创建多少横
            //autogenerate_stylesheet: true,   //允许通过CSS自动生成，例如：[data-col="1"] { left: 10px; }
            avoid_overlapped_widgets: true,  //不允许widgets加载的时候重叠

            //resize.enabled: false,//允许改变大小
            //resize.axes: ['both'],      //能通过X,Y轴去改变大小
            //resize.handle_class: 'gs-resize-handle',          //把某个class当做改变大小的控件
            //resize.handle_append_to: '',//set a valid CSS selector to append resize handles to. If value evaluates to false it's appended to the widget.
            //resize.max_size: [Infinity, Infinity],  //改变大小的最大值
            helper: 'clone',
            resize: {
                enabled: false   //表示不可以拖动模块的右下角改变模块大小
            },
            serialize_params: function ($w, wgd) {        //返回序列化后widget的数据
                var obj = {
                    col: wgd.col.toString(),//列
                    row: wgd.row.toString(),//行
                    sizex: wgd.size_x,//X轴宽
                    sizey: wgd.size_y,//Y轴高
                };
                var contextId = $w.context.id.toString();
                if(contextId.indexOf('tile')>-1){
                    obj.tileTemplateId = contextId.substring(5);
                }else{
                    obj.panelId = contextId.substring(6);
                }

                return obj;
            }
            //draggable.start: function(event, ui){},          //拖动事件
            //draggable.drag: function(event, ui){},
            //draggable.stop: function(event, ui){},
            //用法：
            /*draggable:{
             //handle: 'header',         //设置拖动控件
             start: function(event, ui){
             },
             drag:function(event, ui){
             },
             stop: function(event, ui){
             }
             }*/
            //collision.on_overlap_start: function(collider_data) { },    //碰撞/交互事件
            //collision.on_overlap: function(collider_data) { },
            //collision.on_overlap_stop: function(collider_data) { },
            //resize.start: function(e, ui, $widget) {},     //改变大小事件
            //resize.resize: function(e, ui, $widget) {},
            //resize.stop: function(e, ui, $widget) {},

        }).data('gridster');
        gridster[0].disable();//禁止拖动

        //加载磁贴
        load_tile(true);


        //个人工作台编辑按钮的切换lcj  //点击编辑（编辑icon）按钮事件
        $(".sjkhs").click(function () {
            $(".iframe-mask").show();//tj add
            isEdit = true;
            //ingsht 快捷入口磁贴、数字类磁贴、自定义磁贴、面板类  eacstrslist 图表类磁贴   lbdestlist  列表类磁贴  shewidt 卡片类磁贴、文本类磁贴、多媒体类磁贴
            $(".ingsht,.lbdestlist,.shewidt,.eacstrslist,.circlelist").show();
            $(".navtopstyle").hide();  //编辑按钮的父元素
            $(".sumenlist").show();   //对号、购物车icon
            $(".div-group-shadows").show();
            $(".icon-setting").hide();
            gridster[0].enable();
            $('.tile-title').addClass('move');

            $(".function>li").each(function () {
                //$(this)[0].id;
                var a = $(this).children("div").children("a");
                a.attr("href", "javascript:void(0);");
                a.removeAttr("target");
                a.unbind("click");
            });

        });

        //保存返回首页状态lcj   点击保存（对号icon）
        $(".succesesed_ok").click(function (e) {   //点击对号（保存）的时候
            $(".iframe-mask").hide();//tj add
            isEdit = false;
            $(".ingsht,.lbdestlist,.shewidt,.eacstrslist,.circlelist").hide();
            $(".sumenlist").hide();
            $(".navtopstyle").show();
            $("#right-sidebar").hide();
            $(".div-group-shadows").hide();
            $(".icon-setting").show();
            gridster[0].disable();
            $('.tile-title').removeClass('move');
            cu_move_tiles.splice(0, cu_move_tiles.length);

            $(".tile_li").each(function () {
                $(this).css("border", "1px solid #1ab394");
            });
            linkInit(".function");

            var data = {
                workbenchTileTemplateList:JSON.stringify(gridster[0].serialize()),
                delId :del_tiles.substring(1)
            };

            Api.ajaxForm(Api.admin+'/api/workbench/WorkbenchHomePage/saveUserTile',data,function(result){
                if(result.success){
                    shortcut(".function");   //给快捷入口类磁贴绑定点击事件
                    del_tiles="";
                }else{
                    Mom.layMsg(result.message);
                }
            });
        });

        //点击选项（购物车icon）
        $(".appendtext").click(function (e) {
            $(".sideOpener").show();
            $("#right-sidebar").show();
            var self = this;
            if ($(self).attr("data-p") == "off") {
                //展开
                $(self).attr("data-p", "on");
                $(".sideOpener").attr("data-p", "on");
                $(".sideOpener").html('<b>&gt;</b>');
                $("#right-sidebar").animate({ marginRight: "460px" });
            } else {
                //收回
                $(self).attr("data-p", "off");
                $(".sideOpener").attr("data-p", "off");
                $(".sideOpener").html('<b>&lt;</b>');
                $("#right-sidebar").animate({ marginRight: "0px" });
            };
        });

        //小icon 控制右侧磁贴商店展开收缩
        $(".sideOpener").click(function () {
            var self = this;
            if ($(self).attr("data-p") == "off") {
                //展开
                $(self).attr("data-p", "on");
                $(self).html('<b>&gt;</b>');
                $(".appendtext").attr("data-p", "on");
                $("#right-sidebar").animate({ marginRight: "460px" });
            } else {
                //收回
                $(self).attr("data-p", "off");
                $(self).html('<b>&lt;</b>');
                $(".appendtext").attr("data-p", "off");
                $("#right-sidebar").animate({ marginRight: "0px" });
            }
        });

    };

    var load_tile = function(ispush){  //页面加载的时候调用    左侧磁贴管理快捷入口的json数据
        Api.ajaxForm(Api.admin+"/api/workbench/WorkbenchHomePage/list",{},function(result){
            if(result.success){
                var tiles = result.rows;
                if(tiles.length >0){
                    tiles.forEach(function (t) {
                        if(ispush){
                            if(t.templateCode == "shortcut"  || t.templateCode == "number"){
                                t['imgSrc'] = Api.admin+'/img/sys/SysUpload/showTileImg?id='+t.tileTemplateId+'&type='+t.type;
                            }
                            cu_panel_tiles.push(t);
                        };
                        addWidget(0, t, "1");
                    });
                }
                //每个磁贴的html是异步加载，延迟1秒执行
                setTimeout(function () {
                    linkInit(".function");
                    removeInit();
                }, 1000);
                shortcut(".function");
                appsInit();   //加载应用
            }else{
                Mom.layMsg(result.message);
            }
        });
    };

    /*面板增加磁贴
     * where:父集ul；tile:所有data值；isFirst:1代表初始化，0代表添加,；closeDel：true表示移除红色关闭按钮；
    **/
    var addWidget = function(oindex, tile, isFirst, closeDel) {
        if(tile.templateCode== "panel"){
            addPanelWidget(oindex, tile, isFirst, closeDel);
        }else{
            addTileWidget(oindex, tile, isFirst, closeDel);
        }
    };
    var addPanelWidget = function(oindex, tile, isFirst, closeDel){

    };

    var addTileWidget = function(oindex, tile, isFirst, closeDel){
        var tmpl;
        var type = tile.type+'';

        if($('#tile-' + tile.tileTemplateId).length <= 0){
            if(gridster.length > 0){
                gridster[oindex].add_widget("<li id='tile-" + tile.tileTemplateId + "' class='gs-w' data-ott='" + tile.tileTemplateId + "'></li>",
                    parseInt(tile.sizex), parseInt(tile.sizey), parseInt(tile.col), parseInt(tile.row));
            }
        };
        if (type == "3") {
            tmpl = $.templates("#tmpl-chart");
        }else{
            tmpl = $.templates("#tmpl" + type);
        };
        if(closeDel){
            tile["className"] = "panel-box-groups";
        }else{
            tile["className"] = "box-groups";
        }
        tile.sizeStyle = getSizeStyle(tile.sizex,tile.sizey);
        if(tile.type == 3){
            tile.canvasSizeStyle = getSizeStyle(tile.sizex,tile.sizey,"44");
        }
        var htmlOutput = tmpl.render(tile);
        $(document).find("#tile-" + tile.tileTemplateId).html(htmlOutput);
        if(closeDel == true){
            $(".group-panel-ul").find(".ingsht,.lbdestlist,.shewidt,.eacstrslist,.circlelist").remove();
        }else{
            $(document).find("#tile-" + tile.tileTemplateId).addClass("groupli-all-" + tile.type);
        };
        switch (type){  //2数字类 3图表类 4列表类 5 卡片类  6 文本类 7 自定义  8 多媒体
            case "2":
                loadNumberData(tile);
                break;
            case "3":
                loadChartData(tile);
                break;
            case "4":
                loadList(tile);
                break;
            case "5":
                loadCard(tile);
                break;
            case "6":
                loadText(tile,isFirst);
                break;
            case "7":
                loadCustom(tile,isFirst);
                break;
            case "8":
                loadAudio(tile);
                break;
            default:
                break;
        }
    };

    var linkInit = function(cla) {
        $(cla).find("li").each(function () {
            for (var i = 0; i < cu_panel_tiles.length; i++) {
                var t = cu_panel_tiles[i];
                if ($(this)[0].id == t.ideal && t.Url) {
                    var a = $(this).children("div").children("a");
                    a.attr("href", "javascript:void(0);");
                    a.attr("data-url", t.dataSource);
                    a.attr("data-id", t.id);
                    a.attr("data-title", t.title);
                    a.attr("data-target", t.target);
                    a.on('click', function () {
                        var url = a.attr("data-url");
                        var id = a.attr("data-id");
                        var title = a.attr("data-title");
                        var tab = {
                            url: url,
                            id: id,
                            title: title
                        };
                        if (top != self) {
                            //alert('我在框架里');
                            //window.parent.addTab(tab);
                            if(window.top.$("#d" + id).length <= 0){
                                TabsNav.toParentTab(tab);   //点击磁贴触发页签添加的事件
                            }else{
                                TabsNav.toParentTab(tab,"0");
                            }
                        } else {
                            $('a[data-id="' + id + '"]').attr("target", "_blank");
                            $('a[data-id="' + id + '"]').attr("href", url);
                        }

                    });
                }
            }
        });
    };

    //初始化磁贴删除事件
    var removeInit = function() {
        $('.ingsht,.circlelist,.shewidt,.eacstrslist,.lbdestlist').each(function () {
            $(this).unbind('click');
            $(this).on('click', function () {
                var self = this;
                var id = "#" + $(self).data("needid");
                var otype = $(self).attr("data-group");
                top.layer.confirm('删除后无法恢复，确认删除？', {
                        icon : 3,
                        btn: ['确定', '取消']
                    }, function (index) {
                        top.layer.close(index);
                        del_tiles += ","+($(self).data("needid").substring(5));
                        gridster[0].remove_widget($(id));
                        cu_move_tiles.splice($.inArray("breviary_" + id, cu_move_tiles), 1);
                        store_tiles_check_style();
                        for (var i = 0; i < cu_panel_tiles.length; i++) {
                            if ("tile-"+cu_panel_tiles[i].tileTemplateId == $(self).data("needid")) {
                                var tileTemplateId = cu_panel_tiles[i].tileTemplateId;
                                cu_panel_tiles.splice($.inArray(cu_panel_tiles[i], cu_panel_tiles), 1);
                                store_tiles_unmove_style_only(tileTemplateId);
                                //停止磁贴定时刷新
                                ec.clearTileInterval(tileTemplateId);
                                break;
                            }
                        }
                        store_tiles_unmove_style();
                    }
                );


                if (otype == "panel") {
                    var olist = $(id).find("#ul-group-" + $(self).data("needid")).find("li");
                    for(var i = 0, j = olist.length; i< j; i++){
                        store_tiles_unmove_style_only(olist.eq(i).attr("data-ott"));

                    };
                    for(var m = 0, n = cu_panel_tiles.length; m< n; m++){
                        if (cu_panel_tiles[m].tileTemplateId == olist.eq(m).attr("data-ott")) {
                            choose_panel_tiles.push(cu_panel_tiles[m]);
                        };
                    };
                    for(var i = 0, j = choose_panel_tiles.length; i< j; i++){
                        cu_panel_tiles.splice($.inArray(choose_panel_tiles[i], cu_panel_tiles), 1);
                    };
                };

            });
        });
    };
    /*给快捷入口类磁贴绑定点击事件*/
    var shortcut = function(cla) {
        $(cla).find("li").each(function () {
            var a = $(this).children("div").children("a");
            a.off('click').on('click', function () {
                var url = a.attr("data-url");
                aClick(a, url);   //判断快捷入口类磁贴点击跳转
                return false;
            });
        });
    };
    //查询
    $("#searchBtn").click(function () {
        load_tiles_store();
    });

    $("#keyword").keydown(function (e) {
        if (e.keyCode == 13) {
            load_tiles_store();
        }
    });

    $("#apps").change(function () {
        load_tiles_store();
    });

    $("#tile_type").change(function () {
        load_tiles_store();
    });

    //面板中已有，磁贴商店中不能移动的磁贴
    var store_tiles_unmove = function(tileTemplateId) {
        var store_tiles_code = [];
        var panel_tiles_code = [];
        var tiles_same = new Array();
        var n = 0;
        for (var i = 0,j = store_tiles.length?store_tiles.length:0; i < j; i++) {
            var ttId = store_tiles[i].tileTemplateId;
            var templateCode = store_tiles[i].templateCode;
            if(templateCode == "panel"){
                store_tiles_code.push("panel_"+store_tiles[i].tileTemplateId);
            }else{
                store_tiles_code.push(ttId);
            }
        }
        for (var i = 0,j = cu_panel_tiles.length?cu_panel_tiles.length:0; i < j; i++) {
            var ttId2 = cu_panel_tiles[i].tileTemplateId;
            var templateCode2 = cu_panel_tiles[i].templateCode;
            if(templateCode2 == "panel"){
                panel_tiles_code.push("panel_"+cu_panel_tiles[i].tileTemplateId);
            }else{
                panel_tiles_code.push(ttId2);
            }
        }
        for (var i = 0; i < store_tiles_code.length; i++) {
            for (var j = 0; j < panel_tiles_code.length; j++) {
                if (store_tiles_code[i] == panel_tiles_code[j]) {
                    tiles_same[n] = store_tiles_code[i];
                    n++;
                }
            }
        }
        var result = false;
        for (var i = 0; i < tiles_same.length; i++) {
            if (tiles_same[i] == tileTemplateId) {
                result = true;
            }
        }

        return result;
    };
    //加载应用下拉框
    var appsInit = function() {    //页面每次加载的时候都会调用该方法 然后获取到第一个下拉框的数据 将数据动态的渲染到#apps中
        app_array = [];
        Api.ajaxForm(Api.admin+"/api/workbench/WorkbenchHomePage/appAndTypeList",{},function(result){
            if(result.success){
                var tile_datas = result.typeList,   //磁贴集合(第一个下拉框数据)
                    tile_types  = result.workbenchTemplate;   //磁贴类型（第二个下拉框数据）
                $("#apps").empty();
                for (var i = 0,j = tile_datas.length; i < j; i++) {  //将磁贴集合的数据通过addOptions方法动态创建option标签然后放入到#apps中。
                    var app = tile_datas[i];
                    $("#apps").addOptions(app.appName, app.appCode);   //addOptions方法将获取到的数组对象进行遍历然后动态创建option标签
                    var a = { "appName": app.appName, "appCode": app.appCode,"total": 0, "tiles": [] };
                    app_array.push(a);   //返回一个新的关于#apps的数据对象。
                };
                $("#tile_type").empty();
                for (var i = 0; i < tile_types.length; i++) {
                    var tile_type = tile_types[i];
                    $("#tile_type").addOptions(tile_type.templateName, tile_type.templateCode,tile_type.type);
                };
                load_tiles_store(); //每次下拉框选择完具体的磁贴类型之后都会调用该方法。
            }else{
                Mom.layMsg(result.message);
            }
        })
    };

    var getSizeStyle = function(sizex,sizey,titleH){
        var titleH = titleH||0;
        /*  var width = sizex * widthx + (sizex-1) * (margins*2);
          var height = sizey * widthx + (sizey-1) * (margins*2);*/
        var width = sizex * widthx + (sizex-1) * (margins*2);
        var height = sizey * widthx+ (sizey-1) * (margins*2) ;
        return "width: "+width+"px;height: "+(height-titleH)+"px;";

    };

    //磁贴商店中磁贴移到面板的磁贴样式
    var store_tiles_check_style = function() {
        //遍历当前添加的磁贴编码数组变量
        //找到磁贴商店中的磁贴li，并设置样式
        //$(this).parent().css("border","2px solid red")
        $(".tile_li").each(function () {
            $(this).css("border", "1px solid #1ab394");
        });
        for (var i = 0; i < cu_move_tiles.length; i++) {
            var id = "#breviary_" + cu_move_tiles[i];
            $(id).css("border", "2px solid #FF992D");
        }
    };

    //磁贴商店中的磁贴id与容器中的磁贴id进行比较，如果相同为磁贴商店中对应的磁贴添加rightC.png 否则添加add.png
    var store_tiles_unmove_style = function() {
        //商店磁贴
        var store_tiles_code = [];
        //左侧面板内磁贴
        var panel_tiles_code = [];
        //共同存在的磁贴
        var tiles_same = new Array();

        var n = 0;
        //  store_tiles  磁贴商店的数据
        for (var i = 0,j = store_tiles.length?store_tiles.length:0; i < j; i++) {
            var ttId = store_tiles[i].tileTemplateId;
            var templateCode = store_tiles[i].templateCode;
            if(templateCode == "panel"){
                store_tiles_code.push("panel_"+store_tiles[i].id);
            }else{
                store_tiles_code.push(ttId);
            }
        }
        // cu_panel_tiles;   获取到的是拖拽完成之后的数据 即窗口容器中的数据集合 （磁贴管理、分组二  length=4）
        for (var i = 0,j = cu_panel_tiles.length?cu_panel_tiles.length:0; i < j; i++) {
            var ttId2 = cu_panel_tiles[i].tileTemplateId;
            var templateCode2 = cu_panel_tiles[i].templateCode;
            if(templateCode2 == "panel"){
                panel_tiles_code.push("panel_"+cu_panel_tiles[i].tileTemplateId);
            }else{
                panel_tiles_code.push(ttId2);
            }
        }
        for (var i = 0; i < store_tiles_code.length; i++) {
            for (var j = 0; j < panel_tiles_code.length; j++) {
                if (store_tiles_code[i] == panel_tiles_code[j]) {
                    tiles_same[n] = store_tiles_code[i];
                    n++;
                }
            }
        }
        for (var i = 0; i < tiles_same.length; i++) {
            var thisT = $("#store_tile_" + tiles_same[i]);
            thisT.parent().css("opacity", "0.9");
            thisT.parent().find(".bottomCon").children("img").attr("src", "../images/rightC.png");
        }

        //切换磁贴状态！并清空数组 lss 20180424   没有什么用处！
        for (var i = 0; i < del_cu_panel_tiles.length; i++) {
            var thisT = $("#store_tile_" + del_cu_panel_tiles[i]);
            thisT.parent().css("opacity", "0.9");
            thisT.parent().find(".bottomCon").children("img").attr("src", "../images/addB.png");
        }
        del_cu_panel_tiles = [];
    };

    var store_tiles_unmove_style_only = function(id) {
        var thisT = $("#store_tile_" + id);
        thisT.parent().css("opacity", "0.9");
        thisT.parent().find(".bottomCon").children("img").attr("src", "../images/addB.png");
    };


    //加载磁贴商店磁贴   //两个下拉框都选择完成了之后调用该方法
    var load_tiles_store = function() {    //每次下拉框选择完具体的磁贴类型之后都会调用该方法。
        $("#store_group_main").html("");
        var app_name = $("#apps").val() ? $("#apps").val() : '';
        var tile_type = $("#tile_type").val() ? $("#tile_type").val() : '';
        var keyword = $("#keyword").val() ? $("#keyword").val() : '';
        var data = {
            appName : app_name,
            templateCode:tile_type,
            title : keyword,
        };
        app_array.forEach(function (ele,index) {
            ele.total = 0;
            ele.tiles = [];
        });
        Api.ajaxForm(Api.admin + "/api/workbench/WorkbenchHomePage/shopList",data,function(result){
            if(result.success){
                var data = result.allTile;
                store_tiles = data;
                for (var i = 0; i < data.length; i++) {
                    var tile = data[i];
                    tile.code = tile_type;  //shortcut
                    //  tile["thumbnail"] = getThumbnail(tile);   //判断图片是否存在 有的话直接返回该图片 没有的话使用switch语句根据tempId的值指定图片。
                    app_array.forEach(function (ele,index) {
                        if (ele.appCode == tile.appCode) {
                            var tileType=$("#tile_type option:selected").attr('data-id');
                            tile['imgSrc'] = Api.admin+'/img/sys/SysUpload/showTileImg?id='+tile.tileTemplateId+'&type='+tileType;
                            ele.tiles.push(tile);
                            ele.total++;
                        }
                    });
                };
                template.apps = app_array;  //template={};
                var tmpl;
                var htmlOutput;
                if(tile_type == "panel"){
                    tmpl = $.templates("#tile_store_panel_tmpl");
                    htmlOutput = tmpl.render(data);
                    $("#store_group_main").html('<div class="mainCon"><ul class="totleCon" id="store_group_panel">'+htmlOutput+'</ul></div>');
                }else{  //进到这里
                    tmpl = $.templates("#tile_store_Tmpl");
                    htmlOutput = tmpl.render(template);
                    $("#store_group_main").html(htmlOutput);  //将个人工作台的数据动态渲染到#store_group_main容器中
                }

                store_tiles_event();   //为右侧内容区域中动态添加的元素添加拖拽事件
                store_tiles_unmove_style();
            }else{
                Mom.layMsg(result.message);
            }
        });

    };

    //为右侧内容区域中动态添加的元素添加拖拽事件
    var store_tiles_event = function() {
        //单位宽度
        var w = 0; var h = 0; var X = 0; var Y = 0;

        $(".totleCon>li .midCon").each(function () {
            $(this).bind('mousedown', function (e) {
                e.preventDefault();
                timeStart = getTimeNow();//获取鼠标按下时的时间  
                flagB = true;
                return false;
            });
            $(this).bind('mouseup', function (e) {
                e.preventDefault();
                var self = this;
                flagB = false;
                var time = getTimeNow() - timeStart;
                e.preventDefault();

            });
            $(this).bind('mousemove', function (e) {
                e.preventDefault();
                if (getTimeNow() - timeStart > 50 && flagB) {
                    $(".sideOpener").attr("data-p", "off");
                    $(".appendtext").attr("data-p", "off");
                    $("#right-sidebar").animate({ marginRight: "0px" });
                }
                return false;
            });
            $(this).bind('mouseenter', function (e) {
                e.preventDefault();
                flagB = false;
                return false;

            });
            $(this).bind('mouseleave', function (e) {
                e.preventDefault();
                if (getTimeNow() - timeStart > 50 && flagB) {
                    var tileTemplateId = this.id.replace('store_tile_', '');
                    var result = store_tiles_unmove(tileTemplateId);  //判断当前拖拽的元素是否已经存在于容器窗口中
                    if (result) {
                        Mom.layMsg("磁贴已存在，不可重复操作！");
                        return;
                    }
                    var $doc = $(document);
                    var $tips = $('#J_tips');
                    if (!$tips.length) {
                        $tips = $('<div id="J_tips" class="tips"></div>');
                        $('body').append($tips);
                    }
                    //store_tiles  磁贴商店两个下拉框选取完毕之后筛选出来的数据 //个人工作台5条数据
                    for (var i = 0; i < store_tiles.length; i++) {
                        var st =  store_tiles[i].tileTemplateId;
                        if (st == tileTemplateId) {
                            move_tile = store_tiles[i];  //获取到要移动的磁贴的数据
                        }
                        if(st==undefined && "panel_"+store_tiles[i].tileTemplateId == tileTemplateId){
                            move_tile = store_tiles[i];
                        }
                    }

                    $doc.on('mousemove', function (e) {
                        e.preventDefault();
                        var pageX = e.pageX,
                            pageY = e.pageY;
                        var tile_type = $("#tile_type").val() ? $("#tile_type").val() : '';
                        var tmpl;
                        if(tile_type == "panel"){
                            tmpl = $.templates("#panel-tmpl");
                        }else{
                            tmpl = $.templates("#tmpl" + move_tile.type);
                        }
                        htmlOutput = tmpl.render(move_tile);
                        $tips.html(htmlOutput).css({
                            top: pageY - parseInt(move_tile.sizey) * widthx / 2,
                            left: pageX - parseInt(move_tile.sizex) * widthx / 2,
                            width: (parseInt(move_tile.sizex) * widthx) + ((parseInt(move_tile.sizex) - 1) * 20),
                            height: (parseInt(move_tile.sizey) * widthx) + ((parseInt(move_tile.sizey) - 1) * 20)
                        });
                        return false;
                    });
                    $doc.one('mouseup', function (e) {  //只绑定一次 只有首次触发事件时会执行该事件处理函数。触发之后，jQuery就会移除当前事件绑定。
                        X = Math.floor(e.pageX / widthx) - 1;
                        Y = Math.floor(e.pageY / widthx);
                        if (X <= 0) {
                            X = 1;
                        }
                        if (Y == 0) {
                            Y = 1;
                        }
                        $tips.remove();
                        $(this).unbind('mousemove');
                        var is_add = true;
                        $(".function>li").each(function () {
                            var id = $(this)[0].id;
                            var code;

                            if (id == move_tile.tileTemplateId) {
                                is_add = false;
                            }
                        });
                        if (is_add) {
                            move_tile["row"] = Y;
                            move_tile["col"] = X;
                            addWidget(0, move_tile, "0");

                            cu_panel_tiles.push(move_tile);
                            cu_move_tiles.push(move_tile.tileTemplateId);

                            store_tiles_check_style();
                            store_tiles_unmove_style();

                            //每个磁贴的html是异步加载，延迟1秒执行
                            $(".ingsht,.lbdestlist,.shewidt,.eacstrslist,.circlelist").show();
                            setTimeout(function () {
                                removeInit();
                            }, 1000);

                        }
                        return false;
                    });
                    return false;
                }

            })
        });

        $('.hiddenD', window.parent.document).click(function () {
            $(this).hide();
            $(".totleCon>li .midCon").each(function () {
                $(this).parent().css("background", "#515e6f").css("opacity", "1");
                $(this).parent().find(".bottomCon").children("img").attr("src", "../images/addB.png")
            })
        })
    };
    /*判断快捷入口类磁贴点击跳转*/
    var aClick = function(a, url){
        var id = a.attr("data-id");
        var title = a.attr("data-title");
        var target = a.attr("data-target");
        if("ConferenceRoomSchedule" == id){
            oldUrl = a.attr("data-url");
            str = url.substr(url.indexOf("?"));
            url = oldUrl+str;
        }
        var tab = {
            url: url,
            id: id,
            title: title
        };

        var token = Mom.getCookie("token_type") +' '+ Mom.getCookie("authorization");
        token = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIxMjMiLCJzdWIiOiJTdXBlckFkbWluIiwiaXNzIjoiYWRtaW4iLCJhdWQiOiJBZG1pbiBKV1QgT25saW5lIiwiZXhwIjoxNTI3MzE5ODgxLCJuYmYiOjE1MjczMTk4ODF9.Hnk1W7kL7IYv-bjYyH_LEgznvsCQvnNHZZ1_SLhkI9w';
        if(target == 1){  //判断a标签的打开形式  0 创建新的iframe 1  新窗口  2  layer形式
            var param = {'__Token':token};
            postcall(url,param,target);
        }else if(target == 2){
            top.layer.open({
                type: 2,
                title: title,
                maxmin: false,
                area: ['880px', '95%'],
                content:url
            });
        }else{
            if (top != self) {
                tab.url  = Mom.extractUrl(tab.url,"__Token="+encodeURI(token));
                if(window.top.$(".d" + id).length <= 0) {
                    TabsNav.toParentTab(tab,'1');
                }else{
                    TabsNav.toParentTab(tab,"0");
                }
            } else {
                //window.open(url);
                var param = {'__Token':token};
                postcall(url,param,'_blank');
            }
        }
    };

    var postcall = function( url, params, target){  //跳转到第三方系统事件
        var tempform = document.createElement("form");
        tempform.action = url;
        tempform.method = "post";
        tempform.style.display="none";
        if(target) {
            tempform.target = target;
        };
        for (var x in params) {
            var opt = document.createElement("input");
            opt.name = x;
            opt.value = params[x];
            tempform.appendChild(opt);
        };
        var opt = document.createElement("input");
        opt.type = "submit";
        tempform.appendChild(opt);
        document.body.appendChild(tempform);
        tempform.submit();
        document.body.removeChild(tempform);
    };

    //获取此刻时间  
    var getTimeNow = function() {
        var now = new Date();
        return now.getTime();
    };


    function tileErrormes(tile,errorMsg){
        $('#tile-'+tile.tileTemplateId).find('div.data-div').hide();
        $('#tile-'+tile.tileTemplateId).find('div.error-div').show().html(errorMsg);

    }

    function ajaxToServer_quite(url, data, tile, callbackFun){//传送的参数是josn时
        var errorContainer = $("#tile-"+tile.tileTemplateId);
        errorContainer.find('.loading-img').show();
        url = url.toLowerCase().indexOf("http://") == 0? url : (admin_Api + url);
        $.ajax({
            headers:{
                Accept: "application/json; charset=utf-8",
                Authorization: Mom.getCookie("token_type")+" " + Mom.getCookie("authorization")
            },
            type: "post",
            url: url,
            data: data,
            dataType: 'json',
            contentType:'application/json',
            success: function(result){
                errorContainer.find('.loading-img').hide();
                if(result.success == false){
                    if(result.retCode == "30009"){  //用户登录信息失效
                        errorContainer.find('div.data-div').hide();
                        errorContainer.find('div.error-div').show().html('用户登录信息失效!');
                        //$("#quit-btn",top.document).children("i").trigger("click");
                        //top.location.href='../login.html';
                        return;
                    }
                }
                if(callbackFun){
                    callbackFun(result);
                }
            },
            error:function(){
                errorContainer.find('.loading-img').hide();
                errorContainer.find('div.data-div').hide();
                errorContainer.find('div.error-div').show().html('请求服务器异常!');

            }
        });
    }
    function ajaxToServer1_quite(url, data, tile, callbackFun){//传送的参数是String时
        var errorContainer = $("#tile-"+tile.tileTemplateId);
        errorContainer.find('.loading-img').show();
        url = url.toLowerCase().indexOf("http://") == 0? url : (Api.admin + url);
        $.ajax({
            headers:{
                Accept: "application/json; charset=utf-8",
                Authorization: Mom.getCookie("token_type")+" " +Mom.getCookie("authorization")
            },
            type: "post",
            url: url,
            data: data,
            dataType: 'json',
            contentType:'application/x-www-form-urlencoded',
            success: function(result){
                errorContainer.find('.loading-img').hide();
                if(result.success == false){
                    if(result.retCode == "30009"){  //用户登录信息失效
                        errorContainer.find('div.data-div').hide();
                        errorContainer.find('div.error-div').show().html('用户登录信息失效!');
                        //$("#quit-btn",top.document).children("i").trigger("click");
                        //top.location.href='../login.html';
                        return;
                    }
                }
                if(callbackFun){
                    callbackFun(result);
                }
            },
            error:function(){
                errorContainer.find('.loading-img').hide();
                errorContainer.find('div.data-div').hide();
                errorContainer.find('div.error-div').show().html('请求服务器异常!');
            }
        });
    }

    //加载数字类磁贴
    var loadNumberData = function(tile) {
        function loadNumberData_request(){
            // var url="http://localhost:63342/admin-web/json/test.json";
            var url =$.trim(tile.dataSource);
            ajaxToServer_quite(url,{},tile,function(result){
                if(result.success == true){
                    var data = result.message;
                    $("#num" + tile.tileTemplateId).empty().html(data).attr("title",tile.title);
                }else{
                    tileErrormes(tile,result.message);
                }
            });
        }
        loadNumberData_request();
        //磁贴定时刷新
        ec.startTileInterval(tile.tileTemplateId, tile.timeInteval, function(){
            loadNumberData_request();
        });

    };

    //加载图表类磁贴
    var loadChartData = function (tile) {
        /*写入data 以及*/
        var url =$.trim(tile.dataSource);
        var errorConatiner = $("#"+tile.tileTemplateId);
        function loadChartData_request(){
            ajaxToServer1_quite(url,{},tile,function(result){
                if(result.success=true){
                    if (tile.templateCode == 'line') {
                        ec.line(result.rows, tile.tileTemplateId, tile);
                    } else if (tile.templateCode == 'bar') {
                        ec.bar(result.rows, tile.tileTemplateId, tile);
                    } else if (tile.templateCode == 'pie') {
                        ec.pie(result.rows, tile.tileTemplateId, tile);
                    } else if (tile.templateCode == 'gauge') {
                        ec.gauge(result.rows, tile.tileTemplateId, tile);
                    }
                }else{
                    tileErrormes(tile,result.message);
                }

            });
        }

        loadChartData_request();
        //磁贴定时刷新
        ec.startTileInterval(tile.tileTemplateId, tile.timeInteval, function(){
            loadChartData_request();
        });
    };
    //加载列表类磁贴
    var loadList = function(tile){
        var columnName = (tile.wlColumnName||tile.columnName||"").changedouhao().changemaohao();
        var columns = [],operArr = [];
        var cns = columnName.split(';');
        for (var i = 0; i < cns.length; i++) {
            var cns_i = $.trim(cns[i]);
            if(cns_i.length>0){
                var kv = cns_i.split(':');
                if (kv.length > 1) {
                    var kv0 = $.trim(kv[0]),
                        kv1 = $.trim(kv[1]);
                    if( !kv[0].startWith('oper_') ){
                        columns.push({ 'field': kv0, 'title': kv1,'align': 'center' });
                    }else{
                        operArr.push(kv1+":"+kv[2]);
                    }
                }
            }

        };
        function loadList_request(columns){
            // alert(tile.tileTemplateId);
            var url = $.trim(tile.dataSource);
            ajaxToServer_quite(url,{},tile,function(result){
                if(result.success==false){
                    tileErrormes(tile,result.message);
                }else{
                    var datas = result.rows;
                    var headerHtml="";
                    var templObj = $('#tile-'+tile.tileTemplateId);
                    if(operArr.length>0){
                        $(operArr).each(function(index,item){
                            var arr = item.split(":");
                            headerHtml += "<th>"+arr[0]+"</th>";
                        })
                    }
                    $(columns).each(function(index,item){
                        headerHtml += "<th>"+item.title+"</th>";
                    });
                    templObj.find('.renderTable-thead tr').empty().append(headerHtml);

                    new SmallPage().init({
                        dataList: datas,
                        pageSize:tile.wlPageSize,
                        container: templObj.find('.page-container')
                    },function(rows){
                        var bodyHtml = "";
                        for(var j=0; j<rows.length; j++){
                            var item1 = rows[j];
                            bodyHtml += "<tr>";
                            if(operArr.length>0) {
                                var opArr = operArr[0].split(":");
                                bodyHtml += "<td><a data-tileid = '"+tile.tileTemplateId+"' data-id='"+item1.ID+"' href='javascript:;' onclick='javascript:"+opArr[1]+"'>" + opArr[0] + "</a></td>";
                            }
                            $(columns).each(function(index2,item2){
                                bodyHtml += "<td>"+item1[item2.field]+"</td>";
                            });

                            bodyHtml += "</tr>";
                        }
                        templObj.find('.renderTable-tbody').empty().append(bodyHtml);
                    });

                }

            });
        }

        loadList_request(columns);
        ec.startTileInterval(tile.tileTemplateId, tile.timeInteval, function(){
            loadList_request(columns);
        });

    };
    var cancel_Alarm;
    function cancelAlarm(event){
        var id = $(event).attr('data-id');
        cancel_Alarm = event;
        openEditDialog("取消报警","../mes/cancelAlarm.html?dataId="+id,"390px","240px",cancelAlarm_callback);

    }
    function cancelAlarm_callback(iframeWin, body, layIdx){
        //调用表单内部方法，提交表单
        iframeWin.contentWindow.doSubmitForm(layIdx,function(){
            if(cancel_Alarm){
                $(cancel_Alarm).parent().parent().remove();
            }
        });
    }

    //加载卡片类磁贴
    var loadCard = function(tile){

    };

    //加载文本类磁贴
    var loadText = function(tile){

    };

    //加载自定义类磁贴
    var loadCustom = function(tile){

    };

    //加载多媒体类磁贴
    var loadAudio = function(tile){

    };

    //关闭右侧磁贴商店
    var closeStore = function(){  //点击磁贴商店关闭按钮事件
        $('.sideOpener').attr("data-p", "off");
        $('.sideOpener').html('<b>&lt;</b>');
        $(".appendtext").attr("data-p", "off");
        $("#right-sidebar").animate({ marginRight: "0px" });
    };


    return {
        register_tile: register_tile,
        closeStore: closeStore

    }
});