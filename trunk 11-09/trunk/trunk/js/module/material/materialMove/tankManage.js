/**
 * Created by admin on 2018/10/16.
 */
require(['/js/zlib/app.js'], function(App) {
    require(['jqGrid_my'], function (jqGridAll) {
        var PageModule = {
            nodeObj : {},
            /*************检尺********************/
        init:function () {
                PageModule.loadClass();
                require(['datetimepicker'], function () {
                    //时间选择插件(获取年月日日期)
                    $("#tankDate").datetimepicker({
                        format: "yyyy-mm-dd",   //保留到日
                        language:'zh-CN',          //中文显示
                        minView: "month",      //月视图
                        todayBtn: true,       //切换到今天
                        clearBtn: true,       //清除全部
                        autoclose:true, //选择时间后自动隐藏
                    });
                });
                var temPlate = []; //获取到所有的模板数据，tab切换的时候不在请求json
                //保存table的div
                var measure = $('#measure').html();
                var matrlMove = $('#matrlMove').html();
                var sealingAccount = $('#sealingAccount').html();
                pageLoad = function () {
                    $.get("../../json/factoryModel/materialMove/tankManage.json",function (result) {
                        temPlate = result.rows;
                        PageModule.tabBtnclick(temPlate);//tab切换选择不同的json配置
                    });
                };

                $('#search-btn').click(function(){
                    //先清空table在渲染table,实现jqgrid列表刷新重绘
                    $('#measure').empty().html(measure);
                    $('#matrlMove').empty().html(matrlMove);
                    $('#sealingAccount').empty().html(sealingAccount);
                    pageLoad();
                });
            /*
            * 生成初始化记录
            * winOptons：配置生成初始化记录按钮的方法，callback
            * */
            var winOptons = {
                btnArr: [
                    {btn:'生成初始化记录', fn: function(layerIdx, layero){
                        var iframeWin = layero.find('iframe')[0].contentWindow;
                        var formData = iframeWin.getFormData();
                        if(formData){
                            var data = {
                                tankId:formData.data.tankId,
                                mtrlId:formData.data.mtrlId,
                                initDate:formData.data.initDate[0]
                            }
                            // //调用接口：生成初始化数据
                            console.log(data)
                            Api.ajaxJson(Api.mtrl+"/api/mv/TankChk/SaveTankInitialization",JSON.stringify(data),function(result) {
                                console.log(result)
                                if (result.success == true) {
                                    console.log(result)
                                    Mom.layMsg("操作成功！");
                                    // var wuliao = result.AA.wuliao||data.wuliao;
                                    //更新选中行中的物料数据
                                    top.layer.close(layerIdx);
                                }else{
                                    Mom.layAlert(result.message);
                                }
                            });
                        }
                    }}
                ],
            };
            $("#initialize").unbind("click").on("click",function () {
                var getparam=$('#dataTable0').getGridParam('selrow');
                var id =$('#dataTable0').getCell(getparam,'tankId');
                var initialization =$('#dataTable0').getCell(getparam,'initialization');
                var tankName = "槽/罐管理";
                var tankTime = $("#shiftHidden").attr("data-time");  //列表日期
                var tankShift = $("#shiftHidden").val(); //列表班次
                if(tankTime == ""){
                    Mom.layMsg("请选择日期");
                }else if(tankShift == ""){
                    Mom.layMsg("请选择班次");
                }else{
                    if(id == undefined){
                        Mom.layMsg("请选择一条数据");
                    }else if(initialization == "1"){
                        Mom.layMsg("该罐已经初始化");
                    }else {
                        Bus.openDialogCfg("槽/罐区-槽/罐初始化","../material/materialMove/initializeFrom.html?id="+id+"&tankName="+tankName+"&tankTime="+tankTime+"&tankShift="+tankShift,"574px",'207px',winOptons)
                    }
                }
            });
            /*
             * 检尺信息录入
             * tankOptions：配置数据采集，数据计算，确定方法，callback
             * */
                // cltTime	2018-09-09 10:00:00
                // tagInfo [{'tagName':'FSLY.DATA.RC1AI0039','timeStep':36000},{'tagName':'FSLY.DATA.RC1AI0040','timeStep':3600}]
            var tankOptions = {
                btnArr:[
                    {btn:'数据采集',fn:function (layerIdx,layero) {
                        var iframeWin = layero.find('iframe')[0].contentWindow;
                        var formData = iframeWin.getTankFormData();
                        if(formData){
                            var data = {
                                cltTime:"2018-10-24 16:00:00",
                                tagInfo:JSON.stringify([{"tagName":"FSLY.DATA.RC1AI0039","timeStep":"3600"}])
                            };
                            //调用接口：生成初始化数据
                            Api.ajaxForm(Api.pi+"/api/PiApi/tagNearLocal",data,function(result) {
                                if (result.success) {
                                    Mom.layAlert(result.message);
                                    iframeWin.document.getElementById("chkInstVal").value = result.rows[0].val;
                                    // var wuliao = result.AA.wuliao||data.wuliao;
                                    //更新选中行中的物料数据
                                    // top.layer.close(layerIdx);
                                }else{
                                    Mom.layAlert(result.message);
                                }
                            });
                        }
                    }},
                    {btn:'槽/罐量计量',fn:function (layerIdx,layero) {
                        var iframeWin = layero.find('iframe')[0].contentWindow;
                        var formData = iframeWin.getTankFormData();
                        if(formData){
                            var data = formData.data;
                            //调用接口：生成初始化数据
                            Api.ajaxJson(Api.mtrl+"/api/mv/TankChk/formula",JSON.stringify(data),function(result) {
                                if (result.success == true) {
                                    Mom.layMsg("计算成功！");
                                    Validator.renderData(result.TankChk, '#inputForm');
                                    //更新选中行中的物料数据
                                }else{
                                    Mom.layAlert(result.message);
                                    console.log(result)
                                }
                            });
                        }
                    }},
                    {btn:'确定',fn:function (layerIdx,layero) {
                        var iframeWin = layero.find('iframe')[0].contentWindow;
                        var disable = iframeWin.document.getElementById("chkTime")
                        $(disable).removeAttr("disabled")
                        var formData = iframeWin.getTankFormData();
                        if(formData){
                            var data = formData.data;
                            //调用接口：生成初始化数据
                            console.log(data);
                            Api.ajaxJson(Api.mtrl+"/api/mv/TankChk/save",JSON.stringify(data),function(result) {
                                if (result.success == true) {
                                    console.log(result)
                                    Mom.layMsg("保存成功！");
                                    top.layer.close(layerIdx);
                                }else{
                                    Mom.layAlert(result.message);
                                }
                            });
                        }
                    }}
                ]
            };
            $("#construction").unbind("click").on("click",function () {
                var getparam=$('#dataTable0').getGridParam('selrow');
                var id =$('#dataTable0').getCell(getparam,'tankId');
                var initialization =$('#dataTable0').getCell(getparam,'initialization');  //判断罐是否初始化
                var dataTime = $("#shiftHidden").attr("data-time");  //列表日期
                var dataShift = $("#shiftHidden").val(); //列表班次
                if(id == undefined){
                    Mom.layMsg("请先选择一条数据");
                }else if(initialization == "1"){
                    // Mom.layMsg("请先对该罐进行初始化");
                    Bus.openDialogCfg("槽/罐检尺信息录入","../material/materialMove/informationEntryFrom.html?id="+id+"&dataTime="+dataTime+"&dataShift="+dataShift,'1128px','692px',tankOptions)

                }else if(initialization == "0"){
                    Mom.layMsg("请先对该罐进行初始化");
                    // Bus.openDialogCfg("槽/罐检尺信息录入","../material/materialMove/informationEntryFrom.html?id="+id+"&dataTime="+dataTime+"&dataShift="+dataShift,'1128px','692px',tankOptions)
                }
            });
            /*
            * 批量检尺
            * */
            
            $("#batch").unbind("click").on("click",function () {
                //传罐区ID
                var id = $("#shiftHidden").attr("data-areatankid");
                var dataTime = $("#shiftHidden").attr("data-time");  //列表日期
                var dataShift = $("#shiftHidden").val(); //列表班次
                Bus.openEditDialog("批量检尺","../material/materialMove/batchMeasureForm.html?id="+id+"&dataTime="+dataTime+"&dataShift="+dataShift,'864px','427px')
            });
            require(['ztree_my'], function (ZTree) {
                var orgTree, curClickTreeNode;
                var orgZtreeSetting = $.extend(true,{},{
                    callback: {onClick: orgOnClick}
                },{});
                var orgApiCfg = $.extend(true,{},{
                    url: "/api/mv/Tank/getTankTree",
                    data: {},
                    contentType: 'json'
                },{});
                var orgConType = orgApiCfg.contentType||'json';
                loadOrgData();
                function loadOrgData(){
                    if(orgConType == 'json'){
                        //json的方式调用接口
                        Api.ajaxJson(Api.mtrl+orgApiCfg.url,{}, function(result) {
                            if (result.success) {
                                loadOrgTree(result.rows);
                            } else {
                                Mom.layMsg(result.message);
                            }
                        });
                    }else{
                        //form的方式调用接口
                        Api.ajaxForm(orgApiCfg.url, {}, function(result) {
                            if (result.success) {
                                loadOrgTree(result.rows);
                            } else {
                                Mom.layMsg(result.message);
                            }
                        });
                    }
                }
                function loadOrgTree(rows){
                    var ztree1 = new ZTree();
                    orgTree = ztree1.loadData($("#zTree"),rows,false,orgZtreeSetting);
                    ztree1.registerSearch(orgTree, $('#wait_searchText'), 'name');
                    var nodes = orgTree.getNodes();
                    if (nodes.length>0) {
                        orgTree.selectNode(nodes[0]);
                        if(nodes[0].pId == null){
                            $("#shiftHidden").attr("data-nodeTankId","");
                            $("#shiftHidden").attr("data-areaTankId",nodes[0].id);  //设置隐藏罐区ID
                        }else{
                            $("#shiftHidden").attr("data-areaTankId","");
                            $("#shiftHidden").attr("data-nodeTankId",nodes[0].id);    //设置隐藏罐ID
                        }
                    }
                    /*
                    * 加载数据
                    * 根据默认条件查询接口，创建table
                     * */
                    pageLoad();
                }
                function orgOnClick(event, treeId, treeNode, clickFlag){
                 PageModule.nodeObj = treeNode
                    if(orgTree){
                        curClickTreeNode = treeNode;
                        orgTree.expandNode(treeNode);
                    }
                }
            });
            },
        tabBtnclick:function (temPlate) {
            var flage = true;
            //tab切换
            $(".tabBtn li").removeClass("active");
            $(".tabBtn li").each(function (index,item) {
                $(item).unbind("click").on("click",function () {
                    $(this).addClass("active").siblings("li").removeClass("active");
                    $(".msgbox").eq(index).removeClass("hide").siblings(".msgbox").addClass("hide");
                    $(".operationBtn").eq(index).removeClass("hide").siblings(".operationBtn").addClass("hide");
                        PageModule.getData(index,temPlate[index]);
                });
                if(index==0){
                    $(item).addClass("active");
                    $(".msgbox").eq(index).removeClass("hide");
                    PageModule.getData(index,temPlate[index])
                    $(".operationBtn").eq(0).removeClass("hide")
                }
            });
        },
        getData:function (index,temPlate) {
                $("#shiftHidden").val($('#shift option:selected') .val());  //设置隐藏班次
                var dataTime = $("#tankDate").val()==""?Mom.shortDate:$("#tankDate").val();
                $("#tankDate").val(dataTime)
                $("#shiftHidden").attr("data-time",dataTime);   //设置隐藏日期
                if(PageModule.nodeObj.pId == null){
                    $("#shiftHidden").attr("data-nodeTankId","");
                    $("#shiftHidden").attr("data-areaTankId",PageModule.nodeObj.id);  //设置隐藏罐区ID
                }else{
                    $("#shiftHidden").attr("data-areaTankId","");
                    $("#shiftHidden").attr("data-nodeTankId",PageModule.nodeObj.id);    //设置隐藏罐ID
                }
            var data = {
                nodeTankId: $("#shiftHidden").attr("data-nodeTankId"), //罐id
                date:$("#tankDate").val(),                             //日期
                shift: $("#shiftHidden").val(),                        //班次
                areaTankId: $("#shiftHidden").attr("data-areaTankId")  //罐区id
            };
            //请求列表接口
            Api.ajaxForm(Api.mtrl+"/api/mv/TankChk/TankList",data,function (result) {
                console.log(result)
                var dataTable = result.rows;
                if(index == 0){
                    PageModule.createPrimary(index,dataTable,temPlate);
                }else if(index == 1){
                    PageModule.materialMoveInit(index,dataTable,temPlate);
                }else if(index == 2){
                    PageModule.accountInit(index,dataTable,temPlate);
                }
            });
        },
        /*
        *index:是索引
        * dataTable是加载的数据
        * temPlate:是jqGrid基础配置的模板
        * */
        createPrimary:function (index,dataTable,temPlate){
            console.log(temPlate)
            console.log(temPlate.primaryTable[0].colNames.length)
            console.log(temPlate.primaryTable[0].colModel.length)
            var dataTime = $("#shiftHidden").attr("data-time");
            var dataShift = $("#shiftHidden").val();
            var data = {
                date:$("#shiftHidden").attr("data-time"),
                shift:$("#shiftHidden").val()
            }
           var  settings1 = {   //主表配置
               colNames:temPlate.primaryTable[0].colNames,
               colModel:temPlate.primaryTable[0].colModel,
               data:dataTable,
               multiselect: true
           };
           var settings2 = {
               colNames:temPlate.seedTable[0].colNames,
               colModel:temPlate.seedTable[0].colModel
           };
            console.log(temPlate.seedTable[0].colNames.length)
            console.log(temPlate.seedTable[0].colModel.length)
           var config = {
               url:Api.mtrl+"/api/mv/TankChk/findTankChk",
               dataParams:{
                   date:"2018-10-24",
                   shift:"2",
               },
               otherId:'tankId',
               contentType:"Form"
           };
                var subtable = [];
                jqGridAll.jG_jqGridTableLevel("#dataTable"+index,settings1,settings2,config,subtable);
                // jqGridAll.jG_Resize("#dataTable"+index,"#measure"); //根据屏幕大小改变表格
                jqGridAll.jG_loadTable("#dataTable0",dataTable)
                $(".tank-scaleI").text(dataTable.length)
        },
            //初始化
        initializeFrom:function () {
            require(['datetimepicker'], function () {
                //时间选择插件(获取年月日日期)
                $("#initDate").datetimepicker({
                    format: "yyyy-mm-dd HH:mm:ss",   //保留到日
                    language:'zh-CN',          //中文显示
                    minView: "month",      //月视图
                    todayBtn: true,       //切换到今天
                    clearBtn: true,       //清除全部
                    autoclose:true, //选择时间后自动隐藏
                });
            });
            var id = Mom.getUrlParam("id");
            var tankShift = Mom.getUrlParam("tankShift");
            $("#tankId").val(id);
            $("#startData").val(tankShift.slice(0,8));
            $("#endData").val(tankShift.slice(9,17));
            var tankTime = Mom.getUrlParam("tankTime");
            var tankShift = Mom.getUrlParam("tankShift");
            Api.ajaxForm(Api.mtrl+"/api/mv/TankChk/tankInitialization",{nodeTankId:id},function(result){
                console.log(result)
                if(result.success){
                    Validator.renderData(result.nodeTank.area, '#inputForm');
                    Bus.appendOptionsValue('#mtrlId',result.mtrlList,'id','mtrlName');
                }else{
                    Mom.layAlert(result.message);
                }
            });
            //参数
            window.getTankFormData = function(getData){
                var formObj = $('#inputForm');
                if(getData==true){
                    if(!Validator.valid(formObj,1.3)){
                        return;
                    }
                    var obj={
                        tankVal:$('#tankConVal').val(),
                        data: formObj.serializeJSON(),
                        url: formObj.attr('action')
                    };
                    return obj;
                }
                if(!Validator.valid(formObj,1.3)){
                    return;
                }
                return {
                    // url: formObj.attr('action'),
                    data: formObj.serializeJSON()
                }
            };
            // window.getFormData = function(){
            //     var formObj = $('#inputForm');
            //     if(!Validator.valid(formObj,1.3)){
            //         return;
            //     }
            //     return {
            //         data: formObj.serializeJSON()
            //     }
            // };
        },
        loadClass:function () {
            var url_ = Api.aps+'/api/ctrl/Shift/list';
            Api.ajaxJson(url_, {}, function(result){
                if(result.success){
                    var rows = result.rows;
                    var options = new Array();
                    $(rows).each(function(i,o){
                        var label = o['name']+'('+o['startTime']+'-'+o['endTime']+')';
                        var value = o['startTime']+'-'+o['endTime']
                        options.push({'value':value, 'label':label});
                    });
                    Bus.appendOptions($('#shift'), options);
                }else{
                    Mom.layMsg(result.message);
                }
            });
        },
        //新建检尺
        createTankInit:function () {
            var dataTime = Mom.getUrlParam("dataTime");
            var dataShift = Mom.getUrlParam("dataShift");
            require(['datetimepicker'], function () {
                //时间选择插件(获取年月日日期)
                $("#initDate,#chkTime").datetimepicker({
                    format: "yyyy-mm-dd HH:mm:ss",   //保留到日
                    language:'zh-CN',          //中文显示
                    minView: "month",      //月视图
                    todayBtn: true,       //切换到今天
                    clearBtn: true,       //清除全部
                    autoclose:true, //选择时间后自动隐藏
                });
            });
            //检尺类型
            var id = Mom.getUrlParam("id");
            var dataTime = Mom.getUrlParam("dataTime");
            var dataShift = Mom.getUrlParam("dataShift");
            var data = {
                tankId:id
            };
            //初始化回显
            Api.ajaxJson(Api.mtrl+"/api/mv/TankChk/form",JSON.stringify(data),function(result){
                if(result.success){
                    Validator.renderData(result.TankChk, '#inputForm');
                    $("#chkUser").val(Mom.getCookie("userName"));
                    Bus.appendOptionsValue('#chkType',result.tankChkTypeList,'value','label');
                    $("#chkType").change(function () {
                        PageModule.dataTime($(this).val(),dataTime,dataShift,"#chkTime");
                    })
                }else{
                    Mom.layAlert(result.message);
                }
            });
            window.getTankFormData = function(){
                var formObj = $('#inputForm');
                if(!Validator.valid(formObj,1.3)){
                    return;
                }
                if($("#chkType option:selected").val() == ""){
                    Mom.layMsg("请选择检尺类型")
                }else{
                    return {
                        data: formObj.serializeJSON()
                    }
                }

            };
        },
        //批量检尺
        batchMeasureInit:function () {
            var areaTankId = Mom.getUrlParam("id");   //获取罐区ID;
            var dataTime = Mom.getUrlParam("dataTime");
            var dataShift = Mom.getUrlParam("dataShift");
                //加载配置模板
            var newData = [];
            var newtemplate = [];
            var dataCollection = [];
            var data = {
                nodeTankId:"",  //罐ID
                rap:"",        //是否动罐;动罐为move，全部为空
                areaTankId:areaTankId   //罐区ID
            };
            Api.ajaxForm(Api.mtrl+"/api/mv/TankChk/newTanChkkList",data,function (Tabledata) {
                $.get("../../../json/factoryModel/materialMove/batchMeasure.json",function (result) {
                    Bus.appendOptionsValue('#authEnable',Tabledata.tankChkTypeList,'value','label');
                    $("#authEnable").change(function () {
                        PageModule.dataTime($(this).val(),dataTime,dataShift,"#dataTime");
                    });
                    newData = Tabledata.chkList;
                    newtemplate = result.batchInit;
                    PageModule.createBatch(newData,newtemplate,"0");
             });
                //只可以点击新建按钮，点击结束后，移除数据采集和计算的不可点击
                $("#btn-add").unbind("click").on("click",function () {
                    var tableArr = [];
                    var modelArr = [];
                   $("#btn-batch").attr("disabled",false);
                   $("#btn-total").attr("disabled",false);
                   var ids = jqGridAll.jG_getCheckAllIds("#dataTable");
                    for (var i=0;i<newData.length;i++){
                        for(var k=0;k<ids.length;k++){
                            if(newData[i].id == ids[k]){
                                tableArr.push(newData[i])
                            }
                        }
                    }
                    dataCollection = tableArr
                    PageModule.createBatch(tableArr,newtemplate,"1")
                });
                //侦听批量采集时间
                $("#btn-batch").unbind("click").on("click",function () {
                    //获取到点位号，以及时间重新加载table；
                    $('input[type=text].editable').each(function (i, item) {
                        $(this).parents('td').text($(this).val());
                        $(this).remove();
                    });
                    var arrAll = $('#TableEdit').jqGrid('getRowData');
                    console.log(arrAll);
                    Api.ajaxJson(Api.pi+"/api/PiApi/tagNear",data,function (result) {
                        //调用createBatch方法重新渲染table
                    })
                });
                //侦听批量计算按钮
                $("#btn-total").unbind("click").on("click",function () {
                    //获取到要计算的参数，然后计算;
                    $('input[type=text].editable').each(function (i, item) {
                        $(this).parents('td').text($(this).val());
                        $(this).remove()
                    });
                    var dataTable  = $("#TableEdit").jqGrid("getRowData");
                    var data = {
                        tankChkList:JSON.stringify(dataTable)
                    };
                    Api.ajaxForm(Api.mtrl+"/api/mv/TankChk/formulaBeach",data,function (result) {
                        //调用createBatch方法重新渲染table
                        for(var i=0;i<result.rows.length;i++){
                            console.log(result.rows[i]);
                            result.rows[i].tankName = "张三";
                        };
                        console.log( result.rows);
                        PageModule.createBatch(result.rows,newtemplate,"1");
                    })
                })
            });
        },
        createBatch:function (tableArr,template,status) {
            console.log(tableArr)
            console.log(tableArr)
            console.log(template)
            var  colNames = template.colNames; //表头
            var  colModel = template.colModel;  //数据字段
            var len = tableArr.length;           //显示条数
            var configData  = jqGridAll.jG_configData(tableArr);  //创建table的数据
            var editRowFn;
            var Itemhtml;
            if(status == "1"){    //新建
                $(".tablebox").eq(0).hide();
                Itemhtml = "#TableEdit";
                editRowFn=jqGridAll.jG_editRowFn(Itemhtml,'',true);  //设置编辑
            }else{  // 初始化
                Itemhtml = "#dataTable";
                editRowFn = "";
            }
            var gridConfig = jqGridAll.jG_config('',colNames,colModel,len);
            jqGridAll.jG_Resize(Itemhtml,".tablebox");
            $(Itemhtml).jqGrid($.extend(configData,gridConfig,editRowFn));
            jqGridAll.jG_loadTable("#TableEdit",tableArr)
        },
            //判断选择时间是再班次时间内
            /*metaType:检尺类型
            *initTime：列表的时间
            * startTime：班次时间
            * inputItem：显示时间的input
            * */
        dataTime:function (metaType,initTime,startTime,inputItem) {
            if(metaType == "SHIFT_END"){
                //设置input输入框为不可编辑并且是班末时间
                $(inputItem).val(initTime+" "+startTime.slice(9,17));
                $(inputItem).attr("disabled",true)
            }else if(metaType== "SHIFT_INN"){
                $(inputItem).attr("disabled",false)
                //设置时间再班次时间内
                var begTime = initTime+" "+startTime.slice(0,8);
                var overTime = initTime+" "+startTime.slice(9,17);
                $(inputItem).val(begTime);
                $(inputItem).change(function () {
                    if($(this).val()<begTime){
                        Mom.layMsg("检尺时间不能小于班次开始时间");
                        $(inputItem).val('')
                    }else if($(this).val()>overTime){
                        Mom.layMsg("检尺时间不能大于班次结束时间");
                        $(inputItem).val('')
                    }
                })
            }else if(metaType=="STOCKTAK"){
                //设置时间不可编辑      并且是本月月末早班班末时间
                var year = initTime.slice(0,4);
                var month = initTime.slice(5,7);
                var d = new Date(parseInt(year),parseInt(month),0);
                var inputValue =initTime.slice(0,7)+"-"+d.getDate()+" "+"08:00:00";
                $(inputItem).val(inputValue);
                $(inputItem).attr("disabled",true)
            }
        },
        /**************物料移动*********************************/
         materialMoveInit: function () {
            var temPlate = [];
            $.get("../../json/factoryModel/materialMove/tankManage.json", function (result) {
                temPlate = result.rows[1];
                var primaryTable = result.rows[1].primaryTable;
                var seedTable = result.rows[1].seedTable;
                PageModule.materialMgetData(primaryTable, seedTable)

            });
        },
            //请求拿数据
         materialMgetData: function (primaryTable, seedTable) {
                /*拿data数据*/
                var data = {
                    nodeTankId: '1e7e6ea2a4424375acdc080a73079f10', /**/
                    date: '2018-10-22',/**/
                    shift: '00:00:00-22:00:00',/**/
                    areaTankId: '467529a79f36414ba9f803def3a86cae'/**/
                };
                Api.ajaxForm(Api.mtrl + "/api/mv/TankChk/TankList", data, function (result) {
                    if (result.success) {
                        PageModule.renderPotTable(primaryTable, seedTable, result);
                    } else {
                        Mom.layAlert(result.message);
                    }
                });
            },
            /**罐规则数据potArr,*移动规则数据moveArr,*父表罐的请求数据 result*/
            renderPotTable: function (potArr, moveArr, result) {
                require(['jqGrid_my'], function (jqGridAll) {
                    var optionsPot = {
                        colNames: potArr[0].colNames,
                        colModel: potArr[0].colModel,
                        data: result.rows,
                        multiselect: true
                    };
                    var optionsMMove = {
                        colNames: moveArr[0].colNames,
                        colModel: [
                            {"name": "id", "label": "id", "align": "center", "hidden": true},
                            {"name": "moveType", "label": "moveType", "align": "center", "hidden": true},
                            {"name": "mtrlMvOprtTypeLabel", "label": "mtrlMvOprtTypeLabel", "align": "center"},
                            {"name": "nodename", "label": "nodename", "align": "center",formatter:function(cellvalue, options, rowObject){return rowObject.dlvNode.nodename;}},
                            {"name": "getNode", "label": "getNode", "align": "center", formatter:function(cellvalue, options, rowObject){return rowObject.rcvNode.nodename;}},
                            {"name": "begMvDate", "label": "begMvDate", "align": "center"},
                            {"name": "endMvDate", "label": "endMvDate", "align": "center"},
                            {"name": "dlvMtrl", "label": "dlvMtrl", "align": "center", formatter:function(cellvalue, options, rowObject){return rowObject.dlvMtrl.mtrlName;}},
                            {"name": "rcvMtrl", "label": "rcvMtrl", "align": "center", formatter:function(cellvalue, options, rowObject){return rowObject.rcvMtrl.mtrlName;}},
                            {"name": "dlvStatus", "label": "dlvStatus", "align": "center"},/**/
                            {"name": "rcvStatus", "label": "rcvStatus", "align": "center"},/**/
                            {"name": "dlvPreChkCont", "label": "dlvPreChkCont", "align": "center"},
                            {"name": "dlvAftChkCont", "label": "dlvAftChkCont", "align": "center"},
                            {"name": "rcvPreChkCont", "label": "rcvPreChkCont", "align": "center"},
                            {"name": "rcvAftChkCont", "label": "rcvAftChkCont", "align": "center"},
                            {"name": "createName", "label": "createName", "align": "center"},
                            {"name": "createDate", "label": "createDate", "align": "center"},
                            {"name": "clsBy", "label": "clsBy", "align": "center"},
                            {"name": "clsDate", "label": "clsDate", "align": "center"}
                        ]
                        ,
                        multiselect: true
                    };
                    /* $('shiftHidden').attr('data-nodeTankId); */
                    /* $('#tankDate').val(); */
                    /* $('#clsses option:selected').val(); */
                    var data = {
                        id: '470dca52dbeb45288afb4769a33b6226'/**/
                    };
                    var config = {
                        url: Api.mtrl + '/api/mv/TankMtrlMove/list/' + data.id,
                        dataParams: {
                            id: '470dca52dbeb45288afb4769a33b6226',/**/
                            date: '2018-10-22',/**/
                            shift: '00:00:00-22:00:00'/**/
                        },
                        contentType: 'Form'
                    };
                    var MMovesubTable = [];
                    var subTableId;
                    jqGridAll.jG_jqGridTableLevel('#materialMTable', optionsPot, optionsMMove, config, MMovesubTable, function (res) {
                        subTableId = res;
                        //编辑
                        var subtr = '.ui-subgrid .subgrid-data table tr.ui-widget-content';
                        $(subtr).each(function () {
                            $(this).on('dblclick', function () {
                                var moveType = $(this).find('td').eq(2).attr('title');
                                if (moveType != 'TANK_TO_TANK') {
                                    Mom.layAlert('请选择罐付罐类型物料移动数据，其他物料移动数据无法进行编辑')
                                } else {
                                    var potDate = '2018-10-22';/**/
                                    /*$('#tankDate').val();*/
                                    var classes = '00:00:00-22:00:00)';/**/
                                    /*$('#clsses option:selected').val();*/
                                    Bus.openEditDialog('新建物料移动信息', 'material/materialMove/addMove.html?potDate=' + potDate + '&classes=' + escape(classes), '681px', '495px',function () {

                                    })
                                }
                            })
                        })


                    });
                    var arr = jqGridAll.jG_getCheckAllIds('#materialMTable');

                    //添加按钮
                    $('#btn-add').unbind('click').on('click', function () {
                        var arrSubOne = [];
                        $(subTableId).each(function (i, item) {
                            var subArr = jqGridAll.jG_getCheckAllIds('#' + item);
                            $(subArr).each(function (a, aitem) {
                                //拿到被选中的子表id
                                arrSubOne.push(aitem);
                            })
                        });
                        if (arr.length > 1) {
                            Mom.layAlert('只能选择一个罐区进行新建物料移动')
                        } else if (arr.length == 0 || arrSubOne.length != 0) {
                            Mom.layAlert('请选择一个罐区进行新建物料移动')
                        } else {
                            /**列表页主表少俩参数  固/液质量 提交状态*/
                            var getparam=$('#materialMTable').getGridParam('selrow');
                            var thisStatu=$('#materialMTable').getCell(getparam,'submissionState');
                            if(thisStatu=='1'){
                                Mom.layAlert('已提交的槽/罐信息无法进行物料移动')
                            }else{
                                var tankId=$('#materialMTable').getCell(getparam,'tankId');
                                var potDate = '2018-10-22';/**/
                                /*$('#tankDate').val();*/
                                var classes = '00:00:00-22:00:00';/**/
                                /*$('#clsses option:selected').val();*/

                                /*递交参数*/
                                var tankOptions = {
                                    btnArr: [
                                        {
                                            btn: '确定', fn: function (layerIdx, layero) {
                                            var iframeWin = layero.find('iframe')[0].contentWindow;
                                            //先还原所有的input框的disabled属性
                                            iframeWin.removeAttr();
                                            top.layer.close(layerIdx);
                                            PageModule.materialMoveInit();
                                        }
                                        }
                                    ]
                                };
                                Bus.openDialogCfg('新建物料移动信息', 'material/materialMove/addMove.html?potId=' + tankId + '&potDate=' + potDate + '&classes=' + escape(classes), '681px', '495px', tankOptions)
                            }

                        }
                    });
                    //关闭按钮
                    $('#btn-close').unbind('click').on('click', function () {
                        var arrSubOne = [];
                        //拿到所有展开的主表id
                        if (subTableId == undefined || arr.length > 0) {
                            Mom.layAlert('请选择一项物料移动数据进行关闭')
                        } else {
                            $(subTableId).each(function (i, item) {
                                var subArr = jqGridAll.jG_getCheckAllIds('#' + item);
                                $(subArr).each(function (a, aitem) {
                                    //拿到被选中的子表id
                                    arrSubOne.push(aitem);
                                })
                            });
                            if (arrSubOne.length > 1 || arrSubOne.length < 1) {
                                Mom.layAlert('请选择一项物料移动数据进行关闭')
                            } else {
                                moveType = $('#' + arrSubOne[0]).find('td').eq(2).attr('title');
                                var potDate = '2018-10-22';
                                /*$('#tankDate').val();*/
                                var classes = '早班(00:00:00-22:00:00)';
                                /*$('#clsses option:selected').val();*/
                                Bus.openEditDialog('关闭物料移动', 'material/materialMove/addMove.html?moveId=' + arrSubOne[0] + '&potDate=' + potDate + '&classes=' + escape(classes) + '&moveType=' + moveType, '681px', '495px')
                            }
                        }
                    });
                })
            },
            //移动弹出页
            addMoveInit: function () {
                var potId = Mom.getUrlParam('potId');
                var moveId = Mom.getUrlParam('moveId');
                var moveDate = Mom.getUrlParam('potDate');
                var classes = Mom.getUrlParam('classes');
                var moveType = Mom.getUrlParam('moveType');
                require(['datetimepicker', 'Page'], function () {
                    //初始化是否可编辑项
                    tankMove(Api.mtrl+'/api/mv/TankMtrlMove/form/'+potId, 'table tr td', '#operationType,#oppositeNode,#oppositeMaterial,#startTime', '#startTime', true);
                    /*初始化对方节点*/
                    nodeToMtrl(Api.mtrl+'/api/mv/TankMtrlMove/form/'+potId,Api.mtrl+'/api/mv/TankMtrlMove/getListByType', '#oppositeNode', '#oppositeMaterial', '#oppositealias', true);
                    openVal('.dlvVal');
                    //新增
                    if (moveId == null && potId != null) {
                        $('#operationType').on('change', function () {
                            var moveTypeS = $('#operationType option:selected').val();
                            $('#ownQuantity,#oppositeQuantity').val('');

                            //罐付罐
                            if (moveTypeS == 'TANK_TO_TANK') {
                                //初始化是否可编辑项

                                tankMove(Api.mtrl+'/api/mv/TankMtrlMove/form/'+potId, 'table tr td', '#operationType,input:checkbox,#oppositeNode,#startTime', '#startTime', false);
                                /*初始化对方节点*/
                                nodeToMtrl(Api.mtrl+'/api/mv/TankMtrlMove/form/'+potId,Api.mtrl+'/api/mv/TankMtrlMove/getListByType', '#oppositeNode', '#oppositeMaterial', '#oppositealias', true);
                                /*本方量对方量 检尺回显方法*/
                                openVal('.dlvVal');
                                openVal('.rcvVal');
                            }
                            //罐收付进出厂点
                            else if (moveTypeS == 'TANK_RETO_IOF' || moveTypeS == 'TANK_TO_IOF') {
                                //初始化是否可编辑项
                                tankMove(Api.mtrl+'/api/mv/TankMtrlMove/form/'+potId, 'table tr td', '#operationType,input:checkbox,#oppositeNode,#oppositeMaterial,#startTime', '#startTime', false);
                                /*初始化对方节点*/
                                nodeToMtrl(Api.mtrl+'/api/mv/TankMtrlMove/form/'+potId,Api.mtrl+'/api/mv/TankMtrlMove/getListByType', '#oppositeNode', '#oppositeMaterial', '#oppositealias', true);
                                openVal('.dlvVal','.rcvVal');

                            }
                            //罐收付料线
                            else if (moveTypeS == 'TANK_RETO_LINE' || moveTypeS == 'TANK_TO_LINE') {
                                tankMove(Api.mtrl+'/api/mv/TankMtrlMove/form/'+potId, 'table tr td', '#operationType,input:checkbox,#oppositeNode,#startTime', '#startTime', false);
                                openVal('.dlvVal','.rcvVal');
                            }
                            //特殊操作项
                            //槽罐改名和退库编辑项相同
                            else if (moveTypeS == 'TANK_MOD' || moveTypeS == 'TANK_RETO_STOREHOUSE') {
                                $('table tr td:nth-of-type(4)').each(function (i, item) {
                                    $(this).find('input').attr('readonly', 'readonly', 'disabled', 'disabled');
                                    $(this).find('input:checkbox,select').attr('disabled', 'disabled');
                                });
                                tankMove(Api.mtrl+'/api/mv/TankMtrlMove/form/'+potId, 'table tr td:nth-of-type(2)', '#operationType,#ownMaterials,#ownMaterial,#startTime', '#startTime', false);




                                var html='<select  id="ownMaterials" name="dlvMtrl.mtrlName" class="form-control"></select>';
                                $('#ownMaterial').parents('td').append(html);
                                $('#ownMaterial').remove();






                                openVal('.dlvVal','.rcvVal');
                            }
                            //交库||复尺
                            else if (moveTypeS == 'TANK_TO_STOREHOUSE' || moveTypeS == 'TANK_RE_CHK') {
                                $('table tr td:nth-of-type(4)').each(function (i, item) {
                                    $(this).find('input').attr('readonly', 'readonly', 'disabled', 'disabled');
                                    $(this).find('input:checkbox,select').attr('disabled', 'disabled');
                                });
                                tankMove(Api.mtrl+'/api/mv/TankMtrlMove/form/'+potId, 'table tr td:nth-of-type(2)', false, false, false);
                                if (moveTypeS == 'TANK_RE_CHK') {
                                    $('#operationType,#startTime').removeAttr('disabled').removeAttr('readonly');
                                    $('#ownMaterial').attr('disabled', 'disabled');
                                    openVal('.dlvVal','.rcvVal');
                                } else {

                                    $('#operationType,#ownMaterial,#ownMaterials,#startTime').removeAttr('disabled').removeAttr('readonly');
                                    var html='<select  id="ownMaterials" name="dlvMtrl.mtrlName" class="form-control"></select>';
                                    $('#ownMaterial').parents('td').append(html);
                                    $('#ownMaterial').remove();
                                    openVal('.dlvVal','.rcvVal');
                                }
                            }
                        });
                    }
                    //关闭
                    else if (potId == null && moveId != null) {
                        // /*只有罐付罐可以编辑 并且只有对方量可以编辑 点击确定拿到对方量*/
                        // tankMove(Api.mtrl+'/api/mv/TankMtrlMove/update'+potId, 'table tr td', '#endTime', '#endTime', false);
                        Api.ajaxJson(Api.mtrl+'/api/mv/TankMtrlMove/view/'+moveId,{},function (result) {
                            if(result.success){
                                console.log(result);
                                var nodehtml='<input type="text" disabled id="rcvNodeName" name="rcvNode.nodename" class="form-control">';
                                var mtrlHtml='<input type="text" disabled id="rcvMtrlName" name="rcvMtrl.mtrlName" class="form-control">';
                                $('#oppositeNode').parents('td').append(nodehtml);
                                $('#oppositeNode').remove();
                                $('#oppositeMaterial').parents('td').append(mtrlHtml);
                                $('#oppositeMaterial').remove();

                                Validator.renderData(result.NodeMtrlMove, '#inputForm');
                                $('.dlvVal,.rcvVal').unbind('click');
                            }else{
                                Mom.layAlert(result.message)
                            }

                        });
                        $('input').attr('disabled', 'disabled');
                        $('input:checkbox').attr('disabled', 'disabled');
                        $('select').attr('disabled', 'disabled');
                        $('#endTime').removeAttr('disabled').removeAttr('readonly')
                        if (moveType == 'TANK_TO_TANK') {
                            $('#oppositeQuantity').removeAttr('disabled').removeAttr('readonly');
                        }
                        //判断日期大小
                        $("#endTime").on('change', function () {
                            if ($('#endTime').val() < $('#startTime').val() && $('#endTime').val() != '') {
                                Mom.layMsg('结束时间应大于开始时间，请重新选择');
                                $('#endTime').val('')
                            }
                        });
                        //时间选择插件
                        $("#endTime").val("").datetimepicker({
                            bootcssVer: 3, //显示箭头，部分如不显示箭头要加这个
                            format: "yyyy-mm-dd hh:ii:ss",  //保留到日
                            showMeridian: true,     //显示上、下午
                            language: "zh-CN",   //中文显示
                            minView: "0",    //月视图
                            autoclose: true,  //选择时间后自动隐藏
                            clearBtn: true,
                            todayBtn: true
                        });
                    }
                    //编辑
                    else if (moveId == null && potId == null) {
                        /*只有罐付罐可以编辑 并且只有对方量可以编辑 点击确定拿到对方量*/
                        $('input').attr('disabled', 'disabled');
                        $('input:checkbox').attr('disabled', 'disabled');
                        $('select').attr('disabled', 'disabled');
                        $('#oppositeQuantity').removeAttr('disabled').removeAttr('readonly')
                    }








                    //填选择器 用来获取本方量对方量
                    function openVal(selector,closeSel) {
                        /*本方量对方量弹窗*/
                        var tankOptions = {
                            btnArr: [
                                {
                                    btn: '数据采集', fn: function (layerIdx, layero) {
                                    var iframeWin = layero.find('iframe')[0].contentWindow;
                                    var formData = iframeWin.getTankFormData();
                                    if (formData) {
                                        var data = formData.data;
                                        //调用接口：生成数据采集数据
                                        Api.ajaxJson(formData.url, JSON.stringify(data), function (result) {
                                            if (result.success == true) {
                                                var wuliao = result.AA.wuliao || data.wuliao;
                                                //更新选中行中的物料数据

                                            } else {
                                                Mom.layAlert(result.message);
                                            }
                                        });
                                    }
                                }
                                },
                                {
                                    btn: '槽/罐量计量', fn: function (layerIdx, layero) {
                                    var iframeWin = layero.find('iframe')[0].contentWindow;
                                    var formData = iframeWin.getTankFormData();
                                    if (formData) {
                                        var data = formData.data;
                                        //调用接口：生成数据采集数据
                                        Api.ajaxJson(formData.url, JSON.stringify(data), function (result) {
                                            if (result.success == true) {
                                                var wuliao = result.AA.wuliao || data.wuliao;
                                                //更新选中行中的物料数据

                                            } else {
                                                Mom.layAlert(result.message);
                                            }
                                        });
                                    }
                                }
                                },
                                {
                                    btn: '确定', fn: function (layerIdx, layero) {
                                    var iframeWin = layero.find('iframe')[0].contentWindow;
                                    var tanval = iframeWin.getTankFormData(true);
                                    $(selector).find('input:text').val(tanval);
                                    top.layer.close(layerIdx);
                                }
                                }
                            ]
                        };
                        $(selector).unbind("click").on("click", function () {
                            Bus.openDialogCfg("槽/罐检尺信息录入", "../material/materialMove/informationEntryFrom.html", '1128px', '692px', tankOptions);

                        });
                        $(closeSel).unbind('click')
                    }
                    // 判断input、select是否可用
                    // selector所有遍历元素
                    // removeAS删除属性的元素 字符串 如多个加逗号
                    // timeS如果有可编辑的时间 加times参数 选择器 传字符串
                    function tankMove(url, selector, removeAS, timeS, appendFlag) {
                        var data={
                            id:potId,
                            date:moveDate,
                            shift:classes
                        };
                        /*初始化渲染数据*/
                        Api.ajaxForm(url, data, function (result) {
                            if (result.success) {
                                if (appendFlag) {
                                    Bus.appendOptionsValue($('#operationType'), result.moveTypeList);
                                }
                                Validator.renderData(result.nodeMtrlMove, '#inputForm')

                            } else {
                                Mom.layAlert(result.message);
                            }

                        });


                        $(selector).each(function () {
                            $(this).find('input:text').attr('disabled', 'disabled');
                            $(this).find('select').attr('disabled', 'disabled').addClass('dis');
                        });
                        if (removeAS) {
                            $(removeAS).removeAttr('disabled').removeAttr('readonly').removeClass('dis');
                        }
                        //时间选择插件
                        if (timeS) {
                            $(timeS).val("").datetimepicker({
                                bootcssVer: 3, //显示箭头，部分如不显示箭头要加这个
                                format: "yyyy-mm-dd hh:ii:ss",  //保留到日
                                showMeridian: true,     //显示上、下午
                                language: "zh-CN",   //中文显示
                                minView: "0",    //月视图
                                autoclose: true,  //选择时间后自动隐藏
                                clearBtn: true,
                                todayBtn: true
                            });
                        }
                    }




                    //左侧特殊修改物料联动别名
                    function spcNodeMtrl(url1,url, parSel, midSel, selector,ischange) {
                        var dataOne={
                            id:potId,
                            date:moveDate,
                            shift:classes
                        };
                        Api.ajaxForm(url1, dataOne, function (result) {
                            if (result.success) {
                                var dlvNodeId = result.nodeMtrlMove.dlvNode.id;
                                var dlvMtrlId = result.nodeMtrlMove.dlvMtrl.id;
                                var val = $('.form-table').find('.checked');
                                var valUseTopo;
                                val.length > 0 ? valUseTopo = '1' : valUseTopo = '0';
                                var data = {
                                    dlvNodeId: dlvNodeId,
                                    date: moveDate,
                                    shift: classes,
                                    dlvMtrlId: dlvMtrlId,
                                    mtrlMvOprtType: $('#operationType option:selected').val(),
                                    useTopo: valUseTopo
                                };
                            } else {
                                Mom.layAlert(result.message);
                            }
                        });
                    }

                    // parSel父级节点选择器 parRows父级数据列表
                    // midSel中级节点选择器 midRows中级数据列表
                    // select子级节点选择器 ischange 意思是是如果二级不动的话 一级动 二三级一起变 传布尔值
                    //前提 数据格式不能变 参数不能变 其次 三级必须得是 1、select 2、select 3、input
                    function nodeToMtrl(url1,url, parSel, midSel, selector,ischange) {
                        var dataOne={
                            id:potId,
                            date:moveDate,
                            shift:classes
                        };
                        Api.ajaxForm(url1, dataOne, function (result) {
                            console.log(result);
                            if (result.success) {
                                var dlvNodeId=result.nodeMtrlMove.dlvNode.id;
                                var dlvMtrlId=result.nodeMtrlMove.dlvMtrl.id;
                                var val=$('.form-table').find('.checked');
                                var valUseTopo;
                                val.length>0?valUseTopo='1':valUseTopo='0';
                                var data={
                                    dlvNodeId:dlvNodeId,
                                    date:moveDate,
                                    shift:classes,
                                    dlvMtrlId:dlvMtrlId,
                                    mtrlMvOprtType:$('#operationType option:selected').val(),
                                    useTopo:valUseTopo
                                };
                                /*初始化对方节点*/
                                Api.ajaxJson(url, JSON.stringify(data), function (result) {
                                    if (result.success) {
                                        $(parSel).empty();
                                        Bus.appendOptionsValue($(parSel), result.NodeList, 'id', 'nodename');
                                        nodeMtrl(parSel, result.NodeList, midSel, selector, ischange);
                                    } else {
                                        Mom.layAlert(result.message);
                                    }
                                });
                                function nodeMtrl(parSel, parRows, midSel, selector, ischange) {
                                    //默认进来的时候
                                    $(parRows).each(function (e, eitem) {
                                        var id = $(parSel + ' option:selected').val();
                                        if (id == eitem.id) {
                                            $(midSel).empty();
                                            Bus.appendOptionsValue($(midSel), parRows[e].mtrlList, 'id', 'mtrlName');
                                            $(parRows[e].mtrlList).each(function (q, qitem) {
                                                idsub = $(midSel + ' option:selected').val();
                                                if (idsub == qitem.id) {
                                                    $(selector).val(parRows[e].mtrlList[q].mtrlAlias)
                                                }
                                                $(midSel).on('change', function () {
                                                    $(parRows[e].mtrlList).each(function (d, ditem) {
                                                        var idchange = $(midSel + ' option:selected').val();
                                                        if (idchange == ditem.id) {
                                                            if(parRows[e].mtrlList[d].mtrlAlias!=undefined){
                                                                $(selector).val(parRows[e].mtrlList[d].mtrlAlias)
                                                            }
                                                        }
                                                    })
                                                })
                                            });
                                        }
                                    });
                                    //变化的时候执行
                                    $(parSel).on('change', function () {
                                        var id = $(parSel + ' option:selected').val();
                                        var idsub;

                                        $(parRows).each(function (e, eitem) {
                                            if (id == eitem.id) {
                                                $(midSel).empty();
                                                if(parRows[e].mtrlList.length>0){
                                                    $(selector).val('')
                                                    Bus.appendOptionsValue($(midSel), parRows[e].mtrlList, 'id', 'mtrlName');
                                                    $(parRows[e].mtrlList).each(function (q, qitem) {
                                                        idsub = $(midSel + ' option:selected').val();
                                                        if (idsub == qitem.id) {
                                                            if(parRows[e].mtrlList[q].mtrlAlias!=undefined){
                                                                $(selector).val(parRows[e].mtrlList[q].mtrlAlias)
                                                            }else{
                                                                $(selector).val('')
                                                            }
                                                        }
                                                    });
                                                    if (ischange) {
                                                        $(midSel).on('change', function () {

                                                            $(parRows[e].mtrlList).each(function (d, ditem) {
                                                                var idchange = $(midSel + ' option:selected').val();
                                                                if (idchange == ditem.id) {
                                                                    if(parRows[e].mtrlList[d].mtrlAlias!=undefined){
                                                                        $(selector).val(parRows[e].mtrlList[d].mtrlAlias)
                                                                    }

                                                                }
                                                            })

                                                        })
                                                    }
                                                }else{
                                                    $(selector).val('')
                                                }

                                            }
                                        })
                                    })
                                }
                            } else {
                                Mom.layAlert(result.message);
                            }

                        });

                    }
                    window.removeAttr = function () {
                        $('select,input:text,input:checkbox').removeAttr('disabled', 'disabled')
                    }
                });
            },
          /************************封账********************************/
          accountInit: function(index,dataTable,template){
              //var  data = {
              //    createDate:$('#shiftHidden').attr('data-time'),//日期
              //    shiftDate:$('#shiftHidden').val(),//班次
              //    nodeAreaId:$('#shiftHidden').attr('data-areaTankId'), // 罐区id
              //    tankId:$('#shiftHidden').attr('data-nodeTankId')//罐id
              //}
              function load(){
                  var  dataList = {
                      createDate:$('#shiftHidden').attr('data-time'),//日期
                      shiftDate:$('#shiftHidden').val(),//班次
                      nodeAreaId:$('#shiftHidden').attr('data-areaTankId'), // 罐区id
                      tankId:$('#shiftHidden').attr('data-nodeTankId')//罐id
                  }
                  //var  dataList = {
                  //    createDate:'2018-12-09',//日期
                  //    shiftDate:'08:00:00-16:00:00',//班次
                  //    nodeAreaId:'467529a79f36414ba9f803def3a86cae', // 罐区id
                  //    tankId:''//罐id 1e7e6ea2a4424375acdc080a73079f10
                  //}
                  Api.ajaxForm(Api.mtrl +"/api/mv/TankSeal/page",dataList,function (result) {
                      console.log(result,565656);

                      dataTable = result.rows;
                      if(result.success){
                          $('.treeTable-count').css('display','block');
                          $('.treeTable-num').text(result.count);
                          var colModel2 = [
                              {"name": "id","label": "id","align": "center","hidden":true},
                              {"name": "mtrlMvOprtTypeLabel","label": "mtrlMvOprtTypeLabel","align": "center","title":false},
                              {"name": "name","label": "name","align": "center",formatter:function(cellvalue, options, rowObject){
                                  return "<div>"+rowObject.rcvNode.nodename+"</div>";
                              }},
                              {"name": "begMvDate","label": "begMvDate","align": "center"},
                              {"name": "endMvDate","label": "endMvDate","align": "center"},
                              {"name": "node","label": "node","align": "center",formatter:function(cellvalue, options, rowObject){
                                  return "<div>"+rowObject.tankChk.tankConVal+"</div>";
                              }},
                              {"name": "clsDate","label": "clsDate","align": "center"}
                          ];
                          var optionsMMove = {   //子表
                              colNames: ["id","操作类型","对方节点名称","开始时间","结束时间","节点值","关闭时间"],
                              colModel: colModel2,
                              rownumbers: true,
                          };
                          var config = {
                              //url: 'http://localhost/json/factoryModel/materialMove/fengzhangson.json'
                              url: Api.mtrl+'/api/mv/TankSeal/view',
                              otherId:'tankId',
                              contentType:'form',
                              tableParentId:'.treeTableParent'
                          };
                          var colModel1 = [
                              {"name": "id","label": "id","align": "center","hidden":true},
                              {"name": "tankId","label": "tankId","align": "center","hidden":true},
                              {"name": "nodename","label": "nodename","align": "center","title":false,formatter:function(cellvalue, options, rowObject){
                                  return "<div>"+rowObject.node.nodename+"</div>";
                              }},
                              {"name": "submitFlag","label": "submitFlag","align": "center",formatter:function(cellvalue, options, rowObject){
                                  if(rowObject.submitFlag == 0){
                                      return "否";
                                  }else{
                                      return "是";
                                  }

                              }},
                              {"name": "mtrlName","label": "mtrlName","align": "center",formatter:function(cellvalue, options, rowObject){
                                  return "<div>"+rowObject.node.mtrl.mtrlName+"</div>";
                              }},
                              {"name": "sealFlag","label": "sealFlag","align": "center",formatter:function(cellvalue, options, rowObject){
                                  if(rowObject.sealFlag == 0){
                                      return "未提交";
                                  }else{
                                      return "已提交";
                                  }

                              }},
                              {"name": "submitBy","label": "submitBy","align": "center"},
                              {"name": "freeBy","label": "freeBy","align": "center"},
                              {"name": "submitDate","label": "submitDate","align": "center"},
                              {"name": "freeDate","label": "freeDate","align": "center"},
                              {"name": "paySum","label": "paySum","align": "center",formatter:function(cellvalue, options, rowObject){
                                  return "<div>"+rowObject.collectSum+'收'+rowObject.paySum +"付</div>";
                              }}
                          ];
                          var optionsPot = {   //主表
                              colNames: ["id","tankId","槽/罐名称","是否可提交","物料","提交状态","提交人","解除提交人","提交时间","解除提交时间","罐收付"],
                              colModel: colModel1,
                              data: dataTable,
                              multiselect: true,
                              gridComplete: function () {
                                  var ids = $("#treeTable").getDataIDs();
                                  for (var i = 0; i < ids.length; i++) {
                                      var rowData = $("#treeTable").getRowData(ids[i]);
                                      console.log(rowData,999);
                                      if (rowData.sealFlag=="已提交" && rowData.submitFlag=="是") {//useable-- 单元格的name 或 index
                                          $("#treeTable").find('#' + ids[i]).css("color",'#00CC66');
                                          //$("#treeTable").setCell(ids[i],"enable",'已提交',{color:'green'});//setCell 设置单元格样式 值 或属性
                                      }else if(rowData.sealFlag=="未提交"&& rowData.submitFlag=="是"){
                                          $("#treeTable").find('#' + ids[i]).css("color",'#333333');
                                          //$("#treeTable").setCell(ids[i],"enable",'未提交',{color:'red'});
                                      }else{
                                          $("#treeTable").find('#' + ids[i]).css("color",'#FF0000');
                                          //$("#treeTable").setCell(ids[i],"enable",'未提交',{color:'red'});
                                      }
                                  }

                              }
                          };
                          var subtable =[];
                          jqGridAll.jG_jqGridTableLevel('#treeTable',optionsPot,optionsMMove,config,subtable);
                          //提交按钮
                          $('#btn-save').unbind('click').click(function(){
                              var ids =jqGridAll.jG_getCheckAllIds('#treeTable');
                              console.log(ids,56565);
                              var nodeShiftSealList = [];
                              var tankIds =[];
                              if(ids.length == 0){
                                  Mom.layMsg('请勾选后在提交');
                                  return false;
                              }
                              for (var i = 0; i < ids.length; i++) {
                                  var rowData = $("#treeTable").getRowData(ids[i]);
                                  console.log(rowData,999);
                                  if (rowData.submitFlag=="否") {//useable-- 单元格的name 或 index
                                      Mom.layMsg('红色字体的不可提交,请重新选择');
                                      return false;
                                  }else if(rowData.sealFlag=="已提交"){
                                      Mom.layMsg('已提交的不可以在提交,请重新选择');
                                      return false;
                                  }
                                  obj ={};
                                  obj.tankId = rowData.tankId;
                                  tankIds.push(rowData.tankId);
                                  nodeShiftSealList.push(obj);
                              }
                              // 发送接口
                              var data = {
                                  createDate:$('#shiftHidden').attr('data-time'),//日期
                                  shiftDate:$('#shiftHidden').val(),//班次
                                  tankIds: tankIds.join(','),
                                  nodeShiftSealList: JSON.stringify(nodeShiftSealList)//罐id
                              }
                              Api.ajaxForm(Api.mtrl+"/api/mv/TankSeal/submitSeal",data, function (res) {
                                  if(res.success){
                                      Mom.layMsg(res.message);
                                      Api.ajaxForm(Api.mtrl +"/api/mv/TankSeal/page",dataList,function (result) {
                                          if(result.success){
                                              jqGridAll.jG_loadTable("#treeTable",result.rows); // 刷新列表
                                              $('.treeTable-num').text(result.count);
                                          }else{
                                              Mom.layMsg(result.message);
                                          }
                                      });
                                  }else{
                                      Mom.layMsg(res.message);
                                  }

                              });
                          });
                          //解除按钮
                          $('#btn-delete').unbind('click').click(function(){
                              var ids =jqGridAll.jG_getCheckAllIds('#treeTable');
                              var nodeShiftSealList = [];
                              var tankIds =[];
                              if(ids.length == 0){
                                  Mom.layMsg('请勾选后在解除');
                                  return false;
                              }
                              console.log(ids,56565);
                              for (var i = 0; i < ids.length; i++) {
                                  var rowData = $("#treeTable").getRowData(ids[i]);
                                  console.log(rowData,999888);
                                  if (rowData.sealFlag=="未提交") {//useable-- 单元格的name 或 index
                                      Mom.layMsg('未提交不可解除,请重新选择');
                                      return false;
                                  }
                                  obj = {};
                                  obj.tankId = rowData.tankId;
                                  tankIds.push(rowData.tankId);
                                  nodeShiftSealList.push(obj);
                              }
                              // 发送接口
                              var data = {
                                  createDate:$('#shiftHidden').attr('data-time'),//日期
                                  shiftDate:$('#shiftHidden').val(),//班次
                                  tankIds: tankIds.join(','),
                                  nodeShiftSealList: JSON.stringify(nodeShiftSealList)//罐id
                              }
                              Api.ajaxForm(Api.mtrl+"/api/mv/TankSeal/relieve",data, function (res) {
                                  if(res.success){
                                      Mom.layMsg(res.message);
                                      Api.ajaxForm(Api.mtrl +"/api/mv/TankSeal/page",dataList,function (result) {
                                          if(result.success){
                                              jqGridAll.jG_loadTable("#treeTable",result.rows);
                                              $('.treeTable-num').text(result.count);
                                          }else{
                                              Mom.layMsg(result.message);
                                          }
                                      });
                                  }else{
                                      Mom.layMsg(res.message);
                                  }

                              });
                          })
                      }else{
                          Mom.layMsg(result.message);
                      }

                  });
              }
              load();
          },
    };
    $(function () {
        if($("#measure").length>0){   //初始化加载
            PageModule.init();
        }else if($("#initializeFrom").length>0){
            PageModule.initializeFrom();
        }else if($("#informationEntryFrom").length>0){   //新建检尺
            PageModule.createTankInit();
        }else if($("#batchMeasureForm").length>0){    //批量检尺
            PageModule.batchMeasureInit();
        }else if($("#initializeFrom").length>0){   //罐初始化
        } else if ($('#materialMove').length > 0) {  //参数配置列表
            PageModule.materialMoveInit();
        } else if ($('#addMove').length > 0) {
            PageModule.addMoveInit();
        }else  if ($('#fengzhang').length > 0) {
            PageModule.accountInit();
        }
     })
    });
});