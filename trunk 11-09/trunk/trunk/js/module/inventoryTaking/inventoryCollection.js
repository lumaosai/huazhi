require(['/js/zlib/app.js'], function (App) {
    Mom.include('_myCss1','/css/',[
        'invCommon.css'


    ]);
    var PageModel = {
        //获取班次数据
        loadShift:function () {
            var url_ =Api.aps+'/api/ctrl/Shift/list';
            Api.ajaxJson(url_, {}, function(result){
                if(result.success){
                    var rows = result.rows;
                    var options = new Array();
                    $(rows).each(function(i,o){
                        var label = o['name']+'('+o['startTime']+'-'+o['endTime']+')';
                        options.push({'value':o['id'], 'label':label});
                    });
                    Bus.appendOptions($('#classes'), options);
                }else{
                    Mom.layMsg(result.message);
                }
            });
        },
        //班组
        loadGroups:function () {
            Bus.createSelect(Api.aps+'/api/aps/Groups/list',$('#teamGroup'), 'id', 'name');
        },
        //页面初始化
        init:function () {
            //加载时间插件
            require(['datetimepicker'], function () {
                //时间选择插件(获取年月日日期)
                $("#startDateParam").datetimepicker({
                    format: "yyyy-mm-dd",   //保留到日
                    language:'zh-CN',          //中文显示
                    minView: "month",      //月视图
                    todayBtn: true,       //切换到今天
                    clearBtn: true,       //清除全部
                    autoclose:true, //选择时间后自动隐藏
                });
            });
            //判断日期大小
            $("#startDateParam").on('change', function () {
                if ($('#startDate').val() < $('#startDateParam').val() && $('#startDate').val() != '') {
                    Mom.layMsg('结束时间应大于起始时间，请重新选择');
                    $('#startDateParam').val('');
                }
            });
            $(".maindiskUser").val(Mom.getCookie("userName"));
            var data = Mom.shortDate;
            $(".time").text(data);
            var id =  Mom.getUrlParam("id");
            var url = Api.admin + "/api/sys/SysDict/type/STOCKTAKE_DATE";
            Api.ajaxForm(url, {}, function (result) {
                var date = [15, 30];
                var dateArr = [];
                var myDate = new Date();
                var year = myDate.getFullYear();//获取当前月
                var month = myDate.getMonth() + 1;//获取当前日
                var rows = result.rows;
                for (var i = 0; i < rows.length; i++) {
                    for (var c = 0; c < date.length; c++) {
                        var now = year + '-' + month + "-" + date[c] + " " + rows[i].value;
                        dateArr.push(now)
                    }
                }
                $(dateArr).each(function (i, o) {
                    $('#startDate').append("<option value='" + dateArr[i] + "'>" + dateArr[i] + "</option>");
                });
            });
            //返回按钮
            $("#back-btn").click(function () {
                location.href = "./invDataCollection.html";
            });
            //如果是查看的隐藏保存按钮以及数据采集以及计算
            var checkType = Mom.getUrlParam("check");
            if(checkType == "check"){
                $(".btnHide").hide();
            }
            var parameters =Mom.getUrlParam("type");
            //获取到模板接口以及保存接口、对应字段
            var data =   PageModel.getParameters(parameters);
            PageModel.loadData(data);
            //加载采集时间下拉选择
            PageModel.selectTime()
        },
        //通过列表页面传递参数，获取到模板接口以及保存接口以及参数字段
        getParameters:function (parameters) {
            var id = Mom.getUrlParam("id");
            var parametersObj = {};
            if(parameters == "Mineral"){    //矿石石灰页面
                parametersObj.saveUrl = "/api/aps/Mineral/save";            //保存接口
                parametersObj.data = "mineralData";                         //保存时后端参数
                parametersObj.stocktakeType = "KSSHCC";            //盘存类型
                parametersObj.type = "Mineral";                             //盘存种类
                if(id){
                    parametersObj.id = id;
                    parametersObj.url = "/api/aps/collect/collectView/"+id;         //请求模板接口
                }else{
                    parametersObj.url = "/api/stocktake/PageView/mineral";         //请求模板接口
                }
            }else if(parameters == "NaoHAL"){  //氧化铝氢氧化铝
                parametersObj.saveUrl = "/api/aps/Ao/save";                  //保存接口
                parametersObj.data = "aoData";                               //保存时后端参数
                parametersObj.stocktakeType = "YHLCQYHLDZ";         //盘存类型
                parametersObj.type = "NaoHAL";                             //盘存种类
                if(id){
                    parametersObj.id = id;
                    parametersObj.url = "/api/aps/collect/collectView/"+id;         //请求模板接口
                }else{
                    parametersObj.url = "/api/stocktake/PageView/ao";              //请求模板接口
                }
            }else if(parameters == "Decgroove"){
                parametersObj.saveUrl = "/api/aps/CollectGroove/save";        //保存接口
                parametersObj.data = "groovesData";                            //保存时后端参数
                parametersObj.stocktakeType = "FJCYWCL";         //盘存类型
                parametersObj.type = "Decgroove";                             //盘存种类
                if(id){
                    parametersObj.id = id;
                    parametersObj.url = "/api/aps/collect/collectView/"+id;         //请求模板接口
                }else{
                    parametersObj.url = "/api/stocktake/PageView/groove/PCSJSJ_FJCYWCLPC"; //请求模板接口
                }
            }else if(parameters == "dcs"){
                parametersObj.saveUrl = "/api/aps/CollectGroove/save";        //保存接口
                parametersObj.data = "groovesData";                            //保存时后端参数
                parametersObj.stocktakeType = "DCSCGYW";         //盘存类型
                parametersObj.type = "dcs";                             //盘存种类
                if(id){
                    parametersObj.id = id;
                    parametersObj.url = "/api/aps/collect/collectView/"+id;         //请求模板接口
                }else{
                    parametersObj.url = "/api/stocktake/PageView/groove/PCSJSJ_DCSCGYWPC"; //请求模板接口
                }
            }else if(parameters == "Deposit"){
                parametersObj.saveUrl = "/api/aps/collectCoal/save";        //保存接口
                parametersObj.data = "coalsData";                            //保存时后端参数
                parametersObj.stocktakeType = "MC";         //盘存类型
                parametersObj.type = "Deposit";                             //盘存种类
                if(id){
                    parametersObj.id = id;
                    parametersObj.url = "/api/aps/collect/collectView/"+id;         //请求模板接口
                }else{
                    parametersObj.url = "/api/stocktake/PageView/coal";        //请求模板接口
                }
            }else if(parameters == "Process"){
                PageModel.loadShift();   //班次
                PageModel.loadGroups(); //班组
                parametersObj.saveUrl = "/api/aps/CollectProcessMtrl/save";        //保存接口
                parametersObj.data = "processMtrlData";                            //保存时后端参数
                parametersObj.stocktakeType = "GCWL";         //盘存类型
                parametersObj.type = "Process";//盘存种类
                if(id){
                    parametersObj.id = id;
                    parametersObj.url = "/api/aps/collect/collectView/"+id;         //请求模板接口
                }else{
                    parametersObj.url = "/api/stocktake/PageView/collectPmAnalysis";        //请求模板接口
                }
            }else if(parameters=="Field"){
                parametersObj.saveUrl = "/api/aps/collectMtrl/save";        //保存接口
                parametersObj.data = "mtrlsData";                            //保存时后端参数
                parametersObj.stocktakeType = "JCWL";         //盘存类型
                parametersObj.type = "Field";                             //盘存种类
                if(id){
                    parametersObj.id = id;
                    parametersObj.url = "/api/aps/collect/collectView/"+id;         //请求模板接口
                }else{
                    parametersObj.url = "/api/stocktake/PageView/collectInMaterial";        //请求模板接口
                }
            };
            return parametersObj;
        },
        loadData:function (data) {
            //调取模板接口，以及配置json
            Api.ajaxForm(Api.aps+data.url,{},function (result) {
                $.get("../json/invData/json-shihui.json", function (template) { //通过json创建模板
                    var templateList = [];
                    for(var i=0;i<template.oPage.length;i++){
                        if(template.oPage[i].itemCode == data.type){
                            templateList = template.oPage[i].itemList;
                            PageModel.createTable(result.rows,templateList,data);
                        }
                    }
                });
                //回显
                if(data.id){
                    $(".datatimepicker").val(result.collect.secMan);
                    $("#otherPlate").val(result.collect.thrMan);
                    $(".maindiskUser").text(result.collect.fstMan)
                    $("#startDate option").each(function (index,item) {
                        if($(item).val() == result.collect.stocktakeDate){
                            $(this).attr("selected",true);
                        }
                    });
                    if(data.type == "Process"){
                        $("#classes option").each(function (index,item) {
                            if($(item).val() == result.collect.duty){
                                $(this).attr("selected",true);
                            }
                        });
                        $("#teamGroup option").each(function (index,item) {
                            if($(item).val() == result.collect.dutyGroup){
                                $(this).attr("selected",true);
                            }
                        });
                    }
                }
            })
        },
        selectTime: function () {
            var url = Api.admin + "/api/sys/SysDict/type/STOCKTAKE_ACQUISITION_TIME";
            Api.ajaxForm(url, {}, function (result) {
                var rows = result.rows;
                Bus.appendOptionsValue($('#Interval'), rows, 'value', 'label');
            })
        },
        //创建table
        createTable:function (tableArr,tempArr,data,index) {
            var cellattr = function (rowId,tv,rawObject,cm,rdata) {    //设置单元格合并配置
                return 'id=\'name' + rowId + "\'";
            };
            require(["jqGrid_my"], function (jqGridAll) {
                if(data.type == "Mineral"){     //创建矿石石灰表
                    PageModel.createTabClick(tableArr);
                    $('#jgTables').empty();
                    for(var i=0;i<tableArr.length;i++){
                        var html = '';
                        var active = i==0?' active':'';
                        html += "<div class='jqTable-item"+active+"' data-type='"+tableArr[i].code+"'><table id='jqGrid-table"+i+"' class='jqGrid-table'></table></div>";
                        $('#jgTables').append(html);
                        var  colNames = [],colModel = [],dataTable = [],itemCode,jqGridOptions={};      //表头、基础配置、表格数据、编码
                        //找到与tableArr中对应code的模板信息
                        for(var k=0;k<tempArr.length;k++){
                            if(tempArr[k].itemCode == tableArr[i].code){
                                jqGridOptions.colNames = tempArr[k].colNames;
                                jqGridOptions.colModel = tempArr[k].colModel;
                                jqGridOptions.dataTable = tableArr[i].nodes;
                                itemCode = tableArr[i].code;
                                break;
                            }
                        }

                        renderJGTabel(i,jqGridOptions,itemCode);
                            //设置排序
                            // var dataArr = PageModel.sortFn(dataTable);
                       /* if(i==0){
                            for(var j=0;j<colModel.length;j++){
                                if(colModel[j].name == "name"){
                                    colModel[j].cellattr = cellattr;
                                }
                            }
                            var totalGroup = jqGridAll.jG_totalGroup("name");    //合计列
                            console.log(totalGroup);
                            var editRowFn = jqGridAll.jG_editRowFn("#dataTable0",'',true);//设置可编辑，但是不可以输入汉字
                            var gridComplete = jqGridAll.jG_gridComplete("dataTable0","name");  //单元格合并
                            var configData  = jqGridAll.jG_configData(dataArr);  //创建table的数据
                            var len = dataArr.length+1;
                            var gridConfig = jqGridAll.jG_config('',colNames,colModel,len);
                            $("#dataTable"+i).jqGrid($.extend(configData,gridConfig,gridComplete,totalGroup,editRowFn));
                            jqGridAll.jG_Resize("#dataTable"+i,"tab-con"); //根据屏幕大小改变表格
                        }
                        if(i==1){
                            var editRowFn = jqGridAll.jG_editRowFn("#dataTable1",'',true);//设置可编辑，但是不可以输入汉字
                            var configData  = jqGridAll.jG_configData(dataArr);  //创建table的数据
                            var conSum = jqGridAll.jG_conSum('#dataTable'+i,['valueView','valueModify','valueReport']);
                            // var len = dataArr.length;
                            var gridConfig = jqGridAll.jG_config('',colNames,colModel,len);
                            $("#dataTable1").jqGrid($.extend(configData,gridConfig,gridComplete,editRowFn,conSum));
                            $(".datagridsContent").eq(i).addClass("hide");
                            jqGridAll.jG_Resize("#dataTable"+i,"tab-con"); //根据屏幕大小改变表格
                        }
                        if(i==2){
                            var configData  = jqGridAll.jG_configData(dataTable);  //创建table的数据
                            // var len = dataTable.length+1;
                            var editRowFn = jqGridAll.jG_editRowFn("#dataTable2",'',true);//设置可编辑，但是不可以输入汉字
                            var gridConfig = jqGridAll.jG_config('',colNames,colModel,len);
                            $("#dataTable"+i).jqGrid($.extend(configData,gridConfig,gridComplete,editRowFn));
                            $(".datagridsContent").eq(i).addClass("hide");
                            jqGridAll.jG_Resize("#dataTable"+i,"tab-con"); //根据屏幕大小改变表格
                        }
                        if(i==0){
                            $(".tab-nav li").eq(i).addClass("active");
                            PageModel.totalList("dataTable"+i);
                        }*/
                        // jqGridAll.jG_Resize("#dataTable"+i); //根据屏幕大小改变表格
                    }

                    function renderJGTabel(index,jqGridOptions,itemCode){
                        //设置排序
                        //  console.log(index,jqGridOptions,itemCode);

                        var dataArr = PageModel.sortFn(jqGridOptions.dataTable);
                        if(itemCode =='ST_KDPCXX'){
                            for(var j=0;j<jqGridOptions.colModel.length;j++){
                                if(jqGridOptions.colModel[j].name == "name"){
                                    jqGridOptions.colModel[j].cellattr = cellattr;
                                }
                            }
                            var totalGroup = jqGridAll.jG_totalGroup("name");    //合计列
                            var editRowFn = jqGridAll.jG_editRowFn("#jqGrid-table"+i,'',true);//设置可编辑，但是不可以输入汉字
                            var gridComplete = jqGridAll.jG_gridComplete("#jqGrid-table"+i,"name");  //单元格合并
                            var configData  = jqGridAll.jG_configData(dataArr);  //创建table的数据
                            // var len = dataArr.length+1;
                            var gridConfig = jqGridAll.jG_config('',jqGridOptions.colNames,jqGridOptions.colModel,len);
                            $("#jqGrid-table"+i).jqGrid($.extend(configData,gridConfig,gridComplete,totalGroup,editRowFn));
                            jqGridAll.jG_Resize("jqGrid-table"+i,"tab-con"); //根据屏幕大小改变表格
                        }

                    }
                }else if(data.type == "NaoHAL") {                            //氧化铝氢氧化铝
                    for (var i = 0; i < tableArr.length; i++) {
                        var colNames = [];      //表头
                        var colModel = [];      //基础配置;
                        var dataTable = [];      //表格数据
                        for(var k=0;k<tempArr.length;k++){
                            if (tableArr[i].code == tempArr[k].itemCode) {
                                colNames = tempArr[k].colNames;
                                colModel = tempArr[k].colModel;
                                dataTable = tableArr[i].nodes;
                            };
                            //设置排序
                            var dataArr = PageModel.sortFn(dataTable)
                        }
                        var editRowFn = jqGridAll.jG_editRowFn("#dataTable"+i,'',true);//设置可编辑，但是不可以输入汉字
                        var configData = jqGridAll.jG_configData(dataArr);  //创建table的数据
                        var len = dataArr.length;
                        var gridConfig = jqGridAll.jG_config('', colNames,colModel,len);//设置可编辑，但是不可以输入汉字 colModel);
                        $("#dataTable" + i).jqGrid($.extend(configData, gridConfig,editRowFn));
                        jqGridAll.jG_Resize("#dataTable"+i,"tab-con"); //根据屏幕大小改变表格
                    }
                }else if(data.type == "Decgroove") { //分解槽
                    for (var i = 0; i < tableArr.length; i++) {
                        var colNames = [];      //表头
                        var colModel = [];      //基础配置;
                        var dataTable = [];      //表格数据
                        // if(tableArr[i].code ==tempArr[i].itemCode){
                            colNames = tempArr[i].colNames;
                            colModel = tempArr[i].colModel;
                            dataTable = tableArr[i].nodes;
                        // };
                        for(var k=0;k<dataTable.length;k++){
                            dataTable[k].types = "FJCYWCL";
                        };
                        //设置排序
                        var dataArr = PageModel.sortFn(dataTable);
                        var editRowFn = jqGridAll.jG_editRowFn("#dataTable",'',true);//设置可编辑，但是不可以输入汉字
                        var len = dataArr.length;
                        var configData  = jqGridAll.jG_configData(dataArr);  //创建table的数据
                        var gridConfig = jqGridAll.jG_config('',colNames,colModel,len);
                        $("#dataTable").jqGrid($.extend(configData,gridConfig,editRowFn));
                        jqGridAll.jG_Resize("#dataTable","tab-con"); //根据屏幕大小改变表格
                    }
                }else if(data.type == "dcs"){ //dcs
                    for (var i = 0; i < tableArr.length; i++) {
                        var colNames = [];      //表头
                        var colModel = [];      //基础配置;
                        var dataTable = [];      //表格数据
                        var loadTable;
                        for(var k=0;k<tempArr.length;k++){
                            if(tempArr[k].itemCode == tableArr[i].code){
                                colNames = tempArr[i].colNames;
                                colModel = tempArr[i].colModel;
                                dataTable = tableArr[i].nodes;
                            }
                        }
                        for(var k=0;k<dataTable.length;k++){
                            dataTable[k].types = "DCSCGYW";
                            dataTable[k].timeStep = "120";
                        }
                        var itemHtml;
                        if(index!=undefined){
                            itemHtml = "#dataTable";
                        }else{
                            itemHtml = "#dataTable"
                        }
                        var dataArr = PageModel.sortFn(dataTable);
                        var len =dataArr.length;
                        var editRowFn = jqGridAll.jG_editRowFn(itemHtml,'',true);//设置可编辑，但是不可以输入汉字
                        var configData  = jqGridAll.jG_configData(dataArr);  //创建table的数据
                        var gridConfig = jqGridAll.jG_config('',colNames,colModel,len);
                        $(itemHtml).jqGrid($.extend(configData,gridConfig,editRowFn));
                        jqGridAll.jG_Resize(itemHtml,"tab-con"); //根据屏幕大小改变表格
                        loadTable = jqGridAll.jG_loadTable(itemHtml,dataTable)
                    }
                }else if(data.type == "Deposit"){                    //煤存
                    for (var i = 0; i < tableArr.length; i++) {
                        var colNames = [];      //表头
                        var colModel = [];      //基础配置;
                        var dataTable = [];      //表格数据
                        // if(tableArr[i].code ==tempArr[i].itemCode){
                            colNames = tempArr[i].colNames;
                            colModel = tempArr[i].colModel;
                            dataTable = tableArr[i].nodes;
                        // };
                        for(var j=0;j<colModel.length;j++){
                            if(colModel[j].name == "name"){
                                colModel[j].cellattr = cellattr;
                            }
                        };
                        var editRowFn = jqGridAll.jG_editRowFn("#dataTable",'',true);//设置可编辑，但是不可以输入汉字
                        var totalGroup = jqGridAll.jG_totalGroup("name");    //合计列
                        var gridComplete = jqGridAll.jG_gridComplete("dataTable","name");  //单元格合并
                        var configData  = jqGridAll.jG_configData(dataTable);  //创建table的数据
                        var gridConfig = jqGridAll.jG_config('',colNames,colModel);
                        $("#dataTable").jqGrid($.extend(configData,gridConfig,gridComplete,totalGroup,editRowFn));
                        jqGridAll.jG_Resize("#dataTable","tab-con"); //根据屏幕大小改变表格
                    }
                    PageModel.totalList("dataTable"+i);
                }else if(data.type == "Process"){   //过程物料化验信息
                    var tableItem;
                    for (var i = 0; i < tableArr.length; i++) {
                        var colNames = [];      //表头
                        var colModel = [];      //基础配置;
                        var dataTable = [];      //表格数据
                        var loadTable;
                        // if(tableArr[i].code ==tempArr[i].itemCode){
                            colNames = tempArr[i].colNames;
                            colModel = tempArr[i].colModel;
                            dataTable = tableArr[i].nodes;
                        // };
                        if(index != undefined){
                            tableItem = "#dataTable";
                        }else{
                            tableItem = "#dataTable";
                        }
                        var dataArr = PageModel.sortFn(dataTable);
                        var len = dataTable.length;
                        var editRowFn = jqGridAll.jG_editRowFn(tableItem,'',true);//设置可编辑，但是不可以输入汉字
                        var configData  = jqGridAll.jG_configData(dataArr);  //创建table的数据
                        var gridConfig = jqGridAll.jG_config('',colNames,colModel,len);
                        $(tableItem).jqGrid($.extend(configData,gridConfig,editRowFn));
                        jqGridAll.jG_Resize(tableItem,"tab-con"); //根据屏幕大小改变表格
                        loadTable = jqGridAll.jG_loadTable(tableItem,dataTable)
                    }
                }else if(data.type == "Field"){
                    PageModel.createTabClick(tableArr);
                    for(var i=0;i<tableArr.length;i++){
                        var  colNames = [];      //表头
                        var  colModel = [];      //基础配置;
                        var dataTable = [];      //表格数据
                        // if(tableArr[i].code ==tempArr[i].itemCode){
                            colNames = tempArr[i].colNames;
                            colModel = tempArr[i].colModel;
                            dataTable = tableArr[i].nodes;
                        // };
                        for(var j=0;j<colModel.length;j++){
                            if(colModel[j].name == "name"){
                                colModel[j].cellattr = cellattr;
                            }
                        };
                        var editRowFn = jqGridAll.jG_editRowFn("#dataTable"+i,'',true);//设置可编辑，但是不可以输入汉字
                        var gridComplete = jqGridAll.jG_gridComplete("dataTable"+i,"name");  //单元格合并
                        var configData  = jqGridAll.jG_configData(dataTable);  //创建table的数据
                        var gridConfig = jqGridAll.jG_config('',colNames,colModel);
                        $("#dataTable"+i).jqGrid($.extend(configData,gridConfig,gridComplete,editRowFn));
                        jqGridAll.jG_Resize("#dataTable"+i,"tab-con"); //根据屏幕大小改变表格
                        if(i!=0){
                            $(".datagridsContent").eq(i).addClass("hide")
                        }else{
                            $(".tab-nav li").eq(i).addClass("active")
                        }
                    }
                }
            });
            //保存按钮
            $(".btn-save").unbind("click").on("click",function () {
                $('td.edit-cell').each(function (i, item) {
                    $(this).siblings('td').siblings('td').eq(0).trigger('click');
                });
                $('input[type=text].editable').each(function (i, item) {
                    $(this).parents('td').text($(this).val());
                    $(this).remove()
                });
                //判断是否保存条件成立

                if($(".supervisionplate").val() == ""){   //监盘人是否存
                    Mom.layAlert("请填写监盘人员");
                }else if($("#startDate option:selected").val() == ""){   //选择日期
                    Mom.layAlert("请选择盘存日期");
                }else if($("#otherPlate").val() == ""){   //监盘人员
                    Mom.layAlert("请填写参与监盘人员")
                }else{
                    if(data.type == "Process"){         //过程物料
                        if($("#classes option:selected").val() == ""){   //班次
                            Mom.layAlert("请选择班次")
                        }else if($("#teamGroup option:selected").val() == ""){  //班组
                            Mom.layAlert("请选择班组")
                        }else{
                            var ids=[];
                            ids.push("dataTable");
                            PageModel.saveTable(ids,data)
                        }
                    }else {
                        var ids=[];
                        if( $(".datatable").length>1){
                            $(".datatable").each(function (index, item) {
                                ids.push("dataTable" + index);
                            });
                        }else{
                            ids.push("dataTable");
                        }
                        PageModel.saveTable(ids,data)
                    }
                }
            });
            //数据采集按钮
            $("#dataCollection-btn").unbind("click").on("click",function () {
                $('td.edit-cell').each(function (i, item) {
                    $(this).siblings('td').siblings('td').eq(0).trigger('click');
                });
                $('input[type=text].editable').each(function (i, item) {
                    $(this).parents('td').text($(this).val());
                    $(this).remove()
                });
                if($("#Interval option:selected").val() == ""){
                    Mom.layMsg('请选择采集时间段');
                }else{
                    var ids = [];
                    ids.push("dataTable");
                    PageModel.dataCollection(ids,data,tableArr,tempArr);
                }
            });
            //计算按钮
            $("#dataCollection").unbind("click").on("click",function () {
                $('td.edit-cell').each(function (i, item) {
                    $(this).siblings('td').siblings('td').eq(0).trigger('click');
                });
                $('input[type=text].editable').each(function (i, item) {
                    $(this).parents('td').text($(this).val());
                    $(this).remove()
                });
                var ids = [];
                ids.push("dataTable");
                PageModel.calculation(ids,data,tempArr);
            });
        },
        //tab切换方法
        createTabClick:function (tableArr) {
            //先创建tab-nav结构
            var html ="",liLen = tableArr.length;
            if(liLen){
                for(var i=0;i<liLen;i++){
                    html += "<li class='"+(i==0?' active' :'')+"' type='"+tableArr[i].code+"'>"+tableArr[i].name+"</li>";
                }
                $(".tab-nav").append(html);
            }
            $('.tab-nav>li').click(function(){
                var ind = $(this).index();
                $(this).addClass('active').siblings('li').removeClass('active');
                var tabBtnsLen = $(this).parent().siblings('.tab-btns').length;
                if(tabBtnsLen){
                    $('.tab-btns li').eq(ind).addClass('active').siblings().removeClass('active');
                    $('.tab-con .jqTable-item').eq(ind).addClass('active').siblings().removeClass('active');
                }else{
                    $('.tab-con .jqTable-item').eq(ind).addClass('active').siblings('div').removeClass('active');
                }
            });
        },
        //保存方法
        saveTable:function (ids,obj) {
            var arrAll = '', arrfjc = '';
            var contentArr = [], allObj = {};
            /**_____测试假数据保存*/
            require(["jqGrid_my"],function (jqGridAll) {
                if (ids.length === 1) {
                    arrAll = $('#' + ids).jqGrid('getRowData');
                } else if (ids.length > 1) {
                    for (var i = 0; i < ids.length; i++) {
                        arrfjc = $('#' + ids[i]).jqGrid('getRowData');
                        contentArr.push(arrfjc);
                    }
                    arrAll = contentArr;
                }
                var saveObj = { rows: arrAll};
                var datamsg = saveObj.rows;
                var dataArr = [];
                if(ids.length==1){
                    for(var i=0;i<datamsg.length;i++){
                        dataArr.push(datamsg[i])
                    }
                }else{
                    for(var i=0;i<datamsg.length;i++){
                        for(var j=0;j<datamsg[i].length;j++){
                            dataArr.push(datamsg[i][j]);
                        }
                    }
                };
                if(obj.type == "NaoHAL"){
                    for(var k=0;k<dataArr.length;k++){
                        dataArr[k].name = dataArr[k].subName;
                    }
                };
                var data = {
                    id:obj.id==undefined?"":obj.id,
                    fstMan: Mom.getCookie("userName"),
                    secMan:$(".supervisionplate").val(),
                    thrMan:$("#otherPlate").val(),
                    stocktakeDate:$("#startDate option:selected").val(),
                    stocktakeType:obj.stocktakeType,//KSSHCC   YHLCQYHLDZ   FJCYWCL  DCSCGYW  MC  GCWL   JCWL
                    status:obj.status==null?"0":obj.status
                };
                if(obj.type == "Process"){
                    data.duty = $("#classes option:selected").val(),
                    data.dutyGroup = $("#teamGroup option:selected").val()
                }
                data[obj.data] = JSON.stringify(dataArr);
                Api.ajaxForm(Api.aps+obj.saveUrl,data,function (result) {
                    if(result.success){
                        Mom.layMsg('保存成功');
                        top.layer.msg('操作成功，即将返回盘存收集列表页！', {
                            icon: 1,
                            time: 800
                        });
                        setTimeout(function () {
                            Mom.winBack();
                        }, 1000)
                    }else{
                        Mom.layAlert(result.message)
                    }
                })
            })
        },
        //计算合计方法
        totalList:function (item) {
            var arr = [];
            $("#"+item+" tr td").each(function (index,items) {
                $(items).unbind("click").on("click",function (e) {
                    var changeTitle = $(this).parent().find("td").eq(3).text();
                    PageModel.eachTable(item,items,changeTitle)
                })
            });
        },
        eachTable:function (item,items,changeTitle) {
            var num = Number();
            var num1 = Number();
            var sum = Number();
            var sumHtml;
            $("#"+item +" tr").each(function (index,items) {
                if(changeTitle == $(items).find("td").eq(3).text()){    //如果说选中编辑的td==所有tr下的第三个td
                    if($(items).find("td:last").find("input")){  //如果最后一个td的input不存在
                        num+=Number($(items).find("td:last").text());
                    }else{
                        $(items).find("td:last").find("input").val();      //如果input存在
                        num1 = Number($(items).find("td:last").find("input").val());
                    }
                    sum=num+num1;
                }
            });
            if(sum.toString() == "NaN"){
                sum = 0;
            }
            $(items).parent().nextAll(".jqfoot").eq(0).find("td:last").text("合计："+sum)
        },
        //数据采集
        dataCollection:function (ids,obj,dataArr,tempArr) {
            var arrAll = '';
            require(["jqGrid_my"],function (jqGridAll) {
                arrAll = $('#' + ids).jqGrid('getRowData');
                var saveObj = { rows: arrAll};
                var collArr = [];
                for(var i=0;i<saveObj.rows.length;i++){
                    var collObj = {};
                    collObj.tagName = saveObj.rows[i].tagName;
                    collObj.timeStep = saveObj.rows[i].timeStep;
                    collArr.push(collObj)
                };
                var data = {
                    cltTime:$(".time").text()+"-"+$("#Interval option:selected").val(),
                    tagInfo:JSON.stringify(collArr)
                };
                Api.ajaxForm(Api.pi+"/api/PiApi/tagNearLocal",data,function (result) {
                    if(result.success){
                        for(var i=0;i<result.rows.length;i++){
                            dataArr[0].nodes[i].timeStep = result.rows[i].timeStep;
                            dataArr[0].nodes[i].highPos = result.rows[i].val
                        }
                    }
                    PageModel.tab-nav(dataArr,tempArr,obj,1)
                });
            })
        },
        //计算
        calculation:function (ids,obj,tempArr) {
            var arrAll = '';
            require(["jqGrid_my"],function (jqGridAll) {
                arrAll = $('#' + ids).jqGrid('getRowData');
                var saveObj = { rows: arrAll};
                var data = {
                    processMtrlMap: JSON.stringify(saveObj.rows)
                };
                Api.ajaxForm(Api.aps+"/api/aps/CollectProcessMtrl/calculate",data,function (result) {
                    if(result.success){
                        var data = PageModel.sortFn(result.rows);  //进行排序
                        var arr = [];
                        var dataObj = {
                            nodes:data,
                            code:"ST_GCWLHYXX"
                        };
                        arr.push(dataObj);
                        PageModel.createTable(arr,tempArr,obj,1)
                    }
                });
            })
        },
        //排序
        sortFn:function (data) {
            for(var i=0;i<data.length;i++){
                data[i].sort = i+1;
            }
            return data;
        },
    };
    $(function () {
        PageModel.init();
    })
});
