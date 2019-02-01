require(['/js/zlib/app.js'], function (App) {
 require(['jqGrid_my'], function (jqGridAll) {
     var PageModule = {
        init:function () {
            PageModule.loadShift();   //加载班次下拉
            PageModule.clickHandler(); //加载点击事件
            PageModule.loadType();
            $("#tankDate").val(Mom.shortDate);
            window.pageLoad = function () {
                var date = $("#tankDate").val();
                var shift = $("#shift option:selected").val();
                var begShiftDate = date+" "+shift.slice(0,8);
                var endShiftDate = date+" "+shift.slice(9,17);
                var data  ={
                    inoutput:{
                        inoutType:$(".radios:checked").val()
                    },
                    begShiftDate:begShiftDate,
                    endShiftDate:endShiftDate,
                    smtinoutBillStatus:$("#status option:selected").val()
                };
                Api.ajaxJson(Api.mtrl+"/api/mv/SmtinoutBill/findList",JSON.stringify(data),function (result) {
                    Api.ajaxForm("../../../json/factoryModel/materialMove/gaugeTicket.json",{},function (data) {
                        if(result.success){
                            PageModule.createTable(data.rows[0],result.rows,true)
                        }
                    })
                })
            };
        },
        //加载班次下拉
        loadShift:function () {
            var url_ = Api.aps+'/api/ctrl/Shift/list';
            Api.ajaxJson(url_, {}, function(result){
                if(result.success){
                    var rows = result.rows;
                    var options = new Array();
                    $(rows).each(function(i,o){
                        var label = o['name']+'('+o['startTime']+'-'+o['endTime']+')';
                        var value = o['startTime']+'-'+o['endTime'];
                        if(o['id'] != "4"){
                            options.push({'value':value, 'label':label});
                        }
                    });
                    Bus.appendOptions($('#shift'), options);
                    pageLoad();
                }else{
                    Mom.layMsg(result.message);
                }
            });
        },
        //加载模板以及请求数据
        createTable:function (template,dataTable,multselect,colModel,colMode2) {
                var  settings1 = {   //主表配置
                    colNames:template.primaryTable[0].colNames,
                    colModel:colModel==undefined?template.primaryTable[0].colModel:colModel,
                    data:dataTable,
                    multiselect: multselect
                };
                //setting2   设置json格式子表
                //setting3   设置没有colName格式子表
                var settings2 = {   //子表配置
                    colNames:template.seedTable[0].colNames,
                    colModel:colMode2 == undefined?template.seedTable[0].colModel:colMode2
                };
                var setting3 = {
                    colModel:[
                        {"name": "num","label": "表(车、罐)号","align": "center"},
                        {"name": "gaugeType","label": "计量方式","align": "center",
                            formatter: function (cellvalue, options, rowObject) {
                                if(rowObject.gaugeType == "1"){
                                    return "<span>表计量</span>";
                                }else if(rowObject.gaugeType == "2"){
                                    return "<span>表槽车计量</span>"
                                }else if(rowObject.gaugeType == "4"){
                                    return "<span>汽车衡计量</span>"
                                }
                            }
                        },
                        {"name": "frontVal", "label": "前读数(空车)","align": "center"},
                        {"name": "behindVal","label": "后读数(重车)","align": "center"},
                        {"name": "mearVal", "label": "计量量","align": "center" },
                        { "name": "conVal", "label": "确认量","align": "center"},
                        { "name": "preReadDate", "label": "前量(空车)时间","align": "center"},
                        { "name": "aftReadDate", "label": "后量(重车)时间","align": "center"},
                        { "name": "begShiftDate", "label": "班次开始时间","align": "center"},
                        { "name": "endShiftDate", "label": "班次结束时间","align": "center"},
                        { "name": "measBy", "label": "测量人","align": "center"},
                        { "name": "measDate", "label": "计量时间","align": "center"},
                        { "name": "crtBy", "label": "录入人","align": "center"},
                        { "name": "createDate", "label": "录入时间","align": "center"},
                        { "name": "conBy", "label": "确认人","align": "center"},
                        { "name": "remark", "label": "备注","align": "center"},
                    ]
                };
                var config = {      //获取子集的时候需要的参数以及接口配置
                    url:Api.mtrl+"/api/mv/SmtinoutBill/subList",
                    dataParams: {
                        id:"id"
                    },
                    contentType:"Form"
                };
                var subtable = [];
                jqGridAll.jG_jqGridTableLevel("#treeTable",settings1,setting3,config,subtable);
                jqGridAll.jG_loadTable("#treeTable",dataTable);
                $(".treeTable-count").removeClass("hide");
                $(".treeTable-num").text(dataTable.length);
        },
        //给按钮加载点击事件
        clickHandler:function () {
            //新建按钮
            $("#btn-add").unbind("click").on("click",function () {
                var addConfig = {
                    btnArr:[]
                };
                Bus.openEditDialog("创建计量单","../material/materialMove/creategaugeTicket.html","783px",'708px',addConfig)
            });
            //维护按钮
            $("#btn-maintainF").unbind("click").on("click",function () {
                var ids =jqGridAll.jG_getCheckAllIds('#treeTable');
                var inoutFlag = $(".radios:checked").val();
                var transType = $("#transType option:selected").val();
                if(ids.length<=0){
                    Mom.layMsg('请选择一条进行维护');
                }else if(ids.length>1){
                    Mom.layMsg('只能选择一条');
                }else {
                    var id = ids[0];
                    var addConfig = {
                        btnArr:[]
                    };
                    Bus.openEditDialog("创建计量单","../material/materialMove/creategaugeTicket.html?id="+id+"&inoutFlag="+inoutFlag+"&transType="+transType,"783px",'708px',addConfig)
                }
            });
            //仪表计量
            $("#btn-instrument").unbind("click").on("click",function () {
                Bus.openEditDialog("进出厂仪表计量","../material/materialMove/instrumentMeasurement.html","963px",'537px')
            });
            //关闭按钮
            $("#btn-colse").unbind("click").on("click",function () {
                var str= "";
                var ids = jqGridAll.jG_getCheckAllIds("#treeTable");
                for(var i=0;i<ids.length;i++){
                    str += "," + ids[i];
                }
                var data = {
                    ids:str.substr(1)
                };
                Api.ajaxForm(Api.mtrl+"/api/mv/SmtinoutBill/update",data,function (result) {
                    if(result.success){
                        Mom.layMsg(result.message);
                        window.pageLoad();
                    }else{
                        Mom.layMsg(result.message)
                    }
                })
            });
            //删除
            $("#btn-delete").unbind("click").on("click",function () {
                var str= "";
                var ids = jqGridAll.jG_getCheckAllIds("#treeTable");
                for(var i=0;i<ids.length;i++){
                    str += "," + ids[i];
                }
                var data = {
                    ids:str.substr(1)
                };
                Api.ajaxForm(Api.mtrl+"/api/mv/SmtinoutBill/delete",data,function (result) {
                    console.log(result)
                    if(result.success){
                        Mom.layMsg(result.message);
                        // window.pageLoad();
                        console.log(ids)
                        for(var i=0;i<ids.length;i++){
                            $("tbody tr").each(function(index,item){
                                if($(item).attr("id") == ids[i]){
                                    console.log($(item))
                                    console.log($(ids[i]))
                                }
                            })
                        }
                    }else{
                        Mom.layMsg(result.message)
                    }
                })
            })
        },
         //新建或者维护页面
        createInit:function () {
            var id = Mom.getUrlParam("id");    //列表ID
            PageModule.loadType(id);           //渲染运输类型下拉
        },
         loadMagess:function (id) {
             if(id){
                 var data = {
                     id:id
                 };
                 PageModule.loadData(data);       //如果存在ID，就调用接口加载数据
                 PageModule.saveTicket(data);
             }else{
                 var data = {
                     inoutFlag:$(".radios:checked").val(),
                     transType:$("#transType option:selected").val()
                 };
                 PageModule.saveTicket(data);
                 PageModule.loadData(data);          //通过字典接口加载类型下拉
             }
         },
        //根据是否新建或者维护页面加载数据
        //data:是请求接口的参数，item是判断维护还是本页面的保存之后的重新渲染
        //方法有问题，修改中  2018.11.7
        loadData:function (data,item) {
            var id = Mom.getUrlParam("id");    //列表ID
            if(id == "" || id==null||id==undefined){                   //新建
                Api.ajaxJson(Api.mtrl+"/api/mv/SmtinoutBill/form",JSON.stringify(data),function (result) {
                    var options = [];
                    $(result.mtrlInoutPutList).each(function (i,o) {
                        options.push({'value':o.nodeId, 'label':o.nodeInoutput.nodename})
                    });
                    Bus.appendOptions("#nodeId",options);
                    $("#nodeId").unbind("change").on("change",function () {
                        for(var i=0;i<result.mtrlInoutPutList.length;i++){
                            if(result.mtrlInoutPutList[i].nodeId==$(this).val()){
                                var mtrloptions = [];
                                $(result.mtrlInoutPutList[i].mtrlList).each(function (i,o) {
                                    mtrloptions.push({'value':o.id, 'label':o.mtrlName})
                                });
                                Bus.appendOptions("#mtrlId",mtrloptions);
                            }
                        }
                    })
                   })
            }else {
               Api.ajaxJson(Api.mtrl+"/api/mv/SmtinoutBill/form",JSON.stringify(data),function (result) {        // 维护
                 if(item == "save"){
                     createTable(result.measRecList);
                 }else{
                     Validator.renderData(result.smtinoutBill, $('#inputForm'));   //回显
                     var nodeId = result.smtinoutBill.nodeId;
                     var mtrlList = [];
                     $("#transType option").each(function (index,item) {     //回显运输类型
                         if($(item).val() == result.smtinoutBill.transType){
                             $(this).attr("selected",true)
                         }
                     });
                     for(var i=0;i<result.mtrlInoutPutList.length;i++){    //回显进出厂点
                         if(result.mtrlInoutPutList[i].nodeId == nodeId){
                             mtrlList = result.mtrlInoutPutList[i].mtrlList
                             var options = [];
                             options.push({'value':result.mtrlInoutPutList[i].nodeId, 'label':result.mtrlInoutPutList[i].nodeInoutput.nodename});
                             Bus.appendOptions("#nodeId",options);
                             $("#nodeId option").each(function (index,item) {
                                 if($(item).val() ==nodeId ){
                                     $(this).attr("selected",true)
                                 }
                             })
                         }
                     };
                     for(var j=0;j<mtrlList.length;j++){
                         options.push({'value':mtrlList[j].id, 'label':mtrlList[j].mtrlName});
                         Bus.appendOptions("#mtrlId",options);
                         $("#mtrlId option").each(function (index,item) {
                             if($(item).val() ==nodeId ){
                                 $(this).attr("selected",true)
                             }
                         })
                     }
                     createTable(result.measRecList)
                 }
               })
            }
            function createTable(tableData) {
                $("#treeTable").dataTable({
                    "data": tableData,
                    "aoColumns": [
                        {"data": "id", 'sClass': "center id",
                            "render":function(data, type, row, meta) {
                                return data = "<input type='checkbox' id=" + row.id +" data-status = "+row.gaugeType+"  class='i-checks'>"
                            }
                        },
                        {"data": "num", 'sClass': "center"},
                        {
                            "data": "gaugeType", 'sClass': "center",
                            "render": function (data, type, row, meta) {
                                var gaugeType = "";
                                if(row.gaugeType == "1"){
                                    gaugeType = "表计量";
                                }else if(row.gaugeType == "2"){
                                    gaugeType = "槽车计量";
                                }else if(row.gaugeType == "4"){
                                    gaugeType = "汽车衡计量";
                                };
                                return gaugeType;
                            }
                        },
                        {"data": "frontVal", 'sClass': "center"},
                        {"data": "behindVal", 'sClass': "center"},
                        {"data": "mearVal", 'sClass': "center"},
                        {"data": "conVal", 'sClass': "center"},
                        {"data": "preReadDate", 'sClass': "center"},
                        {"data": "aftReadDate", 'sClass': "center"},
                        {"data": "endShiftDate", 'sClass': "center"},
                        {"data": "begShiftDate", 'sClass': "center"},
                        {"data": "crtBy", 'sClass': "center"},
                        {"data": "measDate", 'sClass': "center"},
                        {"data": "crtBy", 'sClass': "center"},
                        {"data": "measDate", 'sClass': "center"},
                        {"data": "conBy", 'sClass': "center"},
                        {"data": "remark", 'sClass': "center"}
                    ],
                });
                renderIChecks();
            }
        },
        //计量单页面按钮操作方法
        saveTicket:function (loadSave) {
                    var  measurementStr = "";
                    $("#saveBtn").unbind("click").on("click",function () {
                        var formObj = $('#inputForm');
                        if(!Validator.valid(formObj,1.3)){
                            return;
                        }
                        var data = {
                            nodeId:$("#nodeId option:selected").val(),
                            mtrlId:$("#mtrlId option:selected").val(),
                            inoutFlag:$(".radios:checked").val(),
                            begShiftDate:$("#begShiftDate").val(),
                            endShiftDate:$("#endShiftDate").val(),
                            transType:$("#transType option:selected").val()
                        };
                        Api.ajaxJson(Api.mtrl+"/api/mv/SmtinoutBill/save",JSON.stringify(data),function (result) {
                            Mom.layMsg("操作成功!");
                            measurementStr = result.message;
                        });
                    });
                    //表计量
                    var measurement = {
                        btnArr:[
                            {btn:'保存',fn:function (layerIdx,layero) {
                                var iframeWin = layero.find('iframe')[0].contentWindow;
                                var formData = iframeWin.getscaleData();
                                console.log(formData)
                                if(formData){
                                    //调用接口：生成初始化数据
                                    // Api.ajaxForm(Api.pi+"/api/PiApi/tagNearLocal",data,function(result) {
                                    //     if (result.success) {
                                    //         Mom.layAlert(result.message);
                                    //         // var wuliao = result.AA.wuliao||data.wuliao;
                                    //         //更新选中行中的物料数据
                                    //         top.layer.close(layerIdx);
                                    //         PageModule.loadData(loadSave);
                                    //     }else{
                                    //         Mom.layAlert(result.message);
                                    //     }
                                    // });
                                }
                            }},
                        ]
                    };
                    $("#btn-surface").unbind("click").on("click",function () {
                        var id = measurementStr==""?$("#id").val():measurementStr;
                        var nodeId = $("#nodeId option:selected").val();
                        var begShiftDate = $("#begShiftDate").val();
                        var endShiftDate = $("#endShiftDate").val();
                        Bus.openDialogCfg("表计量创建","../material/materialMove/tableMeasurement.html?id="+id+"&nodeId="+nodeId+"&begShiftDate="+begShiftDate+"&endShiftDate="+endShiftDate,'837px','460px',measurement)
                    });
                    //槽车计量
                    var tankCar = {
                        btnArr:[
                            {btn:'重置',fn:function (layerIdx,layero) {
                                var iframeWin = layero.find('iframe')[0].contentWindow;
                                var formData = iframeWin.document.getElementsByTagName("input");
                                for(var i=0;i<formData.length;i++){
                                    formData[i].value = "";
                                }
                            }},
                            {btn:'保存',fn:function (layerIdx,layero) {
                                var iframeWin = layero.find('iframe')[0].contentWindow;
                                var formData = iframeWin.getTankFormData();
                                console.log(formData);
                                if(formData){
                                    //调用接口：生成初始化数据
                                    Api.ajaxJson(Api.mtrl+"/api/mv/WagonMeas/save",JSON.stringify(formData.data),function(result) {
                                        if (result.success) {
                                            Mom.layAlert(result.message);
                                            //更新选中行中的物料数据
                                            top.layer.close(layerIdx);
                                            PageModule.loadData(loadSave,"save");
                                        }else{
                                            Mom.layAlert(result.message);
                                        }
                                    });
                                }
                            }},
                        ]
                    };
                    $("#btn-tankCar").unbind("click").on("click",function () {
                        var id = measurementStr==""?$("#id").val():measurementStr;
                        var nodeId = $("#nodeId option:selected").val();
                        var begShiftDate = $("#begShiftDate").val();
                        var endShiftDate = $("#endShiftDate").val();
                        Bus.openDialogCfg("槽车创建","../material/materialMove/tankWagon.html?id="+id+"&nodeId="+nodeId+"&begShiftDate="+begShiftDate+"&endShiftDate="+endShiftDate,'783px','590px',tankCar);
                    });
                    //汽车衡计量
                    var automobile = {
                        btnArr:[
                            {btn:'重置',fn:function (layerIdx,layero) {
                                var iframeWin = layero.find('iframe')[0].contentWindow;
                                var formData = iframeWin.document.getElementsByTagName("input");
                                for(var i=0;i<formData.length;i++){
                                    formData[i].value = "";
                                }
                            }},
                            {btn:'保存',fn:function (layerIdx,layero) {
                                var iframeWin = layero.find('iframe')[0].contentWindow;
                                var formData = iframeWin.getFormData();
                                if(formData){
                                    //调用接口：生成初始化数据
                                    Api.ajaxJson(Api.mtrl+"/api/mv/TruckMeas/save",JSON.stringify(formData.data),function(result) {
                                        if (result.success) {
                                            Mom.layAlert(result.message);
                                            //更新选中行中的物料数据
                                            top.layer.close(layerIdx);
                                            PageModule.loadData(loadSave,"save");
                                        }else{
                                            Mom.layAlert(result.message);
                                        }
                                    });
                                }
                            }},
                        ]
                    };
                    $("#btn-automobile").unbind("click").on("click",function () {
                        var id = measurementStr==""?$("#id").val():measurementStr;
                        var nodeId = $("#nodeId option:selected").val();
                        var begShiftDate = $("#begShiftDate").val();
                        var endShiftDate = $("#endShiftDate").val();
                        Bus.openDialogCfg("槽车创建","../material/materialMove/automobileMeasure.html?id="+id+"&nodeId="+nodeId+"&begShiftDate="+begShiftDate+"&endShiftDate="+endShiftDate,'752px','496px',automobile);
                    });
                    //删除
                    $("#btn-delete").unbind("click").on("click",function () {
                        var str = '';  //用于拼接str
                        $("tbody tr td input.i-checks:checkbox").each(function (index, item) {
                            if ($(this).is(":checked")) {
                                var id = $(this).attr('id');
                                if (id != undefined) {
                                    str += "," + $(this).attr("id");
                                }
                            }
                        });
                        var data = {
                            ids: str.substr(1)
                        };
                        Api.ajaxForm(Api.mtrl+"/api/mv/MeasRec/delete",data,function (result) {
                            Mom.layMsg("删除成功")
                            $("tbody tr td input.i-checks:checkbox").each(function (index, item) {
                                if ($(this).is(':checked')) {
                                    $(this).parents('tr').remove();
                                }
                            });
                        })
                    });
                    //维护
                    $("#btn-maintain").unbind("click").on("click",function () {
                        var gaugeType =[];
                        var gaugeTypeStr = "";
                        $("tbody tr td input.i-checks:checkbox").each(function (index, item) {
                            if ($(this).is(":checked")) {
                                gaugeType.push($(this).attr('data-status'));
                            }
                        });
                        if(gaugeType.length>1){
                            Mom.layMsg("请选择一条数据")
                        }else{
                            var gaugeTypeStatus = gaugeType[0];
                            if(gaugeTypeStatus == "1"){    //表计量
                                $("#btn-surface").trigger("click");
                            }else if(gaugeTypeStatus == "2"){   //槽车计量
                                $("#btn-tankCar").trigger("click");
                            }
                        }
                    })
                },
         //类型select下拉
        loadType:function (data) {
            Api.ajaxJson(Api.admin + "/api/sys/SysDict/type/"+"TRANSPORT_TYPE",{},function(result){
                Bus.appendOptionsValue('#transType',result.rows,'value','label');
                $("#transType").on("change",function () {
                    var datas = {
                        inoutFlag:$(".radios:checked").val(),
                        transType:$("#transType option:selected").val()
                    };
                    if(data == null || data == undefined){
                        PageModule.loadData(datas)
                    }
                });
                PageModule.loadMagess(data);
            });
        },
        // 表计量页面
        MeasurementInit:function () {
            var id = Mom.getUrlParam("id");
            var nodeId = Mom.getUrlParam("nodeId");
            var begShiftDate = Mom.getUrlParam("begShiftDate");
            var endShiftDate = Mom.getUrlParam("endShiftDate");
            var data = {
                nodeId:nodeId,
                id:id,
                begShiftDate:begShiftDate,
                endShiftDate:endShiftDate
            };
            Api.ajaxForm(Api.mtrl+"/api/mv/InstrMeas/queryInstruListByNodeId",data,function (result) {   //加载数据接口
                Api.ajaxForm("../../../json/factoryModel/materialMove/tableMeasurement.json",{},function (template) {  //加载模板数据
                    if(result.success){
                        console.log(result);
                        var colModel = [
                            {"name": "id","label": "表名","align": "center","hidden":true,
                                formatter: function (cellvalue, options, rowObject) {
                                console.log(rowObject)
                                    return  rowObject.instrument.id;
                                }
                            },
                            {"name": "instrName","label": "表名","align": "center",
                                formatter: function (cellvalue, options, rowObject) {
                                    return  rowObject.instrument.instrName;
                                }
                            },
                            {"name": "frontVal","label": "前读数","align": "center",
                                formatter: function (cellvalue, options, rowObject) {
                                    return  rowObject.smInstrMeas.frontVal;
                                }
                            },
                            {"name": "","label": "取数","align": "center",
                                formatter: function (cellvalue, options, rowObject) {
                                    return "<i></i>";
                                }
                            },
                            {"name": "conPreRead","label": "确认前读数","align": "center","editable": true,
                                formatter: function (cellvalue, options, rowObject) {
                                    return rowObject.smInstrMeas.conPreRead;
                                }
                            },
                            {"name": "preReadDate","label": "确认前读数时间","align": "center",
                                formatter: function (cellvalue, options, rowObject) {
                                    return rowObject.smInstrMeas.preReadDate;
                                }
                            },
                            {"name": "behindVal","label": "后读数","align": "center",
                                formatter: function (cellvalue, options, rowObject) {
                                    return rowObject.smInstrMeas.behindVal;
                                }
                            },
                            {"name": "","label": "取数","align": "center",
                                formatter: function (cellvalue, options, rowObject) {
                                    return "<i></i>";
                                }
                            },
                            {"name": "conAftRead","label": "确认后读数","align": "center","editable": true,
                                formatter: function (cellvalue, options, rowObject) {
                                    return rowObject.smInstrMeas.conAftRead;
                                }
                            },
                            {"name": "aftReadDate","label": "后读数时间","align": "center",
                                formatter: function (cellvalue, options, rowObject) {
                                    return rowObject.smInstrMeas.aftReadDate;
                                }
                            },
                            {"name": "resetBhdVal","label": "回零前读数","align": "center","editable": true,
                                formatter: function (cellvalue, options, rowObject) {
                                    return rowObject.smInstrMeas.resetBhdVal;
                                }
                            },
                            {"name": "resetFrtVal","label": "回零后读数","align": "center","editable": true,
                                formatter: function (cellvalue, options, rowObject) {
                                    return rowObject.smInstrMeas.resetFrtVal;
                                }
                            }
                        ];
                        var rowData = [
                            {
                                smInstrMeas: {
                               instrName:"哈哈",
                               frontVal:"前读数",
                               conPreRead:"确认前读数",
                               preReadDate:"确认前读数时间",
                               behindVal:"后读数",
                               conAftRead:"确认后读数",
                               aftReadDate:"后读数时间",
                               resetBhdVal:"回零前读数",
                               resetFrtVal:"回零后读数"
                            },
                                instrument:{
                                    id:"123",
                                    instrName:"哈哈",
                                    frontVal:"前读数",
                                    conPreRead:"确认前读数",
                                    preReadDate:"确认前读数时间",
                                    behindVal:"后读数",
                                    conAftRead:"确认后读数",
                                    aftReadDate:"后读数时间",
                                    resetBhdVal:"回零前读数",
                                    resetFrtVal:"回零后读数"
                                }
                            }
                        ];  //模拟假数据
                        var len = colModel.length;
                        var configData  = jqGridAll.jG_configData(colModel);  //创建table的数据
                        var gridConfig = jqGridAll.jG_config('',colModel,len);
                        var editRowFn = jqGridAll.jG_editRowFn("#treeTable",false,true)
                        $("#treeTable").jqGrid($.extend(configData,gridConfig,editRowFn));
                    }else{
                        Mom.layAlert(result.message);
                    }
                })
            });
            window.getscaleData = function () {
                var ids =jqGridAll.jG_getCheckAllIds('#treeTable');
                console.log(ids)
                var rowData = [];
                for(var i=0;i<ids.length;i++){
                    rowData .push($("#treeTable").getRowData(ids[i]));
                }
                return rowData;
            }
        },
        //槽车计量
        tankWagonInit:function () {
            var id = Mom.getUrlParam("id");
            var nodeId = Mom.getUrlParam("nodeId");
            var begShiftDate = Mom.getUrlParam("begShiftDate");
            var endShiftDate = Mom.getUrlParam("endShiftDate");
            var itemObj = {
                smtinoutBillId:id,
                nodeId:nodeId,
                begShiftDate:begShiftDate,
                endShiftDate:endShiftDate
            };
            if(id){
                Api.ajaxForm(Api.mtrl+"/api/mv/MeasRec/form/"+nodeId,{},function (result) {
                    console.log(result)
                })
            }
            Validator.renderData(itemObj, $('#inputForm'));  //回显
            window.getTankFormData = function () {
                var formObj = $('#inputForm');
                if(!Validator.valid(formObj,1.3)){
                    return;
                }else{
                    return {
                        data: formObj.serializeJSON()
                    }
                }
            }
        },
        //汽车衡计量
        automobileInit:function () {
            var id = Mom.getUrlParam("id");
            var nodeId = Mom.getUrlParam("nodeId");
            var begShiftDate = Mom.getUrlParam("begShiftDate");
            var endShiftDate = Mom.getUrlParam("endShiftDate");
            var itemObj = {
                smtinoutBillId:id,
                nodeId:nodeId,
                begShiftDate:begShiftDate,
                endShiftDate:endShiftDate
            };
            Validator.renderData(itemObj, $('#inputForm'));  //回显
            window.getFormData = function () {
                var formObj = $('#inputForm');
                if(!Validator.valid(formObj,1.3)){
                    return;
                }else{
                    return {
                        data: formObj.serializeJSON()
                    }
                }
            }
        },
    };
$(function () {
    if($("#mobilisationTicket").length>0){
        PageModule.init();
    }else if($("#creategaugeTicket").length>0){
        PageModule.createInit();
    }else if($("#tableMeasurement").length>0){
        PageModule.MeasurementInit();
    }else if($("#tankWagon").length>0){
        PageModule.tankWagonInit();
    }else if($("#automobileMeasure").length>0){
        PageModule.automobileInit();
    }
 });
});
});
