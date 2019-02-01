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
            url = "/api/stocktake/PageView/ao";
        }
        Api.ajaxForm(Const.aps+url,{},function (result) {
            if(result.success){
                PageModel.createTable(result.rows);
            }else {
                Mom.layAlert(result.message);
            }
        })
    },
    createTable:function (dataTable) {
        require(["jqGrid_my"], function (jqGridAll) {
            //动态创建table
            for (var i = 0; i < dataTable.length; i++) {
                var tableHtml = "<table class='datatable' id='jqGridTable"+i+"'></table>";
                $(".jqGridTable-item").eq(i).append(tableHtml);
            }
            //渲染表格
            var tableTemplatr = [
                [
                    {"name": "subName", "label": "subName", "align": "center", "hidden":true},
                    {"name": "delFlag", "label": "delFlag", "align": "center", "hidden":true},
                    {"name": "code", "label": "code", "align": "center", "hidden":true},
                    {"name": "groupCode", "label": "groupCode", "align": "center", "hidden":true},
                    {"name": "id", "label": "id", "align": "center", "hidden":true},
                    // {"name": "sort", "label": "序号", "align": "center", "width":"55px"},
                    {"name": "name", "label": "名称", "align": "center"},
                    {"name": "techNo", "label": "工艺编号", "align": "center"},
                    {"name": "specification", "label": "规格(米)", "align": "center"},
                    {"name": "upOne", "label": "上空高度1(米)", "align": "center", "editable": true},
                    {"name": "upTwo", "label": "上空高度2(米)", "align": "center", "editable": true},
                    {"name": "upThree", "label": "上空高度3(米)", "align": "center", "editable": true},
                    {"name": "upFour", "label": "上空高度4(米)", "align": "center", "editable": true},
                    {"name": "upFive", "label": "上空高度5(米)", "align": "center", "editable": true},
                    {"name": "upSix", "label": "上空高度6(米)", "align": "center", "editable": true}
                ],
                [
                    {"name": "subName", "label": "subName", "align": "center", "hidden":true},
                    {"name": "delFlag", "label": "delFlag", "align": "center", "hidden":true},
                    {"name": "code", "label": "code", "align": "center", "hidden":true},
                    {"name": "groupCode", "label": "groupCode", "align": "center", "hidden":true},
                    {"name": "id", "label": "id", "align": "center", "hidden":true},
                    // {"name": "sort", "label": "序号", "align": "center", "width":"55px"},
                    {"name": "name", "label": "名称", "align": "center"},
                    {"name": "techNo", "label": "工艺编号", "align": "center"},
                    {"name": "specification", "label": "规格(米)", "align": "center"},
                    {"name": "lengths", "label": "长", "align": "center", "editable": true},
                    {"name": "widths", "label": "宽", "align": "center", "editable": true},
                    {"name": "high", "label": "高", "align": "center", "editable": true},
                    {"name": "weight", "label": "重量(T)", "align": "center", "editable": true}
                ],
                [
                    {"name": "subName", "label": "subName", "align": "center", "hidden":true},
                    {"name": "delFlag", "label": "delFlag", "align": "center", "hidden":true},
                    {"name": "code", "label": "code", "align": "center", "hidden":true},
                    {"name": "groupCode", "label": "groupCode", "align": "center", "hidden":true},
                    {"name": "id", "label": "id", "align": "center", "hidden":true},
                    // {"name": "sort", "label": "序号", "align": "center", "width":"55px"},
                    {"name": "subName", "label": "名称", "align": "center"},
                    {"name": "specification", "label": "规格", "align": "center"},
                    {"name": "weightUnit", "label": "单位重量(t)", "align": "center"},
                    {"name": "warehoueIn", "label": "入库(t)", "align": "center", "editable": true},
                    {"name": "warehoueOut", "label": "出库(t)", "align": "center", "editable": true},
                    {"name": "warehoueBeing", "label": "库存(t)", "align": "center", "editable": true},
                    {"name": "remark", "label": "备注", "align": "center", "editable": true}
                ]
            ];
            for(var j=0;j<dataTable.length;j++){
                var editRowFn = jqGridAll.jG_editRowFn("#jqGridTable"+j,'',true);//设置可编辑，但是不可以输入汉字
                var configData = jqGridAll.jG_configData(dataTable[j].nodes);  //创建table的数据
                var len = dataTable[j].nodes.length;
                var gridConfig = jqGridAll.jG_config('',[],tableTemplatr[j],len);
                $("#jqGridTable" + j).jqGrid($.extend(configData, gridConfig,editRowFn));
            }
            $(".btn-save").unbind("click").on("click",function () {
                $('td.edit-cell').each(function (i, item) {
                    $(this).siblings('td').siblings('td').eq(0).trigger('click');
                });
                $('input[type=text].editable').each(function (i, item) {
                    $(this).parents('td').text($(this).val());
                    $(this).remove();
                });
                var ids = [];
                $(".datatable").each(function (index,item) {
                    ids.push($(item).attr("id"));
                });
                PageModel.clickHandler(ids);
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
                for(var k=0;k<dataArr.length;k++){
                    dataArr[k].name = dataArr[k].subName;
                }
                var data = {
                    id:$("#id").val(),
                    fstMan: Mom.getCookie("userName"),
                    secMan:$(".supervisionplate").val(),
                    stocktakeDate:$("#startDate option:selected").val(),
                    stocktakeType:"YHLCQYHLDZ",
                    aoData:JSON.stringify(dataArr),
                    status:$("#status").val()
                };
                Api.ajaxForm( Const.aps+"/api/aps/Ao/save",data,function (result) {
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
        })
    }
    }

$(function () {
    if($("#createNaoHAL").length>0){
        PageModel.init();
    }
})
});