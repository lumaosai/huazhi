/**
 * Created by admin on 2018/11/20.  矿石石灰
 */
require([cdnDomain+'/js/zlib/app.js'], function (App) {
    var PageModel = {
        init:function () {
            $(".maindiskUser").val(Mom.getCookie("userName"));   //显示主盘人
            PageModel.inventoryDate();//盘存下拉
            //返回按钮
            $("#back-btn").click(function () {
                location.href = "./invDataCollection.html";
            });
            var data = Mom.shortDate;
            $(".time").text(data);
            PageModel.loadData();//加载数据
            PageModel.selectTime();
        },
        inventoryDate:function () {
            var url = Const.admin + "/api/sys/SysDict/type/STOCKTAKE_DATE";
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
                        dateArr.push(now);
                    }
                }
                $(dateArr).each(function (i, o) {
                    $('#startDate').append("<option value='" + dateArr[i] + "'>" + dateArr[i] + "</option>");
                });
            });
        },
        loadData:function () {
            var id = Mom.getUrlParam("id");
            var status = Mom.getUrlParam("status");
            $("#id").val(id);
            $("#status").val(status);
            var url = "";
            if(id){     //查看或者修改
                url = "/api/aps/collect/collectView/"+id;
            }else{
                url = "/api/stocktake/PageView/mineral";
            }
            Api.ajaxForm(Const.aps+url,{},function (result) {
                if(result.success){
                    PageModel.createTable(result.rows);
                }else{
                    Mom.layMsg(result.message);
                }
            })
        },
        createTab:function (tabList) {
            for(var i=0;i<tabList.length;i++){
                var li = $("<li type='"+tabList[i].code+"'>"+tabList[i].name+"</li>");
                $(".tab-nav ").append(li);
            }
            $(".tab-nav li").each(function (index,item) {
                $(item).unbind("click").on("click",function () {
                    $(this).addClass("active").siblings("li").removeClass("active");      //当前选中tab添加calss
                    $(".jqGridTable-item").eq(index).removeClass("hide").siblings(".jqGridTable-item").addClass("hide");  //设置table显示隐藏
                    $('.tab-btns li').eq(index).addClass('active').siblings().removeClass('active'); //tab后边的操作按钮显示隐藏
                });
                if(index==0){
                    $(item).addClass("active");
                    $(".jqGridTable-item").eq(index).removeClass("hide").siblings(".jqGridTable-item").addClass("hide");
                    $('.tab-btns li').eq(index).addClass('active').siblings().removeClass('active'); //tab后边的操作按钮显示隐藏
                }
            });
        },
        createTable:function (dataTable,index) {
            //遗留问题：默认每个表格创建一遍不然直接点击矿堆保存的时候后两个表格数据拿不到，保存的时候三个表一块发送
            require(["jqGrid_my"], function (jqGridAll) {
                for (var i = 0; i < dataTable.length; i++) {
                    var tableHtml = "<table class='datatable' id='jqGridTable"+i+"'></table>";
                    $(".jqGridTable-item").eq(i).append(tableHtml);
                }
                var tableTemplatr = [
                    [
                        {"name":"id","label": "id","align":"center","hidden":true},
                        {"name":"groupCode","label":"groupCode","align":"center","hidden":true},
                        {"name":"delFlag","label":"delFlag","align":"center","hidden":true},
                        {"name":"code","label":"code","align":"center","hidden": true},
                        {"name":"name","label":"名称","align":"center",
                            cellattr: function (rowId, tv, rawObject, cm, rdata) {
                                //合并单元格
                                return 'id=\'name' + rowId + "\'";
                            }
                        },
                        {"name":"subName","label": "子项", "align": "center"},
                        {"name": "specification", "label": "规格(米)", "align": "center"},
                        {"name": "lengths", "label": "长(米)", "align": "center", "editable": true},
                        {"name": "widths", "label": "宽(米)", "align": "center", "editable": true},
                        {"name": "high", "label": "高(米)", "align": "center", "editable": true},
                        {"name": "weight", "label": "重量(T)", "align": "center", "editable": true, "sorttype": "text", "formatter": "text", "summaryType": "sum"}
                    ],
                    [
                        {"name": "name", "label": "name", "align": "center", "hidden": true},
                        {"name": "delFlag", "label": "delFlag", "align": "center", "hidden": true},
                        {"name": "code", "label": "code", "align": "center", "hidden": true},
                        {"name": "groupCode", "label": "groupCode", "align": "center", "hidden": true},
                        {"name": "id", "label": "id", "align": "center", "hidden": true},
                        // {"name": "sort", "label": "序号", "align": "center", "width": "55px"},
                        {"name": "subName", "label": "名称", "align": "center"},
                        {"name": "valueView", "label": "定量给料机显示", "align": "center", "editable": true},
                        {"name": "valueModify", "label": "修正值", "align": "center", "editable": true},
                        {"name": "valueReport", "label": "外报", "align": "center", "editable": true}
                    ],
                    [
                        {"name": "name", "label": "name", "align": "center", "hidden": true},
                        {"name": "delFlag", "label": "delFlag", "align": "center", "hidden": true},
                        {"name": "code", "label": "code", "align": "center", "hidden": true},
                        {"name": "tagName", "label": "tagName", "align": "center", "hidden": true},
                        {"name": "groupCode", "label": "groupCode", "align": "center", "hidden": true},
                        {"name": "id", "label": "id", "align": "center", "hidden": true},
                        // {"name": "sort", "label": "序号", "align": "center", "width": "55px"},
                        {"name": "subName", "label": "名称", "align": "center"},
                        {"name": "techNo", "label": "工艺编号", "align": "center"},
                        {"name": "specification", "label": "规格(米)", "align": "center"},
                        {"name": "upHighHand", "label": "手抄", "align": "center", "editable": true},
                        {"name": "timeStep", "label": "步长", "align": "center", "editable": true},
                        {"name": "upHighDcs", "label": "DCS", "align": "center", "editable": true},
                        {"name": "highPos", "label": "料位高度(米)", "align": "center", "editable": true}
                    ]
                ];
                if(index){
                    var html = '<table id="jqGridTable2" ></table>';
                    $(".jqGridTable-item").eq(index).empty().append(html);
                    var gridComplete = jqGridAll.jG_gridComplete("jqGridTable2", "name");  //单元格合并
                    var editRowFn = jqGridAll.jG_editRowFn("#jqGridTable2",'',true);//设置可编辑，但是不可以输入汉字
                    var configData = jqGridAll.jG_configData(dataTable);  //创建table的数据
                    var len = dataTable.length;
                    var gridConfig = jqGridAll.jG_config('',[],tableTemplatr[index],len);
                    $("#jqGridTable2").jqGrid($.extend(configData, gridConfig,editRowFn,gridComplete));
                }else{
                    for(var j=0;j<dataTable.length;j++){
                        var gridComplete = jqGridAll.jG_gridComplete("jqGridTable0", "name");  //单元格合并
                        var editRowFn = jqGridAll.jG_editRowFn("#jqGridTable"+j,'',true);//设置可编辑，但是不可以输入汉字
                        var configData = jqGridAll.jG_configData(dataTable[j].nodes);  //创建table的数据
                        var len = dataTable[j].nodes.length;
                        var gridConfig = jqGridAll.jG_config('',[],tableTemplatr[j],len);
                        $("#jqGridTable" + j).jqGrid($.extend(configData, gridConfig,editRowFn,gridComplete));
                    };
                    PageModel.createTab(dataTable);
                }
                //保存按钮
                $(".btn-save").unbind("click").on("click",function () {
                    $('td.edit-cell').each(function (i, item) {
                        $(this).siblings('td').siblings('td').eq(0).trigger('click');
                    });
                    $('input[type=text].editable').each(function (i, item) {
                        $(this).parents('td').text($(this).val());
                        $(this).remove()
                    });
                    var ids = [];
                    $("#jgTables table").each(function (index,item) {
                        ids.push($(item).attr("id"));
                    })
                    PageModel.clickHandler(ids);
                });
                //数据采集按钮
                $("#dataCollection-btn").unbind("click").on("click",function () {
                    if($("#Interval option:selected").val() == ""){
                        Mom.layMsg("请选择时间段");
                    }else{
                        PageModel.dataCollection();
                    }
                });
            })
        },
        clickHandler:function (ids) {
            require(["jqGrid_my"],function (jqGridAll) {
                var contentArr = [];
                var arrfjc = '';
                for (var i = 0; i < ids.length; i++) {
                    arrfjc = $('#' + ids[i]).jqGrid('getRowData');
                    contentArr.push(arrfjc);
                }
                if($(".supervisionplate ").val()==""){
                    Mom.layMsg("请填写监盘人员");
                }else if($("#startDate option:selected").val() == ""){
                    Mom.layMsg("请选择盘存日期");
                }else if($("#otherPlate").val() == ""){
                    Mom.layMsg("请填写参与盘存人员");
                }else {
                    var dataArr = [];
                    for(var i=0;i<contentArr.length;i++){
                        for(var j=0;j<contentArr[i].length;j++){
                            dataArr.push(contentArr[i][j]);
                        }
                    }
                    var data = {
                        id:$("#id").val(),
                        fstMan: Mom.getCookie("userName"),
                        secMan:$(".supervisionplate").val(),
                        stocktakeDate:$("#startDate option:selected").val(),
                        stocktakeType:"KSSHCC",
                        mineralData:JSON.stringify(dataArr),
                        status:$("#status").val()
                    };
                    Api.ajaxForm( Const.aps+"/api/aps/Mineral/save",data,function (result) {
                        if(result.success){
                            top.layer.msg('操作成功，即将返回盘存收集列表页！', {
                                icon: 1,
                                time: 800
                            });
                            setTimeout(function () {
                                Mom.winBack();
                            }, 1000)
                        }else{
                            Mom.layAlert(result.message);
                        }
                    })
                }
            });
        },
        selectTime: function () {
            var url = Const.admin + "/api/sys/SysDict/type/STOCKTAKE_ACQUISITION_TIME";
            Api.ajaxForm(url, {}, function (result) {
                var rows = result.rows;
                Bus.appendOptionsValue($('#Interval'), rows, 'value', 'label');
            })
        },
        dataCollection:function () {
            var arrAll = '';
            require(["jqGrid_my"],function (jqGridAll) {
                arrAll = $("#jqGridTable2").jqGrid('getRowData');
                var saveObj = { rows: arrAll};
                var collArr = [];
                for(var i=0;i<saveObj.rows.length;i++){
                    var collObj = {};
                    collObj.tagName = saveObj.rows[i].tagName;
                    collObj.timeStep = saveObj.rows[i].timeStep;
                    collArr.push(collObj);
                };
                var data = {
                    cltTime:$(".time").text()+"-"+$("#Interval option:selected").val(),
                    tagInfo:JSON.stringify(collArr)
                };
                Api.ajaxForm(Const.pi+"/api/PiApi/tagNearLocal",data,function (result) {
                    if(result.success){
                        for(var i=0;i<result.rows.length;i++){
                            arrAll[i].timeStep = result.rows[i].timeStep;
                            arrAll[i].highPos = result.rows[i].val;
                        }
                        Mom.layMsg("采集成功");
                        PageModel.createTable(arrAll,2);
                    }else{
                        Mom.layMsg(result.message);
                    }
                });
            })
        }
    }
$(function () {
    if($("#createMineral").length>0){
        PageModel.init();
    }
})
});