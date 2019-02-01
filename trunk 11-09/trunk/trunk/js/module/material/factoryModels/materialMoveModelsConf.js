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
        saveList:[],
        init:function () {
            window.pageLoad=function () {
                    var data={
                        "fctr":{"id":$('#fctrName option:selected').val()},
                        "nodename":$('#nodename').val()
                    };
                    //加载节点数据
                    PageModule.loadData(Api.mtrl + '/api/fm/Node/queryNodeInfo',JSON.stringify(data),function (NodeList) {
                        //加载左上边数据
                        PageModule.createList1(NodeList);

                    },'#fctrName');
            };
            window.pageLoad2=function () {
                var data= {
                    "fctr": {"id": $('#fctrName2 option:selected').val()},
                    "nodename": $('#stockName').val()

                };
                PageModule.loadData(Api.mtrl + '/api/fm/Node/queryNodeInfo',JSON.stringify(data),function (NodeList) {
                    //加载左上边数据
                    PageModule.createList2(NodeList);

                },'#fctrName2');
            };
            pageLoad();
            pageLoad2();
            PageModule.clickHandler();




        },

        //设置高度 工具栏
        ulHeight:function(){
            if($("#toolbar1").length>0){
                var toolbar1 = $("#toolbar1").innerHeight();
                var hei1 = 420 - toolbar1;
                $("#list1").height(hei1);
            }



        },
        loadData:function (url,data,callback,selector) {
            Api.ajaxJson(url,data,function (result) {
                if(result.success){
                    var data  = result.NodeList;
                    if($(selector).find('option').length==1){
                        Bus.appendOptionsValue(selector,result.fctrList,'id','fctrName');
                    }
                    if(callback){
                        callback(result.NodeList)
                    }

                }else{
                    Mom.layMsg(result.message)
                }
            })
        },
        //创建左上列表
        createList1:function (data,item) {
            var htmls = '';
            for(var i=0;i<data.length;i++){
                htmls += "<li data-id='"+data[i].nodeId+"' data-enable='"+data[i].enable+"'>"+data[i].nodename+"</li>"
            }
            $("#list1").html(htmls);
            $("#list1").on("click","li",function () {
                $(this).addClass("active").siblings("li").removeClass("active");
                PageModule.list1Id =  $(this).attr("data-id");
                Api.ajaxForm(Api.mtrl +"/api/fm/MtrlMoveModel/queryAimNodeList/"+PageModule.list1Id,{},function (result) {
                    if(result.success){
                        PageModule.dataList=result.rows;
                        PageModule.createList3()
                    }
                })
            })
        },
        //创建右边列表
        createList2:function (data) {
            var htmls = '';
            for(var i=0;i<data.length;i++){
                htmls += "<li data-id='"+data[i].nodeId+"' data-enable='"+data[i].enable+"'>"+data[i].nodename+"</li>";
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
                if(data[i].node==undefined){
                    htmls += "<li data-id='"+data[i].id+"' data-enable='"+data[i].enable+"'>"+data[i].name+"<i class='fa fa-dot-circle-o'>未启用&nbsp</i><i class='fa fa-circle-o'>已启用&nbsp</i></li>";
                }else{
                    htmls += "<li data-id='"+data[i].node.id+"' data-enable='"+data[i].node.enable+"'>"+data[i].node.nodename+"<i class='fa fa-dot-circle-o'>未启用&nbsp</i><i class='fa fa-circle-o'>已启用&nbsp</i></li>";
                }

            }

            $("#list3").html(htmls);
            $("#list3").find('li').each(function (o) {
                if($(this).attr('data-enable')==1){
                    $(this).find('i').eq(1).removeClass('fa-circle-o').addClass('fa-dot-circle-o').siblings('i').removeClass('fa-dot-circle-o').addClass('fa-circle-o')
                }
            });

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
                    Mom.layAlert('请选择运输类型');
                }else{
                    if($("#list2").find(".active").length<=0){
                        Mom.layAlert('请选择计量类型')
                    }else{
                        var idFlag=false;
                        var id = $("#list2 .active").attr("data-id");
                        var id2 = $("#list1 .active").attr("data-id");
                        var name = $("#list2 .active").text();
                        var enable = $("#list2 .active").attr("data-enable");
                        var exist = PageModule.criteria(PageModule.dataList,id);
                        if(exist&&id!=id2){
                            $('#list3 li').each(function (i,item) {
                                if($(item).attr('data-id')==id){
                                    Mom.layAlert("节点与目的节点重复");
                                    idFlag=true
                                }
                            });
                            if(idFlag!=true){
                                PageModule.dataList.push({id:id,name:name,enable:enable});
                                PageModule.createList3();
                            }

                        }else{
                            Mom.layAlert("节点与源节点重复")
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
                        if(PageModule.dataList[i].node==undefined){
                            if(PageModule.dataList[i].id == ids){
                                PageModule.dataList.splice(i,1);
                                PageModule.createList3()
                            }
                        }else{
                            if(PageModule.dataList[i].node.id == ids){
                                PageModule.dataList.splice(i,1);
                                PageModule.createList3()
                            }
                        }

                    }
                }else{
                    Mom.layAlert("请选择已分配的计量类型")
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
            //保存按钮
            $('#btn-submit').unbind('click').on('click',function () {
                var saveList=[];
                for(var i=0;i<  $('#list3>li').length;i++){
                    var id=$('#list3>li').eq(i).attr('data-id');
                    saveList.push({destNodeId:id,srcNodeId:PageModule.list1Id});
                }
                var data={
                    "srcNodeId":PageModule.list1Id,
                    "mtrlMoves":JSON.stringify(saveList)
                };
                Api.ajaxForm(Api.mtrl+'/api/fm/MtrlMoveModel/saveAimNode',data,function (result) {
                    if(result.success){
                        Mom.layMsg('保存成功')
                    }else{
                        Mom.layMsg(result.message)
                    }
                })
            });
            //搜索按钮1
            $('#btn-search1').unbind('click').on('click',function () {
                pageLoad();
            });
            //搜索按钮2
            $('#btn-search2').unbind('click').on('click',function () {
                pageLoad2();
            });
        },
        criteria:function (data,ids) {
            var bol = true;
            for(var i=0;i<data.length;i++){
                if(data[i].id == ids){
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
        if ($('#materialMoveModelsConf').length > 0) {
            PageModule.init();
        }
    });

});