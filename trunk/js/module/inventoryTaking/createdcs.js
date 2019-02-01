/**
 * Created by admin on 2018/11/20.
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
                    dateArr.push(now)
                }
            }
            $(dateArr).each(function (i, o) {
                $('#startDate').append("<option value='" + dateArr[i] + "'>" + dateArr[i] + "</option>");
            });
        });
    },
    selectTime: function () {
        var url = Const.admin + "/api/sys/SysDict/type/STOCKTAKE_ACQUISITION_TIME";
        Api.ajaxForm(url, {}, function (result) {
            var rows = result.rows;
            Bus.appendOptionsValue($('#Interval'), rows, 'value', 'label');
        })
    },
    loadData:function () {
        var id = Mom.getUrlParam("id");
        var url = "";
        if(id){
            url = "/api/aps/collect/collectView/"+id;
        }else{
            url = "/api/stocktake/PageView/groove/PCSJSJ_DCSCGYWPC";
        }
        Api.ajaxForm(Const.aps+url,{},function (result) {
            console.log(result)
            if(result.success){
                PageModel.createTable(result.rows[0].nodes);
            }else{
                Mom.layMsg(result.message);
            }
        })
    },
    createTable:function (dataTable) {
        require(["jqGrid_my"], function (jqGridAll) {
            var html = '<table id="jqGridTable" ></table>';
            $(".jqGridTable-item").empty().append(html);
            var tableTemplate = [
                {"name": "groupCode", "label": "groupCode", "align": "center", "hidden":true},
                {"name": "delFlag", "label": "delFlag", "align": "center", "hidden":true},
                {"name": "code", "label": "code", "align": "center", "hidden":true},
                {"name": "tagName", "label": "tagName", "align": "center", "hidden":true},
                {"name": "types", "label": "types", "align": "center", "hidden":true},
                {"name": "sort", "label": "序号", "align": "center", "width":"55px"},
                {"name": "id", "label": "id", "align": "center", "hidden":true},
                {"name": "name", "label": "仓、槽、罐名称", "align": "center"},
                {"name": "techNo", "label": "工艺编号", "align": "center"},
                {"name": "specification", "label": "规格(米)", "align": "center"},
                {"name": "highUp", "label": "上空高度(米)", "align": "center", "editable": true},
                {"name": "timeStep", "label": "步长", "align": "center", "editable": true},
                {"name": "highPos", "label": "料位高度(米)", "align": "center", "editable": true},
                {"name": "highPos", "label": "料位高度(米)2018-10-12 14:30:00", "align": "center", "editable": true}
            ];
            var editRowFn = jqGridAll.jG_editRowFn("#jqGridTable",'',true);//设置可编辑，但是不可以输入汉字
            var configData = jqGridAll.jG_configData(dataTable);  //创建table的数据
            var len = dataTable.length;
            var gridConfig = jqGridAll.jG_config('',[],tableTemplate,len);
            $("#jqGridTable").jqGrid($.extend(configData, gridConfig,editRowFn));
        });
        //保存
        $(".btn-save").unbind("click").on("click",function () {
            PageModel.clickHandler();
        });
        //数据采集
        $("#dataCollection-btn").unbind("click").on("click",function () {
            if($("#Interval option:selected").val() == ""){
                Mom.layMsg("请选择时间段");
            }else{
                PageModel.dataCollection();
            }
        });
    },
    clickHandler:function () {
        require(["jqGrid_my"], function (jqGridAll) {
            var arrfjc = "";
            arrfjc = $("#jqGridTable").jqGrid('getRowData');
            if($(".supervisionplate ").val()==""){
                Mom.layMsg("请填写监盘人员");
            }else if($("#startDate option:selected").val() == ""){
                Mom.layMsg("请选择盘存日期");
            }else if($("#otherPlate").val() == ""){
                Mom.layMsg("请填写参与盘存人员");
            }else {
                var data = {
                    id:$("#id").val(),
                    fstMan: Mom.getCookie("userName"),
                    secMan:$(".supervisionplate").val(),
                    stocktakeDate:$("#startDate option:selected").val(),
                    stocktakeType:"DCSCGYW",
                    groovesData:JSON.stringify(arrfjc),
                    status:$("#status").val()
                };
                Api.ajaxForm(Const.aps+"/api/aps/CollectGroove/save",data,function (result) {
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

        })
    },
    dataCollection:function () {
        var arrAll = '';
        require(["jqGrid_my"],function (jqGridAll) {
            arrAll = $("#jqGridTable").jqGrid('getRowData');
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
            // "http://114.115.165.184:8082/pi-api"
            // Const.pi+"/api/PiApi/tagNearLocal"
            Api.ajaxForm("http://114.115.165.184:8082/pi-api/api/PiApi/tagNearLocal",data,function (result) {
                if(result.success){
                    for(var i=0;i<result.rows.length;i++){
                        arrAll[i].timeStep = result.rows[i].timeStep;
                        arrAll[i].highPos = result.rows[i].val;
                    }
                    Mom.layMsg("采集成功");
                    PageModel.createTable(arrAll);
                }else{
                    Mom.layMsg(result.message);
                }
            });
        })
    }

}
$(function () {
    if($("#createdcs").length>0){
        PageModel.init();
    }
})
})