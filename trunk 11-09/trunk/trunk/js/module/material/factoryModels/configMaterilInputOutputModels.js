/**
 * Created by Dora on 2018/9/20.
 */

//<!--list1 左上数据-->
//<!--list2 右上数据-->
//<!--list3 左下数据-->
require(['/js/zlib/app.js'], function (App) {
    Mom.include('_myCss_insert','/css/',[
        'allocation.css'
    ]);
    var PageModule = {
        list1Id:'', //数据1data-id
        list2Id:'', //好像没用着，先留着
        list3Id:'', //好像没用着，先留着
        dataList:[],//保存已分配的数组，作为保存时提交的参数
        init:function () {
            //加载下拉选项数据
            PageModule.loadData();
            //加载料线数据
            PageModule.loadList1Data();
            //加载料仓数据
            PageModule.loadList2Data();
            //一些点击事件
            PageModule.clickHandler();
        },
        //加载数据 左上列表 右上列表 下拉选项
        loadData:function(){
            Api.ajaxJson(Api.mtrl + '/api/fm/MtrlInoutput/form/0',{},function (result) {
                if(result.success){
                    //工厂
                    var fctrList = result.fctrList;
                    //装卸台
                    var areaLoadRackList =result.areaLoadRackList;
                    //物料类型
                    var mtrlTypeList = result.mtrlTypeList;

                    Bus.appendOptionsValue('#fctrName1',fctrList,'id','fctrName');
                    Bus.appendOptionsValue('#fctrName2',fctrList,'id','fctrName');
                    Bus.appendOptionsValue('#mtrlType',mtrlTypeList,'value','label');
                    Bus.appendOptionsValue('#areaLoadRack',areaLoadRackList,'id','areaName');


                }
            })
        },
        //加载进出厂点数据
        loadList1Data:function(){
            var querydata = {//查询条件
                nodeAreaId:$("#areaLoadRack").val(),
                nodename:$("#nodename").val(),
                fctrId:$("#fctrName1").val()
            };
            data = JSON.stringify(querydata);
            Api.ajaxJson(Api.mtrl + '/api/fm/NodeInoutput/fctrInoutput',data,function (result) {
                if(result.success){
                    PageModule.createList1(result.rows);
                }
            })
        },
        //加载物料数据
        loadList2Data:function(){
            var querydata = {//查询条件
                fctrId:$("#fctrName1").val(),
                mtrl:{
                    mtrlType:$("#mtrlType").val(),
                    mtrlName:$("#mtrlName").val()
                }
            };
            var data = JSON.stringify(querydata);
            Api.ajaxJson(Api.mtrl + '/api/fm/MtrlFctr/findListByFctr',data,function (result) {
                if(result.success){
                    PageModule.createList2(result.rows);
                }
            })
        },
        //创建左上列表
        createList1:function (data,item) {
            var htmls = '';
            for(var i=0;i<data.length;i++){
                htmls += "<li data-id='"+data[i].nodeId+"'>"+data[i].nodename+"</li>"
            }
            $("#list1").html(htmls);

            $("#list1").on("click","li",function () {
                $(this).addClass("active").siblings("li").removeClass("active");
                PageModule.list1Id =  $(this).attr("data-id");
                var data = JSON.stringify({
                    nodeId:PageModule.list1Id
                });
                Api.ajaxJson(Api.mtrl +"/api/fm/MtrlInoutput/findList",data,function (result) {
                    if(result.success){
                        PageModule.dataList = result.rows;
                        PageModule.createList3()
                    }
                })
            })
        },
        //创建右边列表
        createList2:function (data) {
            var htmls = '';
            for(var i=0;i<data.length;i++){
                htmls += "<li data-enable='"+ data[i].enable +"' data-id='"+data[i].mtrlId+"'>"+data[i].mtrl.mtrlName+"</li>";
            }

            $("#list2").html(htmls);
            $("#list2").on("click","li",function(){
                PageModule.list2Id =  $(this).attr("data-id");
                $(this).addClass("active").siblings("li").removeClass("active");
            });
        },
        //创建已分配列表
        createList3:function () {
            var data = PageModule.dataList;
            var htmls = '';
            for(var i=0;i<data.length;i++){
                htmls += "<li data-id='"+data[i].mtrlId+"'>"+data[i].mtrl.mtrlName;

                if(data[i].mtrl.enable){
                    htmls += "<div class='pull-right'>"
                        +"<i class='fa fa-dot-circle-o'>已启用</i>"
                        +"<i class='fa fa-circle-o'>未启用</i>"
                        +"</div>"
                }else{
                    htmls += "<div class='pull-right'>"
                        +"<i class='fa fa-circle-o '>已启用</i>"
                        +"<i class='fa fa-dot-circle-o'>未启用</i>"
                        +"</div>"
                }

                htmls +="</li>";
            }
            $("#list3").html(htmls);
            $("#list3").on("click","li",function(){
                PageModule.list3Id =  $(this).attr("data-id");
                $(this).addClass("active").siblings("li").removeClass("active");
            });
        },
        clickHandler:function () {
            //点击左箭头
            $("#btn-left").unbind("click").on("click",function () {
                var len = $("#list1").find(".active").length;  //进出厂点是否选中
                if(len<=0){
                    Mom.layMsg('请选择进出厂点');
                }else{
                    if($("#list2").find(".active").length<=0){
                        Mom.layMsg('请选择进出厂点物料')
                    }else{
                        var id = $("#list2 .active").attr("data-id");
                        var name = $("#list2 .active").text();
                        var enable = $("#list2 .active").attr("data-enable");
                        var exist = PageModule.criteria(PageModule.dataList,id);
                        if(exist){
                            PageModule.dataList.push({
                                mtrlId:id,
                                nodeId:PageModule.list1Id,
                                mtrl:{
                                    mtrlName:name,
                                    enable:enable
                                }
                            });
                            PageModule.createList3();
                        }else{
                            Mom.layMsg("该物料已经存在")
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
                        if(PageModule.dataList[i].mtrlId == ids){
                            PageModule.dataList.splice(i,1);
                            PageModule.createList3()
                        }
                    }
                }else{
                    Mom.layMsg("请选择已分配的物料")
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

            //点击保存
            $("#btn-submit").unbind("click").on("click",function(){

                var mtrlInoutput = null;
                if(PageModule.dataList.length>0){
                    mtrlInoutput = PageModule.dataList
                }else{
                    mtrlInoutput = [{
                        nodeId:PageModule.list1Id
                    }]
                }
                var data = {
                    mtrlInoutput:JSON.stringify(mtrlInoutput)
                };
                Api.ajaxForm(Api.mtrl + "/api/fm/MtrlInoutput/save" ,data,function(result){
                    if(result.success){
                        Mom.layMsg("保存成功")
                    }
                })
            });

            //点击料线查询按钮
            $("#btn-search1").unbind("click").on("click",function(){
                PageModule.loadList1Data();
            });

            //点击料仓查询按钮
            $("#btn-search2").unbind("click").on("click",function(){
                PageModule.loadList2Data();
            })
        },
        criteria:function (data,ids) {
            var bol = true;
            for(var i=0;i<data.length;i++){
                if(data[i].mtrlId == ids){
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
        //料线料仓配置
        if ($('#configMaterilInputOutputModels').length > 0) {
            PageModule.init();
        }
    });

});