/**
 * Created by admin on 2018/11/20.
 */
require([cdnDomain+'/js/zlib/app.js'], function (App) {
var PageModel = {
    init:function () {
        PageModel.loadShift();//班次数据
        PageModel.loadGroups();//加载班组数据
        $(".maindiskUser").val(Mom.getCookie("userName"));   //显示主盘人
        PageModel.inventoryDate();//盘存下拉
        //返回按钮
        $("#back-btn").click(function () {
            location.href = "./invDataCollection.html";
        });
        PageModel.loadData();//加载数据
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
        var url = "";
        if(id){
            url="/api/aps/collect/collectView/"+id;
        }else{
            url="/api/stocktake/PageView/coal";
        }
        Api.ajaxForm(Const.aps+url,{},function (result) {
            PageModel.createTable(result.rows[0].nodes);
        });
    },
    createTable:function (dataTable) {
        require(["jqGrid_my"], function (jqGridAll) {
            var tableTemplate = [
                {"name": "delFlag", "label": "delFlag", "align": "center", "hidden": true},
                {"name": "id", "label": "id", "align": "center", "hidden": true},
                {"name": "code", "label": "code", "align": "center", "hidden": true},
                {"name": "name", "label": "名称", "align": "center",
                    cellattr: function (rowId, tv, rawObject, cm, rdata) {
                        //合并单元格
                        return 'id=\'name' + rowId + "\'";
                    }
                },
                {"name": "subName", "label": "子项", "align": "center"},
                {"name": "proInfo", "label": "过程说明", "align": "center", "editable": true},
                {"name": "weight", "label": "重量(T)", "align": "center", "editable": true}
            ];
            var gridComplete = jqGridAll.jG_gridComplete("jqGridTable", "name");  //单元格合并
            var editRowFn = jqGridAll.jG_editRowFn("#jqGridTable", '', true);//设置可编辑，但是不可以输入汉字
            var configData = jqGridAll.jG_configData(dataTable);  //创建table的数据
            var len = dataTable.length;
            var gridConfig = jqGridAll.jG_config('', [], tableTemplate, len);
            $("#jqGridTable").jqGrid($.extend(configData, gridConfig, editRowFn,gridComplete));
        });
        $(".btn-save").unbind("click").on("click",function () {
            PageModel.clickHandler();
        })
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
                    stocktakeType:"MC",
                    coalsData:JSON.stringify(arrfjc),
                    duty:$("#classes option:selected").val(),
                    dutyGroup:$("#teamGroup option:selected").val(),
                    status:$("#status").val()
                };
                Api.ajaxForm(Const.aps+"/api/aps/collectCoal/save",data,function (result) {
                    if(result.success){
                        top.layer.msg('操作成功，即将返回盘存收集列表页！', {
                            icon: 1,
                            time: 800
                        });
                        setTimeout(function () {
                            Mom.winBack();
                        }, 1000);
                    }else{
                        Mom.layAlert(result.message);
                    }
                })
            }

        });
    },
    loadShift:function () {
        var url_ =Const.aps+'/api/ctrl/Shift/list';
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
    loadGroups:function () {
        Bus.createSelect(Const.aps+'/api/aps/Groups/list',$('#teamGroup'), 'id', 'name');
    },
}

$(function () {
    if($("#createDeposit").length>0){
        PageModel.init();
    }
})
});