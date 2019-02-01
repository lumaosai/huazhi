/**
 * Created by Dora on 2018/9/20.
 */

//<!--list1 左上数据-->
//<!--list2 右上数据-->
//<!--list3 左下数据-->
require(['/js/zlib/app.js'], function (App) {
    var PageModule = {
        list1Id:'',
        list2Id:'',
        list3Id:'',
        dataList:[],
        nodataHtml : "<p class='nodata mgt-10'>暂无数据</p>",
        init:function () {
            PageModule.setConfigHight();
            $(window).resize(function(){
                PageModule.setConfigHight();
            });
            //加载运输类型数据
            PageModule.loadData(Api.mtrl + "/api/fm/TransGauge/getTypes");
            //加载物料数据
            //var material = {};
            //PageModule.loadData(Api.adminDev + "/warehouse.json",warehouse);

            PageModule.clickHandler();
        },
        setConfigHight:function(){
            $('.config-item').each(function(i,o) {
                var $configItemTit =  $(this).find('.config-item-tit'),
                    $toolbarForm = $(this).find('.toolbar-form ');
                var itemTitH = $configItemTit.length ? $configItemTit.outerHeight(true) : 0,
                    toolBarFormH = $toolbarForm.length?$toolbarForm.outerHeight(true): 0,
                    minusHeight = ($(this).outerHeight(true) - (itemTitH + toolBarFormH) -30);
                $(this).find('.config-data').height(minusHeight);
            });
        },
        loadData:function (url,data,item) {
            Api.ajaxJson(url,data,function (result) {
                if(result.success){
                    var data1  = result.transportTypeList;
                    var data2  = result.gaugeTypeList;
                    //加载左上边数据
                    PageModule.createList1(data1);
                    //加载右边数据
                    PageModule.createList2(data2)
                }
            })
        },
        //创建左上列表
        createList1:function (data,item) {
            var htmls = '',len = data.length;
            console.log(data);
            if(len>0){
                $.each(data,function(i,o){
                    htmls += "<li  data-id='"+o.value+"'>"+o.label+"</li>";
                });
                $("#list1").empty().html(htmls);
            }else{
                $("#list1").empty().html(PageModule.nodataHtml);
            }
            $("#list1").on("click","li",function () {
                $(this).addClass("active").siblings("li").removeClass("active");
                PageModule.list1Id =  $(this).attr("data-id");
                Api.ajaxForm(Api.mtrl +"/api/fm/TransGauge/queryGaugeList/"+PageModule.list1Id,{},function (result) {
                    if(result.success){
                        PageModule.dataList = result.rows;
                        PageModule.createList3();
                    }
                })
            })
        },
        //创建右边列表
        createList2:function (data) {
            var htmls = '',len = data.length;
            if(len>0) {
                $.each(data, function (i, o) {
                    htmls += "<li  data-id='" + o.value + "'>" + o.label + "</li>";
                });
                $("#list2").empty().html(htmls);
            }else{
                $("#list2").empty().html(PageModule.nodataHtml);
            }
            $("#list2").on("click","li",function(){
                PageModule.list2Id =  $(this).attr("data-id");
                $(this).addClass("active").siblings("li").removeClass("active");
            });
        },
        //创建已分配列表
        createList3:function () {
            var data = PageModule.dataList;
            var htmls = '',len = data.length;
            if(len>0){
                $.each(data,function(i,o){
                    htmls +="<li data-id='"+o.gaugeType+"'>"
                        +"<span>"+ o.gaugeTypeName +"</span></li>";
                });
                $("#list3").empty().html(htmls);
            }else{
                $("#list3").empty().html(PageModule.nodataHtml);
            }
            $("#list3").on("click","li",function(){
                PageModule.list3Id =  $(this).attr("data-id");
                $(this).addClass("active").siblings("li").removeClass("active");
            });
        },
        clickHandler:function () {
            //点击左箭头
            $("#btn-left").unbind("click").on("click",function () {
                var len = $("#list1").find(".active").length;  //仓库是否选中
                if(len<=0){
                    Mom.layMsg('请选择运输类型');
                }else{
                    if($("#list2").find(".active").length<=0){
                        Mom.layMsg('请选择计量类型')
                    }else{
                        var id = $("#list2 .active").attr("data-id");
                        var name = $("#list2 .active").text();
                        var exist = PageModule.criteria(PageModule.dataList,id);
                        if(exist){
                            PageModule.dataList.push({
                                transType:PageModule.list1Id,
                                gaugeType:id,
                                gaugeTypeName:name
                            });
                            PageModule.createList3();
                        }else{
                            Mom.layMsg("该计量类型已经存在")
                        }
                    }
                }
            });
            //点击右箭头
            $("#btn-right").unbind("click").on("click",function () {
                var len = $("#list3 .active").length;
                if(len>0){
                    var ids = $("#list3 .active").attr("data-id");
                    for(var i=0;i<PageModule.dataList.length;i++){
                        if(PageModule.dataList[i].gaugeType == ids){
                            PageModule.dataList.splice(i,1);
                            PageModule.createList3()
                        }
                    }
                }else{
                    Mom.layMsg("请选择已分配的计量类型")
                }
            });

            //上移按钮
            $("#btn-up").unbind("click").on("click",function () {
                $("#list3 li").each(function (index,item) {
                    if($(item).attr("class") == "active"){
                        var arr =  PageModule.upRecord(PageModule.dataList,index);
                        var $tr = $(this);
                        $tr.prev().before($tr);
                    }
                })
            });

            //下移按钮
            $("#btn-down").unbind("click").on("click",function () {
                $("#list3 li").each(function (index,item) {
                    if($(item).attr("class") == "active"){
                        var arr =  PageModule.downRecord(PageModule.dataList,index);
                        var $tr = $(this);
                        $tr.next().after($tr);
                    }
                })
            });

            $("#btn-save").unbind("click").on("click",function(){
                var data ={
                    transGauges:JSON.stringify(PageModule.dataList),
                    transType:PageModule.list1Id
                };
                Api.ajaxForm(Api.mtrl+'/api/fm/TransGauge/saveConfigGauge',data,function(result){
                    if(result.success){
                        Mom.layMsg("保存成功")
                    }
                })
            })
        },
        criteria:function (data,ids) {
            var bol = true;
            for(var i=0;i<data.length;i++){
                if(data[i].gaugeType == ids){
                    bol = !bol;
                }else {
                    bol = bol;
                }
            }
            return bol;
        },
        swapItems : function(arr, index1, index2) {
            arr[index1] = arr.splice(index2, 1, arr[index1])[0];
            return arr;
        },
        upRecord:function(arr, $index) {
            if($index == 0) {
                return;
            }
            var arr = PageModule.swapItems(arr, $index, $index - 1);
            return arr
        },
        downRecord:function(arr, $index) {
            if($index == arr.length -1) {
                return;
            }
            var arr = PageModule.swapItems(arr, $index, $index + 1);
            return arr
        }
    };
    $(function () {
        //运输配置
        if ($('#configTransport').length > 0) {
            PageModule.init();
        }
    });

});