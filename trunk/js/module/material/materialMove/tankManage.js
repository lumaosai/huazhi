/**
 * Created by admin on 2018/10/16.
 */
require([cdnDomain+'/js/zlib/app.js'], function(App) {
    require(['jqGrid_my'], function (jqGridAll) {
        var PageModule = {
            nodeObj : {},
            /*************检尺********************/
        init:function () {
                var dataTime = Mom.getCookie(Const.tankDate)==""?Mom.shortDate:Mom.getCookie(Const.tankDate);  //初始化如果cookie存在就用cookie否则获取当前时间
                $("#tankDate").val(dataTime); //设置日期，如果cookie中有就存cookie的日期，没有保存当前日期
                PageModule.loadClass();
                $("#tankDate").on("click",function () {
                    WdatePicker({maxDate:Mom.shortDate})
                });
                pageLoad = function () {
                    $("#shiftHidden").val($('#shift option:selected') .val());  //设置隐藏班次
                    $("#shiftHidden").attr("data-time",$("#tankDate").val());   //设置隐藏日期
                    if(PageModule.nodeObj.pId == null){
                        $("#shiftHidden").attr("data-nodeTankId","");                     //罐区的时候罐ID为空
                        $("#shiftHidden").attr("data-areaTankId",PageModule.nodeObj.id);  //设置隐藏罐区ID
                        $("#shiftHidden").attr("data-batchTankId",PageModule.nodeObj.id);    //罐区Id不为空，批量检尺使用
                    }else{
                        $("#shiftHidden").attr("data-nodeTankId",PageModule.nodeObj.id);    //罐区的时候罐ID为空
                        $("#shiftHidden").attr("data-areaTankId","");    //设置隐藏罐ID
                        $("#shiftHidden").attr("data-batchTankId",PageModule.nodeObj.pId);    //罐区Id不为空，批量检尺使用
                    }
                    PageModule.tabBtnclick();//tab切换选择不同的json配置

                };
                $("#searchBtn").unbind("click").on("click",function () {
                    Mom.setCookie("tankDate",$("#tankDate").val());
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
                                initDate:formData.data.initDate
                            };
                            // //调用接口：生成初始化数据
                            Api.ajaxJson(Const.mtrl+"/api/mv/TankChk/SaveTankInitialization",JSON.stringify(data),function(result) {
                                if (result.success == true) {
                                    Mom.layMsg("操作成功！");
                                    PageModule.tabBtnclick();
                                    // var wuliao = result.AA.wuliao||data.wuliao;
                                    //更新选中行中的物料数据
                                    top.layer.close(layerIdx);
                                    pageLoad();
                                    Mom.setCookie("tankDate",$("#tankDate").val());
                                }else{
                                    Mom.layAlert(result.message);
                                }
                            });
                        }
                    }}
                ],
            };
            $("#initialize").unbind("click").on("click",function () {
                var getparam=$('#TankChk').getGridParam('selrow');
                var ids = jqGridAll.jG_getCheckAllIds("#TankChk");
                var initialization =$('#TankChk').getCell(getparam,'initialization');
                var tankId =$('#TankChk').getCell(getparam,'tankId');
                var tankName = "槽/罐管理";
                var tankTime = $("#shiftHidden").attr("data-time");  //列表日期
                var tankShift = $("#shiftHidden").val(); //列表班次
                if(ids.length<=0){
                    Mom.layMsg("请先选择一个罐");
                }else{
                   if(ids.length>1){
                       Mom.layMsg("一次只可以选择一个罐");
                   }else if(tankTime == ""){
                       Mom.layMsg("请选择日期");
                   }else if(tankShift == ""){
                       Mom.layMsg("请选择班次");
                   }else if(initialization == "1"){
                       Mom.layMsg("该罐已经初始化");
                   }else{
                       Bus.openDialogCfg("槽/罐区-槽/罐初始化","../material/materialMove/initializeFrom.html?id="+tankId+"&tankName="+tankName+"&tankTime="+tankTime+"&tankShift="+tankShift,"372px",'270px',winOptons)
                   }
                }
            });
            /*
             * 新建检尺
             * tankOptions：配置数据采集，数据计算，确定方法，callback
             * */
            var tankOptions = {
                btnArr:[
                    {btn:'数据采集',fn:function (layerIdx,layero) {
                        var iframeWin = layero.find('iframe')[0].contentWindow;
                        var formData = iframeWin.getTankFormData();
                        if(formData){
                            var data = {
                                cltTime:formData.chkTime,
                                tagInfo:JSON.stringify([{"tagName":formData.chkInstVal,"timeStep":"3600"}])
                            };
                            Api.ajaxForm(Const.pi+"/api/PiApi/tagNearLocal",data,function(result) {
                                if (result.success) {
                                    Mom.layMsg(result.message);
                                    iframeWin.document.getElementById("chkInstVal").value = result.rows[0].val;
                                    Mom.setCookie("tankDate",$("#tankDate").val()); //数据采集成功后。保存cookie
                                }else{
                                    Mom.layMsg(result.message);
                                }
                            });
                        }
                    }},
                    {btn:'槽/罐量计量',fn:function (layerIdx,layero) {
                        var iframeWin = layero.find('iframe')[0].contentWindow;
                        var formData = iframeWin.getTankFormData();
                        var inputFrom = iframeWin.document.getElementById("inputForm");
                        if(formData){
                            var data = formData.data;
                            Api.ajaxJson(Const.mtrl+"/api/mv/TankChk/formula",JSON.stringify(data),function(result) {
                                if (result.success == true) {
                                    Mom.layMsg("计算成功");
                                    Validator.renderData(result.TankChk, inputFrom);
                                    Mom.setCookie("tankDate",$("#tankDate").val()); //数据采集成功后。保存cookie
                                }else{
                                    Mom.layAlert(result.message);
                                }
                            });
                        }
                    }},
                    {btn:'确定',fn:function (layerIdx,layero) {
                        var iframeWin = layero.find('iframe')[0].contentWindow;
                        var disable = iframeWin.document.getElementById("chkTime");
                        $(disable).removeAttr("disabled");
                        var formData = iframeWin.getTankFormData();
                        if(formData){
                            var data = formData.data;
                            //调用接口：生成初始化数据
                            Api.ajaxJson(Const.mtrl+"/api/mv/TankChk/save",JSON.stringify(data),function(result) {
                                if (result.success == true) {
                                    Mom.layMsg("保存成功！");
                                    top.layer.close(layerIdx);
                                    pageLoad();
                                    Mom.setCookie("tankDate",$("#tankDate").val()); //数据采集成功后。保存cookie
                                }else{
                                    Mom.layAlert(result.message);
                                }
                            });
                        }
                    }}
                ]
            };
            $("#construction").unbind("click").on("click",function () {
                var getparam=$('#TankChk').getGridParam('selrow');
                var id =$('#TankChk').getCell(getparam,'tankId');
                var initialization =$('#TankChk').getCell(getparam,'initialization');  //判断罐是否初始化
                var dataTime = $("#shiftHidden").attr("data-time");  //列表日期
                var dataShift = $("#shiftHidden").val(); //列表班次
                if(id == undefined){
                    Mom.layMsg("请先选择一条数据");
                }else if(initialization == "1"){
                    Bus.openDialogCfg("槽/罐检尺信息录入","../material/materialMove/informationEntryFrom.html?id="+id+"&dataTime="+dataTime+"&dataShift="+dataShift,'1128px','692px',tankOptions)
                }else if(initialization == "0"){
                    Mom.layMsg("请先对该罐进行初始化");
                }
            });
            /*
            * 批量检尺
            * */
            var bathOptions = {
                btnArr:[
                    {btn:'保存',fn:function (layerIdx,layero) {
                        var iframeWin = layero.find('iframe')[0].contentWindow;
                        var dataTime = iframeWin.document.getElementById("dataTime");  //获取时间
                        var authEnable = iframeWin.document.getElementById("authEnable");  //检尺类型
                        var formData = iframeWin.getTankFormDatas();                    //拿到数组
                        $(authEnable).removeAttr("disabled");
                        var index = authEnable.selectedIndex;
                        var chkTypeVal = authEnable.options[index].value;
                        if(formData){
                            if(chkTypeVal == ""){
                                Mom.layMsg("批量检尺类型不能为空");
                            }else if(dataTime.value == ""){
                                Mom.layMsg("批量检尺时间不能为空");
                            }else{
                                var data = {
                                    tankChkList:JSON.stringify(formData),
                                    chkType:chkTypeVal,
                                    chkdate:dataTime.value
                                };
                                Api.ajaxForm(Const.mtrl+"/api/mv/TankChk/SaveTankChkList",data,function(result) {
                                    if (result.success) {
                                        Mom.layMsg("保存成功!")
                                        Mom.setCookie("tankDate",$("#tankDate").val()); //数据采集成功后。保存cookie
                                    }else{
                                        Mom.layAlert(result.message);
                                    }
                                });
                            }
                        }
                    }},
                    {btn:'返回',fn:function (layerIdx,layero) {
                        var iframeWin = layero.find('iframe')[0].contentWindow;
                        iframeWin.backBtn();  //返回方法
                    }}
                ]
            };
            $("#batch").unbind("click").on("click",function () {
                var getparam=$('#TankChk').getGridParam('selrow');
                var initialization =$('#TankChk').getCell(getparam,'initialization');  //是否已经检尺
                var id = $("#shiftHidden").attr("data-batchTankId");                //传罐区ID
                var dataTime = $("#shiftHidden").attr("data-time");  //列表日期
                var dataShift = $("#shiftHidden").val();             //列表班次
                    Bus.openDialogCfg("批量检尺","../material/materialMove/batchMeasureForm.html?id="+id+"&dataTime="+dataTime+"&dataShift="+dataShift+"&newData="+$("#tankDate").val(),'934px','445px',bathOptions)
            });
            require(['ztree_my'], function (ZTree) {
                var treeObj;
                var ztree = new ZTree();
                Api.ajaxJson(Const.mtrl+'/api/mv/Tank/getTankTree',{},function(result){  //调取接口拿到ztree数据
                    if(result.success){
                        var ztreeSetting = {                                            //配置ztree参数
                            callback:{
                                onClick: function (e, treeId, node){
                                        loadOrgTree(node)
                                }
                            }
                        };
                        treeObj = ztree.loadData($("#zTree"),result.rows,false,ztreeSetting);  //渲染ztree
                        ztree.registerSearch(treeObj, $('#wait_searchText'), 'name');           //模糊查询
                        var nodes = treeObj.getNodes();
                        treeObj.selectNode(nodes[0]);                                          //默认选中第一个
                        loadOrgTree(nodes[0]);
                        pageLoad();
                    }
                });
                function loadOrgTree(nodes) {
                        PageModule.nodeObj = nodes;
                        /*
                        * 罐ID：nodeTankId
                        * 罐区ID：areaTankId:
                        * 如果是罐区PId为null，那就是罐区，否则就是罐
                        * */
                        if (nodes.pId == null) {                            //如果是罐区
                            $("#shiftHidden").attr("data-areaTankId", nodes.id);//设置隐藏罐区ID
                            $("#shiftHidden").attr("data-nodeTankId", "");
                        } else {
                            $("#shiftHidden").attr("data-nodeTankId", nodes.id);
                            $("#shiftHidden").attr("data-areaTankId", "");    //设置隐藏罐ID
                        }
                }
            });
            },
        tabBtnclick:function () {
            //tab切换
            $(".tab-nav li").removeClass("active");
            $(".tab-nav li").each(function (index,item) {
                $(item).unbind("click").on("click",function () {
                    $(this).addClass("active").siblings("li").removeClass("active");      //当前选中tab添加calss
                    $(".jqGridTable-item").eq(index).removeClass("hide").siblings(".jqGridTable-item").addClass("hide");  //设置table显示隐藏
                    $('.tab-btns li').eq(index).addClass('active').siblings().removeClass('active'); //tab后边的操作按钮显示隐藏
                    PageModule.getData(index);                                         //加载数据
                });
                if(index==0){
                    $(item).addClass("active");
                    $(".jqGridTable-item").eq(index).removeClass("hide").siblings(".jqGridTable-item").addClass("hide");
                    $('.tab-btns li').eq(index).addClass('active').siblings().removeClass('active'); //tab后边的操作按钮显示隐藏
                    PageModule.getData(index);
                }
            });
        },
        getData:function (index) {
            var data = {
                nodeTankId: $("#shiftHidden").attr("data-nodeTankId"), //罐id
                date:$("#tankDate").val(),                             //日期
                shift: $("#shiftHidden").val(),                        //班次
                areaTankId: $("#shiftHidden").attr("data-areaTankId")  //罐区id
            };
            if(index == 0 || index == 1){   //槽/罐检尺或者槽/罐移动请求接口
                Api.ajaxForm(Const.mtrl+"/api/mv/TankChk/TankList",data,function (result) {
                    if(result.success){
                        var dataTable = result.rows;
                        if(index == 0){
                            PageModule.createPrimary(index,dataTable);
                        }else if(index == 1){
                            PageModule.materialMoveInit(index,dataTable);
                        }
                    }else {
                        Mom.layAlert(result.message);
                    }
                })
            }else if(index == 2){     //封账提交
                PageModule.accountInit(index);
            }else if(index == 3){
                PageModule.sceneGraph();
            }
        },
        /*
        *index:是索引
        * dataTable是加载的数据
        * temPlate:是jqGrid基础配置的模板
        * */
        createPrimary:function (index,dataTable){
            var html = '<table id="TankChk" ></table>';
            $('#measure').find('div.jqGridTable').empty().append(html);
            var  settings1 = {   //主表配置
               colModel:[
                   {"name":"initialization","label":"初始化状态","align":"center","hidden":true},
                   {"name":"id","label":"id","align":"center","hidden":true},
                   {"name":"tankId","label":"tankId","align":"center","hidden":true},
                   {"name":"tankName","label":"槽/罐名称","align":"center"},
                   {"name":"chkTime","label":"检尺时间","align":"center"},
                   {"name":"chkType","label":"检尺类型","align":"center"},
                   {"name":"mtrlName","label":"物料","align":"center"},
                   {"name":"mtrlAlias","label":"别名","align":"center"},
                   {"name":"tankQutyStatus","label": "质量状态","align": "center"},
                   {"name":"tankConVal","label":"槽/罐量","align":"center"},
                   {"name": "chkMnulVal","label": "料位高度", "align": "center"},
                   {"name": "temprt", "label": "温度","align": "center"},
                   {"name": "oilDnst","label": "密度","align": "center"},
                   {"name": "gnrStddVol","label": "体积","align": "center"},
                   {"name": "rap", "label": "收付", "align": "center"},
                   {"name": "submissionState", "label": "提交状态 ", "align": "center"},
                   {"name": "temprtAtp", "label": "大气温度", "align": "center"},
                   {"name": "temprtCct", "label": "气相密度 ", "align": "center"},
                   {"name": "temprtVol", "label": "气相体积", "align": "center"},
                   {"name": "temprtWeight", "label": "气相质量", "align": "center"},
                   {"name": "temprtClm", "label": "气相温度", "align": "center"},
                   {"name": "waterRate", "label": "含水率", "align": "center"},
                   {"name": "waterContent", "label": "含水量", "align": "center"},
                   {"name": "chkModVal", "label": "修正料位高度", "align": "center"},
                   {"name": "gnrStddWeight", "label": "毛标准质量", "align": "center"},
                   {"name": "gnrStddVol", "label": "毛标准体积", "align": "center"},
                   {"name": "gnrMetVol", "label": "毛计量体积", "align": "center"}
               ],
               data:dataTable,
               multiselect: true
           };
           var settings2 = {
               colModel:[
                {"name": "id","label": "id","align": "center","hidden":true},
                {"name": "","label": "","align": "center",
                    formatter: function (cellvalue, options, rowObject) {
                        var thisTime = $("#shiftHidden").attr("data-time") + ' ' + $("#shiftHidden").val().split('-')[0];
                        var html = "";
                        if (rowObject.chkTime < thisTime) {
                            html = '';
                        } else {
                            return "<a class='delete' data-id='"+rowObject.id+"'>删除</a>";
                        }
                        return html;
                    }
                },
                {"name": "chkTime","label": "检尺时间", "align": "center"},
                {"name": "chkType","label": "检尺类型","align": "center"},
                {"name": "mtrlName","label": "物料","align": "center"},
                {"name": "mtrlAlias","label": "别名","align": "center"},
                {"name": "tankConVal","label": "槽/罐量","align": "center"},
                {"name": "chkMnulVal","label": "人工检尺高度","align": "center"},
                {"name": "temprt","label": "温度","align": "center"},
                {"name": "oilDnst","label": "密度","align": "center"},
                {"name": "chkInstVal","label": "仪表料位高度", "align": "center"},
                {"name": "watrHeight","label": "水尺高度","align": "center"},
                {"name": "waterVol","label": "水容积","align": "center"},
                {"name": "waterRate","label": "含水率","align": "center"},
                {"name": "vcfVal","label": "VCF","align": "center"},
                {"name": "pressure","label": "压力","align": "center"},
                {"name": "temprtClm","label": "气相温度","align": "center"},
                {"name": "temprtCct","label": "气相密度 ","align": "center"},
                {"name": "temprtVol","label": "气相体积","align": "center"},
                {"name": "temprtWeight","label": "气相质量","align": "center"},
                {"name": "gnrStddWeight","label": "毛标准质量","align": "center"},
                {"name": "gnrStddVol","label": "毛标准体积","align": "center"},
                {"name": "gnrMetVol","label": "毛计量体积","align": "center"},
                {"name": "temprtAtp","label": "大气温度", "align": "center"},
                {"name": "chkModVal","label": "修正料位高度", "align": "center"},
                {"name": "tempAdjVal","label": "温度修正值","align": "center"},
                {"name": "netoilMass","label": "净油质量","align": "center"},
                {"name": "acidFctr", "label": "酸度系数 ", "align": "center"},
                {"name": "alklFctr", "label": "浓碱系数", "align": "center"},
                {"name": "chkUser", "label": "检尺人", "align": "center"},
                {"name": "createTime", "label": "录入时间", "align": "center"},
                {"name": "submissionState", "label": "提交状态", "align": "center",
                    formatter: function (cellvalue, options, rowObject) {
                        var html = "";
                        if(rowObject.submissionState == "0"){
                            html = "未提交";
                        }else{
                            html = "已提交";
                        }
                        return html;
                    }
                },
                {"name": "remark", "label": "备注", "align": "center"},
                {"name": "maxSaleCont", "label": "最大安全容量", "align": "center"},
                {"name": "maxSaleVol", "label": "最大安全容积 ", "align": "center"},
                {"name": "minSaleCont", "label": "最小安全容量", "align": "center"},
                {"name": "minSaleVol", "label": "最小安全容积", "align": "center"},
                {"name": "netoilVol", "label": "净油容积 ", "align": "center"}
            ]
           };     //子表配置
           var config =     {
               url:Const.mtrl+"/api/mv/TankChk/findTankChk",
               dataParams: {
                   date: $("#shiftHidden").attr("data-time"), /**/
                   shift: $("#shiftHidden").val()/**/
               },
               otherId: 'tankId',
               contentType: 'Form'
           };
                var subtable = [];
                jqGridAll.jG_jqGridTableLevel("#TankChk",settings1,settings2,config,subtable,clickBtn);
            jqGridAll.jG_Resize('#TankChk', '.TankChk');
            $("#measure .jqGridTable-info").removeClass("hide");
                $('.jqGridTable-num').eq(index).text(dataTable.length);
                function clickBtn() {
                    $(".delete").unbind("click").on("click",function (item) {
                       var id =  $(this).attr("data-id");
                        var item = $(this);
                       Api.ajaxForm(Const.mtrl+"/api/mv/TankChk/deleteTankChk/"+id,{},function (result) {
                          Mom.layMsg("删除成功");
                           item.parent("td").parent("tr").remove();
                       });
                    })
                }
        },
        //初始化
        initializeFrom:function () {
            var initTime = Mom.getUrlParam("tankTime");
            var initshift = Mom.getUrlParam("tankShift");
            var id = Mom.getUrlParam("id");  //列表罐ID
            var begTime = initTime+" "+initshift.slice(0,8);  //日期+班次开始时间
            var overTime = initTime+" "+initshift.slice(9,17);//日期+班次结束时间
            $("#initDate").val(begTime);
            $("#tankId").val(id);//设置隐藏的罐ID;
            $("#initDate").change(function () {
                if($(this).val()<begTime){
                    Mom.layMsg("初始化时间不能小于班次开始时间");
                    $("#initDate").val('')
                }else if($(this).val()>overTime){
                    Mom.layMsg("初始化时间不能大于班次结束时间");
                    $("#initDate").val('');
                }
            });
            Api.ajaxForm(Const.mtrl+"/api/mv/TankChk/tankInitialization",{nodeTankId:id},function(result){
                if(result.success){
                    var options = [];
                    Validator.renderData(result.nodeTank, '#inputForm');
                    for(var i=0;i<result.mtrlList.length;i++){
                        options.push({'value':result.mtrlList[i].mtrlId, 'label':result.mtrlList[i].mtrl.mtrlName});
                    };
                    Bus.appendOptions($('#mtrlId'), options);
                }else{
                    Mom.layAlert(result.message);
                }
            });
            window.getFormData = function(){
                var formObj = $('#inputForm');
                if(!Validator.valid(formObj,1.3)){
                    return;
                }
                return {
                    data: formObj.serializeJSON()
                }
            };
            //动态设置初始化时间限制范围
            $("#initDate").on("click",function () {
                WdatePicker({dateFmt:'yyyy-MM-dd HH:mm:ss',minDate:begTime,maxDate:overTime});
            })
        },
        loadClass:function () {
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
                }else{
                    Mom.layMsg(result.message);
                }
            });
        },
        //新建检尺
        createTankInit:function () {
            var dataTime = Mom.getUrlParam("dataTime");
            var dataShift = Mom.getUrlParam("dataShift");
            //检尺类型
            var id = Mom.getUrlParam("id");
            var dataTime = Mom.getUrlParam("dataTime");
            var dataShift = Mom.getUrlParam("dataShift");
            /**贾旭光添加参数*/
            var chkType = Mom.getUrlParam("chkType");
            var data = {
                tankId: id,
                chkTime: dataTime + " " + dataShift.slice(0, 8),
                chkType: ''
            };
            if(chkType!=null){
                data.chkType=chkType
            }
            //初始化回显
            Api.ajaxJson(Const.mtrl+"/api/mv/TankChk/form",JSON.stringify(data),function(result){
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
            window.getTankFormData = function (getData) {
                var formObj = $('#inputForm');
                if (getData == true) {
                    if (!Validator.valid(formObj, 1.3)) {
                        return;
                    }
                    var obj = {
                        tankVal: $('#tankConVal').val(),
                        data: formObj.serializeJSON(),
                        url: formObj.attr('action')
                    };
                    return obj;
                }
                if (!Validator.valid(formObj, 1.3)) {
                    return;
                }
                if ($("#chkType option:selected").val() == "") {
                    Mom.layMsg("请选择检尺类型")
                } else {
                    return {
                        data: formObj.serializeJSON()
                    }
                }
            };

            $('.table-top').click(function(){
                if(!$('.table1').hasClass('hide')){
                    $('.table1').addClass('hide');
                    $(this).parent().css('border-bottom','1px solid #DCDCDC');
                }else{
                    $('.table1').removeClass('hide');
                    $(this).parent().css('border-bottom','none');
                }
            });
            $('.table-center').click(function(){
                if(!$('.table2').hasClass('hide')){
                    $('.table2').addClass('hide');
                    $(this).parent().css('border-bottom','1px solid #DCDCDC');
                }else{
                    $('.table2').removeClass('hide');
                    $(this).parent().css('border-bottom','none');
                }
            });
            $('.table-bottom').click(function(){
                if(!$('.table3').hasClass('hide')){
                    $('.table3').addClass('hide');
                    $(this).parent().css('border-bottom','1px solid #DCDCDC');
                }else{
                    $('.table3').removeClass('hide');
                    $(this).parent().css('border-bottom','none');
                }
            });
        },
        //批量检尺
        batchMeasureInit:function (areaTankId,dataTime,dataShift) {
            var areaTankId = Mom.getUrlParam("id")==undefined?areaTankId:Mom.getUrlParam("id");   //获取罐区ID;
            var dataTime = Mom.getUrlParam("dataTime")==undefined?dataTime:Mom.getUrlParam("dataTime");
            var dataShift = Mom.getUrlParam("dataShift")==undefined?dataShift:Mom.getUrlParam("dataShift");
            var data = {
                nodeTankId:"",  //罐ID
                rap:"",        //是否动罐;动罐为move，全部为空
                areaTankId:areaTankId   //罐区ID
            };
            var tableArr = [];
            var createBol = false;
            var newBol = true;
            Api.ajaxForm(Const.mtrl+"/api/mv/TankChk/newTanChkkList",data,function (result) {
                if(result.success){
                    tableArr =  result.chkList;
                    var html =' <option value="" >--请选择--</option>'
                    $("#authEnable").empty().append(html);
                    Bus.appendOptionsValue('#authEnable',result.tankChkTypeList,'value','label');
                    $("#authEnable").change(function () {
                        PageModule.dataTime($(this).val(),dataTime,dataShift,"#dataTime");
                    });
                    PageModule.createBatch(tableArr,"0");  //创建Table
                }else{
                    Mom.layMsg(result.message);
                }
            });
            // 返回按钮使用
            window.backBtn = function () {
                $("#btn-add").removeAttr("disabled");
                $("#authEnable").removeAttr("disabled");
                $("#dataTime").removeAttr("readonly");
                $("#btn-batch").attr("disabled",true);
                $("#btn-total").attr("disabled",true);
                newBol = true;
                var html = '<table id="TankSeal" ></table>';
                $('#sealingAccount').find('div.jqGridTable').empty().append(html);
                PageModule.createBatch(tableArr,"0");
            };
            //只可以点击新建按钮，点击结束后，移除数据采集和计算的不可点击
            $("#btn-add").unbind("click").on("click",function () {
                if(newBol){
                    if($("#authEnable option:selected").val() == ""){
                        Mom.layMsg("请选择检尺类型");
                    }else if($("#dataTime").val() == ""){
                        Mom.layMsg("请选择检尺时间");
                    }else{
                        createBol = true;
                        var modelArr = [];
                        var ids = jqGridAll.jG_getCheckAllIds("#TankChk");
                        for (var i=0;i<tableArr.length;i++){
                            for(var k=0;k<ids.length;k++){
                                if(tableArr[i].id == ids[k]){
                                    modelArr.push(tableArr[i]);
                                }
                            }
                        }
                        if(tableArr.length>0){
                            $("#btn-batch").attr("disabled",false);
                            $("#btn-total").attr("disabled",false);
                            PageModule.createBatch(modelArr,"1");
                            $("#authEnable").attr("disabled",true);
                            $("#dataTime").attr("readonly",true);
                            $("#btn-add").attr("disabled",true);
                            newBol = false;
                        }else{
                            Mom.layMsg("请选择要进行检尺的罐");
                        }
                    }
                }else{
                    Mom.layMsg("已经新建过");
                }
            });
            //侦听批量采集时间
            $("#btn-batch").unbind("click").on("click",function () {
                if(createBol){
                    //获取到点位号，以及时间重新加载table；
                    $('input[type=text].editable').each(function (i, item) {
                        $(this).parents('td').text($(this).val());
                        $(this).remove();
                    });
                    var arrAll = $('#TankChk').jqGrid('getRowData');
                    var dataArr = [];
                    for(var i=0;i<arrAll.length;i++){
                        var tagInfoObj = {};
                        tagInfoObj.tagName = arrAll[i].temprt;
                        tagInfoObj.timeStep = "3600";
                        dataArr.push(tagInfoObj);
                    }
                    var data = {
                        cltTime:$("#dataTime").val(),
                        tagInfo:JSON.stringify(dataArr)
                    };
                    Api.ajaxForm(Const.pi+"/api/PiApi/tagNearLocal",data,function(result) {
                        //调用createBatch方法重新渲染table
                        if(result.success){
                            Mom.layMsg("采集成功");
                            for(var i=0;i<result.rows.length;i++){
                                arrAll[i].temprt = result.rows[i].val;
                                // Mom.setCookie("tankDate",newDataTime); //数据采集成功后。保存cookie
                            };
                            PageModule.createBatch(arrAll)
                        }else{
                            Mom.layMsg(result.message);
                        }
                    })
                }else{
                    Mom.layMsg("请先新建");
                }
            });
            //侦听批量计算按钮
            $("#btn-total").unbind("click").on("click",function () {
                if(createBol){
                    //获取到要计算的参数，然后计算;
                    $('input[type=text].editable').each(function (i, item) {
                        $(this).parents('td').text($(this).val());
                        $(this).remove()
                    });
                    var dataTable  = $("#TankChk").jqGrid("getRowData");
                    var data = {
                        tankChkList:JSON.stringify(dataTable)
                    };
                    Api.ajaxForm(Const.mtrl+"/api/mv/TankChk/formulaBeach",data,function (result) {
                        if(result.success){
                            Mom.layMsg("计算成功");
                            PageModule.createBatch(result.rows,"1");
                            Mom.setCookie("tankDate",newDataTime); //数据采集成功后。保存cookie
                        }else{
                            Mom.layMsg(result.message);
                        }
                    })
                }else{
                    Mom.layMsg("请先新建")
                }
            })
            window.getTankFormDatas = function () {
                $("#authEnable").removeAttr("disabled");
                $('#TankChk input[type=text]').each(function (i, item) {
                    $(this).parents('td').text($(this).val());
                    $(this).remove();
                });
                $('#TankChk span').each(function (i, item) {
                    $(this).parents('td').text($(this).val());
                    $(this).remove();
                });
                var data = $("#TankChk").jqGrid('getRowData');
                return data;
            };
            //改变检尺类型检尺时间也改变
            $("#authEnable").change(function () {
                PageModule.dataTime($(this).val(),dataTime,dataShift,"#chkTime");
            });
        },
        createBatch:function (tableArr,status) {
            //status默认加载列表不可编辑：0
            var html = '<table id="TankChk" ></table>';
            $('#tableBox').find('div.jqGridTable').empty().append(html);
            var options = [
                {"name":"id","label":"id","align":"center","hidden":true},
                {"name":"tankId","label":"tankId","align":"center","hidden":true},
                {"name":"mtrlId","label":"mtrlId","align":"center","hidden":true},
                {"name":"tankName","label":"槽/罐名称","align":"center"},
                {"name":"mtrlName","label":"物料","align":"center"},
                {"name":"mtrlAlias","label":"物料别名","align":"center"},
                {"name":"tankConVal","label":"罐确认量","align":"center","editable": true},
                {"name":"tankConVal","label":"计算量","align":"center"},
                {"name":"chkTime","label":"检尺时间","align":"center"},
                {"name":"chkMnulVal","label":"人工检尺高度","align":"center","editable": true},
                {"name":"temprt","label":"温度","align":"center","editable": true},
                {"name":"oilDnst","label":"密度","align":"center","editable": true},
                {"name":"rap","label":"收付","align":"center",
                    formatter: function (cellvalue, options, rowObject) {
                       if(rowObject.rap == ""){
                          return "<span class='allTank'>"+rowObject.rap+"</span>";
                       }else{
                           return "<span class='moveTank'>"+rowObject.rap+"</span>";
                       }
                    }
                },
                {"name":"submissionState","label":"提交状态","align":"center"},
                {"name":"chkInstVal","label":"仪表检尺高度","align":"center"},
                {"name":"offsetVal","label":"偏移量","align":"center"},
                {"name":"watrHeight","label":"水尺高度","align":"center","editable": true},
                {"name":"waterVol","label":"水容积","align":"center"},
                {"name":"waterRate","label":"含水率","align":"center"},
                {"name":"vcfVal","label":"VCF","align":"center"},
                {"name":"pressure","label":"压力","align":"center","editable": true},
                {"name":"temprtClm","label":"气相温度","align":"center","editable": true},
                {"name":"emprtCct","label":"气相密度","align":"center"},
                {"name":"temprtVol","label":"气相体积","align":"center"},
                {"name":"temprtWeight","label":"气相质量","align":"center"},
                {"name":"gnrStddWeight","label":"毛标准质量","align":"center"},
                {"name":"gnrMetVol","label":"毛计量体积","align":"center"},
                {"name":"temprtAtp","label":"大气温度","align":"center","editable": true},
                {"name":"chkModVal","label":"修正料位高度","align":"center"},
                {"name":"tempAdjVal","label":"温度修正值","align":"center"},
                {"name":"fixprsrAdjVal","label":"静压修正","align":"center"},
                {"name":"acidFctr","label":"酸碱系数","align":"center"},
                {"name":"medCct","label":"介质浓度","align":"center","editable": true},
                {"name":"chkType","label":"检尺人ID","align":"center"},
                {"name":"createTIme","label":"录入时间","align":"center"},
                {"name":"netoilVol","label":"净油容积量","align":"center"},
                {"name":"remark","label":"备注","align":"center"},
                {"name":"maxSaleCont","label":"最大安全容量","align":"center"},
                {"name":"maxSaleVol","label":"最大安全容积","align":"center"},
                {"name":"minSaleCont","label":"最小安全容量","align":"center"},
                {"name":"minSaleVol","label":"最小安全容积","align":"center"},
            ];
            var editRowFn;
            var multiselect;
            if(status == "0"){
                editRowFn="";  //设置不可编辑
                 multiselect = {
                    multiselect:true,
                     shrinkToFit:false,
                     autoScroll: true,
                };
            }else{
                editRowFn=jqGridAll.jG_editRowFn("#TankChk",'',true);  //设置编辑
                multiselect = {
                    multiselect:false,
                    shrinkToFit:false,
                    autoScroll: true,
                };
            };
            var len = tableArr.length;
            var gridConfig = jqGridAll.jG_config('',[],options,len);
            var configData  = jqGridAll.jG_configData(tableArr);  //创建table的数据
            $("#TankChk").jqGrid($.extend(configData,gridConfig,multiselect,editRowFn));
            jqGridAll.jG_Resize("#TankChk",".jqGridTable");
            if(status == "0"){
                $(".radios").each(function (index, item) {
                    if ($(this).is(":checked")) {
                        if($(this).attr("value") == "move"){
                            $("#TankChk tr td .moveTank").each(function () {
                                $(this).parent("td").parent("tr").find("td").eq(0).children("input[type='checkbox']").trigger("click");
                            });
                        }else{
                            $("#TankChk tr td .allTank").each(function () {
                                $(this).parent("td").parent("tr").find("td").eq(0).children("input[type='checkbox']").trigger("click");
                            });
                        }
                    }
                });
            }
            $("label").on("ifClicked",function(){
                //选择动罐的时候遍历返回的数据，将是动罐的id push到一个数组中
                //选择动罐后。遍历tr的id，之后比对push数组的id和tr的id，如果相同就勾选
                //moveArr:动罐ID数组
                if($(this).find(".i-checks").val() == "move"){   //动罐
                    if($("#TankChk tr td .moveTank").length>0){
                        $("#TankChk tr td .allTank").each(function () {
                            $(this).parent("td").parent("tr").find("td").eq(0).children("input[type='checkbox']").trigger("click");
                        });
                    }else{
                        $("#TankChk input[type='checkbox']").each(function (index,item) {
                            if($(item).is(":checked")){
                                $(item).trigger("click");
                            }
                        });
                    }
                }else if($(this).find(".i-checks").val() == ""){   //全部
                    $("#TankChk input[type='checkbox']").each(function (index,item) {
                        if($(item).is(":checked")){
                            $(item).unbind("click");
                        }else{
                            $(item).trigger("click");
                        }
                    });
                }

            });
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
                $(inputItem).attr("readonly",true);
            }else if(metaType== "SHIFT_INN" || metaType == "MOV_CHK" || metaType=="STOCKTAK"){
                $(inputItem).attr("readonly",false);
                //设置时间再班次时间内
                var begTime = initTime+" "+startTime.slice(0,8);
                var overTime = initTime+" "+startTime.slice(9,17);
                $(inputItem).val(begTime);
                $(inputItem).on("click",function () {
                    WdatePicker({maxDate:overTime,minDate:begTime,dateFmt:'yyyy-MM-dd HH:mm:ss'})
                });
            }
        },
        /**************物料移动*********************************/
            materialMoveInit: function (index,dataTable) {
            var html = '<table id="TankMtrlMove" ></table>';
            $('#matrlMove').find('div.jqGridTable').empty().append(html);
            var temPlate = [];
            PageModule.renderPotTable(index,dataTable);
        },
            //渲染表数据
            renderPotTable: function (index,result) {
                    var optionsPot = {
                        colModel: [
                            {
                                "name": "id",
                                "label": "id",
                                "align": "center",
                                "hidden": true
                            },
                            {
                                "name": "tankId",
                                "label": "tankId",
                                "align": "center",
                                "hidden": true
                            },
                            {
                                "name": "tankName",
                                "label": "槽/罐名称",
                                "align": "center"
                            },
                            {
                                "name": "chkTime",
                                "label": "检尺时间",
                                "align": "center"
                            },
                            {
                                "name": "chkType",
                                "label": "检尺类型",
                                "align": "center"
                            },
                            {
                                "name": "mtrlName",
                                "label": "物料",
                                "align": "center"
                            },
                            {
                                "name": "mtrlAlias",
                                "label": "别名",
                                "align": "center"
                            },
                            {
                                "name": "tankQutyStatus",
                                "label": "质量状态",
                                "align": "center"
                            },
                            {
                                "name": "tankConVal",
                                "label": "槽/罐量",
                                "align": "center"
                            },
                            {
                                "name": "chkMnulVal",
                                "label": "槽/罐高",
                                "align": "center"
                            },
                            {
                                "name": "temprt",
                                "label": "温度",
                                "align": "center"
                            },
                            {
                                "name": "oilDnst",
                                "label": "密度",
                                "align": "center"
                            },
                            {
                                "name": "liquidSolidMass",
                                "label": "液/固质量",
                                "align": "center"
                            },
                            {
                                "name": "rap",
                                "label": "收付",
                                "align": "center"
                            },
                            {
                                "name": "submissionState",
                                "label": "提交状态",
                                "align": "center",
                                formatter: function (cellvalue, options, rowObject) {
                                    return cellvalue==0?'未提交':'已提交';


                                }
                            },
                            {
                                "name": "temprtCct",
                                "label": "气相密度",
                                "align": "center"
                            },
                            {
                                "name": "temprtVol",
                                "label": "气相体积",
                                "align": "center"
                            },
                            {
                                "name": "temprtWeight",
                                "label": "气相质量",
                                "align": "center"
                            },
                            {
                                "name": "temprtClm",
                                "label": "气相温度",
                                "align": "center"
                            },
                            {
                                "name": "waterContent",
                                "label": "含水量",
                                "align": "center"
                            },
                            {
                                "name": "gnrMetVol",
                                "label": "毛计量体积",
                                "align": "center"
                            }
                        ],
                        data: result,
                        multiselect: true
                        // multiboxonly:true
                    };
                    var optionsMMove = {
                        colModel: [
                            {"name": "id", "label": "id", "align": "center", "hidden": true},
                            {"name": "delete", "label": " ", "align": "center","width":"44px","classes":'delete',
                                formatter: function (cellvalue, options, rowObject) {
                                    var thisTime = $("#shiftHidden").attr("data-time") + ' ' + $("#shiftHidden").val().split('-')[0];
                                    if (rowObject.begMvDate < thisTime) {
                                        html = '';
                                    } else {
                                        var html = '<a href=" " class="delete">删除</a>';
                                    }
                                    return html;
                                }

                            },
                            {"name": "moveType", "label": "类型", "align": "center", "hidden": true},
                            {"name": "mtrlMvOprtTypeLabel", "label": "移动类型", "align": "center"},
                            {
                                "name": "nodename",
                                "label": "付方节点",
                                "align": "center",
                                formatter: function (cellvalue, options, rowObject) {
                                    return rowObject.dlvNode.nodename;
                                }
                            },
                            {
                                "name": "getNode",
                                "label": "收方节点",
                                "align": "center",
                                formatter: function (cellvalue, options, rowObject) {
                                    return rowObject.rcvNode.nodename;
                                }
                            },
                            {"name": "begMvDate", "label": "收付开始时间", "align": "center"},
                            {"name": "endMvDate", "label": "收付结束时间", "align": "center"},
                            {
                                "name": "dlvMtrl",
                                "label": "付方物料",
                                "align": "center",
                                formatter: function (cellvalue, options, rowObject) {
                                    return rowObject.dlvMtrl.mtrlName;
                                }
                            },
                            {
                                "name": "rcvMtrl",
                                "label": "收方物料",
                                "align": "center",
                                formatter: function (cellvalue, options, rowObject) {
                                    return rowObject.rcvMtrl.mtrlName;
                                }
                            },
                            {"name": "dlvStatus", "label": "付方提交状态", "align": "center"}, /**/
                            {"name": "rcvStatus", "label": "收方提交状态", "align": "center"}, /**/
                            {"name": "dlvPreChkCont", "label": "付方前检尺", "align": "center"},
                            {"name": "dlvAftChkCont", "label": "付方后检尺", "align": "center"},
                            {"name": "rcvPreChkCont", "label": "收方前检尺", "align": "center"},
                            {"name": "rcvAftChkCont", "label": "收方后检尺", "align": "center"},
                            {"name": "createName", "label": "创建人", "align": "center"},
                            {"name": "createDate", "label": "创建时间", "align": "center"},
                            {"name": "clsBy", "label": "关闭人", "align": "center"},
                            {"name": "clsDate", "label": "关闭时间", "align": "center"}
                        ],
                        multiselect: true,
                        gridComplete: function () {
                            $(".ui-jqgrid-htable").find('input[type="checkbox"]').hide();
                        }
                    };

                    var config = {
                        url: Const.mtrl + '/api/mv/TankMtrlMove/list/',
                        dataParams: {
                            date: $("#shiftHidden").attr("data-time"), /**/
                            shift: $("#shiftHidden").val()/**/
                        },
                        otherId: 'tankId',
                        contentType: 'Form',
                        urlType: true
                    };
                    var MMovesubTable = [];
                    var subTableId, tankId;
                //拿到子表id
                    jqGridAll.jG_jqGridTableLevel('#TankMtrlMove', optionsPot, optionsMMove, config, MMovesubTable, function (res, otherId, resSub) {
                        subTableId = res;
                        tankId = otherId.id;
                        //编辑
                        var subtr = '.ui-subgrid .subgrid-data table tr.ui-widget-content';
                        $(subtr).each(function (i, o) {
                            $(this).on('dblclick', function () {
                                var thisId=$(this).attr('id');
                                var moveType = $(this).find('td').eq(3).text();
                                if (moveType != '罐付罐') {
                                    Mom.layAlert('请选择罐付罐类型物料移动数据，其他物料移动数据无法进行编辑')
                                } else {
                                    var potDate = $("#tankDate").val();
                                    var classes = $("#shiftHidden").val();
                                    //必须写死 因为只能拿到罐区id 所以只能从表里拿到对应表的父级的上一个tr 才能拿到罐id
                                    var tankId = $(this).parents('tr').prev().find('td').eq(3).attr('title');
                                    var tankUpdata={
                                        btnArr: [
                                            {
                                                btn: '确定',fn: function (layerIdx, layero) {
                                                //先还原所有的input框的disabled属性
                                                var iframeWin = layero.find('iframe')[0].contentWindow;
                                                iframeWin.removeAttr();
                                                iframeWin.Submit('', 'updata', layerIdx, PageModule.materialMoveInit);
                                            }
                                            }
                                        ]
                                    };
                                    Bus.openDialogCfg('编辑物料移动信息', 'material/materialMove/addMove.html?potDate=' + potDate + '&classes=' + classes + '&tankId=' + tankId+'&thisId='+thisId, '755px', '450px',tankUpdata)
                                }
                            })
                        });
                        //删除按钮
                        $('td.delete').each(function (i,o) {
                            $(this).unbind('click').on('click',function () {
                            })
                        })
                    });
                jqGridAll.jG_Resize('#TankMtrlMove', '.TankMtrlMove');
                $("#matrlMove .jqGridTable-info").removeClass("hide");
                    $('.jqGridTable-num').eq(index).text(result.length);
                    //添加按钮
                    $('#btn-add').unbind('click').on('click', function () {
                        var arr = jqGridAll.jG_getCheckAllIds('#TankMtrlMove');
                        var arrSubOne = [];
                        $(subTableId).each(function (i, item) {
                            var subArr = jqGridAll.jG_getCheckAllIds('#' + item);
                            $(subArr).each(function (a, aitem) {
                                //拿到被选中的子表id
                                arrSubOne.push(aitem);
                            })
                        });
                        if (arr.length > 1) {
                            Mom.layAlert('只能选择一个槽/罐进行新建物料移动')
                        } else if (arr.length == 0 || arrSubOne.length != 0) {
                            Mom.layAlert('请选择一个槽/罐进行新建物料移动')
                        } else {
                            /**列表页主表少俩参数  固/液质量 提交状态*/
                            var getparam = $('#TankMtrlMove').getGridParam('selrow');
                            var thisStatu = $('#TankMtrlMove').getCell(getparam, 'submissionState');
                            if (thisStatu == '1') {
                                Mom.layAlert('已提交的槽/罐信息无法进行物料移动')
                            } else {
                                var tankId = $('#TankMtrlMove').getCell(getparam, 'tankId');
                                var potDate = $("#shiftHidden").attr("data-time");
                                var classes = $("#shiftHidden").val();
                                /*递交参数*/
                                var tankOptions = {
                                    btnArr: [
                                        {
                                            btn: '确定', fn: function (layerIdx, layero) {
                                            //先还原所有的input框的disabled属性
                                            var iframeWin = layero.find('iframe')[0].contentWindow;
                                            iframeWin.Submit('submit', 'add', layerIdx, PageModule.materialMoveInit);
                                        }
                                        }
                                    ]
                                };
                                Bus.openDialogCfg('新建物料移动信息', 'material/materialMove/addMove.html?potId=' + tankId + '&potDate=' + potDate + '&classes=' +classes, '755px', '450px', tankOptions)
                            }

                        }
                    });
                    //关闭按钮
                    $('#btn-close').unbind('click').on('click', function () {
                        var arr = jqGridAll.jG_getCheckAllIds('#TankMtrlMove');
                        var arrSubOne = [];
                        //拿到所有展开的主表id
                        $(subTableId).each(function (i, item) {
                            var subArr = jqGridAll.jG_getCheckAllIds('#' + item);
                            $(subArr).each(function (a, aitem) {
                                //拿到被选中的子表id
                                arrSubOne.push(aitem);
                            })
                        });
                        if (arrSubOne.length > 1 || arrSubOne.length < 1 || arr.length > 0) {
                            Mom.layAlert('请选择一项物料移动数据进行关闭')
                        } else {
                            var tableId = $('#' + arrSubOne[0]).parent('tbody').parent('table').attr('id');
                            var getparam = $('#' + tableId).getGridParam('selrow');
                            var thisdata = $('#' + tableId).getCell(getparam, 'clsDate');
                            var startTime =$('#' + tableId).getCell(getparam, 'begMvDate');
                            if (thisdata != '') {
                                Mom.layAlert('已关闭的数据无法再次进行关闭')
                            } else {
                                //url传子表id
                                var potDate = $("#shiftHidden").attr("data-time");
                                var classes = $("#shiftHidden").val();
                                $('#id').val(arrSubOne[0]);
                                //后端要求关闭人传个东西才能判断
                                /*递交参数*/
                                var tankOptions = {
                                    btnArr: [
                                        {
                                            btn: '确定', fn: function (layerIdx, layero) {
                                            //先还原所有的input框的disabled属性
                                            var iframeWin = layero.find('iframe')[0].contentWindow;
                                            iframeWin.removeAttr();
                                            iframeWin.Submit('', 'close', layerIdx, PageModule.materialMoveInit);
                                        }
                                        }
                                    ]
                                };
                                Bus.openDialogCfg('关闭物料移动', 'material/materialMove/addMove.html?moveId=' + arrSubOne[0] + '&potDate=' + potDate + '&classes=' + classes + '&tankId=' + tankId , '755px', '450px', tankOptions)
                            }
                        }
                    });
            },
            //移动弹出页
            addMoveInit: function () {
                var potId = Mom.getUrlParam('potId');
                var moveId = Mom.getUrlParam('moveId');
                var moveDate = Mom.getUrlParam('potDate');
                var classes = Mom.getUrlParam('classes');
                var moveType = Mom.getUrlParam('moveType');
                var tankId = Mom.getUrlParam('tankId');
                //关闭用的 开始时间
                var startTime = Mom.getUrlParam('startTime');
                //编辑用的移动id
                var editMoveId=Mom.getUrlParam('thisId');
                //新增
                if (moveId == null && potId != null) {
                    $('#tankId').val(potId);
                    //时间选择插件
                    var startT = classes.split('-');
                    var startTime = startT[0].toString();
                    var endTime = startT[1].toString();
                    var dlvNodeId, dlvMtrlId, val, valUseTopo, isFlag;

                    /**第一次渲染*/
                    attrInit('table tr td', '#operationType,#oppositeNode,#oppositeMaterial,#startTime', '#startTime');
                    //初始化请求
                    nodeToMtrl();
                    openVal('.dlvVal', 'add','.rcvVal',potId);
                    $('#operationType').on('change', function () {
                        typeFun();
                        $('div.icheckbox_flat-green').addClass('checked')
                    });
                    $('#useTopo').on('ifChanged',function () {
                        typeFun();
                    });
                    //类型判断方法
                    function typeFun() {
                        var moveTypeS = $('#operationType').val();
                        $('#ownQuantity,#oppositeQuantity').val('');
                        //罐付罐
                        if (moveTypeS == 'TANK_TO_TANK') {
                            //初始化是否可编辑项
                            attrInit('table tr td', '#operationType,input:checkbox,#oppositeNode,#startTime', '#startTime');
                            nodechange();
                            /*本方量对方量 检尺回显方法*/
                            openVal('.dlvVal', 'add', '', potId);
                            openVal('.rcvVal', 'add', '', potId);
                        }
                        //罐收付进出厂点
                        if (moveTypeS == 'TANK_RETO_IOF' || moveTypeS == 'TANK_TO_IOF') {
                            //初始化是否可编辑项

                            attrInit('table tr td', '#operationType,input:checkbox,#oppositeNode,#oppositeMaterial,#startTime', '#startTime');
                            if (isFlag == false) {
                                nodechange();
                            }
                            openVal('.dlvVal', 'add', '.rcvVal', potId);
                            isFlag = false;

                        }
                        //罐收付料线
                        if (moveTypeS == 'TANK_RETO_LINE' || moveTypeS == 'TANK_TO_LINE') {
                            attrInit('table tr td', '#operationType,input:checkbox,#oppositeNode,#startTime', '#startTime');
                            nodechange();
                            openVal('.dlvVal', 'add', '.rcvVal', potId);
                        }
                        //特殊操作项
                        //槽罐改名和退库编辑项相同
                        if (moveTypeS == 'TANK_MOD' || moveTypeS == 'TANK_RETO_STOREHOUSE') {
                            $('table tr td:nth-of-type(4)').each(function (i, item) {
                                $(this).find('input').val('');
                                $(this).find('select').val('');
                            });
                            attrInit('table tr td', '#operationType,#ownMaterials,#ownMaterial,#startTime', '#startTime');
                            nodechange(true);
                            openVal('.dlvVal', 'add', '.rcvVal', potId);
                        }
                        //交库||复尺
                        if (moveTypeS == 'TANK_TO_STOREHOUSE' || moveTypeS == 'TANK_RE_CHK') {
                            $('table tr td:nth-of-type(4)').each(function (i, item) {
                                $(this).find('input').val('');
                                $(this).find('select').val('');
                            });
                            if (moveTypeS == 'TANK_RE_CHK') {
                                $('#ownMaterial').attr('disabled', 'disabled');
                                nodechange();
                                openVal('.dlvVal', 'add', '.rcvVal', potId);
                            } else {

                                nodechange(true);
                                var html = '<select  id="ownMaterials" name="dlvMtrl.mtrlName" class="form-control"></select>';
                                $('#ownMaterial').parents('td').append(html);
                                $('#ownMaterial').remove();
                                attrInit('table tr td', '#operationType,#ownMaterial,#ownMaterials,#startTime', false);
                                openVal('.dlvVal', 'add', '.rcvVal', potId);
                            }
                        }
                    }
                }
                //关闭
                else if (potId == null && moveId != null) {
                    // /*只有罐付罐可以编辑 并且只有对方量可以编辑 点击确定拿到对方量*/
                    Api.ajaxJson(Const.mtrl + '/api/mv/TankMtrlMove/view/' + moveId, {}, function (result) {
                        if (result.success) {
                            var nodehtml = '<input type="text" disabled id="rcvNodeName" name="rcvNode.nodename" class="form-control">';
                            var mtrlHtml = '<input type="text" disabled id="rcvMtrlName" name="rcvMtrl.mtrlName" class="form-control">';
                            var typeHtml = '<input type="text" disabled id="operationType" name="mtrlMvOprtTypeLabel" class="form-control">' +
                                '<input type="hidden" id="operationTypes" name="mtrlMvOprtType" class="form-control">';
                            $('#oppositeNode').parents('td').append(nodehtml);
                            $('#oppositeNode').remove();
                            $('#oppositeMaterial').parents('td').append(mtrlHtml);
                            $('#oppositeMaterial').remove();
                            $('#operationType').parents('td').append(typeHtml);
                            $('#operationType').remove();
                            Validator.renderData(result.NodeMtrlMove, '#inputForm');
                            var moveTypeClose = $('#operationTypes').val();
                            //罐付罐
                            attrInit('table tr td', '#endTime', '#endTime');
                            if (moveTypeClose == 'TANK_TO_TANK') {
                                $('#oppositeQuantity').removeAttr('disabled');
                                openVal('.dlvVal', 'close', '', tankId);
                                openVal('.rcvVal', 'close', '', tankId);
                                //其他类型
                            } else {
                                $('.rcvVal').unbind('click');
                                openVal('.dlvVal', 'close', '.rcvVal', tankId);
                            }
                        } else {
                            Mom.layAlert(result.message)
                        }
                    });

                    $('input:checkbox').attr('disabled', 'disabled');
                    $('select').attr('disabled', 'disabled');
                    $('#endTime').removeAttr('disabled').removeAttr('readonly');

                    //判断日期大小
                    $("#endTime").on('change', function () {
                        if ($('#endTime').val() < $('#startTime').val() && $('#endTime').val() != '') {
                            Mom.layMsg('结束时间应大于开始时间，请重新选择');
                            $('#endTime').val('')
                        }
                    });

                }
                //编辑
                else {
                    Api.ajaxJson(Const.mtrl + '/api/mv/TankMtrlMove/view/' + editMoveId, {}, function (result) {
                        if (result.success) {
                            var nodehtml = '<input type="text" disabled id="rcvNodeName" name="rcvNode.nodename" class="form-control">';
                            var mtrlHtml = '<input type="text" disabled id="rcvMtrlName" name="rcvMtrl.mtrlName" class="form-control">';
                            var typeHtml = '<input type="text" disabled id="operationType" name="mtrlMvOprtTypeLabel" class="form-control">' +
                                '<input type="hidden" id="operationTypes" name="mtrlMvOprtType" class="form-control">';
                            $('#oppositeNode').parents('td').append(nodehtml);
                            $('#oppositeNode').remove();
                            $('#oppositeMaterial').parents('td').append(mtrlHtml);
                            $('#oppositeMaterial').remove();
                            $('#operationType').parents('td').append(typeHtml);
                            $('#operationType').remove();
                            Validator.renderData(result.NodeMtrlMove, '#inputForm');
                            var moveTypeClose = $('#operationTypes').val();
                            attrInit('table tr td');
                            if (moveTypeClose == 'TANK_TO_TANK') {
                                $('#oppositeQuantity').removeAttr('disabled');
                                openVal('.rcvVal', 'updata', '.dlvVal', tankId);
                                //其他类型
                            }


                        } else {
                            Mom.layAlert(result.message)
                        }
                    });
                    /*只有罐付罐可以编辑 并且只有对方量可以编辑 点击确定拿到对方量*/
                    $('input:checkbox').attr('disabled', 'disabled');
                    $('select').attr('disabled', 'disabled');
                    // nodeToMtrl(tankId);
                }

                //填选择器 用来获取本方量对方量
                function openVal(selector, typeVal, closeSel, tankId) {
                    $(selector).find('input:text').css('cursor', 'pointer');
                    /*本方量对方量弹窗*/
                    var tankOptions = {
                        btnArr: [
                            {
                                btn: '数据采集', fn: function (layerIdx, layero) {
                                var iframeWin = layero.find('iframe')[0].contentWindow;
                                var formData = iframeWin.getTankFormData();
                                if (formData) {
                                    var data = {
                                        cltTime: "2018-10-24 16:00:00",
                                        tagInfo: JSON.stringify([{
                                            "tagName": "FSLY.DATA.RC1AI0039",
                                            "timeStep": "3600"
                                        }])
                                    };
                                    //调用接口：生成初始化数据
                                    Api.ajaxForm(Const.pi + "/api/PiApi/tagNearLocal", data, function (result) {
                                        if (result.success) {
                                            Mom.layAlert(result.message);
                                            iframeWin.document.getElementById("chkInstVal").value = result.rows[0].val;
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
                                    //调用接口：生成初始化数据
                                    Api.ajaxJson(Const.mtrl + "/api/mv/TankChk/formula", JSON.stringify(data), function (result) {
                                        if (result.success == true) {
                                            Mom.layMsg("计算成功！");
                                            Validator.renderData(result.TankChk, '#informationEntryFrom>#inputForm');
                                            //更新选中行中的物料数据
                                        } else {
                                            Mom.layAlert(result.message);
                                        }
                                    });
                                }
                            }
                            },
                            {
                                /**--------------------*/
                                btn: '确定', fn: function (layerIdx, layero) {
                                var iframeWin = layero.find('iframe')[0].contentWindow;
                                /***在志彬的页面拿到保存的参数进行保存 拿到返回值*/
                                var tanval = iframeWin.getTankFormData(true);
                                $(selector).find('input:text').val(tanval.tankVal);
                                Api.ajaxJson(tanval.url, JSON.stringify(tanval.data), function (result) {
                                    if (result.success == true) {
                                        //此处渲染本对方前量
                                        if (typeVal == 'add') {
                                            if (selector == '.dlvVal') {
                                                $(selector).find('#dlvPreChkId').val(result.TankChk.id);
                                                $(selector).find('#dlvPreChkCont').val(result.TankChk.tankConVal);
                                            } else if (selector == '.rcvVal') {
                                                $(selector).find('#rcvPreChkId').val(result.TankChk.id);
                                                $(selector).find('#rcvPreChkCont').val(result.TankChk.tankConVal);
                                            }
                                        }
                                        //此处渲染本对方后量
                                        else if (typeVal == 'close') {
                                            if (selector == '.dlvVal') {
                                                $(selector).find('#dlvAftChkId').val(result.TankChk.id);
                                                $(selector).find('#dlvAftChkCont').val(result.TankChk.tankConVal);
                                            } else if (selector == '.rcvVal') {
                                                $(selector).find('#rcvAftChkId').val(result.TankChk.id);
                                                $(selector).find('#rcvAftChkCont').val(result.TankChk.tankConVal);
                                            }
                                        }
                                        //此处渲染本对方前量
                                        else if (typeVal == 'updata') {
                                            if (selector == '.dlvVal') {
                                                $(selector).find('#dlvPreChkId').val(result.TankChk.id);
                                                $(selector).find('#dlvPreChkCont').val(result.TankChk.tankConVal);
                                            } else if (selector == '.rcvVal') {
                                                $(selector).find('#rcvPreChkId').val(result.TankChk.id);
                                                $(selector).find('#rcvPreChkCont').val(result.TankChk.tankConVal);
                                            }
                                        }
                                        Mom.layAlert('保存成功');
                                        top.layer.close(layerIdx);
                                    } else {
                                        Mom.layAlert(result.message);
                                    }
                                });
                            }
                            }
                        ]
                    };
                    $(selector).unbind("click").on("click", function () {
                        Bus.openDialogCfg("槽/罐检尺信息录入", "../material/materialMove/informationEntryFrom.html?id=" + tankId + "&dataTime=" + moveDate+"&dataShift="+classes+"&chkType=moveType", '1128px', '692px', tankOptions);
                    });
                    $(closeSel).find('input:text').css('cursor', 'text');
                    $(closeSel).unbind("click").off("click");

                }

                // 判断input、select是否可用
                function attrInit(selector, removeAS, timeS) {
                    $(selector).each(function () {
                        $(this).find('input:text').attr('readonly', 'readonly');
                        $(this).find('select').attr('disabled', 'disabled').addClass('dis');
                        $(this).find('input:text').removeAttr('require');
                        $(this).find('select').removeAttr('require');
                        $(this).removeClass('require');
                    });
                    if (removeAS) {
                        $(removeAS).removeAttr('disabled').removeAttr('readonly').removeClass('dis');
                        $(removeAS).attr('require', 'true');
                        $(removeAS).parents('td').prev().addClass('require')

                    }
                    //时间选择插件
                    if (timeS) {
                        $(timeS).on('click', function () {
                            var startT = classes.split('-');
                            var startTime = startT[0].toString();
                            var endTime = startT[1].toString();
                            WdatePicker({
                                skin: 'whyGreen',
                                dateFmt: 'yyyy-MM-dd HH:mm:ss',
                                maxDate: moveDate + ' ' + endTime,
                                minDate: moveDate + ' ' + startTime
                            });
                        });
                    }
                }


                //第一次初始化方法
                function nodeToMtrl(id) {
                    if (potId == null && moveId == null) {
                        potId = id;
                    }
                    var dataOne = {
                        id: potId,
                        date: moveDate,
                        shift: classes
                    };
                    Api.ajaxForm(Const.mtrl + '/api/mv/TankMtrlMove/form/' + potId, dataOne, function (result) {
                        if (result.success) {
                            Bus.appendOptionsValue($('#operationType'), result.moveTypeList);
                            Validator.renderData(result.nodeMtrlMove, '#inputForm');
                            dlvNodeId = result.nodeMtrlMove.dlvNode.id;
                            dlvMtrlId = result.nodeMtrlMove.dlvMtrl.id;
                            val = $('.form-table').find('.checked');
                            var data = {
                                dlvNodeId: dlvNodeId,
                                date: moveDate,
                                shift: classes,
                                dlvMtrlId: dlvMtrlId,
                                mtrlMvOprtType: $('#operationType').val(),
                                useTopo: "1"
                            };
                            /*初始化对方节点*/
                            Api.ajaxJson(Const.mtrl + '/api/mv/TankMtrlMove/getListByType', JSON.stringify(data), function (result) {
                                if (result.success) {
                                    if (result.NodeList[0] != undefined) {
                                        $('#oppositeNode').empty();
                                        Bus.appendOptionsValue($('#oppositeNode'), result.NodeList, 'id', 'nodename');
                                        rcvMtrl('#oppositeNode', result.NodeList, '#oppositeMaterial', true);
                                    } else {
                                        $('#oppositeNode,#oppositeMaterial').val('');
                                        Mom.layMsg('对方物料无信息')
                                    }

                                } else {
                                    Mom.layAlert(result.message);
                                }
                            });
                        } else {
                            Mom.layAlert(result.message);
                        }

                    });
                }

                //分类操作
                function nodechange(isDlv) {
                    val = $('.form-table').find('.checked');
                    val.length > 0 ? valUseTopo = '0' : valUseTopo = '1';
                    var data = {
                        dlvNodeId: dlvNodeId,
                        date: moveDate,
                        shift: classes,
                        dlvMtrlId: dlvMtrlId,
                        mtrlMvOprtType: $('#operationType').val(),
                        useTopo: valUseTopo
                    };
                    /*初始化对方节点*/
                    Api.ajaxJson(Const.mtrl + '/api/mv/TankMtrlMove/getListByType', JSON.stringify(data), function (result) {
                        if (result.success) {
                            //特殊项
                            if (isDlv == true) {
                                if ($('input#ownMaterial').length > 0) {
                                    var html = '<select  id="ownMaterials" name="dlvMtrl.mtrlName" class="form-control"></select>';
                                    $('#ownMaterial').parents('td').append(html);
                                    $('#ownMaterial').remove();
                                }

                                $('#ownMaterials').empty();
                                $(result.mtrlList).each(function (i, o) {
                                    $('#ownMaterials').append('<option value="' + result.mtrlList[i].id + '">' + result.mtrlList[i].mtrlName + '</option>');
                                })

                            } else {
                                //复尺
                                if (result.NodeList == undefined && result.mtrlList == undefined) {
                                    if ($('select#ownMaterials').length > 0) {
                                        var nodehtml = '<input type="text" id="ownMaterial" name="dlvMtrl.mtrlName" class="form-control" disabled="disabled">';
                                        $('#ownMaterials').parents('td').append(nodehtml);
                                        $('#ownMaterials').remove();
                                        $('#ownMaterial').val(result.nodeMtrlMove.dlvMtrl.mtrlName);
                                    }
                                    //正常操作
                                } else if (result.NodeList[0] != undefined) {
                                    $('#oppositeNode').empty();
                                    Bus.appendOptionsValue($('#oppositeNode'), result.NodeList, 'id', 'nodename');
                                    if ($('select#ownMaterials').length > 0) {
                                        var nodehtml = '<input type="text" id="ownMaterial" name="dlvMtrl.mtrlName" class="form-control" disabled="disabled">';
                                        $('#ownMaterials').parents('td').append(nodehtml);
                                        $('#ownMaterials').remove();
                                        $('#ownMaterial').val(result.nodeMtrlMove.dlvMtrl.mtrlName);
                                    }

                                    rcvMtrl('#oppositeNode', result.NodeList, '#oppositeMaterial', true);
                                    //罐付罐
                                } else {
                                    Mom.layMsg('对方节点无数据,请于工厂模型添加数据');
                                    $('#oppositeNode,#oppositeMaterial').val('').empty();
                                }
                            }

                        } else {
                            Mom.layAlert(result.message);
                        }
                    });
                }

                //联动
                // parSel父级节点选择器 parRows父级数据列表
                // midSel中级节点选择器 midRows中级数据列表

                function rcvMtrl(parSel, parRows, midSel) {
                    //默认进来的时候
                    $(parRows).each(function (e, eitem) {
                        var id = $(parSel + ' option:selected').val();
                        if (id == eitem.id) {
                            $(midSel).empty();
                            Bus.appendOptionsValue($(midSel), parRows[e].mtrlList, 'id', 'mtrlName');
                        }
                    });
                    //变化的时候执行
                    $(parSel).on('change', function () {
                        var id = $(parSel + ' option:selected').val();
                        $(parRows).each(function (e, eitem) {
                            if (id == eitem.id) {
                                $(midSel).empty();
                                if (parRows[e].mtrlList.length > 0) {
                                    Bus.appendOptionsValue($(midSel), parRows[e].mtrlList, 'id', 'mtrlName');
                                }

                            }
                        })
                    })
                }

                //保存前所有disabled去掉
                window.removeAttr = function () {
                    $('select,input:text,input:checkbox,input:hidden').removeAttr('disabled', 'disabled')
                };
                //递交方法 参数递交状态
                window.Submit = function (substatu, moveType, layerIdx, callback) {
                    $('#date').val(moveDate);
                    $('#shift').val(classes);
                    if (!Validator.valid(document.forms[0], 1.3)) {
                        return false;
                    }
                    //后端要求不能传这两个参数
                    if (substatu == 'submit') {
                        //自定义校验
                        $('#endTime,#closeTime').remove();
                    }
                    removeAttr();
                    var formObj = $('#inputForm');
                    if (moveType == 'add') {
                        var url = Const.mtrl + '/api/mv/TankMtrlMove/save';
                    } else if (moveType == 'close' || moveType == 'updata') {
                        if (moveType == 'close') {
                            $('#closeBy').val('admin')
                        }
                        var url = Const.mtrl + '/api/mv/TankMtrlMove/update';
                    }
                    var formdata = formObj.serializeJSON();
                    Api.ajaxJson(url, JSON.stringify(formdata), function (result) {
                        if (result.success == true) {
                            Mom.layMsg('操作成功');
                            top.layer.close(layerIdx);
                            if (callback) {
                                callback()
                            }
                        } else {
                            Mom.layAlert(result.message);
                        }
                    });
                }
            },
          /************************封账********************************/
          accountInit: function(index){
              var html = '<table id="TankSeal" ></table>';
              $('#sealingAccount').find('div.jqGridTable').empty().append(html);
              function load(){
                  var  dataList = {
                      createDate:$('#shiftHidden').attr('data-time'),//日期
                      shiftDate:$('#shiftHidden').val(),//班次
                      nodeAreaId:$('#shiftHidden').attr('data-areaTankId'), // 罐区id
                      tankId:$('#shiftHidden').attr('data-nodeTankId')//罐id
                  };
                  Api.ajaxForm(Const.mtrl +"/api/mv/TankSeal/page",dataList,function (result) {
                     var  dataTable = result.rows;
                      if(result.success){
                          //$('.TankSeal-count').css('display','block');
                          $('.jqGridTable-num').text(result.count);
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
                              url: Const.mtrl+'/api/mv/TankSeal/view',
                              otherId:'tankId',
                              contentType:'form',
                          };
                          var colModel1 = [
                              {"name": "id","label": "id","align": "center","hidden":true},
                              {"name": "tankId","label": "tankId","align": "center","hidden":true},
                              {"name": "nodename","label": "槽/罐名称","align": "center","title":false,formatter:function(cellvalue, options, rowObject){
                                  return "<div>"+rowObject.node.nodename+"</div>";
                              }},
                              {"name": "submitFlag","label": "是否可提交","align": "center",formatter:function(cellvalue, options, rowObject){
                                  if(rowObject.submitFlag == 0){
                                      return "否";
                                  }else{
                                      return "是";
                                  }

                              }},
                              {"name": "mtrlName","label": "物料","align": "center",formatter:function(cellvalue, options, rowObject){
                                  return "<div>"+rowObject.node.mtrl.mtrlName+"</div>";
                              }},
                              {"name": "sealFlag","label": "提交状态","align": "center",formatter:function(cellvalue, options, rowObject){
                                  if(rowObject.sealFlag == 0){
                                      return "未提交";
                                  }else{
                                      return "已提交";
                                  }

                              }},
                              {"name": "submitBy","label": "提交人","align": "center"},
                              {"name": "freeBy","label": "解除提交人","align": "center"},
                              {"name": "submitDate","label": "提交时间","align": "center"},
                              {"name": "freeDate","label": "解除提交时间","align": "center"},
                              {"name": "paySum","label": "罐收付","align": "center",formatter:function(cellvalue, options, rowObject){
                                  return "<div>"+rowObject.collectSum+'收'+rowObject.paySum +"付</div>";
                              }}
                          ];
                          var optionsPot = {   //主表
                              colNames: ["id","tankId","槽/罐名称","是否可提交","物料","提交状态","提交人","解除提交人","提交时间","解除提交时间","罐收付"],
                              colModel: colModel1,
                              data: dataTable,
                              multiselect: true,
                              gridComplete: function () {
                                  var ids = $("#TankSeal").getDataIDs();
                                  for (var i = 0; i < ids.length; i++) {
                                      var rowData = $("#TankSeal").getRowData(ids[i]);
                                      if (rowData.sealFlag=="已提交" && rowData.submitFlag=="是") {//useable-- 单元格的name 或 index
                                          $("#TankSeal").find('#' + ids[i]).css("color",'#00CC66');
                                          //$("#TankSeal").setCell(ids[i],"enable",'已提交',{color:'green'});//setCell 设置单元格样式 值 或属性
                                      }else if(rowData.sealFlag=="已提交"&& rowData.submitFlag=="否"){
                                          $("#TankSeal").find('#' + ids[i]).css("color",'#00CC66');
                                          //$("#TankSeal").setCell(ids[i],"enable",'未提交',{color:'red'});
                                      }else if(rowData.sealFlag=="未提交"&& rowData.submitFlag=="是"){
                                          $("#TankSeal").find('#' + ids[i]).css("color",'#333333');
                                          //$("#TankSeal").setCell(ids[i],"enable",'未提交',{color:'red'});
                                      }else{
                                          $("#TankSeal").find('#' + ids[i]).css("color",'#FF0000');
                                          //$("#TankSeal").setCell(ids[i],"enable",'未提交',{color:'red'});
                                      }
                                  }
                              }
                          };
                          var subtable =[];
                          jqGridAll.jG_jqGridTableLevel('#TankSeal',optionsPot,optionsMMove,config,subtable);
                          jqGridAll.jG_Resize('#TankSeal', '.TankSeal');
                          $("#sealingAccount .jqGridTable-info").removeClass("hide");
                          $('.jqGridTable-num').eq(index).text(result.rows.length);
                          //提交按钮
                          $('#btn-save').unbind('click').click(function(){
                              var ids =jqGridAll.jG_getCheckAllIds('#TankSeal');
                              var nodeShiftSealList = [];
                              var tankIds =[];
                              if(ids.length == 0){
                                  Mom.layMsg('请勾选后在提交');
                                  return false;
                              }
                              for (var i = 0; i < ids.length; i++) {
                                  var rowData = $("#TankSeal").getRowData(ids[i]);
                                  if (rowData.submitFlag=="否" || rowData.sealFlag=="已提交") {//useable-- 单元格的name 或 index
                                      Mom.layMsg('已提交的或红色字体的不可以在提交,请重新选择');
                                      return false;
                                  }
                                  var obj ={};
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
                              Api.ajaxForm(Const.mtrl+"/api/mv/TankSeal/submitSeal",data, function (res) {
                                  if(res.success){
                                      Mom.layMsg(res.message);
                                      Api.ajaxForm(Const.mtrl +"/api/mv/TankSeal/page",dataList,function (result) {
                                          if(result.success){
                                              jqGridAll.jG_loadTable("#TankSeal",result.rows); // 刷新列表
                                              $('.jqGridTable-num').text(result.count);
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
                          $('#btn-relieve').unbind('click').click(function(){
                              var ids =jqGridAll.jG_getCheckAllIds('#TankSeal');
                              var nodeShiftSealList = [];
                              var tankIds =[];
                              if(ids.length == 0){
                                  Mom.layMsg('请勾选后在解除');
                                  return false;
                              }
                              for (var i = 0; i < ids.length; i++) {
                                  var rowData = $("#TankSeal").getRowData(ids[i]);
                                  if (rowData.sealFlag=="未提交") {//useable-- 单元格的name 或 index
                                      Mom.layMsg('未提交不可解除,请重新选择');
                                      return false;
                                  }
                                  var obj = {};
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
                              Api.ajaxForm(Const.mtrl+"/api/mv/TankSeal/relieve",data, function (res) {
                                  if(res.success){
                                      Mom.layMsg(res.message);
                                      Api.ajaxForm(Const.mtrl +"/api/mv/TankSeal/page",dataList,function (result) {
                                          if(result.success){
                                              jqGridAll.jG_loadTable("#TankSeal",result.rows);
                                              $('.jqGridTable-num').text(result.count);
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
            /* 场景图*/
          sceneGraph:function(){
                $('#sceneGraph').empty();
                var createDate = $('#shiftHidden').attr('data-time');//日期
                var shiftDate = $('#shiftHidden').val();//班次
                var tankId = $('#shiftHidden').attr('data-nodeTankId');//罐id
                if(tankId){
                    var src = Const.mtrl+"/mv/Topo/test/?id="+tankId+"&date="+createDate+"&shift="+shiftDate;
                    var html='<embed src="' +src+ '" width="1000" height="800" type="image/svg+xml" pluginspage="" />';
                    $('#sceneGraph').append(html);

                }else{
                    Mom.layMsg('选择罐区无法显示场景图，请选择罐');
                }

            }
    };
    $(function () {
        if($("#tankManage").length>0){   //初始化列表加载(列表)
            PageModule.init();
        }else if($("#initializeFrom").length>0){       //检尺初始化（弹窗）
            PageModule.initializeFrom();
        }else if($("#informationEntryFrom").length>0){   //新建检尺（弹窗）
            PageModule.createTankInit();
        }else if($("#batchMeasureForm").length>0){    //批量检尺（弹窗）
            PageModule.batchMeasureInit();
        }else if ($('#addMove').length > 0) {      //新增物料弹出页(弹窗)
            PageModule.addMoveInit();
        }
     })
    });
});