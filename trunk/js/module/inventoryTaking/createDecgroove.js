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
            url = "/api/aps/collect/collectView/"+id;
        }else{
            url = "/api/stocktake/PageView/groove/PCSJSJ_FJCYWCLPC";
        }
        Api.ajaxForm(Const.aps+url,{},function (result) {
            if(result.success){
                PageModel.createTbale(result.rows[0].nodes);
            }else{
                Mom.layMsg(result.message);
            }
        })
    },
    createTbale:function (dataTable) {
        require(["jqGrid_my"], function (jqGridAll) {
            var tableTemplate = [
            {"name": "groupCode", "label": "groupCode", "align": "center", "hidden":true},
            {"name": "delFlag", "label": "delFlag", "align": "center", "hidden":true},
            {"name": "code", "label": "code", "align": "center", "hidden":true},
            {"name": "types", "label": "types", "align": "center", "hidden":true},
            {"name": "id", "label": "id", "align": "center", "hidden":true},
            // {"name": "sort", "label": "序号", "align": "center", "width":"55px"},
            {"name": "name", "label": "仓、槽、罐名称", "align": "center"},
            {"name": "techNo", "label": "工艺编号", "align": "center"},
            {"name": "specification", "label": "规格(米)", "align": "center"},
            {"name": "highUp", "label": "上空高度(米)", "align": "center", "editable": true},
            {"name": "highPos", "label": "料位高度(米)", "align": "center", "editable": true}
        ];
            var editRowFn = jqGridAll.jG_editRowFn("#jqGridTable",'',true);//设置可编辑，但是不可以输入汉字
            var configData = jqGridAll.jG_configData(dataTable);  //创建table的数据
            var len = dataTable.length;
            var gridConfig = jqGridAll.jG_config('',[],tableTemplate,len);
            $("#jqGridTable").jqGrid($.extend(configData, gridConfig,editRowFn));
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
                    stocktakeType:"FJCYWCL",
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

        });
        }
}
$(function () {
    if($("#createDecgroove").length){
        PageModel.init();
    }
})
});