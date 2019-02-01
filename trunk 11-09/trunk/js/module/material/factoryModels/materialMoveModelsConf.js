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
        nodataHtml : "<p class='nodata mgt-10'>暂无数据</p>",
        init:function () {
            Api.ajaxJson(Api.mtrl +"/api/fm/Fctr/fctrSelect",{},function(result){
                Bus.appendOptionsValue('#fctrName',result.rows,'id','fctrName');
                Bus.appendOptionsValue('#fctrName2',result.rows,'id','fctrName');
            });
            PageModule.setConfigHight();
            $(window).resize(function(){
                PageModule.setConfigHight();
            });

            // 加载源节点列表数据方法
            PageModule.loadList1Data();
            // 加载节点列表数据方法
            PageModule.loadList2Data();
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
        // 定义源节点列表数据方法
        loadList1Data:function(){
            var data={
                "fctr":{"id":$('#fctrName option:selected').val()},
                "nodename":$('#nodename').val()
            };
            Api.ajaxJson(Api.mtrl + '/api/fm/Node/queryNodeInfo',JSON.stringify(data),function(result){
                if(result.success == true){
                    PageModule.createList1(result.NodeList);
                }
            });
        },
        // 定义节点列表数据方法
        loadList2Data:function(){
            var data= {
                "fctr": {"id": $('#fctrName2 option:selected').val()},
                "nodename": $('#stockName').val()
            };
            Api.ajaxJson(Api.mtrl + '/api/fm/Node/queryNodeInfo',JSON.stringify(data),function(result){
                if(result.success==true){
                    PageModule.createList2(result.NodeList);
                }
            })
        },

        //创建左上列表
        createList1:function (data) {
            $("#list1").empty();
            var dataLen=data.length;
            if(dataLen>0){
                var htmls = '';
                $(data).each(function(i,o){
                    htmls += "<li data-id='"+o.nodeId+"' data-enable='"+o.enable+"'>"+o.nodename+"</li>"
                });
                $("#list1").html(htmls);

            }else{
                $("#list1").html(PageModule.nodataHtml);
            }

            //源节点列表 LI元素的点击事件
            $("#list1").on("click","li",function () {
                $(this).addClass("active").siblings("li").removeClass("active");
                PageModule.list1Id =  $(this).attr("data-id");
                Api.ajaxForm(Api.mtrl +"/api/fm/MtrlMoveModel/queryAimNodeList/"+PageModule.list1Id,{},function (result) {
                    if(result.success){
                        var dataList = [];
                        $.each(result.rows,function(i,o){
                            dataList.push({id:o.node.id,nodeName:o.node.nodename,enable:o.node.enable});
                        });
                        PageModule.dataList=dataList;
                        PageModule.createList3();
                    }
                })
            });
        },
        //创建右边列表
        createList2:function (data) {
            $("#list2").empty();
            var dataLen = data.length;
            if(dataLen>0){
                var htmls = '';
                $.each(data,function(i,o){
                    htmls += "<li data-id='"+o.nodeId+"' data-enable='"+o.enable+"'>"+o.nodename+"</li>";
                });
                $("#list2").html(htmls);
            }else{
                $("#list2").html(PageModule.nodataHtml);
            }

            // 节点列表 LI元素的点击事件
            $("#list2").on("click","li",function(){
                PageModule.list2Id =  $(this).attr("data-id");
                $(this).addClass("active").siblings("li").removeClass("active");
            });
        },
        //创建已分配列表
        createList3:function () {
            $("#list3").empty();
            var data = PageModule.dataList,
                dataLen = data.length;
            if(dataLen>0){
                var htmls = '';
                $.each(data,function(i,o){
                    htmls += "<li data-id='"+o.id+"' data-enable='"+o.enable+"'>"+o.nodeName;
                    if(o.enable == "1"){
                        htmls += "<div class='allocated-type pull-right'>"
                            +"<span><i class='fa fa-circle-o'></i>未启用</span>"
                            +"<span><i class='fa fa-dot-circle-o'></i>已启用</span>"
                            +"</div>";
                    }else{
                        htmls += "<div class='allocated-type pull-right'>"
                            +"<span><i class='fa fa-dot-circle-o'></i>未启用</span>"
                            +"<span><i class='fa fa-circle-o'></i>已启用</span>"
                            +"</div>";
                    }
                    htmls +="</li>";
                });
                $("#list3").html(htmls);
            }else{
                $("#list3").html(PageModule.nodataHtml);
            }

            // 目标节点列表 LI元素点击事件
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
                    Mom.layAlert('请选择源节点');
                }else{
                    if($("#list2").find(".active").length<=0){
                        Mom.layAlert('请选择节点')
                    }else{
                        var idFlag=false;
                        var id = $("#list2 .active").attr("data-id");
                        var id2 = $("#list1 .active").attr("data-id");
                        var name = $("#list2 .active").text();
                        var enable = $("#list2 .active").attr("data-enable");
                        //判断是否和源节点相同
                        if(id != id2){
                            //"目标节点"列表中是否存在
                            var noExist = PageModule.criteria(PageModule.dataList,id);
                            if(noExist) {//如果返回true，说明在目标节点列表中不存在
                                PageModule.dataList.push({id:id,nodeName:name,enable:enable});
                                PageModule.createList3();
                            }else{
                                Mom.layAlert("所选节点在目标节点中已存在");
                            }
                        }else{
                            Mom.layAlert("节点和源节点不能相同");
                        }
                    }
                }
            });
            //点击右箭头
            $("#btn-right").unbind("click").on("click",function () {
                var len = $("#list3 .active").length;
                if(len>0){
                    var ids = $("#list3 .active").attr("data-id");
                    $.each(PageModule.dataList,function(i,o){
                        if(o.id == ids){
                           PageModule.dataList.splice(i,1);
                           PageModule.createList3();
                           return false;
                        }
                    });
                }else{
                    Mom.layAlert("请选择目标节点")
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
            $('#btn-save').unbind('click').on('click',function () {
                var saveList=[],$Li= $('#list3>li'),$liLen = $Li.length;
                $.each($Li,function(i,o){
                    saveList.push({destNodeId:($(o).attr('data-id')),srcNodeId:PageModule.list1Id});
                });
                var data={
                    "srcNodeId":PageModule.list1Id,
                    "mtrlMoves":JSON.stringify(saveList)
                };
                Api.ajaxForm(Api.mtrl+'/api/fm/MtrlMoveModel/saveAimNode',data,function (result) {
                    if(result.success){
                        Mom.layMsg('保存成功');
                        console.log(result)
                    }else{
                        Mom.layMsg(result.message);
                    }
                });
            });
            //搜索按钮1
            $('#btn-search1').unbind('click').on('click',function () {
                PageModule.loadList1Data();
            });
            //搜索按钮2
            $('#btn-search2').unbind('click').on('click',function () {
                PageModule.loadList2Data();
            });
        },
        criteria:function (data,ids) {
            for(var i=0;i<data.length;i++){
                if(data[i].id == ids){
                   return false;
                }
            }
            return true;
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