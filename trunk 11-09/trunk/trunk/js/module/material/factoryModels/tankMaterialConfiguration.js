/**
 * Created by lumaosai on 2018/9/26.
 */
require(['/js/zlib/app.js'],function (app) {
    Mom.include('_myCss_insert','/css/',[
        'allocation.css'
    ]);
    var PageModule = {
        init:function () {
            Api.ajaxJson(Api.mtrl + "/api/fm/MtrlTank/form/0",{},function (result) {
                if(result.success){
                    Bus.appendOptionsValue('#fctrId',result.fctrList,'id','fctrName');
                    Bus.appendOptionsValue('#fctrId1',result.fctrList,'id','fctrName');
                    Bus.appendOptionsValue('#nodeAreaId',result.areaTankList,'id','areaName');
                    Bus.appendOptionsValue('#mtrlType',result.mtrlTypeList,'value','label');
                }else{
                    Mom.layMsg(result.message);
                }
            });
            //加载罐数据
             function tankLoad(){
                 var nodename = $('#nodename').val(),
                     fctrId = $("#fctrId1 option:selected").val(),
                     nodeAreaId = $("#nodeAreaId option:selected").val();
                 var data = {
                     nodename:nodename,
                     fctr:{
                         id:fctrId
                     },
                     nodeAreaId:nodeAreaId,
                 };
                 PageModule.loadData(Api.mtrl + "/api/fm/NodeTank/findListByFctr",JSON.stringify(data),"warehouse");
             }
            tankLoad();
            //加载罐物料
            function tankMaterialLoad(){
                var mtrlName = $('#mtrlName').val(),
                    fctrId = $("#fctrId option:selected").val(),
                    mtrlType = $("#mtrlType option:selected").val();
                var data = {
                    mtrl:{
                        mtrlName:mtrlName,
                        mtrlType:mtrlType
                    },
                    fctr:{
                        id:fctrId
                    }
                };
                PageModule.loadData(Api.mtrl + "/api/fm/MtrlFctr/findListByFctr",JSON.stringify(data),"advocate");
            }
            tankMaterialLoad();

            PageModule.clickHandler();
            // 罐查询
            $('#btn-search1').unbind('click').on('click',function(){
                tankLoad();
            });
            // 罐物料查询
            $('#btn-search2').unbind('click').on('click',function(){
                tankMaterialLoad();
            });
            // 保存按钮
            $('#btn-submit').unbind('click').on('click',function(){
                 var mtrlTank = [];

                $('.allocated li').each(function(index,item){
                    var obj = {};
                    obj.nodeId = $(this).attr('data-nodeId');
                    obj.mtrlId = $(this).attr('data-mtrlId');

                    mtrlTank.push(obj);
                });
                if(mtrlTank.length < 1){
                    var obj = {};
                    obj.nodeId = $(".warehouse .active").attr("data-id");
                    mtrlTank.push(obj);
                }
                var data = {
                    mtrlTank : JSON.stringify(mtrlTank)
                }
                    Api.ajaxForm(Api.mtrl + "/api/fm/MtrlTank/save",data,function (result) {
                        if(result.success){
                            Mom.layMsg(result.message);
                        }else{
                            Mom.layMsg(result.message);
                        }
                    });
            });
        },

        //加载数据
        loadData:function (url,data,item) {
            Api.ajaxJson(url,data,function (result) {
                if(result.success){
                    var data  = result.rows;
                    if(item == "warehouse"){
                        PageModule.createList(data,item);
                    }else{
                        PageModule.createMaterial(data,"advocate")
                    }
                }
            })
        },

        //右侧列表
         createMaterial:function(data,mainItem){
            $("."+mainItem).empty();
            for(var i=0;i<data.length;i++){

                    var li = $("<li data-id='"+data[i].id+"' data-mtrlId='"+data[i].mtrlId+"' data-enable='"+data[i].mtrl.enable
                        +"'>"+data[i].mtrl.mtrlName+"</li>");
                    $(".advocate").append(li)

            }
            $("."+mainItem+" li").click(function () {
                $(this).addClass("active").siblings("li").removeClass("active");
            })

        },
        //创建罐列表
         createList:function (data,item) {
            $("."+item).empty();
            for(var i=0;i<data.length;i++){

                var li = $("<li data-id='"+data[i].id+"'>"+data[i].nodename+"</li>");
                $("."+item).append(li);
            }
            $("."+item+" li").click(function () {
                var warehouseId = ""
                $(this).addClass("active").siblings("li").removeClass("active");
                 var id =  $(this).attr("data-id");
                 var data = {
                     nodeId : id
                 }
                Api.ajaxJson(Api.mtrl + "/api/fm/MtrlTank/findList",JSON.stringify(data),function (result) {
                    if(result.success){
                        var data = result.rows;
                        PageModule.createAllocated(data)
                    }
                })
            })
        },

        // 已经分配的物料按钮操作
        clickHandler:function (dataList) {
            //左移按钮
            $(".btn-left").unbind("click").on("click",function () {
                var len = $(".warehouse .active").length;  //仓库是否选中
                if(len<=0 && dataList == undefined){
                    Mom.layMsg("请选择罐");
                }else{
                    var obj = {};
                    if($(".advocate .active").length<=0){
                        Mom.layMsg("请选择罐物料");
                    }else{
                        var id = $(".advocate .active").attr("data-mtrlId");
                        var mtrlId = $(".advocate .active").attr("data-mtrlId");
                        var enable = $(".advocate .active").attr("data-enable");
                        var nodeId = $(".warehouse .active").attr("data-id");
                        //var name = $(".advocate .active").text();
                        var exist = PageModule.criteria(dataList,id);
                        var name = $(".advocate .active").text();
                        if(exist){
                            var obj = {
                                id:id,
                                nodeId:nodeId,
                                mtrlId: mtrlId,
                                mtrl:{
                                    mtrlName:name,
                                    enable:enable
                                }
                            }
                            dataList.push(obj)
                        }else{
                            Mom.layMsg("该物料已经存在");
                        }
                    }
                }
                PageModule.createAllocated(dataList)
            });
            //右移按钮
            $(".btn-right").unbind("click").on("click",function () {
                var len = $(".allocated .active").length;
                if(len>0){
                    var ids = $(".allocated .active").attr("data-id");
                    for(var i=0;i<dataList.length;i++){
                        if(dataList[i].id == ids){
                            dataList.splice(i,1);
                            PageModule.createAllocated(dataList)
                        }
                    }
                }else{
                    Mom.layMsg("请选择已分配的物料");
                }
            });

            //上移按钮
            $("#btn-up").unbind("click").on("click",function () {
                $(".allocated li").each(function (index,item) {
                    if($(item).attr("class") == "active"){
                        var arr =  PageModule.upRecord(dataList,index);
                        var $tr = $(this);
                        $tr.prev().before($tr);
                    }
                })
            });

            //下移按钮
            $("#btn-down").unbind("click").on("click",function () {
                $(".allocated li").each(function (index,item) {
                    if($(item).attr("class") == "active"){
                        var arr =  PageModule.downRecord(dataList,index);
                        var $tr = $(this);
                        $tr.next().after($tr);
                    }
                })
            });
        },

        //创建已经分配的物料
        createAllocated:function (data) {
            $(".allocated").empty();
            for(var i=0;i<data.length;i++){
                if(data[i].mtrl.enable == 1){
                    var str = "<li data-id='"+data[i].id+"' data-nodeId='"+data[i].nodeId+"' data-mtrlId='"+data[i].mtrlId+"'>" +
                        "<span>"+data[i].mtrl.mtrlName + "</span>"+
                        "<div class='allocated-right'>" +
                        "<i class='fa fa-dot-circle-o'>已启用</i>" +
                        "<i class='fa fa-circle-o'>未启用</i>"
                    "</div>"
                    "</li>";
                    var li = $(str);
                    $(".allocated").append(li);
                }else{
                    var str = "<li data-id='"+data[i].id+"' data-nodeId='"+data[i].nodeId+"' data-mtrlId='"+data[i].mtrlId+"'>" +
                        "<span>"+data[i].mtrl.mtrlName + "</span>"+
                        "<div class='allocated-right'>" +
                        "<i class='fa fa-circle-o'>已启用</i>" +
                        "<i class='fa fa-dot-circle-o'>未启用</i>"
                    "</div>"
                    "</li>";
                    var li = $(str);
                    $(".allocated").append(li);
                }
            };
            $(".allocated li").click(function () {
                $(this).addClass("active").siblings("li").removeClass("active");
            })
            PageModule.clickHandler(data)
        },

        criteria:function (data,ids) {
            var bol = true;
            for(var i=0;i<data.length;i++){
                if(data[i].id == ids){
                    bol = !bol;
                }else {
                    bol = bol;
                }
            };
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
        if ($('#tankMaterialConfiguration').length > 0) {
            PageModule.init();
        }
    })
})

