require(['/js/zlib/app.js'],function (app) {
    Mom.include('_myCss_insert','/css/',[
        'allocation.css'
    ]);
   var PageModule = {
        init:function () {
            //初始化加载所有下拉以及列表
            var itemArr = ["list1","list2"];
            PageModule.loadData(Api.mtrl+"/api/fm/MtrlStock/form/"+0,{},itemArr);
            //给按钮加载事件
            PageModule.clickHandler();
            //仓库查询
            $("#btn-search1").click(function () {
                var data = {
                    fctrId:$("#fctrName option:selected").val(),
                    areaName:$("#areaName").val(),
                    stockType:$("#tankType option:selected").val()
                };
                Api.ajaxJson(Api.mtrl+"/api/fm/AreaStock/list",JSON.stringify(data),function (result) {
                    PageModule.createInitList("list1",result.rows);
                })
            });
            //物料查询
            $("#btn-search2").click(function () {
                //查询物料列表
                var data ={
                    mtrl:{mtrlName:$("#mateName").val(),
                    mtrlType:$("#mateType option:selected").val()},
                    fctrId:$("#fctrName2 option:selected").val(),   //工厂id
                };
                Api.ajaxJson(Api.mtrl+"/api/fm/MtrlFctr/findListByFctr",JSON.stringify(data),function (result) {
                var data = [];
                    for(var i=0;i<result.rows.length;i++){
                        for(var k=0;k<result.rows.length;k++){
                            result.rows[k].mtrl.id = result.rows[k].mtrlId
                        }
                    data.push(result.rows[i].mtrl);
                    };
                    PageModule.createInitList("list2",data);
                })
                //查询已分配物料接口
                var dataItem = {
                    nodeAreaId:$("#list1 .active").attr("data-id"),
                    mtrl:{
                        mtrlType:$("#mateType option:selected").val()
                    }
                };
                Api.ajaxJson(Api.mtrl+"/api/fm/MtrlStock/findList",JSON.stringify(dataItem),function (result) {
                    if(result.success){
                        var data = result.rows;
                        PageModule.createAllocated(data,"list3");
                        PageModule.clickHandler(data);   //操作按钮通过操作数据进行渲染
                    }
                })
            });
        },
       //加载下拉以及仓库、物料列表数据，并且创建下拉
       loadData:function (url,data,itemArr) {
           Api.ajaxForm(url,data,function (result) {
               Bus.appendOptionsValue('#fctrName',result.fctrList,'id','fctrName');  //加载工厂下拉
               Bus.appendOptionsValue('#fctrName2',result.fctrList,'id','fctrName');  //加载工厂下拉
               Bus.appendOptionsValue('#tankType',result.stockTypeList,'value','label');  //加载仓库类型下拉
               Bus.appendOptionsValue('#mateType',result.mtrlTypeList,'value','label');  //加载物料类型下拉
               for(var i=0;i<itemArr.length;i++){
                  if(itemArr[i] == "list1"){
                      PageModule.createInitList(itemArr[i],result.areaStockList);
                  }else{
                      var data = [];
                      for(var k=0;k<result.mtrlList.length;k++){
                          result.mtrlList[k].mtrl.id = result.mtrlList[k].mtrlId;
                          data.push(result.mtrlList[k].mtrl);
                      };
                      PageModule.createInitList(itemArr[i],data);
                  }
               }
           })
       },
       //初始化创建仓库、物料列表
       createInitList:function (item,rows) {
           $("#"+item).empty();
            if(item == "list1"){
                for(var i=0;i<rows.length;i++){
                    var li = $("<li data-id='"+rows[i].id+"'>"+rows[i].areaName+"</li>");
                    $("#"+item).append(li);
                };
            }else{
                for(var i=0;i<rows.length;i++){
                    var li = $("<li data-id='"+rows[i].id+"'>"+rows[i].mtrlName+"</li>");
                    $("#"+item).append(li);
                };
            }
            $("#"+item+" li").unbind("click").on("click",function () {
                if(item == "list1"){
                    PageModule.clickLoad($(this).attr("data-id"))
                }
                $(this).addClass("active").siblings("li").removeClass("active");
            });
       },
       //点击仓库加载已分配列表
       clickLoad:function (ids) {
            var data = {
                nodeAreaId:ids,
                mtrl:{
                    mtrlType:$("#mateType option:selected").val()
                }
            };
        Api.ajaxJson(Api.mtrl+"/api/fm/MtrlStock/findList",JSON.stringify(data),function (result) {
              if(result.success){
                     var data = result.rows;
                     PageModule.createAllocated(data,"list3");
                     PageModule.clickHandler(data);   //操作按钮通过操作数据进行渲染
                }
         })
       },
       //创建已分配列表
       createAllocated:function (data,item) {
           $("#"+item).empty();
           for(var i=0;i<data.length;i++){
               if(data[i].mtrl.enable == 1){
                   var  str="<li data-id='"+data[i].id+"' data-nodeId='"+data[i].nodeId+"' data-mtrlId='"+data[i].mtrlId+"'>" +
                       "<span>"+data[i].mtrl.mtrlName + "</span>"+
                       "<span class='allocated-right'>" +
                       "<i class='fa fa-dot-circle-o'>已启用</i>" +
                       "<i class='fa fa-circle-o'>未启用</i>"+
                   "</span>"+
                   "</li>";
               }else{
                   var  str="<li data-id='"+data[i].id+"' data-nodeId='"+data[i].nodeId+"' data-mtrlId='"+data[i].mtrlId+"'>" +
                       "<span>"+data[i].mtrl.mtrlName + "</span>"+
                       "<span class='allocated-right'>" +
                       "<i class='fa fa-dot-circle-o'>已启用</i>" +
                       "<i class='fa fa-circle-o'>未启用</i>"+
                   "</span>"+
                   "</li>";
               }
               var li = $(str);
               $("#"+item).append(li);
           }
           $("#"+item+" li").unbind("click").on("click",function () {
               $(this).addClass("active").siblings("li").removeClass("active");
           });
       },
       //加载点击事件
       clickHandler:function (dataList) {
           $("#btn-ingredients").unbind("click").on("click",function () {              //切换为辅料
                 $(".accessory").removeClass("hide");  //辅料显示
                 $(".material").addClass("hide");     //主料隐藏
                  $(".material .advocate li").removeClass("active");   //切换为辅料时，移除主料的class
            });
           $("#btn-active").unbind("click").on("click",function () {              //切换为主料
                    $(".accessory").addClass("hide");  //辅料显示
                    $(".material").removeClass("hide");     //主料隐藏
                    $(".accessory .complement li").removeClass("active");   //切换为辅料时，移除主料的class
            });
               //右移按钮
            $("#btn-right").unbind("click").on("click",function () {
                var len = $("#list3 .active").length;
                if(len>0){
                    var ids = $("#list3 .active").attr("data-mtrlId");
                    for(var i=0;i<dataList.length;i++){
                        if(dataList[i].mtrlId == ids){
                            dataList.splice(i,1);
                            PageModule.createAllocated(dataList,"list3")
                        }
                    }
                }else{
                    Mom.layAlert("请选择已分配的物料");
                }
            });
           //上移按钮
            $("#btn-up").unbind("click").on("click",function () {
                if($("#list3 li").length<=0){
                    Mom.layAlert("请先选择已分配的物料")
                }else {
                    $("#list3 li").each(function (index, item) {
                        if ($(item).attr("class") == "active") {
                            var arr = PageModule.upRecord(dataList, index);
                            var $tr = $(this);
                            $tr.prev().before($tr);
                        }
                    })
                }
            });
            //下移按钮
            $("#btn-down").unbind("click").on("click",function () {
                if( $("#list3 li").length<=0){
                    Mom.layAlert("请先选择已分配的物料")
                }else{
                    $("#list3 li").each(function (index,item) {
                        if($(item).attr("class") == "active"){
                            var arr =  PageModule.downRecord(dataList,index);
                            var $tr = $(this);
                            $tr.next().after($tr);
                        }
                    })
                }
            });
            //保存按钮
            $("#btn-submit").unbind("click").on("click",function () {
                if(dataList == undefined){
                    Mom.layAlert("请选择物料")
                }else{
                    var nodeAreaId = $("#list1 .active").attr("data-id");
                    for(var i=0;i<dataList.length;i++){
                        dataList[i].nodeAreaId = nodeAreaId;
                        dataList[i].mtrlId = dataList[i].mtrlId;
                    };
                    if(dataList.length<=0){
                        var msg = {};
                        msg.nodeAreaId = $("#list1 .active").attr("data-id");
                        dataList.push(msg);
                    };
                    if($("#mateType option:selected").val() == ""){
                        Mom.layAlert("请选择物料类型")
                    }else{
                        for(var j=0;j<dataList.length;j++){
                            dataList[j].mtrlFlag = $("#mateType option:selected").val();
                        }
                        var data = {
                            mtrlStock:JSON.stringify(dataList)
                        };
                        Api.ajaxForm(Api.mtrl+"/api/fm/MtrlStock/save",data,function (result) {
                            if(result.success){
                                Mom.layAlert("保存成功")
                            }else{
                                Mom.layAlert(result.message)
                            }
                        })
                    }
                }
            });
           //左移按钮
            $("#btn-left").unbind("click").on("click",function () {
                var len = $("#list2 .active").length;  //仓库是否选中
                if(len<=0 && dataList == undefined){     //仓库没有选中
                    Mom.layAlert("请选择仓库")
                }else{                               //仓库选中
                    var obj = {};
                    var mtrl = {};
                    if($("#list2 .active").length<=0 && $(".complement .active").length<=0){          //主物料或者辅物料物料是否选中
                        Mom.layAlert("请选择物料")
                    }else if($("#list2 .active").length<=0){
                        var id = $(".complement .active").attr("data-id");
                        var name = $(".complement .active").text();
                        var exist = PageModule.criteria(dataList,id);
                        if(exist){
                            obj.mtrlId = id;
                            mtrl.mtrlName = name;
                            obj.mtrl = mtrl;
                            dataList.push(obj)
                        }else{
                            Mom.layAlert("该物料已经存在")
                        }
                    }else{
                        var id = $("#list2 .active").attr("data-id");
                        var name = $("#list2 .active").text();
                        var exist = PageModule.criteria(dataList,id);
                        var name = $("#list2 .active").text();
                        if(exist){
                            obj.mtrlId = id;
                            mtrl.mtrlName = name;
                            obj.mtrl = mtrl;
                            dataList.push(obj)
                        }else{
                            Mom.layAlert("该物料已经存在")
                        }
                    }
                    /*
                    * 当已分配物料全部为空时，进行保存，后端需要一个仓库的id，所以dataList就只有一个{nodeAreaId:"仓库Id"}
                     再创建已分配列表时数据格式不一致会报错，所以如果mtrl不存在时就是已分配物料id为空，将这一项删除就可以了
                    * */
                    for(var j=0;j<dataList.length;j++){
                        if(dataList[j].mtrl == undefined){
                            dataList.splice(j,1);
                        }
                    };
                    PageModule.createAllocated(dataList,"list3")
                }
            });
       },
       //判断向左移的物料再已分配中是否已经存在
        criteria:function (data,ids) {
            var bol = true;
            for(var i=0;i<data.length;i++){
                if(data[i].mtrlId == ids){
                    bol = !bol;
                }else {
                    bol = bol;
                }
            };
            return bol;
        },
       //将数组排序
        swapItems : function(arr, index1, index2) {
            arr[index1] = arr.splice(index2, 1, arr[index1])[0];
            return arr;
        },
       // 向上按钮将数组排序
        upRecord:function(arr, $index) {
            if($index == 0) {
                return;
            }
            var arr = PageModule.swapItems(arr, $index, $index - 1);
            return arr
        },
       //向下按钮将数组排序
        downRecord:function(arr, $index) {
            if($index == arr.length -1) {
                return;
            }
            var arr = PageModule.swapItems(arr, $index, $index + 1);
            return arr
        }
   };

    $(function () {
        PageModule.init();
    })
});
