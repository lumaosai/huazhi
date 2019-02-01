require([cdnDomain+'/js/zlib/app.js'], function (App) {
 require(['jqGrid_my'], function (jqGridAll) {
     var PageModule = {
         init:function () {
             PageModule.loadShift();//加载班次下拉
             PageModule.loadType();//加载类型下拉
             PageModule.clickHandler();//记载按钮点击事件
             var dataTime = Mom.getCookie(Const.gaugeDate)==""?Mom.shortDate:Mom.getCookie(Const.gaugeDate);  //初始化如果cookie存在就用cookie否则获取当前时间
             $("#tankDate").val(dataTime); //设置日期，如果cookie中有就存cookie的日期，没有保存当前日期
             window.pageLoad = function () {
                 if($("#status option:selected").val() == "1"){   //如果是制单中右上操作按钮显示为创建、维护、关闭
                     $(".liftOff").removeClass("hide");
                     $(".create").addClass("hide");
                 }else{                                          //如果是关闭状态就只有解除关闭
                     $(".create").removeClass("hide");
                     $(".liftOff").addClass("hide");
                 }
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
                     smtinoutBillStatus:$("#status option:selected").val(),
                     transType:$("#transTypes option:selected").val()
                 };
                 Api.ajaxJson(Const.mtrl+"/api/mv/SmtinoutBill/findList",JSON.stringify(data),function (result) {
                     if(result.success){
                             //主表colmodel
                             var colModel = [
                                 {"name": "conNo","label": "单据编号","align": "center"},
                                 {"name": "begShiftDate","label": "业务班次开始时间","align":"center"},
                                 {"name": "endShiftDate","label": "业务班次结束时间","align":"center"},
                                 {"name": "nodename","label": "进出厂点","align":"center",
                                     formatter: function (cellvalue, options, rowObject) {
                                             return rowObject.node.nodename
                                     }
                                 },
                                 {"name": "nodename","label": "主物料名称","align":"center",
                                     formatter: function (cellvalue, options, rowObject) {
                                         return rowObject.mtrl.mtrlName
                                     }
                                 },
                                 {"name": "amount","label": "单据总量","align":"center" },
                                 { "name": "conAmount","label": "确认总量","align":"center"},
                                 { "name": "smtinoutBillStatusLabel","label": "单据状态","align":"center"},
                                 {"name": "crtBy","label": "创建人","align":"center"},
                                 {"name": "createDate","label": "创建时间","align":"center"},
                                 {"name": "clsBy","label": "关闭人","align":"center"},
                                 {"name": "clsDate","label": "关闭时间","align":"center"},
                                 {"name": "remark","label": "备注","align":"center"}
                             ];
                             var colModel2 = [
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
                             ];
                             PageModule.createTable(result.rows,colModel,colModel2,true);
                             Mom.setCookie("gaugeDate",$("#tankDate").val());                //设置cookie
                     }else{
                         Mom.layMsg(result.meaasge);
                     }
                 })
             }
         },
         loadShift:function () {
            var url_ = Const.aps+'/api/ctrl/Shift/list';
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
         loadType:function () {
            Api.ajaxJson(Const.admin + "/api/sys/SysDict/type/"+"TRANSPORT_TYPE",{},function(result) {
                Bus.appendOptionsValue('#transTypes', result.rows, 'value', 'label');
            })
         },
         //dataTable:接口返回要渲染的数据  colmodel1：主表数据colModel2：子表数据multiBol：是否使用复选框
         createTable:function (dataTable,colModel1,colModel2,multiBol) {
            //渲染主表
             var setting1 = {
                 colModel:colModel1,
                 data:dataTable,
                 multiselect: multiBol
            };
             //渲染子表
             var setting2 = {
                 colModel:colModel2
             };
             var config = {      //获取子集的时候需要的参数以及接口配置
                 url:Const.mtrl+"/api/mv/SmtinoutBill/subList",
                 dataParams: {
                     id:"id"
                 },
                 contentType:"Form"
             };
             var subtable = [];
             jqGridAll.jG_jqGridTableLevel("#SmtinoutBill",setting1,setting2,config,subtable);
             jqGridAll.jG_loadTable("#SmtinoutBill",dataTable);
             $(".treeTable-count").removeClass("hide");
             $(".treeTable-num").text(dataTable.length);
         },
         //列表页面按钮点击事件
         clickHandler:function () {
             //新建按钮
             $("#btn-addmsg").unbind("click").on("click",function () {
                 var winOptons = {
                      maxmin:false, btn:[]
                 };
                 var date = $("#tankDate").val();
                 var shift = $("#shift option:selected").val();
                 var dataShift = PageModule.goredDataShift(date,shift);
                 Bus.openDialogCfg("计量单创建","../material/materialMove/creategaugeTicket.html?begindata="+dataShift.beginData+"&enderData="+dataShift.enderData+"&date="+date,"783px",'708px', winOptons);
             });
             //维护页面
             $("#btn-maintainF").unbind("click").on("click",function () {
                var ids =jqGridAll.jG_getCheckAllIds('#SmtinoutBill');
                var inoutFlag = $(".radios:checked").val();
                var transType = $("#transType option:selected").val();
                if(ids.length<=0){
                    Mom.layMsg('请选择一条进行计量单');
                }else if(ids.length>1){
                    Mom.layMsg('只能选择一条');
                }else {
                    var id = ids[0];
                    var winOptons = {
                        maxmin: false, btn: []
                    };
                    Bus.openDialogCfg("维护计量单","../material/materialMove/creategaugeTicket.html?id="+id,"783px",'708px', winOptons);
                };
             });
             //关闭按钮
             $("#btn-colse").unbind("click").on("click",function () {
                 var str= "";
                 var idsArr = [];
                 var ids = jqGridAll.jG_getCheckAllIds("#SmtinoutBill");
                 for(var i=0;i<ids.length;i++){
                     str += "," + ids[i];
                     idsArr.push(ids[i])
                 }
                 if(ids.length<=0){
                     Mom.layMsg('请选择一条进行计量单');
                 }else{
                     var data = {
                         ids:str.substr(1),
                         smtinoutBillStatus:"1"
                     };
                     Api.ajaxForm(Const.mtrl+"/api/mv/SmtinoutBill/update",data,function (result) {
                         if(result.success){
                             Mom.layMsg(result.message);
                             Mom.setCookie("gaugeDate",$("#tankDate").val());                //设置cookie
                             window.pageLoad();
                         }else{
                             Mom.layMsg(result.message)
                         }
                     })
                 }
             });
             //删除按钮
             $("#btn-delete").unbind("click").on("click",function () {
                 var str= "";
                 var idsArr =[];
                 var ids = jqGridAll.jG_getCheckAllIds("#SmtinoutBill");
                 for(var i=0;i<ids.length;i++){
                     str += "," + ids[i];
                     idsArr.push(ids[i])
                 }
                 if(idsArr.length<=0){
                     Mom.layMsg('请选择要删除的计量单');

                 }else{
                     var data = {
                         ids:str.substr(1)
                     };
                     Api.ajaxForm(Const.mtrl+"/api/mv/SmtinoutBill/delete",data,function (result) {
                         if(result.success){
                             Mom.layMsg(result.message);
                             Mom.setCookie("gaugeDate",$("#tankDate").val());                //设置cookie
                             window.pageLoad();
                         }else{
                             Mom.layMsg(result.message);
                         }
                     })
                 }
             });
             //仪表计量
             $("#btn-instrument").unbind("click").on("click",function () {
                 var winOptons = {
                     maxmin: false, btn: []
                 };
                 var openPage = "open";
                 Bus.openDialogCfg("进出厂仪表计量","../material/materialMove/instrumentMeasurement.html?openPage="+openPage,"963px",'537px', winOptons);
             });
             //解除关闭
             $("#btn-liftoff").unbind("click").on("click",function () {
                 var str= "";
                 var ids = jqGridAll.jG_getCheckAllIds("#SmtinoutBill");
                 for(var i=0;i<ids.length;i++){
                     str += "," + ids[i];
                 }
                 var data = {
                     ids:str.substr(1),
                     smtinoutBillStatus:"0"
                 };
                 Api.ajaxForm(Const.mtrl+"/api/mv/SmtinoutBill/update",data,function (result) {
                     if(result.success){
                         Mom.layMsg(result.message);
                         Mom.setCookie("gaugeDate",$("#tankDate").val());                //设置cookie
                         window.pageLoad();
                     }else{
                         Mom.layMsg(result.message)
                     }
                 })
             })
         },
         goredDataShift:function (data,shift) {
             var dataObj = {};
             dataObj.beginData = data+" "+shift.slice(0,8);
             dataObj.enderData = data+" "+shift.slice(9,17);
             return dataObj;
         },
         creategaugeTicket:function () {
             $(".tab-nav li").addClass("active");
             var id = Mom.getUrlParam("id");
             var begindata = Mom.getUrlParam("begindata");
             var enderData = Mom.getUrlParam("enderData");
             var date = Mom.getUrlParam("date");
             var measurementStr = "";      //保存之后的Id;
             //如果ID存在就显示回显，不可编辑，如果不存在就渲染下拉框
             if(id){//(如果是列表页面点击维护进来的)
                 var data = {
                     id:id
                 };
                 measurementStr = id;
                 PageModule.loadTransType();   //渲染运输类型下拉
                 PageModule.loadData(data,"changePage");
                 $("select").attr("disabled",true);
             }else{//(如果是列表页面点击新增进来的)
                 $(".toolbar-btns .btn").attr("disabled","disabled");
                 PageModule.loadTransType();   //渲染运输类型下拉
                 $("#begShiftDate").val(begindata);
                 $("#endShiftDate").val(enderData);
                 var data = {
                     inoutFlag:$(".radios:checked").val(),
                     transType:$("#transType option:selected").val()==undefined?"0":$("#transType option:selected").val()
                 };
                 PageModule.loadData(data,"createPage");
                 $("#transType").on("change",function () {
                     $("#nodeId").empty();
                     $("#mtrlId").empty();
                     var datas = {
                         inoutFlag:$(".radios:checked").val(),
                         transType:$("#transType option:selected").val()
                     };
                     PageModule.loadData(datas,"createPage");
                 });
             };
             //保存按钮
             $("#saveBtn").unbind("click").on("click",function () {
                 var formObj = $('#inputForm');
                 if(!Validator.valid(formObj,1.3)){
                     return;
                 };
                     var data = {
                         nodeId:$("#nodeId option:selected").val(),
                         mtrlId:$("#mtrlId option:selected").val(),
                         inoutFlag:$(".radios:checked").val(),
                         begShiftDate:$("#begShiftDate").val(),
                         endShiftDate:$("#endShiftDate").val(),
                         transType:$("#transType option:selected").val(),
                         remark:$("#remark").val(),
                         id:$("#id").val(),
                         amount:$("#amount").val(),
                         conAmount:$("#conAmount").val()
                     };
                     Api.ajaxJson(Const.mtrl+"/api/mv/SmtinoutBill/save",JSON.stringify(data),function (result) {
                         if(result.success){
                             Mom.layMsg("操作成功!");
                             $(".toolbar-btns .btn").attr("disabled",false);
                             Mom.setCookie("gaugeDate",date);                //存储cookie
                             measurementStr = result.message;
                             $("#id").val(measurementStr);
                             top.TabsNav.refreshActiveTab();  //刷新父级列表
                             var data = {
                                 id:result.message
                             };
                             PageModule.loadData(data,"Newsave");
                             Mom.setCookie("gaugeDate",date);                //设置cookie
                         }else{
                             Mom.layMsg(result.message);
                         }
                     });
             });
             //表计量按钮
             var winoption = {btnArr:[
                 {btn:"保存",fn:function (layerIdx,layero) {
                     var iframeWin = layero.find('iframe')[0].contentWindow;
                     var formDataTable = iframeWin.getscaleData();
                     if(formDataTable){
                         Api.ajaxJson(Const.mtrl+"/api/mv/InstrMeas/save",JSON.stringify(formDataTable),function (result) {
                             if(result.success){
                                 Mom.layMsg("操作成功");
                                 var data = {
                                     id:$("#id").val()
                                 };
                                 top.layer.close(layerIdx);
                                 PageModule.loadData(data,"save");
                                 Mom.setCookie("gaugeDate",date);                //设置cookie
                             }else{
                                 Mom.layMsg(result.message)
                             }
                         })
                     }
                 }}
             ]};
             $("#btn-surface").unbind("click").on("click",function () {
                 var id = $("#id").val();
                 if(id){
                     var nodeId = $("#nodeId").val();
                     var begShiftDate = $("#begShiftDate").val();
                     var endShiftDate = $("#endShiftDate").val();
                     var flage = "0";
                     Bus.openDialogCfg("表计量创建","../material/materialMove/tableMeasurement.html?id="+measurementStr+"&nodeId="+nodeId+"&begShiftDate="+begShiftDate+"&endShiftDate="+endShiftDate+"&flage="+flage,'837px','460px',winoption)
                 }else{
                     Mom.layMsg("请先保存计量单")
                 }
             });
             //槽车计量创建
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
                         var formObj = $('#inputForm');
                         var url = formObj.attr('action');
                         var formData = iframeWin.getTankFormData();
                         if(formData){
                             //调用接口：生成初始化数据
                             Api.ajaxJson(Const.mtrl+"/api/mv/WagonMeas/save",JSON.stringify(formData.data),function(result) {
                                 if (result.success) {
                                     Mom.layAlert(result.message);
                                     top.layer.close(layerIdx);
                                     var data = {
                                         id:formData.data.smtinoutBillId
                                     };
                                     PageModule.loadData(data,"save");
                                     Mom.setCookie("gaugeDate",date);                //设置cookie
                                 }else{
                                     Mom.layAlert(result.message);
                                 }
                             });
                         }
                     }},
                 ]
             };
             $("#btn-tankCar").unbind("click").on("click",function () {
                 if(measurementStr){
                     var nodeId = $("#nodeId option:selected").val();
                     var begShiftDate = $("#begShiftDate").val();
                     var endShiftDate = $("#endShiftDate").val();
                     Bus.openDialogCfg("槽车计量创建","../material/materialMove/tankWagon.html?id="+measurementStr+"&nodeId="+nodeId+"&begShiftDate="+begShiftDate+"&endShiftDate="+endShiftDate,'783px','590px',tankCar);
                 }else{
                     Mom.layMsg("请先保存计量单")
                 }
             });
             //汽车衡计量创建
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
                             Api.ajaxJson(Const.mtrl+"/api/mv/TruckMeas/save",JSON.stringify(formData.data),function(result) {
                                 if (result.success) {
                                     Mom.layAlert(result.message);
                                     //更新选中行中的物料数据
                                     top.layer.close(layerIdx);
                                     var data = {
                                         id:formData.data.smtinoutBillId
                                     };
                                     PageModule.loadData(data,"save");
                                     Mom.setCookie("gaugeDate",date);                //设置cookie
                                 }else{
                                     Mom.layAlert(result.message);
                                 }
                             });
                         }
                     }},
                 ]
             };
             $("#btn-automobile").unbind("click").on("click",function () {
                 if(measurementStr){
                     var nodeId = $("#nodeId option:selected").val();
                     var begShiftDate = $("#begShiftDate").val();
                     var endShiftDate = $("#endShiftDate").val();
                     Bus.openDialogCfg("汽车衡计量创建","../material/materialMove/automobileMeasure.html?id="+measurementStr+"&nodeId="+nodeId+"&begShiftDate="+begShiftDate+"&endShiftDate="+endShiftDate,'752px','496px',automobile);
                 }else{
                     Mom.layMsg("请先保存计量单")
                 }

             });
             //维护
             $("#btn-maintain").unbind("click").on("click",function () {
                 var gaugeType =[];
                 var gaugeTypeStr = "";
                 var ids = "";
                 $("tbody tr td input.i-checks:checkbox").each(function (index, item) {
                     if ($(this).is(":checked")) {
                         gaugeType.push($(this).attr('data-status'));
                         ids = $(this).attr('id');
                     }
                 });
                 if(gaugeType.length>1){
                     Mom.layMsg("请选择一条数据")
                 }else{
                     var gaugeTypeStatus = gaugeType[0];
                     if(gaugeTypeStatus == "1"){    //表计量
                         var winoption = {btnArr:[
                             {btn:"保存",fn:function (layerIdx,layero) {
                                 var iframeWin = layero.find('iframe')[0].contentWindow;
                                 var formDataTable = iframeWin.getscaleData();
                                 Api.ajaxJson(Const.mtrl+"/api/mv/InstrMeas/save",JSON.stringify(formDataTable),function (result) {
                                  if(result.success){
                                      top.layer.close(layerIdx);
                                      var data = {
                                          id:measurementStr
                                      };
                                      Mom.setCookie("gaugeDate",date);                //设置cookie
                                      PageModule.loadData(data,"save");
                                  }else{
                                      Mom.layMsg(result.message)
                                  }
                                 })
                             }}
                         ]};
                             var nodeId = $("#nodeId").val();
                             var begShiftDate = $("#begShiftDate").val();
                             var endShiftDate = $("#endShiftDate").val();
                             var flage = "1";
                             Bus.openDialogCfg("表计量维护","../material/materialMove/tableMeasurement.html?id="+ids+"&nodeId="+nodeId+"&begShiftDate="+begShiftDate+"&endShiftDate="+endShiftDate+"&flage="+flage+"&status="+"change",'837px','460px',winoption)
                     }else if(gaugeTypeStatus == "2"){   //槽车计量
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
                                     var formObj = $('#inputForm');
                                     var url = formObj.attr('action');
                                     var formData = iframeWin.getTankFormData();
                                     if(formData){
                                         Api.ajaxJson(Const.mtrl+"/api/mv/WagonMeas/save",JSON.stringify(formData.data),function(result) {
                                             if (result.success) {
                                                 Mom.layAlert(result.message);
                                                 top.layer.close(layerIdx);
                                                 var data = {
                                                     id:formData.data.smtinoutBillId
                                                 };
                                                 Mom.setCookie("gaugeDate",date);                //设置cookie
                                                 PageModule.loadData(data,"save");
                                             }else{
                                                 Mom.layAlert(result.message);
                                             }
                                         });
                                     }
                                 }},
                             ]
                         };
                             var nodeId = $("#nodeId option:selected").val();
                             var begShiftDate = $("#begShiftDate").val();
                             var endShiftDate = $("#endShiftDate").val();
                             Bus.openDialogCfg("槽车计量维护","../material/materialMove/tankWagon.html?id="+ids+"&nodeId="+nodeId+"&begShiftDate="+begShiftDate+"&endShiftDate="+endShiftDate+"&status="+"change",'783px','590px',tankCar);
                     }else if(gaugeTypeStatus == "4"){
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
                                         Api.ajaxJson(Const.mtrl+"/api/mv/TruckMeas/save",JSON.stringify(formData.data),function(result) {
                                             if (result.success) {
                                                 Mom.layAlert(result.message);
                                                 top.layer.close(layerIdx);
                                                 var data = {
                                                     id:formData.data.smtinoutBillId
                                                 };
                                                 Mom.setCookie("gaugeDate",date);                //设置cookie
                                                 PageModule.loadData(data,"save");
                                             }else{
                                                 Mom.layAlert(result.message);
                                             }
                                         });
                                     }
                                 }},
                             ]
                         };
                             var nodeId = $("#nodeId option:selected").val();
                             var begShiftDate = $("#begShiftDate").val();
                             var endShiftDate = $("#endShiftDate").val();
                         Bus.openDialogCfg("汽车衡计量维护","../material/materialMove/automobileMeasure.html?id="+ids+"&nodeId="+nodeId+"&begShiftDate="+begShiftDate+"&endShiftDate="+endShiftDate+"&status="+"change",'752px','496px',automobile);
                     }
                 }
             });
             //删除
             $("#btn-delete").unbind("click").on("click",function () {
                 var str = '';  //用于拼接str
                 var ids = [];
                 $("tbody tr td input.i-checks:checkbox").each(function (index, item) {
                     if ($(this).is(":checked")) {
                         var id = $(this).attr('id');
                         if (id != undefined) {
                             str += "," + $(this).attr("id");
                             ids.push($(this).attr("id"))
                         }
                     }
                 });
                 if(ids.length>0){
                     var data = {
                         ids: str.substr(1)
                     };
                     Api.ajaxForm(Const.mtrl+"/api/mv/MeasRec/delete",data,function (result) {
                        if(result.success){
                            Mom.layMsg("删除成功");
                            $("tbody tr td input.i-checks:checkbox").each(function (index, item) {
                                if ($(this).is(':checked')) {
                                    $(this).parents('tr').remove();
                                }
                            });
                            Mom.setCookie("gaugeDate",date);                //设置cookie
                        }else{
                            Mom.layMsg(result.message)
                        }
                     })
                 }else{
                     Mom.layMsg("至少选择一条数据");
                 }
             });
             //赋值按钮
             $("#assignment").unbind("click").on("click",function () {
                 $("#conAmount").val($("#amount").val());
             });
         },
         //渲染运输类型下拉
         loadTransType:function () {
             Api.ajaxJson(Const.admin + "/api/sys/SysDict/type/"+"TRANSPORT_TYPE",{},function(result) {
                 Bus.appendOptionsValue('#transType', result.rows, 'value', 'label');
             });
         },
         //通过接口获取数据。如果存在ID就回显，如果没有ID就加载进出厂和物料
         loadData:function (data,item) {
             Api.ajaxJson(Const.mtrl+"/api/mv/SmtinoutBill/form",JSON.stringify(data),function (result) {
                 if(item == "Newsave"){  //新建页面点击保存之后
                     Validator.renderData(result.smtinoutBill, $('#inputForm'));
                 } else if(item == "changePage"){    //维护
                     //先回显页面
                     var mtrlList = [];
                         Validator.renderData(result.smtinoutBill, $('#inputForm'));   //回显
                     //运输类型下拉
                     $("#transType option").each(function(index,item){
                         if($(item).attr("value") == result.smtinoutBill.transType){
                             $(this).attr("selected",true);
                         }
                     });
                    //回显进出厂下拉
                     var mtrlInoutPutList = [];
                     var mtrlList = [];
                     var nodeStr = "";
                     mtrlInoutPutList = result.mtrlInoutPutList;
                     var options = [];
                     for(var i=0;i<mtrlInoutPutList.length;i++){
                         if(result.smtinoutBill.nodeId == mtrlInoutPutList[i].nodeId){
                             mtrlList = mtrlInoutPutList[i].mtrlList;
                         }
                         options.push({'value':mtrlInoutPutList[i].nodeId, 'label':result.mtrlInoutPutList[i].nodeInoutput.nodename});
                     };
                     $("#nodeId").empty();
                     Bus.appendOptions("#nodeId",options);
                     $("#nodeId option").each(function(index,item){
                         if($(item).attr("value") == result.smtinoutBill.nodeId){
                                $(this).attr("selected",true);
                               nodeStr = result.smtinoutBill.nodeId;
                         }
                     });
                    //回显物料下拉
                     var mtrlOption = [];
                    for(var j=0;j<mtrlList.length;j++){
                        mtrlOption.push({'value':mtrlList[j].id, 'label':mtrlList[j].mtrlName});
                    };
                     Bus.appendOptions("#mtrlId",mtrlOption);
                     $("#mtrlId option").each(function(index,item){
                         if($(item).attr("value") == result.smtinoutBill.mtrlId){
                             $(this).attr("selected",true);
                         }
                     });
                     createTable(result.measRecList);  //创建下方列表
                 }else if(item == "createPage") {                      //新建
                     //渲染进出场下拉（如果设置为选择后进出厂点为空的时候，需要一个请选择选项的时候option.push({})）
                     var rows = result.mtrlInoutPutList;
                     var options = [];
                     // $("#nodeId").empty();
                     $(rows).each(function (i, o) {
                         options.push({'value': o.nodeId, 'label': o.nodeInoutput.nodename})
                     });
                     Bus.appendOptions("#nodeId", options);
                     //渲染物料下拉
                     var mtrloptions = [];
                     for (var i = 0; i < rows.length; i++) {
                         if (rows[i].nodeId == $("#nodeId option:selected").val()) {
                             $(rows[i].mtrlList).each(function (i, o) {
                                 mtrloptions.push({'value': o.id, 'label': o.mtrlName})
                             });
                         }
                         $("#mtrlId").empty();
                         Bus.appendOptions("#mtrlId", mtrloptions);
                     }
                     $("#nodeId").unbind("change").on("change", function () {
                         $("#mtrlId").empty();
                         for (var i = 0; i < result.mtrlInoutPutList.length; i++) {
                             if (result.mtrlInoutPutList[i].nodeId == $(this).val()) {
                                 var mtrloptions = [];
                                 $(result.mtrlInoutPutList[i].mtrlList).each(function (i, o) {
                                     mtrloptions.push({'value': o.id, 'label': o.mtrlName})
                                 });
                                 Bus.appendOptions("#mtrlId", mtrloptions);
                             }
                         }
                     })
                 }else{       //计量单维护页面点击维护的保存的时候
                     createTable(result.measRecList);  //创建下方列表
                 }
             });

             function createTable(tableData) {
                 $("#SmtinoutBill").dataTable({
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

                 //计算单据总量的合计值
                 var colVal=0;
                 if(tableData.length>0){
                     for(var i=0;i<tableData.length;i++){
                         if(tableData[i].conVal == null){
                             tableData[i].conVal = 0;
                         }
                         colVal+=parseInt(tableData[i].conVal)
                     }
                     $("#amount").val(colVal);
                 }
             }
         },
         //表计量页面
         measurementInit:function () {
             var id = Mom.getUrlParam("id");
             var nodeId = Mom.getUrlParam("nodeId");
             var begShiftDate = Mom.getUrlParam("begShiftDate");
             var endShiftDate = Mom.getUrlParam("endShiftDate");
             var status = Mom.getUrlParam("status");
             var dataArr = [];
             var data = {
                 nodeId:nodeId,
                 id:id,
                 begShiftDate:begShiftDate,
                 endShiftDate:endShiftDate
             };
             if(status){       //判断是新增还是维护(维护)
                 Api.ajaxForm(Const.mtrl+"/api/mv/MeasRec/form/"+id,{},function (result) {
                     if(result.success){
                         dataArr = result.row;
                         if(dataArr.length>0){
                             for(var i=0;i<dataArr.length;i++){
                                 dataArr[i].smInstrMeas.preReadDate = begShiftDate;
                                 dataArr[i].smInstrMeas.aftReadDate = endShiftDate;
                                 dataArr[i].begShiftDate = begShiftDate;
                                 dataArr[i].endShiftDate = endShiftDate;
                                 dataArr[i].gaugeType = "1";
                                 dataArr[i].smtinoutBillId = id;
                             }
                         }
                         createTable(dataArr);
                     }else{
                         Mom.layMsg(result.message)
                     }
                 });
             }else{   //(新增)
                 Api.ajaxForm(Const.mtrl+"/api/mv/InstrMeas/queryInstruListByNodeId",data,function (result) {
                     if(result.success){
                         dataArr = result.rows;
                         if(dataArr.length>0){
                             for(var i=0;i<dataArr.length;i++){
                                 dataArr[i].smInstrMeas.preReadDate = begShiftDate;
                                 dataArr[i].smInstrMeas.aftReadDate = endShiftDate;
                                 dataArr[i].begShiftDate = begShiftDate;
                                 dataArr[i].endShiftDate = endShiftDate;
                                 dataArr[i].gaugeType = "1";
                                 dataArr[i].smtinoutBillId = id;
                             }
                         }
                         createTable(dataArr);
                     }else{
                         Mom.layMsg(result.message);
                     }
                 });
             }
             window.getscaleData = function () {
                 //去除input，不然拿到的是html元素
                 $('#InstrMeas input[type=text]').each(function (i, item) {
                     $(this).parents('td').text($(this).val());
                     $(this).remove();
                 });
                 //jqGrid没有单选按钮,当有选中保存的时候，通过getRow获取所有数据，然后拿到radios的id，将这条数据返回
                 //id：当新建的时候不传ID，如果是维护的时候要给ID
                 //instrId：新建维护都需要传给后台
                 //要求返回数据格式跟接收的格式一直
                 var flage = Mom.getUrlParam("flage");   //判断是新增还是维护0//新建  1//维护
                 //拿到表中所有数据（有单元格可以编辑，为的是拿到编辑后的数据）
                 var tabledata = $("#InstrMeas").jqGrid("getRowData");
                 //拿到选中的数据
                 var ids = "";
                 $("input.i-checks:radio").each(function (index, item) {
                     if ($(this).is(":checked")) {
                             ids = $(this).attr("id");
                     }
                 });
                 //用来存放选中条的数据
                 var dataItem = {};
                 for(var i=0;i<tabledata.length>0;i++){
                     if(ids == tabledata[i].id){
                         dataItem = tabledata[i];
                     }
                 }
                 //用来存放返回数据
                 var tableItem = {};
                 for(var j=0;j<dataArr.length;j++){
                     if(ids == dataArr[j].id){
                         tableItem = dataArr[j];
                     }
                 }
                 //将改变后的数据赋值给接口返回的数据，保持数据格式一直
                 tableItem.smInstrMeas.conPreRead = dataItem.conPreRead;   //赋值确认前读数
                 tableItem.smInstrMeas.conAftRead = dataItem.conAftRead;   //赋值确认后读数
                 tableItem.smInstrMeas.resetBhdVal = dataItem.resetBhdVal;   //赋值回零前读数
                 tableItem.smInstrMeas.resetFrtVal = dataItem.resetFrtVal;   //赋值回零后读数
                    if(flage == "0"){
                        delete  tableItem.id;
                    };
                    return tableItem;
             };
             function createTable(data) {
                 var colModel = [
                     {"name":"id","label":"id","align":"center","hidden":true},
                     {"name":"","label":"","align":"center",
                         formatter:function (cellvalue, options, rowObject) {
                             return "<input type='radio' name='radios' id='"+rowObject.id+"'  class='i-checks' checked/>"
                         }
                     },
                     {"name": "nodename","label": "表名","align":"center",
                         formatter: function (cellvalue, options, rowObject) {
                             return rowObject.instrument.instrName;
                         }
                     },
                     {"name": "frontVal","label": "前读数","align":"center",
                         formatter: function (cellvalue, options, rowObject) {
                             return rowObject.smInstrMeas.frontVal;
                         }
                     },
                     {"name": "operation ","label": "取数","align":"center",
                         formatter: function (cellvalue, options, rowObject) {
                             return "<a class='before'><i class='iconfont icon-quzhiziduangongshi col-1ab394'></i></a>";
                         }
                     },
                     { "name": "conPreRead","label": "确认前读数","align":"center","editable": true,
                         formatter: function (cellvalue, options, rowObject) {
                             return rowObject.smInstrMeas.conPreRead;
                         }
                     },
                     {"name": "preReadDate","label": "前读数时间","align":"center",
                         formatter: function (cellvalue, options, rowObject) {
                             return rowObject.smInstrMeas.preReadDate;
                         }
                     },
                     {"name": "behindVal","label": "后读数","align":"center",
                         formatter: function (cellvalue, options, rowObject) {
                             return rowObject.smInstrMeas.behindVal;
                         }
                     },
                     {"name": "operation","label": "取数","align":"center",
                         formatter: function (cellvalue, options, rowObject) {
                             return "<a class='after'><i class='iconfont icon-zujian-yibiaopan col-1ab394'></i></a>";
                         }
                     },
                     {"name": "conAftRead","label": "确认后读数","align":"center","editable": true,

                         formatter: function (cellvalue, options, rowObject) {
                             return rowObject.smInstrMeas.conAftRead;
                         }
                     },
                     {"name": "aftReadDate","label": "后读数时间","align":"center",
                         formatter: function (cellvalue, options, rowObject) {
                             return rowObject.smInstrMeas.aftReadDate;
                         }
                     },
                     {"name": "resetBhdVal","label": "回零前读数","align":"center","editable": true,
                         formatter: function (cellvalue, options, rowObject) {
                             return rowObject.smInstrMeas.resetBhdVal;
                         }
                     },
                     {"name": "resetFrtVal","label": "回零后读数","align":"center","editable": true,
                         formatter: function (cellvalue, options, rowObject) {
                             return rowObject.smInstrMeas.resetFrtVal;
                         }
                     }
                 ];
                 var configData  = jqGridAll.jG_configData(data);  //创建table的数据
                 var len = data.length;
                 var gridConfig = jqGridAll.jG_config('',[],colModel,len);
                 var lastsel;
                 var gridEdit = jqGridAll.jG_editRowFn("#InstrMeas",lastsel,true);
                 $("#InstrMeas").jqGrid($.extend(configData,gridConfig,gridEdit));
                 renderIChecks();
                 $(".before").unbind("click").on("click",function () {
                     var tagInfo = [];
                     var tabObj = {};
                     var eTarget = $(this)
                     tabObj.tagName = eTarget.parent("td").prev().text();
                     tabObj.tagName = "3600";
                     tagInfo.push(tabObj);
                     var data  ={
                         cltTime:eTarget.parent("td").next().next().text(),
                         tagInfo:JSON.stringify(tagInfo)
                     }
                     Api.ajaxForm(Const.pi+"/api/PiApi/tagNearLocal",data,function(result) {
                         if(result.success){
                             var tableArr = [];
                             Mom.layMsg("采集成功");
                             eTarget.parent("td").next().text(result.rows[0].val)
                         }else{
                             Mom.layMsg(result.message)
                         }
                     })
                 });
                 $(".after").unbind("click").on("click",function () {
                     var tagInfo = [];
                     var tabObj = {};
                     var eTarget = $(this);
                     tabObj.tagName = eTarget.parent("td").prev().text();
                     tabObj.tagName = "3600";
                     tagInfo.push(tabObj);
                     var data  ={
                         cltTime:eTarget.parent("td").next().next().text(),
                         tagInfo:JSON.stringify(tagInfo)
                     };
                     Api.ajaxForm(Const.pi+"/api/PiApi/tagNearLocal",data,function(result) {
                         if(result.success){
                             var tableArr = [];
                             Mom.layMsg("采集成功");
                             eTarget.parent("td").next().text(result.rows[0].val)
                         }else{
                             Mom.layMsg(result.message)
                         }
                     })
                 });
             }
         },
         //槽车计量
         tankCarmeasure:function () {
             $("#smtinoutBillId").val(Mom.getUrlParam("id"));
             $("#nodeId").val(Mom.getUrlParam("nodeId"));
             $("#begShiftDate").val(Mom.getUrlParam("begShiftDate"));
             $("#endShiftDate").val(Mom.getUrlParam("endShiftDate"));
             var id = Mom.getUrlParam("id");
             var status = Mom.getUrlParam("status");
             if(status){
                 Api.ajaxForm(Const.mtrl+"/api/mv/MeasRec/form/"+id,{},function (result) {
                     if(result.success){
                         Validator.renderData(result.WagonMeas, $('#inputForm'));
                     }else{
                         Mom.layMsg(result.message)
                     }
                 });
             }
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
             $("#smtinoutBillId").val(Mom.getUrlParam("id"));
             $("#nodeId").val(Mom.getUrlParam("nodeId"));
             var id = Mom.getUrlParam("id");
             var status = Mom.getUrlParam("status");
             if(status){
                 Api.ajaxForm(Const.mtrl+"/api/mv/MeasRec/form/"+id,{},function (result) {
                    if(result.success){
                        Validator.renderData(result.TruckMeas, $('#inputForm'));
                        $("#begShiftDate").val(Mom.getUrlParam("begShiftDate"));
                        $("#endShiftDate").val(Mom.getUrlParam("endShiftDate"));
                        $("#begShiftDate").attr("disabled",true);
                        $("#endShiftDate").attr("disabled",true);
                    }else{
                        Mom.layMsg(result.message);
                    }
                 });
             }else{
                 $("#begShiftDate").val(Mom.getUrlParam("begShiftDate"));
                 $("#endShiftDate").val(Mom.getUrlParam("endShiftDate"));
                 $("#begShiftDate").attr("disabled",true);
                 $("#endShiftDate").attr("disabled",true);
             }
             window.getFormData = function () {
                 $("#begShiftDate").attr("disabled",false);
                 $("#endShiftDate").attr("disabled",false);
                 var formObj = $('#inputForm');
                 if(!Validator.valid(formObj,1.3)){
                     return;
                 }else{
                     return {
                         data: formObj.serializeJSON()
                     }
                 }
             }
         }
     }
$(function () {
    if($("#mobilisationTicket").length>0){    //进出厂计量单列表页
        PageModule.init();
    }else if($("#creategaugeTicket").length>0){   //新增/维护页面
        PageModule.creategaugeTicket();
    }else if($("#tableMeasurement").length>0){ //表计量
        PageModule.measurementInit();
    }else if($("#tankWagon").length>0){       //槽车计量
        PageModule.tankCarmeasure();
    }else if($("#automobileMeasure").length>0){  //汽车衡计量
        PageModule.automobileInit();
    }
    })
 })
 });

