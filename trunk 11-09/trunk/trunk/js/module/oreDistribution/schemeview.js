require(['/js/zlib/app.js',''], function(App) {
    var PageModule = {
        init: function () {
            PageModule.selectKind();
            var caseArr = [];
            var oreCodeDict = [];
            var pageArr = [];
            // 引入插件
            require(['Page'], function () {
                window.pageLoad = function () {
                    require(['datetimepicker'], function () {
                        //时间选择插件
                        $("#startDate,#endDate,#startDate1,#endDate1").val("").datetimepicker({
                            bootcssVer: 3,        //显示箭头，部分如不显示箭头要加这个
                            format: "yyyy-mm-dd",  //保留到日
                            showMeridian: true,     //显示上、下午
                            language: "zh-CN",   //中文显示
                            minView: "3",    //月视图
                            autoclose: true,  //选择时间后自动隐藏
                            clearBtn: true,
                            todayBtn: true
                        });
                        //判断日期大小
                        $("#endDate,#startDate").on('change', function () {
                            if ($('#endDate').val() < $('#startDate').val() && $('#endDate').val() != '') {
                                Mom.layMsg('结束时间应大于起始时间，请重新选择');
                                $('#endDate').val('')
                            }
                        });
                        //判断日期大小
                        $("#endDate1,#startDate1").on('change', function () {
                            if ($('#endDate1').val() < $('#startDate1').val() && $('#endDate1').val() != '') {
                                Mom.layMsg('结束时间应大于起始时间，请重新选择');
                                $('#endDate1').val('')
                            }
                        });
                    });
                    $(".fangan").find("span").eq(1).text(Mom.getUrlParam("name"));
                    //查看
                    $("#Sequestration").click(function () {
                        if($("#startDate").val() == ""){
                            Mom.layMsg("到货开始时间不能为空")
                        }else if($("#endDate").val() == ""){
                            Mom.layMsg("到货结束时间不能为空")
                        }else{
                            Bus.openDialog("矿石进厂质检信息","oreDistribution/createdistrbutionInner.html?arrivalDate="+$("#startDate").val()+"&arrivalDate2="+$("#endDate").val(),"1000px","700px")
                        }
                    });
                    //保存
                    $("#btn-save").click(function () {
                        PageModule.addDataFn();
                    });
                    $("#export-btn").click(function () {
                        var miniCaseId;
                        $(".radio").each(function (index,item) {
                            if($(item).is(":checked")){
                                miniCaseId = $(item).attr("id");
                            }
                        });
                        var url = Api.aps + '/ob/import/port?id=' + miniCaseId;
                        window.location.href = url;
                    });
                    // 计算
                    PageModule.jisuanfangan();  //默认加载质检信息列表
                    $("#calculation-btn").click(function () {
                        if($("#startDate").val()==""){
                            Mom.layMsg("请选择矿石到货时间！")
                        }else{
                            PageModule.jisuanfangan();
                        }
                    });
                    //配矿
                    $("#distribution-btn").click(function () {
                        if($("#treeTables th").length>0){
                            $("#treeTables th").remove();
                            $("#datainners tr").remove()
                            PageModule.scheme();
                        }else{
                            PageModule.scheme();
                        }
                    });
                };
                pageLoad();
            });
            PageModule.informations();
        },
        // 配矿页面
        createTable1:function(tableData){
            $("#treeTable").dataTable({
                "data": tableData,
                "aoColumns": [
                    {"data": null,'sClass':"center ","width":"5%"},
                    {"data": "arrivalDate",'sClass':"center ","width":"5%"},
                    {"data": "mainNumber",'sClass':"center"},
                    {"data": "al2o3Value",'sClass':"center"},
                    {"data": "sio2Value",'sClass':"center"},
                    {"data": "stValue",'sClass':"center"},
                    {"data": "caoValue",'sClass':"center"},
                    {"data": "cValue",'sClass':"center"},
                    {"data": "fe2o3Value",'sClass':"center"},
                    {"data": "tio2Value",'sClass':"center"},
                    {"data": "aSValue",'sClass':"center"},
                    {"data": "tolValue",'sClass':"center"},
                    {"data": "k2oValue",'sClass':"center"},
                    {"data": "h2oValue",'sClass':"center"}
                ],
                "fnDrawCallback" : function(){
                    this.api().column(0).nodes().each(function(cell, i) {
                        cell.innerHTML =  i + 1;
                    });
                },
            });
            renderIChecks()
        },
        createTable:function(tableData){
            $("#treeTable").dataTable({
                "data": tableData,
                "aoColumns": [
                    {"data": "oreTypes",'sClass':"center ","width":"6%"},
                    {"data": "mainNumber",'sClass':"center","width":"8%"},
                    {"data": "al2o3Value",'sClass':"center","width":"6%"},
                    {"data": "sio2Value",'sClass':"center","width":"6%"},
                    {"data": "stValue",'sClass':"center","width":"6%"},
                    {"data": "caoValue",'sClass':"center","width":"6%"},
                    {"data": "cValue",'sClass':"center","width":"6%"},
                    {"data": "fe2o3Value",'sClass':"center","width":"6%"},
                    {"data": "tio2Value",'sClass':"center","width":"6%"},
                    {"data": "aSValue",'sClass':"center","width":"6%"},
                    {"data": "tolValue",'sClass':"center","width":"6%"},
                    {"data": "k2oValue",'sClass':"center","width":"6%"},
                    {"data": "h2oValue",'sClass':"center","width":"6%"}
                ],
            });
            renderIChecks()
        },
        jisuanfangan:function(){
            var str = "";
            var arr = [];
            var checkLength = $(".i-checks");
            for(var i=0;i<checkLength.length;i++){
                if($(checkLength[i]).is(":checked")){
                    str+=","+$(checkLength[i]).val();
                    arr.push($(checkLength[i]).val());
                }
            }
            var data = {
                arrivalDate:$("#startDate").val(),
                arrivalDate2:$("#endDate").val(),
                oreTypes:str.substr(1)
            };
            Api.ajaxJson(Api.aps+"/api/ob/QualityInspections/caseCalculate",JSON.stringify(data),function (result) {
                if(result.success){
                    PageModule.pageArr = result.rows;
                    var arr = [];   //矿石种类数组
                    for(var i=0;i<checkLength.length;i++){
                        if($(checkLength[i]).is(":checked")){
                            arr.push($(checkLength[i]).val());
                        }
                    }
                    if(arr.length>0){
                        PageModule.changeDataArr(arr);
                    }
                }else{
                    Mom.layMsg("当前没有符合添加的矿石");
                    var arr1 = [];
                    PageModule.pageArr = [];
                    PageModule.changeDataArr(arr1);
                    $("#sendDate").val("");
                    $("#endDate").val("");
                }
            })
        },
        changeDataArr:function(oretypeArr){
            console.log(oretypeArr);
            //dataArr返回的数据   //oretypeArr矿石种类
            var newArr = [];
            var newArrs = [];
            for(var i=0;i<PageModule.pageArr.length;i++){
                for(var j=0;j<oretypeArr.length;j++){
                    if(PageModule.pageArr[i].oreType==oretypeArr[j]){
                        newArr.push(PageModule.pageArr[i]);
                    }
                }
            }
            PageModule.createTable(newArr);
        },
        //矿石种类复选框选择
        selectKind:function () {
            var url = Api.admin+"/api/sys/SysDict/type/ORE_TYPE";
            Api.ajaxForm(url,{},function (result) {
                if(result.success){
                    var rows = result.rows;
                    for(var i=0;i<rows.length;i++){
                        var li = "<li>" +
                            "<label>"+
                            "<input type='checkbox' value='"+rows[i].value+"' class='i-checks' >"+
                            "<span>"+rows[i].label+"</span>"+
                            "</label>"+
                            "</li>";
                        $(".checks-box").append(li);
                        renderIChecks();
                    }
                    //创建完成后侦听复选框的选择
                    var arrs = [];
                    $("label").on("ifClicked",function(){
                        if($(this).find(".i-checks").is(":checked") == false){
                            arrs.push($(this).find(".i-checks").val())
                        }else{
                            for(var i=0;i<arrs.length;i++){
                                if(arrs[i] == $(this).find(".i-checks").val()){
                                    arrs.splice(i,1)
                                }
                            }
                        }
                        PageModule.changeDataArr(arrs);
                    })
                }else{
                    Mom.layMsg(result.message);
                }
            })
        },
        //方案优化接口
        scheme:function () {
            var str = "";
            var checkLength = $(".i-checks");
            for(var i=0;i<checkLength.length;i++){
                if($(checkLength[i]).is(":checked")){
                    str+=","+$(checkLength[i]).val()
                }
            }
             if($("#startDate").val() == ""){
                Mom.layMsg("请选择到货开始时间！")
            }else if($("#startDate").val() == ""){
                Mom.layMsg("请选择到货结束时间！")
            }else {
                var data = {
                    heap:PageModule.heap,               //矿堆
                    heapNum:PageModule.oreRemainedNum,   //剩余总量
                    oreDate:PageModule.oreStartDate,     //配矿开始时间
                    oreDate2:PageModule.oreEndDate,         //配矿结束时间
                    arrivalDate:$("#startDate").val(),
                    arrivalDate2:$("#endDate").val(),
                    oreTypes:str.substr(1),  //矿石种类
                    optFlag:PageModule.optFlag,  //状态
                    caseId:Mom.getUrlParam("caseId")
                };
                Api.ajaxJson(Api.aps+"/api/ob/OreBlendingCase/formula",JSON.stringify(data),function (result) {
                    if(result.success){
                        PageModule.oreCodeDict = result.oreCodeDict
                        PageModule.caseArr = result.oreCode;
                        //table表头
                        for(var i=0;i<result.biaoTou.length;i++){
                            var th = $("<th>"+result.biaoTou[i]+"</th>");
                            $("#treeTables thead tr").append(th)
                        }
                        //方案优化列表表头方案一。。。方案二。。。方案三
                        for(var i=0;i<result.case.length;i++){
                            PageModule.createCser(result.case[i])
                        }
                        //方案优化 优化内容
                        for(var i=0;i<result.case.length;i++){
                            PageModule.createoptimization(result.case[i])
                        }
                    }else{
                        Mom.layMsg(result.message)
                    }
                })
            }
        },
        //创建方案
        createCser:function (item) {
            for(var i=0;i<item.length;i++){
                var tr = $("<tr class='title'></tr>")
                for(var j=1;j<item[0].length;j++){
                    var td = $("<td>"+
                                "<span>"+item[0][j]+"</span>"+
                            "</td>");
                    tr.append(td);
                }
            }
            tr.find("td:first").prepend("<input type='radio' class='radio' name='radio' id="+item[0][0]+" >");
            $("#datainners").append(tr);
        },
        informations:function(){
            var data = {
                caseId:Mom.getUrlParam('caseId')
            };
            Api.ajaxForm(Api.aps+"/api/ob/LedgerAccount/queryOreSurplus",data,function (result) {
                PageModule.optFlag = result.optFlag;  //优化次数
                PageModule.heap = result.heap;        //堆别
                PageModule.oreRemainedNum = result.oreRemainedNum;  //剩余总量
                PageModule.oreStartDate = result.oreStartDate.slice(0,10) ;     //开始时间
                PageModule.oreEndDate = result.oreEndDate.slice(0,10);          //结束时间
                if(result.success){
                    for(var i=0;i<result.oreList.length;i++){
                        var li =$("<li class='col-md-6'>" +
                            "<span>"+result.oreList[i].oreTypeName+"已投量：</span>"+
                            "<span>"+result.oreList[i].oreTypeNum+"</span>"+
                            "</li>");
                        $(".jcxx-right").append(li)
                    }
                    $(".heapTotal").next().text(result.heapTotal)
                    $(".usedNum").next().text(result.usedNum)
                    $(".oreRemainedNum").next().text(result.oreRemainedNum);
                    $(".times").text(result.oreEndDate)
                }else{
                    Mom.layMsg(result.message);
                }
            })
        },
        //保存按钮获取数据
        addDataFn:function(){
            var classNum = [];  //所有的数据
            var allar = [];
            var arr = []   //字段
            var oretypeArr = [];
            var dataObj = {};
            var num = 0;
            var tdArr = $("#treeTables th");
            var trArr = $(".content");
            var trBG;
            for(var i=1;i<tdArr.length;i++){
                var classNum = [];
                for (var j=0;j<trArr.length;j++){
                    if(trArr[j].getAttribute("style") != "display: none;"){
                        $(trArr[j]).find(" .a"+(i+1)).each(function (index,item) {
                            classNum.push($(item).val());
                            trBG = trArr[j];
                        })
                        allar.push(classNum);
                    }
                }
            }
            $.unique(allar);
            for(var i=0;i<allar.length;i++){
                for (var j=0;j<allar[i].length;j++) {
                    if(allar[i][j] == ""){
                        allar[i].splice(j,1)
                    }
                }
            }
            for(var i=0;i<PageModule.caseArr.length;i++){
                arr.push(PageModule.caseArr[i]+"Num");    //总量
                arr.push(PageModule.caseArr[i]+"InspectedNo");  //次数
                arr.push(PageModule.caseArr[i]+"InspectedNum");  //单词数量
            };
            // arr :字段     allar//数据
            for(var i=0;i<allar.length;i++){
                for(var j=0;j<allar[i].length;j++){
                    oretypeArr.push(parseInt(allar[i][j]))
                }
            }
            for(var j=0;j<oretypeArr.length;j++){
                dataObj[arr[j]] = oretypeArr[j];
            }
            $(".radio").each(function (index,item) {
                if($(item).is(":checked")){
                    dataObj["id"] = $(this).attr("id")
                }
            })
            for(var i=0;i<PageModule.caseArr.length;i++){
                dataObj[PageModule.caseArr[i]+"Code"] = PageModule.oreCodeDict[i]
            }
            dataObj["checkedStatus"] = 1;
            for(var i=0;i<allar.length;i++){
                num += parseInt(allar[i][0])
            }
            var heapNum = parseInt(PageModule.oreRemainedNum);
            if(num != heapNum){
                Mom.layMsg("总量数值不符合配矿要求");
                $(trBG).prev().prev().addClass("exceedbg");
            }else{
                console.log(dataObj)
                Api.ajaxJson(Api.aps+"/api/ob/OreBlendingCase/updateCase",JSON.stringify(dataObj),function (result) {
                    if(result.success){
                        Mom.layMsg("保存成功");
                        $(".exceedbg").removeClass("exceedbg");
                    }else{
                        Mom.layMsg(result.message)
                    }
                })
            }
        },
        //创建优化
        createoptimization:function (optiArr) {
            var id = "";
            for(var i=0;i<optiArr.length;i++){
                id = optiArr[i][0]
            }
            $("td input[type='radio']").each(function (index,item) {
                if($(item).attr("id") == id){
                    for(var i=1;i<optiArr.length;i++){
                        var tr = $("<tr class='content'></tr>");
                        for(var j=1;j<optiArr[i].length;j++){
                            var td = $("<td>"+
                                "<span class='"+"a"+[j]+"'>"+optiArr[i][j]+"</span>"+
                                "<input type='number' class='"+"a"+[j]+"' value="+optiArr[i][j]+" />"+
                                "</td>");
                            tr.append(td);
                        }
                        //如果有radio的父元素的下一个元素不为空
                        if ($(this).parent().parent().next().text() !=""){
                            //如果有radio的父元素的下一个元素class为title
                            if($(this).parent().parent().next().attr("class") == "title"){
                                //在当前radio的父元素tr的下一个兄弟元素前插入这个tr
                                $(this).parent().parent().next().before(tr);
                            }else {
                                //在当前radio的父元素tr的下一个兄弟元素后插入这个tr
                                $(this).parent().parent().next().after(tr);
                            }
                        }else{
                            //如果当前radio的父元素后边没有tr就在当前元素的后边插入tr
                            $(this).parent().parent().after(tr)
                        }
                    }
                }
                PageModule.changeInput();
            });
            PageModule.clickHandler();
            $(".radio").click(function(){
                PageModule.clickHandler();
            });
            $("input").on("input",function () {
                var className = $(this).attr("class");
                PageModule.changeTDtext($(this),className);
            })
        },
        changeInput:function(){
            $(".content td").each(function () {
                if($(this).eq(0).text() == "单次数量"){
                    $(this).parent().find("input").hide();
                    $(this).parent().find("span").show();
                }
            });
        },
        //改变input动态计算
        changeTDtext:function(item,calssName){
            //如果单次数量大于10，显示红色
            if($(item).parent().parent().find(".a1").text() == "次数"){
                if(parseInt($(item).val()) > 10){
                    $(item).css({
                        "color":"red"
                    })
                }else{
                    $(item).css({
                        "color":"black"
                    })
                }
            }
            var Numtext;  //总量的值
            var Numtext1; //单次的值
            //获取总量的value
            if($(item).parent().parent().prev().attr("class") == "title"){
                var frequency = $(item).val();  //当前val
                var NumArr = $(item).parent().parent().next().find("input");
                for(var i=0;i<NumArr.length;i++){
                    var NumClass = $(NumArr[i]).attr("class");
                    if(calssName == NumClass){
                        Numtext  =$(NumArr[i]).val();//次数
                    }
                };
                //计算单次的值
                var NSingle = $(item).parent().parent().next().next().find("span");
                for(var i=0;i<NSingle.length;i++){
                    var NumClass = $(NSingle[i]).attr("class");
                    if(calssName == NumClass){
                        Numtext1=$(NSingle[i]).text();
                        if("Infinity" == parseInt(frequency)/parseInt(Numtext)){
                            $(NSingle[i]).text("0");
                        }else if((parseInt(frequency)/parseInt(Numtext)).toString() == "NaN"){
                            $(NSingle[i]).text("0")
                        }else{
                            $(NSingle[i]).text(parseInt(frequency)/parseInt(Numtext));
                        }
                    }
                }

            }else{
                var NumArr = $(item).parent().parent().prev().find("input");
                for(var i=0;i<NumArr.length;i++){
                    var NumClass = $(NumArr[i]).attr("class");
                    if(calssName == NumClass){
                        Numtext  =$(NumArr[i]).val();
                    }
                }
                //获取当前输入框的value
                var frequency = $(item).val();
                //计算单次的值
                var NSingle = $(item).parent().parent().next().find("span");
                for(var i=0;i<NSingle.length;i++){
                    var NumClass = $(NSingle[i]).attr("class");
                    if(calssName == NumClass){
                        Numtext1=$(NSingle[i]).text();
                        if(parseInt(Numtext)/parseInt(frequency) == "Infinity"){
                            $(NSingle[i]).text("0");
                        }else if((parseInt(frequency)/parseInt(Numtext)).toString() == "NaN"){
                            $(NSingle[i]).text("0");
                        }else{
                            $(NSingle[i]).text(parseInt(Numtext)/parseInt(frequency))
                        }
                    }
                }
            }
        },
        //改变check，显示隐藏
        clickHandler:function(){
            $(".radio").eq(0).attr("checked",true)
            $(".radio").each(function(index,item){
                if($(this).is(":checked")){
                    $(this).parent().parent().nextAll('.content').show()
                }else{
                    $(this).parent().parent().nextAll('.content').hide();
                }
            })
        },
        //查看页面
        initOretype:function(oreType){
            require(['Page'], function () {
                var url = Api.admin+"/api/sys/SysDict/type/ORE_TYPE";
                Api.ajaxForm(url,{},function (result) {
                    if(result.success){
                        for(var i=0;i<result.rows.length;i++){
                            var li = $("<li data="+result.rows[i].value+">"+result.rows[i].label+"</li>");
                            $(".checks-box").append(li)
                        }
                        $(".checks-box li").eq(0).addClass('active');
                        PageModule.Inner();
                        $(".checks-box li").unbind("click").on("click",function () {
                            PageModule.Inner($(this).attr("data"),"");
                            $(this).siblings('li').removeClass('active');  // 删除其他兄弟元素的样式
                            $(this).addClass('active');
                        });

                        $("#goodsNum").change(function () {
                            var goodsNum = $("#goodsNum option:selected").val();
                            PageModule.Inner("",goodsNum);
                        });

                    }
                });
            });

        },
        // 根据不同矿石，不同时间类型创建table
        Inner:function (oreType,goodsNum) {
            var oreTypes;
            var goodsNums;
            if (oreType == "" || oreType == undefined ||  oreType == null){
                oreTypes = $(".checks-box li").eq(0).attr("data")
            } else {
                oreTypes = oreType
            }
            if (goodsNum == "" || goodsNum==undefined){
                goodsNums = $("#goodsNum option:selected").val()
            } else {
                goodsNums = goodsNum;
            }
            var data = {
                arrivalDate:Mom.getUrlParam("arrivalDate"),
                arrivalDate2:Mom.getUrlParam("arrivalDate2"),
                goodsNum:goodsNums,
                oreType: oreTypes
            };
            new Page().init( Api.aps + "/api/ob/QualityInspections/StatisticsPage", data, true, function (result) {
                PageModule.createTable1(result);
            });

        }
    };
    $(function(){
        if($("#default").length>0){
            PageModule.init();
        }else if($("#defaultInner").length>0){
            PageModule.initOretype();
        }
    });

});
